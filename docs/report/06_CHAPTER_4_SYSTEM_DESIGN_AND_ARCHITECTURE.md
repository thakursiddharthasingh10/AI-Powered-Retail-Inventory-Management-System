# Chapter 4: System Design & Architecture

---

## 4.1 High-Level Multi-Tier System Architecture

The system follows an enterprise tiered microservice-hybrid architecture designed for horizontal scalability, clear separation of concerns, and fault tolerance:

```mermaid
flowchart TD
    subgraph ClientLayer ["Client Presentation Layer (React 18 + Vite)"]
        SPA["Single Page Application\n(React Router, Axios, Recharts)"]
        AuthContext["Auth Context & Token Interceptor"]
    end

    subgraph GatewayLayer ["Security & Routing Layer"]
        SecurityFilter["JwtAuthenticationFilter"]
        CorsFilter["CorsConfigurationSource"]
    end

    subgraph ServiceLayer ["Enterprise Application Layer (Spring Boot 3.3.4)"]
        Controllers["REST Controllers (OpenAPI 3)"]
        Services["Business Service Layer (@Transactional)"]
        Repos["Spring Data JPA Repositories (Hibernate)"]
    end

    subgraph AITier ["Predictive Analytics Tier (FastAPI)"]
        FastAPIApp["Python 3 FastAPI Microservice"]
        Forecaster["Time-Series Forecasting Engine"]
        SafetyStockCalc["Replenishment Decision Engine"]
    end

    subgraph DataTier ["Data Persistence Layer (MySQL 8.0)"]
        MySQLDB[("MySQL 8.0 InnoDB Database\n(26 Normalized Tables)")]
    end

    SPA --> AuthContext
    AuthContext -->|"HTTPS / JSON"| SecurityFilter
    SecurityFilter --> CorsFilter
    CorsFilter --> Controllers
    Controllers --> Services
    Services --> Repos
    Repos -->|"HikariCP Pool"| MySQLDB
    Services <-->|"HTTP REST Client (with Fallback)"| FastAPIApp
    FastAPIApp --> Forecaster
    FastAPIApp --> SafetyStockCalc
```

---

## 4.2 Use Case Modeling

The system defines four organizational actors interacting with specific functional boundaries:

```mermaid
flowchart LR
    Admin((Administrator))
    Manager((Store Manager))
    Staff((Inventory Staff))
    Cashier((Cashier))

    subgraph SecurityUC ["Security & System Administration"]
        UC1["Manage Users & Roles"]
        UC2["View System Audit Logs"]
        UC3["Manage Store & Warehouses"]
    end

    subgraph InventoryUC ["Catalog & Inventory Control"]
        UC4["Manage Product Catalog"]
        UC5["Record Stock Adjustments"]
        UC6["Execute Inter-Warehouse Transfers"]
    end

    subgraph ProcurementUC ["Procurement & PO"]
        UC7["Create Purchase Orders"]
        UC8["Approve Purchase Orders"]
        UC9["Receive Goods into Stock"]
    end

    subgraph POSUC ["Point of Sale & Billing"]
        UC10["Process POS Checkout"]
        UC11["Process Sales Return"]
    end

    subgraph AnalyticsUC ["Intelligence & Analytics"]
        UC12["View Executive Analytics"]
        UC13["Run AI Demand Forecasting"]
        UC14["Query AI Retail Copilot"]
    end

    Admin --> UC1
    Admin --> UC2
    Admin --> UC3
    Admin --> UC4
    Admin --> UC8
    Admin --> UC12

    Manager --> UC4
    Manager --> UC7
    Manager --> UC8
    Manager --> UC9
    Manager --> UC6
    Manager --> UC12
    Manager --> UC13
    Manager --> UC14

    Staff --> UC5
    Staff --> UC6
    Staff --> UC9
    Staff --> UC14

    Cashier --> UC10
    Cashier --> UC11
    Cashier --> UC14
```

---

## 4.3 Sequence Diagrams

### 4.3.1 POS Sale Checkout & Atomic Stock Deduction

This diagram illustrates the atomic transaction boundary during POS checkout, preventing overselling race conditions:

```mermaid
sequenceDiagram
    autonumber
    actor Cashier
    participant UI as React POS View
    participant API as SaleController
    participant Service as SaleService
    participant InvRepo as InventoryRepository
    participant MovRepo as StockMovementRepository
    participant SaleRepo as SaleRepository
    participant DB as MySQL Database

    Cashier->>UI: Scan Items & Click "Complete Checkout"
    UI->>API: POST /api/v1/sales (SaleRequestDto)
    API->>Service: createSale(request, currentUser)
    
    rect rgb(240, 245, 255)
        note over Service, DB: @Transactional Boundary Begins
        
        loop For Each Cart Item
            Service->>InvRepo: findByProductIdAndWarehouseId(pId, wId)
            InvRepo->>DB: SELECT * FROM inventories WHERE ... FOR UPDATE
            DB-->>InvRepo: Inventory Record (qty=50)
            
            alt Requested Qty > Available Qty
                Service-->>API: throw InsufficientStockException
                API-->>UI: HTTP 400 "Insufficient Stock"
            else Stock Available
                Service->>Service: Deduct Quantity (50 - 2 = 48)
                Service->>InvRepo: save(inventory)
                Service->>MovRepo: save(StockMovement: SALE_DEDUCTION)
            end
        end

        Service->>SaleRepo: save(Sale & SaleItems)
        SaleRepo->>DB: INSERT INTO sales, sale_items
        note over Service, DB: @Transactional Commit & Release Locks
    end

    Service-->>API: Sale Response with Invoice #
    API-->>UI: HTTP 201 Created (Invoice Generated)
    UI-->>Cashier: Display Printable Thermal Invoice
```

