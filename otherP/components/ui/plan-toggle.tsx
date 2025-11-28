"use client"

import { Repeat } from "lucide-react"
import { cn } from "@/lib/utils"

interface PlanToggleProps {
  isPlan: boolean
  onToggle: () => void
  isVisible?: boolean
}

export function PlanToggle({ isPlan, onToggle, isVisible = true }: PlanToggleProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden p-3 rounded-xl transition-all duration-500 ease-out",
        isPlan
          ? "bg-gradient-to-r from-violet-500/20 to-purple-500/10 border border-violet-500/40 shadow-lg shadow-violet-500/10"
          : "bg-muted/30 border border-transparent hover:bg-muted/50",
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2",
      )}
    >
      <div
        className={cn(
          "absolute inset-0 bg-gradient-to-r from-violet-500/5 to-transparent transition-all duration-700",
          isPlan ? "opacity-100 scale-100" : "opacity-0 scale-95",
        )}
      />
      <div className="relative flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "p-2 rounded-lg transition-all duration-500",
              isPlan ? "bg-violet-500/30 rotate-0 scale-100" : "bg-muted rotate-180 scale-90",
            )}
          >
            <Repeat
              className={cn(
                "w-4 h-4 transition-all duration-500",
                isPlan ? "text-violet-400" : "text-muted-foreground",
              )}
            />
          </div>
          <div>
            <span
              className={cn(
                "text-sm font-medium transition-colors duration-300",
                isPlan ? "text-violet-400" : "text-foreground",
              )}
            >
              创建为计划
            </span>
            <p
              className={cn(
                "text-xs transition-all duration-300",
                isPlan ? "text-violet-400/70" : "text-muted-foreground opacity-70",
              )}
            >
              {isPlan ? "可设置重复周期和时间" : "单次任务"}
            </p>
          </div>
        </div>
        <button
          onClick={onToggle}
          className={cn(
            "relative w-14 h-8 rounded-full transition-all duration-500 ease-out",
            isPlan
              ? "bg-gradient-to-r from-violet-500 to-purple-500 shadow-lg shadow-violet-500/30"
              : "bg-muted hover:bg-muted/80",
          )}
        >
          <span
            className={cn(
              "absolute inset-0.5 rounded-full transition-all duration-500",
              isPlan ? "bg-violet-400/20" : "bg-transparent",
            )}
          />
          <span
            className={cn(
              "absolute top-1 w-6 h-6 rounded-full bg-white shadow-md transition-all duration-500 ease-out transform",
              isPlan ? "left-7 scale-110 shadow-violet-500/30" : "left-1 scale-100",
            )}
          >
            <span
              className={cn(
                "absolute inset-0 flex items-center justify-center transition-all duration-300",
                isPlan ? "opacity-100" : "opacity-0",
              )}
            >
              <Repeat className="w-3 h-3 text-violet-500" />
            </span>
          </span>
        </button>
      </div>
    </div>
  )
}
