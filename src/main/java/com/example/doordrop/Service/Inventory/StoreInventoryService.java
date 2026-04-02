package com.example.doordrop.Service.Inventory;

import com.example.doordrop.Model.DTO.CreateProductWithInventoryRequest;
import com.example.doordrop.Model.DTO.StoreInventoryRequest;
import com.example.doordrop.Model.DTO.StoreInventoryResponse;

import java.util.List;

public interface StoreInventoryService {

    /** Store owner adds a product to their inventory. */
    StoreInventoryResponse addProduct(Long storeId, StoreInventoryRequest request, Long requestingUserId);

    /**
     * Store owner creates a brand-new product in the shared catalog
     * and immediately adds it to their own inventory.
     */
    StoreInventoryResponse createProductAndAddToInventory(Long storeId,
                                                           CreateProductWithInventoryRequest request,
                                                           Long requestingUserId);

    /** Store owner updates quantity/price/availability of an existing inventory entry. */
    StoreInventoryResponse updateInventory(Long storeId, Long inventoryId,
                                           StoreInventoryRequest request, Long requestingUserId);

    /** Store owner removes a product from their inventory. */
    void removeProduct(Long storeId, Long inventoryId, Long requestingUserId);

    List<StoreInventoryResponse> getInventory(Long storeId, Long requestingUserId);
}
