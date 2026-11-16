import legalAttachments from "./legal/attachments.json";

const RESEND_URL = "https://api.resend.com/emails";
const GERMAN_COUNTRIES = new Set(["DE", "AT", "CH", "LI"]);

export type Locale = "en" | "de";

export function pickLocale(stripeLocale: unknown, country: unknown): Locale {
  if (typeof stripeLocale === "string" && stripeLocale.startsWith("de")) return "de";
  if (typeof country === "string" && GERMAN_COUNTRIES.has(country)) return "de";
  return "en";
}

const MESSAGES = {
  en: {
    subject: "Your StowGUI license key",
    body: (keys: string, download: string) =>
      `Thank you for buying StowGUI!\n\nYour license key:\n\n${keys}\n\nDownload StowGUI: ${download}\nThen open Settings → License and activate the key online.\n\nYou can use it on up to 3 computers for personal or commercial use. All 1.x versions are included. Each successful online license check gives you up to 30 days offline. Keep this email to find your key later.\n\nThe attached PDFs contain the terms of sale, withdrawal notice and model form, and privacy notice. Keep them with this email.\n\nQuestions? Just reply to this email.`,
  },
  de: {
    subject: "Dein StowGUI-Lizenzschlüssel",
    body: (keys: string, download: string) =>
      `Danke für deinen Kauf von StowGUI!\n\nDein Lizenzschlüssel:\n\n${keys}\n\nStowGUI herunterladen: ${download}\nÖffne dann Einstellungen → Lizenz und aktiviere den Schlüssel online.\n\nDu kannst ihn privat oder gewerblich auf bis zu 3 Computern nutzen. Alle 1.x-Versionen sind enthalten. Jede erfolgreiche Online-Lizenzprüfung ermöglicht bis zu 30 Tage Offline-Nutzung. Heb diese E-Mail auf, um den Schlüssel später wiederzufinden.\n\nDie angehängten PDFs enthalten die AGB, die Widerrufsbelehrung mit Musterformular und die Datenschutzerklärung. Heb sie zusammen mit dieser E-Mail auf.\n\nFragen? Antworte einfach auf diese E-Mail.`,
  },
} as const;

const BODY_STYLE = "margin:0;padding:16px;font-family:Arial,sans-serif;font-size:16px;line-height:1.5;overflow-wrap:anywhere";
const CONTENT_STYLE = "width:100%;max-width:640px;margin:0 auto";
const PARAGRAPH_STYLE = "margin:0 0 16px";
const KEY_STYLE = `${PARAGRAPH_STYLE};font-family:monospace;white-space:normal;overflow-wrap:anywhere;word-break:break-all`;

function escapeHtml(text: string): string {
  return text.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#39;");
}

function htmlBody(text: string, keys: string[], locale: Locale): string {
  const paragraphs = text.split("\n\n").map((paragraph) => {
    const style = keys.includes(paragraph) ? KEY_STYLE : PARAGRAPH_STYLE;
    const content = escapeHtml(paragraph).replaceAll("\n", "<br>");
    return `<p style="${style}">${content}</p>`;
  }).join("\n");
  return `<!doctype html><html lang="${locale}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body style="${BODY_STYLE}"><div style="${CONTENT_STYLE}">${paragraphs}</div></body></html>`;
}

export type PurchaseConfirmation = {
  reference: string;
  amount: number;
  currency: string;
  acceptedText?: string;
};

export type Mailer = (to: string, locale: Locale, licenseKeys: string[], purchase?: PurchaseConfirmation) => Promise<void>;

function purchaseDetails(purchase: PurchaseConfirmation, locale: Locale): string {
  const amount = new Intl.NumberFormat(locale, { style: "currency", currency: purchase.currency }).format(purchase.amount / 100);
  const lines = locale === "de"
    ? [`Kaufreferenz: ${purchase.reference}`, `Gesamtbetrag: ${amount}`]
    : [`Purchase reference: ${purchase.reference}`, `Total paid: ${amount}`];
  if (purchase.acceptedText) lines.push(locale === "de" ? `Im Checkout bestätigte Erklärung: ${purchase.acceptedText}` : `Agreement accepted at checkout: ${purchase.acceptedText}`);
  return lines.join("\n\n");
}

export type Sender = { name: string; email: string };

export function resendMailer(apiKey: string, sender: Sender, downloadUrl: string, replyTo = "support@trainvent.com", transport: typeof fetch = fetch): Mailer {
  return async (to, locale, licenseKeys, purchase) => {
    const message = MESSAGES[locale];
    const download = locale === "de" ? downloadUrl.replace("/en/", "/de/") : downloadUrl;
    const text = [message.body(licenseKeys.join("\n\n"), download), purchase ? purchaseDetails(purchase, locale) : ""].filter(Boolean).join("\n\n");
    const response = await transport(RESEND_URL, {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        from: `${sender.name} <${sender.email}>`,
        to: [to],
        reply_to: replyTo,
        subject: message.subject,
        attachments: legalAttachments[locale].map(({ name, content }) => ({ filename: name, content })),
        text: text,
        html: htmlBody(text, licenseKeys, locale),
      }),
    });
    if (!response.ok) throw new Error(`Email failed: ${response.status} ${await response.text()}`);
  };
}
