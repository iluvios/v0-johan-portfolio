import type { ReactNode } from "react";
import type { Metadata, Viewport } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import SiteShell from "@/components/site-shell";
import { SiteProvider } from "@/contexts/site-context";
import { LanguageProvider } from "@/contexts/language-context";
import { PortfolioMotion } from "@/components/portfolio-motion";
import { AGENCY_EMAIL, CONTACT_EMAIL, LINKEDIN_URL } from "@/lib/site";
import { getServerLanguage, getServerSite } from "@/lib/tenant-server";

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

export async function generateMetadata(): Promise<Metadata> {
  const site = await getServerSite();

  if (site === "energymedia") {
    return {
      metadataBase: new URL("https://energymedia.com.co"),
      title: {
        default: "Energy Media | Marketing for Small Businesses",
        template: "%s | Energy Media",
      },
      description:
        "An experienced marketing team for businesses with fewer than 20 people: ads, website, social media, email and follow up run as one connected system, with plans from $1,000 a month.",
      openGraph: {
        title: "Energy Media | Marketing for Small Businesses",
        description:
          "Ads, social media, email, websites, landing pages, tracking and CRM, built and run by one team that answers for new customers.",
        url: "https://energymedia.com.co",
        siteName: "Energy Media",
        type: "website",
      },
      twitter: { card: "summary_large_image" },
      icons: { icon: "/media/brand/energy-media-icon.png", apple: "/media/brand/energy-media-icon.png" },
    };
  }

  return {
    metadataBase: new URL("https://asjohan.com"),
    title: {
      default: "Johan Alvarez | Senior Growth Marketer",
      template: "%s | Johan Alvarez",
    },
    description:
      "Johan Alvarez is a growth team of one: he runs paid media, landing pages, lifecycle email and SEO, and builds the attribution, CRM and automation behind them. Open to growth marketing roles, remote on US hours.",
    openGraph: {
      title: "Johan Alvarez | Senior Growth Marketer",
      description:
        "Senior growth marketer: campaigns, landing pages, CRM and lifecycle automation, and attribution, with the case studies to show for it.",
      url: "https://asjohan.com",
      siteName: "Johan Alvarez",
      type: "website",
    },
    twitter: { card: "summary_large_image" },
  };
}

const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Johan Alvarez",
  jobTitle: "Senior Growth Marketer",
  url: "https://asjohan.com",
  image: "https://asjohan.com/images/johan-portrait.webp",
  email: `mailto:${CONTACT_EMAIL}`,
  sameAs: [LINKEDIN_URL],
  address: {
    "@type": "PostalAddress",
    addressLocality: "Medellín",
    addressCountry: "CO",
  },
  knowsLanguage: ["en", "es"],
  knowsAbout: [
    "Growth marketing",
    "Marketing automation",
    "Clay",
    "Salesforce",
    "HubSpot",
    "n8n",
    "Attribution",
    "Paid media",
  ],
};

const agencyJsonLd = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  name: "Energy Media",
  description:
    "Full funnel marketing for small businesses: ads, website, social media, email, chat and CRM built as one connected system and run by one team, for businesses in the US, Colombia and Latin America.",
  url: "https://energymedia.com.co",
  email: `mailto:${AGENCY_EMAIL}`,
  founder: {
    "@type": "Person",
    name: "Johan Alvarez",
    url: "https://asjohan.com",
  },
  address: {
    "@type": "PostalAddress",
    addressLocality: "Medellín",
    addressCountry: "CO",
  },
  areaServed: ["CO", "US", "LATAM"],
  availableLanguage: ["es", "en"],
};

export const viewport: Viewport = {
  themeColor: "#080e1c",
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  const [site, initialLanguage] = await Promise.all([
    getServerSite(),
    getServerLanguage(),
  ]);
  const jsonLd = site === "energymedia" ? agencyJsonLd : personJsonLd;

  return (
    <html
      lang={initialLanguage}
      data-site={site}
      className={`dark bg-background ${inter.variable} ${space.variable}`}
    >
      <body className="min-h-screen bg-background font-sans text-foreground antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <SiteProvider site={site}>
          <LanguageProvider initialLanguage={initialLanguage}>
            <PortfolioMotion>
              <SiteShell>{children}</SiteShell>
            </PortfolioMotion>
          </LanguageProvider>
        </SiteProvider>
      </body>
    </html>
  );
}
