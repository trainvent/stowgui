CREATE TABLE IF NOT EXISTS sandbox_emails (
  id TEXT PRIMARY KEY,
  received_at INTEGER NOT NULL,
  message_json TEXT NOT NULL
);
