package com.example.doordrop.Model.DTO;

import com.example.doordrop.Model.Enums.DeliveryStatus;
import com.example.doordrop.Model.Enums.OrderStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class LiveTrackingResponse {

    private Long orderId;
    private String orderNumber;
    private OrderStatus orderStatus;
    private DeliveryStatus deliveryStatus;

    // ── Delivery agent ─────────────────────────────────────────────────────────
    private Long agentId;
    private String agentName;
    private String agentPhone;
    private String vehicleType;
    private String vehicleNumber;
    private Double agentLatitude;
    private Double agentLongitude;

    // ── Destination ────────────────────────────────────────────────────────────
    private String deliveryAddress;
    private Double destinationLatitude;
    private Double destinationLongitude;

    // ── ETA ────────────────────────────────────────────────────────────────────
    /** Road distance in km from agent's current position to delivery address. */
    private Double distanceKm;
    private Integer etaMinutes;
    private String etaText;

    // ── Timestamps ─────────────────────────────────────────────────────────────
    private LocalDateTime estimatedArrival;
    private LocalDateTime pickupTime;
    private LocalDateTime deliveredTime;
    private LocalDateTime lastUpdated;
}
