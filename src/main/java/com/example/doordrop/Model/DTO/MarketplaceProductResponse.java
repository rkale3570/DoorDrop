package com.example.doordrop.Model.DTO;

import com.example.doordrop.Entity.Product;
import com.example.doordrop.Model.Enums.OrderType;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class MarketplaceProductResponse {

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
    private Double weightKg;
    private Double averageRating;
    private Integer totalReviews;
    private boolean isActive;

    // Seller summary
    private Long sellerId;
    private String sellerBusinessName;
    private String sellerCity;
    private Double sellerRating;
    private boolean sellerVerified;

    /** Populated when a userId is available for distance calculation. */
    private ShippingEstimateResponse shippingEstimate;

    public static MarketplaceProductResponse from(Product product, ShippingEstimateResponse shipping) {
        return MarketplaceProductResponse.builder()
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
                .weightKg(product.getWeightKg())
                .averageRating(product.getAverageRating())
                .totalReviews(product.getTotalReviews())
                .isActive(product.isActive())
                .sellerId(product.getSeller() != null ? product.getSeller().getId() : null)
                .sellerBusinessName(product.getSeller() != null ? product.getSeller().getBusinessName() : null)
                .sellerCity(product.getSeller() != null ? product.getSeller().getCity() : null)
                .sellerRating(product.getSeller() != null ? product.getSeller().getAverageRating() : null)
                .sellerVerified(product.getSeller() != null && product.getSeller().isVerified())
                .shippingEstimate(shipping)
                .build();
    }
}
