package com.example.doordrop.ServiceImpl.Shipping;

import com.example.doordrop.Entity.Address;
import com.example.doordrop.Entity.Product;
import com.example.doordrop.Entity.Seller;
import com.example.doordrop.Model.DTO.ShippingEstimateResponse;
import com.example.doordrop.Repository.AddressRepository;
import com.example.doordrop.Repository.ProductRepository;
import com.example.doordrop.Repository.SellerRepository;
import com.example.doordrop.Service.External.GoogleMapsService;
import com.example.doordrop.Service.Shipping.ShippingService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;

@Service
@RequiredArgsConstructor
public class ShippingServiceImpl implements ShippingService {

    private final ProductRepository productRepository;
    private final SellerRepository sellerRepository;
    private final AddressRepository addressRepository;
    private final GoogleMapsService googleMapsService;

    /** Base fee charged on every marketplace shipment (₹). */
    private static final double BASE_FEE = 40.0;
    /** Per-km rate (₹). */
    private static final double RATE_PER_KM = 2.0;
    /** Per-kg rate (₹). */
    private static final double RATE_PER_KG = 10.0;
    /** Flat-rate fee used when GPS coordinates are unavailable (₹). */
    private static final double FLAT_FALLBACK_FEE = 99.0;

    @Override
    public ShippingEstimateResponse estimate(Long productId, Long userId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found: " + productId));

        double weightKg = product.getWeightKg() != null ? product.getWeightKg() : 0.5;
        Long sellerId = product.getSeller() != null ? product.getSeller().getId() : null;

        return calculate(sellerId, userId, weightKg);
    }

    @Override
    public ShippingEstimateResponse calculate(Long sellerId, Long userId, double totalWeightKg) {
        Address userAddress = addressRepository.findByUserIdAndIsDefaultTrue(userId).orElse(null);

        Seller seller = sellerId != null
                ? sellerRepository.findById(sellerId).orElse(null)
                : null;

        if (userAddress == null || userAddress.getLatitude() == null || userAddress.getLongitude() == null ||
            seller == null || seller.getLatitude() == null || seller.getLongitude() == null) {
            return flatRateResponse(totalWeightKg);
        }

        // Use Google Maps road distance for accuracy; falls back to Haversine automatically
        GoogleMapsService.DistanceResult dist = googleMapsService.getRoadDistance(
                seller.getLatitude(), seller.getLongitude(),
                userAddress.getLatitude(), userAddress.getLongitude());

        double fee = BASE_FEE + (dist.distanceKm() * RATE_PER_KM) + (totalWeightKg * RATE_PER_KG);
        int days = estimatedDays(dist.distanceKm());

        return ShippingEstimateResponse.builder()
                .shippingFee(round(fee))
                .estimatedDays(days)
                .distanceKm(dist.distanceKm())
                .deliveryRange(deliveryRange(days))
                .isEstimated(false)
                .build();
    }

    // -------------------------------------------------------------------------

    private ShippingEstimateResponse flatRateResponse(double weightKg) {
        double fee = FLAT_FALLBACK_FEE + (weightKg * RATE_PER_KG);
        return ShippingEstimateResponse.builder()
                .shippingFee(round(fee))
                .estimatedDays(5)
                .distanceKm(0)
                .deliveryRange("3–7 business days")
                .isEstimated(true)
                .build();
    }

    private int estimatedDays(double distanceKm) {
        if (distanceKm <= 50)  return 1;
        if (distanceKm <= 200) return 2;
        if (distanceKm <= 500) return 3;
        if (distanceKm <= 1000) return 4;
        return 5;
    }

    private String deliveryRange(int days) {
        if (days == 1) return "Same day or next day";
        return days + "–" + (days + 1) + " business days";
    }

    private BigDecimal round(double value) {
        return BigDecimal.valueOf(value).setScale(2, RoundingMode.HALF_UP);
    }
}
