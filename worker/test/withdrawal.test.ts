import { Miniflare } from "miniflare";
import { readFile } from "node:fs/promises";
import { URL as NodeURL } from "node:url";
import { describe, expect, it, vi } from "vitest";
import { d1Withdrawals, deliverWithdrawal, retryWithdrawals, withdrawalHandler, withdrawalMailer, type Withdrawal } from "../src/withdrawal";

const NOW = 1_800_000_000;
const ID = "a94ad392-18ed-4f27-837b-507ac1554753";
const body = { name: "Test Buyer", contract_reference: "A purchase I cannot find the reference for", email: "test@example.com", locale: "de" };
function request(value: unknown = body, origin = "https://stowgui.com", id = ID) {
  return new Request("https://license.stowgui.com/withdrawal", { method: "POST", headers: { Origin: origin, "Content-Type": "application/json", "Idempotency-Key": id }, body: JSON.stringify(value) });
}

it("records once before sending, retries failures, and leases delivery atomically in D1", async () => {
  const mf = new Miniflare({ workers: [{ config: {
    name: "withdrawal", compatibilityDate: "2026-11-01",
    manifest: { mainModule: "index.js", modules: { "index.js": { type: "esm", contents: "export default { fetch() { return new Response('ok'); } }" } } },
    env: { DB: { type: "d1", id: "withdrawals" } },
  } }] });
  try {
    const db = await mf.getD1Database("DB");
    const sql = await readFile(new NodeURL("../migrations/0005_withdrawals.sql", import.meta.url), "utf8");
    await db.batch(sql.split(";").map(s => s.trim()).filter(Boolean).map(s => db.prepare(s)));
    const store = d1Withdrawals(db);
    const notifications = d1Withdrawals(db, "support");
    let fail = true;
    let clock = NOW;
    let failSupport = true;
    const notify = vi.fn(async () => { if (failSupport) throw new Error("support delivery failed"); });
    const mail = vi.fn(async (r: Withdrawal) => {
      expect(await db.prepare("SELECT id FROM withdrawals WHERE id = ?").bind(r.id).first()).toEqual({ id: r.id });
      if (fail) throw new Error("provider unavailable");
    });
    const handle = withdrawalHandler({ store, mail, notification: { store: notifications, mail: notify }, origins: ["https://stowgui.com"], now: () => clock, allow: async () => true });
    const response = await handle(request());
    expect(response.status).toBe(202);
    expect(await response.json()).toEqual({ id: ID, received_at: NOW });
    expect(mail).toHaveBeenCalledTimes(1);
    expect(notify).toHaveBeenCalledTimes(1);
    expect((await handle(request())).status).toBe(202);
    expect(mail).toHaveBeenCalledTimes(1);
    expect((await handle(request({ ...body, email: "someone-else@example.com" }))).status).toBe(409);
    expect((await db.prepare("SELECT COUNT(*) AS n FROM withdrawals").first<{ n: number }>())?.n).toBe(1);
    const record = await db.prepare("SELECT * FROM withdrawals").first<Withdrawal>();
    expect(record).toMatchObject({ sent_at: null, attempts: 1, received_at: NOW });
    fail = false;
    clock = record!.next_attempt_at;
    await Promise.all([retryWithdrawals(store, mail, () => clock), retryWithdrawals(store, mail, () => clock)]);
    expect(mail).toHaveBeenCalledTimes(2);
    expect(await db.prepare("SELECT sent_at, received_at FROM withdrawals").first()).toEqual({ sent_at: clock, received_at: NOW });
    await deliverWithdrawal(store, mail, ID, clock + 1000);
    expect(mail).toHaveBeenCalledTimes(2);
    expect((await db.prepare("SELECT support_sent_at FROM withdrawals").first<{ support_sent_at: number | null }>())?.support_sent_at).toBeNull();
    failSupport = false;
    await retryWithdrawals(notifications, notify, () => clock);
    expect(notify).toHaveBeenCalledTimes(2);
    expect(mail).toHaveBeenCalledTimes(2);
    expect((await db.prepare("SELECT support_sent_at FROM withdrawals").first<{ support_sent_at: number }>())?.support_sent_at).toBe(clock);
  } finally { await mf.dispose(); }
}, 15000);

describe("withdrawal input and privacy", () => {
  const store = { save: vi.fn(), claim: vi.fn(), delivered: vi.fn(), retry: vi.fn(), pending: vi.fn() };
  const handle = withdrawalHandler({ store, mail: vi.fn(), origins: ["https://stowgui.com"], now: () => NOW, allow: async () => true });
  it("rejects disallowed origins and handles CORS preflight", async () => {
    expect((await handle(request(body, "https://other.example"))).status).toBe(403);
    const preflight = await handle(new Request("https://license.stowgui.com/withdrawal", { method: "OPTIONS", headers: { Origin: "https://stowgui.com" } }));
    expect(preflight.status).toBe(204);
    expect(preflight.headers.get("Access-Control-Allow-Headers")).toContain("Idempotency-Key");
  });
  it("validates size, required fields and abuse limits without writing", async () => {
    for (const value of [null, {}, { ...body, name: " " }, { ...body, email: "wrong" }, { ...body, name: "Header\nInjection" }, { ...body, locale: "fr" }, { ...body, locale: ["de"] }]) {
      expect((await handle(request(value))).status).toBe(400);
    }
    expect((await handle(request({ ...body, contract_reference: "x".repeat(5000) }))).status).toBe(413);
    const limited = withdrawalHandler({ store, mail: vi.fn(), origins: ["https://stowgui.com"], now: () => NOW, allow: async () => false });
    expect((await limited(request())).status).toBe(429);
    expect(store.save).not.toHaveBeenCalled();
  });
});

it("sends a plain receipt with the declaration and original UTC timestamp, using a stable provider idempotency key", async () => {
  const fetcher = vi.fn(async (_url: string, _init: RequestInit) => new Response("{}", { status: 200 }));
  vi.stubGlobal("fetch", fetcher);
  try {
    await withdrawalMailer("test", { name: "StowGUI", email: "license@stowgui.com" })({ ...body, locale: "de", declaration: "Hiermit widerrufe ich den unten bezeichneten Vertrag.", id: ID, received_at: NOW, sent_at: null, attempts: 1, next_attempt_at: NOW });
    const init = fetcher.mock.calls[0][1] as RequestInit;
    expect((init.headers as Record<string, string>)["Idempotency-Key"]).toBe(`withdrawal-${ID}-customer`);
    const message = JSON.parse(init.body as string);
    expect(message.to).toEqual([body.email]);
    expect(message.text).toContain("Hiermit widerrufe ich");
    expect(message.text).toContain(new Date(NOW * 1000).toISOString());
    expect(message.text).toContain(body.contract_reference);
    expect(message.html).toBeUndefined();
    expect(message.attachments).toBeUndefined();
    await withdrawalMailer("test", { name: "StowGUI", email: "license@stowgui.com" }, "support")({ ...body, locale: "de", declaration: "Hiermit widerrufe ich den unten bezeichneten Vertrag.", id: ID, received_at: NOW, sent_at: null, attempts: 1, next_attempt_at: NOW });
    const notificationInit = fetcher.mock.calls[1][1];
    expect((notificationInit.headers as Record<string, string>)["Idempotency-Key"]).toBe(`withdrawal-${ID}-support`);
    expect(JSON.parse(notificationInit.body as string)).toMatchObject({ to: ["support@trainvent.com"], reply_to: body.email, subject: "Neue Widerrufserklärung" });
  } finally { vi.unstubAllGlobals(); }
});
