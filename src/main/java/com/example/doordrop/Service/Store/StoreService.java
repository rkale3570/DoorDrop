package com.example.doordrop.Service.Store;

import com.example.doordrop.Model.DTO.NearbyStoreResponse;
import com.example.doordrop.Model.DTO.StoreInventoryResponse;

import java.util.List;

public interface StoreService {

    /** Returns stores within delivery reach of the user's default address, sorted by distance. */
    List<NearbyStoreResponse> getNearbyStores(Long userId);

    NearbyStoreResponse getStoreById(Long storeId, Long userId);

    /** All products currently in stock at a specific store. */
    List<StoreInventoryResponse> getStoreProducts(Long storeId);
}
