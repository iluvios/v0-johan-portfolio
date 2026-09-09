"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import MenuComponent from "./menu";
import { useLanguage } from "@/contexts/language-context";

export default function Navigation() {
  const { language } = useLanguage();
  const pathname = usePathname();

  if (pathname === "/cv") {
    return null;
  }

  return (
    <>
      <a className="skip-link" href="#main-content">
        {language === "en" ? "Skip to content" : "Ir al contenido"}
      </a>
      <header className="site-header">
        <div className="page-shell header-inner">
          <Link
            href="/"
            aria-label={
              language === "en"
                ? "Johan Alvarez — Home"
                : "Johan Alvarez — Inicio"
            }
            className="brand-link"
          >
            <Image
              src="/images/logo.png"
              alt="A.S. Johan"
              width={120}
              height={54}
              className="brand-logo"
              priority
            />
          </Link>
          <MenuComponent />
        </div>
      </header>
    </>
  );
}
