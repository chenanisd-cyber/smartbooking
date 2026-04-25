package be.event.smartbooking.repository;

import be.event.smartbooking.model.Reservation;
import be.event.smartbooking.model.enumeration.ReservationStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ReservationRepository extends JpaRepository<Reservation, Long> {
    // My bookings — sorted by date desc
    List<Reservation> findByUserIdOrderByCreatedAtDesc(Long userId);

    // All reservations with a given status (for producer stats)
    List<Reservation> findByStatus(ReservationStatus status);
}
