export interface Env {
  DB: D1Database;
  ALLOWED_ORIGINS: string;
  EMAIL_FROM: string;
  DOWNLOAD_URL: string;
  STRIPE_PAYMENT_LINK_ID: string;
  STRIPE_WEBHOOK_SECRET: string;
  LICENSE_SIGNING_KEY: string;
  RESEND_API_KEY: string;
}
