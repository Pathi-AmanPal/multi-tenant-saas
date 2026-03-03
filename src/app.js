const express = require('express');
const app = express();

// Middleware
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is healthy',
  });
});

// Routes
const tenantRoutes = require('./routes/tenant.routes');
const protectedRoutes = require('./routes/protected.routes');
const tenantResolver = require('./middleware/tenant.middleware');
const userRoutes = require('./routes/user.routes');

// Public routes
app.use('/api/tenants', tenantRoutes);

// Protected routes
app.use('/api', tenantResolver, protectedRoutes);

// Protected user routes
app.use('/api/users', tenantResolver, userRoutes);

// 404 handler (MUST come after routes)
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// Error handler (last)
const errorHandler = require('./middleware/error.middleware');
app.use(errorHandler);

module.exports = app;
