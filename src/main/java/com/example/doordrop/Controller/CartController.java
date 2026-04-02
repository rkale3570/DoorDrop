package com.example.doordrop.Controller;

import com.example.doordrop.Model.DTO.AddToCartRequest;
import com.example.doordrop.Model.DTO.CartResponse;
import com.example.doordrop.Security.CustomUserDetails;
import com.example.doordrop.Service.Cart.CartService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
@Tag(name = "Cart", description = "Multi-store shopping cart management")
@SecurityRequirement(name = "bearerAuth")
public class CartController {

    private final CartService cartService;

    @GetMapping
    @Operation(summary = "View your cart",
               description = "Returns all cart items grouped by store and a subtotal.")
    public ResponseEntity<CartResponse> getCart(
            @AuthenticationPrincipal CustomUserDetails currentUser) {

        return ResponseEntity.ok(cartService.getCart(currentUser.getUser().getId()));
    }

    @PostMapping("/items")
    @Operation(summary = "Add a DoorDrop Now item to cart",
               description = "Specify product + store (kirana). For marketplace products use POST /api/marketplace/cart/items.")
    public ResponseEntity<CartResponse> addItem(
            @Valid @RequestBody AddToCartRequest request,
            @AuthenticationPrincipal CustomUserDetails currentUser) {

        return ResponseEntity.ok(cartService.addItem(currentUser.getUser().getId(), request));
    }

    @PatchMapping("/items/{itemId}")
    @Operation(summary = "Update quantity of a cart item",
               description = "Set quantity to 0 to remove the item.")
    public ResponseEntity<CartResponse> updateItemQuantity(
            @PathVariable Long itemId,
            @RequestParam @Min(0) Integer quantity,
            @AuthenticationPrincipal CustomUserDetails currentUser) {

        return ResponseEntity.ok(
                cartService.updateItemQuantity(currentUser.getUser().getId(), itemId, quantity));
    }

    @DeleteMapping("/items/{itemId}")
    @Operation(summary = "Remove a specific item from cart")
    public ResponseEntity<CartResponse> removeItem(
            @PathVariable Long itemId,
            @AuthenticationPrincipal CustomUserDetails currentUser) {

        return ResponseEntity.ok(cartService.removeItem(currentUser.getUser().getId(), itemId));
    }

    @DeleteMapping
    @Operation(summary = "Clear entire cart")
    public ResponseEntity<Void> clearCart(
            @AuthenticationPrincipal CustomUserDetails currentUser) {

        cartService.clearCart(currentUser.getUser().getId());
        return ResponseEntity.noContent().build();
    }
}
