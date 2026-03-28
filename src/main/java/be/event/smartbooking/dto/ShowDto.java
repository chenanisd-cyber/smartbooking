package be.event.smartbooking.dto;

import be.event.smartbooking.model.Show;

import java.time.LocalDateTime;
import java.util.List;

public record ShowDto(
    Long id,
    String title,
    String description,
    String slug,
    String imagePath,
    boolean isConfirmed,
    ArtistDto artist,
    List<RepresentationDto> representations,
    LocalDateTime createdAt
) {
    public static ShowDto from(Show show) {
        return new ShowDto(
            show.getId(),
            show.getTitle(),
            show.getDescription(),
            show.getSlug(),
            show.getImagePath(),
            show.isConfirmed(),
            show.getArtist() != null ? ArtistDto.from(show.getArtist()) : null,
            show.getRepresentations().stream().map(RepresentationDto::from).toList(),
            show.getCreatedAt()
        );
    }
}
