# Rental Management System Backend — Phase 1, Phase 2, Phase 3 & Phase 4

A modular, scalable Express.js backend for a Rental Management System powered by **Node.js**, **Express**, **PostgreSQL**, **Sequelize ORM**, **JWT**, **bcrypt**, and **Nodemailer**.

---

## Technical Architecture

```
backend/
├── src/
│   ├── config/
│   │   └── db.js                 # PostgreSQL & Sequelize ORM initialization
│   ├── controllers/
│   │   ├── auth.controller.js    # Register, login, current user, password reset
│   │   ├── user.controller.js    # User profile management
│   │   ├── product.controller.js # Product CRUD (Phase 2)
│   │   ├── variant.controller.js # Product variant CRUD (Phase 2)
│   │   ├── rental_period.controller.js # Rental period CRUD (Phase 2)
│   │   ├── cart.controller.js    # Customer Cart CRUD (Phase 3)
│   │   ├── order.controller.js   # Rental Order & Checkout (Phase 3)
│   │   ├── admin_order.controller.js # Admin Order Inspection (Phase 3)
│   │   └── payment.controller.js # Customer & Admin Payments & Security Deposit (Phase 4)
│   ├── middleware/
│   │   ├── auth.middleware.js    # JWT authentication & role-based authorization
│   │   └── error.middleware.js   # Centralized error handler
│   ├── models/
│   │   ├── index.js              # Database associations & export hub
│   │   ├── user.model.js         # User model (CUSTOMER, VENDOR, ADMIN)
│   │   ├── product.model.js      # Product model
│   │   ├── variant.model.js      # Product variant model
│   │   ├── rental_period.model.js# Rental period model
│   │   ├── cart.model.js         # Cart model (Phase 3)
│   │   ├── cart_item.model.js    # Cart item model (Phase 3)
│   │   ├── order.model.js        # Order model (Phase 3)
│   │   ├── order_item.model.js   # Order item model (Phase 3)
│   │   ├── payment.model.js      # Payment model (Phase 4)
│   │   └── security_deposit.model.js # Security Deposit model (Phase 4)
│   ├── routes/
│   │   ├── auth.routes.js        # /api/auth endpoints
│   │   ├── user.routes.js        # /api/users endpoints
│   │   ├── product.routes.js     # /api/products endpoints
│   │   ├── rental_period.routes.js # /api/rental-periods endpoints
│   │   ├── cart.routes.js       # /api/cart endpoints (Phase 3)
│   │   ├── order.routes.js      # /api/orders endpoints (Phase 3 & 4)
│   │   └── admin_order.routes.js# /api/admin endpoints (Phase 3 & 4)
│   ├── services/
│   │   ├── user.service.js       # User database operations
│   │   ├── email.service.js      # Nodemailer email sender
│   │   ├── product.service.js    # Product database queries
│   │   ├── variant.service.js    # Product variant database queries
│   │   ├── rental_period.service.js # Rental period queries
│   │   ├── pricing.service.js    # Server-side pricing engine (Phase 3)
│   │   ├── cart.service.js       # Customer cart logic (Phase 3)
│   │   ├── order.service.js      # Order checkout & transactions (Phase 3)
│   │   ├── mockPayment.service.js # Mock Payment provider abstraction (Phase 4)
│   │   ├── securityDeposit.service.js # Security deposit calculation & rules (Phase 4)
│   │   └── payment.service.js    # Payment processing & atomic transactions (Phase 4)
│   ├── utils/
│   │   ├── errors.js             # Custom AppError class
│   │   ├── jwt.js                # JWT sign/verify
│   │   ├── response.js           # Standardized response helper
│   │   └── validation.js         # Input validation helpers
│   └── app.js                    # Express app configuration & static server
│   └── server.js                 # Server entry point
├── public/
│   └── index.html                # Interactive API Explorer & cURL Dashboard (37 Endpoints)
├── scripts/
│   ├── test_error_handlers.js    # Dual error handler integration test
│   └── test_phase4.js            # Phase 4 Payment & Security Deposit integration tests
├── .env.example
└── README.md
```

---

## Database Schema (Phases 1–4)

### 1. `payments` (Phase 4)
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PRIMARY KEY | Unique payment ID |
| `order_id` | UUID | FOREIGN KEY -> `rental_orders(id)` | Associated order |
| `customer_id` | UUID | FOREIGN KEY -> `users(id)` | Customer ID |
| `amount` | DECIMAL(10,2)| NOT NULL | Total amount paid |
| `currency` | VARCHAR | NOT NULL | Default `INR` |
| `payment_type` | ENUM | NOT NULL | `RENTAL`, `SECURITY_DEPOSIT` |
| `payment_method` | ENUM | NOT NULL | `ONLINE`, `CASH` |
| `status` | ENUM | NOT NULL | `PENDING`, `SUCCESS`, `FAILED`, `REFUNDED` |
| `transaction_reference` | VARCHAR | UNIQUE, NULLABLE | Reference string e.g. `MOCK-TXN-...` |
| `paid_at` | TIMESTAMP | NULLABLE | Payment timestamp |

### 2. `security_deposits` (Phase 4)
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PRIMARY KEY | Unique deposit ID |
| `order_id` | UUID | FOREIGN KEY -> `rental_orders(id)` | Associated order |
| `customer_id` | UUID | FOREIGN KEY -> `users(id)` | Customer ID |
| `amount` | DECIMAL(10,2)| NOT NULL | Calculated deposit amount |
| `status` | ENUM | NOT NULL | `PENDING`, `HELD`, `PARTIALLY_REFUNDED`, `REFUNDED`, `DEDUCTED` |
| `held_at` | TIMESTAMP | NULLABLE | Timestamp deposit was held |
| `refunded_at` | TIMESTAMP | NULLABLE | Timestamp deposit was refunded |
| `refunded_amount` | DECIMAL(10,2)| DEFAULT 0.00 | Refunded amount |
| `deducted_amount` | DECIMAL(10,2)| DEFAULT 0.00 | Deducted amount |

---

## Phase 4 API Endpoints Summary

### Customer Payment & Deposit Endpoints (`/api/orders`)
- `GET /api/orders/:orderId/payment-summary` — Server calculates rental subtotal, security deposit (e.g. 20%), and total payable.
- `POST /api/orders/:orderId/payment` — Initiate payment (`ONLINE` or `CASH`). Atomic transaction sets `Order=CONFIRMED` and `SecurityDeposit=HELD`.
- `GET /api/orders/:orderId/payments` — View payment history for order.
- `GET /api/orders/:orderId/security-deposit` — View security deposit record for order.

### Admin Financial Endpoints (`/api/admin`)
- `GET /api/admin/payments` — Inspect all system payments.
- `GET /api/admin/security-deposits` — Inspect all security deposit records.

---

## Running Tests

```bash
# Run Phase 4 Payment & Security Deposit Tests
node scripts/test_phase4.js

# Run Dual Error Handlers Test
node scripts/test_error_handlers.js
```
