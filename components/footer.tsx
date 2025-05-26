import Link from "next/link"
import { Linkedin, Mail } from "lucide-react"

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-slate-900/95 border-t border-slate-800 py-8 relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="text-sm text-gray-400 mb-4 md:mb-0">© Johan Alvarez {currentYear} | Innovation in Motion</div>

          <div className="flex space-x-6">
            <Link
              href="https://linkedin.com/in/johan-alvarez"
              className="text-gray-400 hover:text-blue-400 transition-colors ai-glow rounded-full p-2 border border-blue-500/20"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Linkedin size={20} />
            </Link>
            <Link
              href="mailto:jdsub16@gmail.com"
              className="text-gray-400 hover:text-blue-400 transition-colors ai-glow rounded-full p-2 border border-blue-500/20"
            >
              <Mail size={20} />
            </Link>
          </div>
        </div>

        <div className="text-center mt-4">
          <div className="text-xs text-gray-500 italic">"Connections maintained. Efficiency assured." - ALVA</div>
        </div>
      </div>
    </footer>
  )
}
