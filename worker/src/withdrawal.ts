import type { Locale } from "./email";

const MAX_BODY_BYTES = 4096;
const MAX_NAME_LENGTH = 200;
const MAX_REFERENCE_LENGTH = 500;
const MAX_EMAIL_LENGTH = 254;
const DELIVERY_LEASE_SECONDS = 300;
const MAX_RETRY_SECONDS = 3600;
const RETRY_BATCH_SIZE = 20;
const RESEND_URL = "https://api.resend.com/emails";
const SUPPORT_EMAIL = "support@trainvent.com";
const MAIL_TIMEOUT_MS = 15_000;
type Recipient = "customer" | "support";
const RECEIPT_TEXT = {
  de: {
    subject: "Eingangsbestätigung deines Widerrufs",
    supportSubject: "Neue Widerrufserklärung",
    declaration: "Hiermit widerrufe ich den unten bezeichneten Vertrag.",
    name: "Name", reference: "Vertrag / Bestellreferenz", email: "E-Mail", received: "Eingegangen am", id: "Eingangsnummer",
    note: "Wir haben deine Widerrufserklärung erhalten. Dies bestätigt den Eingang, nicht bereits eine Erstattung. Bei Fragen antworte auf diese E-Mail.",
  },
  en: {
    subject: "Receipt of your withdrawal",
    supportSubject: "New withdrawal declaration",
    declaration: "I hereby withdraw from the contract identified below.",
    name: "Name", reference: "Contract / order reference", email: "Email", received: "Received at", id: "Receipt reference",
    note: "We have received your withdrawal declaration. This confirms receipt, not an already approved refund. For questions, reply to this email.",
  },
};

export type Withdrawal = {
  id: string; name: string; contract_reference: string; email: string; locale: Locale;
  declaration: string;
  received_at: number; sent_at: number | null; attempts: number; next_attempt_at: number;
};
export interface WithdrawalStore {
  save(record: Withdrawal): Promise<Withdrawal>;
  claim(id: string, now: number): Promise<Withdrawal | null>;
  delivered(id: string, now: number): Promise<void>;
  retry(id: string, at: number): Promise<void>;
  pending(now: number): Promise<Withdrawal[]>;
}

export function d1Withdrawals(db: D1Database, recipient: Recipient = "customer"): WithdrawalStore {
  const prefix = recipient === "support" ? "support_" : "";
  const columns = `id,name,contract_reference,email,locale,declaration,received_at,${prefix}sent_at AS sent_at,${prefix}attempts AS attempts,${prefix}next_attempt_at AS next_attempt_at`;
  return {
    async save(r) {
      await db.prepare("INSERT INTO withdrawals (id,name,contract_reference,email,locale,declaration,received_at,next_attempt_at,support_next_attempt_at) VALUES (?,?,?,?,?,?,?,?,?) ON CONFLICT(id) DO NOTHING")
        .bind(r.id, r.name, r.contract_reference, r.email, r.locale, r.declaration, r.received_at, r.next_attempt_at, r.next_attempt_at).run();
      return (await db.prepare(`SELECT ${columns} FROM withdrawals WHERE id = ?`).bind(r.id).first<Withdrawal>())!;
    },
    claim: (id, now) => db.prepare(`UPDATE withdrawals SET ${prefix}next_attempt_at = ?, ${prefix}attempts = ${prefix}attempts + 1 WHERE id = ? AND ${prefix}sent_at IS NULL AND ${prefix}next_attempt_at <= ? RETURNING ${columns}`)
      .bind(now + DELIVERY_LEASE_SECONDS, id, now).first<Withdrawal>(),
    async delivered(id, now) { await db.prepare(`UPDATE withdrawals SET ${prefix}sent_at = ? WHERE id = ?`).bind(now, id).run(); },
    async retry(id, at) { await db.prepare(`UPDATE withdrawals SET ${prefix}next_attempt_at = ? WHERE id = ? AND ${prefix}sent_at IS NULL`).bind(at, id).run(); },
    pending: async (now) => (await db.prepare(`SELECT ${columns} FROM withdrawals WHERE ${prefix}sent_at IS NULL AND ${prefix}next_attempt_at <= ? ORDER BY ${prefix}next_attempt_at LIMIT ?`).bind(now, RETRY_BATCH_SIZE).all<Withdrawal>()).results,
  };
}

