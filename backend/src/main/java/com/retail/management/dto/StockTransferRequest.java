package com.retail.management.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.util.List;

public class StockTransferRequest {
    @NotNull(message = "Source warehouse ID is required")
    private Long sourceWarehouseId;

    @NotNull(message = "Destination warehouse ID is required")
    private Long destinationWarehouseId;

    private String notes;

    @NotEmpty(message = "Transfer items cannot be empty")
    private List<StockTransferItemRequest> items;

    public StockTransferRequest() {}

    public Long getSourceWarehouseId() { return sourceWarehouseId; }
    public void setSourceWarehouseId(Long sourceWarehouseId) { this.sourceWarehouseId = sourceWarehouseId; }

    public Long getDestinationWarehouseId() { return destinationWarehouseId; }
    public void setDestinationWarehouseId(Long destinationWarehouseId) { this.destinationWarehouseId = destinationWarehouseId; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public List<StockTransferItemRequest> getItems() { return items; }
    public void setItems(List<StockTransferItemRequest> items) { this.items = items; }

    public static class StockTransferItemRequest {
        private Long productId;
        private Integer quantityRequested;

        public StockTransferItemRequest() {}
        public StockTransferItemRequest(Long productId, Integer quantityRequested) {
            this.productId = productId;
            this.quantityRequested = quantityRequested;
        }

        public Long getProductId() { return productId; }
        public void setProductId(Long productId) { this.productId = productId; }

        public Integer getQuantityRequested() { return quantityRequested; }
        public void setQuantityRequested(Integer quantityRequested) { this.quantityRequested = quantityRequested; }
    }
}
