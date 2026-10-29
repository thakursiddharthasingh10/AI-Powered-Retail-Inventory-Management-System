package com.retail.management.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.util.List;

public class GoodsReceiptRequest {
    @NotNull(message = "Purchase order ID is required")
    private Long purchaseOrderId;

    @NotNull(message = "Warehouse ID is required")
    private Long warehouseId;

    private String notes;

    @NotEmpty(message = "Receipt items cannot be empty")
    private List<GoodsReceiptItemRequest> items;

    public GoodsReceiptRequest() {}

    public Long getPurchaseOrderId() { return purchaseOrderId; }
    public void setPurchaseOrderId(Long purchaseOrderId) { this.purchaseOrderId = purchaseOrderId; }

    public Long getWarehouseId() { return warehouseId; }
    public void setWarehouseId(Long warehouseId) { this.warehouseId = warehouseId; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public List<GoodsReceiptItemRequest> getItems() { return items; }
    public void setItems(List<GoodsReceiptItemRequest> items) { this.items = items; }

    public static class GoodsReceiptItemRequest {
        private Long productId;
        private Integer quantityReceived;

        public GoodsReceiptItemRequest() {}
        public GoodsReceiptItemRequest(Long productId, Integer quantityReceived) {
            this.productId = productId;
            this.quantityReceived = quantityReceived;
        }

        public Long getProductId() { return productId; }
        public void setProductId(Long productId) { this.productId = productId; }

        public Integer getQuantityReceived() { return quantityReceived; }
        public void setQuantityReceived(Integer quantityReceived) { this.quantityReceived = quantityReceived; }
    }
}
