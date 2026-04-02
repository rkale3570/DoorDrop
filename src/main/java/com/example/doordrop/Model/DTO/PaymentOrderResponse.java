package com.example.doordrop.Model.DTO;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

/** Returned to the frontend after initiating a Razorpay payment session. */
@Data
@Builder
public class PaymentOrderResponse {

    private Long orderId;
    private String orderNumber;
    /** Razorpay order ID — pass this to the Razorpay JS checkout. */
    private String razorpayOrderId;
    /** Amount in INR (not paise). */
    private BigDecimal amount;
    private String currency;
    /** Razorpay key_id needed to initialise the checkout widget on the frontend. */
    private String razorpayKeyId;
    private String description;
}
