package be.event.smartbooking.dto;

import jakarta.validation.constraints.NotBlank;

import java.util.Set;

public record ArtistRequest(
    @NotBlank String name,
    String biography,
    // IDs of artist types (e.g. 1=Chanteur, 2=Comédien)
    Set<Integer> typeIds
) {}
