package com.example.doordrop.Repository;

import com.example.doordrop.Entity.StoreOrderGroup;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface StoreOrderGroupRepository extends JpaRepository<StoreOrderGroup, Long> {

    List<StoreOrderGroup> findByOrderId(Long orderId);

    /** Store owner fetches all order groups for their store, newest first. */
    List<StoreOrderGroup> findByStoreIdOrderByCreatedAtDesc(Long storeId);

    Optional<StoreOrderGroup> findByOrderIdAndStoreId(Long orderId, Long storeId);
}
