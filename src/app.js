const requestLogger = require("./middleware/requestLogger.middleware");
const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();

// 🔐 Global Rate limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    success: false,
    message: "Too many requests. Try again later."
  }
});

// 🔥 Auth-specific limiter (STRICT)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: {
    success: false,
    message: "Too many login attempts. Try again later."
  }
});

// Middleware
app.use(requestLogger);
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
const validateTenantAccess = require('./middleware/tenantAccess.middleware'); // ✅ NEW
const userRoutes = require('./routes/user.routes');
const authRoutes = require('./routes/auth.routes');

// Public routes
app.use('/api/tenants', tenantRoutes);

// 🔥 Apply auth limiter + tenant resolver
if (process.env.NODE_ENV === "test") {
  app.use('/api/auth', tenantResolver, authRoutes);
} else {
  app.use('/api/auth', authLimiter, tenantResolver, authRoutes);
}

// 🔥 CRITICAL SECURITY FIX (tenant validation added)
app.use(
  '/api/users',
  tenantResolver,
  authMiddleware,
  validateTenantAccess, // 🚨 prevents cross-tenant attack
  userRoutes
);

// 404
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// Error handler
const errorHandler = require('./middleware/error.middleware');
app.use(errorHandler);

module.exports = app;