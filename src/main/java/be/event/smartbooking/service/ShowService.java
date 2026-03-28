package be.event.smartbooking.service;

import be.event.smartbooking.model.Artist;
import be.event.smartbooking.model.Show;
import be.event.smartbooking.repository.ArtistRepository;
import be.event.smartbooking.repository.ShowRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.util.List;
import java.util.UUID;

@Service
public class ShowService {

    private final ShowRepository showRepository;
    private final ArtistRepository artistRepository;

    @Value("${upload.path}")
    private String uploadPath;

    public ShowService(ShowRepository showRepository, ArtistRepository artistRepository) {
        this.showRepository = showRepository;
        this.artistRepository = artistRepository;
    }

    // Public catalog — only confirmed shows
    public List<Show> findConfirmed() {
        return showRepository.findByIsConfirmedTrue();
    }

    // Admin — all shows
    public List<Show> findAll() {
        return showRepository.findAll();
    }

    public Show findById(Long id) {
        return showRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Show not found: " + id));
    }

    public Show findBySlug(String slug) {
        return showRepository.findBySlug(slug)
            .orElseThrow(() -> new RuntimeException("Show not found: " + slug));
    }

    public Show create(String title, String description, Long artistId, MultipartFile image) throws IOException {
        Show show = new Show();
        show.setTitle(title);
        show.setDescription(description);
        show.setSlug(generateSlug(title));
        show.setArtist(resolveArtist(artistId));
        if (image != null && !image.isEmpty()) {
            show.setImagePath(saveImage(image));
        }
        return showRepository.save(show);
    }

    public Show update(Long id, String title, String description, Long artistId, MultipartFile image) throws IOException {
        Show show = findById(id);
        show.setTitle(title);
        show.setDescription(description);
        // Regenerate slug only if title changed
        show.setSlug(generateSlug(title));
        show.setArtist(resolveArtist(artistId));
        if (image != null && !image.isEmpty()) {
            show.setImagePath(saveImage(image));
        }
        return showRepository.save(show);
    }

    public Show confirm(Long id) {
        Show show = findById(id);
        show.setConfirmed(true);
        return showRepository.save(show);
    }

    public Show revoke(Long id) {
        Show show = findById(id);
        show.setConfirmed(false);
        return showRepository.save(show);
    }

    public void delete(Long id) {
        showRepository.deleteById(id);
    }

    // Save image to uploads/ folder, return relative path
    private String saveImage(MultipartFile file) throws IOException {
        String ext = getExtension(file.getOriginalFilename());
        String filename = UUID.randomUUID() + ext;
        Path dir = Paths.get(uploadPath);
        Files.createDirectories(dir);
        Files.copy(file.getInputStream(), dir.resolve(filename), StandardCopyOption.REPLACE_EXISTING);
        return filename;
    }

    // Simple slug: "Mon Super Show!" → "mon-super-show"
    private String generateSlug(String title) {
        String slug = title.toLowerCase()
            .replaceAll("[àáâã]", "a").replaceAll("[éèêë]", "e")
            .replaceAll("[ïîí]", "i").replaceAll("[ôö]", "o")
            .replaceAll("[üûù]", "u").replaceAll("[ç]", "c")
            .replaceAll("[^a-z0-9\\s]", "")
            .trim().replaceAll("\\s+", "-");

        // Make slug unique if already taken
        String base = slug;
        int i = 2;
        while (showRepository.findBySlug(slug).isPresent()) {
            slug = base + "-" + i++;
        }
        return slug;
    }

    private Artist resolveArtist(Long artistId) {
        if (artistId == null) return null;
        return artistRepository.findById(artistId)
            .orElseThrow(() -> new RuntimeException("Artist not found: " + artistId));
    }

    private String getExtension(String filename) {
        if (filename == null || !filename.contains(".")) return ".jpg";
        return filename.substring(filename.lastIndexOf("."));
    }
}
