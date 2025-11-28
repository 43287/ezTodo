"use client"

import type React from "react"

import { ChevronDown, ChevronUp } from "lucide-react"
import { cn } from "@/lib/utils"

interface NumberStepperProps {
  value: number | string
  onChange: (value: string) => void
  min?: number
  max?: number
  placeholder?: string
  disabled?: boolean
  allowEmpty?: boolean
}

export function NumberStepper({
  value,
  onChange,
  min = 1,
  max = 999,
  placeholder,
  disabled = false,
  allowEmpty = false,
}: NumberStepperProps) {
  const numValue = typeof value === "string" ? (value === "" ? null : Number.parseInt(value)) : value
  const canDecrement = numValue !== null && numValue > min
  const canIncrement = numValue === null || numValue < max

  const handleDecrement = () => {
    if (disabled) return
    if (numValue === null) {
      onChange(min.toString())
    } else if (numValue > min) {
      onChange((numValue - 1).toString())
    }
  }

  const handleIncrement = () => {
    if (disabled) return
    if (numValue === null) {
      onChange(min.toString())
    } else if (numValue < max) {
      onChange((numValue + 1).toString())
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    if (val === "" && allowEmpty) {
      onChange("")
    } else {
      const num = Number.parseInt(val)
      if (!isNaN(num) && num >= min && num <= max) {
        onChange(num.toString())
      } else if (val === "") {
        onChange(allowEmpty ? "" : min.toString())
      }
    }
  }

  return (
    <div
      className={cn(
        "inline-flex items-center bg-input border border-border rounded-lg overflow-hidden transition-all duration-200",
        "focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary/50",
        disabled && "opacity-50 cursor-not-allowed",
      )}
    >
      <input
        type="text"
        inputMode="numeric"
        value={value}
        onChange={handleInputChange}
        placeholder={placeholder}
        disabled={disabled}
        className={cn(
          "w-14 h-9 text-center bg-transparent border-0 outline-none text-sm font-medium",
          "placeholder:text-muted-foreground/50",
          disabled && "cursor-not-allowed",
        )}
      />

      <div className="flex flex-col border-l border-border">
        <button
          type="button"
          onClick={handleIncrement}
          disabled={disabled || !canIncrement}
          className={cn(
            "w-7 h-[18px] flex items-center justify-center transition-all duration-150",
            "hover:bg-muted active:bg-muted/70",
            (!canIncrement || disabled) && "opacity-30 cursor-not-allowed hover:bg-transparent",
          )}
        >
          <ChevronUp className="w-3.5 h-3.5" />
        </button>
        <div className="h-px bg-border" />
        <button
          type="button"
          onClick={handleDecrement}
          disabled={disabled || !canDecrement}
          className={cn(
            "w-7 h-[18px] flex items-center justify-center transition-all duration-150",
            "hover:bg-muted active:bg-muted/70",
            (!canDecrement || disabled) && "opacity-30 cursor-not-allowed hover:bg-transparent",
          )}
        >
          <ChevronDown className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  )
}
