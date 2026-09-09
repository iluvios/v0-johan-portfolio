"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "outline" | "ghost";
  size?: "sm" | "default" | "lg";
  asChild?: boolean;
};

const GlowButton = React.forwardRef<HTMLButtonElement, Props>(
  function GlowButton(
    {
      children,
      className,
      variant = "default",
      size = "default",
      asChild = false,
      type = "button",
      ...props
    },
    ref,
  ) {
    const Component = asChild ? Slot : "button";
    const variants = {
      default: "glow-button--default",
      outline: "glow-button--outline",
      ghost: "glow-button--ghost",
    };
    const sizes = { default: "", sm: "glow-button--sm", lg: "glow-button--lg" };
    return (
      <Component
        ref={ref}
        type={asChild ? undefined : type}
        className={cn("glow-button", variants[variant], sizes[size], className)}
        {...props}
      >
        {children}
      </Component>
    );
  },
);

export { GlowButton };
