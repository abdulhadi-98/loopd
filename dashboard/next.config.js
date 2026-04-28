const withPWA = require('@ducanh2912/next-pwa').default({
  dest: 'public',
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [{ source: '/api/:path*', destination: 'http://localhost:3001/api/:path*' }];
  },
};

module.exports = withPWA(nextConfig);
