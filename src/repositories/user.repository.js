const pool = require('../config/db');

async function createUser(tenantId, name, email, role = 'USER') {
  const result = await pool.query(
    `INSERT INTO users (tenant_id, name, email, role)
     VALUES ($1, $2, $3, $4)
     RETURNING id, tenant_id, name, email, role, created_at`,
    [tenantId, name, email, role]
  );

  return result.rows[0];
}

async function getUsersByTenant(tenantId) {
  const result = await pool.query(
    `SELECT id, tenant_id, name, email, role, created_at
     FROM users
     WHERE tenant_id = $1
     ORDER BY id ASC`,
    [tenantId]
  );

  return result.rows;
}

module.exports = {
  createUser,
  getUsersByTenant
};
