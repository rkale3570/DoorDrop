package com.example.doordrop.Model.DTO;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class ShippingEstimateResponse {

    private BigDecimal shippingFee;
    private int estimatedDays;
    private double distanceKm;
    /** Human-readable range shown in the UI, e.g. "2–3 business days". */
    private String deliveryRange;
    /** True when seller or user GPS coordinates are missing — fee is a flat estimate. */
    private boolean isEstimated;
}
