"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import LanguageToggle from "./language-toggle"

export default function MenuComponent() {
  const [isOpen, setIsOpen] = useState(false)
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)
  const pathname = usePathname()
  const { t } = useLanguage()

  const navItems = [
    { href: "/", label: t.nav.home },
    { href: "/projects", label: t.nav.projects },
    { href: "/articles", label: t.nav.articles },
    { href: "/about", label: t.nav.about },
    { href: "/contact", label: t.nav.contact },
  ]

  return (
    <>
      {/* Desktop Navigation */}
      <div className="hidden md:flex items-center space-x-8">
        {navItems.map((item) => (
          <div key={item.href} className="relative">
            <Link
              href={item.href}
              className={`nav-item text-sm font-medium transition-colors relative group ${
                pathname === item.href ? "text-blue-400" : "text-gray-300"
              }`}
              onMouseEnter={() => setHoveredItem(item.label)}
              onMouseLeave={() => setHoveredItem(null)}
            >
              <span className="nav-item__content">
                {hoveredItem === item.label ? (
                  <span className="typing-effect" key={item.label}>
                    {item.label}
                  </span>
                ) : (
                  item.label
                )}
              </span>
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-400 transition-all group-hover:w-full"></span>
            </Link>

            {/* Tooltip */}
            <span className="nav-tooltip absolute -top-8 left-1/2 transform -translate-x-1/2 bg-slate-800 text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity border border-blue-500/20">
              {item.label}
            </span>
          </div>
        ))}

        <LanguageToggle />
      </div>

      {/* Mobile menu button */}
      <Button variant="ghost" size="sm" className="md:hidden" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </Button>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden absolute top-16 left-0 right-0 z-50">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-slate-800 rounded-lg mt-2 border border-blue-500/20 mx-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`nav-item-mobile block px-3 py-2 text-sm font-medium transition-colors relative ${
                  pathname === item.href ? "text-blue-400" : "text-gray-300"
                }`}
                onClick={() => setIsOpen(false)}
                onMouseEnter={() => setHoveredItem(item.label)}
                onMouseLeave={() => setHoveredItem(null)}
              >
                <span className="nav-item__content">
                  {hoveredItem === item.label ? (
                    <span className="typing-effect" key={item.label}>
                      {item.label}
                    </span>
                  ) : (
                    item.label
                  )}
                </span>
              </Link>
            ))}

            <div className="px-3 py-2">
              <LanguageToggle />
            </div>
          </div>
        </div>
      )}
    </>
  )
}
