package com.example.doordrop.Entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "order_items")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    /** Which kirana store fulfils this line item. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "store_id")
    private Store store;

    /** The store-order group this item belongs to (set for DOORDROP_NOW items). */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "store_order_group_id")
    private StoreOrderGroup storeOrderGroup;

    /** The seller-order group this item belongs to (set for MARKETPLACE items). */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "seller_order_group_id")
    private SellerOrderGroup sellerOrderGroup;

    @Column(nullable = false)
    private Integer quantity;

    @Column(name = "unit_price", nullable = false, precision = 10, scale = 2)
    private BigDecimal unitPrice;

    @Column(name = "total_price", nullable = false, precision = 10, scale = 2)
    private BigDecimal totalPrice;
}
