import { expect, it } from "vitest";
import { Miniflare } from "miniflare";
import { readFile, readdir } from "node:fs/promises";
import { URL as NodeURL } from "node:url";
import sandbox, { type SandboxEnv } from "../src/sandbox";
import { checkoutCompleted, keyPair, webhookRequest, WEBHOOK_SECRET } from "./helpers";

it("hosts the isolated checkout/withdrawal flow, rejects live events, and protects captured messages", async () => {
  const mf = new Miniflare({ workers: [{ config: {
    name: "sandbox", compatibilityDate: "2026-11-01",
    manifest: { mainModule: "index.js", modules: { "index.js": { type: "esm", contents: "export default { fetch() { return new Response('ok'); } }" } } },
    env: { DB: { type: "d1", id: "sandbox-test" } },
  } }] });
  try {
    const db = await mf.getD1Database("DB");
    for (const directory of ["migrations", "sandbox-migrations"]) {
      const base = new NodeURL(`../${directory}/`, import.meta.url);
      for (const name of (await readdir(base)).filter(n => n.endsWith(".sql")).sort()) {
        const sql = await readFile(new NodeURL(name, base), "utf8");
        await db.batch(sql.split(";").map(s => s.trim()).filter(Boolean).map(s => db.prepare(s)));
      }
    }
    const keys = await keyPair();
    const env: SandboxEnv = {
      DB: db, ASSETS: { fetch: async () => new Response("static site"), connect: () => { throw new Error("unused"); } },
      ACTIVATION_LIMIT: { limit: async () => ({ success: true }) },
      ALLOWED_ORIGINS: "https://sandbox.test", EMAIL_FROM_NAME: "Sandbox", EMAIL_FROM_ADDRESS: "sandbox@example.invalid",
      DOWNLOAD_URL: "https://sandbox.test/en/download/", STRIPE_PAYMENT_LINK_ID: "plink_sandbox",
      STRIPE_WEBHOOK_SECRET: WEBHOOK_SECRET, LICENSE_SIGNING_KEY: keys.pkcs8, RESEND_API_KEY: "",
      SANDBOX_INBOX_TOKEN: "private-test-token",
    };
    const request = (path: string, init?: RequestInit) => sandbox.fetch(new Request(`https://sandbox.test${path}`, init), env);
    const health = await request("/health");
    expect(await health.json()).toEqual({ environment: "sandbox", product: "stowgui", email: "capture" });
    expect(health.headers.get("X-Robots-Tag")).toContain("noindex");
    expect(await (await request("/de/")).text()).toBe("static site");
    expect((await request("/sandbox/mail")).status).toBe(401);
    expect((await request("/stripe/webhook", { method: "POST", body: "unsigned" })).status).toBe(400);
    const checkout = { ...checkoutCompleted({ payment_link: "plink_sandbox", amount_total: 500, currency: "eur" }), livemode: false };
    const now = Math.floor(Date.now() / 1000);
    expect((await sandbox.fetch(await webhookRequest({ ...checkout, livemode: true }, now), env)).status).toBe(400);
    expect((await sandbox.fetch(await webhookRequest(checkout, now), env)).status).toBe(200);
    const count = async () => (await db.prepare("SELECT COUNT(*) AS n FROM sandbox_emails").first<{ n: number }>())!.n;
    expect(await count()).toBe(1);
    const login = await request("/sandbox/login", { method: "POST", headers: { Origin: "https://sandbox.test" }, body: JSON.stringify({ token: env.SANDBOX_INBOX_TOKEN }) });
    expect(login.status).toBe(204);
    expect(login.headers.get("Set-Cookie")).toContain("HttpOnly; Secure; SameSite=Strict");
    const cookie = login.headers.get("Set-Cookie")!.split(";")[0];
    const messages = await (await request("/sandbox/mail", { headers: { Cookie: cookie } })).json() as { id: string; attachments: string[] }[];
    expect(messages[0].attachments).toEqual(["StowGUI-terms-de.pdf", "StowGUI-privacy-de.pdf"]);
    expect((await request(`/sandbox/mail/${messages[0].id}/attachment/0`)).status).toBe(401);
    const pdf = await request(`/sandbox/mail/${messages[0].id}/attachment/0`, { headers: { Cookie: cookie } });
    expect(pdf.headers.get("Content-Type")).toBe("application/pdf");
    expect((await pdf.text()).startsWith("%PDF")).toBe(true);
    const withdrawal = { method: "POST", headers: { Origin: "https://sandbox.test", "Content-Type": "application/json", "Idempotency-Key": crypto.randomUUID() }, body: JSON.stringify({ name: "Test Buyer", email: "buyer@example.invalid", contract_reference: "Unknown test order", locale: "de" }) };
    expect((await request("/withdrawal", withdrawal)).status).toBe(202);
    expect((await request("/withdrawal", withdrawal)).status).toBe(202);
    expect(await count()).toBe(3);
    expect((await request("/sandbox/mail", { headers: { Cookie: "stowgui_sandbox_inbox=wrong" } })).status).toBe(401);
    expect((await request("/sandbox/login", { method: "POST", headers: { Origin: "https://other.test" }, body: JSON.stringify({ token: env.SANDBOX_INBOX_TOKEN }) })).status).toBe(403);
    expect((await request("/sandbox/login", { method: "POST", headers: { Origin: "https://sandbox.test" }, body: JSON.stringify({ token: "wrong" }) })).status).toBe(401);
    expect((await request("/sandbox/login", { method: "POST", headers: { Origin: "https://sandbox.test" }, body: "x".repeat(2000) })).status).toBe(413);
  } finally { await mf.dispose(); }
}, 15000);
