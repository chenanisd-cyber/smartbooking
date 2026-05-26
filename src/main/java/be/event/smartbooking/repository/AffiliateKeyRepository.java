package be.event.smartbooking.repository;

import be.event.smartbooking.model.AffiliateKey;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface AffiliateKeyRepository extends JpaRepository<AffiliateKey, Long> {
    Optional<AffiliateKey> findByApiKey(String apiKey);
    Optional<AffiliateKey> findByUserId(Long userId);
    boolean existsByUserId(Long userId);
}