"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, ArrowUpRight } from "lucide-react";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { useLanguage } from "@/contexts/language-context";
import { useSite } from "@/contexts/site-context";
import { usePortfolioCopy } from "@/lib/portfolio";
import LanguageToggle from "./language-toggle";

export default function MenuComponent() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { language } = useLanguage();
  const { isAgency, config } = useSite();
  const { copy } = usePortfolioCopy();

  const items = isAgency
    ? language === "en"
      ? [
          { href: "/", label: "Home" },
          { href: "/services", label: "Services" },
          { href: "/projects", label: "Work" },
          { href: "/about", label: "About" },
        ]
      : [
          { href: "/", label: "Inicio" },
          { href: "/services", label: "Servicios" },
          { href: "/projects", label: "Casos" },
          { href: "/about", label: "Nosotros" },
        ]
    : language === "en"
      ? [
          { href: "/", label: "Home" },
          { href: "/projects", label: "Work" },
          { href: "/about", label: "About & CV" },
          { href: "/contact", label: "Let’s talk" },
        ]
      : [
          { href: "/", label: "Inicio" },
          { href: "/projects", label: "Proyectos" },
          { href: "/about", label: "Sobre mí y CV" },
          { href: "/contact", label: "Hablemos" },
        ];

  const mobileItems = isAgency
    ? [
        ...items,
        {
          href: "/contact",
          label: language === "en" ? "Start a project" : "Contacto",
        },
      ]
    : items;

  const ctaLabel = isAgency
    ? language === "en"
      ? "Start a project"
      : "Hablemos"
    : copy.talk;

  const active = (href: string) =>
    pathname === href || (href !== "/" && pathname.startsWith(`${href}/`));

  useEffect(() => {
    setOpen(false);
  }, [pathname]);
  useEffect(() => {
    const query = window.matchMedia("(min-width: 1024px)");
    const closeOnDesktop = () => {
      if (query.matches) setOpen(false);
    };
    query.addEventListener("change", closeOnDesktop);
    return () => query.removeEventListener("change", closeOnDesktop);
  }, []);

  return (
    <>
      <nav className="desktop-nav" aria-label={copy.navigation}>
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active(item.href) ? "page" : undefined}
          >
            {item.label}
          </Link>
        ))}
        <LanguageToggle />
        <Link
          href="/contact"
          className="nav-contact"
          aria-current={active("/contact") ? "page" : undefined}
        >
          {ctaLabel}
          <ArrowUpRight size={16} aria-hidden="true" />
        </Link>
      </nav>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <button
            type="button"
            className="mobile-menu-trigger"
            aria-label={copy.menu}
          >
            {copy.menu}
            <Menu size={20} aria-hidden="true" />
          </button>
        </SheetTrigger>
        <SheetContent
          closeLabel={copy.close}
          className="flex w-full flex-col overflow-y-auto sm:max-w-md"
          style={{
            paddingTop: "max(5rem, env(safe-area-inset-top))",
            paddingBottom: "max(2rem, env(safe-area-inset-bottom))",
          }}
        >
          <SheetHeader>
            <SheetTitle>{copy.navigation}</SheetTitle>
            <SheetDescription>{copy.menuDescription}</SheetDescription>
          </SheetHeader>
          <nav className="mobile-navigation" aria-label={copy.navigation}>
            {mobileItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                aria-current={active(item.href) ? "page" : undefined}
              >
                {item.label}
                <ArrowUpRight size={24} aria-hidden="true" />
              </Link>
            ))}
          </nav>
          <Separator />
          <LanguageToggle />
          <a href={`mailto:${config.email}`} className="text-link">
            {config.email}
            <ArrowUpRight size={16} aria-hidden="true" />
          </a>
        </SheetContent>
      </Sheet>
    </>
  );
}
