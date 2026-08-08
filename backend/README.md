# Rental Management System Backend — Phase 1 & Phase 2

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
│   │   └── rental_period.controller.js # Rental period CRUD (Phase 2)
│   ├── middleware/
│   │   ├── auth.middleware.js    # JWT authentication & role-based authorization
│   │   └── error.middleware.js   # Centralized error handler
│   ├── models/
│   │   ├── index.js              # Database associations & export hub
│   │   ├── user.model.js         # User model with role & password reset
│   │   ├── product.model.js      # Product model
│   │   ├── variant.model.js      # Product variant model
│   │   └── rental_period.model.js# Rental period model
│   ├── routes/
│   │   ├── auth.routes.js        # /api/auth endpoints
│   │   ├── user.routes.js        # /api/users endpoints
│   │   ├── product.routes.js     # /api/products endpoints
│   │   └── rental_period.routes.js # /api/rental-periods endpoints
│   ├── services/
│   │   ├── user.service.js       # User database operations
│   │   ├── email.service.js      # Nodemailer email sender
│   │   ├── product.service.js    # Product database queries
│   │   ├── variant.service.js    # Product variant database queries
│   │   └── rental_period.service.js # Rental period queries
│   ├── utils/
│   │   ├── errors.js             # Custom AppError class
│   │   ├── jwt.js                # JWT sign/verify
│   │   ├── response.js           # Standardized response helper
│   │   └── validation.js         # Input validation helpers
│   └── app.js                    # Express app configuration & static server
│   └── server.js                 # Server entry point
├── public/
│   └── index.html                # Interactive API Explorer & cURL Dashboard
├── scripts/
│   ├── test_phase1.js            # Phase 1 integration tests
│   └── test_phase2.js            # Phase 2 integration tests
├── .env.example
└── README.md
```

---

## Database Tables & Schema

### 1. `users`
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PRIMARY KEY | Unique user ID |
| `name` | VARCHAR | NOT NULL | User's full name |
| `email` | VARCHAR | NOT NULL, UNIQUE | Unique email address |
| `password` | VARCHAR | NOT NULL | Bcrypt hashed password |
| `role` | ENUM | NOT NULL | `CUSTOMER`, `VENDOR`, or `ADMIN` (Default: `CUSTOMER`) |
| `profile_image` | TEXT | NULLABLE | Avatar URL |
| `address` | TEXT | NULLABLE | User physical address |
| `reset_password_token` | VARCHAR | NULLABLE | Password reset token |
| `reset_password_expires` | TIMESTAMP | NULLABLE | Expiration timestamp (15 mins) |

### 2. `products`
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PRIMARY KEY | Unique product ID |
| `name` | VARCHAR | NOT NULL | Product name |
| `description` | TEXT | NULLABLE | Product description |
| `category` | VARCHAR | NOT NULL | Product category |
| `base_price` | DECIMAL(10,2)| NOT NULL | Rental base price |
| `status` | ENUM | NOT NULL | `ACTIVE` or `INACTIVE` (Default: `ACTIVE`) |

### 3. `product_variants`
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PRIMARY KEY | Unique variant ID |
| `product_id` | UUID | FOREIGN KEY -> `products(id)` | Parent product ID (CASCADE delete) |
| `brand` | VARCHAR | NULLABLE | e.g. Canon, Nike |
| `manufacturer` | VARCHAR | NULLABLE | Manufacturer company name |
| `color` | VARCHAR | NULLABLE | Color variant |
| `size` | VARCHAR | NULLABLE | Size variant |
| `status` | ENUM | NOT NULL | `ACTIVE` or `INACTIVE` (Default: `ACTIVE`) |

### 4. `rental_periods`
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PRIMARY KEY | Unique period ID |
| `name` | VARCHAR | NOT NULL | e.g. Daily, Weekly, Monthly |
| `duration` | INTEGER | NOT NULL | Numeric duration (> 0) |
| `unit` | ENUM | NOT NULL | `DAY`, `WEEK`, or `MONTH` |
| `status` | ENUM | NOT NULL | `ACTIVE` or `INACTIVE` (Default: `ACTIVE`) |

---

## API Endpoints Summary

### Auth & Profile (Phase 1)
- `POST /api/auth/register` — Register user (`role`: `CUSTOMER`, `VENDOR`, or `ADMIN`)
- `POST /api/auth/login` — Login user & return JWT token
- `GET /api/auth/me` — Get current user profile (Protected)
- `POST /api/auth/forgot-password` — Send reset email via Nodemailer
- `POST /api/auth/reset-password` — Reset password using token
- `GET /api/users/profile` — Get user profile (Protected)
- `PUT /api/users/profile` — Update user profile (Protected)

### Products (Phase 2)
- `POST /api/products` — Create product (**ADMIN Only**)
- `GET /api/products` — Get products (Supports `?status=ACTIVE`, Protected)
- `GET /api/products/:id` — Get product details with variants (Protected)
- `PUT /api/products/:id` — Update product (**ADMIN Only**)
- `DELETE /api/products/:id` — Deactivate product (**ADMIN Only**)

### Product Variants (Phase 2)
- `POST /api/products/:productId/variants` — Add variant (**ADMIN Only**)
- `GET /api/products/:productId/variants` — Get variants for product (Protected)
- `PUT /api/products/:productId/variants/:variantId` — Update variant (**ADMIN Only**)
- `DELETE /api/products/:productId/variants/:variantId` — Deactivate variant (**ADMIN Only**)

### Rental Periods (Phase 2)
- `POST /api/rental-periods` — Create rental period (**ADMIN Only**)
- `GET /api/rental-periods` — Get rental periods (Supports `?status=ACTIVE`, Protected)
- `GET /api/rental-periods/:id` — Get single rental period (Protected)
- `PUT /api/rental-periods/:id` — Update rental period (**ADMIN Only**)
- `DELETE /api/rental-periods/:id` — Deactivate rental period (**ADMIN Only**)

---

## Running Tests

```bash
# Phase 1 Auth & Reset Tests
node scripts/test_phase1.js

# Phase 2 Product & Rental Period Tests
node scripts/test_phase2.js
```
