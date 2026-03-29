package be.event.smartbooking.dto;

import be.event.smartbooking.model.Review;

import java.time.LocalDateTime;

public record ReviewDto(
    Long id,
    String userLogin,
    Long showId,
    String showTitle,
    String comment,
    int stars,
    boolean validated,
    LocalDateTime createdAt
) {
    public static ReviewDto from(Review r) {
        return new ReviewDto(
            r.getId(),
            r.getUser().getLogin(),
            r.getShow().getId(),
            r.getShow().getTitle(),
            r.getComment(),
            r.getStars(),
            r.isValidated(),
            r.getCreatedAt()
        );
    }
}
