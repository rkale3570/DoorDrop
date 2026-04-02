package com.example.doordrop.Controller;

import com.example.doordrop.Model.DTO.CreateProductWithInventoryRequest;
import com.example.doordrop.Model.DTO.StoreInventoryRequest;
import com.example.doordrop.Model.DTO.StoreInventoryResponse;
import com.example.doordrop.Security.CustomUserDetails;
import com.example.doordrop.Service.Inventory.StoreInventoryService;
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
@RequestMapping("/api/stores/{storeId}/inventory")
@RequiredArgsConstructor
@Tag(name = "Store Inventory", description = "Store owners manage their real-time product inventory")
@SecurityRequirement(name = "bearerAuth")
public class StoreInventoryController {

    private final StoreInventoryService inventoryService;

    @GetMapping
    @PreAuthorize("hasRole('STORE_OWNER')")
    @Operation(summary = "View your full inventory (store owner only)")
    public ResponseEntity<List<StoreInventoryResponse>> getInventory(
            @PathVariable Long storeId,
            @AuthenticationPrincipal CustomUserDetails currentUser) {

        return ResponseEntity.ok(
                inventoryService.getInventory(storeId, currentUser.getUser().getId()));
    }

    @PostMapping("/with-product")
    @PreAuthorize("hasRole('STORE_OWNER')")
    @Operation(summary = "Create a new product and add it to your inventory in one step",
               description = "The product is saved to the shared catalog (visible to all stores) and immediately listed in your inventory. SKU is auto-generated if not provided.")
    public ResponseEntity<StoreInventoryResponse> createProductAndAddToInventory(
            @PathVariable Long storeId,
            @Valid @RequestBody CreateProductWithInventoryRequest request,
            @AuthenticationPrincipal CustomUserDetails currentUser) {

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(inventoryService.createProductAndAddToInventory(
                        storeId, request, currentUser.getUser().getId()));
    }

    @PostMapping
    @PreAuthorize("hasRole('STORE_OWNER')")
    @Operation(summary = "Add an existing catalog product to your inventory",
               description = "The product must already exist in the catalog. Use /with-product to create a new one.")
    public ResponseEntity<StoreInventoryResponse> addProduct(
            @PathVariable Long storeId,
            @Valid @RequestBody StoreInventoryRequest request,
            @AuthenticationPrincipal CustomUserDetails currentUser) {

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(inventoryService.addProduct(storeId, request, currentUser.getUser().getId()));
    }

    @PutMapping("/{inventoryId}")
    @PreAuthorize("hasRole('STORE_OWNER')")
    @Operation(summary = "Update quantity, price, or availability of a product")
    public ResponseEntity<StoreInventoryResponse> updateInventory(
            @PathVariable Long storeId,
            @PathVariable Long inventoryId,
            @Valid @RequestBody StoreInventoryRequest request,
            @AuthenticationPrincipal CustomUserDetails currentUser) {

        return ResponseEntity.ok(
                inventoryService.updateInventory(storeId, inventoryId, request, currentUser.getUser().getId()));
    }

    @DeleteMapping("/{inventoryId}")
    @PreAuthorize("hasRole('STORE_OWNER')")
    @Operation(summary = "Remove a product from your inventory")
    public ResponseEntity<Void> removeProduct(
            @PathVariable Long storeId,
            @PathVariable Long inventoryId,
            @AuthenticationPrincipal CustomUserDetails currentUser) {

        inventoryService.removeProduct(storeId, inventoryId, currentUser.getUser().getId());
        return ResponseEntity.noContent().build();
    }
}
