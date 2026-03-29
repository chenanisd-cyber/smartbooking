package be.event.smartbooking.repository;

import be.event.smartbooking.model.Review;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ReviewRepository extends JpaRepository<Review, Long> {
    // Public — only validated reviews for a show
    List<Review> findByShowIdAndValidatedTrue(Long showId);
    // Admin — pending reviews
    List<Review> findByValidatedFalse();
    // Check if user already reviewed this show
    boolean existsByUserIdAndShowId(Long userId, Long showId);
}
