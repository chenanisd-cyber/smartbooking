package be.event.smartbooking.service;

import be.event.smartbooking.dto.ReservationRequest;
import be.event.smartbooking.model.Price;
import be.event.smartbooking.model.Representation;
import be.event.smartbooking.model.Reservation;
import be.event.smartbooking.model.User;
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
