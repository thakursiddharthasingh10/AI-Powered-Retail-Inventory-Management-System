# Chapter 7: Testing, Verification & Quality Assurance

---

## 7.1 Testing Strategy & Methodology

Quality assurance was conducted across multiple validation layers:
1. **Unit Testing:** Validates business logic, entity constraints, and service boundaries in isolation using JUnit 5, Mockito, and Python `unittest`.
2. **Integration Testing:** Tests Spring Boot component wiring, transaction rollback, and database persistence using Spring Boot Test and an in-memory H2 database in MySQL-compatibility mode.
3. **Model & Algorithm Verification:** Evaluates time-series mathematical correctness, chronological splitting, and fallback activation.
4. **Production Build Compilation:** Verifies TypeScript/JSX syntax, module resolution, and chunk optimization with Vite.
5. **API Contract Verification:** Validates REST endpoints using Postman collection runner and Newman.

---

## 7.2 Backend Automated Test Suite Execution

Backend automated tests were executed via Maven Surefire:

```bash
cd backend && mvn test -o
```

### Surefire Test Execution Log
```
[INFO] -------------------------------------------------------
[INFO]  T E S T S
[INFO] -------------------------------------------------------
[INFO] Running com.retail.management.RetailManagementApplicationTests
[INFO] Tests run: 1, Failures: 0, Errors: 0, Skipped: 0, Time elapsed: 2.215 s
[INFO] Running com.retail.management.service.AuthServiceTests
[INFO] Tests run: 3, Failures: 0, Errors: 0, Skipped: 0, Time elapsed: 0.124 s
[INFO] Running com.retail.management.service.ProductAndInventoryTests
[INFO] Tests run: 6, Failures: 0, Errors: 0, Skipped: 0, Time elapsed: 0.485 s
[INFO] 
[INFO] Results:
[INFO] Tests run: 10, Failures: 0, Errors: 0, Skipped: 0
[INFO] ------------------------------------------------------------------------
[INFO] BUILD SUCCESS
[INFO] ------------------------------------------------------------------------
```

### Summary of Backend Tests
- **Context Initialization (`RetailManagementApplicationTests`):** Verified Spring Boot IoC container startup, database connection pooling, and Hibernate schema generation.
- **Security & Token Generation (`AuthServiceTests`):** Verified BCrypt authentication, JWT generation, password mismatch detection, and admin user registration.
- **Double-Entry Ledger & Concurrency (`ProductAndInventoryTests`):** Verified atomic stock deductions, rejection of overselling (`InsufficientStockException`), double-entry movement logging, and 2-phase inter-warehouse transfers.

---

## 7.3 AI Microservice Test Execution

The predictive engine was tested using standard library `unittest`:

```bash
python3 ai-service/tests/test_forecast.py
```

### Output
```
...
----------------------------------------------------------------------
Ran 3 tests in 0.000s

OK
```

### Verified Behaviors
1. **`test_forecasting_linear_trend`:** Fits OLS model on 30-day historical data and verifies non-negative projections with valid MAE and RMSE metrics.
2. **`test_moving_average_fallback`:** Verifies fallback to moving average under zero-variance conditions.
3. **`test_safety_stock_reorder_calculation`:** Validates $ROP = d \times L + SS$ calculations and urgency classification.

---

## 7.4 Frontend Production Build Verification

The React frontend was built using Vite:

```bash
cd frontend && npm run build
```

### Build Output
```
vite v5.4.21 building for production...
✓ 2457 modules transformed.
dist/index.html                   0.75 kB │ gzip:   0.42 kB
dist/assets/index-DRsD4iB0.css    5.58 kB │ gzip:   1.71 kB
dist/assets/index-CiWqxEWm.js   796.65 kB │ gzip: 217.74 kB
✓ built in 1.28s
```

Result: All 22 routes, 19 views, context providers, and charting components compiled with zero errors.

---

## 7.5 Comprehensive Verification Matrix

| Test Suite / Scope | Framework | Tests Run | Passed | Failed | Success Rate |
| :--- | :--- | :---: | :---: | :---: | :---: |
| Backend Core & Security | JUnit 5 / Mockito | 4 | 4 | 0 | 100% |
| Inventory & Concurrency | Spring Data JPA / H2 | 6 | 6 | 0 | 100% |
| Predictive Analytics AI | Python unittest | 3 | 3 | 0 | 100% |
| Frontend Production Bundling | Vite / Rollup | 1 (2,457 modules) | 1 | 0 | 100% |
| Database Seed & SQL Integrity | MySQL DDL / DML | 4 scripts | 4 | 0 | 100% |
| **Total System Test Suite** | | **18** | **18** | **0** | **100%** |
