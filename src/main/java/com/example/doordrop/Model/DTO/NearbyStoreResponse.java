package com.example.doordrop.Model.DTO;

import com.example.doordrop.Entity.Store;
import lombok.Builder;
import lombok.Data;

import java.time.LocalTime;

@Data
@Builder
public class NearbyStoreResponse {

    private Long id;
    private String name;
    private String ownerName;
    private String phone;
    private String email;
    private String street;
    private String city;
    private String state;
    private String pincode;
    private Double latitude;
    private Double longitude;
    private Double deliveryRadiusKm;
    private boolean isOpen;
    private LocalTime openTime;
    private LocalTime closeTime;
    /** Straight-line distance in km from the user's delivery address. */
    private Double distanceKm;

    public static NearbyStoreResponse from(Store store, double distanceKm) {
        return NearbyStoreResponse.builder()
                .id(store.getId())
                .name(store.getName())
                .ownerName(store.getOwnerName())
                .phone(store.getPhone())
                .email(store.getEmail())
                .street(store.getStreet())
                .city(store.getCity())
                .state(store.getState())
                .pincode(store.getPincode())
                .latitude(store.getLatitude())
                .longitude(store.getLongitude())
                .deliveryRadiusKm(store.getDeliveryRadiusKm())
                .isOpen(store.isOpen())
                .openTime(store.getOpenTime())
                .closeTime(store.getCloseTime())
                .distanceKm(Math.round(distanceKm * 100.0) / 100.0)
                .build();
    }
}
