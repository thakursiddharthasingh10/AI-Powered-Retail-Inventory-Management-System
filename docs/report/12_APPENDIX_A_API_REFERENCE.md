# Appendix A: Comprehensive REST API Endpoint Inventory

---

## A.1 Authentication & User Session (`/api/v1/auth`)

| Method | Endpoint | Required Role | Request Body | Response Object |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/auth/login` | Public | `AuthRequest` (`username`, `password`) | `AuthResponse` (`token`, `user`) |
| `GET` | `/api/v1/auth/me` | Authenticated | None | `AuthResponse` (`user` profile) |
| `POST` | `/api/v1/auth/change-password` | Authenticated | `ChangePasswordRequest` | Empty (`success: true`) |
| `POST` | `/api/v1/auth/register` | `ROLE_ADMIN` | `RegisterUserRequest` | Created `User` entity |

---

## A.2 Master Catalog & Categories (`/api/v1/products`, `/api/v1/categories`)

| Method | Endpoint | Required Role | Request Body | Response Object |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/products` | All Roles | Query params (`page`, `size`, `activeOnly`) | Paginated `Page<Product>` |
| `GET` | `/api/v1/products/{id}` | All Roles | Path variable `id` | `Product` details |
| `POST` | `/api/v1/products` | `ADMIN`, `MANAGER` | `ProductRequestDto` | Created `Product` |
| `PUT` | `/api/v1/products/{id}` | `ADMIN`, `MANAGER` | `ProductRequestDto` | Updated `Product` |
| `DELETE`| `/api/v1/products/{id}` | `ADMIN`, `MANAGER` | Path variable `id` | Soft-deactivated `Product` |
| `GET` | `/api/v1/categories` | All Roles | None | List of `Category` |
| `POST` | `/api/v1/categories` | `ADMIN`, `MANAGER` | `CategoryRequestDto` | Created `Category` |

---

## A.3 Multi-Warehouse Inventory (`/api/v1/inventory`)

| Method | Endpoint | Required Role | Request Body | Response Object |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/inventory` | All Roles | Query param `warehouseId` | List of `Inventory` |
| `POST` | `/api/v1/inventory/adjust` | `ADMIN`, `MANAGER`, `STAFF` | `StockAdjustmentRequestDto` | Updated `Inventory` |
| `GET` | `/api/v1/inventory/movements`| All Roles | Query params (`page`, `size`) | Paginated `Page<StockMovement>` |

---

## A.4 Procurement & Purchase Orders (`/api/v1/purchase-orders`, `/api/v1/suppliers`)

| Method | Endpoint | Required Role | Request Body | Response Object |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/suppliers` | All Roles | None | List of `Supplier` |
| `POST` | `/api/v1/suppliers` | `ADMIN`, `MANAGER` | `SupplierRequestDto` | Created `Supplier` |
| `GET` | `/api/v1/purchase-orders` | All Roles | Query param `status` | List of `PurchaseOrder` |
| `POST` | `/api/v1/purchase-orders` | `ADMIN`, `MANAGER` | `PurchaseOrderRequestDto` | Created `PurchaseOrder` |
| `PATCH`| `/api/v1/purchase-orders/{id}/approve` | `ADMIN`, `MANAGER` | Path variable `id` | Approved `PurchaseOrder` |
| `POST` | `/api/v1/purchase-orders/{id}/receive` | `ADMIN`, `MANAGER`, `STAFF` | `PurchaseReceiptRequestDto` | Updated `PurchaseOrder` |

---

## A.5 Point of Sale (POS) & Invoicing (`/api/v1/sales`)

| Method | Endpoint | Required Role | Request Body | Response Object |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/sales` | `ADMIN`, `MANAGER`, `CASHIER` | `SaleRequestDto` | Created `Sale` with invoice |
| `GET` | `/api/v1/sales/{id}` | All Roles | Path variable `id` | Full `Sale` with line items |
| `GET` | `/api/v1/sales` | All Roles | Query params (`page`, `size`) | Paginated `Page<Sale>` |
| `POST` | `/api/v1/sales/returns` | `ADMIN`, `MANAGER`, `CASHIER` | `SalesReturnRequestDto` | Processed `SalesReturn` |

---

## A.6 Inter-Warehouse Transfers (`/api/v1/transfers`)

| Method | Endpoint | Required Role | Request Body | Response Object |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/transfers` | All Roles | None | List of `StockTransfer` |
| `POST` | `/api/v1/transfers` | `ADMIN`, `MANAGER`, `STAFF` | `StockTransferRequestDto` | Created `StockTransfer` |
| `PATCH`| `/api/v1/transfers/{id}/dispatch`| `ADMIN`, `MANAGER`, `STAFF`| Path variable `id` | Dispatched `StockTransfer` |
| `PATCH`| `/api/v1/transfers/{id}/receive` | `ADMIN`, `MANAGER`, `STAFF`| Path variable `id` | Received `StockTransfer` |

---

## A.7 Analytics & Reporting (`/api/v1/reports`)

| Method | Endpoint | Required Role | Query Params | Response Object |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/reports/dashboard-summary` | All Roles | None | `DashboardSummaryDto` |
| `GET` | `/api/v1/reports/low-stock` | All Roles | None | List of low-stock products |
| `GET` | `/api/v1/reports/top-selling` | All Roles | `limit` (default: 5) | Top products ranking |
| `GET` | `/api/v1/reports/sales-analytics` | `ADMIN`, `MANAGER` | `period` (`DAILY`, `MONTHLY`) | Time-series sales revenue |
| `GET` | `/api/v1/reports/inventory-valuation` | `ADMIN`, `MANAGER` | None | Total cost & retail valuation |

---

## A.8 AI Demand Intelligence (`/api/v1/ai`)

| Method | Endpoint | Required Role | Request Body | Response Object |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/ai/health` | Public | None | AI health & capability status |
| `POST` | `/api/v1/ai/forecasts` | `ADMIN`, `MANAGER` | `ForecastRequestDto` | `ForecastResponseDto` |
| `GET` | `/api/v1/ai/reorder-recommendations`| `ADMIN`, `MANAGER`| None | List of `ReorderRecommendationDto` |
| `POST` | `/api/v1/ai/chat` | All Roles | `AiChatRequestDto` | `AiChatResponseDto` |
