import { pickLocale, type Locale, type Mailer } from "./email";
import { newLicensePayload, signLicense } from "./license";
import type { LicenseRecord, LicenseStore } from "./store";
import { verifyStripeEvent } from "./stripe";

export const RESEND_COOLDOWN_SECONDS = 300;
const MAX_EMAIL_LENGTH = 254;

export type Deps = {
  store: LicenseStore;
  mail: Mailer;
  signingKey: () => Promise<CryptoKey>;
  webhookSecret: string;
  paymentLinkId: string;
  allowedOrigins: string[];
  now: () => number;
  newId: () => string;
};

type Obj = Record<string, unknown>;
const str = (value: unknown) => (typeof value === "string" ? value : null);

export function createApp(deps: Deps) {
  async function sendKeys(email: string, locale: Locale, records: LicenseRecord[]) {
    await deps.mail(email, locale, records.map((r) => r.license_key));
    for (const record of records) await deps.store.markEmailed(record.id, deps.now());
  }

  async function issueLicense(session: Obj): Promise<Response> {
    if (session.payment_status !== "paid") return new Response("ignored: unpaid");
    if (deps.paymentLinkId && session.payment_link !== deps.paymentLinkId) return new Response("ignored: other product");

    const sessionId = str(session.id);
    const details = (session.customer_details ?? {}) as Obj;
    const email = str(details.email)?.toLowerCase();
    if (!sessionId || !email) return new Response("missing session or email", { status: 400 });

    const existing = await deps.store.findBySession(sessionId);
    if (existing) {
      if (existing.last_email_at === null) await sendKeys(existing.email, existing.locale as Locale, [existing]);
      return new Response("already issued");
    }

    const id = deps.newId();
    const issued = deps.now();
    const record: LicenseRecord = {
      id,
      email,
      locale: pickLocale(session.locale, ((details.address ?? {}) as Obj).country),
      checkout_session: sessionId,
      payment_intent: str(session.payment_intent),
      license_key: await signLicense(newLicensePayload(id, issued), await deps.signingKey()),
      created_at: issued,
      revoked_at: null,
      last_email_at: null,
    };
    await deps.store.insert(record);
    await sendKeys(email, record.locale as Locale, [record]);
    return new Response("issued");
  }

  async function handleWebhook(request: Request): Promise<Response> {
    const payload = await request.text();
    const event = await verifyStripeEvent(payload, request.headers.get("Stripe-Signature"), deps.webhookSecret, deps.now());
    if (!event) return new Response("invalid signature", { status: 400 });
    const object = event.data.object;

    switch (event.type) {
      case "checkout.session.completed":
      case "checkout.session.async_payment_succeeded":
        return issueLicense(object);
      case "charge.refunded": {
        const paymentIntent = str(object.payment_intent);
        if (object.refunded === true && paymentIntent) await deps.store.revokeByPaymentIntent(paymentIntent, deps.now());
        return new Response("ok");
      }
      case "charge.dispute.created": {
        const paymentIntent = str(object.payment_intent);
        if (paymentIntent) await deps.store.revokeByPaymentIntent(paymentIntent, deps.now());
        return new Response("ok");
      }
      default:
        return new Response("ignored");
    }
  }

  async function handleResend(request: Request): Promise<Response> {
    let body: Obj;
    try {
      body = (await request.json()) as Obj;
    } catch {
      return new Response("invalid body", { status: 400 });
    }
    const email = str(body.email)?.trim().toLowerCase();
    if (!email || email.length > MAX_EMAIL_LENGTH || !email.includes("@")) return new Response("invalid email", { status: 400 });

    const records = await deps.store.findActiveByEmail(email);
    const cooledDown = records.filter((r) => r.last_email_at === null || deps.now() - r.last_email_at >= RESEND_COOLDOWN_SECONDS);
    if (cooledDown.length > 0) {
      const locale: Locale = body.locale === "de" ? "de" : "en";
      await sendKeys(email, locale, cooledDown);
    }
    return new Response(null, { status: 202 });
  }

  async function handleStatus(url: URL): Promise<Response> {
    const id = url.searchParams.get("id");
    const record = id ? await deps.store.findById(id) : null;
    if (!record) return Response.json({ error: "unknown license" }, { status: 404 });
    return Response.json({ active: record.revoked_at === null });
  }

  function cors(request: Request): Record<string, string> {
    const origin = request.headers.get("Origin");
    if (!origin || !deps.allowedOrigins.includes(origin)) return {};
    return {
      "Access-Control-Allow-Origin": origin,
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      Vary: "Origin",
    };
  }

  return async function fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const route = `${request.method} ${url.pathname}`;

    if (url.pathname === "/license/resend") {
      const headers = cors(request);
      if (request.method === "OPTIONS") return new Response(null, { status: 204, headers });
      if (request.method === "POST") {
        const response = await handleResend(request);
        return new Response(response.body, { status: response.status, headers });
      }
    }
    if (route === "POST /stripe/webhook") return handleWebhook(request);
    if (route === "GET /license/status") return handleStatus(url);
    return new Response("not found", { status: 404 });
  };
}
