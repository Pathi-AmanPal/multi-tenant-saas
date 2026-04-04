const request = require("supertest");
const { createTestTenant, createTestUser } = require("./helpers/testData");
const app = require("../src/app"); // ⚠️ your app is inside src

describe("Auth API", () => {

  test("Login should fail without tenant header", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({
        email: "test@test.com",
        password: "123456"
      });

    expect(res.statusCode).toBe(400);
  });

});



test("Login success", async () => {
  const tenant = await createTestTenant();
  await createTestUser(tenant.id);

  const res = await request(app)
    .post("/api/auth/login")
    .set("x-tenant-id", tenant.uuid)
    .send({
      email: "test@test.com",
      password: "123456",
    });

  expect(res.statusCode).toBe(200);
  expect(res.body.accessToken).toBeDefined();
  expect(res.body.refreshToken).toBeDefined();
});

test("Refresh token rotation should invalidate old token", async () => {
  const tenant = await createTestTenant();
  await createTestUser(tenant.id, "refresh@test.com");

  // 🔐 Step 1: Login
  const loginRes = await request(app)
    .post("/api/auth/login")
    .set("x-tenant-id", tenant.uuid)
    .send({
      email: "refresh@test.com",
      password: "123456",
    });

  const refreshToken = loginRes.body.refreshToken;

  // 🔁 Step 2: First refresh (valid)
  const refreshRes1 = await request(app)
    .post("/api/auth/refresh")
    .set("x-tenant-id", tenant.uuid)
    .send({ refreshToken });

  expect(refreshRes1.statusCode).toBe(200);
  expect(refreshRes1.body.refreshToken).toBeDefined();

  const newRefreshToken = refreshRes1.body.refreshToken;

  // 🚨 Step 3: Use OLD refresh token again
  const refreshRes2 = await request(app)
    .post("/api/auth/refresh")
    .set("x-tenant-id", tenant.uuid)
    .send({ refreshToken });

  expect(refreshRes2.statusCode).toBe(401);

  // ✅ Step 4: New token should work
  const refreshRes3 = await request(app)
    .post("/api/auth/refresh")
    .set("x-tenant-id", tenant.uuid)
    .send({ refreshToken: newRefreshToken });

  expect(refreshRes3.statusCode).toBe(200);
});


afterAll(async () => {
  const pool = require("../src/config/db");
  await pool.end();
});