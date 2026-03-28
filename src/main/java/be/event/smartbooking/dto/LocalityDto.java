package be.event.smartbooking.dto;

import be.event.smartbooking.model.Locality;

public record LocalityDto(
    Integer id,
    String name,
    String postalCode
) {
    public static LocalityDto from(Locality l) {
        return new LocalityDto(l.getId(), l.getName(), l.getPostalCode());
    }
}
