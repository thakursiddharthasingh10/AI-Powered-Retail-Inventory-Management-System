package com.retail.management.config;

import com.retail.management.entity.*;
import com.retail.management.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final StoreRepository storeRepository;
    private final WarehouseRepository warehouseRepository;
    private final CategoryRepository categoryRepository;
    private final SupplierRepository supplierRepository;
    private final ProductRepository productRepository;
    private final InventoryRepository inventoryRepository;
    private final StockMovementRepository stockMovementRepository;
    private final PurchaseOrderRepository purchaseOrderRepository;
    private final SaleRepository saleRepository;
    private final SaleItemRepository saleItemRepository;
    private final InvoiceRepository invoiceRepository;
    private final NotificationRepository notificationRepository;
    private final AuditLogRepository auditLogRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(RoleRepository roleRepository,
                           UserRepository userRepository,
                           StoreRepository storeRepository,
                           WarehouseRepository warehouseRepository,
                           CategoryRepository categoryRepository,
                           SupplierRepository supplierRepository,
                           ProductRepository productRepository,
                           InventoryRepository inventoryRepository,
                           StockMovementRepository stockMovementRepository,
                           PurchaseOrderRepository purchaseOrderRepository,
                           SaleRepository saleRepository,
                           SaleItemRepository saleItemRepository,
                           InvoiceRepository invoiceRepository,
                           NotificationRepository notificationRepository,
                           AuditLogRepository auditLogRepository,
                           PasswordEncoder passwordEncoder) {
        this.roleRepository = roleRepository;
        this.userRepository = userRepository;
        this.storeRepository = storeRepository;
        this.warehouseRepository = warehouseRepository;
        this.categoryRepository = categoryRepository;
        this.supplierRepository = supplierRepository;
        this.productRepository = productRepository;
        this.inventoryRepository = inventoryRepository;
        this.stockMovementRepository = stockMovementRepository;
        this.purchaseOrderRepository = purchaseOrderRepository;
        this.saleRepository = saleRepository;
        this.saleItemRepository = saleItemRepository;
        this.invoiceRepository = invoiceRepository;
        this.notificationRepository = notificationRepository;
        this.auditLogRepository = auditLogRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) {
        log.info("Checking database initialization status...");

        // 1. Roles
        Role adminRole = roleRepository.findByName("ROLE_ADMIN")
                .orElseGet(() -> roleRepository.save(new Role("ROLE_ADMIN", "System Administrator")));
        Role managerRole = roleRepository.findByName("ROLE_MANAGER")
                .orElseGet(() -> roleRepository.save(new Role("ROLE_MANAGER", "Store Operations Manager")));
        Role staffRole = roleRepository.findByName("ROLE_INVENTORY_STAFF")
                .orElseGet(() -> roleRepository.save(new Role("ROLE_INVENTORY_STAFF", "Inventory Warehouse Specialist")));
        Role cashierRole = roleRepository.findByName("ROLE_CASHIER")
                .orElseGet(() -> roleRepository.save(new Role("ROLE_CASHIER", "Point of Sale Cashier")));

        // 2. Users
        if (userRepository.count() == 0) {
            log.info("Seeding default application users...");
            String commonPasswordHash = passwordEncoder.encode("Password@123");

            User admin = new User();
            admin.setUsername("admin");
            admin.setEmail("admin@retailcorp.com");
            admin.setFullName("Aarav Sharma (Admin)");
            admin.setPasswordHash(commonPasswordHash);
            admin.setPhone("+91-9876543210");
            admin.setRoles(Set.of(adminRole, managerRole));
            userRepository.save(admin);

            User manager = new User();
            manager.setUsername("manager");
            manager.setEmail("manager.delhi@retailcorp.com");
            manager.setFullName("Priya Patel (Store Manager)");
            manager.setPasswordHash(commonPasswordHash);
            manager.setPhone("+91-9876543211");
            manager.setRoles(Set.of(managerRole));
            userRepository.save(manager);

            User staff = new User();
            staff.setUsername("staff");
            staff.setEmail("staff.cdc@retailcorp.com");
            staff.setFullName("Rohan Gupta (Inventory Lead)");
            staff.setPasswordHash(commonPasswordHash);
            staff.setPhone("+91-9876543212");
            staff.setRoles(Set.of(staffRole));
            userRepository.save(staff);

            User inventory = new User();
            inventory.setUsername("inventory");
            inventory.setEmail("inventory@retailcorp.com");
            inventory.setFullName("Rohan Gupta (Inventory Staff)");
            inventory.setPasswordHash(commonPasswordHash);
            inventory.setPhone("+91-9876543214");
            inventory.setRoles(Set.of(staffRole));
            userRepository.save(inventory);

            User cashier = new User();
            cashier.setUsername("cashier");
            cashier.setEmail("cashier.pos1@retailcorp.com");
            cashier.setFullName("Neha Verma (POS Cashier)");
            cashier.setPasswordHash(commonPasswordHash);
            cashier.setPhone("+91-9876543213");
            cashier.setRoles(Set.of(cashierRole));
            userRepository.save(cashier);
        }

        // 3. Stores & Warehouses
        Store store1;
        if (storeRepository.count() == 0) {
            log.info("Seeding retail stores and warehouses...");
            store1 = new Store();
            store1.setCode("STR-DEL-01");
            store1.setName("Delhi Flagship MegaStore");
            store1.setAddress("Sector 18, Connaught Place");
            store1.setCity("New Delhi");
            store1.setState("Delhi");
            store1.setPhone("+91-11-23456789");
            storeRepository.save(store1);

            Store store2 = new Store();
            store2.setCode("STR-NOI-02");
            store2.setName("Noida CyberCity Hub");
            store2.setAddress("Plot 4, Sector 62");
            store2.setCity("Noida");
            store2.setState("Uttar Pradesh");
            store2.setPhone("+91-120-4567890");
            storeRepository.save(store2);
        } else {
            store1 = storeRepository.findAll().get(0);
        }

        Warehouse whCDC, whRetail;
        if (warehouseRepository.count() == 0) {
            whCDC = new Warehouse();
            whCDC.setCode("WH-CDC-01");
            whCDC.setName("Central Distribution Center (CDC)");
            whCDC.setLocation("Okhla Industrial Area Phase-III, New Delhi");
            whCDC.setStore(store1);
            whCDC.setCapacity(50000);
            warehouseRepository.save(whCDC);

            whRetail = new Warehouse();
            whRetail.setCode("WH-RET-01");
            whRetail.setName("Store Floor Warehouse Delhi");
            whRetail.setLocation("Connaught Place Backroom, New Delhi");
            whRetail.setStore(store1);
            whRetail.setCapacity(8000);
            warehouseRepository.save(whRetail);

            Warehouse whNoida = new Warehouse();
            whNoida.setCode("WH-NOI-01");
            whNoida.setName("Noida Fulfillment Warehouse");
            whNoida.setLocation("Sector 62 Basement Bay, Noida");
            whNoida.setCapacity(12000);
            warehouseRepository.save(whNoida);
        } else {
            List<Warehouse> whs = warehouseRepository.findAll();
            whCDC = whs.get(0);
            whRetail = whs.size() > 1 ? whs.get(1) : whCDC;
        }

        // 4. Categories
        if (categoryRepository.count() == 0) {
            log.info("Seeding product categories...");
            categoryRepository.save(new Category("CAT-ELEC", "Consumer Electronics", "Smartphones, audio, smart watches, accessories"));
            categoryRepository.save(new Category("CAT-GROC", "Packaged Groceries", "Packaged organic foods, beverages, grains"));
            categoryRepository.save(new Category("CAT-APPR", "Apparel & Fashion", "Men, women, and kids apparel & activewear"));
            categoryRepository.save(new Category("CAT-HOME", "Home & Kitchen Appliances", "Blenders, electric kettles, cookware, storage"));
            categoryRepository.save(new Category("CAT-CARE", "Personal Care & Wellness", "Skin care, hair care, grooming essentials"));
        }

        // 5. Suppliers
        Supplier supTech, supAgro;
        if (supplierRepository.count() == 0) {
            log.info("Seeding suppliers...");
            supTech = new Supplier();
            supTech.setCode("SUP-TECH");
            supTech.setName("Zenith Tech Distributors Ltd");
            supTech.setContactPerson("Rajesh Malhotra");
            supTech.setEmail("orders@zenithtech.in");
            supTech.setPhone("+91-9811002233");
            supTech.setAddress("Nehru Place, New Delhi");
            supTech.setLeadTimeDays(3);
            supplierRepository.save(supTech);

            supAgro = new Supplier();
            supAgro.setCode("SUP-AGRO");
            supAgro.setName("GreenEarth Organics & Agro Corp");
            supAgro.setContactPerson("Sunita Rao");
            supAgro.setEmail("procurement@greenearth.com");
            supAgro.setPhone("+91-9822334455");
            supAgro.setAddress("Karnal Industrial Area, Haryana");
            supAgro.setLeadTimeDays(2);
            supplierRepository.save(supAgro);
        } else {
            List<Supplier> sups = supplierRepository.findAll();
            supTech = sups.get(0);
            supAgro = sups.size() > 1 ? sups.get(1) : supTech;
        }

        // 6. Products
        if (productRepository.count() == 0) {
            log.info("Seeding catalog products...");
            Category catElec = categoryRepository.findByCode("CAT-ELEC").orElse(null);
            Category catGroc = categoryRepository.findByCode("CAT-GROC").orElse(null);
            Category catAppr = categoryRepository.findByCode("CAT-APPR").orElse(null);
            Category catHome = categoryRepository.findByCode("CAT-HOME").orElse(null);
            Category catCare = categoryRepository.findByCode("CAT-CARE").orElse(null);

            Product p1 = createProduct("SKU-ELEC-001", "8901234001", "Wireless Noise-Canceling Headphones", "SoundMaster", catElec, new BigDecimal("2200.00"), new BigDecimal("3999.00"), 15, 5);
            Product p2 = createProduct("SKU-ELEC-002", "8901234002", "Fast Charging Power Bank 20000mAh", "PowerGrid", catElec, new BigDecimal("850.00"), new BigDecimal("1699.00"), 20, 8);
            Product p3 = createProduct("SKU-ELEC-003", "8901234003", "Smart Fitness Watch Series 5", "PulseFit", catElec, new BigDecimal("1800.00"), new BigDecimal("3299.00"), 12, 5);
            Product p4 = createProduct("SKU-GROC-001", "8901234004", "Organic Royal Basmati Rice 5kg", "NaturePurity", catGroc, new BigDecimal("480.00"), new BigDecimal("699.00"), 30, 10);
            Product p5 = createProduct("SKU-GROC-002", "8901234005", "Cold Pressed Virgin Coconut Oil 1L", "NaturePurity", catGroc, new BigDecimal("280.00"), new BigDecimal("420.00"), 25, 8);
            Product p6 = createProduct("SKU-GROC-003", "8901234006", "Premium California Almonds 500g", "NutriBites", catGroc, new BigDecimal("350.00"), new BigDecimal("549.00"), 20, 5);
            Product p7 = createProduct("SKU-APPR-001", "8901234007", "Classic Crewneck Cotton T-Shirt", "UrbanThread", catAppr, new BigDecimal("220.00"), new BigDecimal("599.00"), 40, 15);
            Product p8 = createProduct("SKU-APPR-002", "8901234008", "Slim-Fit Stretch Denim Jeans", "UrbanThread", catAppr, new BigDecimal("650.00"), new BigDecimal("1499.00"), 25, 10);
            Product p9 = createProduct("SKU-HOME-001", "8901234009", "Stainless Steel Electric Kettle 1.8L", "KitchenPro", catHome, new BigDecimal("520.00"), new BigDecimal("999.00"), 15, 5);
            Product p10 = createProduct("SKU-HOME-002", "8901234010", "High-Speed 3-Jar Mixer Grinder 750W", "KitchenPro", catHome, new BigDecimal("1650.00"), new BigDecimal("2899.00"), 10, 4);
            Product p11 = createProduct("SKU-CARE-001", "8901234011", "Herbal Aloe Vera Hydrating Gel 250ml", "Botanica", catCare, new BigDecimal("110.00"), new BigDecimal("249.00"), 30, 10);
            Product p12 = createProduct("SKU-CARE-002", "8901234012", "Argan Oil Anti-Hairfall Shampoo 300ml", "Botanica", catCare, new BigDecimal("190.00"), new BigDecimal("399.00"), 25, 8);

            // 7. Inventory Allocation
            log.info("Allocating stock across warehouses...");
            createStock(p1, whCDC, 45); createStock(p1, whRetail, 8); // Low stock in retail!
            createStock(p2, whCDC, 80); createStock(p2, whRetail, 18);
            createStock(p3, whCDC, 25); createStock(p3, whRetail, 4); // Low stock in retail!
            createStock(p4, whCDC, 120); createStock(p4, whRetail, 35);
            createStock(p5, whCDC, 90); createStock(p5, whRetail, 22);
            createStock(p6, whCDC, 65); createStock(p6, whRetail, 12);
            createStock(p7, whCDC, 150); createStock(p7, whRetail, 45);
            createStock(p8, whCDC, 85); createStock(p8, whRetail, 20);
            createStock(p9, whCDC, 35); createStock(p9, whRetail, 5); // Low stock in retail!
            createStock(p10, whCDC, 22); createStock(p10, whRetail, 2); // Critical low stock!
            createStock(p11, whCDC, 140); createStock(p11, whRetail, 28);
            createStock(p12, whCDC, 75); createStock(p12, whRetail, 15);

            // 8. Notifications & Audit Logs
            notificationRepository.save(new Notification("Low Stock Alert: Headphones", "Wireless Noise-Canceling Headphones is at 8 units in Retail Delhi (Reorder level: 15)", "LOW_STOCK", "ROLE_MANAGER"));
            notificationRepository.save(new Notification("Critical Low Stock: Mixer Grinder", "High-Speed Mixer Grinder is at 2 units in Retail Delhi (Reorder level: 10)", "LOW_STOCK", "ROLE_MANAGER"));
            auditLogRepository.save(new AuditLog("system", "INITIALIZE", "SYSTEM", "0", "System initialized with baseline products, inventory, and users", "127.0.0.1"));

            // 9. Historical Sales for AI Demand Forecasting
            log.info("Generating multi-day historical sales records for AI intelligence...");
            User cashier = userRepository.findByUsername("cashier").orElse(null);
            for (int i = 30; i >= 1; i--) {
                LocalDateTime saleTime = LocalDateTime.now().minusDays(i).withHour(14).withMinute(30);
                Sale s = new Sale();
                s.setStore(store1);
                s.setWarehouse(whRetail);
                s.setInvoiceNumber("INV-202610-" + String.format("%04d", 31 - i));
                s.setCashierUser(cashier);
                s.setCustomerName("Walk-in Customer " + (31 - i));
                s.setPaymentMethod(i % 3 == 0 ? "CARD" : (i % 2 == 0 ? "UPI" : "CASH"));
                s.setPaymentStatus("PAID");
                s.setSaleDate(saleTime);
                s.setTaxRate(new BigDecimal("18.00"));

                // Varying items sold
                int qty1 = 1 + (i % 3);
                int qty2 = (i % 4 == 0) ? 2 : 1;
                BigDecimal item1Total = p1.getSellingPrice().multiply(BigDecimal.valueOf(qty1));
                BigDecimal item2Total = p2.getSellingPrice().multiply(BigDecimal.valueOf(qty2));
                BigDecimal sub = item1Total.add(item2Total);
                BigDecimal tax = sub.multiply(new BigDecimal("0.18"));
                BigDecimal tot = sub.add(tax);

                s.setSubtotal(sub);
                s.setTaxAmount(tax);
                s.setDiscountAmount(BigDecimal.ZERO);
                s.setTotalAmount(tot);
                saleRepository.save(s);

                SaleItem si1 = new SaleItem();
                si1.setSale(s);
                si1.setProduct(p1);
                si1.setProductNameSnapshot(p1.getName());
                si1.setSkuSnapshot(p1.getSku());
                si1.setQuantity(qty1);
                si1.setUnitCostSnapshot(p1.getCostPrice());
                si1.setUnitPriceSnapshot(p1.getSellingPrice());
                si1.setTaxRateSnapshot(new BigDecimal("18.00"));
                si1.setSubtotal(item1Total);
                saleItemRepository.save(si1);

                SaleItem si2 = new SaleItem();
                si2.setSale(s);
                si2.setProduct(p2);
                si2.setProductNameSnapshot(p2.getName());
                si2.setSkuSnapshot(p2.getSku());
                si2.setQuantity(qty2);
                si2.setUnitCostSnapshot(p2.getCostPrice());
                si2.setUnitPriceSnapshot(p2.getSellingPrice());
                si2.setTaxRateSnapshot(new BigDecimal("18.00"));
                si2.setSubtotal(item2Total);
                saleItemRepository.save(si2);

                Invoice inv = new Invoice();
                inv.setSale(s);
                inv.setInvoiceNumber(s.getInvoiceNumber());
                inv.setIssueDate(saleTime);
                inv.setPdfUrl("/invoices/" + s.getInvoiceNumber() + ".pdf");
                inv.setQrCodeData("RETAIL|" + s.getInvoiceNumber() + "|" + tot + "|" + s.getPaymentMethod());
                invoiceRepository.save(inv);
            }
        }

        log.info("Database initialization completed successfully.");
    }

    private Product createProduct(String sku, String barcode, String name, String brand, Category category,
                                  BigDecimal costPrice, BigDecimal sellingPrice, Integer reorderLevel, Integer safetyStock) {
        Product p = new Product();
        p.setSku(sku);
        p.setBarcode(barcode);
        p.setName(name);
        p.setBrand(brand);
        p.setCategory(category);
        p.setCostPrice(costPrice);
        p.setSellingPrice(sellingPrice);
        p.setReorderLevel(reorderLevel);
        p.setSafetyStock(safetyStock);
        p.setUnit("PCS");
        p.setIsActive(true);
        return productRepository.save(p);
    }

    private void createStock(Product p, Warehouse w, Integer qty) {
        Inventory inv = new Inventory(p, w, qty);
        inventoryRepository.save(inv);
        stockMovementRepository.save(new StockMovement(
                p, w, "IN", qty, qty, "INITIAL_SETUP", 0L, "Initial stock allocation", null));
    }
}
