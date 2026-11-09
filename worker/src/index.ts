import { createApp } from "./app";
import { resendMailer } from "./email";
import type { Env } from "./env";
import { importSigningKey } from "./license";
import { d1Store } from "./store";

export default {
  fetch(request: Request, env: Env): Promise<Response> {
    const app = createApp({
      store: d1Store(env.DB),
      mail: resendMailer(env.RESEND_API_KEY, env.EMAIL_FROM, env.DOWNLOAD_URL),
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
