package be.event.smartbooking.repository;

import be.event.smartbooking.model.Representation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RepresentationRepository extends JpaRepository<Representation, Long> {
    List<Representation> findByShowId(Long showId);
}
