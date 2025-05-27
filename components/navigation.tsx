"use client"

import Link from "next/link"
import Image from "next/image"
import MenuComponent from "./menu"

export default function Navigation() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-sm border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center space-x-3">
            <Image
              src="/images/logo.png"
              alt="A.S. Johan Logo"
              width={120}
              height={40}
              className="h-8 w-auto logo-white"
              priority
            />
          </Link>

          <MenuComponent />
        </div>
      </div>
    </nav>
  )
}
