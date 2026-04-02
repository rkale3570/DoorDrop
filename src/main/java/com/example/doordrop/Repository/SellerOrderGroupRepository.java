package com.example.doordrop.Repository;

import com.example.doordrop.Entity.SellerOrderGroup;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface SellerOrderGroupRepository extends JpaRepository<SellerOrderGroup, Long> {

    List<SellerOrderGroup> findByOrderId(Long orderId);

    /** Seller fetches all order groups assigned to them, newest first. */
    List<SellerOrderGroup> findBySellerIdOrderByCreatedAtDesc(Long sellerId);

    Optional<SellerOrderGroup> findByOrderIdAndSellerId(Long orderId, Long sellerId);
}
