const express = require('express');

const app = express();

// Middleware
app.use(express.json());

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is healthy',
  });
});

const tenantRoutes = require('./routes/tenant.routes');

app.use('/api', tenantRoutes);

const errorHandler = require('./middleware/error.middleware');

// 404 handler
app.use((req, res, next) => {
  const error = new Error('Route not found');
  error.statusCode = 404;
  next(error);
});

// Global error handler
app.use(errorHandler);

module.exports = app;
