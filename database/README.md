# Database Architecture & Management Guide

**System:** Enterprise Retail Management, Inventory Control & AI Intelligence System  
**Engine:** MySQL 8.x (InnoDB, utf8mb4) / H2 In-Memory Database (MySQL Mode for Tests & Local Dev)  

---

## 1. Directory Structure

- `01_schema.sql`: Full DDL establishing 26 tables, foreign keys, timestamps, check constraints, and cascading integrity.
- `02_indexes_constraints.sql`: Dedicated high-performance composite and foreign key indexes for rapid product lookups, date-filtered sales, inventory queries, and audit scans.
- `03_seed_demo_data.sql`: Realistic enterprise dataset with:
  - 4 RBAC Roles (`ROLE_ADMIN`, `ROLE_MANAGER`, `ROLE_INVENTORY_STAFF`, `ROLE_CASHIER`)
  - 4 User Accounts with BCrypt hashed credentials
  - 2 Retail Stores & 3 Multi-Warehouse locations (Central Distribution Center & Retail Store Floors)
  - 5 Product Categories & 4 Verified Suppliers
  - 12 Catalog Products with prices, reorder thresholds, and safety stocks
  - Realistic multi-warehouse stock allocations
  - Historical purchase orders, multi-day sales transactions, invoices, stock movements, notifications, and audit records.
- `04_demo_queries.sql`: Analytical SQL queries for inventory valuation, low-stock detection, sales revenue & profit margins, supplier lead-time tracking, and deterministic replenishment calculations.

---

## 2. Initialization via MySQL CLI

To initialize a fresh local MySQL instance:

```bash
# 1. Connect to MySQL as root or privileged administrator
mysql -u root -p

# 2. Create database with UTF8MB4 charset
CREATE DATABASE IF NOT EXISTS retail_management_db 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

# 3. Use the database
USE retail_management_db;

# 4. Execute scripts in sequence
SOURCE /path/to/database/01_schema.sql;
SOURCE /path/to/database/02_indexes_constraints.sql;
SOURCE /path/to/database/03_seed_demo_data.sql;

# 5. Run verification query
SOURCE /path/to/database/04_demo_queries.sql;
```

---

## 3. Flyway Database Migrations in Spring Boot

In the Spring Boot backend (`backend/src/main/resources/db/migration/`), Flyway migrations are version-controlled:
- `V1__init_schema.sql`: Sets up all core relational tables and foreign keys.
- `V2__indexes_and_constraints.sql`: Creates performance indexes.
- `V3__seed_demo_data.sql`: Populates baseline users, master catalog, and demo data.

When Spring Boot boots up, Flyway runs automatically to ensure the database schema matches the entity definitions exactly.

---

## 4. Default Demonstration Credentials

| Username | Role | Default Password | Description |
|---|---|---|---|
| `admin` | `ROLE_ADMIN` | `Password@123` | System Administrator with full privileges |
| `manager` | `ROLE_MANAGER` | `Password@123` | Store Manager overseeing purchase approvals and reports |
| `inventory` | `ROLE_INVENTORY_STAFF` | `Password@123` | Inventory Staff handling receipts and transfers |
| `cashier` | `ROLE_CASHIER` | `Password@123` | Cashier handling POS billing and returns |

> [!IMPORTANT]
> The default password for all seed accounts is `Password@123`. Users are required or prompted to change their passwords upon first login in production environments.
