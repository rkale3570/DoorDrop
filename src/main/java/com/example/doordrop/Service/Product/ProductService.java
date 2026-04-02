package com.example.doordrop.Service.Product;

import com.example.doordrop.Model.DTO.ProductSearchResponse;
import com.example.doordrop.Model.DTO.StoreWithStockResponse;

import java.util.List;

public interface ProductService {

    /**
     * Full-text search by product name.
     * Each result includes the list of nearby stores that have the product in stock,
     * sorted by distance from the user's default address.
     */
    List<ProductSearchResponse> searchProducts(String query, Long userId);

    ProductSearchResponse getProductById(Long productId, Long userId);

    /** Returns all stores near the user that carry this product, sorted by distance. */
    List<StoreWithStockResponse> getStoresWithProduct(Long productId, Long userId);
}
