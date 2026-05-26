package be.event.smartbooking.model;

import be.event.smartbooking.model.enumeration.ReservationStatus;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "reservations")
@Getter @Setter
public class Reservation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @OneToMany(mappedBy = "reservation", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<ReservationLine> lines = new ArrayList<>();

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ReservationStatus status = ReservationStatus.CONFIRMED;

    @Column(name = "stripe_payment_intent_id")
    private String stripePaymentIntentId;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    // Méthode helper pour calculer le total du panier
    public BigDecimal getTotalAmount() {
        return lines.stream()
            .map(ReservationLine::getLineTotal)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    // Méthode helper pour ajouter une ligne en maintenant la relation bidirectionnelle
    public void addLine(ReservationLine line) {
        lines.add(line);
        line.setReservation(this);
    }
}