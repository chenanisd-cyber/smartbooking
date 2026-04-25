-- =============================================================
-- V9 : Ajout du type et de l'URL article sur les avis
-- =============================================================

ALTER TABLE reviews
    ADD COLUMN review_type VARCHAR(20) NOT NULL DEFAULT 'MEMBER_REVIEW',
    ADD COLUMN article_url VARCHAR(500) NULL;
