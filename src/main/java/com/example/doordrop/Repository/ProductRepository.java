package com.example.doordrop.Repository;

import com.example.doordrop.Entity.Product;
import com.example.doordrop.Model.Enums.OrderType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ProductRepository extends JpaRepository<Product, Long> {

    List<Product> findByNameContainingIgnoreCaseAndIsActiveTrue(String name);

    List<Product> findByProductTypeAndIsActiveTrue(OrderType productType);

    Optional<Product> findByIdAndIsActiveTrue(Long id);

    List<Product> findByCategoryIdAndIsActiveTrue(Long categoryId);

    // ── Marketplace-specific ──────────────────────────────────────────────────

    List<Product> findBySellerIdAndIsActiveTrue(Long sellerId);

    List<Product> findByProductTypeAndIsActiveTrueAndNameContainingIgnoreCase(
            OrderType productType, String name);

    List<Product> findByProductTypeAndCategoryIdAndIsActiveTrue(
            OrderType productType, Long categoryId);
}
