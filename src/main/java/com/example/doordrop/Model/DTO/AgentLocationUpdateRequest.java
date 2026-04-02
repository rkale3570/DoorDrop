package com.example.doordrop.Model.DTO;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

/** Sent by the delivery agent app every few seconds to broadcast their GPS position. */
@Data
public class AgentLocationUpdateRequest {

    @NotNull(message = "Latitude is required")
    private Double latitude;

    @NotNull(message = "Longitude is required")
    private Double longitude;
}
