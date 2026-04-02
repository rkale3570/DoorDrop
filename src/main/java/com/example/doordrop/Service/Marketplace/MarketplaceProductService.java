package com.example.doordrop.Service.Marketplace;

import com.example.doordrop.Model.DTO.MarketplaceProductRequest;
import com.example.doordrop.Model.DTO.MarketplaceProductResponse;

import java.util.List;

public interface MarketplaceProductService {

    // ── Customer-facing ───────────────────────────────────────────────────────

    List<MarketplaceProductResponse> getAllProducts(Long userId);

    List<MarketplaceProductResponse> searchProducts(String query, Long userId);

    List<MarketplaceProductResponse> getProductsByCategory(Long categoryId, Long userId);

    MarketplaceProductResponse getProductById(Long productId, Long userId);

    // ── Seller-facing ─────────────────────────────────────────────────────────

    /** Seller creates a new product listing in the shared marketplace catalog. */
    MarketplaceProductResponse createProduct(MarketplaceProductRequest request, Long userId);

    MarketplaceProductResponse updateProduct(Long productId, MarketplaceProductRequest request, Long userId);

    void deleteProduct(Long productId, Long userId);

    /** Seller views all their own listings. */
    List<MarketplaceProductResponse> getMyProducts(Long userId);
}
