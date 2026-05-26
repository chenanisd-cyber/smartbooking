package be.event.smartbooking.api.controller;

import be.event.smartbooking.dto.ProducerStatsDto.GlobalStatsDto;
import be.event.smartbooking.service.ProducerService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/producer")
public class ProducerController {

    private final ProducerService producerService;

    public ProducerController(ProducerService producerService) {
        this.producerService = producerService;
    }

    /**
     * Stats du producteur connecté, OU stats globales/filtrées pour l'admin.
     *
     * Comportement :
     *  - Si user = PRODUCER  → renvoie ses propres stats (producerId ignoré)
     *  - Si user = ADMIN sans producerId → stats globales (tous les spectacles)
     *  - Si user = ADMIN avec producerId → stats filtrées sur ce producteur
     */
    @GetMapping("/stats")
    @PreAuthorize("hasAnyRole('PRODUCER', 'ADMIN')")
    public ResponseEntity<GlobalStatsDto> getStats(
        @AuthenticationPrincipal UserDetails userDetails,
        Authentication auth,
        @RequestParam(required = false) Long producerId
    ) {
        boolean isAdmin = auth.getAuthorities().stream()
            .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

        if (isAdmin) {
            if (producerId == null) {
                return ResponseEntity.ok(producerService.getGlobalStats());
            }
            return ResponseEntity.ok(producerService.getStatsByProducerId(producerId));
        }

        // PRODUCER : toujours ses propres stats
        return ResponseEntity.ok(producerService.getStats(userDetails.getUsername()));
    }
}