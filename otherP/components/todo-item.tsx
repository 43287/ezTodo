"use client"

import { cn } from "@/lib/utils"
import { type Todo, useTodo } from "@/context/todo-context"
import { Star, Calendar, Trash2, AlertCircle, Clock, Repeat, CheckCircle2, Circle } from "lucide-react"
import { URGENCY_STYLES } from "@/lib/constants"
import type { UrgencyLevel } from "@/lib/utils/date"

interface TodoItemProps {
  todo: Todo
  onEdit: (id: string) => void
  isSelected: boolean
  urgency: UrgencyLevel
}

const urgencyIcons = {
  overdue: AlertCircle,
  urgent: AlertCircle,
  soon: Clock,
  normal: Calendar,
  none: Calendar,
}

export function TodoItem({ todo, onEdit, isSelected, urgency }: TodoItemProps) {
  const { toggleComplete, toggleImportant, deleteTodo } = useTodo()

  const urgencyStyle = URGENCY_STYLES[urgency]
  const UrgencyIcon = urgencyIcons[urgency]
  const isFromPlan = !!todo.fromPlanId

  return (
    <div
      className={cn(
        "group flex items-start gap-3 p-3 rounded-lg border cursor-pointer",
        "transition-all duration-200 ease-out",
        !todo.completed && isFromPlan && "border-l-4 border-l-violet-500",
        !todo.completed && !isFromPlan && urgencyStyle.border,
        !todo.completed && urgencyStyle.bg,
        isSelected
          ? "bg-card border-primary/50 scale-[1.01] shadow-md shadow-primary/5"
          : "bg-card/50 border-border hover:bg-card hover:border-border hover:scale-[1.005]",
        todo.completed && "opacity-60",
      )}
      onClick={() => onEdit(todo.id)}
    >
      <div
        className={cn(
          "mt-0.5 w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors",
          todo.completed
            ? "bg-green-500/20 text-green-400"
            : isFromPlan
              ? "bg-violet-500/20 text-violet-400"
              : urgency === "overdue" || urgency === "urgent"
                ? "bg-destructive/20 text-destructive"
                : urgency === "soon"
                  ? "bg-yellow-500/20 text-yellow-500"
                  : "bg-primary/20 text-primary",
        )}
      >
        {todo.completed ? (
          <CheckCircle2 className="w-4 h-4" />
        ) : isFromPlan ? (
          <Repeat className="w-4 h-4" />
        ) : (
          <Circle className="w-4 h-4" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p
            className={cn(
              "text-sm font-medium truncate transition-all duration-300",
              todo.completed && "line-through text-muted-foreground",
            )}
          >
            {todo.title}
          </p>
          {isFromPlan && (
            <span className="shrink-0 flex items-center gap-1 text-xs px-1.5 py-0.5 rounded-full bg-violet-500/20 text-violet-400">
              <Repeat className="w-3 h-3" />
              计划
            </span>
          )}
        </div>
        {todo.description && <p className="text-sm text-muted-foreground mt-1 line-clamp-1">{todo.description}</p>}
        <div className="flex items-center gap-2 mt-1 flex-wrap">
          {todo.dueDate && (
            <span
              className={cn(
                "flex items-center gap-1 text-xs px-1.5 py-0.5 rounded",
                !todo.completed && urgency !== "none" && urgency !== "normal"
                  ? urgencyStyle.badge
                  : "text-muted-foreground",
              )}
            >
              <UrgencyIcon className="w-3 h-3" />
              {urgencyStyle.label && !todo.completed && <span className="font-medium">{urgencyStyle.label}</span>}
              <span>{todo.dueDate}</span>
            </span>
          )}
          {todo.category && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">
              {todo.category}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1">
        <span
          className={cn("w-2 h-2 rounded-full transition-all duration-300", {
            "bg-destructive animate-pulse": todo.priority === "high",
            "bg-yellow-500": todo.priority === "medium",
            "bg-muted-foreground": todo.priority === "low",
          })}
          title={`优先级: ${todo.priority === "high" ? "高" : todo.priority === "medium" ? "中" : "低"}`}
        />

        {/* 完成按钮 - 和计划一致的UI */}
        {!todo.completed && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              toggleComplete(todo.id)
            }}
            className="p-1.5 rounded-md transition-all duration-200 text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-green-400 hover:bg-green-400/10 hover:scale-110"
            title="完成任务"
          >
            <CheckCircle2 className="w-4 h-4" />
          </button>
        )}

        <button
          onClick={(e) => {
            e.stopPropagation()
            toggleImportant(todo.id)
          }}
          className={cn(
            "p-1.5 rounded-md transition-all duration-200",
            todo.important
              ? "text-yellow-500 scale-100"
              : "text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-yellow-500 hover:scale-110",
          )}
        >
          <Star
            className={cn("w-4 h-4 transition-transform duration-200", todo.important && "fill-current scale-110")}
          />
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation()
            deleteTodo(todo.id)
          }}
          className="p-1.5 rounded-md text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-destructive hover:scale-110 transition-all duration-200"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
