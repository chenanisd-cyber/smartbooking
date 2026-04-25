package be.event.smartbooking.model;

import be.event.smartbooking.model.enumeration.ReviewType;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "reviews")
@Getter @Setter
public class Review {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "show_id", nullable = false)
    private Show show;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String comment;

    @Column(nullable = false)
    private int stars; // 1 to 5

    @Enumerated(EnumType.STRING)
    @Column(name = "review_type", nullable = false)
    private ReviewType reviewType = ReviewType.MEMBER_REVIEW;

    @Column(name = "article_url", length = 500)
    private String articleUrl;

    // Admin must validate before it appears publicly
    @Column(nullable = false)
    private boolean validated = false;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();
}
