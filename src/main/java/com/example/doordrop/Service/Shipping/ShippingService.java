package com.example.doordrop.Service.Shipping;

import com.example.doordrop.Model.DTO.ShippingEstimateResponse;

public interface ShippingService {

    /**
     * Estimates shipping cost and delivery days for a single product.
     * Uses the seller's location vs the user's default address.
     */
    ShippingEstimateResponse estimate(Long productId, Long userId);

    /**
     * Calculates the final shipping cost during order placement.
     *
     * @param sellerId      the seller fulfilling items
     * @param userId        the customer
     * @param totalWeightKg sum of all item weights in this seller group
     */
    ShippingEstimateResponse calculate(Long sellerId, Long userId, double totalWeightKg);
}
