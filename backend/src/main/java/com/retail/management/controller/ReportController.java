package com.retail.management.controller;

import com.retail.management.dto.ApiResponse;
import com.retail.management.dto.DashboardMetricsDto;
import com.retail.management.service.ReportService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/reports")
@Tag(name = "Analytics & Executive Reports", description = "Endpoints for KPI dashboards, sales reports, gross profit and inventory valuation")
public class ReportController {

    private final ReportService reportService;

    public ReportController(ReportService reportService) {
        this.reportService = reportService;
    }

    @GetMapping("/dashboard")
    @Operation(summary = "Get aggregated KPI dashboard metrics, revenue, valuation and alerts")
    public ResponseEntity<ApiResponse<DashboardMetricsDto>> getDashboardMetrics() {
        return ResponseEntity.ok(ApiResponse.ok(reportService.getDashboardMetrics()));
    }

    @GetMapping("/sales")
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_MANAGER')")
    @Operation(summary = "Get detailed sales report with revenue, COGS, and gross profit by date range")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getSalesReport(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return ResponseEntity.ok(ApiResponse.ok(reportService.getSalesReport(startDate, endDate)));
    }

    @GetMapping("/inventory-valuation")
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_MANAGER')")
    @Operation(summary = "Get multi-warehouse inventory valuation based on unit cost and retail price")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getInventoryValuation() {
        return ResponseEntity.ok(ApiResponse.ok(reportService.getInventoryValuationReport()));
    }
}
