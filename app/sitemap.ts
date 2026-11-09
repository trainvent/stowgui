import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/config";
import { locales, localePath } from "@/lib/i18n";

export const dynamic = "force-static";

const PATHS = ["/", "/download", "/license", "/terms", "/privacy", "/imprint"];

export default function sitemap(): MetadataRoute.Sitemap {
  return PATHS.flatMap((path) =>
    locales.map((locale) => ({
      url: `${SITE_URL}${localePath(locale, path)}`,
      alternates: { languages: Object.fromEntries(locales.map((l) => [l, `${SITE_URL}${localePath(l, path)}`])) },
    })),
  );
}
