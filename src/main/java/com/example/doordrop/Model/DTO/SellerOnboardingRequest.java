package com.example.doordrop.Model.DTO;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class SellerOnboardingRequest {

    @NotBlank(message = "Business name is required")
    private String businessName;

    private String gstNumber;
    private String bankAccountNumber;
    private String ifscCode;

    @NotBlank(message = "Street is required")
    private String street;

    @NotBlank(message = "City is required")
    private String city;

    @NotBlank(message = "State is required")
    private String state;

    @NotBlank(message = "Pincode is required")
    private String pincode;

    /** GPS coordinates for shipping cost calculation. */
    private Double latitude;
    private Double longitude;
}
