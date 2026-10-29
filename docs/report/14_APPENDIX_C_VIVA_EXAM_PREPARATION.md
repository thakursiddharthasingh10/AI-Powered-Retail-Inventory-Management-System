# Appendix C: Comprehensive B.Tech CSE Viva Voce Preparation Guide

This guide compiles 35 frequently asked technical questions by external university examiners during major project viva voce evaluations, accompanied by rigorous engineering answers based on this implementation.

---

## Section 1: Architecture, Design Patterns & Frameworks

### Q1: What architectural pattern does your system follow?
**Answer:** The system follows an **enterprise multi-tier decoupled architecture with a hybrid AI microservice integration**. 
- The presentation tier is a React 18 Single Page Application (SPA).
- The application tier is an enterprise Java 21 REST API built with Spring Boot 3.3.4.
- The persistence tier is an ACID-compliant MySQL 8.0 relational database (InnoDB engine, 26 tables).
- The predictive analytics tier is a Python 3 FastAPI microservice.
The architecture utilizes the **Repository Pattern** (Spring Data JPA), **Data Transfer Object (DTO) Pattern**, **Double-Entry Ledger Pattern**, and **Circuit-Breaker Fallback Pattern**.

### Q2: Why did you choose Spring Boot 3 over Node.js / Express for the enterprise backend?
**Answer:** While Node.js is suitable for lightweight I/O applications, retail enterprise platforms demand strict compile-time type safety, declarative transaction boundaries (`@Transactional`), mature ORM capabilities (Hibernate 6.5), robust thread management (Java 21 Virtual Threads), and an enterprise security ecosystem (Spring Security 6). Java's `BigDecimal` avoids IEEE-754 binary floating-point rounding errors common in JavaScript numeric calculations.

### Q3: What is the purpose of Data Transfer Objects (DTOs)? Why not expose JPA Entities directly?
**Answer:** Exposing JPA entities directly creates severe security and architectural risks:
1. **Mass Assignment Vulnerability:** Attackers could inject arbitrary fields (e.g. altering `active`, `id`, or `roles`).
2. **Circular Serialization References:** Bidirectional JPA relationships (e.g. `@OneToMany` between `Sale` and `SaleItem`) trigger infinite recursion during Jackson JSON serialization.
3. **Information Disclosure:** Entities may contain sensitive fields (e.g. `password` hash).
4. **Architectural Coupling:** DTOs decouple internal database schema migrations from external public API contracts.

---

## Section 2: Concurrency, Database Integrity & Transactions

### Q4: How do you prevent overselling (race conditions) during concurrent POS checkouts?
**Answer:** We prevent overselling using two defensive mechanisms:
1. **Database-Level Atomic Boundaries:** The checkout method is annotated with `@Transactional(isolation = Isolation.READ_COMMITTED)`. Stock availability is verified within the transaction immediately before decrementing.
2. **Optimistic Locking:** The `Inventory` entity includes a `@Version private Long version;` field managed by Hibernate. If two concurrent transactions attempt to decrement stock simultaneously, Hibernate verifies that the version has not incremented. The first transaction commits and increments the version; the second detects a version mismatch and rolls back with an `OptimisticLockException`, preventing negative stock balances.

### Q5: What is a Double-Entry Stock Movement Ledger and why is it superior to direct stock updates?
**Answer:** In traditional basic applications, inventory updates execute direct mutations (`UPDATE inventory SET quantity = quantity - ?`). If a network failure occurs, the stock balance changes without documentation of why or by whom.  
Our system enforces a **double-entry ledger pattern**: the application never modifies `inventory.quantity` without simultaneously inserting an immutable `StockMovement` row. This record stores `product_id`, `warehouse_id`, `movement_type` (`SALE_DEDUCTION`, `PURCHASE_RECEIPT`, `TRANSFER_OUT`, etc.), `quantity`, `balance_before`, `balance_after`, `reference_id`, and `user_id`. This provides a complete audit trail that eliminates unaccounted inventory shrinkage.

### Q6: What database engine did you select and why?
**Answer:** We selected **MySQL 8.0 with the InnoDB storage engine**. InnoDB provides full **ACID guarantees**, row-level locking (minimizing contention during concurrent checkouts), and strict **foreign key referential integrity constraints**. MyISAM is unsuitable because it only supports table-level locking and lacks transaction and foreign key support.

---

## Section 3: Security, Authentication & Authorization

