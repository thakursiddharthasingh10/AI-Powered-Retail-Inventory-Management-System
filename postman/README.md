# Postman API Collection & Testing Guide

This directory contains the production-ready Postman collection and local environment for testing and evaluating the **Enterprise Retail Management, Inventory Control & AI-Powered Business Intelligence System**.

---

## 1. Files Included

- **`Retail_Management_API.postman_collection.json`**: Complete Postman v2.1 collection containing 28+ structured requests spanning:
  1. Authentication & Security (Login, Profile, Password Change, User Registration)
  2. Product & Category Catalog
  3. Multi-Warehouse Inventory & Movement Ledger
  4. Procurement & Purchase Orders (Workflow: Draft → Approve → Receive)
  5. Point of Sale & Invoicing (Atomic Stock Deductions & Returns)
  6. Warehouses & Inter-Warehouse Transfers
  7. Executive Dashboard & Analytics
  8. AI Demand Intelligence & Copilot
- **`Retail_Management_Local.postman_environment.json`**: Pre-configured environment variables (`baseUrl`, `jwt_token`, default credentials for all 4 roles).

---

## 2. Quick Setup & Import

1. Open **Postman** (Desktop application or Web).
2. Click **Import** (top left) and select both:
   - `Retail_Management_API.postman_collection.json`
   - `Retail_Management_Local.postman_environment.json`
3. In the top right environment dropdown, select **Retail Management - Local Environment**.
4. Confirm `baseUrl` is set to `http://localhost:8080` (or your configured backend port).

---

## 3. Automated Token Extraction Flow

The collection utilizes Postman collection-level authorization:
- When you execute **`1. Authentication & Security -> Admin Login`**, a test script automatically extracts the issued JWT token from `response.data.token` and stores it into the active environment variable `{{jwt_token}}`.
- All subsequent requests in folders 2 through 8 automatically send:
  ```http
  Authorization: Bearer {{jwt_token}}
  ```
- If switching roles (e.g. testing Cashier or Inventory Staff), run the respective login request to update `{{jwt_token}}`.

---

## 4. Running via CLI with Newman

You can run automated end-to-end integration tests using Newman:

```bash
# Install Newman if not present
npm install -g newman

# Execute full test collection against local server
newman run postman/Retail_Management_API.postman_collection.json \
  -e postman/Retail_Management_Local.postman_environment.json \
  --reporters cli,json \
  --reporter-json-export newman-report.json
```

---

## 5. Pre-Seeded Evaluation Credentials

| Role | Username | Password | Default Permissions |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin` | `admin123` | Full enterprise control, users, stores, inventory, logs |
| **Manager** | `manager` | `manager123` | Store operations, PO approvals, analytics, AI insights |
| **Inventory Staff** | `staff` | `staff123` | Stock in/out, adjustments, warehouse transfers, receipts |
| **Cashier** | `cashier` | `cashier123` | POS checkout, customer invoices, returns |
