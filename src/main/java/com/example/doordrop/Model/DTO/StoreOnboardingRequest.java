package com.example.doordrop.Model.DTO;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

@Data
public class StoreOnboardingRequest {

    @NotBlank(message = "Store name is required")
    private String name;

    @NotBlank(message = "Owner name is required")
    private String ownerName;

    @NotBlank(message = "Phone number is required")
    private String phone;

    private String email;

    private String street;
    private String city;
    private String state;
    private String pincode;

    @NotNull(message = "Latitude is required for delivery radius calculation")
    private Double latitude;

    @NotNull(message = "Longitude is required for delivery radius calculation")
    private Double longitude;

    /** Delivery radius in km — defaults to 3 km if not provided. */
    @Positive(message = "Delivery radius must be positive")
    private Double deliveryRadiusKm;

    /** 24-hour format, e.g. "09:00" */
    private String openTime;

    /** 24-hour format, e.g. "22:00" */
    private String closeTime;
}
