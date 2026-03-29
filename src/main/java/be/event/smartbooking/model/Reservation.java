package be.event.smartbooking.model;

import be.event.smartbooking.model.enumeration.ReservationStatus;
import be.event.smartbooking.model.enumeration.TypePrice;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

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

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "representation_id", nullable = false)
    private Representation representation;

    @Enumerated(EnumType.STRING)
    @Column(name = "price_type", nullable = false)
    private TypePrice priceType;

    @Column(nullable = false)
    private int quantity = 1;

    @Column(name = "total_amount", nullable = false)
    private BigDecimal totalAmount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ReservationStatus status = ReservationStatus.CONFIRMED;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();
}
