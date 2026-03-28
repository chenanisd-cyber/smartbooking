package be.event.smartbooking.dto;

import be.event.smartbooking.model.Location;

public record LocationDto(
    Long id,
    String name,
    String address,
    int capacity,
    LocalityDto locality
) {
    public static LocationDto from(Location loc) {
        return new LocationDto(
            loc.getId(),
            loc.getName(),
            loc.getAddress(),
            loc.getCapacity(),
            loc.getLocality() != null ? LocalityDto.from(loc.getLocality()) : null
        );
    }
}
