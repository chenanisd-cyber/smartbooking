-- V12 — Refactor pour panier multi-lignes
-- Une réservation devient un "panier" qui contient plusieurs lignes
-- Chaque ligne = une représentation + un tarif + une quantité

-- 1) Créer la nouvelle table reservation_lines
CREATE TABLE reservation_lines (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    reservation_id BIGINT NOT NULL,
    representation_id BIGINT NOT NULL,
    price_type VARCHAR(20) NOT NULL,
    quantity INT NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    line_total DECIMAL(10, 2) NOT NULL,
    CONSTRAINT fk_resline_reservation
        FOREIGN KEY (reservation_id) REFERENCES reservations(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_resline_representation
        FOREIGN KEY (representation_id) REFERENCES representations(id)
);

-- 2) Migrer les réservations existantes : 1 réservation → 1 ligne
INSERT INTO reservation_lines (reservation_id, representation_id, price_type, quantity, unit_price, line_total)
SELECT
    r.id,
    r.representation_id,
    r.price_type,
    r.quantity,
    CASE WHEN r.quantity > 0 THEN r.total_amount / r.quantity ELSE 0 END AS unit_price,
    r.total_amount
FROM reservations r
WHERE r.representation_id IS NOT NULL;

-- 3) Retirer les anciennes colonnes de la table reservations
-- (elles sont maintenant dans reservation_lines)
ALTER TABLE reservations
    DROP FOREIGN KEY reservations_ibfk_2;

ALTER TABLE reservations
    DROP COLUMN representation_id,
    DROP COLUMN price_type,
    DROP COLUMN quantity,
    DROP COLUMN total_amount;