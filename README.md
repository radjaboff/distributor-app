<div align="center">

# 📦 Distributor Management System

**A full-stack system for wholesale distributors: stock, sales, shop debts and financial reports in one place.**

![Java](https://img.shields.io/badge/Java-17-ED8B00?logo=openjdk&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Spring_Boot-REST_API-6DB33F?logo=springboot&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white)
![PWA](https://img.shields.io/badge/PWA-installable-5A0FC8?logo=pwa&logoColor=white)

🇺🇿 [O'zbekcha versiya](README.uz.md)

</div>

---

## 📌 Problem & Solution

A distributor who buys goods (sugar, cooking oil, etc.) from a wholesale base and sells them to market shops, sometimes for cash and sometimes on credit, usually keeps records in a notebook. It is hard to know which shop owes how much, when they last paid, and what is left in the warehouse, and mistakes are easy to make.

This project **digitalizes the whole process** and is **deployed to production for a real distribution business**:

- Stock-in from the wholesale base, with the warehouse balance updated automatically
- Sales to shops (**cash / card / credit**) with automatic debt calculation
- Payments recorded against a shop, reducing its debt automatically
- Daily, monthly and custom-range financial reports (profit, revenue, top debtors)

---

## 🛠 Tech Stack

| Technology | Purpose |
|---|---|
| **Java 17** | Main programming language |
| **Spring Boot** | Backend framework (REST API) |
| **Spring Data JPA / Hibernate** | ORM and database access |
| **Spring Security** | Authentication, session management, Remember-Me |
| **PostgreSQL 16** | Relational database |
| **Jakarta Validation** | Request validation |
| **Swagger / OpenAPI** | API documentation |
| **Apache POI** | Excel (.xlsx) report export |
| **Lombok** | Boilerplate reduction |
| **Maven** | Build and dependency management |
| **HTML / CSS / JavaScript** | Mobile-first PWA frontend (no framework) |
| **Docker, Docker Compose, Nginx** | Containerized production deployment |

---

## 🏗 Architecture

The project follows **SOLID** principles and a classic **layered architecture**:

```
Controller → Service (interface + impl) → Repository → Database
                 ↕
            DTO + Mapper
```

| Package | Responsibility |
|---|---|
| `entity/` | Database-mapped classes |
| `repository/` | Spring Data JPA repositories |
| `service/`, `service/impl/` | Business logic, interface + implementation (Dependency Inversion) |
| `controller/` | REST API endpoints |
| `dto/` | Request / Response classes and Entity ↔ DTO mappers |
| `exception/` | Custom exceptions and centralized handling via `@ControllerAdvice` |
| `enums/` | `PaymentType` (CASH / CARD / CREDIT), `PaymentMethod` (CASH / CARD) |

**Why DTOs?** Entities are never returned directly from the API. This separates the internal data model from the outside world and guarantees that clients cannot tamper with fields managed by the system, such as the sale price or cost.

---

## ⚙️ Key Features

- **Package-based accounting:** goods are counted in whole packages (a sack of sugar, a box of oil), not in kg or liters
- **Stock management:** stock-in increases the balance, a sale decreases it, all inside transactions
- **Shop categories:** shops are grouped by market or category, with search and sort by debt
- **Multi-item sales:** one sale can contain several products and be paid in cash, by card, on credit, or partly upfront
- **Partial payments:** a shop can pay part of a sale immediately and the rest later; debt is recalculated automatically
- **Price & cost locking:** the selling price and cost at the time of sale are stored, so later price changes never affect old sales or historical profit
- **Shop ledger:** a chronological history of sales and payments with a running balance that always matches the shop's current debt
- **Overdue debtors & low-stock alerts:** shown on the dashboard
- **Reports:** daily, monthly and custom date-range reports with profit, revenue by payment type, stock-in costs, product sales volume and top debtors

---

## ✅ Production-Grade Details

- **Concurrency safety:** pessimistic locking on sale, payment and stock-in creation prevents race conditions
- **Storno:** cancel a sale or a payment, with stock and debt recalculated automatically and an audit history kept
- **Soft delete:** deleting a shop, category or product never destroys financial history
- **Security:** Spring Security login, Remember-Me (30 days), `SameSite=Strict` cookies, brute-force protection, HTML escaping on the frontend, protected Swagger UI
- **Centralized error handling:** clean JSON errors; internal exception details are never leaked to the client
- **Validation & logging:** request validation in DTOs and SLF4J logging on business operations
- **Excel export:** daily, monthly and range reports as `.xlsx`
- **Backup & restore:** one-click JSON backup and password-protected restore with structure validation
- **PWA:** installable on phones and desktops, works like a native app
- **Deployment:** Docker, Docker Compose, PostgreSQL 16 Alpine, Nginx reverse proxy, Let's Encrypt SSL and a daily automatic backup script

---

<!--
## 📸 Screenshots

Add 3–4 screenshots (use test data only, never real customer data), for example:

| Dashboard | Shop ledger | Sale form |
|---|---|---|
| ![Dashboard](docs/dashboard.png) | ![Ledger](docs/ledger.png) | ![Sale](docs/sale.png) |

To show them, delete the opening and closing comment markers around this block.
-->

## 🚀 Getting Started

### Option 1: Docker (recommended)

```bash
git clone https://github.com/radjaboff/distributor-app.git
cd distributor-app
cp .env.example .env     # then fill in your own passwords
docker compose up -d --build
```

### Option 2: Run locally

1. Create the database:
   ```sql
   CREATE DATABASE distributor_db;
   ```
2. Set the `DB_PASSWORD` environment variable (and the admin credentials listed in `.env.example`)
3. Start the application:
   ```bash
   ./mvnw spring-boot:run
   ```
4. Open `http://localhost:8080`

---

## 📡 API Endpoints

```
# Products
GET    /api/products
POST   /api/products
GET    /api/products/{id}
PUT    /api/products/{id}
DELETE /api/products/{id}

# Stock-in
POST   /api/stock-in
GET    /api/stock-in?productId=

# Market groups (categories)
GET    /api/market-groups
POST   /api/market-groups

# Shops
GET    /api/shops
GET    /api/shops?groupId=
POST   /api/shops
PUT    /api/shops/{id}
GET    /api/shops/{id}/debt
GET    /api/shops/{id}/ledger
GET    /api/shops/overdue?days=

# Sales
POST   /api/sales
GET    /api/sales?shopId=

# Payments
POST   /api/payments
GET    /api/payments?shopId=

# Reports (+ /export for Excel)
GET    /api/reports/daily?date=2026-09-13
GET    /api/reports/monthly?month=2026-09
GET    /api/reports/range

# Dashboard
GET    /api/dashboard/summary
```

> Full interactive documentation is available through Swagger UI after logging in.

---

## 👤 Author

**Akmal Rajabov**, Java Backend Developer

[GitHub](https://github.com/radjaboff) · [LinkedIn](https://www.linkedin.com/in/akmal-rajabov)
