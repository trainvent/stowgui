import { createApp } from "./app";
import { d1Activations } from "./activation";
import { d1Store } from "./store";
import { brevoMailer } from "./email";
import { importSigningKey } from "./license";

export function localCheckout(db: D1Database, signingKey: string, webhookSecret: string, paymentLinkId: string, site: string, capture: typeof fetch) {
  return createApp({
    store: d1Store(db), activations: d1Activations(db), allowActivation: async () => true,
    mail: brevoMailer("local-preview", { name: "StowGUI Test", email: "license@stowgui.com" }, `${site}/en/download/`, "support@trainvent.com", capture),
    signingKey: () => importSigningKey(signingKey), webhookSecret, paymentLinkId,
    allowedOrigins: [site], now: () => Math.floor(Date.now() / 1000), newId: () => crypto.randomUUID(),
  });
}
