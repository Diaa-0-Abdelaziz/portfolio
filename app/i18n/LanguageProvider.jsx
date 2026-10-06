"use client";
import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import { translations, DEFAULT_LANG, LANG_COOKIE } from "./translations";

const LanguageContext = createContext({
  lang: DEFAULT_LANG,
  dir: "ltr",
  t: translations[DEFAULT_LANG],
  toggleLang: () => {},
});

export function LanguageProvider({ initialLang = DEFAULT_LANG, children }) {
  const [lang, setLang] = useState(initialLang);

  const toggleLang = useCallback(() => {
    const next = lang === "en" ? "ar" : "en";
    const dir = next === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = next;
    document.documentElement.dir = dir;
    document.title = translations[next].meta.title;
    document.cookie = `${LANG_COOKIE}=${next}; path=/; max-age=31536000; samesite=lax`;
    setLang(next);
  }, [lang]);

  const value = useMemo(
    () => ({
      lang,
      dir: lang === "ar" ? "rtl" : "ltr",
      t: translations[lang],
      toggleLang,
    }),
    [lang, toggleLang]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export const useLang = () => useContext(LanguageContext);
