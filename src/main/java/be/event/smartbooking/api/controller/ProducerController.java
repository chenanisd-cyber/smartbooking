package be.event.smartbooking.api.controller;

import be.event.smartbooking.dto.ProducerStatsDto.GlobalStatsDto;
import be.event.smartbooking.service.ProducerService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/producer")
public class ProducerController {

    private final ProducerService producerService;

    public ProducerController(ProducerService producerService) {
        this.producerService = producerService;
    }

    @GetMapping("/stats")
    @PreAuthorize("hasAnyRole('PRODUCER', 'ADMIN')")
    public ResponseEntity<GlobalStatsDto> getStats() {
        return ResponseEntity.ok(producerService.getStats());
    }
}
