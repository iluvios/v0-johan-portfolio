"use client"

import { useLanguage } from "@/contexts/language-context"
import { Button } from "@/components/ui/button"
import { Globe } from "lucide-react"

export default function LanguageToggle() {
  const { language, setLanguage } = useLanguage()

  const toggleLanguage = () => {
    setLanguage(language === "en" ? "es" : "en")
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleLanguage}
      className="nav-item text-sm font-medium transition-colors relative group text-gray-300 hover:text-blue-400"
    >
      <Globe size={16} className="mr-2" />
      <span className="nav-item__content">{language.toUpperCase()}</span>
    </Button>
  )
}
