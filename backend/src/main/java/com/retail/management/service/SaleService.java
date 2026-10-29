package com.retail.management.service;

import com.retail.management.dto.SaleItemRequest;
import com.retail.management.dto.SaleRequest;
import com.retail.management.dto.SalesReturnRequest;
import com.retail.management.entity.*;
import com.retail.management.exception.BadRequestException;
import com.retail.management.exception.InsufficientStockException;
import com.retail.management.exception.ResourceNotFoundException;
import com.retail.management.repository.*;
import com.retail.management.security.SecurityUtils;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

@Service
public class SaleService {

    private final SaleRepository saleRepository;
    private final SaleItemRepository saleItemRepository;
    private final InvoiceRepository invoiceRepository;
    private final SalesReturnRepository salesReturnRepository;
    private final StoreRepository storeRepository;
    private final WarehouseRepository warehouseRepository;
    private final ProductRepository productRepository;
    private final InventoryRepository inventoryRepository;
    private final StockMovementRepository stockMovementRepository;
    private final CustomerRepository customerRepository;
    private final NotificationRepository notificationRepository;
    private final AuditLogService auditLogService;

    public SaleService(SaleRepository saleRepository,
                       SaleItemRepository saleItemRepository,
                       InvoiceRepository invoiceRepository,
                       SalesReturnRepository salesReturnRepository,
                       StoreRepository storeRepository,
                       WarehouseRepository warehouseRepository,
                       ProductRepository productRepository,
                       InventoryRepository inventoryRepository,
                       StockMovementRepository stockMovementRepository,
                       CustomerRepository customerRepository,
                       NotificationRepository notificationRepository,
                       AuditLogService auditLogService) {
        this.saleRepository = saleRepository;
        this.saleItemRepository = saleItemRepository;
        this.invoiceRepository = invoiceRepository;
        this.salesReturnRepository = salesReturnRepository;
        this.storeRepository = storeRepository;
        this.warehouseRepository = warehouseRepository;
        this.productRepository = productRepository;
        this.inventoryRepository = inventoryRepository;
        this.stockMovementRepository = stockMovementRepository;
        this.customerRepository = customerRepository;
        this.notificationRepository = notificationRepository;
        this.auditLogService = auditLogService;
    }

    public Page<Sale> getAllSales(Pageable pageable) {
        return saleRepository.findAllByOrderBySaleDateDesc(pageable);
    }

    public Sale getSaleById(Long id) {
        return saleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Sale not found with id: " + id));
    }

