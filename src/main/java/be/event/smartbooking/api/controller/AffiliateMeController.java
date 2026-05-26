package be.event.smartbooking.api.controller;

import be.event.smartbooking.model.AffiliateKey;
import be.event.smartbooking.service.AffiliateService;
import be.event.smartbooking.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

/**
 * Endpoint pour qu'un utilisateur connecté récupère SA propre clé API.
 * Accessible à tout user authentifié (pas seulement admin).
 */
@RestController
@RequestMapping("/api/affiliates")
public class AffiliateMeController {

    private final AffiliateService affiliateService;
    private final UserService userService;

    public AffiliateMeController(AffiliateService affiliateService, UserService userService) {
        this.affiliateService = affiliateService;
        this.userService = userService;
    }

    /**
     * GET /api/affiliates/me — récupère la clé du user connecté.
     */
    @GetMapping("/me")
    public ResponseEntity<?> myKey(@AuthenticationPrincipal UserDetails userDetails) {
        var user = userService.findByLogin(userDetails.getUsername());
        var keyOpt = affiliateService.findByUserId(user.getId());

        if (keyOpt.isEmpty()) {
            return ResponseEntity.ok(Map.of("hasKey", false));
        }

        AffiliateKey k = keyOpt.get();
        Map<String, Object> data = new HashMap<>();
        data.put("hasKey", true);
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
        return ResponseEntity.ok(data);
    }
}