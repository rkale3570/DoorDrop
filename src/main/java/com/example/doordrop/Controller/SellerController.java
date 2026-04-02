package com.example.doordrop.Controller;

import com.example.doordrop.Model.DTO.SellerOnboardingRequest;
import com.example.doordrop.Model.DTO.SellerProfileResponse;
import com.example.doordrop.Security.CustomUserDetails;
import com.example.doordrop.Service.Seller.SellerService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/seller")
@RequiredArgsConstructor
@Tag(name = "Seller", description = "Seller onboarding and profile management")
@SecurityRequirement(name = "bearerAuth")
public class SellerController {

    private final SellerService sellerService;

    @PostMapping("/onboard")
    @Operation(summary = "Register as a marketplace seller",
               description = "One-time onboarding. Provide business name, GST, address, and GPS coordinates for accurate shipping rates.")
    public ResponseEntity<SellerProfileResponse> onboard(
            @Valid @RequestBody SellerOnboardingRequest request,
            @AuthenticationPrincipal CustomUserDetails currentUser) {

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(sellerService.onboard(request, currentUser.getUser().getId()));
    }

    @GetMapping("/me")
    @Operation(summary = "Get your seller profile")
    public ResponseEntity<SellerProfileResponse> getMyProfile(
            @AuthenticationPrincipal CustomUserDetails currentUser) {

        return ResponseEntity.ok(sellerService.getMyProfile(currentUser.getUser().getId()));
    }

    @PutMapping("/me")
    @Operation(summary = "Update your seller profile")
    public ResponseEntity<SellerProfileResponse> updateProfile(
            @Valid @RequestBody SellerOnboardingRequest request,
            @AuthenticationPrincipal CustomUserDetails currentUser) {

        return ResponseEntity.ok(sellerService.updateProfile(request, currentUser.getUser().getId()));
    }

    @GetMapping("/{sellerId}")
    @Operation(summary = "Get a seller's public profile")
    public ResponseEntity<SellerProfileResponse> getSellerById(@PathVariable Long sellerId) {
        return ResponseEntity.ok(sellerService.getSellerById(sellerId));
    }

    @GetMapping
    @Operation(summary = "List all active sellers on the marketplace")
    public ResponseEntity<List<SellerProfileResponse>> getAllSellers() {
        return ResponseEntity.ok(sellerService.getAllSellers());
    }
}
