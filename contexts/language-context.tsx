"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { type Language, translations, getBrowserLanguage } from "@/lib/i18n";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: typeof translations.en;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined,
);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>("en");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Preserve the existing language preference; storage may be blocked in embedded browsers.
    let initialLang = getBrowserLanguage();
    try {
      const savedLang = localStorage.getItem("language");
      if (savedLang === "en" || savedLang === "es") initialLang = savedLang;
    } catch {}
    setLanguage(initialLang);
    setMounted(true);
  }, []);

  useEffect(() => {
    document.documentElement.lang = language;
    if (mounted) {
      try {
        localStorage.setItem("language", language);
      } catch {}
    }
  }, [language, mounted]);

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage: handleSetLanguage,
        t: translations[language],
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
