import type { ReactNode } from "react";
import type { Metadata, Viewport } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";
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
  title: {
    default: "Johan Alvarez — Strategy, technology & a little curiosity",
    template: "%s | Johan Alvarez",
  },
  description:
    "Marketing strategy meets digital craft. Explore Johan Alvarez’s work in marketing automation, digital experiences, and innovation. Based in Medellín, working beyond borders.",
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
            <Navigation />
            <main id="main-content" tabIndex={-1} className="site-main">
              {children}
            </main>
            <Footer />
          </PortfolioMotion>
        </LanguageProvider>
      </body>
    </html>
  );
}
