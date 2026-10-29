package com.retail.management.controller;

import com.retail.management.dto.ApiResponse;
import com.retail.management.dto.InventoryAdjustmentRequest;
import com.retail.management.dto.StockMovementDto;
import com.retail.management.entity.Inventory;
import com.retail.management.service.InventoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/inventory")
@Tag(name = "Inventory & Stock Ledger", description = "Endpoints for inventory status, physical counts, adjustments and movements ledger")
public class InventoryController {

    private final InventoryService inventoryService;

    public InventoryController(InventoryService inventoryService) {
        this.inventoryService = inventoryService;
    }

    @GetMapping
    @Operation(summary = "Get current stock for all products across warehouses")
    public ResponseEntity<ApiResponse<List<Inventory>>> getAllInventory() {
        return ResponseEntity.ok(ApiResponse.ok(inventoryService.getAllInventory()));
    }

    @GetMapping("/warehouse/{warehouseId}")
    @Operation(summary = "Get stock levels for a specific warehouse")
    public ResponseEntity<ApiResponse<List<Inventory>>> getByWarehouse(@PathVariable Long warehouseId) {
        return ResponseEntity.ok(ApiResponse.ok(inventoryService.getInventoryByWarehouse(warehouseId)));
    }

    @GetMapping("/product/{productId}")
    @Operation(summary = "Get stock levels for a product across all warehouses")
    public ResponseEntity<ApiResponse<List<Inventory>>> getByProduct(@PathVariable Long productId) {
        return ResponseEntity.ok(ApiResponse.ok(inventoryService.getInventoryByProduct(productId)));
    }

    @GetMapping("/low-stock")
    @Operation(summary = "Get all products at or below their reorder level")
    public ResponseEntity<ApiResponse<List<Inventory>>> getLowStock() {
        return ResponseEntity.ok(ApiResponse.ok(inventoryService.getLowStockAlerts()));
    }

    @GetMapping("/out-of-stock")
    @Operation(summary = "Get all products with zero quantity")
    public ResponseEntity<ApiResponse<List<Inventory>>> getOutOfStock() {
        return ResponseEntity.ok(ApiResponse.ok(inventoryService.getOutOfStockAlerts()));
    }

    @PostMapping("/adjustments")
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_MANAGER', 'ROLE_INVENTORY_STAFF')")
    @Operation(summary = "Record authorized inventory adjustment (IN/OUT/CYCLE_COUNT)")
    public ResponseEntity<ApiResponse<StockMovementDto>> adjustStock(@Valid @RequestBody InventoryAdjustmentRequest request) {
        StockMovementDto result = inventoryService.adjustStock(request);
        return ResponseEntity.ok(ApiResponse.ok("Stock adjustment recorded successfully", result));
    }

    @GetMapping("/movements")
    @Operation(summary = "Get paginated audit ledger of all stock movements")
    public ResponseEntity<ApiResponse<Page<StockMovementDto>>> getMovements(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.ok(inventoryService.getStockMovements(PageRequest.of(page, size))));
    }

    @GetMapping("/movements/product/{productId}")
    @Operation(summary = "Get stock movement ledger for a specific product")
    public ResponseEntity<ApiResponse<List<StockMovementDto>>> getMovementsForProduct(@PathVariable Long productId) {
        return ResponseEntity.ok(ApiResponse.ok(inventoryService.getMovementsForProduct(productId)));
    }
}
