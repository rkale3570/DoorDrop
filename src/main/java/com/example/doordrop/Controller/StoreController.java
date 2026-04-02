package com.example.doordrop.Controller;

import com.example.doordrop.Model.DTO.NearbyStoreResponse;
import com.example.doordrop.Model.DTO.StoreInventoryResponse;
import com.example.doordrop.Security.CustomUserDetails;
import com.example.doordrop.Service.Store.StoreService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
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
}
