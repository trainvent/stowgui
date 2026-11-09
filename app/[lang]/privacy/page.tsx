import LegalPage from "../../components/LegalPage";
import SiteHeader from "../../components/SiteHeader";
import { pageMetadata } from "@/lib/metadata";
import { resolveLang, type LangParams } from "@/lib/params";

export async function generateMetadata(props: LangParams) {
  const { locale, dict } = await resolveLang(props);
  return pageMetadata(locale, "/privacy", dict.privacy.title);
}

export default async function Page(props: LangParams) {
  const { locale, dict } = await resolveLang(props);
  return (
    <>
      <SiteHeader locale={locale} dict={dict} currentPath="/privacy" />
      <main className="narrow">
        <LegalPage title={dict.privacy.title} sections={dict.privacy.sections} />
      </main>
    </>
  );
}
