package be.event.smartbooking.repository;

import be.event.smartbooking.model.Show;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ShowRepository extends JpaRepository<Show, Long> {
    Optional<Show> findBySlug(String slug);
    // Public catalog: only confirmed shows
    List<Show> findByIsConfirmedTrue();
}
