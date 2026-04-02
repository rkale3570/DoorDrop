package com.example.doordrop.Controller;

import com.example.doordrop.Model.DTO.AgentLocationUpdateRequest;
import com.example.doordrop.Model.DTO.LiveTrackingResponse;
import com.example.doordrop.Model.Enums.DeliveryStatus;
import com.example.doordrop.Security.CustomUserDetails;
import com.example.doordrop.Service.Tracking.LiveTrackingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/tracking")
@RequiredArgsConstructor
@Tag(name = "Live Tracking", description = "Real-time delivery agent location and ETA")
@SecurityRequirement(name = "bearerAuth")
public class LiveTrackingController {

    private final LiveTrackingService trackingService;

    // ── Customer endpoints ────────────────────────────────────────────────────

    @GetMapping("/order/{orderId}")
    @Operation(summary = "Get live tracking for an order",
               description = "Returns the delivery agent's current GPS position, road distance to your address, and live ETA calculated via Google Maps. Poll every 5–10 seconds for real-time updates.")
    public ResponseEntity<LiveTrackingResponse> getTracking(
            @PathVariable Long orderId,
            @AuthenticationPrincipal CustomUserDetails currentUser) {

        return ResponseEntity.ok(
                trackingService.getOrderTracking(orderId, currentUser.getUser().getId()));
    }

    // ── Delivery agent endpoints ──────────────────────────────────────────────

    @PutMapping("/location")
    @PreAuthorize("hasRole('DELIVERY_AGENT')")
    @Operation(summary = "Agent: broadcast current GPS location",
               description = "Call every 5–10 seconds from the delivery agent app. Updates both the delivery_agents table and the active delivery_tracking record. ETA is recalculated automatically via Google Maps.")
    public ResponseEntity<Void> updateLocation(
            @Valid @RequestBody AgentLocationUpdateRequest request,
            @AuthenticationPrincipal CustomUserDetails currentUser) {

        trackingService.updateAgentLocation(currentUser.getUser().getId(), request);
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/status")
    @PreAuthorize("hasRole('DELIVERY_AGENT')")
    @Operation(summary = "Agent: update delivery status",
               description = "ASSIGNED → HEADING_TO_STORE → PICKED_UP → OUT_FOR_DELIVERY → DELIVERED. DELIVERED frees up the agent and marks the order as complete.")
    public ResponseEntity<Void> updateStatus(
            @RequestParam DeliveryStatus status,
            @AuthenticationPrincipal CustomUserDetails currentUser) {

        trackingService.updateDeliveryStatus(currentUser.getUser().getId(), status);
        return ResponseEntity.ok().build();
    }
}
