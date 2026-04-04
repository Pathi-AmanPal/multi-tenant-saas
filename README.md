# 🔥 MULTI-TENANT SAAS BACKEND — ENTERPRISE-GRADE ARCHITECTURE

[![Backend CI](https://github.com/Pathi-AmanPal/multi-tenant-saas-backend/actions/workflows/backend-ci.yml/badge.svg)](https://github.com/Pathi-AmanPal/multi-tenant-saas-backend/actions/workflows/backend-ci.yml)

# Multi-Tenant SaaS Backend

[![Backend CI](https://github.com/Pathi-AmanPal/multi-tenant-saas-backend/actions/workflows/backend-ci.yml/badge.svg)](https://github.com/Pathi-AmanPal/multi-tenant-saas-backend/actions/workflows/backend-ci.yml)
![Node.js](https://img.shields.io/badge/Node.js-Express-339933?logo=node.js&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-4169E1?logo=postgresql&logoColor=white)
![JWT](https://img.shields.io/badge/Auth-JWT-000000?logo=jsonwebtokens&logoColor=white)
![Docker](https://img.shields.io/badge/Container-Docker-2496ED?logo=docker&logoColor=white)

> A production-style multi-tenant backend engineered with security, isolation, and scalability as first-class concerns — not a tutorial project.

---

## What This Is

Most backend projects demonstrate CRUD. This one demonstrates how a real SaaS backend is architected — where multiple organizations share infrastructure but their data is completely and structurally isolated from one another.

Tenant isolation is enforced at **two independent layers**: the application layer (JWT-extracted tenant ID — no client input trusted) and the database layer (foreign key constraints + indexed queries). Cross-tenant access is not just blocked by logic; it's structurally impossible.

---

## Architecture

```
CLIENT
  │
  ▼
AUTH ENDPOINT         → JWT generation
  │
  ▼
AUTH MIDDLEWARE       → JWT verification + tenant resolution
  │
  ▼
CONTROLLER            → Request handling
  │
  ▼
SERVICE               → Business logic
  │
  ▼
REPOSITORY            → Tenant-scoped queries (always)
  │
  ▼
POSTGRESQL            → FK constraints + indexed tenant_id
```

---

## Security Model

### Authentication
- Stateless JWT access tokens (short-lived)
- Refresh token rotation — old token revoked on every refresh cycle
- Refresh tokens hashed with SHA-256 before storage
- No token → 401. Invalid token → 401. Expired token → 401.

**JWT Payload:**
```json
{
  "userId": number,
  "tenantId": number,
  "role": "USER" | "ADMIN",
  "iat": timestamp,
  "exp": timestamp
}
```

### Password Security
- bcrypt hashing with 10 salt rounds
- No plaintext storage at any layer
- `NOT NULL` enforced at database level

### Tenant Isolation
- Tenant ID extracted **only** from verified JWT — never from headers or request body
- Every repository query scoped by `tenant_id`
- Database enforces `FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE`
- Indexed `tenant_id` for O(log n) query performance

### Additional Hardening
- Helmet.js security headers
- Rate limiting on auth routes
- Environment-separated configs (`.env` vs `.env.test`)

---

## Database Schema

**tenants**

| Field | Type | Notes |
|---|---|---|
| id | integer | Primary key |
| uuid | uuid | External-facing identifier |
| name | varchar | Tenant name |
| status | enum | ACTIVE / SUSPENDED / DELETED |
| created_at | timestamp | Auto-set |

**users**

| Field | Type | Notes |
|---|---|---|
| id | integer | Primary key |
| tenant_id | integer | FK → tenants(id) |
| name | varchar | |
| email | varchar | Unique per tenant |
| password | varchar | bcrypt hashed, NOT NULL |
| role | enum | USER / ADMIN |
| created_at | timestamp | Auto-set |

---

## Tech Stack

| Category | Technology |
|---|---|
| Runtime | Node.js |
| Framework | Express.js |
| Database | PostgreSQL |
| Containerization | Docker |
| Authentication | JWT + Refresh Tokens |
| Password Hashing | bcrypt |
| Testing | Jest + Supertest |
| Security Headers | Helmet.js |
| Dev Environment | WSL / Linux |

---

## Test Coverage

Integration tests run against a real PostgreSQL test database and cover:

- Login success and failure paths
- Protected route enforcement
- Refresh token rotation (issue → rotate → revoke)
- **Cross-tenant attack simulation** — authenticates as Tenant A, attempts to access Tenant B's data, verifies rejection

```bash
npm test
```

Tests use a separate `.env.test` config to prevent interference with development data.

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
```
PORT=5000
DB_HOST=localhost
DB_USER=your_user
DB_PASSWORD=your_password
DB_NAME=saasdb
DB_PORT=5432
JWT_SECRET=ultra_secure_random_secret
JWT_REFRESH_SECRET=another_secure_secret
```

**Run**
```bash
npm run dev
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
```

---

## Roadmap

- [x] Multi-tenant core with shared DB isolation
- [x] JWT authentication
- [x] Refresh token rotation
- [x] Role-based access (USER / ADMIN)
- [x] bcrypt password hashing
- [x] Rate limiting + Helmet security headers
- [x] Integration test suite with attack simulation
- [ ] Fine-grained permission system (beyond USER/ADMIN)
- [ ] Structured logging with request correlation IDs
- [ ] Input validation middleware (Zod/Joi)
- [ ] Docker production configuration
- [ ] CI/CD pipeline 

---

## Engineering Decisions

**Why shared DB instead of DB-per-tenant?**
Shared DB scales operationally — you're not managing hundreds of separate database instances. The tradeoff is that isolation logic must be owned entirely by the application. That's why it's pushed down to the FK and index level, not left to developer discipline in individual queries.

**Why extract tenant ID from JWT only?**
Headers and request bodies are client-controlled. The JWT is signed — any modification invalidates it. Extracting tenant context from a verified JWT means tenant isolation holds even if a client sends malicious headers.

**Why refresh token rotation?**
A static refresh token is a persistent credential. Rotation means a stolen token can only be used once before it's invalidated — the next legitimate refresh will detect the mismatch and can invalidate the entire session.

---

## Author

**Aman Pal** — [@Pathi-AmanPal](https://github.com/Pathi-AmanPal)

Backend engineer focused on multi-tenant systems, SaaS architecture, and secure API design.

