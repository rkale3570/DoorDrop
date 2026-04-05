package com.example.doordrop.Controller;

import com.example.doordrop.Model.DTO.NearbyStoreResponse;
import com.example.doordrop.Model.DTO.StoreInventoryResponse;
import com.example.doordrop.Model.DTO.StoreOnboardingRequest;
import com.example.doordrop.Security.CustomUserDetails;
import com.example.doordrop.Service.Store.StoreService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/stores")
@RequiredArgsConstructor
@Tag(name = "Stores", description = "Discover nearby kirana stores")
@SecurityRequirement(name = "bearerAuth")
public class StoreController {

    private final StoreService storeService;

    @PostMapping("/register")
    @PreAuthorize("hasRole('STORE_OWNER')")
    @Operation(summary = "One-time store registration for a new store owner")
    public ResponseEntity<NearbyStoreResponse> registerStore(
            @Valid @RequestBody StoreOnboardingRequest request,
            @AuthenticationPrincipal CustomUserDetails currentUser) {

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(storeService.createStore(request, currentUser.getUser().getId()));
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('STORE_OWNER')")
    @Operation(summary = "Get the store owned by the current user")
    public ResponseEntity<NearbyStoreResponse> getMyStore(
            @AuthenticationPrincipal CustomUserDetails currentUser) {

        return ResponseEntity.ok(storeService.getMyStore(currentUser.getUser().getId()));
    }

    @GetMapping("/nearby")
    @Operation(summary = "Get stores near your default address",
               description = "Returns all active, open stores whose delivery radius covers your default delivery address. Sorted nearest-first.")
    public ResponseEntity<List<NearbyStoreResponse>> getNearbyStores(
            @AuthenticationPrincipal CustomUserDetails currentUser) {

        return ResponseEntity.ok(storeService.getNearbyStores(currentUser.getUser().getId()));
    }

    @GetMapping("/{storeId}")
    @Operation(summary = "Get store details")
    public ResponseEntity<NearbyStoreResponse> getStore(
            @PathVariable Long storeId,
            @AuthenticationPrincipal CustomUserDetails currentUser) {

        return ResponseEntity.ok(storeService.getStoreById(storeId, currentUser.getUser().getId()));
    }

    @GetMapping("/{storeId}/products")
    @Operation(summary = "Get all products currently in stock at a store")
    public ResponseEntity<List<StoreInventoryResponse>> getStoreProducts(
            @PathVariable Long storeId) {

        return ResponseEntity.ok(storeService.getStoreProducts(storeId));
    }

    @PatchMapping("/{storeId}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Admin: approve a store so the owner can access their dashboard")
    public ResponseEntity<NearbyStoreResponse> approveStore(@PathVariable Long storeId) {
        return ResponseEntity.ok(storeService.approveStore(storeId));
    }
}
