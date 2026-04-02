package com.example.doordrop.ServiceImpl.Payment;

import com.example.doordrop.Entity.Order;
import com.example.doordrop.Entity.Payment;
import com.example.doordrop.Model.DTO.PaymentOrderResponse;
import com.example.doordrop.Model.DTO.PaymentStatusResponse;
import com.example.doordrop.Model.DTO.PaymentVerificationRequest;
import com.example.doordrop.Model.Enums.OrderStatus;
import com.example.doordrop.Model.Enums.PaymentStatus;
import com.example.doordrop.Repository.OrderRepository;
import com.example.doordrop.Repository.PaymentRepository;
import com.example.doordrop.Service.Delivery.DeliveryAssignmentService;
import com.example.doordrop.Service.Payment.PaymentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.HexFormat;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService {

    private static final String RAZORPAY_ORDERS_URL = "https://api.razorpay.com/v1/orders";

    private final PaymentRepository paymentRepository;
    private final OrderRepository orderRepository;
    private final DeliveryAssignmentService assignmentService;
    private final RestTemplate restTemplate;

    @Value("${razorpay.key.id}")
    private String razorpayKeyId;

    @Value("${razorpay.key.secret}")
    private String razorpayKeySecret;

    @Value("${razorpay.webhook.secret}")
    private String webhookSecret;

    @Override
    @Transactional
    public PaymentOrderResponse initiateOnlinePayment(Long orderId, Long userId) {
        Order order = getOwnedOrder(orderId, userId);
        Payment payment = getOrCreatePayment(order);

        if (payment.getStatus() == PaymentStatus.PAID) {
            throw new RuntimeException("This order is already paid.");
        }

        // Amount in paise (₹1 = 100 paise)
        long amountPaise = order.getTotalAmount()
                .multiply(BigDecimal.valueOf(100)).longValue();

        HttpHeaders headers = new HttpHeaders();
        headers.setBasicAuth(razorpayKeyId, razorpayKeySecret);
        headers.setContentType(MediaType.APPLICATION_JSON);

        Map<String, Object> body = new HashMap<>();
        body.put("amount", amountPaise);
        body.put("currency", "INR");
        body.put("receipt", order.getOrderNumber());
        body.put("payment_capture", 1);

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);

        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> response = restTemplate.postForObject(
                    RAZORPAY_ORDERS_URL, request, Map.class);

            if (response == null || !response.containsKey("id")) {
                throw new RuntimeException("Invalid response from Razorpay — no order id returned.");
            }

            String razorpayOrderId = (String) response.get("id");

            payment.setPaymentMethod("ONLINE");
            payment.setRazorpayOrderId(razorpayOrderId);
            paymentRepository.save(payment);

            return PaymentOrderResponse.builder()
                    .orderId(orderId)
                    .orderNumber(order.getOrderNumber())
                    .razorpayOrderId(razorpayOrderId)
                    .amount(order.getTotalAmount())
                    .currency("INR")
                    .razorpayKeyId(razorpayKeyId)
                    .description("DoorDrop order " + order.getOrderNumber())
                    .build();

        } catch (RuntimeException ex) {
            throw ex;
        } catch (Exception ex) {
            throw new RuntimeException("Failed to create Razorpay order: " + ex.getMessage(), ex);
        }
    }

    @Override
    @Transactional
    public PaymentStatusResponse verifyPayment(PaymentVerificationRequest request, Long userId) {
        Order order = getOwnedOrder(request.getOrderId(), userId);

        Payment payment = paymentRepository.findByOrderId(order.getId())
                .orElseThrow(() -> new RuntimeException("Payment record not found for this order."));

        // Verify HMAC-SHA256 signature: razorpay_order_id|razorpay_payment_id
        String payload = request.getRazorpayOrderId() + "|" + request.getRazorpayPaymentId();
        if (!verifyHmac(payload, razorpayKeySecret, request.getRazorpaySignature())) {
            throw new RuntimeException("Payment verification failed: invalid signature.");
        }

        payment.setStatus(PaymentStatus.PAID);
        payment.setRazorpayPaymentId(request.getRazorpayPaymentId());
        payment.setRazorpaySignature(request.getRazorpaySignature());
        payment.setTransactionId(request.getRazorpayPaymentId());
        payment.setPaidAt(LocalDateTime.now());
        paymentRepository.save(payment);

        order.setStatus(OrderStatus.CONFIRMED);
        orderRepository.save(order);

        // Auto-assign delivery agent (no-op for Marketplace orders)
        assignmentService.assignAgentToOrder(order.getId());

        return PaymentStatusResponse.from(payment);
    }

    @Override
    @Transactional
    public PaymentStatusResponse recordCodPayment(Long orderId, Long userId) {
        Order order = getOwnedOrder(orderId, userId);
        Payment payment = getOrCreatePayment(order);

        if (payment.getStatus() == PaymentStatus.PAID) {
            throw new RuntimeException("This order is already paid.");
        }

        payment.setPaymentMethod("COD");
        payment.setStatus(PaymentStatus.PENDING); // COD is collected on delivery
        paymentRepository.save(payment);

        order.setStatus(OrderStatus.CONFIRMED);
        orderRepository.save(order);

        assignmentService.assignAgentToOrder(order.getId());

        return PaymentStatusResponse.from(payment);
    }

    @Override
    public PaymentStatusResponse getPaymentStatus(Long orderId, Long userId) {
        getOwnedOrder(orderId, userId);
        Payment payment = paymentRepository.findByOrderId(orderId)
                .orElseThrow(() -> new RuntimeException("No payment found for order: " + orderId));
        return PaymentStatusResponse.from(payment);
    }

    @Override
    public void handleWebhook(String rawBody, String signature, Map<String, Object> payload) {
        if (!verifyHmac(rawBody, webhookSecret, signature)) {
            log.warn("Razorpay webhook: invalid signature — ignoring.");
            return;
        }

        String event = (String) payload.get("event");
        log.info("Razorpay webhook received: {}", event);

        if ("payment.captured".equals(event)) {
            handlePaymentCaptured(payload);
        } else if ("payment.failed".equals(event)) {
            handlePaymentFailed(payload);
        }
    }

    // ── Private helpers ───────────────────────────────────────────────────────

    @SuppressWarnings("unchecked")
    private void handlePaymentCaptured(Map<String, Object> payload) {
        try {
            Map<String, Object> paymentData = (Map<String, Object>)
                    ((Map<String, Object>) payload.get("payload")).get("payment");
            Map<String, Object> entity = (Map<String, Object>) paymentData.get("entity");

            String razorpayOrderId   = (String) entity.get("order_id");
            String razorpayPaymentId = (String) entity.get("id");

            paymentRepository.findByRazorpayOrderId(razorpayOrderId).ifPresent(payment -> {
                if (payment.getStatus() != PaymentStatus.PAID) {
                    payment.setStatus(PaymentStatus.PAID);
                    payment.setRazorpayPaymentId(razorpayPaymentId);
                    payment.setTransactionId(razorpayPaymentId);
                    payment.setPaidAt(LocalDateTime.now());
                    paymentRepository.save(payment);
                    log.info("Payment captured via webhook for order {}", payment.getOrder().getId());
                }
            });
        } catch (Exception ex) {
            log.error("Error processing payment.captured webhook: {}", ex.getMessage());
        }
    }

    @SuppressWarnings("unchecked")
    private void handlePaymentFailed(Map<String, Object> payload) {
        try {
            Map<String, Object> paymentData = (Map<String, Object>)
                    ((Map<String, Object>) payload.get("payload")).get("payment");
            Map<String, Object> entity = (Map<String, Object>) paymentData.get("entity");

            String razorpayOrderId = (String) entity.get("order_id");

            paymentRepository.findByRazorpayOrderId(razorpayOrderId).ifPresent(payment -> {
                payment.setStatus(PaymentStatus.FAILED);
                paymentRepository.save(payment);
                log.info("Payment failed via webhook for order {}", payment.getOrder().getId());
            });
        } catch (Exception ex) {
            log.error("Error processing payment.failed webhook: {}", ex.getMessage());
        }
    }

    private boolean verifyHmac(String data, String secret, String expectedSignature) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            byte[] hash = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            String computed = HexFormat.of().formatHex(hash);
            return computed.equals(expectedSignature);
        } catch (Exception ex) {
            log.error("HMAC verification error: {}", ex.getMessage());
            return false;
        }
    }

    private Order getOwnedOrder(Long orderId, Long userId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found: " + orderId));
        if (!order.getUser().getId().equals(userId)) {
            throw new RuntimeException("Access denied: this order does not belong to you.");
        }
        return order;
    }

    private Payment getOrCreatePayment(Order order) {
        return paymentRepository.findByOrderId(order.getId()).orElseGet(() ->
                paymentRepository.save(Payment.builder()
                        .order(order)
                        .amount(order.getTotalAmount())
                        .paymentMethod("PENDING")
                        .status(PaymentStatus.PENDING)
                        .build()));
    }
}
