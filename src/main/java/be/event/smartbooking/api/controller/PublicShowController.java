package be.event.smartbooking.api.controller;

import be.event.smartbooking.api.model.ShowModel;
import be.event.smartbooking.service.ShowService;
import org.springframework.hateoas.CollectionModel;
import org.springframework.hateoas.EntityModel;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import static org.springframework.hateoas.server.mvc.WebMvcLinkBuilder.*;

@RestController
@RequestMapping("/api/public/shows")
public class PublicShowController {

    private final ShowService showService;

    public PublicShowController(ShowService showService) {
        this.showService = showService;
    }

    // GET /api/public/shows
    @GetMapping
    public CollectionModel<EntityModel<ShowModel>> getAll() {
        List<EntityModel<ShowModel>> models = showService.findConfirmed().stream()
            .map(show -> {
                ShowModel model = ShowModel.from(show);
                return EntityModel.of(model,
                    linkTo(methodOn(PublicShowController.class).getById(show.getId())).withSelfRel(),
                    linkTo(methodOn(PublicShowController.class).getAll()).withRel("shows")
                );
            })
            .toList();

        return CollectionModel.of(models,
            linkTo(methodOn(PublicShowController.class).getAll()).withSelfRel()
        );
    }

    // GET /api/public/shows/{id}
    @GetMapping("/{id}")
    public EntityModel<ShowModel> getById(@PathVariable Long id) {
        ShowModel model = ShowModel.from(showService.findById(id));
        return EntityModel.of(model,
            linkTo(methodOn(PublicShowController.class).getById(id)).withSelfRel(),
            linkTo(methodOn(PublicShowController.class).getAll()).withRel("shows")
        );
    }
}
