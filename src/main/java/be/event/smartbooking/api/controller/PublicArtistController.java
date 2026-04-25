package be.event.smartbooking.api.controller;

import be.event.smartbooking.api.model.ArtistModel;
import be.event.smartbooking.service.ArtistService;
import org.springframework.hateoas.CollectionModel;
import org.springframework.hateoas.EntityModel;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import static org.springframework.hateoas.server.mvc.WebMvcLinkBuilder.*;

@RestController
@RequestMapping("/api/public/artists")
public class PublicArtistController {

    private final ArtistService artistService;

    public PublicArtistController(ArtistService artistService) {
        this.artistService = artistService;
    }

    // GET /api/public/artists
    @GetMapping
    public CollectionModel<EntityModel<ArtistModel>> getAll() {
        List<EntityModel<ArtistModel>> models = artistService.findAll().stream()
            .map(artist -> {
                ArtistModel model = ArtistModel.from(artist);
                return EntityModel.of(model,
                    linkTo(methodOn(PublicArtistController.class).getById(artist.getId())).withSelfRel(),
                    linkTo(methodOn(PublicArtistController.class).getAll()).withRel("artists")
                );
            })
            .toList();

        return CollectionModel.of(models,
            linkTo(methodOn(PublicArtistController.class).getAll()).withSelfRel()
        );
    }

    // GET /api/public/artists/{id}
    @GetMapping("/{id}")
    public EntityModel<ArtistModel> getById(@PathVariable Long id) {
        ArtistModel model = ArtistModel.from(artistService.findById(id));
        return EntityModel.of(model,
            linkTo(methodOn(PublicArtistController.class).getById(id)).withSelfRel(),
            linkTo(methodOn(PublicArtistController.class).getAll()).withRel("artists")
        );
    }
}
