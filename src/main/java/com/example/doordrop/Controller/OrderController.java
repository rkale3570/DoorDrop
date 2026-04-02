package com.example.doordrop.Controller;

import com.example.doordrop.Model.DTO.OrderResponse;
import com.example.doordrop.Model.DTO.PlaceOrderRequest;
import com.example.doordrop.Model.DTO.StoreOrderGroupResponse;
import com.example.doordrop.Model.DTO.UpdateStoreOrderStatusRequest;
import com.example.doordrop.Security.CustomUserDetails;
import com.example.doordrop.Service.Order.OrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
@Tag(name = "Orders", description = "Place and track multi-store orders")
@SecurityRequirement(name = "bearerAuth")
public class OrderController {

    private final OrderService orderService;

    @PostMapping
    @Operation(summary = "Place order from cart",
               description = "Converts your cart into a multi-store order. Items are grouped by store, inventory is deducted, and each store gets its own order group to manage independently.")
    public ResponseEntity<OrderResponse> placeOrder(
            @RequestBody PlaceOrderRequest request,
            @AuthenticationPrincipal CustomUserDetails currentUser) {

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(orderService.placeOrder(currentUser.getUser().getId(), request));
    }

    @GetMapping
    @Operation(summary = "Get your order history")
    public ResponseEntity<List<OrderResponse>> getUserOrders(
            @AuthenticationPrincipal CustomUserDetails currentUser) {

        return ResponseEntity.ok(orderService.getUserOrders(currentUser.getUser().getId()));
    }

    @GetMapping("/{orderId}")
    @Operation(summary = "Get order details by ID")
    public ResponseEntity<OrderResponse> getOrder(
            @PathVariable Long orderId,
            @AuthenticationPrincipal CustomUserDetails currentUser) {

        return ResponseEntity.ok(orderService.getOrderById(orderId, currentUser.getUser().getId()));
    }

    // ── Store Owner endpoints ─────────────────────────────────────────────────

    @GetMapping("/store/incoming")
    @PreAuthorize("hasRole('STORE_OWNER')")
    @Operation(summary = "Store owner: view incoming orders",
               description = "Returns all order groups assigned to your store, newest first.")
    public ResponseEntity<List<StoreOrderGroupResponse>> getStoreOrders(
            @AuthenticationPrincipal CustomUserDetails currentUser) {

        return ResponseEntity.ok(orderService.getStoreOrders(currentUser.getUser().getId()));
    }

    @PatchMapping("/store-groups/{groupId}/status")
    @PreAuthorize("hasRole('STORE_OWNER')")
    @Operation(summary = "Store owner: update order group status",
               description = "Advance the status of your store's slice of an order: PENDING → CONFIRMED → PREPARING → READY_FOR_PICKUP → PICKED_UP.")
    public ResponseEntity<StoreOrderGroupResponse> updateStoreOrderStatus(
            @PathVariable Long groupId,
            @Valid @RequestBody UpdateStoreOrderStatusRequest request,
            @AuthenticationPrincipal CustomUserDetails currentUser) {

        return ResponseEntity.ok(
                orderService.updateStoreOrderStatus(groupId, request, currentUser.getUser().getId()));
    }
}
