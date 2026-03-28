package be.event.smartbooking.dto;

import be.event.smartbooking.model.Artist;

import java.util.Set;
import java.util.stream.Collectors;

public record ArtistDto(
    Long id,
    String name,
    String biography,
    String imagePath,
    Set<String> types
) {
    public static ArtistDto from(Artist artist) {
        return new ArtistDto(
            artist.getId(),
            artist.getName(),
            artist.getBiography(),
            artist.getImagePath(),
            artist.getTypes().stream().map(t -> t.getName()).collect(Collectors.toSet())
        );
    }
}
