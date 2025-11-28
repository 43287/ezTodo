"use client"

import { cn } from "@/lib/utils"
import type { Plan } from "@/context/todo-context"
import { useTodo } from "@/context/todo-context"
import { Repeat, Clock, Calendar, Power, Star, CheckCircle2 } from "lucide-react"
import { CYCLE_LABELS, WEEK_DAY_LABELS } from "@/lib/constants"

interface PlanItemProps {
  plan: Plan
  onEdit: (id: string) => void
  isSelected: boolean
}

export function PlanItem({ plan, onEdit, isSelected }: PlanItemProps) {
  const { togglePlanActive, togglePlanImportant, completePlanOnce } = useTodo()

  const getPlanDaysLabel = () => {
    if (plan.repeatCycle === "daily") return "每天"
    if (plan.repeatCycle === "weekly") {
      return plan.planDays.map((d) => WEEK_DAY_LABELS[d]).join("、")
    }
    return plan.planDays.map((d) => `${d}日`).join("、")
  }

  const isPlanEnded = plan.repeatCount && plan.totalCompletedCount >= plan.repeatCount
  const isCycleCompleted = plan.currentCount >= plan.cycleTargetCount

  return (
    <div
      className={cn(
        "group p-4 rounded-lg border transition-all duration-200 cursor-pointer",
        "hover:scale-[1.01] hover:shadow-md",
        isSelected
          ? "border-primary bg-primary/5 shadow-lg scale-[1.02]"
          : "border-border bg-card hover:border-primary/50",
        (!plan.active || isPlanEnded) && "opacity-50",
        isCycleCompleted && plan.active && !isPlanEnded && "border-emerald-500/50 bg-emerald-500/5",
      )}
      onClick={() => onEdit(plan.id)}
    >
      <div className="flex items-start gap-3">
        {/* Plan Icon */}
        <div
          className={cn(
            "mt-0.5 w-8 h-8 rounded-full flex items-center justify-center transition-colors",
            isPlanEnded
              ? "bg-green-500/20 text-green-400"
              : isCycleCompleted
                ? "bg-emerald-500/20 text-emerald-400"
                : plan.active
                  ? "bg-violet-500/20 text-violet-400"
                  : "bg-muted text-muted-foreground",
          )}
        >
          {isPlanEnded || isCycleCompleted ? <CheckCircle2 className="w-4 h-4" /> : <Repeat className="w-4 h-4" />}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3
              className={cn(
                "font-medium text-foreground truncate",
                (!plan.active || isPlanEnded) && "text-muted-foreground",
              )}
            >
              {plan.title}
            </h3>
            <span
              className={cn(
                "shrink-0 text-xs px-2 py-0.5 rounded-full",
                isPlanEnded
                  ? "bg-green-500/20 text-green-400"
                  : isCycleCompleted
                    ? "bg-emerald-500/20 text-emerald-400"
                    : "bg-violet-500/20 text-violet-400",
              )}
            >
              {isPlanEnded ? "已完成" : isCycleCompleted ? "本周期完成" : "计划"}
            </span>
          </div>

          {plan.description && <p className="text-sm text-muted-foreground mt-1 line-clamp-1">{plan.description}</p>}

          {/* Plan Details */}
          <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              <span>{CYCLE_LABELS[plan.repeatCycle]}</span>
              <span className="text-violet-400">{getPlanDaysLabel()}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>
                {plan.startTime} - {plan.endTime}
              </span>
            </div>
            <span className={cn(isCycleCompleted ? "text-emerald-400" : "text-violet-400")}>
              本周期 {plan.currentCount}/{plan.cycleTargetCount}
            </span>
            <span className={cn(plan.repeatCount ? "text-amber-400" : "text-green-400")}>
              总计 {plan.totalCompletedCount} 次{plan.repeatCount && ` / ${plan.repeatCount}`}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          {plan.active && !isPlanEnded && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                if (!isCycleCompleted) {
                  completePlanOnce(plan.id)
                }
              }}
              disabled={isCycleCompleted}
              className={cn(
                "p-1.5 rounded-md transition-all duration-200",
                isCycleCompleted
                  ? "text-emerald-400 opacity-100 cursor-default"
                  : "text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-green-400 hover:bg-green-400/10 hover:scale-110",
              )}
              title={isCycleCompleted ? "本周期已完成" : "完成本次"}
            >
              <CheckCircle2 className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={(e) => {
              e.stopPropagation()
              togglePlanImportant(plan.id)
            }}
            className={cn(
              "p-1.5 rounded-md transition-all duration-200",
              plan.important
                ? "text-yellow-500 scale-100"
                : "text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-yellow-500 hover:scale-110",
            )}
          >
            <Star
              className={cn("w-4 h-4 transition-transform duration-200", plan.important && "fill-current scale-110")}
            />
          </button>

          {!isPlanEnded && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                togglePlanActive(plan.id)
              }}
              className={cn(
                "p-2 rounded-md transition-all duration-200",
                plan.active ? "text-green-400 hover:bg-green-400/10" : "text-muted-foreground hover:bg-muted",
              )}
              title={plan.active ? "暂停计划" : "启用计划"}
            >
              <Power className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
