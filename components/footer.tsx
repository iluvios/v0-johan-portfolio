"use client";

import Link from "next/link";
import { ArrowUpRight, ArrowUp } from "lucide-react";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/contexts/language-context";
import { useSite } from "@/contexts/site-context";

export default function Footer() {
  const { language } = useLanguage();
  const { isAgency, config } = useSite();
  const pathname = usePathname();

  if (pathname === "/cv") {
    return null;
  }

  return (
    <footer className="site-footer">
      <div className="page-shell footer-inner">
        <div className="flex flex-col gap-1">
          <span className="font-display text-lg font-medium">
            {isAgency ? "Energy Media." : "Johan Alvarez."}
          </span>
          <span className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} · Medellín, Colombia
            {isAgency ? ` · ${config.domain}` : ""}
          </span>
        </div>
        <div className="footer-links">
          <a href={`mailto:${config.email}`}>
            Email <ArrowUpRight size={16} aria-hidden="true" />
          </a>
          {isAgency ? (
            <>
              <Link href="/services">
                {language === "en" ? "Services" : "Servicios"}{" "}
                <ArrowUpRight size={16} aria-hidden="true" />
              </Link>
              <Link href="/#industries">
                {language === "en" ? "Industries" : "Industrias"}{" "}
                <ArrowUpRight size={16} aria-hidden="true" />
              </Link>
              <Link href="/projects">
                {language === "en" ? "Work" : "Casos"}{" "}
                <ArrowUpRight size={16} aria-hidden="true" />
              </Link>
            </>
          ) : (
            <>
              <a
                href={config.linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                LinkedIn <ArrowUpRight size={16} aria-hidden="true" />
              </a>
              <Link href="/about">
                CV <ArrowUpRight size={16} aria-hidden="true" />
              </Link>
            </>
          )}
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
