package be.event.smartbooking.api.controller;

import be.event.smartbooking.service.CsvService;
import com.opencsv.exceptions.CsvValidationException;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/admin/csv")
@PreAuthorize("hasRole('ADMIN')")
public class CsvController {

    private final CsvService csvService;

    public CsvController(CsvService csvService) {
        this.csvService = csvService;
    }

    // Export all confirmed reservations as CSV file
    @GetMapping("/export/reservations")
    public ResponseEntity<byte[]> exportReservations() throws IOException {
        byte[] csv = csvService.exportReservations();
        String filename = "reservations_" + LocalDate.now() + ".csv";
        return ResponseEntity.ok()
            .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
            .contentType(MediaType.parseMediaType("text/csv; charset=UTF-8"))
            .body(csv);
    }

    // Import shows + representations from CSV file
    @PostMapping("/import/shows")
    public ResponseEntity<List<String>> importShows(@RequestParam("file") MultipartFile file) throws IOException, CsvValidationException {
        List<String> results = csvService.importShows(file);
        return ResponseEntity.ok(results);
    }
}
