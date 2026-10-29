# RESTful API Specification & Reference Guide

**Base URL:** `http://localhost:8080/api/v1`  
**Interactive Swagger UI:** `http://localhost:8080/swagger-ui.html`  
**OpenAPI Specification:** `http://localhost:8080/v3/api-docs`

---

## 1. Global Request & Response Conventions

### 1.1 Authentication Header
All protected endpoints require a valid JWT Bearer token:
```http
Authorization: Bearer <jwt_token>
```

### 1.2 Standard Unified Response Envelope
Every response from the backend follows a consistent generic envelope `ApiResponse<T>`:

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": { ... },
  "timestamp": "2026-10-26T15:30:00"
}
```

In the event of an error (e.g., validation failure or business logic violation):
```json
{
  "success": false,
  "message": "Insufficient stock for SKU: LAPTOP-DELL-XPS15",
  "data": null,
  "timestamp": "2026-10-26T15:30:00"
}
```

---

## 2. API Endpoints Reference

### 2.1 Authentication & Profile (`/api/v1/auth`)

| Method | Endpoint | Access Role | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/auth/login` | Public | Authenticates credentials; returns JWT token & user object |
| `GET` | `/api/v1/auth/me` | Authenticated | Retrieves profile of currently authenticated user |
| `POST` | `/api/v1/auth/change-password` | Authenticated | Updates current user's BCrypt-hashed password |
| `POST` | `/api/v1/auth/register` | `ROLE_ADMIN` | Admin provisions a new employee user account with roles |

---

### 2.2 Catalog & Categories (`/api/v1/products`, `/api/v1/categories`)

| Method | Endpoint | Access Role | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/products` | All Roles | Lists products with pagination (`page`, `size`, `activeOnly`, `query`) |
| `GET` | `/api/v1/products/{id}` | All Roles | Retrieves full product specification by ID |
| `POST` | `/api/v1/products` | `ADMIN`, `MANAGER` | Creates a new product with unique SKU, barcode, and tax rate |
| `PUT` | `/api/v1/products/{id}` | `ADMIN`, `MANAGER` | Updates product details, pricing, reorder thresholds |
| `DELETE`| `/api/v1/products/{id}` | `ADMIN`, `MANAGER` | Soft-deactivates product (preserves transactional history) |
| `GET` | `/api/v1/categories` | All Roles | Lists product categories |
| `POST` | `/api/v1/categories` | `ADMIN`, `MANAGER` | Creates category with unique code |

---

### 2.3 Multi-Warehouse Inventory (`/api/v1/inventory`)

| Method | Endpoint | Access Role | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/inventory` | All Roles | Retrieves stock levels by warehouse or product |
| `POST` | `/api/v1/inventory/adjust`| `ADMIN`, `MANAGER`, `STAFF` | Records manual stock adjustment (IN/OUT) with reason |
| `GET` | `/api/v1/inventory/movements`| All Roles | Paginated double-entry stock movement ledger audit trail |

---

### 2.4 Procurement & Purchase Orders (`/api/v1/purchase-orders`, `/api/v1/suppliers`)

| Method | Endpoint | Access Role | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/suppliers` | All Roles | Lists active vendors and supplier contact information |
| `POST` | `/api/v1/suppliers` | `ADMIN`, `MANAGER` | Creates vendor profile with tax ID, lead time, and terms |
| `GET` | `/api/v1/purchase-orders` | All Roles | Lists purchase orders with status filter |
| `POST` | `/api/v1/purchase-orders` | `ADMIN`, `MANAGER` | Creates purchase order in `DRAFT` state |
| `PATCH`| `/api/v1/purchase-orders/{id}/approve` | `ADMIN`, `MANAGER` | Approves PO for vendor dispatch |
| `POST` | `/api/v1/purchase-orders/{id}/receive` | `ADMIN`, `MANAGER`, `STAFF` | Records received goods, creates receipt, increments inventory |

---

### 2.5 Point of Sale (POS) & Invoicing (`/api/v1/sales`)

| Method | Endpoint | Access Role | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/sales` | `ADMIN`, `MANAGER`, `CASHIER` | Executes sale, generates invoice, deducts stock atomically |
| `GET` | `/api/v1/sales/{id}` | All Roles | Retrieves invoice breakdown with customer and tax details |
| `GET` | `/api/v1/sales` | All Roles | Lists sales history with date range and status filters |
| `POST` | `/api/v1/sales/returns`| `ADMIN`, `MANAGER`, `CASHIER` | Processes return credit note and restocks inventory if requested |

---

### 2.6 Inter-Warehouse Stock Transfers (`/api/v1/transfers`)

| Method | Endpoint | Access Role | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/transfers` | All Roles | Lists stock transfers between facilities |
| `POST` | `/api/v1/transfers` | `ADMIN`, `MANAGER`, `STAFF` | Creates transfer request (verifies stock availability) |
| `PATCH`| `/api/v1/transfers/{id}/dispatch`| `ADMIN`, `MANAGER`, `STAFF`| Dispatches transfer; decrements origin warehouse |
| `PATCH`| `/api/v1/transfers/{id}/receive` | `ADMIN`, `MANAGER`, `STAFF`| Marks transfer received; increments destination warehouse |

---

### 2.7 Executive Analytics & Reports (`/api/v1/reports`)

| Method | Endpoint | Access Role | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/reports/dashboard-summary` | All Roles | Returns overall metrics (SKU count, stockouts, today's sales)|
| `GET` | `/api/v1/reports/low-stock` | All Roles | Lists all products below reorder thresholds |
| `GET` | `/api/v1/reports/top-selling` | All Roles | Top products ranked by sales volume |
| `GET` | `/api/v1/reports/sales-analytics` | `ADMIN`, `MANAGER` | Time-bucketed sales revenue analytics |
| `GET` | `/api/v1/reports/inventory-valuation` | `ADMIN`, `MANAGER` | Valuation summary (cost basis vs. retail selling potential) |

---

### 2.8 AI Demand Intelligence & Assistant (`/api/v1/ai`)

| Method | Endpoint | Access Role | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/ai/health` | Public / All | Health and capability status of AI subsystem |
| `POST` | `/api/v1/ai/forecasts` | `ADMIN`, `MANAGER` | Multi-day time-series demand forecasting with metrics (MAE, RMSE) |
| `GET` | `/api/v1/ai/reorder-recommendations`| `ADMIN`, `MANAGER` | Lead-time demand & safety stock replenishment recommendations |
| `POST` | `/api/v1/ai/chat` | All Roles | Grounded conversational retail intelligence queries |
