package com.example.doordrop.Service.Cart;

import com.example.doordrop.Model.DTO.AddMarketplaceItemToCartRequest;
import com.example.doordrop.Model.DTO.AddToCartRequest;
import com.example.doordrop.Model.DTO.CartResponse;

public interface CartService {

    CartResponse getCart(Long userId);

    /** Adds a DoorDrop Now item from a specific store; merges if same product+store already exists. */
    CartResponse addItem(Long userId, AddToCartRequest request);

    /** Adds a marketplace product; no store selection needed. */
    CartResponse addMarketplaceItem(Long userId, AddMarketplaceItemToCartRequest request);

    CartResponse updateItemQuantity(Long userId, Long cartItemId, Integer quantity);

    CartResponse removeItem(Long userId, Long cartItemId);

    void clearCart(Long userId);
}
