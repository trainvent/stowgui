import { encode } from "./base64url";
import type { LicenseStore } from "./store";

export const MAX_ACTIVE_DEVICES = 3;
export const OFFLINE_SECONDS = 30 * 24 * 60 * 60;
export const MAX_BODY_BYTES = 4096;
export const MAX_DEVICE_NAME = 128;
const DEFAULT_DEVICE_NAME = "Computer";
const DEVICE_ID = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export type ActivationRecord = {
  device_name?: string;
  license_id: string;
  device_id: string;
  activation_id: string;
  activated_at: number;
  last_seen: number;
};

export interface ActivationStore {
  list(licenseId: string): Promise<ActivationRecord[]>;
  rename(licenseId: string, deviceId: string, name: string): Promise<boolean>;
  remove(licenseId: string, deviceId: string): Promise<void>;
  activate(record: ActivationRecord): Promise<ActivationRecord | null>;
  check(licenseId: string, deviceId: string, activationId: string, now: number, deviceName?: string): Promise<ActivationRecord | null>;
}

export type ActivationDeps = {
  store: LicenseStore;
  activations: ActivationStore;
  signingKey: () => Promise<CryptoKey>;
  now: () => number;
  newId: () => string;
  allowActivation: (licenseId: string) => Promise<boolean>;
};

export async function handleActivation(request: Request, operation: string, deps: ActivationDeps): Promise<Response> {
  const activate = operation === "activate";
  const manage = ["devices", "rename-device", "deactivate-device"].includes(operation);
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
      (!activate && !manage && typeof activation_id !== "string")) return new Response("invalid request", { status: 400 });
  const name = body.device_name;
  if (name !== undefined && (typeof name !== "string" || !name.trim() || [...name.trim()].length > MAX_DEVICE_NAME || /[\x00-\x1f\x7f-\x9f]/.test(name))) {
    return new Response("invalid device name", { status: 400 });
  }
  if (operation === "rename-device" && typeof name !== "string") return new Response("missing device name", { status: 400 });
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
  if ((activate || manage) && !(await deps.allowActivation(id))) return Response.json({ error: "rate_limited" }, { status: 429 });
  if (manage) {
    if (operation === "rename-device" && !(await deps.activations.rename(id, device_id, (name as string).trim()))) {
      return Response.json({ error: "name_taken" }, { status: 409 });
    }
    if (operation === "deactivate-device") await deps.activations.remove(id, device_id);
    const records = await deps.activations.list(id);
    return Response.json({ devices: records.map(r => ({ device_id: r.device_id, name: r.device_name || DEFAULT_DEVICE_NAME })) }, { headers: { "Cache-Control": "no-store" } });
  }
  const now = deps.now();
  const record = activate
    ? await deps.activations.activate({ license_id: id, device_id, device_name: typeof name === "string" ? name.trim() : "", activation_id: deps.newId(), activated_at: now, last_seen: now })
    : await deps.activations.check(id, device_id, activation_id as string, now, typeof name === "string" ? name.trim() : "");
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
    async list(id) {
      return (await db.prepare("SELECT a.* FROM activations a JOIN licenses l ON l.id = a.license_id WHERE a.license_id = ? AND l.revoked_at IS NULL ORDER BY a.activated_at, a.device_id").bind(id).all<ActivationRecord>()).results;
    },
    async rename(id, device, name) {
      const result = await db.batch([
        db.prepare(`UPDATE activations SET device_name = ? WHERE license_id = ? AND device_id = ?
          AND EXISTS (SELECT 1 FROM licenses WHERE id = ? AND revoked_at IS NULL)
          AND NOT EXISTS (SELECT 1 FROM activations AS other WHERE other.license_id = ?
            AND other.device_id != ? AND other.device_name = ? COLLATE NOCASE)`)
          .bind(name, id, device, id, id, device, name),
        db.prepare("SELECT device_id FROM activations WHERE license_id = ? AND device_id = ?").bind(id, device),
      ]);
      return result[0].meta.changes > 0 || result[1].results.length === 0;
    },
    async remove(id, device) {
      await db.prepare("DELETE FROM activations WHERE license_id = ? AND device_id = ? AND EXISTS (SELECT 1 FROM licenses WHERE id = ? AND revoked_at IS NULL)").bind(id, device, id).run();
    },
    async activate(r) {
      const base = r.device_name || DEFAULT_DEVICE_NAME;
      const candidates = [base, ...Array.from({ length: MAX_ACTIVE_DEVICES }, (_, i) => {
        const suffix = ` (${i + 1})`;
        return [...base].slice(0, MAX_DEVICE_NAME - suffix.length).join("") + suffix;
      })];
      // D1 batches are transactional: concurrent activations cannot exceed the seat limit.
      const result = await db.batch([
        db.prepare(`INSERT INTO activations (license_id, device_id, activation_id, activated_at, last_seen, device_name)
          SELECT ?, ?, ?, ?, ?, COALESCE(
            (SELECT device_name FROM activations WHERE license_id = ? AND device_id = ?),
            (SELECT value FROM json_each(?) AS candidate WHERE NOT EXISTS (
              SELECT 1 FROM activations AS other WHERE other.license_id = ?
                AND other.device_id != ? AND other.device_name = candidate.value COLLATE NOCASE
            ) ORDER BY CAST(candidate.key AS INTEGER) LIMIT 1)
          ) WHERE EXISTS (SELECT 1 FROM licenses WHERE id = ? AND revoked_at IS NULL)
          ON CONFLICT (license_id, device_id) DO UPDATE SET activation_id = excluded.activation_id,
          activated_at = excluded.activated_at, last_seen = excluded.last_seen,
          device_name = excluded.device_name`)
          .bind(r.license_id, r.device_id, r.activation_id, r.activated_at, r.last_seen, r.license_id, r.device_id, JSON.stringify(candidates), r.license_id, r.device_id, r.license_id),
        db.prepare(`DELETE FROM activations WHERE license_id = ? AND device_id != ? AND device_id NOT IN
          (SELECT device_id FROM activations WHERE license_id = ? AND device_id != ?
           ORDER BY last_seen DESC, device_id DESC LIMIT ?)`)
          .bind(r.license_id, r.device_id, r.license_id, r.device_id, MAX_ACTIVE_DEVICES - 1),
        db.prepare("SELECT * FROM activations WHERE license_id = ? AND device_id = ? AND activation_id = ?")
          .bind(r.license_id, r.device_id, r.activation_id),
      ]);
      return (result[2].results[0] as ActivationRecord | undefined) ?? null;
    },
    async check(licenseId, deviceId, activationId, now, name) {
      const result = await db.batch([
        db.prepare(`UPDATE activations SET last_seen = ?, device_name = CASE WHEN device_name = '' THEN ? ELSE device_name END WHERE license_id = ? AND device_id = ? AND activation_id = ?
          AND EXISTS (SELECT 1 FROM licenses WHERE id = ? AND revoked_at IS NULL)`)
          .bind(now, name || "", licenseId, deviceId, activationId, licenseId),
        db.prepare(`SELECT a.* FROM activations a JOIN licenses l ON l.id = a.license_id
          WHERE a.license_id = ? AND a.device_id = ? AND a.activation_id = ? AND l.revoked_at IS NULL`)
          .bind(licenseId, deviceId, activationId),
      ]);
      return (result[1].results[0] as ActivationRecord | undefined) ?? null;
    },
  };
}
