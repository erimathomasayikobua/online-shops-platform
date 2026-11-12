'use strict';

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const env = require('./config/env');
const { getDatabaseStatus } = require('./config/database');
const asyncHandler = require('./utils/asyncHandler');
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');

const authRoutes = require('./routes/authRoutes');
const kycRoutes = require('./routes/kycRoutes');
const catalogRoutes = require('./routes/catalogRoutes');
const shopRoutes = require('./routes/shopRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const merchantRoutes = require('./routes/merchantRoutes');
const adminRoutes = require('./routes/adminRoutes');
const customerCareRoutes = require('./routes/customerCareRoutes');

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: env.isProduction ? env.cors.productionOrigins : env.cors.developmentOrigins,
    credentials: true,
  })
);
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 500 }));
app.use(express.json());

app.get(
  '/api/health',
  asyncHandler(async (req, res) => {
    res.json({
      status: 'OK',
      service: 'online-shops-platform',
      database: await getDatabaseStatus(),
      timestamp: new Date().toISOString(),
    });
  })
);

app.use('/api/auth', authRoutes);
app.use('/api/kyc', kycRoutes);
app.use('/api', catalogRoutes);
app.use('/api/shops', shopRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/merchant', merchantRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/customer-care', customerCareRoutes);

app.use('/api', notFoundHandler);
app.use(errorHandler);

module.exports = app;
