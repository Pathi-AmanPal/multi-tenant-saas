function validateTenantAccess(req, res, next) {
  if (!req.user || !req.tenant) {
    return res.status(500).json({
      success: false,
      message: "Tenant validation failed",
    });
  }

  if (req.user.tenantId !== req.tenant.id) {
    return res.status(403).json({
      success: false,
      message: "Cross-tenant access denied",
    });
  }

  next();
}

module.exports = validateTenantAccess;
