package com.example.doordrop.ServiceImpl.Seller;

import com.example.doordrop.Entity.Seller;
import com.example.doordrop.Entity.User;
import com.example.doordrop.Model.DTO.SellerOnboardingRequest;
import com.example.doordrop.Model.DTO.SellerProfileResponse;
import com.example.doordrop.Repository.SellerRepository;
import com.example.doordrop.Repository.UserRepository;
import com.example.doordrop.Service.Seller.SellerService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SellerServiceImpl implements SellerService {

    private final SellerRepository sellerRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public SellerProfileResponse onboard(SellerOnboardingRequest request, Long userId) {
        if (sellerRepository.findByUserId(userId).isPresent()) {
            throw new RuntimeException("You are already registered as a seller.");
        }

        if (request.getGstNumber() != null
                && sellerRepository.findByGstNumber(request.getGstNumber()).isPresent()) {
            throw new RuntimeException("A seller with this GST number already exists.");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found: " + userId));

        Seller seller = Seller.builder()
                .user(user)
                .businessName(request.getBusinessName())
                .gstNumber(request.getGstNumber())
                .bankAccountNumber(request.getBankAccountNumber())
                .ifscCode(request.getIfscCode())
                .street(request.getStreet())
                .city(request.getCity())
                .state(request.getState())
                .pincode(request.getPincode())
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .build();

        return SellerProfileResponse.from(sellerRepository.save(seller));
    }

    @Override
    public SellerProfileResponse getMyProfile(Long userId) {
        Seller seller = sellerRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("No seller profile found. Please complete onboarding first."));
        return SellerProfileResponse.from(seller);
    }

    @Override
    @Transactional
    public SellerProfileResponse updateProfile(SellerOnboardingRequest request, Long userId) {
        Seller seller = sellerRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("No seller profile found."));

        seller.setBusinessName(request.getBusinessName());
        seller.setGstNumber(request.getGstNumber());
        seller.setBankAccountNumber(request.getBankAccountNumber());
        seller.setIfscCode(request.getIfscCode());
        seller.setStreet(request.getStreet());
        seller.setCity(request.getCity());
        seller.setState(request.getState());
        seller.setPincode(request.getPincode());
        seller.setLatitude(request.getLatitude());
        seller.setLongitude(request.getLongitude());

        return SellerProfileResponse.from(sellerRepository.save(seller));
    }

    @Override
    public SellerProfileResponse getSellerById(Long sellerId) {
        return SellerProfileResponse.from(
                sellerRepository.findById(sellerId)
                        .orElseThrow(() -> new RuntimeException("Seller not found: " + sellerId)));
    }

    @Override
    public List<SellerProfileResponse> getAllSellers() {
        return sellerRepository.findByIsActiveTrue().stream()
                .map(SellerProfileResponse::from)
                .collect(Collectors.toList());
    }
}
