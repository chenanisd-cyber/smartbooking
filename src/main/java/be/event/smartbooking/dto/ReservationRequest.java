package be.event.smartbooking.dto;

import be.event.smartbooking.model.enumeration.TypePrice;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.List;

/**
 * Requête de création d'une réservation (panier).
 * Une réservation = un panier contenant 1 à 20 lignes.
 * Chaque ligne = une représentation + un type de tarif + une quantité.
 */
public record ReservationRequest(
    @NotEmpty(message = "Le panier ne peut pas être vide")
    @Size(max = 20, message = "Trop de lignes dans le panier (max 20)")
    @Valid
    List<Line> lines
) {
    public record Line(
        @NotNull Long representationId,
        @NotNull TypePrice priceType,
        @Min(value = 1, message = "La quantité doit être au moins 1") int quantity
    ) {}
}