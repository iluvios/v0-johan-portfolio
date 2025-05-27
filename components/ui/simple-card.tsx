import Link from "next/link"
import { ArrowRight } from "lucide-react"

interface SimpleCardProps {
  title: string
  image: string
  href: string
  className?: string
}

export function SimpleCard({ title, image, href, className = "" }: SimpleCardProps) {
  return (
    <Link href={href} className={`group block ${className}`}>
      <div className="relative h-64 rounded-md overflow-hidden">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-300 group-hover:scale-105"
          style={{ backgroundImage: `url(${image})` }}
        />

        {/* Blue Gradient Overlay - covers 30% from bottom */}
        <div
          className="absolute inset-0 bg-gradient-to-t from-blue-600/80 via-blue-600/40 to-transparent"
          style={{
            background:
              "linear-gradient(to top, rgba(37, 99, 235, 0.8) 0%, rgba(37, 99, 235, 0.4) 30%, transparent 30%)",
          }}
        />

        {/* Content */}
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <h3 className="text-white font-semibold text-lg mb-2 group-hover:text-blue-200 transition-colors">{title}</h3>
          <div className="flex items-center text-blue-200 text-sm opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="mr-2">View Details</span>
            <ArrowRight size={16} />
          </div>
        </div>
      </div>
    </Link>
  )
}
