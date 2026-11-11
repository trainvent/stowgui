CREATE TABLE activations (
  license_id TEXT NOT NULL REFERENCES licenses(id),
  device_id TEXT NOT NULL,
  activation_id TEXT NOT NULL,
  activated_at INTEGER NOT NULL,
  last_seen INTEGER NOT NULL,
  PRIMARY KEY (license_id, device_id)
);
CREATE INDEX activations_recency ON activations(license_id, last_seen, device_id);
