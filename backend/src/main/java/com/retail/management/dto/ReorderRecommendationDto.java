package com.retail.management.dto;

public class ReorderRecommendationDto {
    private Long productId;
    private String productSku;
    private String productName;
    private Long warehouseId;
    private String warehouseName;
    private Integer currentStock;
    private Integer reservedStock;
    private Integer availableStock;
    private Double avgDailyDemand;
    private Integer leadTimeDays;
    private Double leadTimeDemand;
    private Integer safetyStock;
    private Double reorderPoint;
    private Integer recommendedOrderQty;
    private Long suggestedSupplierId;
    private String suggestedSupplierName;
    private String urgency; // CRITICAL, MEDIUM, NORMAL
    private String formulaExplanation;

    public ReorderRecommendationDto() {}

    public Long getProductId() { return productId; }
    public void setProductId(Long productId) { this.productId = productId; }

    public String getProductSku() { return productSku; }
    public void setProductSku(String productSku) { this.productSku = productSku; }

    public String getProductName() { return productName; }
    public void setProductName(String productName) { this.productName = productName; }

    public Long getWarehouseId() { return warehouseId; }
    public void setWarehouseId(Long warehouseId) { this.warehouseId = warehouseId; }

    public String getWarehouseName() { return warehouseName; }
    public void setWarehouseName(String warehouseName) { this.warehouseName = warehouseName; }

    public Integer getCurrentStock() { return currentStock; }
    public void setCurrentStock(Integer currentStock) { this.currentStock = currentStock; }

    public Integer getReservedStock() { return reservedStock; }
    public void setReservedStock(Integer reservedStock) { this.reservedStock = reservedStock; }

    public Integer getAvailableStock() { return availableStock; }
    public void setAvailableStock(Integer availableStock) { this.availableStock = availableStock; }

    public Double getAvgDailyDemand() { return avgDailyDemand; }
    public void setAvgDailyDemand(Double avgDailyDemand) { this.avgDailyDemand = avgDailyDemand; }

    public Integer getLeadTimeDays() { return leadTimeDays; }
    public void setLeadTimeDays(Integer leadTimeDays) { this.leadTimeDays = leadTimeDays; }

    public Double getLeadTimeDemand() { return leadTimeDemand; }
    public void setLeadTimeDemand(Double leadTimeDemand) { this.leadTimeDemand = leadTimeDemand; }

    public Integer getSafetyStock() { return safetyStock; }
    public void setSafetyStock(Integer safetyStock) { this.safetyStock = safetyStock; }

    public Double getReorderPoint() { return reorderPoint; }
    public void setReorderPoint(Double reorderPoint) { this.reorderPoint = reorderPoint; }

    public Integer getRecommendedOrderQty() { return recommendedOrderQty; }
    public void setRecommendedOrderQty(Integer recommendedOrderQty) { this.recommendedOrderQty = recommendedOrderQty; }

    public Long getSuggestedSupplierId() { return suggestedSupplierId; }
    public void setSuggestedSupplierId(Long suggestedSupplierId) { this.suggestedSupplierId = suggestedSupplierId; }

    public String getSuggestedSupplierName() { return suggestedSupplierName; }
    public void setSuggestedSupplierName(String suggestedSupplierName) { this.suggestedSupplierName = suggestedSupplierName; }

    public String getUrgency() { return urgency; }
    public void setUrgency(String urgency) { this.urgency = urgency; }

    public String getFormulaExplanation() { return formulaExplanation; }
    public void setFormulaExplanation(String formulaExplanation) { this.formulaExplanation = formulaExplanation; }
}
