package be.event.smartbooking.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public class ProducerStatsDto {

    public record RepresentationStatsDto(
        Long id,
        LocalDateTime dateTime,
        String locationName,
        int capacity,
        int confirmedSeats,
        BigDecimal revenue,
        double fillRate
    ) {}

    public record ShowStatsDto(
        Long id,
        String title,
        String slug,
        int totalConfirmedSeats,
        BigDecimal totalRevenue,
        List<RepresentationStatsDto> representations
    ) {}

    public record GlobalStatsDto(
        int totalShows,
        int totalConfirmedSeats,
        BigDecimal totalRevenue,
        List<ShowStatsDto> shows
    ) {}
}
