export type LicenseRecord = {
  id: string;
  email: string;
  locale: string;
  checkout_session: string;
  payment_intent: string | null;
  license_key: string;
  created_at: number;
  revoked_at: number | null;
  last_email_at: number | null;
};

export interface LicenseStore {
  findBySession(sessionId: string): Promise<LicenseRecord | null>;
  findActiveByEmail(email: string): Promise<LicenseRecord[]>;
  findById(id: string): Promise<LicenseRecord | null>;
  insert(record: LicenseRecord): Promise<void>;
  revokeByPaymentIntent(paymentIntent: string, at: number): Promise<number>;
  markEmailed(id: string, at: number): Promise<void>;
}

export function d1Store(db: D1Database): LicenseStore {
  return {
    findBySession: (sessionId) =>
      db.prepare("SELECT * FROM licenses WHERE checkout_session = ?").bind(sessionId).first<LicenseRecord>(),
    findActiveByEmail: async (email) =>
      (await db.prepare("SELECT * FROM licenses WHERE email = ? AND revoked_at IS NULL").bind(email).all<LicenseRecord>()).results,
    findById: (id) => db.prepare("SELECT * FROM licenses WHERE id = ?").bind(id).first<LicenseRecord>(),
    insert: async (r) => {
      await db
        .prepare(
          "INSERT INTO licenses (id, email, locale, checkout_session, payment_intent, license_key, created_at, revoked_at, last_email_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
        )
        .bind(r.id, r.email, r.locale, r.checkout_session, r.payment_intent, r.license_key, r.created_at, r.revoked_at, r.last_email_at)
        .run();
    },
    revokeByPaymentIntent: async (paymentIntent, at) =>
      (await db
        .prepare("UPDATE licenses SET revoked_at = ? WHERE payment_intent = ? AND revoked_at IS NULL")
        .bind(at, paymentIntent)
        .run()).meta.changes,
    markEmailed: async (id, at) => {
      await db.prepare("UPDATE licenses SET last_email_at = ? WHERE id = ?").bind(at, id).run();
    },
  };
}
