package com.example.doordrop.Model.DTO;

import com.example.doordrop.Entity.StoreInventory;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

/** Used in product search results to show which stores have a product in stock. */
@Data
@Builder
public class StoreWithStockResponse {

    private Long storeId;
    private String storeName;
    private String storePhone;
    private String storeCity;
    private Double distanceKm;
    private Integer availableQuantity;
    private BigDecimal price;
    private boolean isNearestStore;
    private Long storeInventoryId;

    public static StoreWithStockResponse from(StoreInventory inv, double distanceKm, boolean isNearest) {
        return StoreWithStockResponse.builder()
                .storeId(inv.getStore().getId())
                .storeName(inv.getStore().getName())
                .storePhone(inv.getStore().getPhone())
                .storeCity(inv.getStore().getCity())
                .distanceKm(Math.round(distanceKm * 100.0) / 100.0)
                .availableQuantity(inv.getQuantity())
                .price(inv.getPrice())
                .isNearestStore(isNearest)
                .storeInventoryId(inv.getId())
                .build();
    }
}
