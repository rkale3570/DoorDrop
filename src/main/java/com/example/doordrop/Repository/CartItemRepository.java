package com.example.doordrop.Repository;

import com.example.doordrop.Entity.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CartItemRepository extends JpaRepository<CartItem, Long> {

    /** Prevents duplicate line items for the same product+store combination (DoorDrop Now). */
    Optional<CartItem> findByCartIdAndProductIdAndStoreId(Long cartId, Long productId, Long storeId);

    /** Prevents duplicate marketplace line items (store is null for marketplace). */
    Optional<CartItem> findByCartIdAndProductIdAndStoreIsNull(Long cartId, Long productId);
}
