"use client"

import type React from "react"
import { cn } from "@/lib/utils"

interface AnimatedFieldProps {
  delay: number
  isVisible: boolean
  children: React.ReactNode
  className?: string
}

export function AnimatedField({ delay, isVisible, children, className }: AnimatedFieldProps) {
  return (
    <div
      className={cn(
        "space-y-2 transition-all duration-300",
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2",
        className,
      )}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  )
}
