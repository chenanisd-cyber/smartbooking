package be.event.smartbooking.service;

import be.event.smartbooking.dto.ArtistRequest;
import be.event.smartbooking.model.Artist;
import be.event.smartbooking.model.ArtistType;
import be.event.smartbooking.repository.ArtistRepository;
import be.event.smartbooking.repository.ArtistTypeRepository;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
public class ArtistService {

    private final ArtistRepository artistRepository;
    private final ArtistTypeRepository artistTypeRepository;

    public ArtistService(ArtistRepository artistRepository, ArtistTypeRepository artistTypeRepository) {
        this.artistRepository = artistRepository;
        this.artistTypeRepository = artistTypeRepository;
    }

    public List<Artist> findAll() {
        return artistRepository.findAll();
    }

    public Artist findById(Long id) {
        return artistRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Artist not found: " + id));
    }

    public Artist create(ArtistRequest req) {
        Artist artist = new Artist();
        artist.setName(req.name());
        artist.setBiography(req.biography());
        artist.setTypes(resolveTypes(req.typeIds()));
        return artistRepository.save(artist);
    }

    public Artist update(Long id, ArtistRequest req) {
        Artist artist = findById(id);
        artist.setName(req.name());
        artist.setBiography(req.biography());
        artist.setTypes(resolveTypes(req.typeIds()));
        return artistRepository.save(artist);
    }

    public void delete(Long id) {
        artistRepository.deleteById(id);
    }

    // Resolve type IDs to entities
    private Set<ArtistType> resolveTypes(Set<Integer> typeIds) {
        if (typeIds == null || typeIds.isEmpty()) return new HashSet<>();
        return new HashSet<>(artistTypeRepository.findAllById(typeIds));
    }
}
