package be.event.smartbooking.model;

import be.event.smartbooking.model.enumeration.AffiliateTier;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "affiliate_keys")
@Getter @Setter
public class AffiliateKey {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(name = "api_key", nullable = false, unique = true, length = 64)
    private String apiKey;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private AffiliateTier tier = AffiliateTier.FREE;

    @Column(name = "requests_today", nullable = false)
    private int requestsToday = 0;

    @Column(name = "last_reset_date", nullable = false)
    private LocalDate lastResetDate = LocalDate.now();

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    // Méthode utilitaire : reset quotidien automatique du compteur
    public void resetIfNewDay() {
        LocalDate today = LocalDate.now();
        if (!today.equals(lastResetDate)) {
            requestsToday = 0;
            lastResetDate = today;
        }
    }

    // Vérifie si la clé a encore du quota
    public boolean hasQuotaAvailable() {
        resetIfNewDay();
        return tier.isUnlimited() || requestsToday < tier.getDailyQuota();
    }

    // Incrémente le compteur (à appeler après chaque requête réussie)
    public void incrementRequests() {
        resetIfNewDay();
        requestsToday++;
    }
}