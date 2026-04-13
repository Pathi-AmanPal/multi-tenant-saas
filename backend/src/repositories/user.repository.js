const pool = require("../config/db");

// 🔥 Create user (tenant scoped)
async function createUser(tenantId, name, email, password, role = "user") {
  const result = await pool.query(
    `INSERT INTO users (tenant_id, name, email, password, role)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, tenant_id, name, email, role, created_at`,
    [tenantId, name, email, password, role]
  );

  return result.rows[0];
}

// 🔥 Get all users for a tenant
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



// 🔥 Find user by email within tenant (used for login)
async function findByEmailAndTenant(tenantId, email) {
  email = email.toLowerCase().trim();

  const result = await pool.query(
    `SELECT id, tenant_id, email, password, role
     FROM users
     WHERE tenant_id = $1 AND email = $2`,
    [tenantId, email]
  );

  return result.rows[0];
}

// 🔥 Find user by ID within tenant (used for auth/RBAC)
async function findById(userId, tenantId) {
  const result = await pool.query(
    `SELECT id, tenant_id, role
     FROM users
     WHERE id = $1 AND tenant_id = $2`,
    [userId, tenantId]
  );

  return result.rows[0];
}

module.exports = {
  createUser,
  getUsersByTenant,
  findByEmailAndTenant,
  findById,
};