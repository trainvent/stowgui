const SIGNATURE_TOLERANCE_SECONDS = 300;

export type StripeEvent = { id: string; type: string; data: { object: Record<string, unknown> } };

function hex(bytes: ArrayBuffer): string {
  return [...new Uint8Array(bytes)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export async function stripeSignature(payload: string, timestamp: number, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return hex(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(`${timestamp}.${payload}`)));
}

/** Verifies the Stripe-Signature header and returns the parsed event, or null. */
export async function verifyStripeEvent(
  payload: string,
  header: string | null,
  secret: string,
  now = Math.floor(Date.now() / 1000),
): Promise<StripeEvent | null> {
  if (!header) return null;
  const parts = header.split(",").map((part) => part.split("=", 2) as [string, string]);
  const timestamp = Number(parts.find(([k]) => k === "t")?.[1]);
  const signatures = parts.filter(([k]) => k === "v1").map(([, v]) => v);
  if (!Number.isFinite(timestamp) || signatures.length === 0) return null;
  if (Math.abs(now - timestamp) > SIGNATURE_TOLERANCE_SECONDS) return null;
  const expected = await stripeSignature(payload, timestamp, secret);
  if (!signatures.some((signature) => timingSafeEqual(signature, expected))) return null;
  return JSON.parse(payload) as StripeEvent;
}
