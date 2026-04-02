package com.example.doordrop.Controller;

import com.example.doordrop.Model.DTO.PaymentOrderResponse;
import com.example.doordrop.Model.DTO.PaymentStatusResponse;
import com.example.doordrop.Model.DTO.PaymentVerificationRequest;
import com.example.doordrop.Security.CustomUserDetails;
import com.example.doordrop.Service.Payment.PaymentService;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
@Tag(name = "Payments", description = "Razorpay online payments and COD")
public class PaymentController {

    private final PaymentService paymentService;
    private final ObjectMapper objectMapper;

    @PostMapping("/initiate/{orderId}")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Initiate online payment",
               description = "Creates a Razorpay order. Return the razorpayOrderId and razorpayKeyId to your frontend to open the Razorpay checkout widget.")
    public ResponseEntity<PaymentOrderResponse> initiatePayment(
            @PathVariable Long orderId,
            @AuthenticationPrincipal CustomUserDetails currentUser) {

        return ResponseEntity.ok(
                paymentService.initiateOnlinePayment(orderId, currentUser.getUser().getId()));
    }

    @PostMapping("/verify")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Verify Razorpay payment after checkout",
               description = "Call this after the Razorpay checkout widget returns successfully. The server validates the HMAC-SHA256 signature and marks the payment as PAID. Delivery agent is auto-assigned on success.")
    public ResponseEntity<PaymentStatusResponse> verifyPayment(
            @Valid @RequestBody PaymentVerificationRequest request,
            @AuthenticationPrincipal CustomUserDetails currentUser) {

        return ResponseEntity.ok(
                paymentService.verifyPayment(request, currentUser.getUser().getId()));
    }

    @PostMapping("/cod/{orderId}")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Choose Cash on Delivery",
               description = "Records the order as COD and auto-assigns a delivery agent.")
    public ResponseEntity<PaymentStatusResponse> codPayment(
            @PathVariable Long orderId,
            @AuthenticationPrincipal CustomUserDetails currentUser) {

        return ResponseEntity.ok(
                paymentService.recordCodPayment(orderId, currentUser.getUser().getId()));
    }

    @GetMapping("/{orderId}/status")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Get payment status for an order")
    public ResponseEntity<PaymentStatusResponse> getStatus(
            @PathVariable Long orderId,
            @AuthenticationPrincipal CustomUserDetails currentUser) {

        return ResponseEntity.ok(
                paymentService.getPaymentStatus(orderId, currentUser.getUser().getId()));
    }

    /**
     * Razorpay webhook endpoint — no authentication required (Razorpay calls this).
     * Configure this URL in your Razorpay Dashboard → Webhooks → Add New Webhook.
     * Receives raw body as String so the HMAC-SHA256 signature can be verified correctly.
     */
    @PostMapping("/webhook")
    @Operation(summary = "Razorpay webhook (no auth — configure in Razorpay Dashboard)",
               description = "Razorpay calls this URL on payment.captured and payment.failed events.")
    public ResponseEntity<Void> webhook(
            @RequestBody String rawBody,
            @RequestHeader(value = "X-Razorpay-Signature", required = false) String signature) {

        try {
            Map<String, Object> payload = objectMapper.readValue(
                    rawBody, new TypeReference<>() {});
            paymentService.handleWebhook(rawBody, signature != null ? signature : "", payload);
        } catch (Exception ex) {
            log.error("Failed to parse Razorpay webhook payload: {}", ex.getMessage());
        }
        return ResponseEntity.ok().build();
    }
}
