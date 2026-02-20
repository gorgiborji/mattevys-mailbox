-- Notification preferences table for SMS
-- Stores phone numbers for Matt & Evy (seeded manually)

CREATE TABLE IF NOT EXISTS notification_preferences (
  id         SERIAL PRIMARY KEY,
  name       TEXT NOT NULL UNIQUE,            -- "Matt" or "Evy"
  phone      TEXT NOT NULL,                   -- E.164 format: +1XXXXXXXXXX
  enabled    BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Seed with placeholder values — replace with real numbers in Supabase dashboard
-- INSERT INTO notification_preferences (name, phone)
-- VALUES ('Matt', '+1XXXXXXXXXX'), ('Evy', '+1XXXXXXXXXX');
