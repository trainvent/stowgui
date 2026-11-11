import { encode } from "./base64url";
import type { LicenseStore } from "./store";

export const MAX_ACTIVE_DEVICES = 3;
export const OFFLINE_SECONDS = 30 * 24 * 60 * 60;
export const MAX_BODY_BYTES = 4096;
const DEVICE_ID = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export type ActivationRecord = {
  license_id: string;
  device_id: string;
  activation_id: string;
  activated_at: number;
  last_seen: number;
};

export interface ActivationStore {
  activate(record: ActivationRecord): Promise<ActivationRecord | null>;
  check(licenseId: string, deviceId: string, activationId: string, now: number): Promise<ActivationRecord | null>;
}

export type ActivationDeps = {
  store: LicenseStore;
  activations: ActivationStore;
  signingKey: () => Promise<CryptoKey>;
  now: () => number;
  newId: () => string;
  allowActivation: (licenseId: string) => Promise<boolean>;
};

export async function handleActivation(request: Request, activate: boolean, deps: ActivationDeps): Promise<Response> {
  // Bound the stream, including requests without a Content-Length header.
  const reader = request.body?.getReader();
  if (!reader) return new Response("missing body", { status: 400 });
  let text = "";
  let bytes = 0;
  const decoder = new TextDecoder();
  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    bytes += value.byteLength;
    if (bytes > MAX_BODY_BYTES) {
      await reader.cancel();
      return new Response("body too large", { status: 413 });
    }
    text += decoder.decode(value, { stream: true });
  }
  let body: Record<string, unknown>;
  try {
    body = JSON.parse(text + decoder.decode());
    if (!body || typeof body !== "object" || Array.isArray(body)) throw new Error();
  } catch {
    return new Response("invalid body", { status: 400 });
  }
  const { key, device_id, activation_id } = body;
  if (typeof key !== "string" || typeof device_id !== "string" || !DEVICE_ID.test(device_id) ||
      (!activate && typeof activation_id !== "string")) return new Response("invalid request", { status: 400 });
  // The exact issued key is a bearer credential; decoded payload IDs alone confer no rights.
  const part = key.trim().split(".")[0];
  let id: string;
  try {
    const payload = JSON.parse(atob(part.replace(/-/g, "+").replace(/_/g, "/")));
    if (typeof payload.id !== "string") throw new Error();
    id = payload.id;
  } catch {
    return Response.json({ error: "invalid" }, { status: 403 });
  }
  const license = await deps.store.findById(id);
  if (!license || license.license_key !== key.trim()) return Response.json({ error: "invalid" }, { status: 403 });
  if (license.revoked_at !== null) return Response.json({ error: "revoked" }, { status: 403 });
  if (activate && !(await deps.allowActivation(id))) return Response.json({ error: "rate_limited" }, { status: 429 });
  const now = deps.now();
  const record = activate
    ? await deps.activations.activate({ license_id: id, device_id, activation_id: deps.newId(), activated_at: now, last_seen: now })
    : await deps.activations.check(id, device_id, activation_id as string, now);
  if (!record) return Response.json({ error: "moved" }, { status: 403 });
  const payload = {
    v: 1, kind: "activation", product: "stowgui", license_id: id, major: 1,
    device_id, activation_id: record.activation_id, issued: now, expires: now + OFFLINE_SECONDS,
  };
  const encoded = encode(new TextEncoder().encode(JSON.stringify(payload)));
  const signature = await crypto.subtle.sign("Ed25519", await deps.signingKey(), new TextEncoder().encode(encoded));
  return Response.json({ token: `${encoded}.${encode(new Uint8Array(signature))}` }, { headers: { "Cache-Control": "no-store" } });
}

export function d1Activations(db: D1Database): ActivationStore {
  return {
    async activate(r) {
      // D1 batches are transactional: concurrent activations cannot exceed the seat limit.
      const result = await db.batch([
        db.prepare(`INSERT INTO activations (license_id, device_id, activation_id, activated_at, last_seen)
          SELECT ?, ?, ?, ?, ? WHERE EXISTS (SELECT 1 FROM licenses WHERE id = ? AND revoked_at IS NULL)
          ON CONFLICT (license_id, device_id) DO UPDATE SET activation_id = excluded.activation_id,
          activated_at = excluded.activated_at, last_seen = excluded.last_seen`)
          .bind(r.license_id, r.device_id, r.activation_id, r.activated_at, r.last_seen, r.license_id),
        db.prepare(`DELETE FROM activations WHERE license_id = ? AND device_id != ? AND device_id NOT IN
          (SELECT device_id FROM activations WHERE license_id = ? AND device_id != ?
           ORDER BY last_seen DESC, device_id DESC LIMIT ?)`)
          .bind(r.license_id, r.device_id, r.license_id, r.device_id, MAX_ACTIVE_DEVICES - 1),
        db.prepare("SELECT * FROM activations WHERE license_id = ? AND device_id = ? AND activation_id = ?")
          .bind(r.license_id, r.device_id, r.activation_id),
      ]);
      return (result[2].results[0] as ActivationRecord | undefined) ?? null;
    },
    async check(licenseId, deviceId, activationId, now) {
      const result = await db.batch([
        db.prepare(`UPDATE activations SET last_seen = ? WHERE license_id = ? AND device_id = ? AND activation_id = ?
          AND EXISTS (SELECT 1 FROM licenses WHERE id = ? AND revoked_at IS NULL)`)
          .bind(now, licenseId, deviceId, activationId, licenseId),
        db.prepare(`SELECT a.* FROM activations a JOIN licenses l ON l.id = a.license_id
          WHERE a.license_id = ? AND a.device_id = ? AND a.activation_id = ? AND l.revoked_at IS NULL`)
          .bind(licenseId, deviceId, activationId),
      ]);
      return (result[1].results[0] as ActivationRecord | undefined) ?? null;
    },
  };
}
