package com.retail.management.controller;

import com.retail.management.dto.ApiResponse;
import com.retail.management.dto.StoreDto;
import com.retail.management.dto.WarehouseDto;
import com.retail.management.entity.Store;
import com.retail.management.service.WarehouseService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/warehouses")
@Tag(name = "Warehouses & Stores", description = "Endpoints for managing physical warehouses and store branches")
public class WarehouseController {

    private final WarehouseService warehouseService;

    public WarehouseController(WarehouseService warehouseService) {
        this.warehouseService = warehouseService;
    }

    @GetMapping
    @Operation(summary = "List all warehouses")
    public ResponseEntity<ApiResponse<List<WarehouseDto>>> getAllWarehouses() {
        return ResponseEntity.ok(ApiResponse.ok(warehouseService.getAllWarehouses()));
    }

    @GetMapping("/active")
    @Operation(summary = "List active warehouses")
    public ResponseEntity<ApiResponse<List<WarehouseDto>>> getActiveWarehouses() {
        return ResponseEntity.ok(ApiResponse.ok(warehouseService.getActiveWarehouses()));
    }

    @PostMapping
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @Operation(summary = "Create a new warehouse")
    public ResponseEntity<ApiResponse<WarehouseDto>> createWarehouse(@Valid @RequestBody WarehouseDto dto) {
        WarehouseDto created = warehouseService.createWarehouse(dto);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Warehouse created successfully", created));
    }

    @GetMapping("/stores")
    @Operation(summary = "List all retail stores")
    public ResponseEntity<ApiResponse<List<Store>>> getAllStores() {
        return ResponseEntity.ok(ApiResponse.ok(warehouseService.getAllStores()));
    }

    @PostMapping("/stores")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @Operation(summary = "Create a new retail store branch")
    public ResponseEntity<ApiResponse<Store>> createStore(@Valid @RequestBody StoreDto dto) {
        Store created = warehouseService.createStore(dto);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Store created successfully", created));
    }
}
