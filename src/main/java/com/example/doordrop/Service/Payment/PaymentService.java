package com.example.doordrop.Service.Payment;

import com.example.doordrop.Model.DTO.PaymentOrderResponse;
import com.example.doordrop.Model.DTO.PaymentStatusResponse;
import com.example.doordrop.Model.DTO.PaymentVerificationRequest;

import java.util.Map;

public interface PaymentService {

    /**
     * Creates a Razorpay order and returns the details the frontend needs
     * to launch the Razorpay checkout widget.
     */
    PaymentOrderResponse initiateOnlinePayment(Long orderId, Long userId);

    /**
     * Verifies the Razorpay signature after the user completes payment.
     * On success: marks payment as PAID and triggers delivery agent assignment.
     */
    PaymentStatusResponse verifyPayment(PaymentVerificationRequest request, Long userId);

    /**
     * Records a Cash-on-Delivery payment and triggers delivery agent assignment.
     */
    PaymentStatusResponse recordCodPayment(Long orderId, Long userId);

    PaymentStatusResponse getPaymentStatus(Long orderId, Long userId);

    /**
     * Called by the Razorpay webhook endpoint.
     * @param rawBody      raw request body (needed for signature validation)
     * @param signature    value of X-Razorpay-Signature header
     * @param payload      parsed JSON payload from the webhook body
     */
    void handleWebhook(String rawBody, String signature, Map<String, Object> payload);
}
