const pool = require('../config/db');

async function createUser(tenantId, name, email, password, role = 'USER') {
  const result = await pool.query(
    `INSERT INTO users (tenant_id, name, email, password, role)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, tenant_id, name, email, role, created_at`,
    [tenantId, name, email, password, role]
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

async function findByEmailAndTenant(tenantId, email) {
  const result = await pool.query(
    `SELECT * FROM users
     WHERE tenant_id = $1 AND email = $2`,
    [tenantId, email]
  );

  return result.rows[0];
}

module.exports = {
  createUser,
  getUsersByTenant,
  findByEmailAndTenant
};
