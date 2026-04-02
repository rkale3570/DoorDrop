package com.example.doordrop.Controller;

import com.example.doordrop.Model.DTO.AddMarketplaceItemToCartRequest;
import com.example.doordrop.Model.DTO.CartResponse;
import com.example.doordrop.Model.DTO.SellerOrderGroupResponse;
import com.example.doordrop.Model.DTO.UpdateSellerOrderStatusRequest;
import com.example.doordrop.Security.CustomUserDetails;
import com.example.doordrop.Service.Cart.CartService;
import com.example.doordrop.Service.Order.OrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/marketplace")
@RequiredArgsConstructor
@Tag(name = "Marketplace Orders", description = "Marketplace cart and seller order management")
@SecurityRequirement(name = "bearerAuth")
public class MarketplaceOrderController {

    private final CartService cartService;
    private final OrderService orderService;

    // ── Cart ──────────────────────────────────────────────────────────────────

    @PostMapping("/cart/items")
    @Operation(summary = "Add a marketplace product to cart",
               description = "No store selection needed — just product + quantity. Can be combined with DoorDrop Now items in the same cart.")
    public ResponseEntity<CartResponse> addToCart(
            @Valid @RequestBody AddMarketplaceItemToCartRequest request,
            @AuthenticationPrincipal CustomUserDetails currentUser) {

        return ResponseEntity.ok(
                cartService.addMarketplaceItem(currentUser.getUser().getId(), request));
    }

    // ── Seller order management ───────────────────────────────────────────────

    @GetMapping("/orders/incoming")
    @PreAuthorize("hasRole('SELLER')")
    @Operation(summary = "Seller: view incoming orders",
               description = "Returns all order groups assigned to your seller account, newest first.")
    public ResponseEntity<List<SellerOrderGroupResponse>> getIncomingOrders(
            @AuthenticationPrincipal CustomUserDetails currentUser) {

        return ResponseEntity.ok(orderService.getSellerOrders(currentUser.getUser().getId()));
    }

    @PatchMapping("/orders/groups/{groupId}/status")
    @PreAuthorize("hasRole('SELLER')")
    @Operation(summary = "Seller: update order group status",
               description = "Advance: PENDING → CONFIRMED → PROCESSING → SHIPPED (trackingId required) → OUT_FOR_DELIVERY → DELIVERED")
    public ResponseEntity<SellerOrderGroupResponse> updateOrderStatus(
            @PathVariable Long groupId,
            @Valid @RequestBody UpdateSellerOrderStatusRequest request,
            @AuthenticationPrincipal CustomUserDetails currentUser) {

        return ResponseEntity.ok(
                orderService.updateSellerOrderStatus(groupId, request, currentUser.getUser().getId()));
    }
}
