package com.example.doordrop.Model.DTO;

import com.example.doordrop.Entity.StoreInventory;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
public class StoreInventoryResponse {

    private Long id;
    private Long storeId;
    private String storeName;
    private Long productId;
    private String productName;
    private String sku;
    private String imageUrl;
    private String unit;
    private Integer quantity;
    private BigDecimal price;
    private boolean isAvailable;
    private Integer lowStockThreshold;
    private boolean isLowStock;
    private LocalDateTime updatedAt;

    public static StoreInventoryResponse from(StoreInventory inv) {
        return StoreInventoryResponse.builder()
                .id(inv.getId())
                .storeId(inv.getStore().getId())
                .storeName(inv.getStore().getName())
                .productId(inv.getProduct().getId())
                .productName(inv.getProduct().getName())
                .sku(inv.getProduct().getSku())
                .imageUrl(inv.getProduct().getImageUrl())
                .unit(inv.getProduct().getUnit())
                .quantity(inv.getQuantity())
                .price(inv.getPrice())
                .isAvailable(inv.isAvailable())
                .lowStockThreshold(inv.getLowStockThreshold())
                .isLowStock(inv.getQuantity() <= inv.getLowStockThreshold())
                .updatedAt(inv.getUpdatedAt())
                .build();
    }
}
