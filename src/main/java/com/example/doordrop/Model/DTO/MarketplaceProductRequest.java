package com.example.doordrop.Model.DTO;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.math.BigDecimal;

/** Used by a seller to create or update a marketplace product listing. */
@Data
public class MarketplaceProductRequest {

    @NotBlank(message = "Product name is required")
    private String name;

    private String description;

    /** Optional — auto-generated if blank. */
    private String sku;

    private Long categoryId;

    @NotNull(message = "Base price is required")
    @Positive(message = "Base price must be positive")
    private BigDecimal basePrice;

    private BigDecimal mrp;

    private String imageUrl;

    @NotBlank(message = "Unit is required (e.g. piece, kg, litre, pair)")
    private String unit;

    /**
     * Weight in kg — drives the shipping cost calculation.
     * Must be provided for accurate delivery fee.
     */
    @NotNull(message = "Weight (kg) is required for shipping calculation")
    @Positive(message = "Weight must be positive")
    private Double weightKg;

    private boolean isActive = true;
}
