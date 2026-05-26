package be.event.smartbooking.dto;

import be.event.smartbooking.model.Reservation;
import be.event.smartbooking.model.ReservationLine;
import be.event.smartbooking.model.enumeration.ReservationStatus;
import be.event.smartbooking.model.enumeration.TypePrice;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/**
 * DTO de sortie d'une réservation (= un panier confirmé/payé/annulé).
 * Contient plusieurs lignes (une par représentation + tarif).
 */
public record ReservationDto(
    Long id,
    ReservationStatus status,
    BigDecimal totalAmount,
    LocalDateTime createdAt,
    List<LineDto> lines
) {
    public record LineDto(
        Long id,
        Long representationId,
        Long showId,
        String showTitle,
        String showSlug,
        String locationName,
        LocalDateTime dateTime,
        TypePrice priceType,
        int quantity,
        BigDecimal unitPrice,
        BigDecimal lineTotal
    ) {
        public static LineDto from(ReservationLine line) {
            var rep = line.getRepresentation();
            return new LineDto(
                line.getId(),
                rep.getId(),
                rep.getShow().getId(),
                rep.getShow().getTitle(),
                rep.getShow().getSlug(),
                rep.getLocation() != null ? rep.getLocation().getName() : null,
                rep.getDateTime(),
                line.getPriceType(),
                line.getQuantity(),
                line.getUnitPrice(),
                line.getLineTotal()
            );
        }
    }

    public static ReservationDto from(Reservation r) {
        List<LineDto> lineDtos = r.getLines().stream()
            .map(LineDto::from)
            .toList();
        return new ReservationDto(
            r.getId(),
            r.getStatus(),
            r.getTotalAmount(),
            r.getCreatedAt(),
            lineDtos
        );
    }
}