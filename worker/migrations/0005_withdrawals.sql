CREATE TABLE withdrawals (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  contract_reference TEXT NOT NULL,
  email TEXT NOT NULL,
  locale TEXT NOT NULL CHECK (locale IN ('de', 'en')),
  declaration TEXT NOT NULL,
  received_at INTEGER NOT NULL,
  sent_at INTEGER,
  attempts INTEGER NOT NULL DEFAULT 0,
  next_attempt_at INTEGER NOT NULL,
  support_sent_at INTEGER,
  support_attempts INTEGER NOT NULL DEFAULT 0,
  support_next_attempt_at INTEGER NOT NULL
);
CREATE INDEX withdrawals_pending ON withdrawals(next_attempt_at) WHERE sent_at IS NULL;
CREATE INDEX withdrawals_support_pending ON withdrawals(support_next_attempt_at) WHERE support_sent_at IS NULL;
