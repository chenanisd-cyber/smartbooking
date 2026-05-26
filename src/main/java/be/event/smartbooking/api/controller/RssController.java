package be.event.smartbooking.api.controller;

import be.event.smartbooking.model.Representation;
import be.event.smartbooking.model.Show;
import be.event.smartbooking.repository.RepresentationRepository;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Locale;

@RestController
@RequestMapping("/rss")
public class RssController {

    private final RepresentationRepository representationRepository;

    public RssController(RepresentationRepository representationRepository) {
        this.representationRepository = representationRepository;
    }

    // GET /rss/representations.xml — flux RSS des 20 prochaines représentations
    @GetMapping(value = "/representations.xml", produces = MediaType.APPLICATION_XML_VALUE)
    public String representations() {
        // RFC 822 date format (standard RSS)
        DateTimeFormatter rfc822 = DateTimeFormatter
            .ofPattern("EEE, dd MMM yyyy HH:mm:ss Z", Locale.ENGLISH);

        // Récupérer les 20 prochaines représentations
        List<Representation> upcoming = representationRepository.findAll().stream()
            .filter(r -> r.getDateTime().isAfter(LocalDateTime.now()))
            .filter(r -> r.getShow() != null && r.getShow().isConfirmed())
            .sorted((a, b) -> a.getDateTime().compareTo(b.getDateTime()))
            .limit(20)
            .toList();

        StringBuilder xml = new StringBuilder();
        xml.append("<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n");
        xml.append("<rss version=\"2.0\">\n");
        xml.append("  <channel>\n");
        xml.append("    <title>SmartBooking — Prochains spectacles</title>\n");
        xml.append("    <link>http://localhost:3000/</link>\n");
        xml.append("    <description>Les 20 prochaines représentations disponibles à la réservation sur SmartBooking.</description>\n");
        xml.append("    <language>fr-be</language>\n");
        xml.append("    <lastBuildDate>")
           .append(LocalDateTime.now().atZone(ZoneId.systemDefault()).format(rfc822))
           .append("</lastBuildDate>\n");

        for (Representation rep : upcoming) {
            Show show = rep.getShow();
            String pubDate = rep.getDateTime().atZone(ZoneId.systemDefault()).format(rfc822);
            String locationName = rep.getLocation() != null ? rep.getLocation().getName() : "Lieu non précisé";
            String artistName = show.getArtist() != null ? show.getArtist().getName() : null;

            xml.append("    <item>\n");
            xml.append("      <title>").append(escape(show.getTitle()))
               .append(" — ").append(escape(locationName))
               .append("</title>\n");
            xml.append("      <link>http://localhost:3000/shows/").append(escape(show.getSlug())).append("</link>\n");
            xml.append("      <guid isPermaLink=\"false\">representation-").append(rep.getId()).append("</guid>\n");
            xml.append("      <pubDate>").append(pubDate).append("</pubDate>\n");

            StringBuilder desc = new StringBuilder();
            desc.append("Représentation le ")
                .append(rep.getDateTime().format(DateTimeFormatter.ofPattern("EEEE dd MMMM yyyy 'à' HH'h'mm", Locale.FRENCH)))
                .append(" à ").append(locationName);
            if (artistName != null) {
                desc.append(". Artiste : ").append(artistName);
            }
            desc.append(". Places disponibles : ").append(rep.getAvailableSeats()).append(".");
            if (show.getDescription() != null && !show.getDescription().isBlank()) {
                desc.append("\n\n").append(show.getDescription());
            }

            xml.append("      <description>").append(escape(desc.toString())).append("</description>\n");
            xml.append("    </item>\n");
        }

        xml.append("  </channel>\n");
        xml.append("</rss>\n");

        return xml.toString();
    }

    // Échappe les caractères spéciaux XML pour éviter de casser le flux
    private String escape(String s) {
        if (s == null) return "";
        return s.replace("&",  "&amp;")
                .replace("<",  "&lt;")
                .replace(">",  "&gt;")
                .replace("\"", "&quot;")
                .replace("'",  "&apos;");
    }
}