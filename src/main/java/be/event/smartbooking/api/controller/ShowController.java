package be.event.smartbooking.api.controller;

import be.event.smartbooking.dto.ShowDto;
import be.event.smartbooking.service.ShowService;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/shows")
public class ShowController {

    private final ShowService showService;

    public ShowController(ShowService showService) {
        this.showService = showService;
    }

    // Public — confirmed shows, paginated + filtered + sorted
    @GetMapping
    public Page<ShowDto> getPublic(
        @RequestParam(required = false) String search,
        @RequestParam(required = false) Long localityId,
        @RequestParam(required = false) Long locationId,
        @RequestParam(defaultValue = "newest") String sort,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "10") int size
    ) {
        return showService.findConfirmedPaged(search, localityId, locationId, sort, page, size)
            .map(ShowDto::from);
    }

    // Admin — all shows (confirmed + drafts)
    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public List<ShowDto> getAll() {
        return showService.findAll().stream().map(ShowDto::from).toList();
    }

    // Public — get by id
    @GetMapping("/{id}")
    public ShowDto getById(@PathVariable Long id) {
        return ShowDto.from(showService.findById(id));
    }

    // Public — get by slug
    @GetMapping("/slug/{slug}")
    public ShowDto getBySlug(@PathVariable String slug) {
        return ShowDto.from(showService.findBySlug(slug));
    }

    // Admin — create show (multipart: title, description, artistId, image file)
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ShowDto> create(
        @RequestParam String title,
        @RequestParam(required = false) String description,
        @RequestParam(required = false) Long artistId,
        @RequestParam(required = false) MultipartFile image
    ) throws IOException {
        ShowDto dto = ShowDto.from(showService.create(title, description, artistId, image));
        return ResponseEntity.status(HttpStatus.CREATED).body(dto);
    }

    // Admin — update show
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ShowDto update(
        @PathVariable Long id,
        @RequestParam String title,
        @RequestParam(required = false) String description,
        @RequestParam(required = false) Long artistId,
        @RequestParam(required = false) MultipartFile image
    ) throws IOException {
        return ShowDto.from(showService.update(id, title, description, artistId, image));
    }

    // Admin — confirm show (makes it visible in public catalog)
    @PutMapping("/{id}/confirm")
    @PreAuthorize("hasRole('ADMIN')")
    public ShowDto confirm(@PathVariable Long id) {
        return ShowDto.from(showService.confirm(id));
    }

    // Admin — revoke show (hide from public catalog)
    @PutMapping("/{id}/revoke")
    @PreAuthorize("hasRole('ADMIN')")
    public ShowDto revoke(@PathVariable Long id) {
        return ShowDto.from(showService.revoke(id));
    }

    // Admin — delete show
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        showService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
