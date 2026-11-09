import type { Metadata } from "next";
import "@trainvent/arcubic/styles.css";
import "../globals.css";
import SiteFooter from "../components/SiteFooter";
import ThemeProvider from "../components/ThemeProvider";
import { SITE_URL } from "@/lib/config";
import { generateStaticParams, resolveLang, type LangParams } from "@/lib/params";

export { generateStaticParams };
export const dynamicParams = false;

export async function generateMetadata(props: LangParams): Promise<Metadata> {
  const { dict } = await resolveLang(props);
  return {
    metadataBase: new URL(SITE_URL),
    title: { default: dict.meta.title, template: "%s · StowGUI" },
    description: dict.meta.description,
  };
}

export default async function LangLayout(props: LangParams & { children: React.ReactNode }) {
  const { locale, dict } = await resolveLang(props);
  return (
    <html lang={locale} suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <div className="page">
            {props.children}
            <SiteFooter locale={locale} dict={dict} />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
