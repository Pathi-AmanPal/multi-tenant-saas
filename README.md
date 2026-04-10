# 🔥 Multi-Tenant SaaS Backend — Production-Grade Architecture

[![Backend CI](https://github.com/Pathi-AmanPal/multi-tenant-saas-backend/actions/workflows/backend-ci.yml/badge.svg)](https://github.com/Pathi-AmanPal/multi-tenant-saas-backend/actions/workflows/backend-ci.yml)
![Node.js](https://img.shields.io/badge/Node.js-Express-339933?logo=node.js&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-4169E1?logo=postgresql&logoColor=white)
![JWT](https://img.shields.io/badge/Auth-JWT-000000?logo=jsonwebtokens&logoColor=white)
![Docker](https://img.shields.io/badge/Container-Docker-2496ED?logo=docker&logoColor=white)

> A production-style multi-tenant backend engineered with security, isolation, and scalability as first-class concerns — not a tutorial project.

---

## What This Is

Most backend projects demonstrate CRUD. This one demonstrates how a real SaaS backend is architected — where multiple organizations share infrastructure but their data is completely and structurally isolated from one another.

Tenant isolation is enforced at **two independent layers**: the application layer (JWT-verified tenant ID + header validation) and the database layer (foreign key constraints + indexed queries). Cross-tenant access is not just blocked by logic — it's structurally impossible.

---

## Architecture

```
CLIENT
  │
  ▼
TENANT RESOLVER       → Validates x-tenant-id header (UUID format)
  │
  ▼
AUTH MIDDLEWARE        → JWT verification + tenant binding check
  │                      (JWT tenantId must match resolved tenant)
  ▼
CONTROLLER            → Request handling
  │
  ▼
SERVICE               → Business logic
  │
  ▼
REPOSITORY            → Tenant-scoped queries (always enforced)
  │
  ▼
POSTGRESQL            → FK constraints + indexed tenant_id
```

---

## Multi-Tenant Design

Shared database architecture with complete data isolation:

- Tenant identified via `x-tenant-id` header (UUID)
- Header is **validated** — malformed or missing UUIDs are rejected with `400`
- Middleware resolves tenant → `req.tenant`
- JWT `tenantId` must match the resolved tenant — mismatch returns `403`
- All queries scoped by `tenant_id` at the repository level, no exceptions

### Isolation Guarantee

Cross-tenant access is blocked at three layers:

1. **Header validation** — invalid or missing tenant ID rejected before hitting auth
2. **JWT binding** — token's `tenantId` must match the request's resolved tenant
3. **Database scoping** — every repository query includes `WHERE tenant_id = ?`

Verified end-to-end via integration tests that simulate real cross-tenant attack scenarios.

---

## Security Model

### Authentication

- Stateless JWT access tokens (15 min expiry)
- Refresh token rotation — old token revoked on every refresh cycle
- Refresh tokens hashed with SHA-256 before storage
- No token → `401`. Invalid token → `401`. Expired token → `401`. Tenant mismatch → `403`.

**JWT Payload:**
```json
{
  "userId": "number",
  "tenantId": "number",
  "role": "USER | ADMIN",
  "iat": "timestamp",
  "exp": "timestamp"
}
```

### Refresh Token Rotation

On `POST /api/auth/refresh`:

1. Incoming token validated and revoked
2. New token generated
3. New token stored as SHA-256 hash in DB
4. Only the latest token remains valid — replayed tokens are rejected

This means a stolen refresh token becomes invalid after the next legitimate use.

### Password Security

- bcrypt hashing with 10 salt rounds
- No plaintext storage at any layer
- `NOT NULL` constraint enforced at database level

### Additional Hardening

- **Helmet.js** — sets secure HTTP response headers
- **Rate limiting** on auth routes — prevents brute force
- **Request logging** — structured logs with method, path, status, and response time
- **Error handling middleware** — consistent error shape, no stack trace leakage in production
- Environment-separated configs (`.env` vs `.env.test`)

---

## Database Schema

**tenants**

| Field | Type | Notes |
|---|---|---|
| id | integer | Primary key |
| uuid | uuid | External-facing identifier (used in headers) |
| name | varchar | Tenant name |
| status | enum | `ACTIVE` / `SUSPENDED` / `DELETED` |
| created_at | timestamp | Auto-set |

**users**

| Field | Type | Notes |
|---|---|---|
| id | integer | Primary key |
| tenant_id | integer | FK → `tenants(id)` ON DELETE CASCADE |
| name | varchar | |
| email | varchar | Unique per tenant |
| password | varchar | bcrypt hashed, NOT NULL |
| role | enum | `USER` / `ADMIN` |
| created_at | timestamp | Auto-set |

---

## Tech Stack

| Category | Technology |
|---|---|
| Runtime | Node.js |
| Framework | Express.js |
| Database | PostgreSQL |
| Containerization | Docker |
| Authentication | JWT + Refresh Token Rotation |
| Password Hashing | bcrypt |
| Security Headers | Helmet.js |
| Testing | Jest + Supertest |
| CI | GitHub Actions |
| Dev Environment | WSL / Linux |

---

## Testing & CI

Integration tests run against a **real PostgreSQL test database** — no mocks, no in-memory fakes.

**Coverage includes:**

- Register and login flows (success + failure paths)
- Protected route enforcement (missing token, expired token)
- Refresh token rotation (issue → rotate → revoke)
- Logout and token invalidation
- **Cross-tenant attack simulation** — authenticates as Tenant A, attempts to access Tenant B's data, verifies `403` rejection

```bash
npm test
```

Tests use a separate `.env.test` config to prevent any interference with development data.

**CI Pipeline (GitHub Actions):**

- Runs on every push and pull request
- Spins up a PostgreSQL service container
- Runs full migration + integration test suite
- Fails the build on any test failure

---

## Error Handling

All errors return a consistent JSON shape:

```json
{
  "error": "Human-readable message",
  "code": "MACHINE_READABLE_CODE"
}
```

No stack traces or internal details are exposed in production responses. Unhandled errors are caught by a global error handler and logged server-side.

---

## Request Logging

Every request is logged with:

- HTTP method and path
- Response status code
- Response time (ms)
- Tenant ID (when resolved)

Structured for easy ingestion into log aggregation tools (e.g. Datadog, Logtail).

---

## Rate Limiting

Auth endpoints (`/register`, `/login`, `/refresh`) are rate-limited to prevent:

- Brute force attacks on login
- Token fishing via refresh endpoint abuse
- Account enumeration

Limits are configurable via environment variables.

---

## Local Setup

**Clone**
```bash
git clone git@github.com:Pathi-AmanPal/multi-tenant-saas-backend.git
cd multi-tenant-saas-backend
```

**Install**
```bash
npm install
```

**Environment variables** — create a `.env` file:
```env
PORT=5000
DB_HOST=localhost
DB_USER=your_user
DB_PASSWORD=your_password
DB_NAME=saasdb
DB_PORT=5432
JWT_SECRET=ultra_secure_random_secret
JWT_REFRESH_SECRET=another_secure_secret
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
```

**Run**
```bash
npm run dev
```

**Run tests**
```bash
npm test
```

---

## API Reference

### Auth

| Method | Endpoint | Auth Required | Description |
|---|---|---|---|
| POST | `/api/auth/register` | No | Register a new user under a tenant |
| POST | `/api/auth/login` | No | Login, receive access + refresh tokens |
| POST | `/api/auth/refresh` | No | Rotate refresh token, get new access token |
| POST | `/api/auth/logout` | Yes | Revoke refresh token |

### Users

| Method | Endpoint | Auth Required | Description |
|---|---|---|---|
| GET | `/api/users` | Yes | List users (scoped to your tenant) |
| GET | `/api/users/:id` | Yes | Get user by ID (tenant-scoped) |
| POST | `/api/users` | Yes (ADMIN) | Create user within your tenant |
| DELETE | `/api/users/:id` | Yes (ADMIN) | Delete user within your tenant |

All protected routes require:
```
Authorization: Bearer <access_token>
x-tenant-id: <tenant-uuid>
```

---

## Roadmap

- [x] Multi-tenant core with shared DB isolation
- [x] JWT authentication with refresh token rotation
- [x] Role-based access control (USER / ADMIN)
- [x] bcrypt password hashing
- [x] Tenant header validation + JWT binding check
- [x] Rate limiting on auth routes
- [x] Helmet.js security headers
- [x] Structured request logging + error handling middleware
- [x] Integration test suite with cross-tenant attack simulation
- [x] GitHub Actions CI pipeline
- [ ] Input validation middleware (Zod)
- [ ] Fine-grained permission system (beyond USER/ADMIN)
- [ ] Structured logging with request correlation IDs
- [ ] Docker production configuration
- [ ] Admin panel API

---

## Engineering Decisions

**Why shared DB instead of DB-per-tenant?**
Shared DB scales operationally — you're not managing hundreds of separate database instances. The tradeoff is that isolation logic must be owned entirely by the application. That's why it's pushed down to the FK and index level, not left to developer discipline in individual queries.

**Why validate the `x-tenant-id` header AND check it against the JWT?**
Either check alone is insufficient. The header ensures requests are routed to the correct tenant context before auth. The JWT binding check ensures that even a valid token can't be used to probe a different tenant's data. Both checks together make cross-tenant access impossible without compromising both layers simultaneously.

**Why extract tenant context from JWT rather than trusting headers alone?**
Headers are client-controlled and trivially spoofable. The JWT is signed — any modification invalidates it. The header is used for routing and validated for format, but the tenant identity used in database queries always comes from the verified JWT.

**Why refresh token rotation?**
A static refresh token is a persistent credential — if leaked, it grants indefinite access. Rotation means a stolen token becomes invalid after the next legitimate refresh cycle. Combined with SHA-256 hashing in storage, even a database compromise doesn't expose raw tokens.

**Why integration tests against a real database instead of mocks?**
Mocks validate that your code calls the right methods. Integration tests validate that the actual behavior — including tenant isolation — works correctly end-to-end. The cross-tenant attack test in particular cannot be meaningfully tested with mocks.

---

## Author

**Aman Pal** — [@Pathi-AmanPal](https://github.com/Pathi-AmanPal)

Backend engineer focused on multi-tenant systems, SaaS architecture, and secure API design.
