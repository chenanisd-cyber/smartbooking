package be.event.smartbooking.service;

import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;
import com.stripe.param.PaymentIntentCreateParams;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class StripeService {

    @Value("${stripe.secret.key}")
    private String secretKey;

    @PostConstruct
    public void init() {
        Stripe.apiKey = secretKey;
    }

    // Create a PaymentIntent and return it (clientSecret + id accessible on the object)
    public PaymentIntent createPaymentIntent(long amountCents, Long reservationId) throws StripeException {
        PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
            .setAmount(amountCents)
            .setCurrency("eur")
            .putMetadata("reservationId", String.valueOf(reservationId))
            .build();
        return PaymentIntent.create(params);
    }

    // Retrieve a PaymentIntent by ID to check its status
    public PaymentIntent retrieve(String paymentIntentId) throws StripeException {
        return PaymentIntent.retrieve(paymentIntentId);
    }
}
