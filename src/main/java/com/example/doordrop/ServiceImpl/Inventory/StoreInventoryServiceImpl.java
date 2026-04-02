package com.example.doordrop.ServiceImpl.Inventory;

import com.example.doordrop.Entity.Category;
import com.example.doordrop.Entity.Product;
import com.example.doordrop.Entity.Store;
import com.example.doordrop.Entity.StoreInventory;
import com.example.doordrop.Model.DTO.CreateProductWithInventoryRequest;
import com.example.doordrop.Model.DTO.StoreInventoryRequest;
import com.example.doordrop.Model.DTO.StoreInventoryResponse;
import com.example.doordrop.Model.Enums.OrderType;
import com.example.doordrop.Repository.CategoryRepository;
import com.example.doordrop.Repository.ProductRepository;
import com.example.doordrop.Repository.StoreInventoryRepository;
import com.example.doordrop.Repository.StoreRepository;
import com.example.doordrop.Service.Inventory.StoreInventoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StoreInventoryServiceImpl implements StoreInventoryService {

    private final StoreInventoryRepository inventoryRepository;
    private final StoreRepository storeRepository;
    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;

    @Override
    @Transactional
    public StoreInventoryResponse addProduct(Long storeId, StoreInventoryRequest request, Long requestingUserId) {
        Store store = verifyStoreOwnership(storeId, requestingUserId);

        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new RuntimeException("Product not found: " + request.getProductId()));

        if (inventoryRepository.findByStoreIdAndProductId(storeId, request.getProductId()).isPresent()) {
            throw new RuntimeException("Product already in inventory. Use update to change quantity/price.");
        }

        StoreInventory inventory = StoreInventory.builder()
                .store(store)
                .product(product)
                .quantity(request.getQuantity())
                .price(request.getPrice())
                .isAvailable(request.isAvailable() && request.getQuantity() > 0)
                .lowStockThreshold(request.getLowStockThreshold())
                .build();

        return StoreInventoryResponse.from(inventoryRepository.save(inventory));
    }

    @Override
    @Transactional
    public StoreInventoryResponse updateInventory(Long storeId, Long inventoryId,
                                                   StoreInventoryRequest request, Long requestingUserId) {
        verifyStoreOwnership(storeId, requestingUserId);

        StoreInventory inventory = inventoryRepository.findById(inventoryId)
                .orElseThrow(() -> new RuntimeException("Inventory entry not found: " + inventoryId));

        if (!inventory.getStore().getId().equals(storeId)) {
            throw new RuntimeException("Inventory entry does not belong to this store.");
        }

        inventory.setQuantity(request.getQuantity());
        inventory.setPrice(request.getPrice());
        inventory.setAvailable(request.isAvailable() && request.getQuantity() > 0);
        inventory.setLowStockThreshold(request.getLowStockThreshold());

        return StoreInventoryResponse.from(inventoryRepository.save(inventory));
    }

    @Override
    @Transactional
    public void removeProduct(Long storeId, Long inventoryId, Long requestingUserId) {
        verifyStoreOwnership(storeId, requestingUserId);

        StoreInventory inventory = inventoryRepository.findById(inventoryId)
                .orElseThrow(() -> new RuntimeException("Inventory entry not found: " + inventoryId));

        if (!inventory.getStore().getId().equals(storeId)) {
            throw new RuntimeException("Inventory entry does not belong to this store.");
        }

        inventoryRepository.delete(inventory);
    }

    @Override
    public List<StoreInventoryResponse> getInventory(Long storeId, Long requestingUserId) {
        verifyStoreOwnership(storeId, requestingUserId);

        return inventoryRepository.findByStoreId(storeId).stream()
                .map(StoreInventoryResponse::from)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public StoreInventoryResponse createProductAndAddToInventory(Long storeId,
                                                                  CreateProductWithInventoryRequest request,
                                                                  Long requestingUserId) {
        Store store = verifyStoreOwnership(storeId, requestingUserId);

        // Resolve optional category
        Category category = null;
        if (request.getCategoryId() != null) {
            category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new RuntimeException("Category not found: " + request.getCategoryId()));
        }

        // Auto-generate SKU if not supplied
        String sku = (request.getSku() != null && !request.getSku().isBlank())
                ? request.getSku()
                : "DDN-" + storeId + "-" + System.currentTimeMillis();

        if (productRepository.findAll().stream()
                .anyMatch(p -> sku.equals(p.getSku()))) {
            throw new RuntimeException("SKU already exists: " + sku);
        }

        // Create product in the shared catalog
        Product product = Product.builder()
                .name(request.getName())
                .description(request.getDescription())
                .sku(sku)
                .category(category)
                .productType(OrderType.DOORDROP_NOW)
                .basePrice(request.getPrice())   // store's selling price doubles as base price
                .mrp(request.getMrp() != null ? request.getMrp() : request.getPrice())
                .imageUrl(request.getImageUrl())
                .unit(request.getUnit())
                .weightKg(request.getWeightKg())
                .isActive(true)
                .build();

        product = productRepository.save(product);

        // Add to this store's inventory immediately
        StoreInventory inventory = StoreInventory.builder()
                .store(store)
                .product(product)
                .quantity(request.getQuantity())
                .price(request.getPrice())
                .isAvailable(request.getQuantity() > 0)
                .lowStockThreshold(request.getLowStockThreshold())
                .build();

        return StoreInventoryResponse.from(inventoryRepository.save(inventory));
    }

    /** Validates that the requesting user is the owner of the given store. */
    private Store verifyStoreOwnership(Long storeId, Long userId) {
        Store store = storeRepository.findById(storeId)
                .orElseThrow(() -> new RuntimeException("Store not found: " + storeId));

        if (store.getUser() == null || !store.getUser().getId().equals(userId)) {
            throw new RuntimeException("Access denied: you are not the owner of this store.");
        }
        return store;
    }
}
