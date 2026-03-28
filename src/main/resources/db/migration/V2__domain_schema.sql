-- =============================================================
-- V2 : Domain schema — artists, locations, shows, prices
-- =============================================================

-- Artist types (singer, comedian, dancer...)
CREATE TABLE artist_types (
    id   INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE
);

-- Artists
CREATE TABLE artists (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(150) NOT NULL,
    biography   TEXT,
    image_path  VARCHAR(255)
);

-- Artist <-> Type (many-to-many)
CREATE TABLE artist_artist_types (
    artist_id      BIGINT NOT NULL,
    artist_type_id INT    NOT NULL,
    PRIMARY KEY (artist_id, artist_type_id),
    FOREIGN KEY (artist_id)      REFERENCES artists(id)      ON DELETE CASCADE,
    FOREIGN KEY (artist_type_id) REFERENCES artist_types(id) ON DELETE CASCADE
);

-- Localities (cities / postal zones)
CREATE TABLE localities (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(100) NOT NULL,
    postal_code VARCHAR(20)
);

-- Venues
CREATE TABLE locations (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(150) NOT NULL,
    address     VARCHAR(255),
    capacity    INT DEFAULT 0,
    locality_id INT,
    FOREIGN KEY (locality_id) REFERENCES localities(id) ON DELETE SET NULL
);

-- Shows (spectacles)
CREATE TABLE shows (
    id           BIGINT AUTO_INCREMENT PRIMARY KEY,
    title        VARCHAR(200) NOT NULL,
    description  TEXT,
    slug         VARCHAR(200) UNIQUE,
    image_path   VARCHAR(255),
    is_confirmed BOOLEAN NOT NULL DEFAULT FALSE,
    artist_id    BIGINT,
    created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (artist_id) REFERENCES artists(id) ON DELETE SET NULL
);

-- Representations (one show at one place on one date)
CREATE TABLE representations (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    show_id         BIGINT NOT NULL,
    location_id     BIGINT,
    date_time       DATETIME NOT NULL,
    available_seats INT NOT NULL DEFAULT 0,
    FOREIGN KEY (show_id)     REFERENCES shows(id)     ON DELETE CASCADE,
    FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE SET NULL
);

-- Prices per representation (Standard, VIP, Réduit, Premium)
CREATE TABLE prices (
    id                BIGINT AUTO_INCREMENT PRIMARY KEY,
    representation_id BIGINT         NOT NULL,
    type              VARCHAR(20)    NOT NULL,   -- STANDARD, VIP, REDUIT, PREMIUM
    amount            DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (representation_id) REFERENCES representations(id) ON DELETE CASCADE
);

-- =============================================================
-- Seed artist types
-- =============================================================
INSERT INTO artist_types (name) VALUES
    ('Chanteur'), ('Comédien'), ('Danseur'), ('Musicien'), ('Humoriste');
