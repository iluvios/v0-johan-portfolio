"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";

export default function SiteShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  // When viewing /cv, render pure raw CV with zero website chrome, wrappers, or .site-main padding
  if (pathname === "/cv") {
    return <>{children}</>;
  }

  return (
    <>
      <Navigation />
      <main id="main-content" tabIndex={-1} className="site-main">
        {children}
      </main>
      <Footer />
    </>
  );
}
