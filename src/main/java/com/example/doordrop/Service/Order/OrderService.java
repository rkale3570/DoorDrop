package com.example.doordrop.Service.Order;

import com.example.doordrop.Model.DTO.*;

import java.util.List;

public interface OrderService {

    /**
     * Converts the cart into an order — handles DoorDrop Now and Marketplace items
     * in the same cart, splitting into StoreOrderGroups and SellerOrderGroups.
     */
    OrderResponse placeOrder(Long userId, PlaceOrderRequest request);

    List<OrderResponse> getUserOrders(Long userId);

    OrderResponse getOrderById(Long orderId, Long userId);

    // ── DoorDrop Now (Store owner) ────────────────────────────────────────────

    List<StoreOrderGroupResponse> getStoreOrders(Long requestingUserId);

    StoreOrderGroupResponse updateStoreOrderStatus(Long groupId,
                                                    UpdateStoreOrderStatusRequest request,
                                                    Long requestingUserId);

    // ── Marketplace (Seller) ──────────────────────────────────────────────────

    List<SellerOrderGroupResponse> getSellerOrders(Long requestingUserId);

    SellerOrderGroupResponse updateSellerOrderStatus(Long groupId,
                                                      UpdateSellerOrderStatusRequest request,
                                                      Long requestingUserId);
}
