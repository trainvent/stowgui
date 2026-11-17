import { notFound } from "next/navigation";
import SandboxInbox from "../../components/SandboxInbox";
import SiteHeader from "../../components/SiteHeader";
import { SANDBOX } from "@/lib/config";
import { resolveLang, type LangParams } from "@/lib/params";

export default async function SandboxPage(props: LangParams) {
  if (!SANDBOX) notFound();
  const { locale, dict } = await resolveLang(props);
  return <>
    <SiteHeader locale={locale} dict={dict} currentPath="/sandbox" />
    <main className="narrow">
      <h1>{dict.sandbox.inbox}</h1>
      <p className="lead">{dict.sandbox.lead}</p>
      <SandboxInbox text={dict.sandbox} />
    </main>
  </>;
}
