"use client"

import type React from "react"

import { useState, useMemo } from "react"
import type { View } from "@/app/page"
import { useTodo } from "@/context/todo-context"
import { TodoItem } from "./todo-item"
import { PlanItem } from "./plan-item"
import { Input } from "@/components/ui/input"
import { Plus, Search, Pause, CheckCircle2, ListTodo } from "lucide-react"
import { getUrgencyLevel } from "@/lib/utils/date"

interface TodoListProps {
  view: View
  onEditTodo: (id: string) => void
  onEditPlan: (id: string) => void
  editingTodoId: string | null
  editingPlanId: string | null
  onToggleCreate: () => void
  isCreating: boolean
}

const VIEW_TITLES: Record<View, string> = {
  list: "所有任务",
  important: "重要",
  completed: "已完成",
  history: "历程",
  settings: "设置",
}

export function TodoList({
  view,
  onEditTodo,
  onEditPlan,
  editingTodoId,
  editingPlanId,
  onToggleCreate,
  isCreating,
}: TodoListProps) {
  const { todos, plans, settings } = useTodo()
  const [searchQuery, setSearchQuery] = useState("")

  const { activeItems, pausedPlans, completedItems, cycleCompletedPlans } = useMemo(() => {
    const filterBySearch = <T extends { title: string; description: string }>(items: T[]) => {
      if (!searchQuery) return items
      const query = searchQuery.toLowerCase()
      return items.filter(
        (item) => item.title.toLowerCase().includes(query) || item.description.toLowerCase().includes(query),
      )
    }

    let filteredTodos = filterBySearch([...todos])
    let filteredPlans = filterBySearch([...plans])

    if (view === "important") {
      filteredTodos = filteredTodos.filter((t) => t.important)
      filteredPlans = filteredPlans.filter((p) => p.important)
    }

    const sortTodos = (items: typeof todos) => {
      const sortFns: Record<string, (a: (typeof items)[0], b: (typeof items)[0]) => number> = {
        priority: (a, b) => {
          const order = { high: 0, medium: 1, low: 2 }
          return order[a.priority] - order[b.priority]
        },
        name: (a, b) => a.title.localeCompare(b.title),
        date: (a, b) => {
          if (!a.dueDate && !b.dueDate) return 0
          if (!a.dueDate) return 1
          if (!b.dueDate) return -1
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
        },
      }
      return items.sort(sortFns[settings.sortBy] || sortFns.date)
    }

    const activeTodos = sortTodos(filteredTodos.filter((t) => !t.completed))

    const activePlans = filteredPlans.filter((p) => p.active && p.currentCount < p.cycleTargetCount)

    const cycleCompletedPlans = filteredPlans.filter((p) => p.active && p.currentCount >= p.cycleTargetCount)

    const activeItems: Array<{ type: "todo" | "plan"; data: (typeof todos)[0] | (typeof plans)[0] }> = [
      ...activeTodos.map((t) => ({ type: "todo" as const, data: t })),
      ...activePlans.map((p) => ({ type: "plan" as const, data: p })),
    ]

    const pausedPlans = filteredPlans.filter(
      (p) => !p.active && !(p.repeatCount !== null && p.totalCompletedCount >= p.repeatCount),
    )

    const completedTodos = sortTodos(filteredTodos.filter((t) => t.completed))
    const permanentlyCompletedPlans = filteredPlans.filter(
      (p) => p.repeatCount !== null && p.totalCompletedCount >= p.repeatCount,
    )

    const completedItems: Array<{ type: "todo" | "plan"; data: (typeof todos)[0] | (typeof plans)[0] }> = [
      ...completedTodos.map((t) => ({ type: "todo" as const, data: t })),
      ...permanentlyCompletedPlans.map((p) => ({ type: "plan" as const, data: p })),
    ]

    return { activeItems, pausedPlans, completedItems, cycleCompletedPlans }
  }, [todos, plans, searchQuery, view, settings.sortBy])

  return (
    <div className="flex-1 flex flex-col bg-background">
      {/* Header */}
      <header className="px-6 pt-2 pb-4 border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-2xl font-semibold text-foreground">{VIEW_TITLES[view]}</h2>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="搜索任务或计划..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-input border-border transition-all duration-200 focus:scale-[1.01] focus:shadow-md"
          />
        </div>
      </header>

      {view !== "completed" && (
        <div className="px-6 py-3 border-b border-border">
          <button
            onClick={onToggleCreate}
            className={`flex items-center gap-2 transition-all duration-200 group ${
              isCreating ? "text-destructive hover:text-destructive/80" : "text-primary hover:text-primary/80"
            }`}
          >
            <Plus
              className={`w-5 h-5 transition-transform duration-300 ${
                isCreating ? "rotate-45" : "group-hover:rotate-90"
              }`}
            />
            <span>{isCreating ? "取消添加" : "添加任务/计划"}</span>
          </button>
        </div>
      )}

      {/* Content List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {activeItems.length === 0 &&
        pausedPlans.length === 0 &&
        completedItems.length === 0 &&
        cycleCompletedPlans.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <p className="text-lg">暂无内容</p>
            <p className="text-sm">点击上方按钮添加新任务或计划</p>
          </div>
        ) : (
          <>
            {/* Active Section */}
            {view !== "completed" && activeItems.length > 0 && (
              <ListSection
                icon={<ListTodo className="w-4 h-4 text-primary" />}
                title="进行中"
                count={activeItems.length}
                colorClass="text-primary bg-primary/20"
              >
                {activeItems.map((item, index) => (
                  <div
                    key={item.data.id}
                    className="animate-in fade-in slide-in-from-left-2 duration-300"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    {item.type === "todo" ? (
                      <TodoItem
                        todo={item.data as (typeof todos)[0]}
                        onEdit={onEditTodo}
                        isSelected={editingTodoId === item.data.id}
                        urgency={getUrgencyLevel((item.data as (typeof todos)[0]).dueDate)}
                      />
                    ) : (
                      <PlanItem
                        plan={item.data as (typeof plans)[0]}
                        onEdit={onEditPlan}
                        isSelected={editingPlanId === item.data.id}
                      />
                    )}
                  </div>
                ))}
              </ListSection>
            )}

            {view !== "completed" && cycleCompletedPlans.length > 0 && (
              <ListSection
                icon={<CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                title="本周期已完成"
                count={cycleCompletedPlans.length}
                colorClass="text-emerald-500 bg-emerald-500/20"
              >
                {cycleCompletedPlans.map((plan, index) => (
                  <div
                    key={plan.id}
                    className="animate-in fade-in slide-in-from-left-2 duration-300"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <PlanItem plan={plan} onEdit={onEditPlan} isSelected={editingPlanId === plan.id} />
                  </div>
                ))}
              </ListSection>
            )}

            {/* Paused Section */}
            {view !== "completed" && pausedPlans.length > 0 && (
              <ListSection
                icon={<Pause className="w-4 h-4 text-amber-500" />}
                title="已暂停"
                count={pausedPlans.length}
                colorClass="text-amber-500 bg-amber-500/20"
              >
                {pausedPlans.map((plan, index) => (
                  <div
                    key={plan.id}
                    className="animate-in fade-in slide-in-from-left-2 duration-300"
                    style={{ animationDelay: `${(activeItems.length + index) * 50}ms` }}
                  >
                    <PlanItem plan={plan} onEdit={onEditPlan} isSelected={editingPlanId === plan.id} />
                  </div>
                ))}
              </ListSection>
            )}

            {/* Completed Section */}
            {(view === "completed" ||
              (settings.showCompleted && completedItems.length > 0)) && (
              <ListSection
                icon={<CheckCircle2 className="w-4 h-4 text-green-500" />}
                title="已完成"
                count={completedItems.length}
                colorClass="text-green-500 bg-green-500/20"
              >
                {view === "completed" && plans.length > 0 && (
                  <div className="mb-4 p-4 rounded-lg bg-violet-500/10 border border-violet-500/30">
                    <p className="text-sm font-medium text-violet-400 mb-3">计划完成统计</p>
                    <div className="space-y-2">
                      {plans.map((plan) => (
                        <div key={plan.id} className="flex items-center justify-between text-sm">
                          <span className="text-foreground truncate flex-1 mr-2">{plan.title}</span>
                          <div className="flex items-center gap-3 text-xs">
                            <span className="text-emerald-400">
                              本周期 {plan.currentCount}/{plan.cycleTargetCount}
                            </span>
                            <span className="text-violet-400 font-mono">总计 {plan.totalCompletedCount} 次</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {completedItems.map((item, index) => (
                  <div
                    key={item.data.id}
                    className="animate-in fade-in slide-in-from-left-2 duration-300"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    {item.type === "todo" ? (
                      <TodoItem
                        todo={item.data as (typeof todos)[0]}
                        onEdit={onEditTodo}
                        isSelected={editingTodoId === item.data.id}
                        urgency="none"
                      />
                    ) : (
                      <PlanItem
                        plan={item.data as (typeof plans)[0]}
                        onEdit={onEditPlan}
                        isSelected={editingPlanId === item.data.id}
                      />
                    )}
                  </div>
                ))}
              </ListSection>
            )}
          </>
        )}
      </div>
    </div>
  )
}

interface ListSectionProps {
  icon: React.ReactNode
  title: string
  count: number
  colorClass: string
  children: React.ReactNode
}

function ListSection({ icon, title, count, colorClass, children }: ListSectionProps) {
  return (
    <section>
      <div className="flex items-center gap-2 mb-3 text-sm text-muted-foreground">
        {icon}
        <span className="font-medium">{title}</span>
        <span className={`px-1.5 py-0.5 rounded-full text-xs ${colorClass}`}>{count}</span>
      </div>
      <div className="space-y-2">{children}</div>
    </section>
  )
}
