package com.example.doordrop.Model.DTO;

import com.example.doordrop.Entity.Product;
import com.example.doordrop.Model.Enums.OrderType;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
public class ProductSearchResponse {

    private Long id;
    private String name;
    private String description;
    private String sku;
    private String categoryName;
    private OrderType productType;
    private BigDecimal basePrice;
    private BigDecimal mrp;
    private String imageUrl;
    private String unit;
    private Double averageRating;
    private Integer totalReviews;

    /** Stores that carry this product near the user, sorted by distance. */
    private List<StoreWithStockResponse> availableStores;

    public static ProductSearchResponse from(Product product, List<StoreWithStockResponse> availableStores) {
        return ProductSearchResponse.builder()
                .id(product.getId())
                .name(product.getName())
                .description(product.getDescription())
                .sku(product.getSku())
                .categoryName(product.getCategory() != null ? product.getCategory().getName() : null)
                .productType(product.getProductType())
                .basePrice(product.getBasePrice())
                .mrp(product.getMrp())
                .imageUrl(product.getImageUrl())
                .unit(product.getUnit())
                .averageRating(product.getAverageRating())
                .totalReviews(product.getTotalReviews())
                .availableStores(availableStores)
                .build();
    }
}
