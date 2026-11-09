import LicenseForm from "../../components/LicenseForm";
import SiteHeader from "../../components/SiteHeader";
import { pageMetadata } from "@/lib/metadata";
import { resolveLang, type LangParams } from "@/lib/params";

export async function generateMetadata(props: LangParams) {
  const { locale, dict } = await resolveLang(props);
  return pageMetadata(locale, "/license", dict.license.title, dict.license.lead);
}

export default async function LicensePage(props: LangParams) {
  const { locale, dict } = await resolveLang(props);
  return (
    <>
      <SiteHeader locale={locale} dict={dict} currentPath="/license" />
      <main className="narrow">
        <h1>{dict.license.title}</h1>
        <p className="lead">{dict.license.lead}</p>
        <LicenseForm text={dict.license} locale={locale} />
      </main>
    </>
  );
}
