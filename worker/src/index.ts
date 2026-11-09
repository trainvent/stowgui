import { createApp } from "./app";
import { brevoMailer } from "./email";
import type { Env } from "./env";
import { importSigningKey } from "./license";
import { d1Store } from "./store";

export default {
  fetch(request: Request, env: Env): Promise<Response> {
    const app = createApp({
      store: d1Store(env.DB),
      mail: brevoMailer(env.BREVO_API_KEY, { name: env.EMAIL_FROM_NAME, email: env.EMAIL_FROM_ADDRESS }, env.DOWNLOAD_URL),
      signingKey: () => importSigningKey(env.LICENSE_SIGNING_KEY),
      webhookSecret: env.STRIPE_WEBHOOK_SECRET,
      paymentLinkId: env.STRIPE_PAYMENT_LINK_ID,
      allowedOrigins: env.ALLOWED_ORIGINS.split(",").map((origin) => origin.trim()),
      now: () => Math.floor(Date.now() / 1000),
      newId: () => crypto.randomUUID(),
    });
    return app(request);
  },
} satisfies ExportedHandler<Env>;
