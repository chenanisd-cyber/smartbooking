package be.event.smartbooking.api.controller;

import be.event.smartbooking.dto.RepresentationDto;
import be.event.smartbooking.dto.RepresentationRequest;
import be.event.smartbooking.service.RepresentationService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/representations")
public class RepresentationController {

    private final RepresentationService representationService;

    public RepresentationController(RepresentationService representationService) {
        this.representationService = representationService;
    }

    // Public — get representation details (needed for the booking form)
    @GetMapping("/{id}")
    public ResponseEntity<RepresentationDto> getById(@PathVariable Long id) {
        return ResponseEntity.ok(RepresentationDto.from(representationService.findById(id)));
    }

    // Admin — add a representation (date/time/location/prices) to a show
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<RepresentationDto> create(@Valid @RequestBody RepresentationRequest req) {
        RepresentationDto dto = RepresentationDto.from(representationService.create(req));
        return ResponseEntity.status(HttpStatus.CREATED).body(dto);
    }

    // Admin — remove a representation
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        representationService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
