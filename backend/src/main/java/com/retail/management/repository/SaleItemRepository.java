package com.retail.management.repository;

import com.retail.management.entity.SaleItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface SaleItemRepository extends JpaRepository<SaleItem, Long> {

    List<SaleItem> findBySaleId(Long saleId);

    List<SaleItem> findByProductId(Long productId);

    @Query("SELECT si.product.id, si.productNameSnapshot, SUM(si.quantity), SUM(si.subtotal) " +
           "FROM SaleItem si GROUP BY si.product.id, si.productNameSnapshot ORDER BY SUM(si.quantity) DESC")
    List<Object[]> getTopSellingProducts();

    @Query("SELECT si FROM SaleItem si WHERE si.product.id = :productId AND si.sale.saleDate >= :since ORDER BY si.sale.saleDate ASC")
    List<SaleItem> findSalesForProductSince(@Param("productId") Long productId, @Param("since") LocalDateTime since);
}
