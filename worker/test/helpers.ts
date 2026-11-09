import { encode } from "../src/base64url";
import type { Deps } from "../src/app";
import type { LicenseRecord, LicenseStore } from "../src/store";
import { stripeSignature } from "../src/stripe";

export const WEBHOOK_SECRET = "whsec_test";
export const NOW = 1_800_000_000;

export async function keyPair() {
  const pair = (await crypto.subtle.generateKey({ name: "Ed25519" }, true, ["sign", "verify"])) as CryptoKeyPair;
  return {
    ...pair,
    pkcs8: encode(new Uint8Array((await crypto.subtle.exportKey("pkcs8", pair.privateKey)) as ArrayBuffer)),
    raw: encode(new Uint8Array((await crypto.subtle.exportKey("raw", pair.publicKey)) as ArrayBuffer)),
  };
}

export function memoryStore(): LicenseStore & { records: LicenseRecord[] } {
  const records: LicenseRecord[] = [];
  return {
    records,
    findBySession: async (s) => records.find((r) => r.checkout_session === s) ?? null,
    findActiveByEmail: async (e) => records.filter((r) => r.email === e && r.revoked_at === null),
    findById: async (id) => records.find((r) => r.id === id) ?? null,
    insert: async (r) => void records.push({ ...r }),
    revokeByPaymentIntent: async (pi, at) => {
      const hits = records.filter((r) => r.payment_intent === pi && r.revoked_at === null);
      hits.forEach((r) => (r.revoked_at = at));
      return hits.length;
    },
    markEmailed: async (id, at) => {
      const r = records.find((x) => x.id === id);
      if (r) r.last_email_at = at;
    },
  };
}

export async function testDeps(overrides: Partial<Deps> = {}) {
  const keys = await keyPair();
  const store = memoryStore();
  const mails: { to: string; locale: string; keys: string[] }[] = [];
  let clock = NOW;
  let ids = 0;
  const deps: Deps = {
    store,
    mail: async (to, locale, licenseKeys) => void mails.push({ to, locale, keys: licenseKeys }),
    signingKey: async () => keys.privateKey,
    webhookSecret: WEBHOOK_SECRET,
    paymentLinkId: "",
    allowedOrigins: ["https://stowgui.com"],
    now: () => clock,
    newId: () => `lic_${++ids}`,
    ...overrides,
  };
  return { deps, store, mails, keys, advance: (seconds: number) => (clock += seconds) };
}

export async function webhookRequest(event: object, timestamp = NOW, secret = WEBHOOK_SECRET) {
  const payload = JSON.stringify(event);
  const signature = await stripeSignature(payload, timestamp, secret);
  return new Request("https://license.stowgui.com/stripe/webhook", {
    method: "POST",
    headers: { "Stripe-Signature": `t=${timestamp},v1=${signature}` },
    body: payload,
  });
}

export function checkoutCompleted(overrides: Record<string, unknown> = {}) {
  return {
    id: "evt_1",
    type: "checkout.session.completed",
    data: {
      object: {
        id: "cs_test_1",
        payment_status: "paid",
        payment_intent: "pi_1",
        payment_link: "plink_1",
        locale: "auto",
        customer_details: { email: "Buyer@Example.com", address: { country: "DE" } },
        ...overrides,
      },
    },
  };
}
