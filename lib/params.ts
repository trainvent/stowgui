import { notFound } from "next/navigation";
import { getDictionary } from "@/dictionaries";
import { hasLocale, locales } from "./i18n";

export type LangParams = { params: Promise<{ lang: string }> };

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export async function resolveLang({ params }: LangParams) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  return { locale: lang, dict: getDictionary(lang) };
}
