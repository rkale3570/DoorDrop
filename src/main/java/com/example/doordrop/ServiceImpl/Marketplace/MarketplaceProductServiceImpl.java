package com.example.doordrop.ServiceImpl.Marketplace;

import com.example.doordrop.Entity.Category;
import com.example.doordrop.Entity.Product;
import com.example.doordrop.Entity.Seller;
import com.example.doordrop.Model.DTO.MarketplaceProductRequest;
import com.example.doordrop.Model.DTO.MarketplaceProductResponse;
import com.example.doordrop.Model.DTO.ShippingEstimateResponse;
import com.example.doordrop.Model.Enums.OrderType;
import com.example.doordrop.Repository.CategoryRepository;
import com.example.doordrop.Repository.ProductRepository;
import com.example.doordrop.Repository.SellerRepository;
import com.example.doordrop.Service.Marketplace.MarketplaceProductService;
import com.example.doordrop.Service.Shipping.ShippingService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MarketplaceProductServiceImpl implements MarketplaceProductService {

    private final ProductRepository productRepository;
    private final SellerRepository sellerRepository;
    private final CategoryRepository categoryRepository;
    private final ShippingService shippingService;

    @Override
    public List<MarketplaceProductResponse> getAllProducts(Long userId) {
        return productRepository.findByProductTypeAndIsActiveTrue(OrderType.MARKETPLACE).stream()
                .map(p -> toResponse(p, userId))
                .collect(Collectors.toList());
    }

    @Override
    public List<MarketplaceProductResponse> searchProducts(String query, Long userId) {
        return productRepository
                .findByProductTypeAndIsActiveTrueAndNameContainingIgnoreCase(OrderType.MARKETPLACE, query)
                .stream()
                .map(p -> toResponse(p, userId))
                .collect(Collectors.toList());
    }

    @Override
    public List<MarketplaceProductResponse> getProductsByCategory(Long categoryId, Long userId) {
        categoryRepository.findById(categoryId)
                .orElseThrow(() -> new RuntimeException("Category not found: " + categoryId));

        return productRepository
                .findByProductTypeAndCategoryIdAndIsActiveTrue(OrderType.MARKETPLACE, categoryId)
                .stream()
                .map(p -> toResponse(p, userId))
                .collect(Collectors.toList());
    }

    @Override
    public MarketplaceProductResponse getProductById(Long productId, Long userId) {
        Product product = productRepository.findByIdAndIsActiveTrue(productId)
                .orElseThrow(() -> new RuntimeException("Product not found: " + productId));

        if (product.getProductType() != OrderType.MARKETPLACE) {
            throw new RuntimeException("Product is not a marketplace listing.");
        }

        return toResponse(product, userId);
    }

    @Override
    @Transactional
    public MarketplaceProductResponse createProduct(MarketplaceProductRequest request, Long userId) {
        Seller seller = sellerRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException(
                        "Seller profile not found. Please complete onboarding at /api/seller/onboard first."));

        Category category = resolveCategory(request.getCategoryId());

        String sku = (request.getSku() != null && !request.getSku().isBlank())
                ? request.getSku()
                : "MKT-" + seller.getId() + "-" + System.currentTimeMillis();

        Product product = Product.builder()
                .name(request.getName())
                .description(request.getDescription())
                .sku(sku)
                .category(category)
                .seller(seller)
                .productType(OrderType.MARKETPLACE)
                .basePrice(request.getBasePrice())
                .mrp(request.getMrp() != null ? request.getMrp() : request.getBasePrice())
                .imageUrl(request.getImageUrl())
                .unit(request.getUnit())
                .weightKg(request.getWeightKg())
                .isActive(request.isActive())
                .build();

        return toResponse(productRepository.save(product), userId);
    }

    @Override
    @Transactional
    public MarketplaceProductResponse updateProduct(Long productId,
                                                     MarketplaceProductRequest request,
                                                     Long userId) {
        Product product = getSellerOwnedProduct(productId, userId);
        Category category = resolveCategory(request.getCategoryId());

        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setCategory(category);
        product.setBasePrice(request.getBasePrice());
        product.setMrp(request.getMrp() != null ? request.getMrp() : request.getBasePrice());
        product.setImageUrl(request.getImageUrl());
        product.setUnit(request.getUnit());
        product.setWeightKg(request.getWeightKg());
        product.setActive(request.isActive());

        return toResponse(productRepository.save(product), userId);
    }

    @Override
    @Transactional
    public void deleteProduct(Long productId, Long userId) {
        Product product = getSellerOwnedProduct(productId, userId);
        product.setActive(false);
        productRepository.save(product);
    }

    @Override
    public List<MarketplaceProductResponse> getMyProducts(Long userId) {
        Seller seller = sellerRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Seller profile not found."));

        return productRepository.findBySellerIdAndIsActiveTrue(seller.getId()).stream()
                .map(p -> toResponse(p, userId))
                .collect(Collectors.toList());
    }

    // -------------------------------------------------------------------------

    private MarketplaceProductResponse toResponse(Product product, Long userId) {
        ShippingEstimateResponse shipping = null;
        if (userId != null && product.getSeller() != null) {
            try {
                shipping = shippingService.estimate(product.getId(), userId);
            } catch (Exception ignored) {
                // Shipping estimate is best-effort; never block product display
            }
        }
        return MarketplaceProductResponse.from(product, shipping);
    }

    private Product getSellerOwnedProduct(Long productId, Long userId) {
        Seller seller = sellerRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Seller profile not found."));

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found: " + productId));

        if (product.getSeller() == null || !product.getSeller().getId().equals(seller.getId())) {
            throw new RuntimeException("Access denied: this product does not belong to you.");
        }
        return product;
    }

    private Category resolveCategory(Long categoryId) {
        if (categoryId == null) return null;
        return categoryRepository.findById(categoryId)
                .orElseThrow(() -> new RuntimeException("Category not found: " + categoryId));
    }
}
