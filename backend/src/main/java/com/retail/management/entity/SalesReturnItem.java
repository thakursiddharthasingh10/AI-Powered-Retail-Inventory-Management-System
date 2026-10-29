package com.retail.management.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "sales_return_items")
public class SalesReturnItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sales_return_id", nullable = false)
    @JsonIgnore
    private SalesReturn salesReturn;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(nullable = false)
    private Integer quantity;

    @Column(name = "refund_unit_price", nullable = false, precision = 12, scale = 2)
    private BigDecimal refundUnitPrice = BigDecimal.ZERO;

    @Column(name = "restock_inventory")
    private Boolean restockInventory = true;

    public SalesReturnItem() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public SalesReturn getSalesReturn() { return salesReturn; }
    public void setSalesReturn(SalesReturn salesReturn) { this.salesReturn = salesReturn; }

    public Product getProduct() { return product; }
    public void setProduct(Product product) { this.product = product; }

    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }

    public BigDecimal getRefundUnitPrice() { return refundUnitPrice; }
    public void setRefundUnitPrice(BigDecimal refundUnitPrice) { this.refundUnitPrice = refundUnitPrice; }

    public Boolean getRestockInventory() { return restockInventory; }
    public void setRestockInventory(Boolean restockInventory) { this.restockInventory = restockInventory; }
}
