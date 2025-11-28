"use client"

import { Repeat } from "lucide-react"
import { cn } from "@/lib/utils"

interface RepeatToggleProps {
  isRepeating: boolean
  onToggle: () => void
  disabled?: boolean
  title?: string
  subtitle?: string
}

export function RepeatToggle({
  isRepeating,
  onToggle,
  disabled = false,
  title = "周期重复",
  subtitle,
}: RepeatToggleProps) {
  const defaultSubtitle = isRepeating ? "计划会按周期自动重置" : "计划完成后不再重复"

  return (
    <div
      className={cn(
        "relative overflow-hidden p-3 rounded-xl transition-all duration-500 ease-out",
        isRepeating
          ? "bg-gradient-to-r from-violet-500/20 to-purple-500/10 border border-violet-500/40"
          : "bg-muted/30 border border-transparent hover:bg-muted/50",
        disabled && "opacity-50",
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className={cn("p-2 rounded-lg transition-all duration-500", isRepeating ? "bg-violet-500/30" : "bg-muted")}
          >
            <Repeat
              className={cn(
                "w-4 h-4 transition-all duration-500",
                isRepeating ? "text-violet-400" : "text-muted-foreground",
              )}
            />
          </div>
          <div>
            <span
              className={cn(
                "text-sm font-medium transition-colors duration-300",
                isRepeating ? "text-violet-400" : "text-foreground",
              )}
            >
              {title}
            </span>
            <p
              className={cn(
                "text-xs transition-all duration-300",
                isRepeating ? "text-violet-400/70" : "text-muted-foreground opacity-70",
              )}
            >
              {subtitle || defaultSubtitle}
            </p>
          </div>
        </div>
        <button
          onClick={() => !disabled && onToggle()}
          disabled={disabled}
          className={cn(
            "relative w-12 h-7 rounded-full transition-all duration-500 ease-out",
            isRepeating
              ? "bg-gradient-to-r from-violet-500 to-purple-500 shadow-lg shadow-violet-500/30"
              : "bg-muted hover:bg-muted/80",
            disabled && "cursor-not-allowed",
          )}
        >
          <span
            className={cn(
              "absolute top-1 w-5 h-5 rounded-full bg-white shadow-md transition-all duration-500 ease-out",
              isRepeating ? "left-6" : "left-1",
            )}
          />
        </button>
      </div>
    </div>
  )
}
