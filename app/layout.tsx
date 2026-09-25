import type { ReactNode } from "react";
import type { Metadata, Viewport } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import SiteShell from "@/components/site-shell";
import { LanguageProvider } from "@/contexts/language-context";
import { PortfolioMotion } from "@/components/portfolio-motion";
import { CONTACT_EMAIL, LINKEDIN_URL } from "@/lib/site";

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
    "Johan Alvarez builds the outbound, CRM, and attribution systems that turn campaigns into pipeline — Clay, Salesforce, HubSpot, n8n, and server-side tracking — after years of running the campaigns too. Open to GTM engineering roles; remote on US hours.",
  openGraph: {
    title: "Johan Alvarez — Senior Martech & GTM Engineer",
    description:
      "Growth marketing and GTM systems for recently funded startups: campaigns and creative, outbound, CRM and lifecycle automation, attribution, and AI-built MVPs.",
    url: "https://asjohan.com",
    siteName: "Johan Alvarez",
    type: "website",
  },
  twitter: { card: "summary_large_image" },
};
const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Johan Alvarez",
  jobTitle: "Senior Martech & GTM Engineer",
  url: "https://asjohan.com",
  email: `mailto:${CONTACT_EMAIL}`,
  sameAs: [LINKEDIN_URL],
  address: {
    "@type": "PostalAddress",
    addressLocality: "Medellín",
    addressCountry: "CO",
  },
  knowsLanguage: ["en", "es"],
  knowsAbout: [
    "GTM engineering",
    "Marketing automation",
    "Clay",
    "Salesforce",
    "HubSpot",
    "n8n",
    "Attribution",
    "Paid media",
  ],
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
        />
        <LanguageProvider>
          <PortfolioMotion>
            <SiteShell>{children}</SiteShell>
          </PortfolioMotion>
        </LanguageProvider>
      </body>
    </html>
  );
}
