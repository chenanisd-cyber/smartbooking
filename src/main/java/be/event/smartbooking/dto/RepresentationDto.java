package be.event.smartbooking.dto;

import be.event.smartbooking.model.Representation;

import java.time.LocalDateTime;
import java.util.List;

public record RepresentationDto(
    Long id,
    Long showId,
    LocationDto location,
    LocalDateTime dateTime,
    int availableSeats,
    List<PriceDto> prices
) {
    public static RepresentationDto from(Representation r) {
        return new RepresentationDto(
            r.getId(),
            r.getShow().getId(),
            r.getLocation() != null ? LocationDto.from(r.getLocation()) : null,
            r.getDateTime(),
            r.getAvailableSeats(),
            r.getPrices().stream().map(PriceDto::from).toList()
        );
    }
}
