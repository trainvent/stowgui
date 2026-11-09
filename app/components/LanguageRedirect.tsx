"use client";

import { useEffect } from "react";
import { defaultLocale, hasLocale, localePath } from "@/lib/i18n";

function preferredLocale() {
  for (const language of navigator.languages ?? [navigator.language]) {
    const code = language.slice(0, 2).toLowerCase();
    if (hasLocale(code)) return code;
  }
  return defaultLocale;
}

export default function LanguageRedirect({ path = "/" }: { path?: string }) {
  useEffect(() => {
    window.location.replace(localePath(preferredLocale(), path) + window.location.search);
  }, [path]);

  return (
    <p className="redirect-note">
      <a href={localePath("en", path)}>English</a> · <a href={localePath("de", path)}>Deutsch</a>
    </p>
  );
}
