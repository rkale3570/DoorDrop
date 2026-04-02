package com.example.doordrop.Model.Enums;

public enum StoreOrderStatus {
    PENDING,          // Order received, store not yet confirmed
    CONFIRMED,        // Store confirmed the order
    PREPARING,        // Store is packing items
    READY_FOR_PICKUP, // Ready for delivery agent to collect
    PICKED_UP,        // Delivery agent collected from store
    CANCELLED         // Store cancelled (e.g. out of stock)
}
