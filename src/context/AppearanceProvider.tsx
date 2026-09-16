import type { ReactNode } from "react";

import { useCallback, useEffect, useMemo, useState } from "react";

import type { Language, Theme } from "../types";

import { AppearanceContext } from "./appearance-context";

type AppearanceProviderProps = {
  children: ReactNode;
};

export function AppearanceProvider({ children }: AppearanceProviderProps) {
  const [lang, setLang] = useState<Language>(() => {
    if (typeof window === "undefined") return "fa";
    const stored = localStorage.getItem("lang");
    return stored === "en" || stored === "fa" ? stored : "fa";
  });

  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === "undefined") return "light";
    const stored = localStorage.getItem("theme");
    if (stored === "dark" || stored === "light") return stored;
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  });

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "fa" ? "rtl" : "ltr";
    localStorage.setItem("lang", lang);
  }, [lang]);

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    document.documentElement.style.colorScheme = theme;
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = useCallback(
    () => setTheme(t => (t === "light" ? "dark" : "light")),
    []
  );

  const value = useMemo(
    () => ({ lang, setLang, theme, toggleTheme }),
    [lang, theme, toggleTheme]
  );

  return <AppearanceContext value={value}>{children}</AppearanceContext>;
}
