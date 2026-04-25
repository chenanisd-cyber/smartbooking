package be.event.smartbooking.service;

import be.event.smartbooking.model.*;
import be.event.smartbooking.model.enumeration.ReservationStatus;
import be.event.smartbooking.model.enumeration.TypePrice;
import be.event.smartbooking.repository.*;
import com.opencsv.CSVReader;
import com.opencsv.CSVWriter;
import com.opencsv.exceptions.CsvValidationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.*;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.*;

@Service
public class CsvService {

    private static final DateTimeFormatter DT_FMT = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");

    private final ReservationRepository reservationRepository;
    private final ShowRepository        showRepository;
    private final ArtistRepository      artistRepository;
    private final LocationRepository    locationRepository;
    private final RepresentationRepository representationRepository;

    public CsvService(ReservationRepository reservationRepository,
                      ShowRepository showRepository,
                      ArtistRepository artistRepository,
                      LocationRepository locationRepository,
                      RepresentationRepository representationRepository) {
        this.reservationRepository  = reservationRepository;
        this.showRepository         = showRepository;
        this.artistRepository       = artistRepository;
        this.locationRepository     = locationRepository;
        this.representationRepository = representationRepository;
    }

    // -------------------------------------------------------------------------
    // EXPORT — all confirmed reservations
    // -------------------------------------------------------------------------
    public byte[] exportReservations() throws IOException {
        List<Reservation> reservations = reservationRepository.findByStatus(ReservationStatus.CONFIRMED);

        ByteArrayOutputStream out = new ByteArrayOutputStream();
        try (CSVWriter writer = new CSVWriter(new OutputStreamWriter(out, StandardCharsets.UTF_8))) {
            // Header
            writer.writeNext(new String[]{
                "id", "spectacle", "utilisateur", "lieu", "date_heure",
                "type_prix", "quantite", "montant_total", "statut", "date_reservation"
            });

            for (Reservation r : reservations) {
                var rep = r.getRepresentation();
                writer.writeNext(new String[]{
                    String.valueOf(r.getId()),
                    rep.getShow().getTitle(),
                    r.getUser().getLogin(),
                    rep.getLocation() != null ? rep.getLocation().getName() : "",
                    rep.getDateTime().format(DT_FMT),
                    r.getPriceType().name(),
                    String.valueOf(r.getQuantity()),
                    r.getTotalAmount().toPlainString(),
                    r.getStatus().name(),
                    r.getCreatedAt().format(DT_FMT)
                });
            }
        }
        return out.toByteArray();
    }

