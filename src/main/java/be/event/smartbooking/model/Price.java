package be.event.smartbooking.model;

import be.event.smartbooking.model.enumeration.TypePrice;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Entity
@Table(name = "prices")
@Getter @Setter
public class Price {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "representation_id", nullable = false)
    private Representation representation;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TypePrice type;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal amount;
}
