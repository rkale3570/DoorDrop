package com.example.doordrop.Model.DTO;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.math.BigDecimal;

/**
 * Used by a store owner to create a brand-new product in the shared catalog
 * and simultaneously add it to their own inventory — one request, one response.
 */
@Data
public class CreateProductWithInventoryRequest {

    // ── Product fields ────────────────────────────────────────────────────────

    @NotBlank(message = "Product name is required")
    private String name;

    private String description;

    /** Optional — auto-generated as DDN-{storeId}-{timestamp} if blank. */
    private String sku;

    private Long categoryId;

    /** MRP / maximum retail price shown on the label. */
    private BigDecimal mrp;

    private String imageUrl;

    @NotBlank(message = "Unit is required (e.g. kg, litre, piece, pack)")
    private String unit;

    private Double weightKg;

    // ── Inventory fields ──────────────────────────────────────────────────────

    @NotNull(message = "Quantity is required")
    @Min(value = 0, message = "Quantity cannot be negative")
    private Integer quantity;

    @NotNull(message = "Selling price is required")
    @Positive(message = "Selling price must be positive")
    private BigDecimal price;

    @Min(value = 0, message = "Low stock threshold cannot be negative")
    private Integer lowStockThreshold = 5;
}
