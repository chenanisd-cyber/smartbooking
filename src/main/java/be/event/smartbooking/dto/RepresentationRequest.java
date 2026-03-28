package be.event.smartbooking.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;
import java.util.List;

public record RepresentationRequest(
    @NotNull Long showId,
    Long locationId,
    @NotNull LocalDateTime dateTime,
    @Min(0) int availableSeats,
    List<PriceRequest> prices
) {}
