package com.example.doordrop.Repository;

import com.example.doordrop.Entity.DeliveryAgent;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface DeliveryAgentRepository extends JpaRepository<DeliveryAgent, Long> {

    Optional<DeliveryAgent> findByUserId(Long userId);

    /** All agents who are available and active — used for nearest-agent assignment. */
    List<DeliveryAgent> findByIsAvailableTrueAndIsActiveTrue();
}
