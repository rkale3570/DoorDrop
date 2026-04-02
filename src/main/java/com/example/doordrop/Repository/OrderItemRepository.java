package com.example.doordrop.Repository;

import com.example.doordrop.Entity.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {

    List<OrderItem> findByOrderId(Long orderId);

    List<OrderItem> findByStoreOrderGroupId(Long storeOrderGroupId);

    List<OrderItem> findBySellerOrderGroupId(Long sellerOrderGroupId);
}
