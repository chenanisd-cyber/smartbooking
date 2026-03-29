package be.event.smartbooking.api.controller;

import be.event.smartbooking.dto.ReviewDto;
import be.event.smartbooking.dto.ReviewRequest;
import be.event.smartbooking.service.ReviewService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reviews")
public class ReviewController {

    private final ReviewService reviewService;

    public ReviewController(ReviewService reviewService) {
        this.reviewService = reviewService;
    }

    // Public — validated reviews for a show
    @GetMapping("/show/{showId}")
    public List<ReviewDto> getByShow(@PathVariable Long showId) {
        return reviewService.findValidatedByShow(showId)
            .stream().map(ReviewDto::from).toList();
    }

    // Admin — reviews waiting for validation
    @GetMapping("/pending")
    @PreAuthorize("hasRole('ADMIN')")
    public List<ReviewDto> getPending() {
        return reviewService.findPending()
            .stream().map(ReviewDto::from).toList();
    }

    // Member — post a review (must have a reservation for the show)
    @PostMapping
    public ResponseEntity<?> create(
        @Valid @RequestBody ReviewRequest req,
        @AuthenticationPrincipal UserDetails userDetails
    ) {
        try {
            ReviewDto dto = ReviewDto.from(reviewService.create(req, userDetails.getUsername()));
            return ResponseEntity.status(HttpStatus.CREATED).body(dto);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Admin — validate a review (makes it visible publicly)
    @PutMapping("/{id}/validate")
    @PreAuthorize("hasRole('ADMIN')")
    public ReviewDto validate(@PathVariable Long id) {
        return ReviewDto.from(reviewService.validate(id));
    }

    // Admin — delete a review
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        reviewService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
