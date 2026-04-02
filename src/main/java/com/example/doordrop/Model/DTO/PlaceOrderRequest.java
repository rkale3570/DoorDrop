package com.example.doordrop.Model.DTO;

import lombok.Data;

@Data
public class PlaceOrderRequest {

    /**
     * Delivery address ID. If null, the user's default address is used.
     */
    private Long addressId;

    private String notes;
}
