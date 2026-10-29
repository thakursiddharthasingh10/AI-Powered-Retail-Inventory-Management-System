package com.retail.management.controller;

import com.retail.management.dto.ApiResponse;
import com.retail.management.dto.SaleRequest;
import com.retail.management.dto.SalesReturnRequest;
import com.retail.management.entity.Sale;
import com.retail.management.entity.SalesReturn;
import com.retail.management.service.SaleService;
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
@RequestMapping("/api/v1/sales")
@Tag(name = "Point of Sale & Invoicing", description = "Endpoints for processing checkout, generating tax invoices, and sales returns")
public class SaleController {

    private final SaleService saleService;

    public SaleController(SaleService saleService) {
        this.saleService = saleService;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_MANAGER', 'ROLE_CASHIER')")
    @Operation(summary = "Process POS checkout sale transaction, generate invoice and deduct inventory")
    public ResponseEntity<ApiResponse<Sale>> processSale(@Valid @RequestBody SaleRequest request) {
        Sale sale = saleService.processSale(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Sale completed and invoice generated successfully", sale));
    }

    @GetMapping
    @Operation(summary = "Get paginated sales transactions")
    public ResponseEntity<ApiResponse<Page<Sale>>> getAllSales(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size) {
        return ResponseEntity.ok(ApiResponse.ok(saleService.getAllSales(PageRequest.of(page, size))));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get sale details by ID")
    public ResponseEntity<ApiResponse<Sale>> getSaleById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(saleService.getSaleById(id)));
    }

    @GetMapping("/invoice/{invoiceNumber}")
    @Operation(summary = "Lookup sale by invoice number")
    public ResponseEntity<ApiResponse<Sale>> getByInvoice(@PathVariable String invoiceNumber) {
        return ResponseEntity.ok(ApiResponse.ok(saleService.getSaleByInvoiceNumber(invoiceNumber)));
    }

    @PostMapping("/returns")
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_MANAGER', 'ROLE_CASHIER')")
    @Operation(summary = "Process sales return and restock inventory")
    public ResponseEntity<ApiResponse<SalesReturn>> processReturn(@Valid @RequestBody SalesReturnRequest request) {
        SalesReturn returnRecord = saleService.processReturn(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Return processed and inventory restocked successfully", returnRecord));
    }
}
