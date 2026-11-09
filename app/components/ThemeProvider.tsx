"use client";

import { IconButton, Theme } from "@trainvent/arcubic";
import { Moon, Sun } from "lucide-react";
import { createContext, useContext, useEffect, useState } from "react";

type Appearance = "light" | "dark";
const STORAGE_KEY = "appearance";

const AppearanceContext = createContext({ dark: false, toggle: () => {} });

function readSaved(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<Appearance>("light");

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const sync = () => {
      const saved = readSaved();
      setMode(saved === "light" || saved === "dark" ? saved : media.matches ? "dark" : "light");
    };
    sync();
    media.addEventListener("change", sync);
    window.addEventListener("storage", sync);
    return () => {
      media.removeEventListener("change", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const toggle = () =>
    setMode((current) => {
      const next = current === "dark" ? "light" : "dark";
      try {
        localStorage.setItem(STORAGE_KEY, next);
      } catch {}
      return next;
    });

  return (
    <AppearanceContext.Provider value={{ dark: mode === "dark", toggle }}>
      <Theme appearance={mode} className="site-theme">
        {children}
      </Theme>
    </AppearanceContext.Provider>
  );
}

export function AppearanceToggle({ lightLabel, darkLabel }: { lightLabel: string; darkLabel: string }) {
  const { dark, toggle } = useContext(AppearanceContext);
  return (
    <IconButton variant="ghost" onClick={toggle} aria-label={dark ? lightLabel : darkLabel}>
      {dark ? <Sun size={18} /> : <Moon size={18} />}
    </IconButton>
  );
}
