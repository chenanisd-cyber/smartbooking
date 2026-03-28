package be.event.smartbooking.repository;

import be.event.smartbooking.model.Price;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PriceRepository extends JpaRepository<Price, Long> {
}
