package be.event.smartbooking.api.controller;

import be.event.smartbooking.model.ArtistType;
import be.event.smartbooking.repository.ArtistTypeRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/artist-types")
public class ArtistTypeController {

    private final ArtistTypeRepository artistTypeRepository;

    public ArtistTypeController(ArtistTypeRepository artistTypeRepository) {
        this.artistTypeRepository = artistTypeRepository;
    }

    // Public — used in forms to populate dropdowns
    @GetMapping
    public List<ArtistType> getAll() {
        return artistTypeRepository.findAll();
    }
}
