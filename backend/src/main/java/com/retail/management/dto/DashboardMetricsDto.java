package com.retail.management.dto;

import java.math.BigDecimal;
import java.util.List;

public class DashboardMetricsDto {
    private long totalProducts;
    private long totalInventoryUnits;
    private long lowStockCount;
    private long outOfStockCount;
    private BigDecimal salesToday = BigDecimal.ZERO;
    private BigDecimal salesThisMonth = BigDecimal.ZERO;
    private BigDecimal totalRevenue = BigDecimal.ZERO;
    private BigDecimal inventoryCostValuation = BigDecimal.ZERO;
    private BigDecimal inventoryRetailValuation = BigDecimal.ZERO;
    private List<TopProductDto> topSellingProducts;
    private List<StockMovementDto> recentMovements;

    public DashboardMetricsDto() {}

    public long getTotalProducts() { return totalProducts; }
    public void setTotalProducts(long totalProducts) { this.totalProducts = totalProducts; }

    public long getTotalInventoryUnits() { return totalInventoryUnits; }
    public void setTotalInventoryUnits(long totalInventoryUnits) { this.totalInventoryUnits = totalInventoryUnits; }

    public long getLowStockCount() { return lowStockCount; }
    public void setLowStockCount(long lowStockCount) { this.lowStockCount = lowStockCount; }

    public long getOutOfStockCount() { return outOfStockCount; }
    public void setOutOfStockCount(long outOfStockCount) { this.outOfStockCount = outOfStockCount; }

    public BigDecimal getSalesToday() { return salesToday; }
    public void setSalesToday(BigDecimal salesToday) { this.salesToday = salesToday; }

    public BigDecimal getSalesThisMonth() { return salesThisMonth; }
    public void setSalesThisMonth(BigDecimal salesThisMonth) { this.salesThisMonth = salesThisMonth; }

    public BigDecimal getTotalRevenue() { return totalRevenue; }
    public void setTotalRevenue(BigDecimal totalRevenue) { this.totalRevenue = totalRevenue; }

    public BigDecimal getInventoryCostValuation() { return inventoryCostValuation; }
    public void setInventoryCostValuation(BigDecimal inventoryCostValuation) { this.inventoryCostValuation = inventoryCostValuation; }

    public BigDecimal getInventoryRetailValuation() { return inventoryRetailValuation; }
    public void setInventoryRetailValuation(BigDecimal inventoryRetailValuation) { this.inventoryRetailValuation = inventoryRetailValuation; }

    public List<TopProductDto> getTopSellingProducts() { return topSellingProducts; }
    public void setTopSellingProducts(List<TopProductDto> topSellingProducts) { this.topSellingProducts = topSellingProducts; }

    public List<StockMovementDto> getRecentMovements() { return recentMovements; }
    public void setRecentMovements(List<StockMovementDto> recentMovements) { this.recentMovements = recentMovements; }

    public static class TopProductDto {
        private Long productId;
        private String productName;
        private Long unitsSold;
        private BigDecimal totalSales;

        public TopProductDto() {}
        public TopProductDto(Long productId, String productName, Long unitsSold, BigDecimal totalSales) {
            this.productId = productId;
            this.productName = productName;
            this.unitsSold = unitsSold;
            this.totalSales = totalSales;
        }

        public Long getProductId() { return productId; }
        public void setProductId(Long productId) { this.productId = productId; }

        public String getProductName() { return productName; }
        public void setProductName(String productName) { this.productName = productName; }

        public Long getUnitsSold() { return unitsSold; }
        public void setUnitsSold(Long unitsSold) { this.unitsSold = unitsSold; }

        public BigDecimal getTotalSales() { return totalSales; }
        public void setTotalSales(BigDecimal totalSales) { this.totalSales = totalSales; }
    }
}
