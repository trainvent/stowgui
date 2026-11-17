import SandboxInbox from "../../components/SandboxInbox";
import SiteHeader from "../../components/SiteHeader";
import { SANDBOX } from "@/lib/config";
import { resolveLang, type LangParams } from "@/lib/params";

export default async function SandboxPage(props: LangParams) {
  const { locale, dict } = await resolveLang(props);
  return <>
    <SiteHeader locale={locale} dict={dict} currentPath="/sandbox" />
    <main className="narrow">
      <h1>{dict.sandbox.inbox}</h1>
      {SANDBOX ? <><p className="lead">{dict.sandbox.lead}</p><SandboxInbox text={dict.sandbox} /></> : <p>{dict.sandbox.unavailable}</p>}
    </main>
  </>;
}
