import { d1Activations } from "./activation";
import { createApp } from "./app";
import { resendMailer } from "./email";
import type { Env } from "./env";
import { importSigningKey } from "./license";
import { d1Store } from "./store";
import { d1Withdrawals, retryWithdrawals, withdrawalHandler, withdrawalMailer } from "./withdrawal";

export function createWorker(transport: typeof fetch = fetch) {
  return {
    fetch(request: Request, env: Env): Promise<Response> {
      if (new URL(request.url).pathname === "/withdrawal") {
        return withdrawalHandler({
          store: d1Withdrawals(env.DB),
          mail: withdrawalMailer(env.RESEND_API_KEY, { name: env.EMAIL_FROM_NAME, email: env.EMAIL_FROM_ADDRESS }, "customer", transport),
          origins: env.ALLOWED_ORIGINS.split(",").map((origin) => origin.trim()),
          now: () => Math.floor(Date.now() / 1000),
          allow: async (ip) => (await env.ACTIVATION_LIMIT.limit({ key: `withdrawal:${ip}` })).success,
          notification: {
            store: d1Withdrawals(env.DB, "support"),
            mail: withdrawalMailer(env.RESEND_API_KEY, { name: env.EMAIL_FROM_NAME, email: env.EMAIL_FROM_ADDRESS }, "support", transport),
          },
        })(request);
      }
      const app = createApp({
        store: d1Store(env.DB),
        activations: d1Activations(env.DB),
        allowActivation: async (id) => (await env.ACTIVATION_LIMIT.limit({ key: id })).success,
        mail: resendMailer(env.RESEND_API_KEY, { name: env.EMAIL_FROM_NAME, email: env.EMAIL_FROM_ADDRESS }, env.DOWNLOAD_URL, undefined, transport),
        signingKey: () => importSigningKey(env.LICENSE_SIGNING_KEY),
        webhookSecret: env.STRIPE_WEBHOOK_SECRET,
        paymentLinkId: env.STRIPE_PAYMENT_LINK_ID,
        allowedOrigins: env.ALLOWED_ORIGINS.split(",").map((origin) => origin.trim()),
        now: () => Math.floor(Date.now() / 1000),
        newId: () => crypto.randomUUID(),
      });
      return app(request);
    },
    async scheduled(_event: ScheduledController, env: Env) {
      for (const recipient of ["customer", "support"] as const) {
        await retryWithdrawals(d1Withdrawals(env.DB, recipient), withdrawalMailer(env.RESEND_API_KEY, { name: env.EMAIL_FROM_NAME, email: env.EMAIL_FROM_ADDRESS }, recipient, transport), () => Math.floor(Date.now() / 1000));
      }
    },
  } satisfies ExportedHandler<Env>;
}

export default createWorker();
