package com.example.doordrop.Service.Delivery;

public interface DeliveryAssignmentService {

    /**
     * Finds the nearest available delivery agent to the order's first store
     * (DoorDrop Now only), assigns them, and creates a DeliveryTracking record.
     * Safe to call for Marketplace orders — it does nothing in that case.
     */
    void assignAgentToOrder(Long orderId);
}
