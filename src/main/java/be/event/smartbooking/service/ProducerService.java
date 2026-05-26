package be.event.smartbooking.service;

import be.event.smartbooking.dto.ProducerStatsDto.GlobalStatsDto;
import be.event.smartbooking.dto.ProducerStatsDto.RepresentationStatsDto;
import be.event.smartbooking.dto.ProducerStatsDto.ShowStatsDto;
import be.event.smartbooking.model.Representation;
import be.event.smartbooking.model.Reservation;
import be.event.smartbooking.model.ReservationLine;
import be.event.smartbooking.model.Show;
import be.event.smartbooking.model.User;
import be.event.smartbooking.model.enumeration.ReservationStatus;
import be.event.smartbooking.repository.ReservationRepository;
import be.event.smartbooking.repository.ShowRepository;
import be.event.smartbooking.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class ProducerService {

    private final ShowRepository showRepository;
    private final ReservationRepository reservationRepository;
    private final UserRepository userRepository;

    public ProducerService(ShowRepository showRepository,
                           ReservationRepository reservationRepository,
                           UserRepository userRepository) {
        this.showRepository = showRepository;
        this.reservationRepository = reservationRepository;
        this.userRepository = userRepository;
    }

    /**
     * Stats pour un producteur précis (filtrées par show.producer).
     */
    public GlobalStatsDto getStats(String producerLogin) {
        User producer = userRepository.findByLogin(producerLogin)
            .orElseThrow(() -> new RuntimeException("Producer not found: " + producerLogin));
        return computeStats(showRepository.findByProducerId(producer.getId()));
    }

    /**
     * Stats globales (admin) — TOUS les spectacles tous producteurs confondus.
     */
    public GlobalStatsDto getGlobalStats() {
        return computeStats(showRepository.findAll());
    }

    /**
     * Stats pour un producteur ciblé par son ID (utilisé par l'admin via sélecteur).
     */
    public GlobalStatsDto getStatsByProducerId(Long producerId) {
        return computeStats(showRepository.findByProducerId(producerId));
    }

    /**
     * Cœur du calcul : pour une liste de shows donnée, agrège les recettes/places à partir
     * de toutes les ReservationLine confirmées.
     */
    private GlobalStatsDto computeStats(List<Show> shows) {
        // Toutes les réservations confirmées
        List<Reservation> confirmed = reservationRepository.findByStatus(ReservationStatus.CONFIRMED);

        // Agréger TOUTES les lignes des réservations confirmées par représentation
        Map<Long, List<ReservationLine>> linesByRep = new HashMap<>();
        for (Reservation r : confirmed) {
            for (ReservationLine line : r.getLines()) {
                linesByRep
                    .computeIfAbsent(line.getRepresentation().getId(), k -> new ArrayList<>())
                    .add(line);
            }
        }

        List<ShowStatsDto> showStats = new ArrayList<>();
        BigDecimal globalRevenue = BigDecimal.ZERO;
        int globalSeats = 0;

        for (Show show : shows) {
            List<RepresentationStatsDto> repStats = new ArrayList<>();
            BigDecimal showRevenue = BigDecimal.ZERO;
            int showSeats = 0;

            for (Representation rep : show.getRepresentations()) {
                List<ReservationLine> repLines = linesByRep.getOrDefault(rep.getId(), List.of());

                int confirmedSeats = repLines.stream().mapToInt(ReservationLine::getQuantity).sum();
                BigDecimal revenue = repLines.stream()
                    .map(ReservationLine::getLineTotal)
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

        showStats.sort((a, b) -> b.totalRevenue().compareTo(a.totalRevenue()));

        return new GlobalStatsDto(
            shows.size(),
            globalSeats,
            globalRevenue,
            showStats
        );
    }
}