import type { Metadata } from "next";
import "@trainvent/arcubic/styles.css";
import "../globals.css";
import ThemeProvider from "../components/ThemeProvider";
import { SITE_URL } from "@/lib/config";
import en from "@/dictionaries/en";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: en.meta.title,
  description: en.meta.description,
};

export default function RedirectLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <main className="page">{children}</main>
        </ThemeProvider>
      </body>
    </html>
  );
}
