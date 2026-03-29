package be.event.smartbooking.service;

import be.event.smartbooking.dto.ReviewRequest;
import be.event.smartbooking.model.Review;
import be.event.smartbooking.model.Show;
import be.event.smartbooking.model.User;
import be.event.smartbooking.repository.ReservationRepository;
import be.event.smartbooking.repository.ReviewRepository;
import be.event.smartbooking.repository.ShowRepository;
import be.event.smartbooking.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final UserRepository userRepository;
    private final ShowRepository showRepository;
    private final ReservationRepository reservationRepository;

    public ReviewService(ReviewRepository reviewRepository, UserRepository userRepository,
                         ShowRepository showRepository, ReservationRepository reservationRepository) {
        this.reviewRepository = reviewRepository;
        this.userRepository = userRepository;
        this.showRepository = showRepository;
        this.reservationRepository = reservationRepository;
    }

    public Review create(ReviewRequest req, String login) {
        User user = userRepository.findByLogin(login)
            .orElseThrow(() -> new RuntimeException("User not found"));

        Show show = showRepository.findById(req.showId())
            .orElseThrow(() -> new RuntimeException("Show not found: " + req.showId()));

        // Only users who have a reservation for this show can review it
        boolean hasReservation = reservationRepository
            .findByUserIdOrderByCreatedAtDesc(user.getId())
            .stream()
            .anyMatch(r -> r.getRepresentation().getShow().getId().equals(req.showId()));

        if (!hasReservation) {
            throw new IllegalArgumentException("You can only review shows you have booked");
        }

        // One review per user per show
        if (reviewRepository.existsByUserIdAndShowId(user.getId(), req.showId())) {
            throw new IllegalArgumentException("You have already reviewed this show");
        }

        Review review = new Review();
        review.setUser(user);
        review.setShow(show);
        review.setComment(req.comment());
        review.setStars(req.stars());

        return reviewRepository.save(review);
    }

    // Public — validated reviews for a show
    public List<Review> findValidatedByShow(Long showId) {
        return reviewRepository.findByShowIdAndValidatedTrue(showId);
    }

    // Admin — pending reviews waiting for validation
    public List<Review> findPending() {
        return reviewRepository.findByValidatedFalse();
    }

    public Review validate(Long id) {
        Review review = reviewRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Review not found: " + id));
        review.setValidated(true);
        return reviewRepository.save(review);
    }

    public void delete(Long id) {
        if (!reviewRepository.existsById(id)) {
            throw new RuntimeException("Review not found: " + id);
        }
        reviewRepository.deleteById(id);
    }
}
