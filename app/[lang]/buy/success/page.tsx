import { Button } from "@trainvent/arcubic";
import Link from "next/link";
import SiteHeader from "../../../components/SiteHeader";
import { localePath } from "@/lib/i18n";
import { pageMetadata } from "@/lib/metadata";
import { resolveLang, type LangParams } from "@/lib/params";

export async function generateMetadata(props: LangParams) {
  const { locale, dict } = await resolveLang(props);
  return { ...pageMetadata(locale, "/buy/success", dict.success.title), robots: { index: false } };
}

export default async function SuccessPage(props: LangParams) {
  const { locale, dict } = await resolveLang(props);
  const text = dict.success;
  return (
    <>
      <SiteHeader locale={locale} dict={dict} currentPath="/buy/success" />
      <main className="narrow">
        <h1>{text.title}</h1>
        <p className="lead">{text.lead}</p>
        <p>{text.next}</p>
        <div className="actions">
          <Button size="3" asChild>
            <Link href={localePath(locale, "/download")}>{dict.nav.download}</Link>
          </Button>
        </div>
        <p className="quiet">
          {text.noMail} <Link href={localePath(locale, "/license")}>{text.resend}</Link>
        </p>
      </main>
    </>
  );
}
