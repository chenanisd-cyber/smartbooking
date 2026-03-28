package be.event.smartbooking.dto;

import jakarta.validation.constraints.NotBlank;

public record LocationRequest(
    @NotBlank String name,
    String address,
    int capacity,
    Integer localityId
) {}
