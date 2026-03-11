# 🔥 MULTI-TENANT SAAS BACKEND — ENTERPRISE-GRADE ARCHITECTURE

[![Backend CI](https://github.com/Pathi-AmanPal/multi-tenant-saas-backend/actions/workflows/backend-ci.yml/badge.svg)](https://github.com/Pathi-AmanPal/multi-tenant-saas-backend/actions/workflows/backend-ci.yml)

> Not a tutorial project.
> Not a CRUD demo.
> This is a production-style multi-tenant backend engineered with security, isolation, and scalability as first-class concerns.

---

# 🧠 SYSTEM PHILOSOPHY

This project is built around 3 non-negotiable principles:

1. **Zero Trust on Client Input**
2. **Tenant Isolation by Design, Not Convention**
3. **Security Enforced at Both Application & Database Layers**

If a tenant cannot access another tenant’s data under any circumstance, the system is correct.

---

# 🏗 ENTERPRISE ARCHITECTURE OVERVIEW

```
                     ┌────────────────────────┐
                     │        CLIENT          │
                     └────────────┬───────────┘
                                  │
                                  ▼
                     ┌────────────────────────┐
                     │     AUTH ENDPOINT      │
                     │   (JWT GENERATION)     │
                     └────────────┬───────────┘
                                  │
                                  ▼
                     ┌────────────────────────┐
                     │   AUTH MIDDLEWARE      │
                     │  (JWT VERIFICATION)    │
                     └────────────┬───────────┘
                                  │
                                  ▼
                     ┌────────────────────────┐
                     │      CONTROLLER        │
                     └────────────┬───────────┘
                                  │
                                  ▼
                     ┌────────────────────────┐
                     │        SERVICE         │
                     └────────────┬───────────┘
                                  │
                                  ▼
                     ┌────────────────────────┐
                     │      REPOSITORY        │
                     │ (Tenant-Scoped Query)  │
                     └────────────┬───────────┘
                                  │
                                  ▼
                     ┌────────────────────────┐
                     │      POSTGRESQL        │
                     │  FK + Index Enforced   │
                     └────────────────────────┘
```

---

# 🔐 SECURITY MODEL

## 1️⃣ Password Security

* bcrypt hashing
* 10 salt rounds
* No plaintext storage
* NOT NULL enforced at database level
* Credential validation using bcrypt.compare()

## 2️⃣ Stateless Authentication

```
POST /api/auth/login
```

JWT Payload:

```json
{
  "userId": number,
  "tenantId": number,
  "role": "USER" | "ADMIN",
  "iat": timestamp,
  "exp": timestamp
}
```

Protected routes require:

```
Authorization: Bearer <JWT_TOKEN>
```

No token → 401
Invalid token → 401
Expired token → 401

Zero ambiguity.

---

# 🏢 MULTI-TENANT ISOLATION STRATEGY

Tenant isolation is enforced at TWO layers.

## Application Layer

* Tenant ID extracted only from verified JWT
* No trust in headers
* No trust in request body

## Database Layer

* `FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE`
* Indexed tenant_id for O(log n) performance
* Strict tenant-scoped repository queries

Cross-tenant access is structurally impossible.

---

# 🧱 DATABASE DESIGN

## Tenants

| Field      | Purpose              |
| ---------- | -------------------- |
| id         | Internal Primary Key |
| uuid       | External Identifier  |
| name       | Tenant Name          |
| status     | Lifecycle ENUM       |
| created_at | Timestamp            |

## Users

| Field      | Purpose                  |
| ---------- | ------------------------ |
| id         | Primary Key              |
| tenant_id  | Foreign Key              |
| name       | User Name                |
| email      | User Email               |
| password   | bcrypt hashed (NOT NULL) |
| role       | USER / ADMIN             |
| created_at | Timestamp                |

Performance Optimized via Indexed tenant_id.

---

# 🛡 ENGINEERING DECISIONS

✔ Fail-fast database startup validation
✔ Layered architecture (Separation of concerns)
✔ Repository-level tenant scoping
✔ Middleware-driven authorization
✔ SSH-based secure Git workflow
✔ Environment-based configuration

This system does not rely on “developer discipline”.
It relies on enforced constraints.

---

# 📦 TECH STACK

| Category         | Technology     |
| ---------------- | -------------- |
| Runtime          | Node.js        |
| Framework        | Express.js     |
| Database         | PostgreSQL     |
| Containerization | Docker         |
| Authentication   | JWT            |
| Hashing          | bcrypt         |
| Dev Environment  | WSL Linux      |
| Version Control  | Git (SSH Auth) |

---

# 🚀 LOCAL DEVELOPMENT

## Clone

```
git clone git@github.com:Pathi-AmanPal/multi-tenant-saas-backend.git
```

## Install

```
npm install
```

## Environment Variables

```
PORT=5000
DB_HOST=localhost
DB_USER=your_user
DB_PASSWORD=your_password
DB_NAME=saasdb
DB_PORT=5432
JWT_SECRET=ultra_secure_random_secret
```

## Run

```
npm run dev
```

---

# 🧪 VERIFIED SECURITY BEHAVIOR

✔ User creation requires authentication
✔ Password stored hashed
✔ Token required for protected routes
✔ Invalid/expired tokens rejected
✔ Cross-tenant data inaccessible
✔ Database-level enforcement active

---

# 📊 CURRENT COMPLETION STATUS

Multi-Tenant Core ✔
User Module ✔
Password Security ✔
JWT Authentication ✔
Authorization Middleware ✔

Completion Level: **~65% toward full production SaaS readiness**

---

# 🧭 ROADMAP TO ENTERPRISE V1

* Role-Based Access Control (RBAC)
* Rate limiting
* Input validation middleware
* Refresh token mechanism
* Structured logging
* Integration & unit testing
* Docker production config
* AWS deployment
* CI/CD pipeline

---

# 🎯 WHAT THIS PROJECT PROVES

* Understanding of secure SaaS backend architecture
* Implementation of tenant-isolated relational modeling
* Stateless authentication system design
* Middleware-driven authorization patterns
* Real-world DevOps workflow

---

# 👨‍💻 AUTHOR

**Aman (Pathi-AmanPal)**
Backend Engineer in Progress
Multi-Tenant Systems | SaaS Architecture | Secure Backend Design

---

# ⭐ IF YOU VALUE REAL ARCHITECTURE

Star the repository.
Follow the evolution.
Watch it scale into a production-ready SaaS system.

---

> Security is not a feature.
> It is an architectural decision.
