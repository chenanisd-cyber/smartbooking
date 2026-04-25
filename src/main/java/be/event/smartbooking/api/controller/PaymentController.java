package be.event.smartbooking.api.controller;

import be.event.smartbooking.dto.ReservationDto;
import be.event.smartbooking.dto.ReservationRequest;
import be.event.smartbooking.model.Reservation;
import be.event.smartbooking.service.ReservationService;
import be.event.smartbooking.service.StripeService;
import com.stripe.model.PaymentIntent;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.Map;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    @Value("${stripe.publishable.key}")
    private String publishableKey;

    private final ReservationService reservationService;
    private final StripeService      stripeService;

    public PaymentController(ReservationService reservationService, StripeService stripeService) {
        this.reservationService = reservationService;
        this.stripeService      = stripeService;
    }

    // Public — returns Stripe publishable key to the frontend
    @GetMapping("/config")
    public Map<String, String> getConfig() {
        return Map.of("publishableKey", publishableKey);
    }

    // Authenticated — create a pending reservation + Stripe PaymentIntent
    @PostMapping("/create-intent")
    public ResponseEntity<?> createIntent(
        @Valid @RequestBody ReservationRequest req,
        @AuthenticationPrincipal UserDetails userDetails
    ) {
        try {
            // 1. Create pending reservation (seats reserved)
            Reservation reservation = reservationService.createPending(req, userDetails.getUsername());

            // 2. Create Stripe PaymentIntent (amount in cents)
            long amountCents = reservation.getTotalAmount()
                .multiply(BigDecimal.valueOf(100)).longValue();
            PaymentIntent intent = stripeService.createPaymentIntent(amountCents, reservation.getId());

            // 3. Store intent ID on reservation
            reservationService.attachPaymentIntent(reservation.getId(), intent.getId());

            return ResponseEntity.ok(Map.of(
                "clientSecret",  intent.getClientSecret(),
                "reservationId", reservation.getId()
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", "Erreur lors de la création du paiement"));
        }
    }

    // Authenticated — confirm reservation after frontend payment success
    @PostMapping("/confirm/{reservationId}")
    public ResponseEntity<?> confirm(
        @PathVariable Long reservationId,
        @AuthenticationPrincipal UserDetails userDetails
    ) {
        try {
            Reservation reservation = reservationService.findById(reservationId);

            // Verify payment status directly with Stripe
            PaymentIntent intent = stripeService.retrieve(reservation.getStripePaymentIntentId());
            if (!"succeeded".equals(intent.getStatus())) {
                return ResponseEntity.badRequest().body(Map.of("error", "Paiement non confirmé par Stripe"));
            }

            ReservationDto dto = ReservationDto.from(
                reservationService.confirmPayment(reservationId, userDetails.getUsername()));
            return ResponseEntity.ok(dto);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", "Erreur lors de la confirmation"));
        }
    }
}
