import { createWorker } from "./index";
import type { Env } from "./env";
import { readBody } from "./http";
import { verifyStripeEvent } from "./stripe";

export interface SandboxEnv extends Env {
  ASSETS: Fetcher;
  SANDBOX_INBOX_TOKEN: string;
}
const INBOX_COOKIE = "stowgui_sandbox_inbox";
const COOKIE_SECONDS = 3600;
const MAX_LOGIN_BYTES = 1024;
const MAX_MAILS = 30;
const API_PATHS = new Set([
  "/stripe/webhook", "/withdrawal", "/license/status", "/license/resend",
  "/license/activate", "/license/check-in", "/license/devices",
  "/license/rename-device", "/license/deactivate-device",
]);

export function captureMail(env: SandboxEnv): typeof fetch {
  return async (_url, init) => {
    const id = crypto.randomUUID();
    await env.DB.prepare("INSERT INTO sandbox_emails (id,received_at,message_json) VALUES (?,?,?)")
      .bind(id, Math.floor(Date.now() / 1000), String(init?.body)).run();
    return Response.json({ id });
  };
}

async function equalToken(actual: string, expected: string) {
  if (!expected) return false;
  const hash = async (value: string) => new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value)));
  const [a, b] = await Promise.all([hash(actual), hash(expected)]);
  let difference = 0;
  for (let i = 0; i < a.length; i++) difference |= a[i] ^ b[i];
  return difference === 0;
}

export async function sandboxFetch(request: Request, env: SandboxEnv): Promise<Response> {
  const url = new URL(request.url);
  const path = url.pathname;
  if (request.method === "GET" && path === "/health") return Response.json({ environment: "sandbox", product: "stowgui", email: "capture" });
  if (path === "/sandbox/login" && request.method === "POST") {
    if (request.headers.get("Origin") !== url.origin) return new Response("forbidden", { status: 403 });
    if (!(await env.ACTIVATION_LIMIT.limit({ key: `sandbox-login:${request.headers.get("CF-Connecting-IP") ?? "unknown"}` })).success) return new Response("rate limited", { status: 429 });
    const read = await readBody(request, MAX_LOGIN_BYTES);
    if ("error" in read) return read.error === "missing" ? new Response("invalid", { status: 400 }) : new Response("too large", { status: 413 });
    let token: unknown;
    try { token = (JSON.parse(read.text) as { token?: unknown }).token; } catch { return new Response("invalid", { status: 400 }); }
    if (typeof token !== "string" || !await equalToken(token, env.SANDBOX_INBOX_TOKEN)) return new Response("unauthorized", { status: 401 });
    return new Response(null, { status: 204, headers: { "Set-Cookie": `${INBOX_COOKIE}=${token}; Path=/sandbox/; HttpOnly; Secure; SameSite=Strict; Max-Age=${COOKIE_SECONDS}` } });
  }
  if (path === "/sandbox/mail" || path.startsWith("/sandbox/mail/")) {
    const token = request.headers.get("Cookie")?.split(";").map(v => v.trim()).find(v => v.startsWith(`${INBOX_COOKIE}=`))?.slice(INBOX_COOKIE.length + 1) ?? "";
    if (!await equalToken(token, env.SANDBOX_INBOX_TOKEN)) return new Response("unauthorized", { status: 401 });
    if (request.method !== "GET") return new Response("method", { status: 405 });
    if (path === "/sandbox/mail") {
      const records = (await env.DB.prepare("SELECT id,received_at,message_json FROM sandbox_emails ORDER BY received_at DESC, rowid DESC LIMIT ?").bind(MAX_MAILS).all<{ id: string; received_at: number; message_json: string }>()).results;
      return Response.json(records.map(r => {
        const mail = JSON.parse(r.message_json);
        return { id: r.id, received_at: r.received_at, to: mail.to, subject: mail.subject, text: mail.text,
          attachments: (mail.attachments ?? []).map((a: { filename: string }) => a.filename), hasHtml: Boolean(mail.html) };
      }));
    }
    const match = /^\/sandbox\/mail\/([0-9a-f-]+)\/(html|attachment\/(\d+))$/.exec(path);
    if (!match) return new Response("not found", { status: 404 });
    const row = await env.DB.prepare("SELECT message_json FROM sandbox_emails WHERE id = ?").bind(match[1]).first<{ message_json: string }>();
    if (!row) return new Response("not found", { status: 404 });
    const mail = JSON.parse(row.message_json);
    if (match[2] === "html") return new Response(mail.html ?? "", { headers: { "Content-Type": "text/html; charset=utf-8", "Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'; frame-ancestors 'self'" } });
    const attachment = mail.attachments?.[Number(match[3])];
    if (!attachment) return new Response("not found", { status: 404 });
    return new Response(Uint8Array.from(atob(attachment.content), c => c.charCodeAt(0)), { headers: { "Content-Type": "application/pdf" } });
  }
  if (path === "/stripe/webhook") {
    if (request.method !== "POST") return new Response("method", { status: 405 });
    const event = await verifyStripeEvent(await request.clone().text(), request.headers.get("Stripe-Signature"), env.STRIPE_WEBHOOK_SECRET);
    if (!event || event.livemode !== false) return new Response("sandbox accepts signed test events only", { status: 400 });
  }
  if (API_PATHS.has(path)) return createWorker(captureMail(env)).fetch(request, env);
  if (path.startsWith("/sandbox/")) return new Response("not found", { status: 404 });
  return env.ASSETS.fetch(request);
}

export default {
  async fetch(request: Request, env: SandboxEnv) {
    const response = await sandboxFetch(request, env);
    const result = new Response(response.body, response);
    result.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
    result.headers.set("Cache-Control", "no-store");
    return result;
  },
  async scheduled(event: ScheduledController, env: SandboxEnv) {
    await createWorker(captureMail(env)).scheduled(event, env);
  },
} satisfies ExportedHandler<SandboxEnv>;
