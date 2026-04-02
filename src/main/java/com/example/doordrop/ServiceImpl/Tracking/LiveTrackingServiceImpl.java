package com.example.doordrop.ServiceImpl.Tracking;

import com.example.doordrop.Entity.*;
import com.example.doordrop.Model.DTO.AgentLocationUpdateRequest;
import com.example.doordrop.Model.DTO.LiveTrackingResponse;
import com.example.doordrop.Model.Enums.DeliveryStatus;
import com.example.doordrop.Model.Enums.OrderStatus;
import com.example.doordrop.Repository.*;
import com.example.doordrop.Service.External.GoogleMapsService;
import com.example.doordrop.Service.Tracking.LiveTrackingService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class LiveTrackingServiceImpl implements LiveTrackingService {

    private final DeliveryAgentRepository agentRepository;
    private final DeliveryTrackingRepository trackingRepository;
    private final OrderRepository orderRepository;
    private final GoogleMapsService googleMapsService;

    @Override
    @Transactional
    public void updateAgentLocation(Long agentUserId, AgentLocationUpdateRequest request) {
        DeliveryAgent agent = agentRepository.findByUserId(agentUserId)
                .orElseThrow(() -> new RuntimeException("Delivery agent profile not found."));

        // Update agent's live position
        agent.setCurrentLatitude(request.getLatitude());
        agent.setCurrentLongitude(request.getLongitude());
        agentRepository.save(agent);

        // Update the active delivery tracking record
        trackingRepository.findByDeliveryAgentIdAndDeliveredTimeIsNull(agent.getId())
                .ifPresent(tracking -> {
                    tracking.setCurrentLatitude(request.getLatitude());
                    tracking.setCurrentLongitude(request.getLongitude());

                    // Recalculate ETA to delivery address using Google Maps
                    Address dest = tracking.getOrder().getDeliveryAddress();
                    if (dest.getLatitude() != null && dest.getLongitude() != null) {
                        GoogleMapsService.DistanceResult dist = googleMapsService.getRoadDistance(
                                request.getLatitude(), request.getLongitude(),
                                dest.getLatitude(), dest.getLongitude());
                        tracking.setEstimatedArrival(
                                LocalDateTime.now().plusMinutes(dist.durationMinutes()));
                    }
                    trackingRepository.save(tracking);
                });
    }

    @Override
    @Transactional
    public void updateDeliveryStatus(Long agentUserId, DeliveryStatus newStatus) {
        DeliveryAgent agent = agentRepository.findByUserId(agentUserId)
                .orElseThrow(() -> new RuntimeException("Delivery agent profile not found."));

        DeliveryTracking tracking = trackingRepository
                .findByDeliveryAgentIdAndDeliveredTimeIsNull(agent.getId())
                .orElseThrow(() -> new RuntimeException("No active delivery found for this agent."));

        tracking.setStatus(newStatus);

        if (newStatus == DeliveryStatus.PICKED_UP) {
            tracking.setPickupTime(LocalDateTime.now());
        }

        if (newStatus == DeliveryStatus.DELIVERED) {
            tracking.setDeliveredTime(LocalDateTime.now());

            // Free up the agent
            agent.setAvailable(true);
            agent.setTotalDeliveries(agent.getTotalDeliveries() + 1);
            agentRepository.save(agent);

            // Update order status
            Order order = tracking.getOrder();
            order.setStatus(OrderStatus.DELIVERED);
            order.setActualDeliveryTime(LocalDateTime.now());
            orderRepository.save(order);
        }

        trackingRepository.save(tracking);
    }

    @Override
    public LiveTrackingResponse getOrderTracking(Long orderId, Long userId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found: " + orderId));

        if (!order.getUser().getId().equals(userId)) {
            throw new RuntimeException("Access denied: this order does not belong to you.");
        }

        DeliveryTracking tracking = trackingRepository.findByOrderId(orderId)
                .orElseThrow(() -> new RuntimeException(
                        "Tracking not yet available. Delivery agent has not been assigned yet."));

        DeliveryAgent agent = tracking.getDeliveryAgent();
        Address dest = order.getDeliveryAddress();

        // Calculate ETA using Google Maps if we have both coordinates
        Double distanceKm = null;
        Integer etaMinutes = null;
        String etaText = "Calculating…";

        if (agent.getCurrentLatitude() != null && dest.getLatitude() != null) {
            GoogleMapsService.DistanceResult dist = googleMapsService.getRoadDistance(
                    agent.getCurrentLatitude(), agent.getCurrentLongitude(),
                    dest.getLatitude(), dest.getLongitude());
            distanceKm  = dist.distanceKm();
            etaMinutes  = dist.durationMinutes();
            etaText = etaMinutes <= 1 ? "Arriving now" : "~" + etaMinutes + " mins away";
        }

        return LiveTrackingResponse.builder()
                .orderId(order.getId())
                .orderNumber(order.getOrderNumber())
                .orderStatus(order.getStatus())
                .deliveryStatus(tracking.getStatus())
                .agentId(agent.getId())
                .agentName(agent.getUser().getName())
                .agentPhone(agent.getUser().getPhone())
                .vehicleType(agent.getVehicleType() != null ? agent.getVehicleType().name() : null)
                .vehicleNumber(agent.getVehicleNumber())
                .agentLatitude(agent.getCurrentLatitude())
                .agentLongitude(agent.getCurrentLongitude())
                .deliveryAddress(dest.getStreet() + ", " + dest.getCity())
                .destinationLatitude(dest.getLatitude())
                .destinationLongitude(dest.getLongitude())
                .distanceKm(distanceKm)
                .etaMinutes(etaMinutes)
                .etaText(etaText)
                .estimatedArrival(tracking.getEstimatedArrival())
                .pickupTime(tracking.getPickupTime())
                .deliveredTime(tracking.getDeliveredTime())
                .lastUpdated(tracking.getUpdatedAt())
                .build();
    }
}
