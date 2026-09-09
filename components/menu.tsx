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
import { portfolioCopy } from "@/lib/i18n";
import LanguageToggle from "./language-toggle";

export default function MenuComponent() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { language } = useLanguage();
  const copy = portfolioCopy[language];
  const nav =
    language === "en"
      ? ["Home", "Work", "Notes", "About", "Let’s talk"]
      : ["Inicio", "Proyectos", "Notas", "Sobre mí", "Hablemos"];
  const items = ["/", "/projects", "/articles", "/about", "/contact"].map(
    (href, i) => ({ href, label: nav[i] }),
  );
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
        {items.slice(0, 4).map((item) => (
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
          {copy.talk}
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
            {items.map((item) => (
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
          <a href="mailto:jdsub16@gmail.com" className="text-link">
            jdsub16@gmail.com
            <ArrowUpRight size={16} aria-hidden="true" />
          </a>
        </SheetContent>
      </Sheet>
    </>
  );
}
