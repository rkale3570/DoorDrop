package com.example.doordrop.ServiceImpl.Delivery;

import com.example.doordrop.Entity.*;
import com.example.doordrop.Model.Enums.DeliveryStatus;
import com.example.doordrop.Model.Enums.OrderType;
import com.example.doordrop.Repository.*;
import com.example.doordrop.Service.Delivery.DeliveryAssignmentService;
import com.example.doordrop.Service.External.GoogleMapsService;
import com.example.doordrop.Util.LocationUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class DeliveryAssignmentServiceImpl implements DeliveryAssignmentService {

    private final OrderRepository orderRepository;
    private final DeliveryAgentRepository agentRepository;
    private final DeliveryTrackingRepository trackingRepository;
    private final StoreOrderGroupRepository storeOrderGroupRepository;
    private final GoogleMapsService googleMapsService;

    @Value("${delivery.agent.search.radius.km:15}")
    private double searchRadiusKm;

    @Override
    @Transactional
    public void assignAgentToOrder(Long orderId) {
        Order order = orderRepository.findById(orderId).orElse(null);
        if (order == null) return;

        // Delivery agent assignment is only for DoorDrop Now
        if (order.getOrderType() == OrderType.MARKETPLACE) return;

        // Skip if already assigned
        if (order.getDeliveryAgent() != null) return;

        // Get source location (first store's coordinates)
        List<StoreOrderGroup> groups = storeOrderGroupRepository.findByOrderId(orderId);
        if (groups.isEmpty()) return;

        Store store = groups.get(0).getStore();
        if (store.getLatitude() == null || store.getLongitude() == null) {
            log.warn("Store {} has no GPS coordinates — cannot assign delivery agent.", store.getId());
            return;
        }

        // Find all available agents
        List<DeliveryAgent> availableAgents = agentRepository.findByIsAvailableTrueAndIsActiveTrue();
        if (availableAgents.isEmpty()) {
            log.warn("No available delivery agents for order {}.", orderId);
            return;
        }

        // Filter agents within search radius and sort by straight-line distance from store
        Optional<DeliveryAgent> nearestAgent = availableAgents.stream()
                .filter(a -> a.getCurrentLatitude() != null && a.getCurrentLongitude() != null)
                .filter(a -> LocationUtils.haversineDistance(
                        store.getLatitude(), store.getLongitude(),
                        a.getCurrentLatitude(), a.getCurrentLongitude()) <= searchRadiusKm)
                .min(Comparator.comparingDouble(a -> LocationUtils.haversineDistance(
                        store.getLatitude(), store.getLongitude(),
                        a.getCurrentLatitude(), a.getCurrentLongitude())));

        // Fallback: if no agent has GPS coordinates set, just pick any available agent
        if (nearestAgent.isEmpty()) {
            nearestAgent = availableAgents.stream().findFirst();
        }

        if (nearestAgent.isEmpty()) {
            log.warn("Could not find a suitable delivery agent for order {}.", orderId);
            return;
        }

        DeliveryAgent agent = nearestAgent.get();

        // Calculate ETA from agent to store using Google Maps
        int etaMinutes = 30; // default
        if (agent.getCurrentLatitude() != null) {
            GoogleMapsService.DistanceResult dist = googleMapsService.getRoadDistance(
                    agent.getCurrentLatitude(), agent.getCurrentLongitude(),
                    store.getLatitude(), store.getLongitude());
            etaMinutes = dist.durationMinutes() + 10; // +10 min buffer for pickup
        }

        // Mark agent as unavailable
        agent.setAvailable(false);
        agentRepository.save(agent);

        // Link agent to order
        order.setDeliveryAgent(agent);
        orderRepository.save(order);

        // Create DeliveryTracking record
        DeliveryTracking tracking = DeliveryTracking.builder()
                .order(order)
                .deliveryAgent(agent)
                .status(DeliveryStatus.ASSIGNED)
                .currentLatitude(agent.getCurrentLatitude())
                .currentLongitude(agent.getCurrentLongitude())
                .estimatedArrival(LocalDateTime.now().plusMinutes(etaMinutes))
                .build();

        trackingRepository.save(tracking);

        log.info("Assigned delivery agent {} to order {}. ETA: {} mins.",
                agent.getId(), orderId, etaMinutes);
    }
}
