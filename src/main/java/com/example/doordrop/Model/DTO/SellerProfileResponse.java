package com.example.doordrop.Model.DTO;

import com.example.doordrop.Entity.Seller;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class SellerProfileResponse {

    private Long id;
    private Long userId;
    private String userName;
    private String businessName;
    private String gstNumber;
    private String street;
    private String city;
    private String state;
    private String pincode;
    private Double latitude;
    private Double longitude;
    private Double averageRating;
    private Long totalSales;
    private boolean isVerified;
    private boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static SellerProfileResponse from(Seller seller) {
        return SellerProfileResponse.builder()
                .id(seller.getId())
                .userId(seller.getUser().getId())
                .userName(seller.getUser().getName())
                .businessName(seller.getBusinessName())
                .gstNumber(seller.getGstNumber())
                .street(seller.getStreet())
                .city(seller.getCity())
                .state(seller.getState())
                .pincode(seller.getPincode())
                .latitude(seller.getLatitude())
                .longitude(seller.getLongitude())
                .averageRating(seller.getAverageRating())
                .totalSales(seller.getTotalSales())
                .isVerified(seller.isVerified())
                .isActive(seller.isActive())
                .createdAt(seller.getCreatedAt())
                .updatedAt(seller.getUpdatedAt())
                .build();
    }
}
