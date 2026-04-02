package com.example.doordrop.ServiceImpl.Cart;

import com.example.doordrop.Entity.*;
import com.example.doordrop.Model.DTO.AddMarketplaceItemToCartRequest;
import com.example.doordrop.Model.DTO.AddToCartRequest;
import com.example.doordrop.Model.DTO.CartResponse;
import com.example.doordrop.Model.Enums.OrderType;
import com.example.doordrop.Repository.*;
import com.example.doordrop.Service.Cart.CartService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CartServiceImpl implements CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final StoreRepository storeRepository;
    private final StoreInventoryRepository inventoryRepository;

    @Override
    public CartResponse getCart(Long userId) {
        Cart cart = getOrCreateCart(userId);
        return CartResponse.from(cart);
    }

    @Override
    @Transactional
    public CartResponse addItem(Long userId, AddToCartRequest request) {
        Cart cart = getOrCreateCart(userId);

        Product product = productRepository.findByIdAndIsActiveTrue(request.getProductId())
                .orElseThrow(() -> new RuntimeException("Product not found: " + request.getProductId()));

        Store store = storeRepository.findById(request.getStoreId())
                .orElseThrow(() -> new RuntimeException("Store not found: " + request.getStoreId()));

        StoreInventory inventory = inventoryRepository
                .findByStoreIdAndProductId(request.getStoreId(), request.getProductId())
                .orElseThrow(() -> new RuntimeException(
                        "Product '" + product.getName() + "' is not available at " + store.getName()));

        if (!inventory.isAvailable() || inventory.getQuantity() < request.getQuantity()) {
            throw new RuntimeException("Insufficient stock at " + store.getName()
                    + ". Available: " + inventory.getQuantity());
        }

        // If the same product+store already in cart, merge quantities
        Optional<CartItem> existing = cartItemRepository
                .findByCartIdAndProductIdAndStoreId(cart.getId(), product.getId(), store.getId());

        if (existing.isPresent()) {
            CartItem item = existing.get();
            int newQty = item.getQuantity() + request.getQuantity();
            if (newQty > inventory.getQuantity()) {
                throw new RuntimeException("Cannot add more. Available stock: " + inventory.getQuantity());
            }
            item.setQuantity(newQty);
            cartItemRepository.save(item);
        } else {
            CartItem newItem = CartItem.builder()
                    .cart(cart)
                    .product(product)
                    .store(store)
                    .storeInventory(inventory)
                    .quantity(request.getQuantity())
                    .unitPrice(inventory.getPrice())
                    .build();
            cart.getItems().add(newItem);
        }

        return CartResponse.from(cartRepository.save(cart));
    }

    @Override
    @Transactional
    public CartResponse updateItemQuantity(Long userId, Long cartItemId, Integer quantity) {
        Cart cart = getOrCreateCart(userId);

        CartItem item = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new RuntimeException("Cart item not found: " + cartItemId));

        if (!item.getCart().getId().equals(cart.getId())) {
            throw new RuntimeException("Item does not belong to your cart.");
        }

        if (quantity <= 0) {
            cart.getItems().remove(item);
            cartItemRepository.delete(item);
        } else {
            // DoorDrop Now items have inventory; marketplace items do not
            if (item.getStoreInventory() != null) {
                StoreInventory inventory = item.getStoreInventory();
                if (quantity > inventory.getQuantity()) {
                    throw new RuntimeException("Insufficient stock. Available: " + inventory.getQuantity());
                }
            }
            item.setQuantity(quantity);
            cartItemRepository.save(item);
        }

        return CartResponse.from(cartRepository.save(cart));
    }

    @Override
    @Transactional
    public CartResponse removeItem(Long userId, Long cartItemId) {
        Cart cart = getOrCreateCart(userId);

        CartItem item = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new RuntimeException("Cart item not found: " + cartItemId));

        if (!item.getCart().getId().equals(cart.getId())) {
            throw new RuntimeException("Item does not belong to your cart.");
        }

        cart.getItems().remove(item);
        cartItemRepository.delete(item);

        return CartResponse.from(cartRepository.save(cart));
    }

    @Override
    @Transactional
    public void clearCart(Long userId) {
        Cart cart = getOrCreateCart(userId);
        cart.getItems().clear();
        cartRepository.save(cart);
    }

    @Override
    @Transactional
    public CartResponse addMarketplaceItem(Long userId, AddMarketplaceItemToCartRequest request) {
        Cart cart = getOrCreateCart(userId);

        Product product = productRepository.findByIdAndIsActiveTrue(request.getProductId())
                .orElseThrow(() -> new RuntimeException("Product not found: " + request.getProductId()));

        if (product.getProductType() != OrderType.MARKETPLACE) {
            throw new RuntimeException(
                    "This product is not a marketplace listing. Use /api/cart/items for DoorDrop Now items.");
        }

        if (product.getSeller() == null) {
            throw new RuntimeException("Product has no seller associated.");
        }

        // Merge if the same marketplace product is already in cart
        Optional<CartItem> existing = cartItemRepository
                .findByCartIdAndProductIdAndStoreIsNull(cart.getId(), product.getId());

        if (existing.isPresent()) {
            CartItem item = existing.get();
            item.setQuantity(item.getQuantity() + request.getQuantity());
            cartItemRepository.save(item);
        } else {
            CartItem newItem = CartItem.builder()
                    .cart(cart)
                    .product(product)
                    .store(null)
                    .storeInventory(null)
                    .quantity(request.getQuantity())
                    .unitPrice(product.getBasePrice())
                    .build();
            cart.getItems().add(newItem);
        }

        return CartResponse.from(cartRepository.save(cart));
    }

    // -------------------------------------------------------------------------

    private Cart getOrCreateCart(Long userId) {
        return cartRepository.findByUserId(userId).orElseGet(() -> {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found: " + userId));
            return cartRepository.save(Cart.builder().user(user).build());
        });
    }
}
