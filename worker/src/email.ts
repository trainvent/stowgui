const BREVO_URL = "https://api.brevo.com/v3/smtp/email";
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
      `Thank you for buying StowGUI!\n\nYour license key:\n\n${keys}\n\nDownload StowGUI: ${download}\nThen open Settings → License and activate the key online.\n\nYou can use it on up to 3 computers for personal or commercial use. All 1.x versions are included. Each successful online license check gives you up to 30 days offline. Keep this email to find your key later.\n\nQuestions? Just reply to this email.`,
  },
  de: {
    subject: "Dein StowGUI-Lizenzschlüssel",
    body: (keys: string, download: string) =>
      `Danke für deinen Kauf von StowGUI!\n\nDein Lizenzschlüssel:\n\n${keys}\n\nStowGUI herunterladen: ${download}\nÖffne dann Einstellungen → Lizenz und aktiviere den Schlüssel online.\n\nDu kannst ihn privat oder gewerblich auf bis zu 3 Computern nutzen. Alle 1.x-Versionen sind enthalten. Jede erfolgreiche Online-Lizenzprüfung ermöglicht bis zu 30 Tage Offline-Nutzung. Heb diese E-Mail auf, um den Schlüssel später wiederzufinden.\n\nFragen? Antworte einfach auf diese E-Mail.`,
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

export type Mailer = (to: string, locale: Locale, licenseKeys: string[]) => Promise<void>;

export type Sender = { name: string; email: string };

export function brevoMailer(apiKey: string, sender: Sender, downloadUrl: string, replyTo = "support@trainvent.com"): Mailer {
  return async (to, locale, licenseKeys) => {
    const message = MESSAGES[locale];
    const download = locale === "de" ? downloadUrl.replace("/en/", "/de/") : downloadUrl;
    const text = message.body(licenseKeys.join("\n\n"), download);
    const response = await fetch(BREVO_URL, {
      method: "POST",
      headers: { "api-key": apiKey, "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        sender,
        // No open or click tracking: anonymise it, and drop the pixel where the plan allows.
        to: [{ email: to, contactPixelTrackingConsent: false, removeTrackingPixel: true }],
        replyTo: { email: replyTo },
        subject: message.subject,
        textContent: text,
        htmlContent: htmlBody(text, licenseKeys, locale),
      }),
    });
    if (!response.ok) throw new Error(`Email failed: ${response.status} ${await response.text()}`);
  };
}
