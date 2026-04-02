package com.example.doordrop.Service.Seller;

import com.example.doordrop.Model.DTO.SellerOnboardingRequest;
import com.example.doordrop.Model.DTO.SellerProfileResponse;

import java.util.List;

public interface SellerService {

    /** Register the current user as a marketplace seller. */
    SellerProfileResponse onboard(SellerOnboardingRequest request, Long userId);

    SellerProfileResponse getMyProfile(Long userId);

    SellerProfileResponse updateProfile(SellerOnboardingRequest request, Long userId);

    SellerProfileResponse getSellerById(Long sellerId);

    List<SellerProfileResponse> getAllSellers();
}
