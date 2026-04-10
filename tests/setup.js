require("dotenv").config({ path: ".env.test" });

const pool = require("../src/config/db");

beforeEach(async () => {
  await pool.query("DELETE FROM refresh_tokens");
  await pool.query("DELETE FROM users");
  await pool.query("DELETE FROM tenants");
});

afterAll(async () => {
  await pool.end();
});