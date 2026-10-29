# Chapter 5: Implementation Details & Software Engineering

---

## 5.1 Backend Engineering with Java 21 & Spring Boot 3.3.4

The backend architecture is structured around clean domain-driven layering:

```
backend/src/main/java/com/retail/management/
├── config/             # SecurityConfig, OpenAPI/Swagger configuration
├── controller/         # 14 REST Controllers exposing unified ApiResponse<T>
├── dto/                # 21 Validated Request/Response Data Transfer Objects
├── entity/             # 25 Normalized JPA Domain Entities
├── exception/          # GlobalExceptionHandler & custom domain exceptions
├── repository/         # 22 Spring Data JPA Repositories
├── security/           # JWT Provider, Auth Filter, UserDetailsService
└── service/            # Transactional Business Services & AI Fallback
```

### 5.1.1 Entity Modeling & Validation
Entities represent relational tables with strict type safety. For example, financial fields use `java.math.BigDecimal` to prevent floating-point rounding errors:

```java
@Entity
@Table(name = "products")
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String sku;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal sellingPrice;

    @Column(nullable = false)
    private Integer reorderLevel;
    // ... getters, setters
}
```

---

## 5.2 Security & Authentication Architecture

The security perimeter is defined in `SecurityConfig.java` utilizing Spring Security 6:

```java
@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        return http
            .csrf(AbstractHttpConfigurer::disable)
            .cors(Customizer.withDefaults())
            .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/v1/auth/login", "/api/v1/ai/health").permitAll()
                .requestMatchers("/swagger-ui/**", "/v3/api-docs/**").permitAll()
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
            .build();
    }
}
```

### 5.2.1 JWT Verification Pipeline
1. Incoming HTTP requests pass through `JwtAuthenticationFilter`.
2. The filter extracts the Bearer token from the `Authorization` header.
3. `JwtTokenProvider` validates the HMAC-SHA256 signature and checks expiration.
4. Extracted roles and user identity are populated into the thread-local `SecurityContextHolder`.

---

## 5.3 Double-Entry Stock Movement Ledger Implementation

In compliance with enterprise ERP accounting standards, inventory balances are never directly updated without a corresponding ledger entry:

```java
@Transactional
public Inventory adjustStock(StockAdjustmentRequestDto request, User user) {
    Inventory inventory = inventoryRepository
        .findByProductIdAndWarehouseId(request.getProductId(), request.getWarehouseId())
        .orElseThrow(() -> new ResourceNotFoundException("Inventory record not found"));

    int balanceBefore = inventory.getQuantity();
    int balanceAfter;

    if (request.getMovementType() == MovementType.ADJUSTMENT_IN) {
        balanceAfter = balanceBefore + request.getQuantity();
    } else {
        if (balanceBefore < request.getQuantity()) {
            throw new InsufficientStockException("Cannot adjust stock below zero");
        }
        balanceAfter = balanceBefore - request.getQuantity();
    }

    inventory.setQuantity(balanceAfter);
    inventoryRepository.save(inventory);

    // Immutable double-entry ledger entry
    StockMovement movement = new StockMovement();
    movement.setProduct(inventory.getProduct());
    movement.setWarehouse(inventory.getWarehouse());
    movement.setMovementType(request.getMovementType());
    movement.setQuantity(request.getQuantity());
    movement.setBalanceBefore(balanceBefore);
    movement.setBalanceAfter(balanceAfter);
    movement.setReason(request.getReason());
    movement.setUser(user);
    stockMovementRepository.save(movement);

    return inventory;
}
```

---

## 5.4 Concurrency Control & Overselling Prevention

To protect against race conditions during peak checkout:
1. **Optimistic Locking:** The `Inventory` entity includes a `@Version private Long version;` field. If two transactions attempt to update the same inventory record concurrently, the second transaction detects a version conflict and triggers a retry or clean rejection.
2. **Transaction Isolation:** The checkout method is annotated with `@Transactional(isolation = Isolation.READ_COMMITTED)`. Stock availability is verified immediately before decrementing, ensuring atomic operations.

---

## 5.5 Frontend Client Engineering (React 18 & Vite)

The frontend client utilizes modern React idioms:
- **Centralized Authentication Context (`AuthContext.jsx`):** Maintains login state, decodes JWT claims, and injects Bearer tokens into Axios request headers.
- **Axios Response Interceptors (`api.js`):** Intercepts HTTP 401 Unauthorized responses to clear stale tokens and redirect to the login interface.
- **Route Authorization (`ProtectedRoute.jsx`):** Evaluates user roles prior to component rendering. Unauthorized navigation renders `AccessDenied.jsx` (HTTP 403).
- **Thermal Invoice Printing (`POS.jsx`):** Utilizes standard CSS `@media print` rules to output clean, 80mm-width thermal receipts directly to physical or virtual receipt printers.
