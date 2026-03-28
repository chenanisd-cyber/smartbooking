package be.event.smartbooking.api.controller;

import be.event.smartbooking.dto.LocalityDto;
import be.event.smartbooking.model.Locality;
import be.event.smartbooking.repository.LocalityRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/localities")
public class LocalityController {

    private final LocalityRepository localityRepository;

    public LocalityController(LocalityRepository localityRepository) {
        this.localityRepository = localityRepository;
    }

    @GetMapping
    public List<LocalityDto> getAll() {
        return localityRepository.findAll().stream().map(LocalityDto::from).toList();
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<LocalityDto> create(@RequestBody LocalityDto req) {
        Locality locality = new Locality();
        locality.setName(req.name());
        locality.setPostalCode(req.postalCode());
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(LocalityDto.from(localityRepository.save(locality)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        localityRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
