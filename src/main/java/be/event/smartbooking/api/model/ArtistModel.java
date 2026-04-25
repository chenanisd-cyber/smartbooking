package be.event.smartbooking.api.model;

import be.event.smartbooking.model.Artist;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Getter;
import org.springframework.hateoas.RepresentationModel;

import java.util.Set;
import java.util.stream.Collectors;

@Getter
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ArtistModel extends RepresentationModel<ArtistModel> {

    private final Long        id;
    private final String      name;
    private final String      biography;
    private final String      imagePath;
    private final Set<String> types;

    private ArtistModel(Artist artist) {
        this.id        = artist.getId();
        this.name      = artist.getName();
        this.biography = artist.getBiography();
        this.imagePath = artist.getImagePath();
        this.types     = artist.getTypes().stream()
            .map(t -> t.getName())
            .collect(Collectors.toSet());
    }

    public static ArtistModel from(Artist artist) {
        return new ArtistModel(artist);
    }
}
