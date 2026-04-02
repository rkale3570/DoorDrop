package com.example.doordrop.Controller;

import com.example.doordrop.Model.DTO.ProductSearchResponse;
import com.example.doordrop.Model.DTO.StoreWithStockResponse;
import com.example.doordrop.Security.CustomUserDetails;
import com.example.doordrop.Service.Product.ProductService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
@Tag(name = "Products", description = "Search products and find stores that carry them")
@SecurityRequirement(name = "bearerAuth")
public class ProductController {

    private final ProductService productService;

    @GetMapping("/search")
    @Operation(summary = "Search products by name",
               description = "Returns products matching the query, each with a list of nearby stores that have them in stock, sorted by distance from your default address.")
    public ResponseEntity<List<ProductSearchResponse>> searchProducts(
            @RequestParam String q,
            @AuthenticationPrincipal CustomUserDetails currentUser) {

        return ResponseEntity.ok(productService.searchProducts(q, currentUser.getUser().getId()));
    }

    @GetMapping("/{productId}")
    @Operation(summary = "Get product details with available stores")
    public ResponseEntity<ProductSearchResponse> getProduct(
            @PathVariable Long productId,
            @AuthenticationPrincipal CustomUserDetails currentUser) {

        return ResponseEntity.ok(productService.getProductById(productId, currentUser.getUser().getId()));
    }

    @GetMapping("/{productId}/stores")
    @Operation(summary = "See all nearby stores that have this product in stock",
               description = "Sorted by distance from your default address. The nearest store is flagged with isNearestStore=true.")
    public ResponseEntity<List<StoreWithStockResponse>> getStoresWithProduct(
            @PathVariable Long productId,
            @AuthenticationPrincipal CustomUserDetails currentUser) {

        return ResponseEntity.ok(productService.getStoresWithProduct(productId, currentUser.getUser().getId()));
    }
}
