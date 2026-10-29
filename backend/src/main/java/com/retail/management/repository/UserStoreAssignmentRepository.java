package com.retail.management.repository;

import com.retail.management.entity.UserStoreAssignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserStoreAssignmentRepository extends JpaRepository<UserStoreAssignment, Long> {
    List<UserStoreAssignment> findByUserId(Long userId);
    Optional<UserStoreAssignment> findByUserIdAndStoreId(Long userId, Long storeId);
}
