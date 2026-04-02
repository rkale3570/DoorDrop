package com.example.doordrop.Model.DTO;

import com.example.doordrop.Entity.StoreOrderGroup;
import com.example.doordrop.Model.Enums.StoreOrderStatus;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Data
@Builder
public class StoreOrderGroupResponse {

    private Long id;
    private Long orderId;
    private String orderNumber;
    private Long storeId;
    private String storeName;
    private StoreOrderStatus status;
    private List<OrderItemResponse> items;
    private BigDecimal subtotal;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static StoreOrderGroupResponse from(StoreOrderGroup group) {
        List<OrderItemResponse> itemResponses = group.getItems().stream()
                .map(OrderItemResponse::from)
                .collect(Collectors.toList());

        return StoreOrderGroupResponse.builder()
                .id(group.getId())
                .orderId(group.getOrder().getId())
                .orderNumber(group.getOrder().getOrderNumber())
                .storeId(group.getStore().getId())
                .storeName(group.getStore().getName())
                .status(group.getStatus())
                .items(itemResponses)
                .subtotal(group.getSubtotal())
                .createdAt(group.getCreatedAt())
                .updatedAt(group.getUpdatedAt())
                .build();
    }
}
