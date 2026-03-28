package be.event.smartbooking.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "locations")
@Getter @Setter
public class Location {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    private String address;

    private int capacity;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "locality_id")
    private Locality locality;
}
