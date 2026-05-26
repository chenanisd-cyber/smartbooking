package be.event.smartbooking.config;

import be.event.smartbooking.model.AffiliateKey;
import be.event.smartbooking.service.AffiliateService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * Filtre d'authentification pour les endpoints /api/affiliate/**.
 * Vérifie la présence et la validité du header X-API-Key.
 * Vérifie le quota journalier et l'incrémente si OK.
 * Met le AffiliateKey dans l'attribut "affiliateKey" de la requête pour
 * que les controllers puissent le récupérer.
 */
@Component
public class AffiliateApiKeyFilter extends OncePerRequestFilter {

    public static final String API_KEY_HEADER = "X-API-Key";
    public static final String REQUEST_ATTR   = "affiliateKey";

    private final AffiliateService affiliateService;

    public AffiliateApiKeyFilter(AffiliateService affiliateService) {
        this.affiliateService = affiliateService;
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        // Le filtre ne s'applique QUE sur /api/affiliate/**
        return !request.getRequestURI().startsWith("/api/affiliate/");
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        String apiKey = request.getHeader(API_KEY_HEADER);

        if (apiKey == null || apiKey.isBlank()) {
            sendError(response, HttpServletResponse.SC_UNAUTHORIZED,
                "Clé API manquante. Ajoutez le header X-API-Key.");
            return;
        }

        try {
            AffiliateKey key = affiliateService.validateAndConsume(apiKey);
            // Stocker la clé pour que le controller la récupère
            request.setAttribute(REQUEST_ATTR, key);
            filterChain.doFilter(request, response);
        } catch (IllegalArgumentException e) {
            // Quota dépassé ou clé invalide
            int status = e.getMessage().toLowerCase().contains("quota")
                ? 429   // Too Many Requests
                : 401;  // Unauthorized
            sendError(response, status, e.getMessage());
        }
    }

    private void sendError(HttpServletResponse res, int status, String message) throws IOException {
        res.setStatus(status);
        res.setContentType(MediaType.APPLICATION_JSON_VALUE);
        res.getWriter().write("{\"error\":\"" + message.replace("\"", "\\\"") + "\"}");
    }
}