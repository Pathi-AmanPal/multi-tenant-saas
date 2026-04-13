const express = require("express");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const requestLogger = require("./middleware/requestLogger.middleware");
const tenantResolver = require("./middleware/tenant.middleware");
const authMiddleware = require("./middleware/auth.middleware");
const validateTenantAccess = require("./middleware/tenantAccess.middleware");
const errorHandler = require("./middleware/error.middleware");

const tenantRoutes = require("./routes/tenant.routes");
const userRoutes = require("./routes/user.routes");
const authRoutes = require("./routes/auth.routes");

const app = express();

// 🔐 Global Rate Limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    success: false,
    message: "Too many requests. Try again later.",
  },
});

// 🔥 Auth-specific limiter (STRICT)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: {
    success: false,
    message: "Too many login attempts. Try again later.",
  },
});

// ======================
// MIDDLEWARE
// ======================
app.use(requestLogger);
app.use(express.json());
app.use(helmet());
app.use(limiter);

// ======================
// HEALTH CHECK
// ======================
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is healthy",
  });
});

// ======================
// ROUTES
// ======================

// Public tenant routes
app.use("/api/tenants", tenantRoutes);

// 🔐 Auth routes (tenant-aware + rate limited)
if (process.env.NODE_ENV === "test") {
  app.use("/api/auth", tenantResolver, authRoutes);
} else {
  app.use("/api/auth", authLimiter, tenantResolver, authRoutes);
}

// 🔥 Protected routes (CRITICAL SECURITY CHAIN)
app.use(
  "/api/users",
  tenantResolver,
  authMiddleware,
  validateTenantAccess, // 🚨 prevents cross-tenant access
  userRoutes
);

// ======================
// 404 HANDLER
// ======================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// ======================
// ERROR HANDLER (LAST)
// ======================
app.use(errorHandler);

module.exports = app;