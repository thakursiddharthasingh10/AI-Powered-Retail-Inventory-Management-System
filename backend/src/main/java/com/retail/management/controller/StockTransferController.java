package com.retail.management.controller;

import com.retail.management.dto.ApiResponse;
import com.retail.management.dto.StockTransferRequest;
import com.retail.management.entity.StockTransfer;
import com.retail.management.service.StockTransferService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/stock-transfers")
@Tag(name = "Inter-Warehouse Stock Transfers", description = "Endpoints for requesting, approving, dispatching and receiving transfers")
public class StockTransferController {

    private final StockTransferService stockTransferService;

    public StockTransferController(StockTransferService stockTransferService) {
        this.stockTransferService = stockTransferService;
    }

    @GetMapping
    @Operation(summary = "Get paginated list of stock transfers")
    public ResponseEntity<ApiResponse<Page<StockTransfer>>> getAllTransfers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size) {
        return ResponseEntity.ok(ApiResponse.ok(stockTransferService.getAllTransfers(PageRequest.of(page, size))));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get stock transfer details by ID")
    public ResponseEntity<ApiResponse<StockTransfer>> getTransferById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(stockTransferService.getTransferById(id)));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_MANAGER', 'ROLE_INVENTORY_STAFF')")
    @Operation(summary = "Create an inter-warehouse stock transfer request")
    public ResponseEntity<ApiResponse<StockTransfer>> requestTransfer(@Valid @RequestBody StockTransferRequest request) {
        StockTransfer transfer = stockTransferService.requestTransfer(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Stock transfer requested successfully", transfer));
    }

    @PostMapping("/{id}/approve")
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_MANAGER')")
    @Operation(summary = "Approve stock transfer request")
    public ResponseEntity<ApiResponse<StockTransfer>> approveTransfer(@PathVariable Long id) {
        StockTransfer approved = stockTransferService.approveTransfer(id);
        return ResponseEntity.ok(ApiResponse.ok("Stock transfer approved", approved));
    }

    @PostMapping("/{id}/dispatch")
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_MANAGER', 'ROLE_INVENTORY_STAFF')")
    @Operation(summary = "Dispatch stock transfer from source warehouse")
    public ResponseEntity<ApiResponse<StockTransfer>> dispatchTransfer(@PathVariable Long id) {
        StockTransfer dispatched = stockTransferService.dispatchTransfer(id);
        return ResponseEntity.ok(ApiResponse.ok("Stock transfer dispatched", dispatched));
    }

    @PostMapping("/{id}/receive")
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_MANAGER', 'ROLE_INVENTORY_STAFF')")
    @Operation(summary = "Receive stock transfer at destination warehouse")
    public ResponseEntity<ApiResponse<StockTransfer>> receiveTransfer(@PathVariable Long id) {
        StockTransfer received = stockTransferService.receiveTransfer(id);
        return ResponseEntity.ok(ApiResponse.ok("Stock transfer received and balance credited", received));
    }
}
