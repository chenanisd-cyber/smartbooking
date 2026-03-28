package be.event.smartbooking.service;

import be.event.smartbooking.dto.LocationRequest;
import be.event.smartbooking.model.Locality;
import be.event.smartbooking.model.Location;
import be.event.smartbooking.repository.LocalityRepository;
import be.event.smartbooking.repository.LocationRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class LocationService {

    private final LocationRepository locationRepository;
    private final LocalityRepository localityRepository;

    public LocationService(LocationRepository locationRepository, LocalityRepository localityRepository) {
        this.locationRepository = locationRepository;
        this.localityRepository = localityRepository;
    }

    public List<Location> findAll() {
        return locationRepository.findAll();
    }

    public Location findById(Long id) {
        return locationRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Location not found: " + id));
    }

    public Location create(LocationRequest req) {
        Location location = new Location();
        location.setName(req.name());
        location.setAddress(req.address());
        location.setCapacity(req.capacity());
        location.setLocality(resolveLocality(req.localityId()));
        return locationRepository.save(location);
    }

    public Location update(Long id, LocationRequest req) {
        Location location = findById(id);
        location.setName(req.name());
        location.setAddress(req.address());
        location.setCapacity(req.capacity());
        location.setLocality(resolveLocality(req.localityId()));
        return locationRepository.save(location);
    }

    public void delete(Long id) {
        locationRepository.deleteById(id);
    }

    private Locality resolveLocality(Integer localityId) {
        if (localityId == null) return null;
        return localityRepository.findById(localityId)
            .orElseThrow(() -> new RuntimeException("Locality not found: " + localityId));
    }
}