export type WithdrawalMail = (record: Withdrawal) => Promise<void>;
export function withdrawalMailer(key: string, sender: { name: string; email: string }, recipient: Recipient = "customer", transport: typeof fetch = fetch): WithdrawalMail {
  return async (r) => {
    const t = RECEIPT_TEXT[r.locale];
    const received = new Date(r.received_at * 1000).toISOString();
    const text = `${r.declaration}\n\n${t.name}: ${r.name}\n${t.reference}: ${r.contract_reference}\n${t.email}: ${r.email}\n${t.received}: ${received}\n${t.id}: ${r.id}\n\n${t.note}`;
    const response = await transport(RESEND_URL, {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json", "Idempotency-Key": `withdrawal-${r.id}-${recipient}` },
      signal: AbortSignal.timeout(MAIL_TIMEOUT_MS),
      body: JSON.stringify({ from: `${sender.name} <${sender.email}>`, to: [recipient === "support" ? SUPPORT_EMAIL : r.email], reply_to: recipient === "support" ? r.email : SUPPORT_EMAIL, subject: recipient === "support" ? t.supportSubject : t.subject, text }),
    });
    if (!response.ok) throw new Error(`Withdrawal receipt delivery failed: ${response.status}`);
  };
}

export async function deliverWithdrawal(store: WithdrawalStore, mail: WithdrawalMail, id: string, now: number) {
  const record = await store.claim(id, now);
  if (!record) return;
  try {
    await mail(record);
    await store.delivered(id, now);
  } catch {
    await store.retry(id, now + Math.min(MAX_RETRY_SECONDS, 60 * 2 ** Math.min(record.attempts, 6)));
  }
}

export async function retryWithdrawals(store: WithdrawalStore, mail: WithdrawalMail, now: () => number) {
  for (const record of await store.pending(now())) await deliverWithdrawal(store, mail, record.id, now());
}

function field(value: unknown, max: number): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed && trimmed.length <= max && !/[\u0000-\u001f\u007f]/.test(trimmed) ? trimmed : null;
}

export function withdrawalHandler(deps: {
  store: WithdrawalStore; mail: WithdrawalMail; origins: string[]; now: () => number;
  allow: (ip: string) => Promise<boolean>;
  notification?: { store: WithdrawalStore; mail: WithdrawalMail };
}) {
  return async (request: Request): Promise<Response> => {
    const origin = request.headers.get("Origin") ?? "";
    if (!deps.origins.includes(origin)) return new Response("forbidden", { status: 403 });
    const headers = { "Access-Control-Allow-Origin": origin, Vary: "Origin", "Cache-Control": "no-store" };
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: { ...headers, "Access-Control-Allow-Methods": "POST", "Access-Control-Allow-Headers": "Content-Type, Idempotency-Key" } });
    const reply = (body: unknown, status: number) => Response.json(body, { status, headers });
    if (request.method !== "POST") return reply({ error: "method" }, 405);
    if (!await deps.allow(request.headers.get("CF-Connecting-IP") ?? "unknown")) return reply({ error: "rate" }, 429);
    const id = request.headers.get("Idempotency-Key") ?? "";
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)) return reply({ error: "id" }, 400);
    if (!request.headers.get("Content-Type")?.startsWith("application/json")) return reply({ error: "type" }, 415);
    const reader = request.body?.getReader();
    if (!reader) return reply({ error: "body" }, 400);
    let raw = "";
    let bytes = 0;
    const decoder = new TextDecoder();
    while (true) {
      const chunk = await reader.read();
      if (chunk.done) break;
      bytes += chunk.value.byteLength;
      if (bytes > MAX_BODY_BYTES) { await reader.cancel(); return reply({ error: "size" }, 413); }
      raw += decoder.decode(chunk.value, { stream: true });
    }
    raw += decoder.decode();
    let body: Record<string, unknown>;
    try { body = JSON.parse(raw); } catch { return reply({ error: "body" }, 400); }
    if (!body || typeof body !== "object") return reply({ error: "body" }, 400);
    const name = field(body.name, MAX_NAME_LENGTH);
    const reference = field(body.contract_reference, MAX_REFERENCE_LENGTH);
    const email = field(body.email, MAX_EMAIL_LENGTH)?.toLowerCase();
    if (!name || !reference || !email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || (body.locale !== "de" && body.locale !== "en")) return reply({ error: "fields" }, 400);
    const now = deps.now();
    const locale = body.locale as Locale;
    const record = await deps.store.save({ id, name, contract_reference: reference, email, locale, declaration: RECEIPT_TEXT[locale].declaration, received_at: now, sent_at: null, attempts: 0, next_attempt_at: now });
    if (record.name !== name || record.contract_reference !== reference || record.email !== email || record.locale !== body.locale) return reply({ error: "conflict" }, 409);
    await deliverWithdrawal(deps.store, deps.mail, id, now);
    if (deps.notification) await deliverWithdrawal(deps.notification.store, deps.notification.mail, id, deps.now());
    return reply({ id, received_at: record.received_at }, 202);
  };
}
