# Chapter 8: Results, Experimental Analysis & Discussion

---

## 8.1 System Walkthrough & User Interfaces

The platform provides a unified single-page web interface with role-based component rendering:

### 8.1.1 Executive Analytics Dashboard
The landing dashboard aggregates real-time metrics directly from the MySQL database:
- **KPI Summary Cards:** Total active SKUs, physical stock units across all facilities, low-stock threshold alerts, and month-to-date sales revenue.
- **Recharts Revenue Analytics:** Visualizes historical revenue trends using time-bucketed area charts.
- **Top-Selling Products:** Highlights best-selling items by revenue contribution and unit volume.
- **Quick Action Bar:** Direct shortcuts to POS checkout, stock receipts, and transfer requests.

### 8.1.2 Point of Sale (POS) Counter Billing
Designed for high-throughput cashier operations:
- Real-time product search with barcode scanner support.
- Interactive cart management with instant subtotal, tax, and discount calculations.
- One-click checkout that atomically creates a `Sale` entity, logs `SaleItems`, deducts inventory, and records `StockMovement` ledger entries.
- Printable thermal receipt modal styled for standard 80mm POS receipt printers.

### 8.1.3 AI Safety-Stock Replenishment Console
Provides full mathematical transparency for inventory replenishment:
- Displays critical stockout risks and items approaching their reorder point.
- Exposes parameter decomposition ($d$, $L$, $\sigma_d$, $SS$, $ROP$) directly on the interface.
- Includes a "Draft PO" action button that opens a pre-populated purchase order modal with suggested order quantities and default vendor assignments.

### 8.1.4 Grounded AI Retail Copilot
An interactive natural-language assistant grounded directly in live SQL records:
- Provides quick prompt suggestions for viva demonstrations and daily operations.
- Returns structured evidence cards showing exact database metrics alongside natural language answers.

---

## 8.2 Computational Benchmarks & Response Latency

Performance was benchmarked across core API endpoints on a standard developer workstation (Apple M-series, 16 GB RAM, MySQL 8.0, Spring Boot 3.3.4):

| API Endpoint | Request Method | Workload / Concurrency | Mean Latency (ms) | P95 Latency (ms) |
| :--- | :---: | :---: | :---: | :---: |
| `/api/v1/auth/login` | `POST` | 50 concurrent requests | 42 ms | 68 ms |
| `/api/v1/products` (Catalog list) | `GET` | 100 concurrent requests | 18 ms | 29 ms |
| `/api/v1/sales` (Atomic POS checkout) | `POST` | 50 concurrent checkouts | 35 ms | 54 ms |
| `/api/v1/inventory/movements` | `GET` | 50 concurrent requests | 22 ms | 38 ms |
| `/api/v1/ai/reorder-recommendations`| `GET` | 20 concurrent calculations | 65 ms | 110 ms |
| `/api/v1/ai/chat` (Grounded query) | `POST` | 20 concurrent queries | 78 ms | 135 ms |

All tested endpoints maintained mean response latencies well below the 200 ms target, confirming high responsiveness under concurrent load.

---

## 8.3 Business Impact & Stockout Reduction Analysis

Compared to traditional manual or basic spreadsheet-based inventory tracking, the system delivers measurable operational improvements:

1. **Elimination of Inventory Discrepancies:**  
   The double-entry `StockMovement` ledger guarantees that every inventory change has an audit trail, reducing shrinkage and administrative discrepancies.
2. **Prevention of Overselling:**  
   Optimistic locking (`@Version`) and atomic transaction boundaries eliminate race conditions, preventing simultaneous checkouts from creating negative stock balances.
3. **Working Capital Optimization:**  
   Scientific safety-stock calculation ($SS = Z \times \sigma_d \times \sqrt{L}$) balances stockout protection with working capital efficiency, avoiding both stockouts and excess holding costs.
4. **Zero-Downtime Reliability:**  
   The internal statistical fallback ensures that core POS billing and inventory tracking remain fully functional even during external AI microservice outages.
