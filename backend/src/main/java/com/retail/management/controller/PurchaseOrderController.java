package com.retail.management.controller;

import com.retail.management.dto.ApiResponse;
import com.retail.management.dto.GoodsReceiptRequest;
import com.retail.management.dto.PurchaseOrderRequest;
import com.retail.management.entity.GoodsReceipt;
import com.retail.management.entity.PurchaseOrder;
import com.retail.management.service.PurchaseOrderService;
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
@RequestMapping("/api/v1/purchase-orders")
@Tag(name = "Procurement & Purchase Orders", description = "Endpoints for creating purchase orders, manager approvals, and receiving inventory")
public class PurchaseOrderController {

    private final PurchaseOrderService purchaseOrderService;

    public PurchaseOrderController(PurchaseOrderService purchaseOrderService) {
        this.purchaseOrderService = purchaseOrderService;
    }

    @GetMapping
    @Operation(summary = "Get paginated purchase orders")
    public ResponseEntity<ApiResponse<Page<PurchaseOrder>>> getAllOrders(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size) {
        return ResponseEntity.ok(ApiResponse.ok(purchaseOrderService.getAllPurchaseOrders(PageRequest.of(page, size))));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get purchase order details by ID")
    public ResponseEntity<ApiResponse<PurchaseOrder>> getOrderById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(purchaseOrderService.getPurchaseOrderById(id)));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_MANAGER', 'ROLE_INVENTORY_STAFF')")
    @Operation(summary = "Create a new purchase order")
    public ResponseEntity<ApiResponse<PurchaseOrder>> createOrder(@Valid @RequestBody PurchaseOrderRequest request) {
        PurchaseOrder created = purchaseOrderService.createPurchaseOrder(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Purchase order created successfully", created));
    }

    @PostMapping("/{id}/approve")
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_MANAGER')")
    @Operation(summary = "Approve a submitted purchase order (Manager/Admin only)")
    public ResponseEntity<ApiResponse<PurchaseOrder>> approveOrder(@PathVariable Long id) {
        PurchaseOrder approved = purchaseOrderService.approvePurchaseOrder(id);
        return ResponseEntity.ok(ApiResponse.ok("Purchase order approved", approved));
    }

    @PostMapping("/receipts")
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_MANAGER', 'ROLE_INVENTORY_STAFF')")
    @Operation(summary = "Receive goods against an approved purchase order and update inventory")
    public ResponseEntity<ApiResponse<GoodsReceipt>> receiveGoods(@Valid @RequestBody GoodsReceiptRequest request) {
        GoodsReceipt receipt = purchaseOrderService.receiveGoods(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Goods received and inventory balance updated successfully", receipt));
    }
}
