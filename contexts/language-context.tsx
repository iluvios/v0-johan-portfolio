"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { type Language, getBrowserLanguage } from "@/lib/i18n";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined,
);

const MANUAL_STORAGE_KEY = "language_manual";
const LEGACY_STORAGE_KEY = "language";

export function LanguageProvider({
  initialLanguage = "en",
  children,
}: {
  initialLanguage?: Language;
  children: ReactNode;
}) {
  const [language, setLanguageState] = useState<Language>(initialLanguage);

  useEffect(() => {
    // Respect an explicit user choice first; otherwise keep the server's
    // GeoIP + Accept-Language detection (with browser + timezone refinement).
    try {
      const savedManual =
        localStorage.getItem(MANUAL_STORAGE_KEY) ||
        localStorage.getItem(LEGACY_STORAGE_KEY);
      if (savedManual === "en" || savedManual === "es") {
        setLanguageState(savedManual);
        return;
      }
    } catch {}

    const clientDetected = getBrowserLanguage(initialLanguage);
    if (clientDetected !== initialLanguage) {
      setLanguageState(clientDetected);
    }
  }, [initialLanguage]);

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const handleSetLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem(MANUAL_STORAGE_KEY, lang);
      localStorage.setItem(LEGACY_STORAGE_KEY, lang);
    } catch {}
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage: handleSetLanguage,
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
