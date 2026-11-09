import type { Metadata } from "next";
import { SITE_URL } from "./config";
import { locales, localePath, type Locale } from "./i18n";

export function pageMetadata(locale: Locale, path: string, title: string, description?: string): Metadata {
  return {
    title,
    description,
    alternates: {
      canonical: localePath(locale, path),
      languages: Object.fromEntries(locales.map((l) => [l, localePath(l, path)])),
    },
    openGraph: { title, description, url: `${SITE_URL}${localePath(locale, path)}`, siteName: "StowGUI", locale },
  };
}
