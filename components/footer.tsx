"use client";

import Link from "next/link";
import { ArrowUpRight, ArrowUp } from "lucide-react";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/contexts/language-context";
import { CONTACT_EMAIL, LINKEDIN_URL } from "@/lib/site";

export default function Footer() {
  const { language } = useLanguage();
  const pathname = usePathname();

  if (pathname === "/cv" || pathname === "/about") {
    return null;
  }

  return (
    <footer className="site-footer">
      <div className="page-shell footer-inner">
        <div className="flex flex-col gap-1">
          <span className="font-display text-lg font-medium">
            Johan Alvarez.
          </span>
          <span className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} · Medellín, Colombia
          </span>
        </div>
        <div className="footer-links">
          <a href={`mailto:${CONTACT_EMAIL}`}>
            Email <ArrowUpRight size={16} aria-hidden="true" />
          </a>
          <a href={LINKEDIN_URL} target="_blank" rel="noopener noreferrer">
            LinkedIn <ArrowUpRight size={16} aria-hidden="true" />
          </a>
          <Link href="/services">
            {language === "en" ? "Services" : "Servicios"}{" "}
            <ArrowUpRight size={16} aria-hidden="true" />
          </Link>
          <Link href="/about">
            CV <ArrowUpRight size={16} aria-hidden="true" />
          </Link>
          <a
            href="#main-content"
            aria-label={language === "en" ? "Back to top" : "Volver arriba"}
            className="back-top"
          >
            <ArrowUp size={18} aria-hidden="true" />
          </a>
        </div>
      </div>
    </footer>
  );
}
