package com.retail.management.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public class ForecastRequestDto {
    @NotNull(message = "Product ID is required")
    private Long productId;

    @NotNull(message = "Horizon days is required")
    @Min(value = 1, message = "Horizon must be at least 1 day")
    private Integer horizonDays = 14;

    private String modelPreference = "LINEAR_REGRESSION"; // MOVING_AVERAGE, LINEAR_REGRESSION

    public ForecastRequestDto() {}

    public Long getProductId() { return productId; }
    public void setProductId(Long productId) { this.productId = productId; }

    public Integer getHorizonDays() { return horizonDays; }
    public void setHorizonDays(Integer horizonDays) { this.horizonDays = horizonDays; }

    public String getModelPreference() { return modelPreference; }
    public void setModelPreference(String modelPreference) { this.modelPreference = modelPreference; }
}
