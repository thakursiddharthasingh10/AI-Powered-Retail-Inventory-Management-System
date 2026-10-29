package com.retail.management.dto;

import java.time.LocalDate;
import java.util.List;

public class ForecastResponseDto {
    private Long productId;
    private String productSku;
    private String productName;
    private Integer horizonDays;
    private String modelName;
    private Double mae;
    private Double rmse;
    private Double baselineMae;
    private Double totalPredictedDemand;
    private List<DailyForecastPoint> forecastPoints;
    private String confidenceInterpretation;

    public ForecastResponseDto() {}

    public Long getProductId() { return productId; }
    public void setProductId(Long productId) { this.productId = productId; }

    public String getProductSku() { return productSku; }
    public void setProductSku(String productSku) { this.productSku = productSku; }

    public String getProductName() { return productName; }
    public void setProductName(String productName) { this.productName = productName; }

    public Integer getHorizonDays() { return horizonDays; }
    public void setHorizonDays(Integer horizonDays) { this.horizonDays = horizonDays; }

    public String getModelName() { return modelName; }
    public void setModelName(String modelName) { this.modelName = modelName; }

    public Double getMae() { return mae; }
    public void setMae(Double mae) { this.mae = mae; }

    public Double getRmse() { return rmse; }
    public void setRmse(Double rmse) { this.rmse = rmse; }

    public Double getBaselineMae() { return baselineMae; }
    public void setBaselineMae(Double baselineMae) { this.baselineMae = baselineMae; }

    public Double getTotalPredictedDemand() { return totalPredictedDemand; }
    public void setTotalPredictedDemand(Double totalPredictedDemand) { this.totalPredictedDemand = totalPredictedDemand; }

    public List<DailyForecastPoint> getForecastPoints() { return forecastPoints; }
    public void setForecastPoints(List<DailyForecastPoint> forecastPoints) { this.forecastPoints = forecastPoints; }

    public String getConfidenceInterpretation() { return confidenceInterpretation; }
    public void setConfidenceInterpretation(String confidenceInterpretation) { this.confidenceInterpretation = confidenceInterpretation; }

    public static class DailyForecastPoint {
        private LocalDate date;
        private Double predictedQuantity;
        private Double lowerBound;
        private Double upperBound;

        public DailyForecastPoint() {}
        public DailyForecastPoint(LocalDate date, Double predictedQuantity, Double lowerBound, Double upperBound) {
            this.date = date;
            this.predictedQuantity = predictedQuantity;
            this.lowerBound = lowerBound;
            this.upperBound = upperBound;
        }

        public LocalDate getDate() { return date; }
        public void setDate(LocalDate date) { this.date = date; }

        public Double getPredictedQuantity() { return predictedQuantity; }
        public void setPredictedQuantity(Double predictedQuantity) { this.predictedQuantity = predictedQuantity; }

        public Double getLowerBound() { return lowerBound; }
        public void setLowerBound(Double lowerBound) { this.lowerBound = lowerBound; }

        public Double getUpperBound() { return upperBound; }
        public void setUpperBound(Double upperBound) { this.upperBound = upperBound; }
    }
}
