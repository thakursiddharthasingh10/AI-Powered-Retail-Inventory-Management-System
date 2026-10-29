package com.retail.management.repository;

import com.retail.management.entity.SalesReturn;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SalesReturnRepository extends JpaRepository<SalesReturn, Long> {
    Optional<SalesReturn> findByReturnNumber(String returnNumber);
    List<SalesReturn> findBySaleId(Long saleId);
    Page<SalesReturn> findAllByOrderByCreatedAtDesc(Pageable pageable);
}