    public Sale getSaleByInvoiceNumber(String invoiceNumber) {
        return saleRepository.findByInvoiceNumber(invoiceNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice not found: " + invoiceNumber));
    }

    @Transactional
    public Sale processSale(SaleRequest request) {
        Store store = storeRepository.findById(request.getStoreId())
                .orElseThrow(() -> new ResourceNotFoundException("Store not found: " + request.getStoreId()));

        Warehouse warehouse = warehouseRepository.findById(request.getWarehouseId())
                .orElseThrow(() -> new ResourceNotFoundException("Warehouse not found: " + request.getWarehouseId()));

        User cashier = SecurityUtils.getCurrentUser();
        String invoiceNumber = "INV-" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd")) +
                "-" + String.format("%04d", (System.currentTimeMillis() % 10000));

        Sale sale = new Sale();
        sale.setStore(store);
        sale.setWarehouse(warehouse);
        sale.setInvoiceNumber(invoiceNumber);
        sale.setCashierUser(cashier);
        sale.setCustomerName(request.getCustomerName() != null ? request.getCustomerName() : "Walk-in Customer");
        sale.setCustomerPhone(request.getCustomerPhone());
        sale.setPaymentMethod(request.getPaymentMethod() != null ? request.getPaymentMethod() : "CASH");
        sale.setPaymentStatus("PAID");
        sale.setSaleDate(LocalDateTime.now());

        if (request.getCustomerId() != null) {
            customerRepository.findById(request.getCustomerId()).ifPresent(sale::setCustomer);
        }

        BigDecimal subtotal = BigDecimal.ZERO;
        List<SaleItem> saleItems = new ArrayList<>();

        // Lock and validate all stock before deducting
        for (SaleItemRequest itemReq : request.getItems()) {
            Product product = productRepository.findById(itemReq.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product not found: " + itemReq.getProductId()));

            Inventory inventory = inventoryRepository.findWithLockByProductIdAndWarehouseId(product.getId(), warehouse.getId())
                    .orElseThrow(() -> new InsufficientStockException("No stock available for product " + product.getName() + " in warehouse " + warehouse.getName()));

            int available = inventory.getAvailableQuantity();
            if (available < itemReq.getQuantity()) {
                throw new InsufficientStockException("Insufficient stock for " + product.getName() +
                        ". Available: " + available + ", requested: " + itemReq.getQuantity());
            }

            // Deduct inventory
            int newBalance = inventory.getQuantity() - itemReq.getQuantity();
            inventory.setQuantity(newBalance);
            inventory.setLastCountedAt(LocalDateTime.now());
            inventoryRepository.save(inventory);

            // Calculate item price snapshots
            BigDecimal unitPrice = product.getSellingPrice();
            BigDecimal unitCost = product.getCostPrice();
            BigDecimal lineTotal = unitPrice.multiply(BigDecimal.valueOf(itemReq.getQuantity()));
            subtotal = subtotal.add(lineTotal);

            SaleItem item = new SaleItem();
            item.setSale(sale);
            item.setProduct(product);
            item.setProductNameSnapshot(product.getName());
            item.setSkuSnapshot(product.getSku());
            item.setQuantity(itemReq.getQuantity());
            item.setUnitCostSnapshot(unitCost);
            item.setUnitPriceSnapshot(unitPrice);
            item.setTaxRateSnapshot(request.getTaxRate() != null ? request.getTaxRate() : BigDecimal.ZERO);
            item.setSubtotal(lineTotal);
            saleItems.add(item);

            // Record stock movement ledger
            stockMovementRepository.save(new StockMovement(
                    product,
                    warehouse,
                    "SALE",
                    -itemReq.getQuantity(),
                    newBalance,
                    "SALE",
                    null, // set after sale is saved
                    "POS Sale deduction invoice " + invoiceNumber,
                    cashier
            ));

            // Low stock check trigger
            if (newBalance <= product.getReorderLevel()) {
                notificationRepository.save(new Notification(
                        "Low Stock Alert: " + product.getName(),
                        "Stock for " + product.getName() + " in " + warehouse.getName() + " reached " + newBalance + " units",
                        "LOW_STOCK",
                        "ROLE_MANAGER"
                ));
            }
        }

        BigDecimal taxRate = request.getTaxRate() != null ? request.getTaxRate() : BigDecimal.ZERO;
        BigDecimal taxAmount = subtotal.multiply(taxRate).divide(new BigDecimal("100"), 2, RoundingMode.HALF_UP);
        BigDecimal discount = request.getDiscountAmount() != null ? request.getDiscountAmount() : BigDecimal.ZERO;
        BigDecimal total = subtotal.add(taxAmount).subtract(discount);
        if (total.compareTo(BigDecimal.ZERO) < 0) total = BigDecimal.ZERO;

        sale.setSubtotal(subtotal);
        sale.setTaxRate(taxRate);
        sale.setTaxAmount(taxAmount);
        sale.setDiscountAmount(discount);
        sale.setTotalAmount(total);
        sale.setItems(saleItems);

        Sale savedSale = saleRepository.save(sale);

        // Link reference ID to movements
        for (SaleItem si : saleItems) {
            si.setSale(savedSale);
            saleItemRepository.save(si);
        }

        // Generate Invoice
        Invoice invoice = new Invoice();
        invoice.setSale(savedSale);
        invoice.setInvoiceNumber(savedSale.getInvoiceNumber());
        invoice.setIssueDate(savedSale.getSaleDate());
        invoice.setPdfUrl("/api/v1/sales/" + savedSale.getId() + "/invoice");
        invoice.setQrCodeData("RETAIL|" + savedSale.getInvoiceNumber() + "|" + savedSale.getTotalAmount() + "|" + savedSale.getPaymentMethod());
        invoiceRepository.save(invoice);

        auditLogService.logAction(SecurityUtils.getCurrentUsername(), "SALE_COMPLETE", "SALE", savedSale.getId().toString(),
                "Completed sale " + savedSale.getInvoiceNumber() + " total ₹" + savedSale.getTotalAmount());

        return savedSale;
    }

    @Transactional
    public SalesReturn processReturn(SalesReturnRequest request) {
        Sale sale = getSaleById(request.getSaleId());
        Warehouse warehouse = warehouseRepository.findById(request.getWarehouseId())
                .orElseThrow(() -> new ResourceNotFoundException("Warehouse not found: " + request.getWarehouseId()));

        User currentUser = SecurityUtils.getCurrentUser();
        String returnNumber = "RET-" + System.currentTimeMillis() % 10000000;

        SalesReturn salesReturn = new SalesReturn();
        salesReturn.setReturnNumber(returnNumber);
        salesReturn.setSale(sale);
        salesReturn.setWarehouse(warehouse);
        salesReturn.setProcessedByUser(currentUser);
        salesReturn.setReason(request.getReason());
        salesReturn.setStatus("COMPLETED");

        BigDecimal totalRefund = BigDecimal.ZERO;
        List<SalesReturnItem> returnItems = new ArrayList<>();

        for (SalesReturnRequest.SalesReturnItemRequest itemReq : request.getItems()) {
            Product product = productRepository.findById(itemReq.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product not found: " + itemReq.getProductId()));

            // Find matching item in sale
            SaleItem saleItem = sale.getItems().stream()
                    .filter(i -> i.getProduct().getId().equals(product.getId()))
                    .findFirst()
                    .orElseThrow(() -> new BadRequestException("Product " + product.getSku() + " was not part of sale " + sale.getInvoiceNumber()));

            if (itemReq.getQuantity() > saleItem.getQuantity()) {
                throw new BadRequestException("Return quantity exceeds sold quantity for " + product.getName());
            }

            BigDecimal refundItemTotal = saleItem.getUnitPriceSnapshot().multiply(BigDecimal.valueOf(itemReq.getQuantity()));
            totalRefund = totalRefund.add(refundItemTotal);

            SalesReturnItem sri = new SalesReturnItem();
            sri.setSalesReturn(salesReturn);
            sri.setProduct(product);
            sri.setQuantity(itemReq.getQuantity());
            sri.setRefundUnitPrice(saleItem.getUnitPriceSnapshot());
            sri.setRestockInventory(itemReq.getRestockInventory() != null ? itemReq.getRestockInventory() : true);
            returnItems.add(sri);

            // If restocking, restore inventory and record movement
            if (Boolean.TRUE.equals(sri.getRestockInventory())) {
                Inventory inventory = inventoryRepository.findWithLockByProductIdAndWarehouseId(product.getId(), warehouse.getId())
                        .orElseGet(() -> inventoryRepository.save(new Inventory(product, warehouse, 0)));

                int updatedBalance = inventory.getQuantity() + itemReq.getQuantity();
                inventory.setQuantity(updatedBalance);
                inventory.setLastCountedAt(LocalDateTime.now());
                inventoryRepository.save(inventory);

                stockMovementRepository.save(new StockMovement(
                        product,
                        warehouse,
                        "RETURN",
                        itemReq.getQuantity(),
                        updatedBalance,
                        "RETURN",
                        sale.getId(),
                        "Restocked from return " + returnNumber + " for invoice " + sale.getInvoiceNumber(),
                        currentUser
                ));
            }
        }

        salesReturn.setRefundAmount(totalRefund);
        salesReturn.setItems(returnItems);
        SalesReturn savedReturn = salesReturnRepository.save(salesReturn);

        sale.setPaymentStatus("REFUNDED");
        saleRepository.save(sale);

        auditLogService.logAction(SecurityUtils.getCurrentUsername(), "SALES_RETURN", "SALES_RETURN",
                savedReturn.getId().toString(), "Processed return " + returnNumber + " refund ₹" + totalRefund);

        return savedReturn;
    }
}
