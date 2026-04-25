-- V10 : Many-to-many collaboration between artists and shows
--
-- A show already has a principal artist (artist_id FK on shows).
-- This table stores additional collaborating artists.

CREATE TABLE show_artists (
    show_id   BIGINT NOT NULL,
    artist_id BIGINT NOT NULL,
    PRIMARY KEY (show_id, artist_id),
    FOREIGN KEY (show_id)   REFERENCES shows(id)   ON DELETE CASCADE,
    FOREIGN KEY (artist_id) REFERENCES artists(id) ON DELETE CASCADE
);
