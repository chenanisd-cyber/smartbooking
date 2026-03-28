package be.event.smartbooking.dto;

import be.event.smartbooking.model.Price;
import be.event.smartbooking.model.enumeration.TypePrice;

import java.math.BigDecimal;

public record PriceDto(
    Long id,
    TypePrice type,
    BigDecimal amount
) {
    public static PriceDto from(Price price) {
        return new PriceDto(price.getId(), price.getType(), price.getAmount());
    }
}
