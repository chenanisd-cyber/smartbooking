package be.event.smartbooking.dto;

import be.event.smartbooking.model.Reservation;
import be.event.smartbooking.model.enumeration.ReservationStatus;
import be.event.smartbooking.model.enumeration.TypePrice;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record ReservationDto(
    Long id,
    String showTitle,
    String showSlug,
    String locationName,
    LocalDateTime dateTime,
    TypePrice priceType,
    int quantity,
    BigDecimal totalAmount,
    ReservationStatus status,
    LocalDateTime createdAt
) {
    public static ReservationDto from(Reservation r) {
        var rep = r.getRepresentation();
        return new ReservationDto(
            r.getId(),
            rep.getShow().getTitle(),
            rep.getShow().getSlug(),
            rep.getLocation() != null ? rep.getLocation().getName() : null,
            rep.getDateTime(),
            r.getPriceType(),
            r.getQuantity(),
            r.getTotalAmount(),
            r.getStatus(),
            r.getCreatedAt()
        );
    }
}
