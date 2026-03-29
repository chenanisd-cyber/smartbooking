-- =============================================================
-- V4 : Reviews — membres peuvent noter un spectacle
-- =============================================================

CREATE TABLE reviews (
    id         BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id    BIGINT      NOT NULL,
    show_id    BIGINT      NOT NULL,
    comment    TEXT        NOT NULL,
    stars      INT         NOT NULL,   -- 1 à 5
    validated  BOOLEAN     NOT NULL DEFAULT FALSE,  -- admin doit valider
    created_at TIMESTAMP   DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (show_id) REFERENCES shows(id) ON DELETE CASCADE
);
