package com.example.doordrop.Entity;

import com.example.doordrop.Model.Enums.SellerOrderStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Represents a single seller's slice of a marketplace order.
 * One row per (order, seller) pair.
 * Sellers manage their own SellerOrderGroup independently.
 */
@Entity
@Table(name = "seller_order_groups", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"order_id", "seller_id"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SellerOrderGroup {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "seller_id", nullable = false)
    private Seller seller;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private SellerOrderStatus status = SellerOrderStatus.PENDING;

    /** Product cost for this seller's items (before shipping). */
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal subtotal;

    /** Shipping fee calculated from distance + weight. */
    @Column(name = "shipping_fee", nullable = false, precision = 10, scale = 2)
    private BigDecimal shippingFee;

    @Column(name = "estimated_delivery_days")
    private Integer estimatedDeliveryDays;

    /** Tracking ID the seller provides after shipping. */
    @Column(name = "tracking_id")
    private String trackingId;

    @OneToMany(mappedBy = "sellerOrderGroup", fetch = FetchType.LAZY)
    @Builder.Default
    private List<OrderItem> items = new ArrayList<>();

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