    // -------------------------------------------------------------------------
    // IMPORT — shows + representations from CSV
    //
    // Expected columns (header row required):
    //   title, description, artistName, locationName, dateTime, priceType, priceAmount, availableSeats
    //
    // - Multiple rows with the same title = same show, different representations
    // - artistName and locationName are matched by name (case-insensitive), ignored if not found
    // - dateTime format: dd/MM/yyyy HH:mm  OR  yyyy-MM-dd'T'HH:mm
    // -------------------------------------------------------------------------
    @Transactional
    public List<String> importShows(MultipartFile file) throws IOException, CsvValidationException {
        List<String> results = new ArrayList<>();

        try (CSVReader reader = new CSVReader(new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8))) {
            String[] header = reader.readNext();
            if (header == null) {
                results.add("ERREUR : fichier vide.");
                return results;
            }

            // Build column index map (case-insensitive)
            Map<String, Integer> idx = new HashMap<>();
            for (int i = 0; i < header.length; i++) {
                idx.put(header[i].trim().toLowerCase(), i);
            }

            String[] required = {"title", "datetime", "pricetype", "priceamount", "availableseats"};
            for (String col : required) {
                if (!idx.containsKey(col)) {
                    results.add("ERREUR : colonne manquante « " + col + " ».");
                    return results;
                }
            }

            // Cache shows already created during this import (title → Show)
            Map<String, Show> created = new HashMap<>();

            String[] row;
            int line = 2;
            while ((row = reader.readNext()) != null) {
                final String[] r = row;
                try {
                    String title       = get(r, idx, "title");
                    String description = get(r, idx, "description");
                    String artistName  = get(r, idx, "artistname");
                    String locationName= get(r, idx, "locationname");
                    String dtRaw       = get(r, idx, "datetime");
                    String priceType   = get(r, idx, "pricetype");
                    String priceAmount = get(r, idx, "priceamount");
                    String seatsRaw    = get(r, idx, "availableseats");

                    if (title.isBlank()) {
                        results.add("Ligne " + line + " ignorée : titre vide.");
                        line++; continue;
                    }

                    // Parse dateTime
                    LocalDateTime dateTime = parseDateTime(dtRaw);
                    if (dateTime == null) {
                        results.add("Ligne " + line + " ignorée : date invalide « " + dtRaw + " ».");
                        line++; continue;
                    }

                    // Parse price
                    TypePrice type;
                    try {
                        type = TypePrice.valueOf(priceType.toUpperCase());
                    } catch (IllegalArgumentException e) {
                        results.add("Ligne " + line + " ignorée : type de prix invalide « " + priceType + " ».");
                        line++; continue;
                    }

                    BigDecimal amount;
                    try {
                        amount = new BigDecimal(priceAmount.replace(",", "."));
                    } catch (NumberFormatException e) {
                        results.add("Ligne " + line + " ignorée : montant invalide « " + priceAmount + " ».");
                        line++; continue;
                    }

                    int seats;
                    try {
                        seats = Integer.parseInt(seatsRaw.trim());
                    } catch (NumberFormatException e) {
                        results.add("Ligne " + line + " ignorée : places invalides « " + seatsRaw + " ».");
                        line++; continue;
                    }

                    // Find or create show
                    Show show = created.computeIfAbsent(title.toLowerCase(), k -> {
                        return showRepository.findAll().stream()
                            .filter(s -> s.getTitle().equalsIgnoreCase(title))
                            .findFirst()
                            .orElseGet(() -> {
                                Show s = new Show();
                                s.setTitle(title);
                                s.setDescription(description.isBlank() ? null : description);
                                s.setSlug(generateSlug(title));
                                if (!artistName.isBlank()) {
                                    artistRepository.findAll().stream()
                                        .filter(a -> a.getName().equalsIgnoreCase(artistName))
                                        .findFirst()
                                        .ifPresent(s::setArtist);
                                }
                                return showRepository.save(s);
                            });
                    });

                    // Resolve location
                    Location location = null;
                    if (!locationName.isBlank()) {
                        location = locationRepository.findAll().stream()
                            .filter(l -> l.getName().equalsIgnoreCase(locationName))
                            .findFirst()
                            .orElse(null);
                        if (location == null) {
                            results.add("Ligne " + line + " : lieu « " + locationName + " » introuvable — représentation créée sans lieu.");
                        }
                    }

                    // Create representation
                    Representation rep = new Representation();
                    rep.setShow(show);
                    rep.setLocation(location);
                    rep.setDateTime(dateTime);
                    rep.setAvailableSeats(seats);

                    Price price = new Price();
                    price.setRepresentation(rep);
                    price.setType(type);
                    price.setAmount(amount);
                    rep.getPrices().add(price);

                    representationRepository.save(rep);

                    results.add("Ligne " + line + " OK : représentation ajoutée à « " + show.getTitle() + " » (" + dateTime.format(DT_FMT) + ").");

                } catch (Exception e) {
                    results.add("Ligne " + line + " ERREUR : " + e.getMessage());
                }
                line++;
            }
        }

        if (results.isEmpty()) {
            results.add("Aucune ligne trouvée dans le fichier.");
        }
        return results;
    }

    // -------------------------------------------------------------------------
    // Helpers
    // -------------------------------------------------------------------------
    private String get(String[] row, Map<String, Integer> idx, String col) {
        Integer i = idx.get(col);
        if (i == null || i >= row.length) return "";
        return row[i] == null ? "" : row[i].trim();
    }

    private LocalDateTime parseDateTime(String raw) {
        if (raw == null || raw.isBlank()) return null;
        try {
            return LocalDateTime.parse(raw, DT_FMT);                          // dd/MM/yyyy HH:mm
        } catch (DateTimeParseException ignored) {}
        try {
            return LocalDateTime.parse(raw, DateTimeFormatter.ISO_LOCAL_DATE_TIME); // yyyy-MM-dd'T'HH:mm
        } catch (DateTimeParseException ignored) {}
        return null;
    }

    private String generateSlug(String title) {
        String slug = title.toLowerCase()
            .replaceAll("[àáâã]", "a").replaceAll("[éèêë]", "e")
            .replaceAll("[ïîí]", "i").replaceAll("[ôö]", "o")
            .replaceAll("[üûù]", "u").replaceAll("[ç]", "c")
            .replaceAll("[^a-z0-9\\s]", "")
            .trim().replaceAll("\\s+", "-");
        String base = slug;
        int i = 2;
        while (showRepository.findBySlug(slug).isPresent()) {
            slug = base + "-" + i++;
        }
        return slug;
    }
}
