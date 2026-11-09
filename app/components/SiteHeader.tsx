import Link from "next/link";
import type { Dictionary } from "@/dictionaries";
import { RELEASED } from "@/lib/config";
import { localePath, type Locale } from "@/lib/i18n";
import { AppearanceToggle } from "./ThemeProvider";

type Props = { locale: Locale; dict: Dictionary; currentPath?: string };

export default function SiteHeader({ locale, dict, currentPath = "/" }: Props) {
  const home = localePath(locale);
  const otherLocale: Locale = locale === "en" ? "de" : "en";
  return (
    <header className="site-header">
      <Link href={home} className="wordmark">
        Stow<span>GUI</span>
      </Link>
      <nav className="site-nav">
        <Link href={`${home}#features`} className="nav-section">{dict.nav.features}</Link>
        <Link href={`${home}#pricing`} className="nav-section">{dict.nav.pricing}</Link>
        <Link href={`${home}#faq`} className="nav-section">{dict.nav.faq}</Link>
        {RELEASED && <Link href={localePath(locale, "/download")}>{dict.nav.download}</Link>}
        <Link href={localePath(otherLocale, currentPath)} hrefLang={otherLocale} lang={otherLocale}>
          {dict.nav.otherLanguage}
        </Link>
        <AppearanceToggle lightLabel={dict.nav.lightMode} darkLabel={dict.nav.darkMode} />
      </nav>
    </header>
  );
}
