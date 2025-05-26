"use client"

import type React from "react"
import type { MouseEventHandler, ReactNode } from "react"
import { cn } from "@/lib/utils"

type Props = {
  children: ReactNode
  onClick?: MouseEventHandler<HTMLButtonElement>
  className?: string
  variant?: "default" | "outline" | "ghost"
  size?: "sm" | "default" | "lg"
  asChild?: boolean
  disabled?: boolean
}

const GlowButton: React.FC<Props> = ({
  children,
  onClick,
  className,
  variant = "default",
  size = "default",
  disabled = false,
  ...props
}) => {
  const baseClasses =
    "glow-button relative inline-flex items-center justify-center font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:pointer-events-none disabled:opacity-50 cursor-pointer"

  const variantClasses = {
    default: "",
    outline: "glow-button--outline",
    ghost: "glow-button--ghost",
  }

  const sizeClasses = {
    sm: "glow-button--sm",
    default: "glow-button--default",
    lg: "glow-button--lg",
  }

  return (
    <button
      className={cn(baseClasses, variantClasses[variant], sizeClasses[size], className)}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      <span className="glow-button__content">{children}</span>
    </button>
  )
}

export { GlowButton }
