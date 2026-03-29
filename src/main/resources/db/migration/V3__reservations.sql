-- =============================================================
-- V3 : Reservations table
-- =============================================================

CREATE TABLE reservations (
    id                BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id           BIGINT      NOT NULL,
    representation_id BIGINT      NOT NULL,
    price_type        VARCHAR(20) NOT NULL,   -- STANDARD, VIP, REDUIT, PREMIUM
    quantity          INT         NOT NULL DEFAULT 1,
    total_amount      DECIMAL(10,2) NOT NULL,
    status            VARCHAR(20) NOT NULL DEFAULT 'CONFIRMED', -- CONFIRMED, CANCELLED
    created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id)           REFERENCES users(id)           ON DELETE CASCADE,
    FOREIGN KEY (representation_id) REFERENCES representations(id) ON DELETE CASCADE
);
