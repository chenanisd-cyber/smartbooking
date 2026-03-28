package be.event.smartbooking.api.controller;

import be.event.smartbooking.dto.LocationDto;
import be.event.smartbooking.dto.LocationRequest;
import be.event.smartbooking.service.LocationService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/locations")
public class LocationController {

    private final LocationService locationService;

    public LocationController(LocationService locationService) {
        this.locationService = locationService;
    }

    // Public — list all locations
    @GetMapping
    public List<LocationDto> getAll() {
        return locationService.findAll().stream().map(LocationDto::from).toList();
    }

    // Public — get one location
    @GetMapping("/{id}")
    public LocationDto getById(@PathVariable Long id) {
        return LocationDto.from(locationService.findById(id));
    }

    // Admin only — create location
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<LocationDto> create(@Valid @RequestBody LocationRequest req) {
        LocationDto dto = LocationDto.from(locationService.create(req));
        return ResponseEntity.status(HttpStatus.CREATED).body(dto);
    }

    // Admin only — update location
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public LocationDto update(@PathVariable Long id, @Valid @RequestBody LocationRequest req) {
        return LocationDto.from(locationService.update(id, req));
    }

    // Admin only — delete location
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        locationService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
