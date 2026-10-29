package com.retail.management.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

@Entity
@Table(name = "stock_transfer_items")
public class StockTransferItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "stock_transfer_id", nullable = false)
    @JsonIgnore
    private StockTransfer stockTransfer;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(name = "quantity_requested", nullable = false)
    private Integer quantityRequested;

    @Column(name = "quantity_dispatched", nullable = false)
    private Integer quantityDispatched = 0;

    @Column(name = "quantity_received", nullable = false)
    private Integer quantityReceived = 0;

    public StockTransferItem() {}

    public StockTransferItem(StockTransfer stockTransfer, Product product, Integer quantityRequested) {
        this.stockTransfer = stockTransfer;
        this.product = product;
        this.quantityRequested = quantityRequested;
        this.quantityDispatched = 0;
        this.quantityReceived = 0;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public StockTransfer getStockTransfer() { return stockTransfer; }
    public void setStockTransfer(StockTransfer stockTransfer) { this.stockTransfer = stockTransfer; }

    public Product getProduct() { return product; }
    public void setProduct(Product product) { this.product = product; }

    public Integer getQuantityRequested() { return quantityRequested; }
    public void setQuantityRequested(Integer quantityRequested) { this.quantityRequested = quantityRequested; }

    public Integer getQuantityDispatched() { return quantityDispatched; }
    public void setQuantityDispatched(Integer quantityDispatched) { this.quantityDispatched = quantityDispatched; }

    public Integer getQuantityReceived() { return quantityReceived; }
    public void setQuantityReceived(Integer quantityReceived) { this.quantityReceived = quantityReceived; }
}
