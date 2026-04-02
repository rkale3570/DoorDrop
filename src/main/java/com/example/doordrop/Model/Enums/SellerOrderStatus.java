package com.example.doordrop.Model.Enums;

public enum SellerOrderStatus {
    PENDING,            // Order received, seller not yet confirmed
    CONFIRMED,          // Seller accepted the order
    PROCESSING,         // Seller is packing / processing
    SHIPPED,            // Dispatched — seller adds tracking ID
    OUT_FOR_DELIVERY,   // Last-mile delivery in progress
    DELIVERED,          // Customer received
    CANCELLED,          // Cancelled before shipping
    RETURN_REQUESTED,   // Customer requested return
    RETURNED            // Return completed
}
