package com.example.doordrop.ServiceImpl.Order;

import com.example.doordrop.Entity.*;
import com.example.doordrop.Model.DTO.*;
import com.example.doordrop.Model.Enums.*;
import com.example.doordrop.Repository.*;
import com.example.doordrop.Service.Order.OrderService;
import com.example.doordrop.Service.Shipping.ShippingService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final StoreOrderGroupRepository storeOrderGroupRepository;
    private final SellerOrderGroupRepository sellerOrderGroupRepository;
    private final CartRepository cartRepository;
    private final AddressRepository addressRepository;
    private final StoreInventoryRepository inventoryRepository;
    private final StoreRepository storeRepository;
    private final SellerRepository sellerRepository;
    private final UserRepository userRepository;
    private final ShippingService shippingService;
    private final PaymentRepository paymentRepository;

    private static final BigDecimal DELIVERY_FEE_PER_STORE = new BigDecimal("20.00");

    @Override
    @Transactional
    public OrderResponse placeOrder(Long userId, PlaceOrderRequest request) {
        Cart cart = cartRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Cart is empty."));

        if (cart.getItems().isEmpty()) {
            throw new RuntimeException("Cannot place order: cart is empty.");
        }

        Address deliveryAddress = resolveDeliveryAddress(userId, request.getAddressId());

        // Separate items by type
        List<CartItem> nowItems = cart.getItems().stream()
                .filter(i -> i.getStore() != null)
                .collect(Collectors.toList());

        List<CartItem> marketplaceItems = cart.getItems().stream()
                .filter(i -> i.getStore() == null)
                .collect(Collectors.toList());

        // Validate DoorDrop Now stock before touching anything
        for (CartItem cartItem : nowItems) {
            StoreInventory inv = cartItem.getStoreInventory();
            if (inv.getQuantity() < cartItem.getQuantity()) {
                throw new RuntimeException(
                        "Insufficient stock for '" + cartItem.getProduct().getName()
                        + "' at " + cartItem.getStore().getName()
                        + ". Available: " + inv.getQuantity());
            }
        }

        // Group NOW items by store, MARKETPLACE items by seller
        Map<Long, List<CartItem>> nowByStore = nowItems.stream()
                .collect(Collectors.groupingBy(i -> i.getStore().getId()));

        Map<Long, List<CartItem>> marketplaceBySeller = marketplaceItems.stream()
                .filter(i -> i.getProduct().getSeller() != null)
                .collect(Collectors.groupingBy(i -> i.getProduct().getSeller().getId()));

        // Calculate subtotals
        BigDecimal subtotal = cart.getItems().stream()
                .map(i -> i.getUnitPrice().multiply(BigDecimal.valueOf(i.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal nowDeliveryFee = DELIVERY_FEE_PER_STORE.multiply(
                BigDecimal.valueOf(nowByStore.size()));

        // Marketplace shipping fees (one per seller)
        BigDecimal marketplaceShippingFee = BigDecimal.ZERO;
        Map<Long, ShippingEstimateResponse> shippingBySeller = new HashMap<>();
        for (Map.Entry<Long, List<CartItem>> entry : marketplaceBySeller.entrySet()) {
            double totalWeightKg = entry.getValue().stream()
                    .mapToDouble(i -> {
                        double w = i.getProduct().getWeightKg() != null ? i.getProduct().getWeightKg() : 0.5;
                        return w * i.getQuantity();
                    }).sum();
            ShippingEstimateResponse estimate = shippingService.calculate(entry.getKey(), userId, totalWeightKg);
            shippingBySeller.put(entry.getKey(), estimate);
            marketplaceShippingFee = marketplaceShippingFee.add(estimate.getShippingFee());
        }

        BigDecimal totalDeliveryFee = nowDeliveryFee.add(marketplaceShippingFee);
        BigDecimal totalAmount = subtotal.add(totalDeliveryFee);

        // Determine overall order type
        OrderType orderType = !nowItems.isEmpty() && !marketplaceItems.isEmpty()
                ? OrderType.DOORDROP_NOW   // mixed cart — label by dominant type
                : (!marketplaceItems.isEmpty() ? OrderType.MARKETPLACE : OrderType.DOORDROP_NOW);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Order order = Order.builder()
                .orderNumber(generateOrderNumber())
                .user(user)
                .orderType(orderType)
                .status(OrderStatus.CONFIRMED)
                .deliveryAddress(deliveryAddress)
                .subtotal(subtotal)
                .deliveryFee(totalDeliveryFee)
                .totalAmount(totalAmount)
                .notes(request.getNotes())
                .estimatedDeliveryTime(LocalDateTime.now().plusMinutes(30))
                .build();

        order = orderRepository.save(order);

        // ── DoorDrop Now: create StoreOrderGroups ─────────────────────────────
        List<StoreOrderGroup> storeGroups = new ArrayList<>();

        for (Map.Entry<Long, List<CartItem>> entry : nowByStore.entrySet()) {
            Store store = storeRepository.findById(entry.getKey()).orElseThrow();
            List<CartItem> storeItems = entry.getValue();

            BigDecimal storeSubtotal = lineSubtotal(storeItems);

            StoreOrderGroup group = storeOrderGroupRepository.save(
                    StoreOrderGroup.builder()
                            .order(order).store(store)
                            .status(StoreOrderStatus.PENDING)
                            .subtotal(storeSubtotal).build());

            for (CartItem ci : storeItems) {
                BigDecimal lineTotal = ci.getUnitPrice().multiply(BigDecimal.valueOf(ci.getQuantity()));
                orderItemRepository.save(OrderItem.builder()
                        .order(order).product(ci.getProduct())
                        .store(store).storeOrderGroup(group)
                        .quantity(ci.getQuantity())
                        .unitPrice(ci.getUnitPrice()).totalPrice(lineTotal).build());

                StoreInventory inv = ci.getStoreInventory();
                int newQty = inv.getQuantity() - ci.getQuantity();
                inv.setQuantity(newQty);
                inv.setAvailable(newQty > 0);
                inventoryRepository.save(inv);
            }
            storeGroups.add(group);
        }

        // ── Marketplace: create SellerOrderGroups ─────────────────────────────
        List<SellerOrderGroup> sellerGroups = new ArrayList<>();

        for (Map.Entry<Long, List<CartItem>> entry : marketplaceBySeller.entrySet()) {
            Seller seller = sellerRepository.findById(entry.getKey()).orElseThrow();
            List<CartItem> sellerItems = entry.getValue();

            BigDecimal sellerSubtotal = lineSubtotal(sellerItems);
            ShippingEstimateResponse estimate = shippingBySeller.get(entry.getKey());

            SellerOrderGroup group = sellerOrderGroupRepository.save(
                    SellerOrderGroup.builder()
                            .order(order).seller(seller)
                            .status(SellerOrderStatus.PENDING)
                            .subtotal(sellerSubtotal)
                            .shippingFee(estimate.getShippingFee())
                            .estimatedDeliveryDays(estimate.getEstimatedDays()).build());

            for (CartItem ci : sellerItems) {
                BigDecimal lineTotal = ci.getUnitPrice().multiply(BigDecimal.valueOf(ci.getQuantity()));
                orderItemRepository.save(OrderItem.builder()
                        .order(order).product(ci.getProduct())
                        .sellerOrderGroup(group)
                        .quantity(ci.getQuantity())
                        .unitPrice(ci.getUnitPrice()).totalPrice(lineTotal).build());
            }
            sellerGroups.add(group);
        }

        // Clear cart
        cart.getItems().clear();
        cartRepository.save(cart);

        // Create a pending Payment record — customer will call /api/payments/initiate or /cod next
        paymentRepository.save(Payment.builder()
                .order(order)
                .amount(totalAmount)
                .paymentMethod("PENDING")
                .status(PaymentStatus.PENDING)
                .build());

        return buildOrderResponse(order, storeGroups, sellerGroups);
    }

    @Override
    public List<OrderResponse> getUserOrders(Long userId) {
        return orderRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(order -> OrderResponse.from(
                        order,
                        buildStoreGroupResponses(order.getId()),
                        buildSellerGroupResponses(order.getId())))
                .collect(Collectors.toList());
    }

    @Override
    public OrderResponse getOrderById(Long orderId, Long userId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found: " + orderId));

        if (!order.getUser().getId().equals(userId)) {
            throw new RuntimeException("Access denied: this order does not belong to you.");
        }

        return OrderResponse.from(order,
                buildStoreGroupResponses(orderId),
                buildSellerGroupResponses(orderId));
    }

    @Override
    public List<StoreOrderGroupResponse> getStoreOrders(Long requestingUserId) {
        Store store = storeRepository.findByUserId(requestingUserId)
                .orElseThrow(() -> new RuntimeException("No store found for this user. Are you a store owner?"));

        return storeOrderGroupRepository.findByStoreIdOrderByCreatedAtDesc(store.getId()).stream()
                .map(group -> {
                    group.setItems(orderItemRepository.findByStoreOrderGroupId(group.getId()));
                    return StoreOrderGroupResponse.from(group);
                })
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public StoreOrderGroupResponse updateStoreOrderStatus(Long groupId,
                                                           UpdateStoreOrderStatusRequest request,
                                                           Long requestingUserId) {
        Store store = storeRepository.findByUserId(requestingUserId)
                .orElseThrow(() -> new RuntimeException("No store found for this user."));

        StoreOrderGroup group = storeOrderGroupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Order group not found: " + groupId));

        if (!group.getStore().getId().equals(store.getId())) {
            throw new RuntimeException("Access denied: this order group does not belong to your store.");
        }

        group.setStatus(request.getStatus());
        group = storeOrderGroupRepository.save(group);
        group.setItems(orderItemRepository.findByStoreOrderGroupId(group.getId()));

        return StoreOrderGroupResponse.from(group);
    }

    // ── Seller order management ───────────────────────────────────────────────

    public List<SellerOrderGroupResponse> getSellerOrders(Long requestingUserId) {
        Seller seller = sellerRepository.findByUserId(requestingUserId)
                .orElseThrow(() -> new RuntimeException("No seller profile found for this user."));

        return sellerOrderGroupRepository.findBySellerIdOrderByCreatedAtDesc(seller.getId()).stream()
                .map(group -> {
                    group.setItems(orderItemRepository.findBySellerOrderGroupId(group.getId()));
                    return SellerOrderGroupResponse.from(group);
                })
                .collect(Collectors.toList());
    }

    @Transactional
    public SellerOrderGroupResponse updateSellerOrderStatus(Long groupId,
                                                             UpdateSellerOrderStatusRequest request,
                                                             Long requestingUserId) {
        Seller seller = sellerRepository.findByUserId(requestingUserId)
                .orElseThrow(() -> new RuntimeException("No seller profile found for this user."));

        SellerOrderGroup group = sellerOrderGroupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Seller order group not found: " + groupId));

        if (!group.getSeller().getId().equals(seller.getId())) {
            throw new RuntimeException("Access denied: this order group does not belong to you.");
        }

        if (request.getStatus() == SellerOrderStatus.SHIPPED && request.getTrackingId() == null) {
            throw new RuntimeException("Tracking ID is required when marking an order as SHIPPED.");
        }

        group.setStatus(request.getStatus());
        if (request.getTrackingId() != null) {
            group.setTrackingId(request.getTrackingId());
        }

        group = sellerOrderGroupRepository.save(group);
        group.setItems(orderItemRepository.findBySellerOrderGroupId(group.getId()));

        return SellerOrderGroupResponse.from(group);
    }

    // -------------------------------------------------------------------------

    private Address resolveDeliveryAddress(Long userId, Long addressId) {
        if (addressId != null) {
            Address address = addressRepository.findById(addressId)
                    .orElseThrow(() -> new RuntimeException("Address not found: " + addressId));
            if (!address.getUser().getId().equals(userId)) {
                throw new RuntimeException("Address does not belong to you.");
            }
            return address;
        }
        return addressRepository.findByUserIdAndIsDefaultTrue(userId)
                .orElseThrow(() -> new RuntimeException("No default address found. Please provide an address ID."));
    }

    private BigDecimal lineSubtotal(List<CartItem> items) {
        return items.stream()
                .map(i -> i.getUnitPrice().multiply(BigDecimal.valueOf(i.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private OrderResponse buildOrderResponse(Order order,
                                              List<StoreOrderGroup> storeGroups,
                                              List<SellerOrderGroup> sellerGroups) {
        List<StoreOrderGroupResponse> storeResponses = storeGroups.stream()
                .map(g -> {
                    g.setItems(orderItemRepository.findByStoreOrderGroupId(g.getId()));
                    return StoreOrderGroupResponse.from(g);
                }).collect(Collectors.toList());

        List<SellerOrderGroupResponse> sellerResponses = sellerGroups.stream()
                .map(g -> {
                    g.setItems(orderItemRepository.findBySellerOrderGroupId(g.getId()));
                    return SellerOrderGroupResponse.from(g);
                }).collect(Collectors.toList());

        return OrderResponse.from(order, storeResponses, sellerResponses);
    }

    private List<StoreOrderGroupResponse> buildStoreGroupResponses(Long orderId) {
        return storeOrderGroupRepository.findByOrderId(orderId).stream()
                .map(group -> {
                    group.setItems(orderItemRepository.findByStoreOrderGroupId(group.getId()));
                    return StoreOrderGroupResponse.from(group);
                }).collect(Collectors.toList());
    }

    private List<SellerOrderGroupResponse> buildSellerGroupResponses(Long orderId) {
        return sellerOrderGroupRepository.findByOrderId(orderId).stream()
                .map(group -> {
                    group.setItems(orderItemRepository.findBySellerOrderGroupId(group.getId()));
                    return SellerOrderGroupResponse.from(group);
                }).collect(Collectors.toList());
    }

    private String generateOrderNumber() {
        return "DDN-" + System.currentTimeMillis() + "-" + (int) (Math.random() * 9000 + 1000);
    }
}
