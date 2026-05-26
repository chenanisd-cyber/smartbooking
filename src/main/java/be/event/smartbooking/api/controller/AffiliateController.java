package be.event.smartbooking.api.controller;

import be.event.smartbooking.config.AffiliateApiKeyFilter;
import be.event.smartbooking.model.AffiliateKey;
import be.event.smartbooking.model.Representation;
import be.event.smartbooking.model.Show;
import be.event.smartbooking.model.enumeration.AffiliateTier;
import be.event.smartbooking.service.ShowService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * API publique affiliée — accessible uniquement avec un header X-API-Key valide.
 * Les champs retournés varient selon le tier de l'affilié :
 *   FREE    : id, title, nextDate (3 champs)
 *   STARTER : + description, locationName (5 champs)
 *   PREMIUM : + availableSeats, prices (champs enrichis, données fraîches)
 */
@RestController
@RequestMapping("/api/affiliate")
public class AffiliateController {

    private final ShowService showService;

    public AffiliateController(ShowService showService) {
        this.showService = showService;
    }

    /**
     * GET /api/affiliate/shows
     * Retourne le catalogue des spectacles confirmés, filtré selon le tier.
     */
    @GetMapping("/shows")
    public Map<String, Object> getShows(
        HttpServletRequest request,
        @RequestParam(required = false, defaultValue = "50") int limit
    ) {
        AffiliateKey key = (AffiliateKey) request.getAttribute(AffiliateApiKeyFilter.REQUEST_ATTR);
        AffiliateTier tier = key.getTier();

        // Limite max selon le tier (en plus de la limite quotidienne)
        int maxLimit = switch (tier) {
            case FREE    -> 10;
            case STARTER -> 50;
            case PREMIUM -> 200;
        };
        int effectiveLimit = Math.min(limit, maxLimit);

        List<Show> shows = showService.findConfirmed().stream()
            .limit(effectiveLimit)
            .toList();

        // Construire la réponse selon le tier
        List<Map<String, Object>> showsData = shows.stream()
            .map(s -> serializeShow(s, tier))
            .toList();

        Map<String, Object> response = new HashMap<>();
        response.put("tier", tier.name());
        response.put("quotaDailyLimit", tier.isUnlimited() ? "unlimited" : tier.getDailyQuota());
        response.put("quotaUsedToday", key.getRequestsToday());
        response.put("count", showsData.size());
        response.put("shows", showsData);
        return response;
    }

    /**
     * Sérialise un Show selon le niveau d'accès du tier.
     */
    private Map<String, Object> serializeShow(Show show, AffiliateTier tier) {
        Map<String, Object> data = new HashMap<>();

        // FREE et au-dessus : champs de base
        data.put("id", show.getId());
        data.put("title", show.getTitle());
        data.put("nextDate", findNextDate(show));

        // STARTER et au-dessus : description + lieu
        if (tier == AffiliateTier.STARTER || tier == AffiliateTier.PREMIUM) {
            data.put("description", show.getDescription());
            data.put("slug", show.getSlug());

            // Lieu de la prochaine représentation
            Representation nextRep = findNextRepresentation(show);
            if (nextRep != null && nextRep.getLocation() != null) {
                data.put("locationName", nextRep.getLocation().getName());
            } else {
                data.put("locationName", null);
            }
        }

        // PREMIUM uniquement : données enrichies en temps réel
        if (tier == AffiliateTier.PREMIUM) {
            Representation nextRep = findNextRepresentation(show);
            if (nextRep != null) {
                data.put("availableSeats", nextRep.getAvailableSeats());

                // Prix de la prochaine représentation
                List<Map<String, Object>> prices = nextRep.getPrices().stream()
                    .map(p -> {
                        Map<String, Object> pricing = new HashMap<>();
                        pricing.put("type", p.getType().name());
                        pricing.put("amount", p.getAmount());
                        return pricing;
                    })
                    .toList();
                data.put("prices", prices);
            }
            data.put("imagePath", show.getImagePath());
            data.put("artist", show.getArtist() != null ? show.getArtist().getName() : null);
        }

        return data;
    }

    private LocalDateTime findNextDate(Show show) {
        return show.getRepresentations().stream()
            .map(Representation::getDateTime)
            .filter(d -> d.isAfter(LocalDateTime.now()))
            .min(Comparator.naturalOrder())
            .orElse(null);
    }

    private Representation findNextRepresentation(Show show) {
        return show.getRepresentations().stream()
            .filter(r -> r.getDateTime().isAfter(LocalDateTime.now()))
            .min(Comparator.comparing(Representation::getDateTime))
            .orElse(null);
    }
}