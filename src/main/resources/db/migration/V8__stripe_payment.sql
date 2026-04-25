-- =============================================================
-- V8 : Ajout du champ Stripe sur les réservations
-- =============================================================

ALTER TABLE reservations
    ADD COLUMN stripe_payment_intent_id VARCHAR(100) NULL;
