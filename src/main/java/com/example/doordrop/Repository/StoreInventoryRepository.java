package com.example.doordrop.Repository;

import com.example.doordrop.Entity.StoreInventory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface StoreInventoryRepository extends JpaRepository<StoreInventory, Long> {

    List<StoreInventory> findByStoreId(Long storeId);

    List<StoreInventory> findByStoreIdAndIsAvailableTrue(Long storeId);

    Optional<StoreInventory> findByStoreIdAndProductId(Long storeId, Long productId);

    /** Used to find which stores carry a product and have stock > 0. */
    List<StoreInventory> findByProductIdAndIsAvailableTrueAndQuantityGreaterThan(Long productId, int minQuantity);
}
