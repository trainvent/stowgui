CREATE TABLE licenses (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  locale TEXT NOT NULL,
  checkout_session TEXT NOT NULL UNIQUE,
  payment_intent TEXT,
  license_key TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  revoked_at INTEGER,
  last_email_at INTEGER
);

CREATE INDEX licenses_email ON licenses (email);
CREATE INDEX licenses_payment_intent ON licenses (payment_intent);
