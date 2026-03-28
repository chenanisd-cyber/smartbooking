package be.event.smartbooking.repository;

import be.event.smartbooking.model.Locality;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LocalityRepository extends JpaRepository<Locality, Integer> {
}
