package be.event.smartbooking.repository;

import be.event.smartbooking.model.Location;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LocationRepository extends JpaRepository<Location, Long> {
}
