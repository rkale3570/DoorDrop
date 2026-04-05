package com.example.doordrop.Service.Store;

import com.example.doordrop.Model.DTO.NearbyStoreResponse;
import com.example.doordrop.Model.DTO.StoreInventoryResponse;
import com.example.doordrop.Model.DTO.StoreOnboardingRequest;

import java.util.List;

public interface StoreService {

    /** Returns stores within delivery reach of the user's default address, sorted by distance. */
    List<NearbyStoreResponse> getNearbyStores(Long userId);

    NearbyStoreResponse getStoreById(Long storeId, Long userId);

    /** One-time onboarding: create a store for this STORE_OWNER account. */
    NearbyStoreResponse createStore(StoreOnboardingRequest request, Long userId);

    /** Get the store owned by the given user (store owner). */
    NearbyStoreResponse getMyStore(Long userId);

    /** All products currently in stock at a specific store. */
    List<StoreInventoryResponse> getStoreProducts(Long storeId);

    /** Admin: approve a store so the owner can access the dashboard. */
    NearbyStoreResponse approveStore(Long storeId);
}
