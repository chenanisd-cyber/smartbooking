-- =============================================================
-- V7 : Table for password reset tokens
-- =============================================================

CREATE TABLE personal_access_tokens (
    id         BIGINT       AUTO_INCREMENT PRIMARY KEY,
    token      VARCHAR(36)  NOT NULL UNIQUE,
    user_id    BIGINT       NOT NULL,
    expires_at TIMESTAMP    NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
