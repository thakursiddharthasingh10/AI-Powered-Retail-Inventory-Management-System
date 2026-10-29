package com.retail.management.service;

import com.retail.management.dto.DashboardMetricsDto;
import com.retail.management.dto.StockMovementDto;
import com.retail.management.entity.Inventory;
import com.retail.management.entity.Product;
import com.retail.management.entity.Sale;
import com.retail.management.entity.SaleItem;
import com.retail.management.repository.*;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.*;

@Service
public class ReportService {

    private final ProductRepository productRepository;
    private final InventoryRepository inventoryRepository;
    private final SaleRepository saleRepository;
    private final SaleItemRepository saleItemRepository;
    private final WarehouseRepository warehouseRepository;
    private final StockMovementRepository stockMovementRepository;
    private final InventoryService inventoryService;

    public ReportService(ProductRepository productRepository,
                         InventoryRepository inventoryRepository,
                         SaleRepository saleRepository,
                         SaleItemRepository saleItemRepository,
                         WarehouseRepository warehouseRepository,
                         StockMovementRepository stockMovementRepository,
                         InventoryService inventoryService) {
        this.productRepository = productRepository;
        this.inventoryRepository = inventoryRepository;
        this.saleRepository = saleRepository;
        this.saleItemRepository = saleItemRepository;
        this.warehouseRepository = warehouseRepository;
        this.stockMovementRepository = stockMovementRepository;
        this.inventoryService = inventoryService;
    }

    public DashboardMetricsDto getDashboardMetrics() {
        DashboardMetricsDto dto = new DashboardMetricsDto();

        dto.setTotalProducts(productRepository.count());
        Long totalUnits = inventoryRepository.getTotalUnitsAcrossAllWarehouses();
        dto.setTotalInventoryUnits(totalUnits != null ? totalUnits : 0L);

        dto.setLowStockCount(inventoryRepository.findLowStockInventory().size());
        dto.setOutOfStockCount(inventoryRepository.findOutOfStockInventory().size());

        // Sales today
        LocalDateTime startOfToday = LocalDateTime.of(LocalDate.now(), LocalTime.MIN);
        BigDecimal todayRev = saleRepository.getRevenueSince(startOfToday);
        dto.setSalesToday(todayRev != null ? todayRev : BigDecimal.ZERO);

        // Sales this month
        LocalDateTime startOfMonth = LocalDateTime.of(LocalDate.now().withDayOfMonth(1), LocalTime.MIN);
        BigDecimal monthRev = saleRepository.getRevenueSince(startOfMonth);
        dto.setSalesThisMonth(monthRev != null ? monthRev : BigDecimal.ZERO);

        // Total revenue
        BigDecimal totalRev = saleRepository.getTotalSalesRevenue();
        dto.setTotalRevenue(totalRev != null ? totalRev : BigDecimal.ZERO);

        // Valuation
        BigDecimal totalCostVal = BigDecimal.ZERO;
        BigDecimal totalRetailVal = BigDecimal.ZERO;
        List<Inventory> allInventory = inventoryRepository.findAll();
        for (Inventory inv : allInventory) {
            if (inv.getProduct() != null && Boolean.TRUE.equals(inv.getProduct().getIsActive())) {
                BigDecimal qty = BigDecimal.valueOf(inv.getQuantity());
                totalCostVal = totalCostVal.add(inv.getProduct().getCostPrice().multiply(qty));
                totalRetailVal = totalRetailVal.add(inv.getProduct().getSellingPrice().multiply(qty));
            }
        }
        dto.setInventoryCostValuation(totalCostVal);
        dto.setInventoryRetailValuation(totalRetailVal);

        // Top 5 selling products
        List<Object[]> topSelling = saleItemRepository.getTopSellingProducts();
        List<DashboardMetricsDto.TopProductDto> topList = new ArrayList<>();
        int count = 0;
        for (Object[] row : topSelling) {
            if (count++ >= 5) break;
            Long pId = (Long) row[0];
            String pName = (String) row[1];
            Long soldQty = ((Number) row[2]).longValue();
            BigDecimal salesVal = (BigDecimal) row[3];
            topList.add(new DashboardMetricsDto.TopProductDto(pId, pName, soldQty, salesVal));
        }
        dto.setTopSellingProducts(topList);

        // Recent 5 stock movements
        List<StockMovementDto> recent = inventoryService.getStockMovements(PageRequest.of(0, 5)).getContent();
        dto.setRecentMovements(recent);

        return dto;
    }

