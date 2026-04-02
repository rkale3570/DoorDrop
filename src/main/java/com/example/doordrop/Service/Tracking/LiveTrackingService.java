package com.example.doordrop.Service.Tracking;

import com.example.doordrop.Model.DTO.AgentLocationUpdateRequest;
import com.example.doordrop.Model.DTO.LiveTrackingResponse;
import com.example.doordrop.Model.Enums.DeliveryStatus;

public interface LiveTrackingService {

    /** Delivery agent app calls this every few seconds to broadcast their position. */
    void updateAgentLocation(Long agentUserId, AgentLocationUpdateRequest request);

    /** Delivery agent advances the delivery status (e.g. PICKED_UP → OUT_FOR_DELIVERY). */
    void updateDeliveryStatus(Long agentUserId, DeliveryStatus newStatus);

    /** Customer polls this to get current agent position + ETA. */
    LiveTrackingResponse getOrderTracking(Long orderId, Long userId);
}
