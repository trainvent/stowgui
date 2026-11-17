import { d1Activations } from "./activation";
import { createApp } from "./app";
import { resendMailer, type Sender } from "./email";
import type { Env } from "./env";
import { importSigningKey } from "./license";
import { d1Store } from "./store";
import { d1Withdrawals, retryWithdrawals, withdrawalHandler, withdrawalMailer } from "./withdrawal";

const now = () => Math.floor(Date.now() / 1000);
const sender = (env: Env): Sender => ({ name: env.EMAIL_FROM_NAME, email: env.EMAIL_FROM_ADDRESS });
const origins = (env: Env) => env.ALLOWED_ORIGINS.split(",").map((origin) => origin.trim());

export function createWorker(transport: typeof fetch = fetch) {
  const receipts = (env: Env, recipient: "customer" | "support") =>
    ({ store: d1Withdrawals(env.DB, recipient), mail: withdrawalMailer(env.RESEND_API_KEY, sender(env), recipient, transport) });
  return {
    fetch(request: Request, env: Env): Promise<Response> {
      if (new URL(request.url).pathname === "/withdrawal") {
        return withdrawalHandler({
          ...receipts(env, "customer"),
          origins: origins(env),
          now,
          allow: async (ip) => (await env.ACTIVATION_LIMIT.limit({ key: `withdrawal:${ip}` })).success,
          notification: receipts(env, "support"),
        })(request);
      }
      const app = createApp({
        store: d1Store(env.DB),
        activations: d1Activations(env.DB),
        allowActivation: async (id) => (await env.ACTIVATION_LIMIT.limit({ key: id })).success,
        mail: resendMailer(env.RESEND_API_KEY, sender(env), env.DOWNLOAD_URL, undefined, transport),
        signingKey: () => importSigningKey(env.LICENSE_SIGNING_KEY),
        webhookSecret: env.STRIPE_WEBHOOK_SECRET,
        paymentLinkId: env.STRIPE_PAYMENT_LINK_ID,
        allowedOrigins: origins(env),
        now,
        newId: () => crypto.randomUUID(),
      });
      return app(request);
    },
    async scheduled(_event: ScheduledController, env: Env) {
      for (const recipient of ["customer", "support"] as const) {
        const { store, mail } = receipts(env, recipient);
        await retryWithdrawals(store, mail, now);
      }
    },
  } satisfies ExportedHandler<Env>;
}

export default createWorker();
