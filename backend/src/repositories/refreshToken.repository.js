const pool = require('../config/db');

async function createRefreshToken(userId, tenantId, tokenHash, expiresAt) {
  const result = await pool.query(
    `INSERT INTO refresh_tokens (user_id, tenant_id, token_hash, expires_at)
     VALUES ($1, $2, $3, $4)
     RETURNING id, user_id, tenant_id, expires_at, created_at`,
    [userId, tenantId, tokenHash, expiresAt]
  );

  return result.rows[0];
}

async function findByTokenHash(tokenHash) {
  const result = await pool.query(
    `SELECT *
     FROM refresh_tokens
     WHERE token_hash = $1 AND revoked = FALSE`,
    [tokenHash]
  );

  return result.rows[0];
}

async function revokeToken(tokenHash) {
  await pool.query(
    `UPDATE refresh_tokens
     SET revoked = TRUE
     WHERE token_hash = $1`,
    [tokenHash]
  );
}

module.exports = {
  createRefreshToken,
  findByTokenHash,
  revokeToken
};