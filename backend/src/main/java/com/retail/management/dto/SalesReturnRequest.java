package com.retail.management.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.util.List;

public class SalesReturnRequest {
    @NotNull(message = "Sale ID is required")
    private Long saleId;

    @NotNull(message = "Warehouse ID is required")
    private Long warehouseId;

    @NotBlank(message = "Return reason is required")
    private String reason;

    @NotEmpty(message = "Return items cannot be empty")
    private List<SalesReturnItemRequest> items;

    public SalesReturnRequest() {}

    public Long getSaleId() { return saleId; }
    public void setSaleId(Long saleId) { this.saleId = saleId; }

    public Long getWarehouseId() { return warehouseId; }
    public void setWarehouseId(Long warehouseId) { this.warehouseId = warehouseId; }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }

    public List<SalesReturnItemRequest> getItems() { return items; }
    public void setItems(List<SalesReturnItemRequest> items) { this.items = items; }

    public static class SalesReturnItemRequest {
        private Long productId;
        private Integer quantity;
        private Boolean restockInventory = true;

        public SalesReturnItemRequest() {}

        public Long getProductId() { return productId; }
        public void setProductId(Long productId) { this.productId = productId; }

        public Integer getQuantity() { return quantity; }
        public void setQuantity(Integer quantity) { this.quantity = quantity; }

        public Boolean getRestockInventory() { return restockInventory; }
        public void setRestockInventory(Boolean restockInventory) { this.restockInventory = restockInventory; }
    }
}
