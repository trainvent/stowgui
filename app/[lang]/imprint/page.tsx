import SiteHeader from "../../components/SiteHeader";
import { COMPANY } from "@/lib/config";
import { pageMetadata } from "@/lib/metadata";
import { resolveLang, type LangParams } from "@/lib/params";

export async function generateMetadata(props: LangParams) {
  const { locale, dict } = await resolveLang(props);
  return pageMetadata(locale, "/imprint", dict.imprint.title);
}

export default async function ImprintPage(props: LangParams) {
  const { locale, dict } = await resolveLang(props);
  const text = dict.imprint;
  return (
    <>
      <SiteHeader locale={locale} dict={dict} currentPath="/imprint" />
      <main className="narrow prose">
        <h1>{text.title}</h1>
        <p>{text.provider}</p>
        <address>
          <strong>
            {COMPANY.name}, {text.owner} {COMPANY.owner}
          </strong>
          <br />
          {COMPANY.street}
          <br />
          {COMPANY.city}, {text.country}
          <br />
          {text.phone}: {COMPANY.phone}
          <br />
          {text.email}: <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a>
          <br />
          {text.companyNumber}: {COMPANY.companyNumber}
          <br />
          {text.tradeRegister}: {COMPANY.tradeRegister}
          <br />
          {text.responsible}: {COMPANY.responsible}
        </address>
        <p>{text.vat}</p>
        <p>{text.dispute}</p>
      </main>
    </>
  );
}
