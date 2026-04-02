package com.example.doordrop.Model.DTO;

import com.example.doordrop.Model.Enums.StoreOrderStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UpdateStoreOrderStatusRequest {

    @NotNull(message = "Status is required")
    private StoreOrderStatus status;
}
