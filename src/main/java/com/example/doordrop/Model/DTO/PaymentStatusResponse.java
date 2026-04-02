package com.example.doordrop.Model.DTO;

import com.example.doordrop.Entity.Payment;
import com.example.doordrop.Model.Enums.PaymentStatus;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
public class PaymentStatusResponse {

    private Long paymentId;
    private Long orderId;
    private String orderNumber;
    private PaymentStatus status;
    private String paymentMethod;
    private BigDecimal amount;
    private String razorpayPaymentId;
    private LocalDateTime paidAt;
    private LocalDateTime createdAt;

    public static PaymentStatusResponse from(Payment payment) {
        return PaymentStatusResponse.builder()
                .paymentId(payment.getId())
                .orderId(payment.getOrder().getId())
                .orderNumber(payment.getOrder().getOrderNumber())
                .status(payment.getStatus())
                .paymentMethod(payment.getPaymentMethod())
                .amount(payment.getAmount())
                .razorpayPaymentId(payment.getRazorpayPaymentId())
                .paidAt(payment.getPaidAt())
                .createdAt(payment.getCreatedAt())
                .build();
    }
}
