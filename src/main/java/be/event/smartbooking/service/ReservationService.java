package be.event.smartbooking.service;

import be.event.smartbooking.dto.ReservationRequest;
import be.event.smartbooking.model.Price;
import be.event.smartbooking.model.Representation;
import be.event.smartbooking.model.Reservation;
import be.event.smartbooking.model.User;
import be.event.smartbooking.model.enumeration.ReservationStatus;
import be.event.smartbooking.repository.RepresentationRepository;
import be.event.smartbooking.repository.ReservationRepository;
import be.event.smartbooking.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
public class ReservationService {

    private final ReservationRepository reservationRepository;
    private final RepresentationRepository representationRepository;
    private final UserRepository userRepository;

    public ReservationService(ReservationRepository reservationRepository,
                               RepresentationRepository representationRepository,
                               UserRepository userRepository) {
        this.reservationRepository = reservationRepository;
        this.representationRepository = representationRepository;
        this.userRepository = userRepository;
    }

    public Reservation findById(Long id) {
        return reservationRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Reservation not found: " + id));
    }

    // Step 1 — create a PENDING reservation and decrement seats (holds the seats)
    @Transactional
    public Reservation createPending(ReservationRequest req, String login) {
        Representation rep = representationRepository.findById(req.representationId())
            .orElseThrow(() -> new RuntimeException("Representation not found: " + req.representationId()));

        if (rep.getAvailableSeats() < req.quantity()) {
            throw new IllegalArgumentException("Not enough seats. Available: " + rep.getAvailableSeats());
        }

        Price price = rep.getPrices().stream()
            .filter(p -> p.getType() == req.priceType())
            .findFirst()
            .orElseThrow(() -> new RuntimeException("Price type " + req.priceType() + " not available"));

        User user = userRepository.findByLogin(login)
            .orElseThrow(() -> new RuntimeException("User not found"));

        // Reserve seats immediately to prevent over-booking
        rep.setAvailableSeats(rep.getAvailableSeats() - req.quantity());
        representationRepository.save(rep);

        Reservation reservation = new Reservation();
        reservation.setUser(user);
        reservation.setRepresentation(rep);
        reservation.setPriceType(req.priceType());
        reservation.setQuantity(req.quantity());
        reservation.setTotalAmount(price.getAmount().multiply(BigDecimal.valueOf(req.quantity())));
        reservation.setStatus(ReservationStatus.PENDING);

        return reservationRepository.save(reservation);
    }

    // Attach Stripe PaymentIntent ID to the reservation
    @Transactional
    public void attachPaymentIntent(Long reservationId, String paymentIntentId) {
        Reservation reservation = findById(reservationId);
        reservation.setStripePaymentIntentId(paymentIntentId);
        reservationRepository.save(reservation);
    }

    // Step 2 — confirm reservation after successful payment
    @Transactional
    public Reservation confirmPayment(Long reservationId, String login) {
        Reservation reservation = findById(reservationId);
        if (!reservation.getUser().getLogin().equals(login)) {
            throw new IllegalArgumentException("Forbidden");
        }
        reservation.setStatus(ReservationStatus.CONFIRMED);
        return reservationRepository.save(reservation);
    }

    @Transactional
    public Reservation create(ReservationRequest req, String login) {
        Representation rep = representationRepository.findById(req.representationId())
            .orElseThrow(() -> new RuntimeException("Representation not found: " + req.representationId()));

        // Check enough seats available
        if (rep.getAvailableSeats() < req.quantity()) {
            throw new IllegalArgumentException(
                "Not enough seats. Available: " + rep.getAvailableSeats());
        }

        // Find price for the requested type
        Price price = rep.getPrices().stream()
            .filter(p -> p.getType() == req.priceType())
            .findFirst()
            .orElseThrow(() -> new RuntimeException(
                "Price type " + req.priceType() + " not available for this representation"));

        User user = userRepository.findByLogin(login)
            .orElseThrow(() -> new RuntimeException("User not found"));

        // Decrement available seats
        rep.setAvailableSeats(rep.getAvailableSeats() - req.quantity());
        representationRepository.save(rep);

        // Create reservation
        Reservation reservation = new Reservation();
        reservation.setUser(user);
        reservation.setRepresentation(rep);
        reservation.setPriceType(req.priceType());
        reservation.setQuantity(req.quantity());
        reservation.setTotalAmount(price.getAmount().multiply(BigDecimal.valueOf(req.quantity())));

        return reservationRepository.save(reservation);
    }

    // My bookings
    public List<Reservation> findByUser(String login) {
        User user = userRepository.findByLogin(login)
            .orElseThrow(() -> new RuntimeException("User not found"));
        return reservationRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
    }

    // Admin — all reservations
    public List<Reservation> findAll() {
        return reservationRepository.findAll();
    }
}
