package com.retail.management.repository;

import com.retail.management.entity.StockMovement;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StockMovementRepository extends JpaRepository<StockMovement, Long> {
    List<StockMovement> findByProductIdOrderByCreatedAtDesc(Long productId);
    List<StockMovement> findByWarehouseIdOrderByCreatedAtDesc(Long warehouseId);
    Page<StockMovement> findAllByOrderByCreatedAtDesc(Pageable pageable);
}
