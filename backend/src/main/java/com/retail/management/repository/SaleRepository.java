package com.retail.management.repository;

import com.retail.management.entity.Sale;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface SaleRepository extends JpaRepository<Sale, Long> {

    Optional<Sale> findByInvoiceNumber(String invoiceNumber);
    boolean existsByInvoiceNumber(String invoiceNumber);

    List<Sale> findBySaleDateBetweenOrderBySaleDateDesc(LocalDateTime start, LocalDateTime end);

    Page<Sale> findAllByOrderBySaleDateDesc(Pageable pageable);

    @Query("SELECT SUM(s.totalAmount) FROM Sale s WHERE s.paymentStatus = 'PAID'")
    BigDecimal getTotalSalesRevenue();

    @Query("SELECT SUM(s.totalAmount) FROM Sale s WHERE s.paymentStatus = 'PAID' AND s.saleDate >= :start")
    BigDecimal getRevenueSince(@Param("start") LocalDateTime start);

    @Query("SELECT COUNT(s) FROM Sale s WHERE s.saleDate >= :start")
    Long countSalesSince(@Param("start") LocalDateTime start);
}
