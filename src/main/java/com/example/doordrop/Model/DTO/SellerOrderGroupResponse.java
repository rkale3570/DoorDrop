package com.example.doordrop.Model.DTO;

import com.example.doordrop.Entity.SellerOrderGroup;
import com.example.doordrop.Model.Enums.SellerOrderStatus;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Data
@Builder
public class SellerOrderGroupResponse {

    private Long id;
    private Long orderId;
    private String orderNumber;
    private Long sellerId;
    private String sellerBusinessName;
    private SellerOrderStatus status;
    private List<OrderItemResponse> items;
    private BigDecimal subtotal;
    private BigDecimal shippingFee;
    private BigDecimal totalAmount;
    private Integer estimatedDeliveryDays;
    private String trackingId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static SellerOrderGroupResponse from(SellerOrderGroup group) {
        List<OrderItemResponse> itemResponses = group.getItems().stream()
                .map(OrderItemResponse::from)
                .collect(Collectors.toList());

        BigDecimal total = group.getSubtotal().add(group.getShippingFee());

        return SellerOrderGroupResponse.builder()
                .id(group.getId())
                .orderId(group.getOrder().getId())
                .orderNumber(group.getOrder().getOrderNumber())
                .sellerId(group.getSeller().getId())
                .sellerBusinessName(group.getSeller().getBusinessName())
                .status(group.getStatus())
                .items(itemResponses)
                .subtotal(group.getSubtotal())
                .shippingFee(group.getShippingFee())
                .totalAmount(total)
                .estimatedDeliveryDays(group.getEstimatedDeliveryDays())
                .trackingId(group.getTrackingId())
                .createdAt(group.getCreatedAt())
                .updatedAt(group.getUpdatedAt())
                .build();
    }
}
