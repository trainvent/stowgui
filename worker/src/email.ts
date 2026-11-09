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
      `Thank you for buying StowGUI!\n\nYour license key:\n\n${keys}\n\nDownload StowGUI: ${download}\nThen open Settings → License and paste the key.\n\nYou can use it on up to 3 computers. Keep this email to find your key later.\n\nQuestions? Just reply to this email.`,
  },
  de: {
    subject: "Dein StowGUI-Lizenzschlüssel",
    body: (keys: string, download: string) =>
      `Danke für deinen Kauf von StowGUI!\n\nDein Lizenzschlüssel:\n\n${keys}\n\nStowGUI herunterladen: ${download}\nÖffne dann Einstellungen → Lizenz und füge den Schlüssel ein.\n\nDu kannst ihn auf bis zu 3 Computern nutzen. Heb diese E-Mail auf, um den Schlüssel später wiederzufinden.\n\nFragen? Antworte einfach auf diese E-Mail.`,
  },
} as const;

export type Mailer = (to: string, locale: Locale, licenseKeys: string[]) => Promise<void>;

export type Sender = { name: string; email: string };

export function brevoMailer(apiKey: string, sender: Sender, downloadUrl: string, replyTo = "support@trainvent.com"): Mailer {
  return async (to, locale, licenseKeys) => {
    const message = MESSAGES[locale];
    const download = locale === "de" ? downloadUrl.replace("/en/", "/de/") : downloadUrl;
    const response = await fetch(BREVO_URL, {
      method: "POST",
      headers: { "api-key": apiKey, "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        sender,
        to: [{ email: to }],
        replyTo: { email: replyTo },
        subject: message.subject,
        textContent: message.body(licenseKeys.join("\n\n"), download),
      }),
    });
    if (!response.ok) throw new Error(`Email failed: ${response.status} ${await response.text()}`);
  };
}
