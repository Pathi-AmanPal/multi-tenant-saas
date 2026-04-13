const pool = require('../config/db');

async function findByName(name) {
  const result = await pool.query(
    'SELECT * FROM tenants WHERE name = $1',
    [name]
  );
  return result.rows[0];
}

async function createTenant(name) {
  const result = await pool.query(
    'INSERT INTO tenants (name) VALUES ($1) RETURNING *',
    [name]
  );
  return result.rows[0];
}

async function getAllTenants() {
  const result = await pool.query('SELECT * FROM tenants');
  return result.rows;
}

module.exports = {
  findByName,
  createTenant,
  getAllTenants
};
