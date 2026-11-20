"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";
import { AgencyBackdrop } from "@/components/agency/hero";
import { useSite } from "@/contexts/site-context";

export default function SiteShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { isAgency } = useSite();

  // /cv is the standalone, chrome-free CV for sharing and printing. /about shows the same CV inside the site.
  if (pathname === "/cv") {
    return <>{children}</>;
  }

  return (
    <>
      {isAgency && <AgencyBackdrop />}
      <Navigation />
      <main id="main-content" tabIndex={-1} className="site-main">
        {children}
      </main>
      <Footer />
    </>
  );
}
