package be.event.smartbooking.api.controller;

import be.event.smartbooking.model.AffiliateKey;
import be.event.smartbooking.model.enumeration.AffiliateTier;
import be.event.smartbooking.service.AffiliateService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Gestion administrative des clés API affiliées.
 * Admin uniquement : générer/révoquer/lister les clés.
 * (L'endpoint /me pour qu'un user voie sa propre clé est dans AffiliateMeController.)
 */
@RestController
@RequestMapping("/api/admin/affiliates")
public class AffiliateAdminController {

    private final AffiliateService affiliateService;

    public AffiliateAdminController(AffiliateService affiliateService) {
        this.affiliateService = affiliateService;
    }

    /**
     * GET /api/admin/affiliates — admin liste tous les affiliés et leurs clés.
     */
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<Map<String, Object>> listAll() {
        return affiliateService.findAll().stream()
            .map(this::serialize)
            .toList();
    }

    /**
     * POST /api/admin/affiliates/{userId}/generate?tier=STARTER
     * Admin génère (ou régénère) une clé pour un user.
     */
    @PostMapping("/{userId}/generate")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> generate(
        @PathVariable Long userId,
        @RequestParam(defaultValue = "FREE") AffiliateTier tier
    ) {
        try {
            AffiliateKey key = affiliateService.generateKey(userId, tier);
            return ResponseEntity.ok(serialize(key));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * DELETE /api/admin/affiliates/{userId} — admin révoque la clé d'un user.
     */
    @DeleteMapping("/{userId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> revoke(@PathVariable Long userId) {
        affiliateService.revokeKey(userId);
        return ResponseEntity.noContent().build();
    }

    private Map<String, Object> serialize(AffiliateKey k) {
        Map<String, Object> data = new HashMap<>();
        data.put("id", k.getId());
        data.put("userId", k.getUser().getId());
        data.put("userLogin", k.getUser().getLogin());
        data.put("userFirstName", k.getUser().getFirstName());
        data.put("userLastName", k.getUser().getLastName());
        data.put("apiKey", k.getApiKey());
        data.put("tier", k.getTier().name());
        data.put("dailyQuota", k.getTier().isUnlimited() ? "unlimited" : k.getTier().getDailyQuota());
        data.put("requestsToday", k.getRequestsToday());
        data.put("lastResetDate", k.getLastResetDate());
        data.put("createdAt", k.getCreatedAt());
        return data;
    }
}