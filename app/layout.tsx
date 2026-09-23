import type { ReactNode } from "react";
import type { Metadata, Viewport } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import SiteShell from "@/components/site-shell";
import { LanguageProvider } from "@/contexts/language-context";
import { PortfolioMotion } from "@/components/portfolio-motion";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});
const space = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://asjohan.com"),
  title: {
    default: "Johan Alvarez — Senior Martech & GTM Engineer",
    template: "%s | Johan Alvarez",
  },
  description:
    "Johan Alvarez runs the campaigns and builds the systems behind them: paid media, lifecycle email, and SEO, plus outbound, CRM, and attribution with Clay, n8n, Salesforce, and server-side tracking. Based in Medellín, working on US hours.",
  openGraph: {
    title: "Johan Alvarez — Senior Martech & GTM Engineer",
    description:
      "Growth marketing and GTM systems for recently funded startups: campaigns and creative, outbound, CRM and lifecycle automation, attribution, and AI-built MVPs.",
    url: "https://asjohan.com",
    siteName: "Johan Alvarez",
    type: "website",
  },
};
export const viewport: Viewport = {
  themeColor: "#080e1c",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      className={`dark bg-background ${inter.variable} ${space.variable}`}
    >
      <body className="min-h-screen bg-background font-sans text-foreground antialiased">
        <LanguageProvider>
          <PortfolioMotion>
            <SiteShell>{children}</SiteShell>
          </PortfolioMotion>
        </LanguageProvider>
      </body>
    </html>
  );
}
