import type { Metadata } from "next";
import "@trainvent/arcubic/styles.css";
import "./globals.css";
import ThemeProvider from "./components/ThemeProvider";
import { getDictionary } from "@/dictionaries";
import { locales, localePath } from "@/lib/i18n";

export const metadata: Metadata = { title: "404 · StowGUI" };

export default function GlobalNotFound() {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <main className="page narrow not-found">
            <p className="wordmark">
              Stow<span>GUI</span>
            </p>
            {locales.map((locale) => {
              const text = getDictionary(locale).notFound;
              return (
                <section key={locale} lang={locale}>
                  <h1>{text.title}</h1>
                  <a href={localePath(locale)}>{text.back}</a>
                </section>
              );
            })}
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}
