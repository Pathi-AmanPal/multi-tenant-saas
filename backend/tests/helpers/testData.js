const pool = require("../../src/config/db");
const bcrypt = require("bcrypt");

const { v4: uuidv4 } = require("uuid");

async function createTestTenant() {
  const uniqueName = "Test Tenant " + uuidv4();

  const result = await pool.query(
    `INSERT INTO tenants (name, uuid, status)
     VALUES ($1, gen_random_uuid(), 'ACTIVE')
     RETURNING *`,
    [uniqueName]
  );

  return result.rows[0];
}

async function createTestUser(tenantId, email = "test@test.com") {
  const hashed = await bcrypt.hash("123456", 10);

  const result = await pool.query(
    `INSERT INTO users (tenant_id, name, email, password, role)
     VALUES ($1, 'Test User', $2, $3, 'user')
     RETURNING *`,
    [tenantId, email, hashed]
  );

  return result.rows[0];
}

module.exports = {
  createTestTenant,
  createTestUser,
};