    public Map<String, Object> getSalesReport(LocalDate startDate, LocalDate endDate) {
        LocalDateTime start = (startDate != null ? startDate : LocalDate.now().minusDays(30)).atStartOfDay();
        LocalDateTime end = (endDate != null ? endDate : LocalDate.now()).atTime(LocalTime.MAX);

        List<Sale> sales = saleRepository.findBySaleDateBetweenOrderBySaleDateDesc(start, end);

        BigDecimal grossSales = BigDecimal.ZERO;
        BigDecimal discounts = BigDecimal.ZERO;
        BigDecimal taxes = BigDecimal.ZERO;
        BigDecimal netRevenue = BigDecimal.ZERO;
        BigDecimal totalCogs = BigDecimal.ZERO;
        int totalItemsSold = 0;

        for (Sale s : sales) {
            grossSales = grossSales.add(s.getSubtotal());
            discounts = discounts.add(s.getDiscountAmount());
            taxes = taxes.add(s.getTaxAmount());
            netRevenue = netRevenue.add(s.getTotalAmount());

            for (SaleItem item : s.getItems()) {
                totalItemsSold += item.getQuantity();
                BigDecimal itemCogs = item.getUnitCostSnapshot().multiply(BigDecimal.valueOf(item.getQuantity()));
                totalCogs = totalCogs.add(itemCogs);
            }
        }

        BigDecimal grossProfit = grossSales.subtract(totalCogs);
        BigDecimal profitMarginPct = grossSales.compareTo(BigDecimal.ZERO) > 0 ?
                grossProfit.multiply(new BigDecimal("100")).divide(grossSales, 2, RoundingMode.HALF_UP) : BigDecimal.ZERO;

        Map<String, Object> report = new HashMap<>();
        report.put("periodStart", start);
        report.put("periodEnd", end);
        report.put("totalTransactions", sales.size());
        report.put("totalUnitsSold", totalItemsSold);
        report.put("grossSalesValue", grossSales);
        report.put("totalDiscounts", discounts);
        report.put("totalTaxesCollected", taxes);
        report.put("netRevenue", netRevenue);
        report.put("costOfGoodsSold", totalCogs);
        report.put("estimatedGrossProfit", grossProfit);
        report.put("profitMarginPct", profitMarginPct);
        report.put("sales", sales);

        return report;
    }

    public List<Map<String, Object>> getInventoryValuationReport() {
        List<Map<String, Object>> list = new ArrayList<>();
        warehouseRepository.findAll().forEach(wh -> {
            List<Inventory> invs = inventoryRepository.findByWarehouseId(wh.getId());
            BigDecimal costVal = BigDecimal.ZERO;
            BigDecimal retailVal = BigDecimal.ZERO;
            int totalUnits = 0;

            for (Inventory inv : invs) {
                if (inv.getProduct() != null) {
                    BigDecimal qty = BigDecimal.valueOf(inv.getQuantity());
                    totalUnits += inv.getQuantity();
                    costVal = costVal.add(inv.getProduct().getCostPrice().multiply(qty));
                    retailVal = retailVal.add(inv.getProduct().getSellingPrice().multiply(qty));
                }
            }

            Map<String, Object> row = new HashMap<>();
            row.put("warehouseId", wh.getId());
            row.put("warehouseCode", wh.getCode());
            row.put("warehouseName", wh.getName());
            row.put("skuCount", invs.size());
            row.put("totalUnits", totalUnits);
            row.put("costValuation", costVal);
            row.put("retailValuation", retailVal);
            row.put("potentialGrossMargin", retailVal.subtract(costVal));
            list.add(row);
        });
        return list;
    }
}
