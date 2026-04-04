const request = require("supertest");
const app = require("../src/app");
const { createTestTenant, createTestUser } = require("./helpers/testData");

describe("Users API", () => {
  test("Get users with valid token", async () => {
    const tenant = await createTestTenant();
    await createTestUser(tenant.id);

    // 🔐 Login first
    const loginRes = await request(app)
      .post("/api/auth/login")
      .set("x-tenant-id", tenant.uuid)
      .send({
        email: "test@test.com",
        password: "123456",
      });

    const token = loginRes.body.accessToken;

    // 👥 Call protected route
    const res = await request(app)
      .get("/api/users")
      .set("x-tenant-id", tenant.uuid)
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data).toBeDefined();
  });
});

afterAll(async () => {
  const pool = require("../src/config/db");
  await pool.end();
});

test("Cross-tenant access should be blocked", async () => {
  const tenantA = await createTestTenant();
  const tenantB = await createTestTenant();

  // Create users in both tenants
  await createTestUser(tenantA.id, "userA@test.com");
  await createTestUser(tenantB.id, "userB@test.com");

  // 🔐 Login as tenant A user
  const loginRes = await request(app)
    .post("/api/auth/login")
    .set("x-tenant-id", tenantA.uuid)
    .send({
      email: "userA@test.com",
      password: "123456",
    });

  const token = loginRes.body.accessToken;

  // 🚨 Try accessing tenant B data using tenant A token
  const res = await request(app)
    .get("/api/users")
    .set("x-tenant-id", tenantB.uuid) // ❌ mismatch
    .set("Authorization", `Bearer ${token}`);

  console.log("STATUS:", res.statusCode);
  console.log("BODY:", res.body);

  expect(res.statusCode).toBe(401);
});
