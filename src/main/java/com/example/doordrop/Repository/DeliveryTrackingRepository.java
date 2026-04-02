package com.example.doordrop.Repository;

import com.example.doordrop.Entity.DeliveryTracking;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface DeliveryTrackingRepository extends JpaRepository<DeliveryTracking, Long> {

    Optional<DeliveryTracking> findByOrderId(Long orderId);

    Optional<DeliveryTracking> findByDeliveryAgentIdAndDeliveredTimeIsNull(Long agentId);
}
