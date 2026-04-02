package com.example.doordrop.Model.DTO;

import com.example.doordrop.Entity.Order;
import com.example.doordrop.Model.Enums.OrderStatus;
import com.example.doordrop.Model.Enums.OrderType;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class OrderResponse {

    private Long id;
    private String orderNumber;
    private Long userId;
    private String userName;
    private OrderType orderType;
    private OrderStatus status;

    // Delivery address fields
    private String deliveryStreet;
    private String deliveryCity;
    private String deliveryState;
    private String deliveryPincode;

    /** DoorDrop Now items grouped by kirana store. */
    private List<StoreOrderGroupResponse> storeGroups;

    /** Marketplace items grouped by seller. */
    private List<SellerOrderGroupResponse> sellerGroups;

    private BigDecimal subtotal;
    private BigDecimal deliveryFee;
    private BigDecimal discount;
    private BigDecimal totalAmount;

    private LocalDateTime estimatedDeliveryTime;
    private String notes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static OrderResponse from(Order order,
                                     List<StoreOrderGroupResponse> storeGroups,
                                     List<SellerOrderGroupResponse> sellerGroups) {
        return OrderResponse.builder()
                .id(order.getId())
                .orderNumber(order.getOrderNumber())
                .userId(order.getUser().getId())
                .userName(order.getUser().getName())
                .orderType(order.getOrderType())
                .status(order.getStatus())
                .deliveryStreet(order.getDeliveryAddress().getStreet())
                .deliveryCity(order.getDeliveryAddress().getCity())
                .deliveryState(order.getDeliveryAddress().getState())
                .deliveryPincode(order.getDeliveryAddress().getPincode())
                .storeGroups(storeGroups)
                .sellerGroups(sellerGroups)
                .subtotal(order.getSubtotal())
                .deliveryFee(order.getDeliveryFee())
                .discount(order.getDiscount())
                .totalAmount(order.getTotalAmount())
                .estimatedDeliveryTime(order.getEstimatedDeliveryTime())
                .notes(order.getNotes())
                .createdAt(order.getCreatedAt())
                .updatedAt(order.getUpdatedAt())
                .build();
    }
}
