package be.event.smartbooking.api.controller;

import be.event.smartbooking.dto.ArtistDto;
import be.event.smartbooking.dto.ArtistRequest;
import be.event.smartbooking.service.ArtistService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/artists")
public class ArtistController {

    private final ArtistService artistService;

    public ArtistController(ArtistService artistService) {
        this.artistService = artistService;
    }

    // Public — list all artists
    @GetMapping
    public List<ArtistDto> getAll() {
        return artistService.findAll().stream().map(ArtistDto::from).toList();
    }

    // Public — get one artist
    @GetMapping("/{id}")
    public ArtistDto getById(@PathVariable Long id) {
        return ArtistDto.from(artistService.findById(id));
    }

    // Admin only — create artist
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ArtistDto> create(@Valid @RequestBody ArtistRequest req) {
        ArtistDto dto = ArtistDto.from(artistService.create(req));
        return ResponseEntity.status(HttpStatus.CREATED).body(dto);
    }

    // Admin only — update artist
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ArtistDto update(@PathVariable Long id, @Valid @RequestBody ArtistRequest req) {
        return ArtistDto.from(artistService.update(id, req));
    }

    // Admin only — delete artist
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        artistService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
