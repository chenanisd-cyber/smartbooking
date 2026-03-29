package be.event.smartbooking.repository;

import be.event.smartbooking.model.Reservation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ReservationRepository extends JpaRepository<Reservation, Long> {
    // My bookings — sorted by date desc
    List<Reservation> findByUserIdOrderByCreatedAtDesc(Long userId);
}