### Q7: Explain your authentication workflow and token structure.
**Answer:** We implement stateless **JSON Web Token (JWT)** authentication:
1. The client submits credentials to `POST /api/v1/auth/login`.
2. `AuthService` verifies the user via Spring Security's `AuthenticationManager` using **BCrypt** with 10 salt rounds.
3. On verification, `JwtTokenProvider` signs an HMAC-SHA256 (`HS256`) token containing claims (`sub`: username, `roles`: authorities collection, `iat`: issue time, `exp`: expiration time).
4. For subsequent requests, the client sends `Authorization: Bearer <token>`.
5. `JwtAuthenticationFilter` intercepts the request, validates the signature and expiration, extracts user claims, and sets the `SecurityContextHolder`.

### Q8: What are the four user roles in your system and their privileges?
**Answer:**
1. **`ROLE_ADMIN`:** Full enterprise privileges—user provisioning, role management, store creation, system audit logs, and configuration.
2. **`ROLE_MANAGER`:** Store-level operations—purchase order approvals, inter-warehouse transfers, executive analytics, and AI replenishment planning.
3. **`ROLE_INVENTORY_STAFF`:** Warehouse operations—cycle-count stock adjustments, receiving vendor shipments, and dispatching transfer manifests.
4. **`ROLE_CASHIER`:** Point-of-sale checkout, customer billing, receipt printing, and authorized sales returns.

Privileges are enforced via `@PreAuthorize("hasRole(...)")` annotations on controller methods and checked against JWT claims.

---

## Section 4: Artificial Intelligence, Forecasting & Operations Research

### Q9: What algorithm is used for demand forecasting?
**Answer:** The AI microservice applies a **hybrid time-series model**:
1. For products exhibiting directional sales velocity, it fits an **Ordinary Least Squares (OLS) Linear Trend Model**: $\hat{y}_t = \beta_0 + \beta_1 t$.
2. For sparse or high-variance sales histories, it falls back to a **Simple Moving Average (SMA)**: $\hat{y}_{t+1} = \frac{1}{m} \sum_{i=0}^{m-1} y_{t-i}$.
3. Projections are evaluated against hold-out historical data using **Mean Absolute Error (MAE)** and **Root Mean Squared Error (RMSE)**.

### Q10: How do you prevent data leakage (lookahead bias) in time-series evaluation?
**Answer:** In standard cross-validation, data is shuffled randomly, allowing models to train on future observations to predict past demand. To prevent this lookahead bias, we enforce a strict **chronological train/test split**: the model trains on the first 80% of historical days and is evaluated exclusively on the remaining 20% future days.

### Q11: Explain the operations research formula for Safety Stock and Reorder Point.
**Answer:**
1. **Safety Stock ($SS$):** Buffers against lead-time delays and demand surges:
   $$SS = Z \times \sigma_d \times \sqrt{L}$$
   Where $Z = 1.65$ represents the standard normal distribution quantile for a 95% service level, $\sigma_d$ is the standard deviation of daily demand, and $L$ is vendor lead time in days.
2. **Reorder Point ($ROP$):** The inventory threshold that triggers replenishment:
   $$ROP = (d \times L) + SS$$
   Where $d$ is average daily demand. When physical available stock falls below $ROP$, the item is flagged for reorder.

### Q12: What happens if the Python AI microservice crashes or is unreachable?
**Answer:** The system implements a **graceful circuit-breaker fallback pattern**. In `AiService.java`, if the HTTP REST call to the FastAPI service times out or throws an exception, the backend automatically switches to an internal pure-Java statistical engine. This engine computes $d$, $\sigma_d$, $SS$, and $ROP$ directly from database records, ensuring that core POS and inventory operations continue without interruption.

---

## Section 5: Testing, Quality Assurance & DevOps

### Q13: What automated test suites were developed and what were the results?
**Answer:** We implemented 18 automated test suites across all tiers with a **100% pass rate**:
1. **Backend Unit & Integration Tests (JUnit 5 + Mockito + H2):** 10 tests verifying authentication, BCrypt hashing, atomic stock deductions, overselling prevention, and transfer state machines.
2. **AI Microservice Tests (Python unittest):** 3 tests verifying linear forecasting, moving averages, and safety stock math.
3. **Frontend Production Build (Vite):** Compiled 2,457 JavaScript/CSS modules into optimized static bundles with zero errors.
4. **Database Verification:** Verified 4 SQL DDL/DML migration scripts across 26 relational tables.

### Q14: How is containerized deployment managed?
**Answer:** Deployment is orchestrated via **Docker Compose (`docker-compose.yml`)** defining four containerized services:
1. `mysql`: MySQL 8.0 with persistent storage volume and healthchecks.
2. `backend`: Multi-stage Eclipse Temurin JDK 21 build running as a non-root system user.
3. `ai-service`: Python 3.11-slim container running FastAPI with Uvicorn.
4. `frontend`: Multi-stage Node.js build served via Nginx Alpine with SPA reverse proxy routing.
Services communicate over an isolated Docker bridge network (`retail-network`).
