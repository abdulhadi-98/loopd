require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const authRoutes = require('./routes/auth');
const enrollRoutes = require('./routes/enroll');
const walletRoutes = require('./routes/wallet');
const scanRoutes = require('./routes/scan');
const pushRoutes = require('./routes/push');
const campaignRoutes = require('./routes/campaign');
const dashboardRoutes = require('./routes/dashboard');
const superadminRoutes = require('./routes/superadmin');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

app.set('io', io);

app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 200 });
app.use('/api/', limiter);

app.use('/api/auth', authRoutes);
app.use('/api/enroll', enrollRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/scan', scanRoutes);
app.use('/api/push', pushRoutes);
app.use('/api/campaign', campaignRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/superadmin', superadminRoutes);

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});

mongoose
  .connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('MongoDB connected');
    await seedDefaultPlans();
    startChangeStreams(io);
    server.listen(process.env.PORT || 3001, () =>
      console.log(`Server running on port ${process.env.PORT || 3001}`)
    );
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

async function seedDefaultPlans() {
  const Plan = require('./models/Plan');
  const count = await Plan.countDocuments();
  if (count > 0) return;

  await Plan.insertMany([
    {
      name: 'Starter',
      price_monthly: 4999,
      max_customers: 500,
      max_staff: 3,
      features: { apple_wallet: false, google_wallet: false, campaigns: false, analytics: true, custom_branding: false },
    },
    {
      name: 'Growth',
      price_monthly: 12999,
      max_customers: 3000,
      max_staff: 10,
      features: { apple_wallet: true, google_wallet: true, campaigns: true, analytics: true, custom_branding: false },
    },
    {
      name: 'Pro',
      price_monthly: 29999,
      max_customers: 999999,
      max_staff: 999,
      features: { apple_wallet: true, google_wallet: true, campaigns: true, analytics: true, custom_branding: true },
    },
  ]);
  console.log('Default plans seeded');
}

function startChangeStreams(io) {
  const Transaction = require('./models/Transaction');
  const LoyaltyCard = require('./models/LoyaltyCard');

  Transaction.watch().on('change', (change) => {
    if (change.operationType === 'insert') {
      io.emit('transaction:new', change.fullDocument);
    }
  });

  LoyaltyCard.watch().on('change', (change) => {
    if (['insert', 'update'].includes(change.operationType)) {
      io.emit('card:update', change.fullDocument || change.documentKey);
    }
  });
}
