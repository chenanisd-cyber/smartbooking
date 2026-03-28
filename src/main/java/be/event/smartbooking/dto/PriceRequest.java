package be.event.smartbooking.dto;

import be.event.smartbooking.model.enumeration.TypePrice;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;

public record PriceRequest(
    @NotNull TypePrice type,
    @NotNull @Positive BigDecimal amount
) {}
