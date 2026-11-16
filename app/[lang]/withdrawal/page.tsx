import WithdrawalForm from "../../components/WithdrawalForm";
import SiteHeader from "../../components/SiteHeader";
import { pageMetadata } from "@/lib/metadata";
import { resolveLang, type LangParams } from "@/lib/params";

export async function generateMetadata(props: LangParams) {
  const { locale, dict } = await resolveLang(props);
  return pageMetadata(locale, "/withdrawal", dict.withdrawal.title, dict.withdrawal.lead);
}

export default async function WithdrawalPage(props: LangParams) {
  const { locale, dict } = await resolveLang(props);
  return <>
    <SiteHeader locale={locale} dict={dict} currentPath="/withdrawal" />
    <main className="narrow">
      <h1>{dict.withdrawal.title}</h1>
      <p className="lead">{dict.withdrawal.lead}</p>
      <WithdrawalForm text={dict.withdrawal} locale={locale} />
    </main>
  </>;
}
