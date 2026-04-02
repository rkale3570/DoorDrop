package com.example.doordrop.Model.DTO;

import com.example.doordrop.Entity.Cart;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Data
@Builder
public class CartResponse {

    private Long id;
    private Long userId;
    private List<CartItemResponse> items;
    /** Items grouped by store name for easy display. */
    private Map<String, List<CartItemResponse>> itemsByStore;
    private int totalItems;
    private BigDecimal subtotal;
    private LocalDateTime updatedAt;

    public static CartResponse from(Cart cart) {
        List<CartItemResponse> itemResponses = cart.getItems().stream()
                .map(CartItemResponse::from)
                .collect(Collectors.toList());

        Map<String, List<CartItemResponse>> byStore = itemResponses.stream()
                .collect(Collectors.groupingBy(CartItemResponse::getStoreName));

        BigDecimal subtotal = itemResponses.stream()
                .map(CartItemResponse::getTotalPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return CartResponse.builder()
                .id(cart.getId())
                .userId(cart.getUser().getId())
                .items(itemResponses)
                .itemsByStore(byStore)
                .totalItems(itemResponses.size())
                .subtotal(subtotal)
                .updatedAt(cart.getUpdatedAt())
                .build();
    }
}
