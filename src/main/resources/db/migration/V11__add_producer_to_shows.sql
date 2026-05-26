-- V11 — Lien producteur ↔ spectacle
-- Un spectacle est produit par un utilisateur ayant le rôle 'producer'

ALTER TABLE shows
    ADD COLUMN producer_id BIGINT NULL,
    ADD CONSTRAINT fk_shows_producer
        FOREIGN KEY (producer_id) REFERENCES users(id)
        ON DELETE SET NULL;

-- Affecter les spectacles existants au producteur de démo (producer1)
-- Si producer1 n'existe pas, on saute simplement (LEFT JOIN inoffensif)
UPDATE shows s
SET s.producer_id = (SELECT id FROM users WHERE login = 'producer1' LIMIT 1)
WHERE s.producer_id IS NULL;