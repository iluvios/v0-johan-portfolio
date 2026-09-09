"use client";

import { useLanguage } from "@/contexts/language-context";

export default function LanguageToggle() {
  const { language, setLanguage } = useLanguage();
  return (
    <button
      type="button"
      className="language-switch"
      onClick={() => setLanguage(language === "en" ? "es" : "en")}
      aria-label={language === "en" ? "Cambiar a español" : "Switch to English"}
    >
      <span className={language === "en" ? "language-active" : undefined}>
        EN
      </span>
      <span aria-hidden="true" className="language-divider">
        /
      </span>
      <span className={language === "es" ? "language-active" : undefined}>
        ES
      </span>
    </button>
  );
}
