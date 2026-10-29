package com.retail.management.service;

import com.retail.management.dto.GoodsReceiptRequest;
import com.retail.management.dto.PurchaseOrderItemRequest;
import com.retail.management.dto.PurchaseOrderRequest;
import com.retail.management.entity.*;
import com.retail.management.exception.BadRequestException;
import com.retail.management.exception.ResourceNotFoundException;
import com.retail.management.repository.*;
import com.retail.management.security.SecurityUtils;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class PurchaseOrderService {

    private final PurchaseOrderRepository purchaseOrderRepository;
    private final PurchaseOrderItemRepository purchaseOrderItemRepository;
    private final GoodsReceiptRepository goodsReceiptRepository;
    private final SupplierRepository supplierRepository;
    private final WarehouseRepository warehouseRepository;
    private final ProductRepository productRepository;
    private final InventoryRepository inventoryRepository;
    private final StockMovementRepository stockMovementRepository;
    private final NotificationRepository notificationRepository;
    private final AuditLogService auditLogService;

    public PurchaseOrderService(PurchaseOrderRepository purchaseOrderRepository,
                                PurchaseOrderItemRepository purchaseOrderItemRepository,
                                GoodsReceiptRepository goodsReceiptRepository,
                                SupplierRepository supplierRepository,
                                WarehouseRepository warehouseRepository,
                                ProductRepository productRepository,
                                InventoryRepository inventoryRepository,
                                StockMovementRepository stockMovementRepository,
                                NotificationRepository notificationRepository,
                                AuditLogService auditLogService) {
        this.purchaseOrderRepository = purchaseOrderRepository;
        this.purchaseOrderItemRepository = purchaseOrderItemRepository;
        this.goodsReceiptRepository = goodsReceiptRepository;
        this.supplierRepository = supplierRepository;
        this.warehouseRepository = warehouseRepository;
        this.productRepository = productRepository;
        this.inventoryRepository = inventoryRepository;
        this.stockMovementRepository = stockMovementRepository;
        this.notificationRepository = notificationRepository;
        this.auditLogService = auditLogService;
    }

    public Page<PurchaseOrder> getAllPurchaseOrders(Pageable pageable) {
        return purchaseOrderRepository.findAllByOrderByCreatedAtDesc(pageable);
    }

    public PurchaseOrder getPurchaseOrderById(Long id) {
        return purchaseOrderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Purchase Order not found with id: " + id));
    }

    @Transactional
    public PurchaseOrder createPurchaseOrder(PurchaseOrderRequest request) {
        Supplier supplier = supplierRepository.findById(request.getSupplierId())
                .orElseThrow(() -> new ResourceNotFoundException("Supplier not found: " + request.getSupplierId()));

        Warehouse warehouse = warehouseRepository.findById(request.getDestinationWarehouseId())
                .orElseThrow(() -> new ResourceNotFoundException("Warehouse not found: " + request.getDestinationWarehouseId()));

        PurchaseOrder po = new PurchaseOrder();
        String poNumber = "PO-" + System.currentTimeMillis() % 10000000;
        po.setPoNumber(poNumber);
        po.setSupplier(supplier);
        po.setDestinationWarehouse(warehouse);
        po.setStatus("SUBMITTED");
        po.setNotes(request.getNotes());
        po.setCreatedByUser(SecurityUtils.getCurrentUser());

        BigDecimal total = BigDecimal.ZERO;
        List<PurchaseOrderItem> items = new ArrayList<>();

        for (PurchaseOrderItemRequest itemReq : request.getItems()) {
            Product product = productRepository.findById(itemReq.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product not found: " + itemReq.getProductId()));

            PurchaseOrderItem item = new PurchaseOrderItem();
            item.setPurchaseOrder(po);
            item.setProduct(product);
            item.setQuantityOrdered(itemReq.getQuantityOrdered());
            item.setQuantityReceived(0);
            item.setUnitCost(itemReq.getUnitCost());
            BigDecimal itemTotal = itemReq.getUnitCost().multiply(BigDecimal.valueOf(itemReq.getQuantityOrdered()));
            item.setTotalCost(itemTotal);

            items.add(item);
            total = total.add(itemTotal);
        }

        po.setTotalAmount(total);
        po.setItems(items);

        PurchaseOrder saved = purchaseOrderRepository.save(po);

        // Alert manager of submitted PO awaiting approval
        notificationRepository.save(new Notification(
                "Purchase Order Awaiting Approval",
                "New purchase order " + saved.getPoNumber() + " total ₹" + saved.getTotalAmount() + " requires manager review",
                "PO_PENDING",
                "ROLE_MANAGER"
        ));

        auditLogService.logAction(SecurityUtils.getCurrentUsername(), "CREATE_PO", "PURCHASE_ORDER", saved.getId().toString(),
                "Created PO " + saved.getPoNumber() + " for supplier " + supplier.getName());

        return saved;
    }

    @Transactional
    public PurchaseOrder approvePurchaseOrder(Long id) {
        PurchaseOrder po = getPurchaseOrderById(id);
        if (!"SUBMITTED".equalsIgnoreCase(po.getStatus()) && !"DRAFT".equalsIgnoreCase(po.getStatus())) {
            throw new BadRequestException("Purchase order cannot be approved in current status: " + po.getStatus());
        }

        po.setStatus("APPROVED");
        po.setApprovedByUser(SecurityUtils.getCurrentUser());
        po.setApprovedAt(LocalDateTime.now());
        PurchaseOrder updated = purchaseOrderRepository.save(po);

        auditLogService.logAction(SecurityUtils.getCurrentUsername(), "APPROVE_PO", "PURCHASE_ORDER", id.toString(),
                "Approved purchase order " + po.getPoNumber());

        return updated;
    }

    @Transactional
    public GoodsReceipt receiveGoods(GoodsReceiptRequest request) {
        PurchaseOrder po = getPurchaseOrderById(request.getPurchaseOrderId());
        if (!"APPROVED".equalsIgnoreCase(po.getStatus()) && !"PARTIALLY_RECEIVED".equalsIgnoreCase(po.getStatus())) {
            throw new BadRequestException("Goods can only be received against APPROVED or PARTIALLY_RECEIVED orders. Current: " + po.getStatus());
        }

        Warehouse warehouse = warehouseRepository.findById(request.getWarehouseId())
                .orElseThrow(() -> new ResourceNotFoundException("Warehouse not found: " + request.getWarehouseId()));

        GoodsReceipt receipt = new GoodsReceipt();
        receipt.setReceiptNumber("GR-" + System.currentTimeMillis() % 10000000);
        receipt.setPurchaseOrder(po);
        receipt.setWarehouse(warehouse);
        receipt.setReceivedByUser(SecurityUtils.getCurrentUser());
        receipt.setNotes(request.getNotes());

        List<GoodsReceiptItem> receiptItems = new ArrayList<>();
        boolean allItemsFullyReceived = true;

        for (GoodsReceiptRequest.GoodsReceiptItemRequest itemReq : request.getItems()) {
            if (itemReq.getQuantityReceived() <= 0) continue;

            Product product = productRepository.findById(itemReq.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product not found: " + itemReq.getProductId()));

            // Find matching item in PO
            PurchaseOrderItem poItem = po.getItems().stream()
                    .filter(i -> i.getProduct().getId().equals(product.getId()))
                    .findFirst()
                    .orElseThrow(() -> new BadRequestException("Product " + product.getSku() + " is not part of PO " + po.getPoNumber()));

            int newQtyReceived = poItem.getQuantityReceived() + itemReq.getQuantityReceived();
            if (newQtyReceived > poItem.getQuantityOrdered()) {
                throw new BadRequestException("Received quantity exceeds ordered quantity for product: " + product.getSku());
            }

            poItem.setQuantityReceived(newQtyReceived);
            purchaseOrderItemRepository.save(poItem);

            GoodsReceiptItem gri = new GoodsReceiptItem(receipt, product, itemReq.getQuantityReceived(), poItem.getUnitCost());
            receiptItems.add(gri);

            // Transactional inventory increment with locking
            Inventory inventory = inventoryRepository.findWithLockByProductIdAndWarehouseId(product.getId(), warehouse.getId())
                    .orElseGet(() -> inventoryRepository.save(new Inventory(product, warehouse, 0)));

            int updatedQty = (inventory.getQuantity() != null ? inventory.getQuantity() : 0) + itemReq.getQuantityReceived();
            inventory.setQuantity(updatedQty);
            inventory.setLastCountedAt(LocalDateTime.now());
            inventoryRepository.save(inventory);

            // Ledger record
            stockMovementRepository.save(new StockMovement(
                    product,
                    warehouse,
                    "IN",
                    itemReq.getQuantityReceived(),
                    updatedQty,
                    "PURCHASE_ORDER",
                    po.getId(),
                    "Goods receipt against " + po.getPoNumber(),
                    SecurityUtils.getCurrentUser()
            ));

            if (newQtyReceived < poItem.getQuantityOrdered()) {
                allItemsFullyReceived = false;
            }
        }

        // Check if any item in PO is still pending
        for (PurchaseOrderItem poi : po.getItems()) {
            if (poi.getQuantityReceived() < poi.getQuantityOrdered()) {
                allItemsFullyReceived = false;
                break;
            }
        }

        po.setStatus(allItemsFullyReceived ? "RECEIVED" : "PARTIALLY_RECEIVED");
        purchaseOrderRepository.save(po);

        receipt.setItems(receiptItems);
        GoodsReceipt savedReceipt = goodsReceiptRepository.save(receipt);

        auditLogService.logAction(SecurityUtils.getCurrentUsername(), "GOODS_RECEIPT", "GOODS_RECEIPT",
                savedReceipt.getId().toString(), "Received goods against " + po.getPoNumber() + " at " + warehouse.getCode());

        return savedReceipt;
    }
}
