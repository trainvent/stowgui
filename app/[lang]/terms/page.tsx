import LegalPage from "../../components/LegalPage";
import SiteHeader from "../../components/SiteHeader";
import { pageMetadata } from "@/lib/metadata";
import { resolveLang, type LangParams } from "@/lib/params";

export async function generateMetadata(props: LangParams) {
  const { locale, dict } = await resolveLang(props);
  return pageMetadata(locale, "/terms", dict.terms.title);
}

export default async function Page(props: LangParams) {
  const { locale, dict } = await resolveLang(props);
  return (
    <>
      <SiteHeader locale={locale} dict={dict} currentPath="/terms" />
      <main className="narrow">
        <LegalPage title={dict.terms.title} sections={dict.terms.sections} />
      </main>
    </>
  );
}
