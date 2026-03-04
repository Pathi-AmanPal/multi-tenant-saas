const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const app = express();

// Rate limiter configuration
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: {
    success: false,
    message: "Too many requests. Try again later."
  }
});

// Middleware
app.use(express.json());
app.use(helmet());
app.use(limiter);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is healthy',
  });
});

// Routes
const tenantRoutes = require('./routes/tenant.routes');
const tenantResolver = require('./middleware/tenant.middleware');
const authMiddleware = require('./middleware/auth.middleware');
const userRoutes = require('./routes/user.routes');
const authRoutes = require('./routes/auth.routes');

// Public routes
app.use('/api/tenants', tenantRoutes);

// Login still requires tenant header
app.use('/api/auth', tenantResolver, authRoutes);

// Protected routes now require JWT
app.use('/api/users', authMiddleware, userRoutes);

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
