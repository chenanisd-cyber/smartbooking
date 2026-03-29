package be.event.smartbooking.dto;

import be.event.smartbooking.model.enumeration.TypePrice;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record ReservationRequest(
    @NotNull Long representationId,
    @NotNull TypePrice priceType,
    @Min(1) int quantity
) {}
