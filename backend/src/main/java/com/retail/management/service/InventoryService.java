package com.retail.management.service;

import com.retail.management.dto.InventoryAdjustmentRequest;
import com.retail.management.dto.StockMovementDto;
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
import java.util.List;
import java.util.stream.Collectors;

@Service
public class InventoryService {

    private final InventoryRepository inventoryRepository;
    private final ProductRepository productRepository;
    private final WarehouseRepository warehouseRepository;
    private final StockMovementRepository stockMovementRepository;
    private final NotificationRepository notificationRepository;
    private final AuditLogService auditLogService;

    public InventoryService(InventoryRepository inventoryRepository,
                            ProductRepository productRepository,
                            WarehouseRepository warehouseRepository,
                            StockMovementRepository stockMovementRepository,
                            NotificationRepository notificationRepository,
                            AuditLogService auditLogService) {
        this.inventoryRepository = inventoryRepository;
        this.productRepository = productRepository;
        this.warehouseRepository = warehouseRepository;
        this.stockMovementRepository = stockMovementRepository;
        this.notificationRepository = notificationRepository;
        this.auditLogService = auditLogService;
    }

    public List<Inventory> getAllInventory() {
        return inventoryRepository.findAll();
    }

    public List<Inventory> getInventoryByWarehouse(Long warehouseId) {
        return inventoryRepository.findByWarehouseId(warehouseId);
    }

    public List<Inventory> getInventoryByProduct(Long productId) {
        return inventoryRepository.findByProductId(productId);
    }

    public List<Inventory> getLowStockAlerts() {
        return inventoryRepository.findLowStockInventory();
    }

    public List<Inventory> getOutOfStockAlerts() {
        return inventoryRepository.findOutOfStockInventory();
    }

    @Transactional
    public StockMovementDto adjustStock(InventoryAdjustmentRequest request) {
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product not found: " + request.getProductId()));

        Warehouse warehouse = warehouseRepository.findById(request.getWarehouseId())
                .orElseThrow(() -> new ResourceNotFoundException("Warehouse not found: " + request.getWarehouseId()));

        Inventory inventory = inventoryRepository.findWithLockByProductIdAndWarehouseId(product.getId(), warehouse.getId())
                .orElseGet(() -> {
                    Inventory newInv = new Inventory(product, warehouse, 0);
                    return inventoryRepository.save(newInv);
                });

        int currentQty = inventory.getQuantity() != null ? inventory.getQuantity() : 0;
        int qtyChange = request.getQuantityChanged();
        int newBalance = currentQty + qtyChange;

        if (newBalance < 0) {
            throw new InsufficientStockException("Insufficient stock in " + warehouse.getName() +
                    " for " + product.getName() + ". Current: " + currentQty + ", change requested: " + qtyChange);
        }

        inventory.setQuantity(newBalance);
        inventory.setLastCountedAt(LocalDateTime.now());
        inventoryRepository.save(inventory);

        User currentUser = SecurityUtils.getCurrentUser();
        String username = SecurityUtils.getCurrentUsername();

        StockMovement movement = new StockMovement(
                product,
                warehouse,
                request.getMovementType(),
                qtyChange,
                newBalance,
                "MANUAL_ADJUSTMENT",
                null,
                request.getReason() != null ? request.getReason() : "Manual inventory adjustment",
                currentUser
        );
        StockMovement savedMovement = stockMovementRepository.save(movement);

        auditLogService.logAction(username, "STOCK_ADJUSTMENT", "INVENTORY", inventory.getId().toString(),
                "Adjusted " + product.getSku() + " in " + warehouse.getCode() + " by " + qtyChange + ". Balance: " + newBalance);

        // Low stock notification trigger
        if (newBalance <= product.getReorderLevel()) {
            Notification notif = new Notification(
                    "Low Stock Alert: " + product.getName(),
                    "Stock for " + product.getName() + " in " + warehouse.getName() + " reached " + newBalance + " units (Reorder: " + product.getReorderLevel() + ")",
                    "LOW_STOCK",
                    "ROLE_MANAGER"
            );
            notificationRepository.save(notif);
        }

        return convertMovementToDto(savedMovement);
    }

    public Page<StockMovementDto> getStockMovements(Pageable pageable) {
        return stockMovementRepository.findAllByOrderByCreatedAtDesc(pageable)
                .map(this::convertMovementToDto);
    }

    public List<StockMovementDto> getMovementsForProduct(Long productId) {
        return stockMovementRepository.findByProductIdOrderByCreatedAtDesc(productId).stream()
                .map(this::convertMovementToDto)
                .collect(Collectors.toList());
    }

    public StockMovementDto convertMovementToDto(StockMovement sm) {
        StockMovementDto dto = new StockMovementDto();
        dto.setId(sm.getId());
        dto.setProductId(sm.getProduct().getId());
        dto.setProductSku(sm.getProduct().getSku());
        dto.setProductName(sm.getProduct().getName());
        dto.setWarehouseId(sm.getWarehouse().getId());
        dto.setWarehouseName(sm.getWarehouse().getName());
        dto.setMovementType(sm.getMovementType());
        dto.setQuantityChanged(sm.getQuantityChanged());
        dto.setBalanceAfter(sm.getBalanceAfter());
        dto.setReferenceType(sm.getReferenceType());
        dto.setReferenceId(sm.getReferenceId());
        dto.setReason(sm.getReason());
        dto.setActorUsername(sm.getCreatedByUser() != null ? sm.getCreatedByUser().getUsername() : "system");
        dto.setCreatedAt(sm.getCreatedAt());
        return dto;
    }
}
