package com.retail.management.service;

import com.retail.management.dto.StockTransferRequest;
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

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class StockTransferService {

    private final StockTransferRepository stockTransferRepository;
    private final WarehouseRepository warehouseRepository;
    private final ProductRepository productRepository;
    private final InventoryRepository inventoryRepository;
    private final StockMovementRepository stockMovementRepository;
    private final NotificationRepository notificationRepository;
    private final AuditLogService auditLogService;

    public StockTransferService(StockTransferRepository stockTransferRepository,
                                WarehouseRepository warehouseRepository,
                                ProductRepository productRepository,
                                InventoryRepository inventoryRepository,
                                StockMovementRepository stockMovementRepository,
                                NotificationRepository notificationRepository,
                                AuditLogService auditLogService) {
        this.stockTransferRepository = stockTransferRepository;
        this.warehouseRepository = warehouseRepository;
        this.productRepository = productRepository;
        this.inventoryRepository = inventoryRepository;
        this.stockMovementRepository = stockMovementRepository;
        this.notificationRepository = notificationRepository;
        this.auditLogService = auditLogService;
    }

    public Page<StockTransfer> getAllTransfers(Pageable pageable) {
        return stockTransferRepository.findAllByOrderByCreatedAtDesc(pageable);
    }

    public StockTransfer getTransferById(Long id) {
        return stockTransferRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Stock transfer not found with id: " + id));
    }

    @Transactional
    public StockTransfer requestTransfer(StockTransferRequest request) {
        if (request.getSourceWarehouseId().equals(request.getDestinationWarehouseId())) {
            throw new BadRequestException("Source and destination warehouses cannot be the same");
        }

        Warehouse source = warehouseRepository.findById(request.getSourceWarehouseId())
                .orElseThrow(() -> new ResourceNotFoundException("Source warehouse not found: " + request.getSourceWarehouseId()));

        Warehouse destination = warehouseRepository.findById(request.getDestinationWarehouseId())
                .orElseThrow(() -> new ResourceNotFoundException("Destination warehouse not found: " + request.getDestinationWarehouseId()));

        StockTransfer transfer = new StockTransfer();
        String transferNumber = "TRF-" + System.currentTimeMillis() % 10000000;
        transfer.setTransferNumber(transferNumber);
        transfer.setSourceWarehouse(source);
        transfer.setDestinationWarehouse(destination);
        transfer.setStatus("REQUESTED");
        transfer.setNotes(request.getNotes());
        transfer.setRequestedByUser(SecurityUtils.getCurrentUser());

        List<StockTransferItem> items = new ArrayList<>();
        for (StockTransferRequest.StockTransferItemRequest itemReq : request.getItems()) {
            Product product = productRepository.findById(itemReq.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product not found: " + itemReq.getProductId()));

            // Verify source has available stock
            Inventory sourceInv = inventoryRepository.findByProductIdAndWarehouseId(product.getId(), source.getId())
                    .orElseThrow(() -> new InsufficientStockException("Source warehouse has no stock for " + product.getName()));

            if (sourceInv.getAvailableQuantity() < itemReq.getQuantityRequested()) {
                throw new InsufficientStockException("Insufficient available stock in " + source.getName() + " for " + product.getName());
            }

            StockTransferItem item = new StockTransferItem(transfer, product, itemReq.getQuantityRequested());
            items.add(item);
        }

        transfer.setItems(items);
        StockTransfer saved = stockTransferRepository.save(transfer);

        notificationRepository.save(new Notification(
                "Stock Transfer Requested",
                "New transfer " + saved.getTransferNumber() + " requested from " + source.getCode() + " to " + destination.getCode(),
                "TRANSFER_PENDING",
                "ROLE_MANAGER"
        ));

        auditLogService.logAction(SecurityUtils.getCurrentUsername(), "REQUEST_TRANSFER", "STOCK_TRANSFER",
                saved.getId().toString(), "Requested transfer " + saved.getTransferNumber());

        return saved;
    }

    @Transactional
    public StockTransfer approveTransfer(Long id) {
        StockTransfer transfer = getTransferById(id);
        if (!"REQUESTED".equalsIgnoreCase(transfer.getStatus())) {
            throw new BadRequestException("Transfer cannot be approved in current status: " + transfer.getStatus());
        }

        transfer.setStatus("APPROVED");
        StockTransfer updated = stockTransferRepository.save(transfer);
        auditLogService.logAction(SecurityUtils.getCurrentUsername(), "APPROVE_TRANSFER", "STOCK_TRANSFER",
                id.toString(), "Approved transfer " + transfer.getTransferNumber());
        return updated;
    }

    @Transactional
    public StockTransfer dispatchTransfer(Long id) {
        StockTransfer transfer = getTransferById(id);
        if (!"APPROVED".equalsIgnoreCase(transfer.getStatus()) && !"REQUESTED".equalsIgnoreCase(transfer.getStatus())) {
            throw new BadRequestException("Transfer cannot be dispatched in status: " + transfer.getStatus());
        }

        Warehouse source = transfer.getSourceWarehouse();
        User currentUser = SecurityUtils.getCurrentUser();

        for (StockTransferItem item : transfer.getItems()) {
            Product product = item.getProduct();
            int qty = item.getQuantityRequested();

            Inventory sourceInv = inventoryRepository.findWithLockByProductIdAndWarehouseId(product.getId(), source.getId())
                    .orElseThrow(() -> new InsufficientStockException("Product not found in source inventory: " + product.getName()));

            if (sourceInv.getQuantity() < qty) {
                throw new InsufficientStockException("Insufficient stock in " + source.getName() + " to dispatch: " + product.getName());
            }

            int newSourceBalance = sourceInv.getQuantity() - qty;
            sourceInv.setQuantity(newSourceBalance);
            inventoryRepository.save(sourceInv);

            item.setQuantityDispatched(qty);

            stockMovementRepository.save(new StockMovement(
                    product,
                    source,
                    "TRANSFER_OUT",
                    -qty,
                    newSourceBalance,
                    "TRANSFER",
                    transfer.getId(),
                    "Dispatched via transfer " + transfer.getTransferNumber(),
                    currentUser
            ));
        }

        transfer.setStatus("DISPATCHED");
        transfer.setDispatchedByUser(currentUser);
        transfer.setDispatchedAt(LocalDateTime.now());
        StockTransfer saved = stockTransferRepository.save(transfer);

        auditLogService.logAction(SecurityUtils.getCurrentUsername(), "DISPATCH_TRANSFER", "STOCK_TRANSFER",
                id.toString(), "Dispatched transfer " + transfer.getTransferNumber());

        return saved;
    }

    @Transactional
    public StockTransfer receiveTransfer(Long id) {
        StockTransfer transfer = getTransferById(id);
        if (!"DISPATCHED".equalsIgnoreCase(transfer.getStatus())) {
            throw new BadRequestException("Only DISPATCHED transfers can be received. Current: " + transfer.getStatus());
        }

        Warehouse destination = transfer.getDestinationWarehouse();
        User currentUser = SecurityUtils.getCurrentUser();

        for (StockTransferItem item : transfer.getItems()) {
            Product product = item.getProduct();
            int qty = item.getQuantityDispatched();

            Inventory destInv = inventoryRepository.findWithLockByProductIdAndWarehouseId(product.getId(), destination.getId())
                    .orElseGet(() -> inventoryRepository.save(new Inventory(product, destination, 0)));

            int newDestBalance = destInv.getQuantity() + qty;
            destInv.setQuantity(newDestBalance);
            destInv.setLastCountedAt(LocalDateTime.now());
            inventoryRepository.save(destInv);

            item.setQuantityReceived(qty);

            stockMovementRepository.save(new StockMovement(
                    product,
                    destination,
                    "TRANSFER_IN",
                    qty,
                    newDestBalance,
                    "TRANSFER",
                    transfer.getId(),
                    "Received at " + destination.getCode() + " via transfer " + transfer.getTransferNumber(),
                    currentUser
            ));
        }

        transfer.setStatus("RECEIVED");
        transfer.setReceivedByUser(currentUser);
        transfer.setReceivedAt(LocalDateTime.now());
        StockTransfer saved = stockTransferRepository.save(transfer);

        auditLogService.logAction(SecurityUtils.getCurrentUsername(), "RECEIVE_TRANSFER", "STOCK_TRANSFER",
                id.toString(), "Received transfer " + transfer.getTransferNumber() + " at " + destination.getCode());

        return saved;
    }
}
