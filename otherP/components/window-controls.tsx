"use client"

import { useState } from "react"
import { getCurrentWindow } from "@tauri-apps/api/window"
import { Pin, Minimize2, Maximize2, Square, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface WindowControlsProps {
  className?: string
}

export function WindowControls({ className }: WindowControlsProps) {
  const [isPinned, setIsPinned] = useState(false)
  const [isMaximized, setIsMaximized] = useState(false)

  return (
    <div className={cn("flex items-center gap-0.5 no-drag", className)}>
      {/* 置顶按钮 */}
      <button
        onClick={async () => {
          const win = getCurrentWindow()
          const next = !isPinned
          setIsPinned(next)
          await win.setAlwaysOnTop(next)
        }}
        className={cn(
          "group relative flex items-center justify-center w-11 h-9",
          "transition-all duration-200 ease-out",
          "hover:bg-secondary/80",
          isPinned && "bg-primary/20",
        )}
        title={isPinned ? "取消置顶" : "置顶窗口"}
      >
        <Pin
          className={cn(
            "w-4 h-4 transition-all duration-200",
            "text-muted-foreground group-hover:text-foreground",
            isPinned && "text-primary rotate-45",
          )}
        />
        {isPinned && <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />}
      </button>

      {/* 最小化按钮 */}
      <button
        onClick={async () => {
          const win = getCurrentWindow()
          await win.minimize()
        }}
        className={cn(
          "group flex items-center justify-center w-11 h-9",
          "transition-all duration-200 ease-out",
          "hover:bg-secondary/80",
        )}
        title="最小化"
      >
        <Minimize2
          className={cn(
            "w-4 h-4 transition-all duration-200",
            "text-muted-foreground group-hover:text-foreground group-hover:scale-90",
          )}
        />
      </button>

      {/* 最大化/还原按钮 */}
      <button
        onClick={async () => {
          const win = getCurrentWindow()
          await win.toggleMaximize()
          setIsMaximized(!isMaximized)
        }}
        className={cn(
          "group flex items-center justify-center w-11 h-9",
          "transition-all duration-200 ease-out",
          "hover:bg-secondary/80",
        )}
        title={isMaximized ? "还原窗口" : "最大化"}
      >
        {isMaximized ? (
          <Square
            className={cn(
              "w-3.5 h-3.5 transition-all duration-200",
              "text-muted-foreground group-hover:text-foreground group-hover:scale-110",
            )}
          />
        ) : (
          <Maximize2
            className={cn(
              "w-4 h-4 transition-all duration-200",
              "text-muted-foreground group-hover:text-foreground group-hover:scale-110",
            )}
          />
        )}
      </button>

      {/* 关闭按钮 */}
      <button
        onClick={async () => {
          const win = getCurrentWindow()
          await win.close()
        }}
        className={cn(
          "group flex items-center justify-center w-11 h-9",
          "transition-all duration-200 ease-out",
          "hover:bg-destructive",
        )}
        title="关闭"
      >
        <X
          className={cn(
            "w-4 h-4 transition-all duration-200",
            "text-muted-foreground group-hover:text-white group-hover:scale-110",
          )}
        />
      </button>
    </div>
  )
}
