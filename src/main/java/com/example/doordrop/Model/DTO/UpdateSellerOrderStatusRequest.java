package com.example.doordrop.Model.DTO;

import com.example.doordrop.Model.Enums.SellerOrderStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UpdateSellerOrderStatusRequest {

    @NotNull(message = "Status is required")
    private SellerOrderStatus status;

    /** Tracking ID — required when status is SHIPPED. */
    private String trackingId;
}
