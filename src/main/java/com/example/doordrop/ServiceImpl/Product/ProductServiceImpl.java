package com.example.doordrop.ServiceImpl.Product;

import com.example.doordrop.Entity.Address;
import com.example.doordrop.Entity.Product;
import com.example.doordrop.Entity.StoreInventory;
import com.example.doordrop.Model.DTO.ProductSearchResponse;
import com.example.doordrop.Model.DTO.StoreWithStockResponse;
import com.example.doordrop.Repository.AddressRepository;
import com.example.doordrop.Repository.ProductRepository;
import com.example.doordrop.Repository.StoreInventoryRepository;
import com.example.doordrop.Service.Product.ProductService;
import com.example.doordrop.Util.LocationUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final StoreInventoryRepository inventoryRepository;
    private final AddressRepository addressRepository;

    @Override
    public List<ProductSearchResponse> searchProducts(String query, Long userId) {
        Address userAddress = getUserDefaultAddress(userId);

        List<Product> products = productRepository.findByNameContainingIgnoreCaseAndIsActiveTrue(query);

        return products.stream()
                .map(product -> {
                    List<StoreWithStockResponse> nearbyStores = buildNearbyStoresForProduct(product.getId(), userAddress);
                    return ProductSearchResponse.from(product, nearbyStores);
                })
                .filter(r -> !r.getAvailableStores().isEmpty()) // only show products available near user
                .collect(Collectors.toList());
    }

    @Override
    public ProductSearchResponse getProductById(Long productId, Long userId) {
        Product product = productRepository.findByIdAndIsActiveTrue(productId)
                .orElseThrow(() -> new RuntimeException("Product not found: " + productId));

        Address userAddress = getUserDefaultAddress(userId);
        List<StoreWithStockResponse> nearbyStores = buildNearbyStoresForProduct(productId, userAddress);

        return ProductSearchResponse.from(product, nearbyStores);
    }

    @Override
    public List<StoreWithStockResponse> getStoresWithProduct(Long productId, Long userId) {
        productRepository.findByIdAndIsActiveTrue(productId)
                .orElseThrow(() -> new RuntimeException("Product not found: " + productId));

        Address userAddress = getUserDefaultAddress(userId);
        return buildNearbyStoresForProduct(productId, userAddress);
    }

    // -------------------------------------------------------------------------

    private Address getUserDefaultAddress(Long userId) {
        return addressRepository.findByUserIdAndIsDefaultTrue(userId)
                .orElseThrow(() -> new RuntimeException(
                        "No default address found. Please set a default delivery address."));
    }

    /**
     * Fetches all StoreInventory entries for a product with quantity > 0,
     * filters to stores within delivery radius of the user, attaches distance,
     * and sorts nearest-first. Marks the closest store as isNearestStore=true.
     */
    private List<StoreWithStockResponse> buildNearbyStoresForProduct(Long productId, Address userAddress) {
        if (userAddress.getLatitude() == null || userAddress.getLongitude() == null) {
            return List.of();
        }

        double userLat = userAddress.getLatitude();
        double userLon = userAddress.getLongitude();

        List<StoreInventory> inventories = inventoryRepository
                .findByProductIdAndIsAvailableTrueAndQuantityGreaterThan(productId, 0);

        List<StoreWithStockResponse> result = inventories.stream()
                .filter(inv -> {
                    double dist = LocationUtils.haversineDistance(
                            inv.getStore().getLatitude(), inv.getStore().getLongitude(),
                            userLat, userLon);
                    return dist <= inv.getStore().getDeliveryRadiusKm()
                            && inv.getStore().isOpen()
                            && inv.getStore().isActive();
                })
                .map(inv -> {
                    double dist = LocationUtils.haversineDistance(
                            inv.getStore().getLatitude(), inv.getStore().getLongitude(),
                            userLat, userLon);
                    return StoreWithStockResponse.from(inv, dist, false);
                })
                .sorted(Comparator.comparingDouble(StoreWithStockResponse::getDistanceKm))
                .collect(Collectors.toList());

        // Mark the nearest store
        if (!result.isEmpty()) {
            result.get(0).setNearestStore(true);
        }

        return result;
    }
}
