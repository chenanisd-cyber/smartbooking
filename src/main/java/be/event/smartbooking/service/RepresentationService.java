package be.event.smartbooking.service;

import be.event.smartbooking.dto.RepresentationRequest;
import be.event.smartbooking.model.Location;
import be.event.smartbooking.model.Price;
import be.event.smartbooking.model.Representation;
import be.event.smartbooking.model.Show;
import be.event.smartbooking.repository.LocationRepository;
import be.event.smartbooking.repository.RepresentationRepository;
import be.event.smartbooking.repository.ShowRepository;
import org.springframework.stereotype.Service;

@Service
public class RepresentationService {

    private final RepresentationRepository representationRepository;
    private final ShowRepository showRepository;
    private final LocationRepository locationRepository;

    public RepresentationService(RepresentationRepository representationRepository,
                                 ShowRepository showRepository,
                                 LocationRepository locationRepository) {
        this.representationRepository = representationRepository;
        this.showRepository = showRepository;
        this.locationRepository = locationRepository;
    }

    public Representation create(RepresentationRequest req) {
        Show show = showRepository.findById(req.showId())
            .orElseThrow(() -> new RuntimeException("Show not found: " + req.showId()));

        Location location = null;
        if (req.locationId() != null) {
            location = locationRepository.findById(req.locationId())
                .orElseThrow(() -> new RuntimeException("Location not found: " + req.locationId()));
        }

        Representation rep = new Representation();
        rep.setShow(show);
        rep.setLocation(location);
        rep.setDateTime(req.dateTime());
        rep.setAvailableSeats(req.availableSeats());

        // Add prices if provided
        if (req.prices() != null) {
            for (var p : req.prices()) {
                Price price = new Price();
                price.setRepresentation(rep);
                price.setType(p.type());
                price.setAmount(p.amount());
                rep.getPrices().add(price);
            }
        }

        return representationRepository.save(rep);
    }

    public Representation findById(Long id) {
        return representationRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Representation not found: " + id));
    }

    public void delete(Long id) {
        if (!representationRepository.existsById(id)) {
            throw new RuntimeException("Representation not found: " + id);
        }
        representationRepository.deleteById(id);
    }
}
