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

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

app.set('io', io);

app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });
app.use('/api/', limiter);

app.use('/api/auth', authRoutes);
app.use('/api/enroll', enrollRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/scan', scanRoutes);
app.use('/api/push', pushRoutes);
app.use('/api/campaign', campaignRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('MongoDB connected');
    startChangeStreams(io);
    server.listen(process.env.PORT || 3001, () =>
      console.log(`Server running on port ${process.env.PORT || 3001}`)
    );
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

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
