const pool = require('../config/db');
const { validate: isUUID } = require('uuid');

const tenantResolver = async (req, res, next) => {
  try {
    const tenantUUID = req.headers['x-tenant-id'];

    if (!tenantUUID) {
      return res.status(400).json({
        success: false,
        message: 'Tenant ID header missing'
      });
    }

    if (!isUUID(tenantUUID)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Tenant UUID format'
      });
    }

    const result = await pool.query(
      'SELECT id, uuid, name, status FROM tenants WHERE uuid = $1',
      [tenantUUID]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Tenant not found'
      });
    }

    const tenant = result.rows[0];

    if (tenant.status !== 'ACTIVE') {
      return res.status(403).json({
        success: false,
        message: `Tenant is ${tenant.status}`
      });
    }

    req.tenant = tenant;

    next();

  } catch (error) {
    next(error);
  }
};

module.exports = tenantResolver;
