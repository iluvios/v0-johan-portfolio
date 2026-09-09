"use client";

import { ArrowUpRight, ArrowUp } from "lucide-react";
import { useLanguage } from "@/contexts/language-context";

export default function Footer() {
  const { language } = useLanguage();
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
          <a href="mailto:jdsub16@gmail.com">
            Email <ArrowUpRight size={16} aria-hidden="true" />
          </a>
          <a
            href="https://linkedin.com/in/johanalvarez"
            target="_blank"
            rel="noopener noreferrer"
          >
            LinkedIn <ArrowUpRight size={16} aria-hidden="true" />
          </a>
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