---

### 4.3.2 Inter-Warehouse Stock Transfer Sequence

```mermaid
sequenceDiagram
    autonumber
    actor OriginStaff as Origin Staff
    actor DestStaff as Destination Staff
    participant UI as Transfer View
    participant API as StockTransferController
    participant Service as StockTransferService
    participant DB as MySQL Database

    OriginStaff->>UI: Submit Transfer Request (Origin: WH-1, Dest: WH-2, Qty: 20)
    UI->>API: POST /api/v1/transfers
    API->>Service: createTransfer()
    Service->>DB: Verify & Reserve Stock; Save Transfer (STATUS = REQUESTED)
    DB-->>UI: Transfer Created

    OriginStaff->>UI: Click "Dispatch Stock"
    UI->>API: PATCH /api/v1/transfers/{id}/dispatch
    API->>Service: dispatchTransfer()
    Service->>DB: Decrement Origin Stock; Log StockMovement (TRANSFER_OUT); Set STATUS = DISPATCHED
    DB-->>UI: Goods in Transit

    DestStaff->>UI: Click "Receive Stock"
    UI->>API: PATCH /api/v1/transfers/{id}/receive
    API->>Service: receiveTransfer()
    Service->>DB: Increment Destination Stock; Log StockMovement (TRANSFER_IN); Set STATUS = RECEIVED
    DB-->>UI: Transfer Complete
```

---

## 4.4 Activity Diagram: Procurement & Receiving Lifecycle

```mermaid
flowchart TD
    Start([Start]) --> CreatePO[Manager Creates Purchase Order]
    CreatePO --> POStateDraft[Status: DRAFT]
    POStateDraft --> ReviewPO{Manager Approves PO?}
    ReviewPO -- No --> CancelPO[Status: CANCELLED]
    CancelPO --> End([End])
    ReviewPO -- Yes --> ApprovePO[Status: APPROVED]
    ApprovePO --> VendorShip[Supplier Ships Goods]
    VendorShip --> PhysicalArrival[Goods Arrive at Warehouse]
    PhysicalArrival --> QualityInspection{Quality Inspection Passed?}
    QualityInspection -- No --> DisputePO[Record Discrepancy & Return to Vendor]
    DisputePO --> End
    QualityInspection -- Yes --> RecordReceipt[Staff Records Purchase Receipt]
    RecordReceipt --> IncrementStock[Atomic Stock Increment in Destination Warehouse]
    IncrementStock --> LogDoubleEntry[Log StockMovement: PURCHASE_RECEIPT]
    LogDoubleEntry --> POStateReceived[Status: RECEIVED]
    POStateReceived --> UpdateLedger[Update Inventory Valuation & Cost Basis]
    UpdateLedger --> End
```

---

## 4.5 Class Diagram: Domain Model & Service Contracts

```mermaid
classDiagram
    class User {
        +Long id
        +String username
        +String email
        +String password
        +boolean active
        +Set~Role~ roles
    }

    class Role {
        +Long id
        +String name
        +String description
    }

    class Product {
        +Long id
        +String sku
        +String name
        +String barcode
        +BigDecimal costPrice
        +BigDecimal sellingPrice
        +BigDecimal taxRate
        +Integer reorderLevel
        +Category category
    }

    class Inventory {
        +Long id
        +Product product
        +Warehouse warehouse
        +Integer quantity
        +Integer reservedQuantity
        +Long version
    }

    class StockMovement {
        +Long id
        +Product product
        +Warehouse warehouse
        +MovementType movementType
        +Integer quantity
        +Integer balanceBefore
        +Integer balanceAfter
        +LocalDateTime createdAt
    }

    class Sale {
        +Long id
        +String invoiceNumber
        +BigDecimal totalAmount
        +PaymentMethod paymentMethod
        +List~SaleItem~ items
        +User cashier
    }

    class PurchaseOrder {
        +Long id
        +String poNumber
        +Supplier supplier
        +Warehouse warehouse
        +PoStatus status
        +List~PurchaseOrderItem~ items
    }

    User "1" --> "*" Role : assigned
    Product "1" --> "*" Inventory : tracked
    Warehouse "1" --> "*" Inventory : holds
    Product "1" --> "*" StockMovement : logged
    Sale "1" --> "*" SaleItem : contains
    PurchaseOrder "1" --> "*" PurchaseOrderItem : contains
```
