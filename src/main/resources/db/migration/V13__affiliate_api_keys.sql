-- V13 — Système d'affiliation API (Free/Starter/Premium)
-- Permet aux affiliés d'accéder à un catalogue limité via une clé API
-- avec quota journalier selon leur tier.

CREATE TABLE affiliate_keys (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE,
    api_key VARCHAR(64) NOT NULL UNIQUE,
    tier VARCHAR(20) NOT NULL DEFAULT 'FREE',
    requests_today INT NOT NULL DEFAULT 0,
    last_reset_date DATE NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_affkeys_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE
);

-- Index pour rechercher rapidement par clé (à chaque requête API)
CREATE INDEX idx_affiliate_api_key ON affiliate_keys(api_key);