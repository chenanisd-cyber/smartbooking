package be.event.smartbooking.service;

import be.event.smartbooking.model.AffiliateKey;
import be.event.smartbooking.model.User;
import be.event.smartbooking.model.enumeration.AffiliateTier;
import be.event.smartbooking.repository.AffiliateKeyRepository;
import be.event.smartbooking.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.util.Base64;
import java.util.List;
import java.util.Optional;

@Service
public class AffiliateService {

    private final AffiliateKeyRepository affiliateKeyRepository;
    private final UserRepository userRepository;
    private final SecureRandom secureRandom = new SecureRandom();

    public AffiliateService(AffiliateKeyRepository affiliateKeyRepository,
                            UserRepository userRepository) {
        this.affiliateKeyRepository = affiliateKeyRepository;
        this.userRepository = userRepository;
    }

    /**
     * Génère ou régénère une clé API pour un utilisateur.
     * L'utilisateur doit avoir le rôle "affiliate".
     */
    @Transactional
    public AffiliateKey generateKey(Long userId, AffiliateTier tier) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found: " + userId));

        // Vérifier que l'utilisateur a le rôle "affiliate"
        boolean isAffiliate = user.getRoles().stream()
            .anyMatch(r -> r.getName().equals("affiliate"));
        if (!isAffiliate) {
            throw new IllegalArgumentException(
                "L'utilisateur doit avoir le rôle 'affiliate' avant de générer une clé API.");
        }

        // Si une clé existe déjà, on la régénère (nouveau token + nouveau tier)
        AffiliateKey key = affiliateKeyRepository.findByUserId(userId)
            .orElseGet(() -> {
                AffiliateKey k = new AffiliateKey();
                k.setUser(user);
                return k;
            });

        key.setApiKey(generateRandomKey());
        key.setTier(tier);
        key.setRequestsToday(0);

        return affiliateKeyRepository.save(key);
    }

    /**
     * Révoque (supprime) la clé API d'un utilisateur.
     */
    @Transactional
    public void revokeKey(Long userId) {
        affiliateKeyRepository.findByUserId(userId)
            .ifPresent(affiliateKeyRepository::delete);
    }

    /**
     * Recherche une clé API par sa valeur.
     * Utilisé par le filtre d'authentification API.
     */
    public Optional<AffiliateKey> findByApiKey(String apiKey) {
        return affiliateKeyRepository.findByApiKey(apiKey);
    }

    /**
     * Vérifie que la clé existe et a du quota disponible.
     * Si OK, incrémente le compteur de requêtes du jour.
     *
     * @return la clé validée, prête à être utilisée
     * @throws IllegalArgumentException si clé invalide ou quota dépassé
     */
    @Transactional
    public AffiliateKey validateAndConsume(String apiKey) {
        AffiliateKey key = affiliateKeyRepository.findByApiKey(apiKey)
            .orElseThrow(() -> new IllegalArgumentException("Clé API invalide."));

        if (!key.hasQuotaAvailable()) {
            throw new IllegalArgumentException(
                "Quota journalier dépassé (" + key.getTier() + " : " +
                key.getTier().getDailyQuota() + " requêtes/jour). " +
                "Réessayez demain ou passez à un tier supérieur.");
        }

        key.incrementRequests();
        return affiliateKeyRepository.save(key);
    }

    /**
     * Récupère la clé d'un utilisateur connecté (pour qu'il puisse la voir).
     */
    public Optional<AffiliateKey> findByUserId(Long userId) {
        return affiliateKeyRepository.findByUserId(userId);
    }

    /**
     * Liste toutes les clés API (admin uniquement).
     */
    public List<AffiliateKey> findAll() {
        return affiliateKeyRepository.findAll();
    }

    /**
     * Génère une chaîne aléatoire sécurisée de 48 caractères (URL-safe base64).
     * Préfixée par "sk_" pour ressembler aux clés Stripe/OpenAI.
     */
    private String generateRandomKey() {
        byte[] bytes = new byte[36];
        secureRandom.nextBytes(bytes);
        String token = Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
        return "sk_" + token;
    }
}