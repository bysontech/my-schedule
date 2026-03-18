import { createContext, useContext, useState, useCallback, useMemo } from "react";
import type { Locale, Translations } from "./types";
import { ja } from "./ja";
import { en } from "./en";

const LOCALE_KEY = "my-schedule-locale";

const translations: Record<Locale, Translations> = { ja, en };

function getInitialLocale(): Locale {
  const stored = localStorage.getItem(LOCALE_KEY);
  if (stored === "ja" || stored === "en") return stored;
  const browserLang = navigator.language.slice(0, 2);
  return browserLang === "ja" ? "ja" : "en";
}

interface I18nContextValue {
  locale: Locale;
  t: Translations;
  setLocale: (locale: Locale) => void;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(getInitialLocale);

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    localStorage.setItem(LOCALE_KEY, l);
    document.documentElement.lang = l;
  }, []);

  const value = useMemo(
    () => ({ locale, t: translations[locale], setLocale }),
    [locale, setLocale],
  );

  return (
    <I18nContext.Provider value={value}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}
