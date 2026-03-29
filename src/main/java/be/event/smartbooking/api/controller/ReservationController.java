package be.event.smartbooking.api.controller;

import be.event.smartbooking.dto.ReservationDto;
import be.event.smartbooking.dto.ReservationRequest;
import be.event.smartbooking.service.ReservationService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reservations")
public class ReservationController {

    private final ReservationService reservationService;

    public ReservationController(ReservationService reservationService) {
        this.reservationService = reservationService;
    }

    // Member — create a reservation
    @PostMapping
    public ResponseEntity<?> create(
        @Valid @RequestBody ReservationRequest req,
        @AuthenticationPrincipal UserDetails userDetails
    ) {
        try {
            ReservationDto dto = ReservationDto.from(
                reservationService.create(req, userDetails.getUsername()));
            return ResponseEntity.status(HttpStatus.CREATED).body(dto);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Member — my bookings
    @GetMapping("/my-bookings")
    public List<ReservationDto> myBookings(@AuthenticationPrincipal UserDetails userDetails) {
        return reservationService.findByUser(userDetails.getUsername())
            .stream().map(ReservationDto::from).toList();
    }

    // Admin — all reservations
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<ReservationDto> getAll() {
        return reservationService.findAll()
            .stream().map(ReservationDto::from).toList();
    }
}
