package be.event.smartbooking.dto;

import jakarta.validation.constraints.*;

public record ReviewRequest(
    @NotNull Long showId,
    @NotBlank String comment,
    @Min(1) @Max(5) int stars
) {}
