package be.event.smartbooking.api.model;

import be.event.smartbooking.model.Show;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Getter;
import org.springframework.hateoas.RepresentationModel;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ShowModel extends RepresentationModel<ShowModel> {

    private final Long   id;
    private final String title;
    private final String slug;
    private final String description;
    private final String imagePath;
    private final String artistName;
    private final List<RepresentationSummary> representations;
    private final LocalDateTime createdAt;

    private ShowModel(Show show) {
        this.id              = show.getId();
        this.title           = show.getTitle();
        this.slug            = show.getSlug();
        this.description     = show.getDescription();
        this.imagePath       = show.getImagePath();
        this.artistName      = show.getArtist() != null ? show.getArtist().getName() : null;
        this.representations = show.getRepresentations().stream()
            .map(r -> new RepresentationSummary(
                r.getId(),
                r.getDateTime(),
                r.getAvailableSeats(),
                r.getLocation() != null ? r.getLocation().getName() : null
            ))
            .toList();
        this.createdAt = show.getCreatedAt();
    }

    public static ShowModel from(Show show) {
        return new ShowModel(show);
    }

    @Getter
    public static class RepresentationSummary {
        private final Long          id;
        private final LocalDateTime dateTime;
        private final int           availableSeats;
        private final String        locationName;

        public RepresentationSummary(Long id, LocalDateTime dateTime, int availableSeats, String locationName) {
            this.id             = id;
            this.dateTime       = dateTime;
            this.availableSeats = availableSeats;
            this.locationName   = locationName;
        }
    }
}
