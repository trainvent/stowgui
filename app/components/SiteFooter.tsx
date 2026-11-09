import Link from "next/link";
import type { Dictionary } from "@/dictionaries";
import { COMPANY } from "@/lib/config";
import { localePath, type Locale } from "@/lib/i18n";

export default function SiteFooter({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  return (
    <footer className="site-footer">
      <span>© {new Date().getFullYear()} {COMPANY.name}</span>
      <nav>
        <Link href={localePath(locale, "/license")}>{dict.footer.lostKey}</Link>
        <Link href={localePath(locale, "/terms")}>{dict.footer.terms}</Link>
        <Link href={localePath(locale, "/privacy")}>{dict.footer.privacy}</Link>
        <Link href={localePath(locale, "/imprint")}>{dict.footer.imprint}</Link>
      </nav>
    </footer>
  );
}
