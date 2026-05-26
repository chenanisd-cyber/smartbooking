package be.event.smartbooking.service;

import be.event.smartbooking.dto.ReservationRequest;
import be.event.smartbooking.model.Price;
import be.event.smartbooking.model.Representation;
import be.event.smartbooking.model.Reservation;
import be.event.smartbooking.model.ReservationLine;
import be.event.smartbooking.model.User;
import be.event.smartbooking.model.enumeration.ReservationStatus;
import be.event.smartbooking.repository.RepresentationRepository;
import be.event.smartbooking.repository.ReservationRepository;
import be.event.smartbooking.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

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

    // Step 1 — create a PENDING reservation (panier) and decrement seats on all lines
    @Transactional
    public Reservation createPending(ReservationRequest req, String login) {
        User user = userRepository.findByLogin(login)
            .orElseThrow(() -> new RuntimeException("User not found"));

        // Validation : on agrège d'abord les quantités par représentation pour vérifier
        // qu'on ne tente pas de réserver plus de places que disponibles cumulées.
        // Exemple : si même rep apparaît 2 fois (rare mais possible si l'utilisateur ajoute
        // 2 lignes pour la même rep avec 2 tarifs différents).
        Map<Long, Integer> totalQtyByRep = new HashMap<>();
        for (var line : req.lines()) {
            totalQtyByRep.merge(line.representationId(), line.quantity(), Integer::sum);
        }

        // Vérifier les places disponibles sur chaque représentation
        Map<Long, Representation> repsCache = new HashMap<>();
        for (var entry : totalQtyByRep.entrySet()) {
            Long repId = entry.getKey();
            int totalQty = entry.getValue();

            Representation rep = representationRepository.findById(repId)
                .orElseThrow(() -> new RuntimeException("Representation not found: " + repId));

            if (rep.getAvailableSeats() < totalQty) {
                throw new IllegalArgumentException(
                    "Pas assez de places pour la représentation du " +
                    rep.getDateTime() + ". Disponibles : " + rep.getAvailableSeats() +
                    ", demandées : " + totalQty);
            }
            repsCache.put(repId, rep);
        }

        // Créer la réservation (panier)
        Reservation reservation = new Reservation();
        reservation.setUser(user);
        reservation.setStatus(ReservationStatus.PENDING);

        // Créer les lignes, décrémenter les places
        for (var lineReq : req.lines()) {
            Representation rep = repsCache.get(lineReq.representationId());

            // Récupérer le prix correspondant au type demandé
            Price price = rep.getPrices().stream()
                .filter(p -> p.getType() == lineReq.priceType())
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException(
                    "Tarif " + lineReq.priceType() + " non disponible pour la représentation " + rep.getId()));

            // Décrémenter les places (pré-réservation pendant le paiement)
            rep.setAvailableSeats(rep.getAvailableSeats() - lineReq.quantity());

            // Créer la ligne
            ReservationLine line = new ReservationLine();
            line.setRepresentation(rep);
            line.setPriceType(lineReq.priceType());
            line.setQuantity(lineReq.quantity());
            line.setUnitPrice(price.getAmount());
            line.setLineTotal(price.getAmount().multiply(BigDecimal.valueOf(lineReq.quantity())));

            reservation.addLine(line);
        }

        // Sauvegarder les représentations modifiées
        for (Representation rep : repsCache.values()) {
            representationRepository.save(rep);
        }

        // Sauvegarder le panier + les lignes en cascade
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

    // Member — cancel own reservation (panier entier, remet toutes les places dans le pool)
    @Transactional
    public Reservation cancel(Long reservationId, String login) {
        Reservation reservation = findById(reservationId);

        // Vérifier ownership
        if (!reservation.getUser().getLogin().equals(login)) {
            throw new IllegalArgumentException("Vous ne pouvez annuler que vos propres réservations.");
        }

        // Pas annulable si déjà annulée
        if (reservation.getStatus() == ReservationStatus.CANCELLED) {
            throw new IllegalArgumentException("Cette réservation est déjà annulée.");
        }

        // Vérifier qu'aucune ligne ne concerne une représentation passée
        boolean anyPast = reservation.getLines().stream()
            .anyMatch(l -> l.getRepresentation().getDateTime().isBefore(LocalDateTime.now()));
        if (anyPast) {
            throw new IllegalArgumentException("Impossible d'annuler : au moins une représentation est déjà passée.");
        }

        // Remettre les places dans le pool pour chaque ligne
        for (ReservationLine line : reservation.getLines()) {
            Representation rep = line.getRepresentation();
            rep.setAvailableSeats(rep.getAvailableSeats() + line.getQuantity());
            representationRepository.save(rep);
        }

        // Marquer la réservation comme annulée
        reservation.setStatus(ReservationStatus.CANCELLED);
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