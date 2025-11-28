"use client"

import { cn } from "@/lib/utils"
import type { View } from "@/app/page"
import { useTodo } from "@/context/todo-context"
import { LayoutList, Star, CheckCircle2, Settings, Clock } from "lucide-react"

interface SidebarProps {
  currentView: View
  onViewChange: (view: View) => void
}

const navItems = [
  { id: "list" as View, label: "所有任务", icon: LayoutList },
  { id: "important" as View, label: "重要", icon: Star },
  { id: "completed" as View, label: "已完成", icon: CheckCircle2 },
  { id: "history" as View, label: "历程", icon: Clock },
]

export function Sidebar({ currentView, onViewChange }: SidebarProps) {
  const { todos, plans } = useTodo()

  const getCounts = (view: View) => {
    switch (view) {
      case "list":
        return todos.filter((t) => !t.completed).length + plans.filter((p) => p.active).length
      case "important":
        return (
          todos.filter((t) => t.important && !t.completed).length + plans.filter((p) => p.important && p.active).length
        )
      case "completed":
        return todos.filter((t) => t.completed).length
      case "history":
        return 0 // 历程不显示数量
      default:
        return 0
    }
  }

  return (
    <aside className="w-64 bg-sidebar border-r border-sidebar-border flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="font-semibold text-sidebar-foreground">Todo List</h1>
            <p className="text-xs text-muted-foreground">任务管理</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon
          const count = getCounts(item.id)
          const isActive = currentView === item.id

          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={cn(
                "w-full flex items-center justify-between px-3 py-2.5 rounded-md text-sm transition-colors",
                isActive
                  ? "bg-sidebar-accent text-sidebar-foreground"
                  : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground",
              )}
            >
              <div className="flex items-center gap-3">
                <Icon className={cn("w-4 h-4", isActive && "text-primary")} />
                <span>{item.label}</span>
              </div>
              {count > 0 && (
                <span
                  className={cn(
                    "text-xs px-2 py-0.5 rounded-full",
                    isActive ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
                  )}
                >
                  {count}
                </span>
              )}
            </button>
          )
        })}
      </nav>

      {/* Settings */}
      <div className="p-2 border-t border-sidebar-border">
        <button
          onClick={() => onViewChange("settings")}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors",
            currentView === "settings"
              ? "bg-sidebar-accent text-sidebar-foreground"
              : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground",
          )}
        >
          <Settings className={cn("w-4 h-4", currentView === "settings" && "text-primary")} />
          <span>设置</span>
        </button>
      </div>
    </aside>
  )
}
