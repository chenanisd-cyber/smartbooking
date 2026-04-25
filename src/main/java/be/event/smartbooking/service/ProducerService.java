package be.event.smartbooking.service;

import be.event.smartbooking.dto.ProducerStatsDto;
import be.event.smartbooking.dto.ProducerStatsDto.GlobalStatsDto;
import be.event.smartbooking.dto.ProducerStatsDto.RepresentationStatsDto;
import be.event.smartbooking.dto.ProducerStatsDto.ShowStatsDto;
import be.event.smartbooking.model.Representation;
import be.event.smartbooking.model.Reservation;
import be.event.smartbooking.model.Show;
import be.event.smartbooking.model.enumeration.ReservationStatus;
import be.event.smartbooking.repository.ReservationRepository;
import be.event.smartbooking.repository.ShowRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class ProducerService {

    private final ShowRepository showRepository;
    private final ReservationRepository reservationRepository;

    public ProducerService(ShowRepository showRepository, ReservationRepository reservationRepository) {
        this.showRepository = showRepository;
        this.reservationRepository = reservationRepository;
    }

    public GlobalStatsDto getStats() {
        // All confirmed reservations
        List<Reservation> confirmed = reservationRepository.findByStatus(ReservationStatus.CONFIRMED);

        // Group by representation id
        Map<Long, List<Reservation>> byRepresentation = confirmed.stream()
            .collect(Collectors.groupingBy(r -> r.getRepresentation().getId()));

        // All shows (confirmed or not — producer sees everything)
        List<Show> shows = showRepository.findAll();

        List<ShowStatsDto> showStats = new ArrayList<>();
        BigDecimal globalRevenue = BigDecimal.ZERO;
        int globalSeats = 0;

        for (Show show : shows) {
            List<RepresentationStatsDto> repStats = new ArrayList<>();
            BigDecimal showRevenue = BigDecimal.ZERO;
            int showSeats = 0;

            for (Representation rep : show.getRepresentations()) {
                List<Reservation> repReservations = byRepresentation.getOrDefault(rep.getId(), List.of());

                int confirmedSeats = repReservations.stream().mapToInt(Reservation::getQuantity).sum();
                BigDecimal revenue = repReservations.stream()
                    .map(Reservation::getTotalAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

                int capacity = rep.getLocation() != null ? rep.getLocation().getCapacity() : 0;
                double fillRate = capacity > 0 ? (double) confirmedSeats / capacity * 100.0 : 0.0;

                String locationName = rep.getLocation() != null ? rep.getLocation().getName() : null;

                repStats.add(new RepresentationStatsDto(
                    rep.getId(),
                    rep.getDateTime(),
                    locationName,
                    capacity,
                    confirmedSeats,
                    revenue,
                    Math.min(fillRate, 100.0)
                ));

                showSeats   += confirmedSeats;
                showRevenue  = showRevenue.add(revenue);
            }

            showStats.add(new ShowStatsDto(
                show.getId(),
                show.getTitle(),
                show.getSlug(),
                showSeats,
                showRevenue,
                repStats
            ));

            globalSeats   += showSeats;
            globalRevenue  = globalRevenue.add(showRevenue);
        }

        // Sort: shows with most revenue first
        showStats.sort((a, b) -> b.totalRevenue().compareTo(a.totalRevenue()));

        return new GlobalStatsDto(
            shows.size(),
            globalSeats,
            globalRevenue,
            showStats
        );
    }
}
