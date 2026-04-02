package com.example.doordrop.Controller;

import com.example.doordrop.Model.DTO.MarketplaceProductRequest;
import com.example.doordrop.Model.DTO.MarketplaceProductResponse;
import com.example.doordrop.Security.CustomUserDetails;
import com.example.doordrop.Service.Marketplace.MarketplaceProductService;
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
@RequestMapping("/api/marketplace/products")
@RequiredArgsConstructor
@Tag(name = "Marketplace Products", description = "Browse and manage marketplace listings — electronics, clothes, furniture, and more")
@SecurityRequirement(name = "bearerAuth")
public class MarketplaceProductController {

    private final MarketplaceProductService productService;

    // ── Customer-facing ───────────────────────────────────────────────────────

    @GetMapping
    @Operation(summary = "Browse all marketplace products",
               description = "Returns all active listings with a shipping estimate based on your default address.")
    public ResponseEntity<List<MarketplaceProductResponse>> getAllProducts(
            @AuthenticationPrincipal CustomUserDetails currentUser) {

        return ResponseEntity.ok(productService.getAllProducts(currentUser.getUser().getId()));
    }

    @GetMapping("/search")
    @Operation(summary = "Search marketplace products by name")
    public ResponseEntity<List<MarketplaceProductResponse>> searchProducts(
            @RequestParam String q,
            @AuthenticationPrincipal CustomUserDetails currentUser) {

        return ResponseEntity.ok(productService.searchProducts(q, currentUser.getUser().getId()));
    }

    @GetMapping("/category/{categoryId}")
    @Operation(summary = "Browse marketplace products by category",
               description = "Use categories like electronics, clothing, furniture, etc.")
    public ResponseEntity<List<MarketplaceProductResponse>> getByCategory(
            @PathVariable Long categoryId,
            @AuthenticationPrincipal CustomUserDetails currentUser) {

        return ResponseEntity.ok(
                productService.getProductsByCategory(categoryId, currentUser.getUser().getId()));
    }

    @GetMapping("/{productId}")
    @Operation(summary = "Get marketplace product details with shipping estimate")
    public ResponseEntity<MarketplaceProductResponse> getProduct(
            @PathVariable Long productId,
            @AuthenticationPrincipal CustomUserDetails currentUser) {

        return ResponseEntity.ok(productService.getProductById(productId, currentUser.getUser().getId()));
    }

    // ── Seller-facing ─────────────────────────────────────────────────────────

    @GetMapping("/my-listings")
    @PreAuthorize("hasRole('SELLER')")
    @Operation(summary = "Seller: view all your product listings")
    public ResponseEntity<List<MarketplaceProductResponse>> getMyListings(
            @AuthenticationPrincipal CustomUserDetails currentUser) {

        return ResponseEntity.ok(productService.getMyProducts(currentUser.getUser().getId()));
    }

    @PostMapping
    @PreAuthorize("hasRole('SELLER')")
    @Operation(summary = "Seller: create a new product listing",
               description = "Product is added to the shared marketplace catalog. weightKg is required for shipping cost calculation.")
    public ResponseEntity<MarketplaceProductResponse> createProduct(
            @Valid @RequestBody MarketplaceProductRequest request,
            @AuthenticationPrincipal CustomUserDetails currentUser) {

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(productService.createProduct(request, currentUser.getUser().getId()));
    }

    @PutMapping("/{productId}")
    @PreAuthorize("hasRole('SELLER')")
    @Operation(summary = "Seller: update a product listing")
    public ResponseEntity<MarketplaceProductResponse> updateProduct(
            @PathVariable Long productId,
            @Valid @RequestBody MarketplaceProductRequest request,
            @AuthenticationPrincipal CustomUserDetails currentUser) {

        return ResponseEntity.ok(
                productService.updateProduct(productId, request, currentUser.getUser().getId()));
    }

    @DeleteMapping("/{productId}")
    @PreAuthorize("hasRole('SELLER')")
    @Operation(summary = "Seller: deactivate a product listing")
    public ResponseEntity<Void> deleteProduct(
            @PathVariable Long productId,
            @AuthenticationPrincipal CustomUserDetails currentUser) {

        productService.deleteProduct(productId, currentUser.getUser().getId());
        return ResponseEntity.noContent().build();
    }
}
