package com.retail.management;

import com.retail.management.dto.*;
import com.retail.management.entity.*;
import com.retail.management.exception.InsufficientStockException;
import com.retail.management.repository.*;
import com.retail.management.service.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("h2")
@Transactional
class ProductAndInventoryTests {

    @Autowired
    private ProductService productService;

    @Autowired
    private InventoryService inventoryService;

    @Autowired
    private SaleService saleService;

    @Autowired
    private StockTransferService stockTransferService;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private WarehouseRepository warehouseRepository;

    @Autowired
    private StoreRepository storeRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private InventoryRepository inventoryRepository;

    @BeforeEach
    void setUpSecurity() {
        User adminUser = userRepository.findByUsername("admin").orElseThrow();
        com.retail.management.security.CustomUserDetails userDetails =
                new com.retail.management.security.CustomUserDetails(adminUser);
        UsernamePasswordAuthenticationToken auth =
                new UsernamePasswordAuthenticationToken(userDetails, null, List.of(new SimpleGrantedAuthority("ROLE_ADMIN")));
        SecurityContextHolder.getContext().setAuthentication(auth);
    }

    @Test
    @DisplayName("Should successfully create a new product and retrieve it")
    void testCreateProduct() {
        ProductDto dto = new ProductDto();
        dto.setCategoryId(1L);
        dto.setSku("SKU-TEST-999");
        dto.setBarcode("8901239999");
        dto.setName("Test Bluetooth Speaker");
        dto.setBrand("TestBrand");
        dto.setUnit("PCS");
        dto.setCostPrice(new BigDecimal("500.00"));
        dto.setSellingPrice(new BigDecimal("999.00"));
        dto.setReorderLevel(10);
        dto.setSafetyStock(5);

        ProductDto saved = productService.createProduct(dto);
        assertNotNull(saved.getId());
        assertEquals("SKU-TEST-999", saved.getSku());

        ProductDto fetched = productService.getProductById(saved.getId());
        assertEquals("Test Bluetooth Speaker", fetched.getName());
    }

    @Test
    @DisplayName("Should adjust inventory and record immutable stock movement ledger")
    void testInventoryAdjustment() {
        Product product = productRepository.findAll().get(0);
        Warehouse warehouse = warehouseRepository.findAll().get(0);

        InventoryAdjustmentRequest req = new InventoryAdjustmentRequest();
        req.setProductId(product.getId());
        req.setWarehouseId(warehouse.getId());
        req.setQuantityChanged(15);
        req.setMovementType("IN");
        req.setReason("Test stock addition");

        StockMovementDto movement = inventoryService.adjustStock(req);
        assertNotNull(movement.getId());
        assertEquals(15, movement.getQuantityChanged());
        assertEquals("IN", movement.getMovementType());
    }

    @Test
    @DisplayName("Should reject inventory adjustment resulting in negative stock")
    void testRejectNegativeStock() {
        Product product = productRepository.findAll().get(0);
        Warehouse warehouse = warehouseRepository.findAll().get(0);

        InventoryAdjustmentRequest req = new InventoryAdjustmentRequest();
        req.setProductId(product.getId());
        req.setWarehouseId(warehouse.getId());
        req.setQuantityChanged(-999999);
        req.setMovementType("OUT");
        req.setReason("Test oversell deduction");

        assertThrows(InsufficientStockException.class, () -> inventoryService.adjustStock(req));
    }

    @Test
    @DisplayName("Should process sale transaction, generate invoice, and deduct stock")
    void testProcessSaleCheckout() {
        Product product = productRepository.findAll().get(0);
        Warehouse warehouse = warehouseRepository.findAll().get(0);
        Store store = storeRepository.findAll().get(0);

        // Ensure sufficient stock
        Inventory inv = inventoryRepository.findWithLockByProductIdAndWarehouseId(product.getId(), warehouse.getId())
                .orElseGet(() -> inventoryRepository.save(new Inventory(product, warehouse, 50)));
        inv.setQuantity(50);
        inventoryRepository.save(inv);

        SaleRequest req = new SaleRequest();
        req.setStoreId(store.getId());
        req.setWarehouseId(warehouse.getId());
        req.setCustomerName("Unit Test Customer");
        req.setCustomerPhone("+91-9876543210");
        req.setPaymentMethod("CARD");
        req.setTaxRate(new BigDecimal("18.00"));
        req.setDiscountAmount(BigDecimal.ZERO);
        req.setItems(List.of(new SaleItemRequest(product.getId(), 2)));

        Sale sale = saleService.processSale(req);

        assertNotNull(sale.getId());
        assertNotNull(sale.getInvoiceNumber());
        assertTrue(sale.getInvoiceNumber().startsWith("INV-"));
        assertEquals("PAID", sale.getPaymentStatus());
        assertEquals(1, sale.getItems().size());

        // Verify stock deducted
        Inventory updatedInv = inventoryRepository.findByProductIdAndWarehouseId(product.getId(), warehouse.getId()).orElseThrow();
        assertEquals(48, updatedInv.getQuantity());
    }

    @Test
    @DisplayName("Should successfully execute inter-warehouse stock transfer lifecycle")
    void testStockTransferLifecycle() {
        List<Warehouse> warehouses = warehouseRepository.findAll();
        Warehouse source = warehouses.get(0);
        Warehouse destination = warehouses.get(1);
        Product product = productRepository.findAll().get(0);

        // Ensure source has 20 units
        Inventory sourceInv = inventoryRepository.findWithLockByProductIdAndWarehouseId(product.getId(), source.getId())
                .orElseGet(() -> inventoryRepository.save(new Inventory(product, source, 20)));
        sourceInv.setQuantity(20);
        inventoryRepository.save(sourceInv);

        // 1. Request transfer
        StockTransferRequest req = new StockTransferRequest();
        req.setSourceWarehouseId(source.getId());
        req.setDestinationWarehouseId(destination.getId());
        req.setNotes("Test inter-warehouse replenishment");
        req.setItems(List.of(new StockTransferRequest.StockTransferItemRequest(product.getId(), 5)));

        StockTransfer transfer = stockTransferService.requestTransfer(req);
        assertEquals("REQUESTED", transfer.getStatus());

        // 2. Approve transfer
        StockTransfer approved = stockTransferService.approveTransfer(transfer.getId());
        assertEquals("APPROVED", approved.getStatus());

        // 3. Dispatch transfer
        StockTransfer dispatched = stockTransferService.dispatchTransfer(approved.getId());
        assertEquals("DISPATCHED", dispatched.getStatus());
        Inventory postDispatchSource = inventoryRepository.findByProductIdAndWarehouseId(product.getId(), source.getId()).orElseThrow();
        assertEquals(15, postDispatchSource.getQuantity()); // 20 - 5 = 15

        // 4. Receive transfer
        StockTransfer received = stockTransferService.receiveTransfer(dispatched.getId());
        assertEquals("RECEIVED", received.getStatus());
    }
}
