"use client"

import { createContext, useContext, useState, useEffect, useRef, type ReactNode } from "react"
import { todoList as backendTodoList, todoCreate as backendTodoCreate, todoUpdate as backendTodoUpdate, todoDelete as backendTodoDelete, planList as backendPlanList, planCreate as backendPlanCreate, planUpdate as backendPlanUpdate, planDelete as backendPlanDelete, planRefresh as backendPlanRefresh, historyList as backendHistoryList } from "@/lib/tauriClient"

export interface Todo {
  id: string
  title: string
  description: string
  completed: boolean
  important: boolean
  dueDate: string | null
  createdAt: string
  completedAt?: string // 添加完成时间记录
  priority: "low" | "medium" | "high"
  category: string
  fromPlanId?: string
}

export interface Plan {
  id: string
  title: string
  description: string
  repeatCycle: "daily" | "weekly" | "monthly"
  planDays: number[]
  startTime: string
  endTime: string
  repeatCount: number | null
  currentCount: number
  cycleTargetCount: number // 添加本周期目标完成次数
  totalCompletedCount: number
  lastResetDate: string
  createdAt: string
  category: string
  active: boolean
  important: boolean
}

export interface HistoryRecord {
  id: string
  type: "todo_created" | "todo_completed" | "plan_created" | "plan_completed"
  title: string
  timestamp: string
  itemId: string
  itemType: "todo" | "plan"
}

export interface Settings {
  showCompleted: boolean
  sortBy: "date" | "priority" | "name"
  theme: "dark" | "light" | "system"
  notifications: boolean
  soundEnabled: boolean
}

interface TodoContextType {
  todos: Todo[]
  plans: Plan[]
  settings: Settings
  history: HistoryRecord[]
  addTodo: (todo: Omit<Todo, "id" | "createdAt">) => void
  updateTodo: (id: string, updates: Partial<Todo>) => void
  deleteTodo: (id: string) => void
  toggleComplete: (id: string) => void
  toggleImportant: (id: string) => void
  updateSettings: (updates: Partial<Settings>) => void
  addPlan: (plan: Omit<Plan, "id" | "createdAt" | "currentCount" | "totalCompletedCount" | "lastResetDate">) => void
  updatePlan: (id: string, updates: Partial<Plan>) => void
  deletePlan: (id: string) => void
  togglePlanActive: (id: string) => void
  togglePlanImportant: (id: string) => void
  completePlanOnce: (id: string) => void
  endPlan: (id: string) => void
}

const TodoContext = createContext<TodoContextType | undefined>(undefined)

const defaultTodos: Todo[] = [
  {
    id: "1",
    title: "完成项目文档",
    description: "编写项目的技术文档和用户手册",
    completed: false,
    important: true,
    dueDate: "2025-11-27",
    createdAt: "2025-11-25",
    priority: "high",
    category: "工作",
  },
  {
    id: "2",
    title: "代码审查",
    description: "审查团队成员提交的代码",
    completed: false,
    important: false,
    dueDate: "2025-11-26",
    createdAt: "2025-11-25",
    priority: "medium",
    category: "工作",
  },
  {
    id: "3",
    title: "购买日用品",
    description: "牛奶、面包、水果",
    completed: true,
    important: false,
    dueDate: null,
    createdAt: "2025-11-24",
    completedAt: "2025-11-24",
    priority: "low",
    category: "生活",
  },
]

const defaultPlans: Plan[] = [
  {
    id: "plan-1",
    title: "周末跑步",
    description: "每周周末晚上跑步锻炼",
    repeatCycle: "weekly",
    planDays: [6, 0],
    startTime: "20:00",
    endTime: "21:00",
    repeatCount: null,
    currentCount: 0,
    cycleTargetCount: 2, // 添加默认周期目标完成次数
    totalCompletedCount: 5,
    lastResetDate: "2025-11-24",
    createdAt: "2025-11-20",
    category: "健康",
    active: true,
    important: false,
  },
]

const defaultHistory: HistoryRecord[] = [
  {
    id: "h1",
    type: "todo_created",
    title: "完成项目文档",
    timestamp: "2025-11-25T10:00:00",
    itemId: "1",
    itemType: "todo",
  },
  {
    id: "h2",
    type: "todo_completed",
    title: "购买日用品",
    timestamp: "2025-11-24T18:30:00",
    itemId: "3",
    itemType: "todo",
  },
  {
    id: "h3",
    type: "plan_created",
    title: "周末跑步",
    timestamp: "2025-11-20T09:00:00",
    itemId: "plan-1",
    itemType: "plan",
  },
]

const defaultSettings: Settings = {
  showCompleted: true,
  sortBy: "date",
  theme: "dark",
  notifications: true,
  soundEnabled: true,
}

function shouldResetPlan(plan: Plan): boolean {
  const today = new Date()
  const lastReset = new Date(plan.lastResetDate)

  switch (plan.repeatCycle) {
    case "daily":
      return today.toDateString() !== lastReset.toDateString()
    case "weekly":
      const getWeekStart = (date: Date) => {
        const d = new Date(date)
        const day = d.getDay()
        const diff = d.getDate() - day + (day === 0 ? -6 : 1)
        return new Date(d.setDate(diff)).toDateString()
      }
      return getWeekStart(today) !== getWeekStart(lastReset)
    case "monthly":
      return today.getMonth() !== lastReset.getMonth() || today.getFullYear() !== lastReset.getFullYear()
    default:
      return false
  }
}

function isTodayPlanDay(plan: Plan): boolean {
  const today = new Date()
  const dayOfWeek = today.getDay()
  const dayOfMonth = today.getDate()

  switch (plan.repeatCycle) {
    case "daily":
      return true
    case "weekly":
      return plan.planDays.includes(dayOfWeek)
    case "monthly":
      return plan.planDays.includes(dayOfMonth)
    default:
      return false
  }
}

export function TodoProvider({ children }: { children: ReactNode }) {
  const [todos, setTodos] = useState<Todo[]>([])
  const [plans, setPlans] = useState<Plan[]>([])
  const [settings, setSettings] = useState<Settings>(defaultSettings)
  const [history, setHistory] = useState<HistoryRecord[]>([])
  const [loaded, setLoaded] = useState<boolean>(false)
  const planInitDone = useRef<boolean>(false)

  const refreshHistory = () => {
    backendHistoryList().then((list) => setHistory(list))
  }

  useEffect(() => {
    ;(async () => {
      try {
        const [todos, plans, history] = await Promise.all([backendTodoList(), backendPlanList(), backendHistoryList()])
        setTodos(todos)
        setPlans(plans)
        setHistory(history)
        await backendPlanRefresh().then((refreshed) => setPlans(refreshed))
      } finally {
        setLoaded(true)
      }
    })()
  }, [])

  useEffect(() => {
    if (!loaded || planInitDone.current) return
    const today = new Date().toISOString().split("T")[0]
    setPlans((prevPlans) =>
      prevPlans.map((plan) => {
        if (shouldResetPlan(plan)) {
          return { ...plan, currentCount: 0, lastResetDate: today }
        }
        return plan
      }),
    )
    plans.forEach((plan) => {
      if (plan.active && isTodayPlanDay(plan)) {
        const existingTodo = todos.find((t) => t.fromPlanId === plan.id && t.dueDate === today)
        if (!existingTodo) {
          backendTodoCreate({
            title: plan.title,
            description: `${plan.description}\n时间: ${plan.startTime} - ${plan.endTime}`,
            important: plan.important,
            dueDate: today,
            priority: "medium",
            category: plan.category,
            fromPlanId: plan.id,
          }).then((created) => {
            setTodos((prev) => [created as Todo, ...prev])
          })
        }
      }
    })
    planInitDone.current = true
  }, [loaded, plans, todos])

  const addTodo = (todo: Omit<Todo, "id" | "createdAt">) => {
    backendTodoCreate(todo).then((newTodo) => {
      setTodos((prev) => [newTodo as Todo, ...prev])
      refreshHistory()
    })
  }

  const updateTodo = (id: string, updates: Partial<Todo>) => {
    setTodos((prev) => {
      const next = prev.map((todo) => (todo.id === id ? { ...todo, ...updates } : todo))
      const updated = next.find((t) => t.id === id)
      if (updated) {
        backendTodoUpdate(updated)
      }
      return next
    })
  }

  const deleteTodo = (id: string) => {
    backendTodoDelete(id).then(() => {
      setTodos((prev) => prev.filter((todo) => todo.id !== id))
    })
  }

  const toggleComplete = (id: string) => {
    setTodos((prev) => {
      const next = prev.map((todo) => {
        if (todo.id === id) {
          const newCompleted = !todo.completed
          const updated: Todo = {
            ...todo,
            completed: newCompleted,
            completedAt: newCompleted ? new Date().toISOString() : undefined,
          }
          backendTodoUpdate(updated)
          if (newCompleted) {
            refreshHistory()
            if (updated.fromPlanId) {
              setPlans((prevPlans) =>
                prevPlans.map((plan) =>
                  plan.id === updated.fromPlanId
                    ? {
                        ...plan,
                        currentCount: plan.currentCount + 1,
                        totalCompletedCount: plan.totalCompletedCount + 1,
                      }
                    : plan,
                ),
              )
            }
          }
          return updated
        }
        return todo
      })
      return next
    })
  }

  const toggleImportant = (id: string) => {
    setTodos((prev) => {
      const next = prev.map((todo) => (todo.id === id ? { ...todo, important: !todo.important } : todo))
      const updated = next.find((t) => t.id === id)
      if (updated) backendTodoUpdate(updated)
      return next
    })
  }

  const updateSettings = (updates: Partial<Settings>) => {
    setSettings((prev) => ({ ...prev, ...updates }))
  }

  const addPlan = (plan: Omit<Plan, "id" | "createdAt" | "currentCount" | "totalCompletedCount" | "lastResetDate">) => {
    backendPlanCreate(plan).then((newPlan) => {
      setPlans((prev) => [newPlan as Plan, ...prev])
    })
  }

  const updatePlan = (id: string, updates: Partial<Plan>) => {
    setPlans((prev) => {
      const next = prev.map((plan) => (plan.id === id ? { ...plan, ...updates } : plan))
      const updated = next.find((p) => p.id === id)
      if (updated) backendPlanUpdate(updated)
      return next
    })
  }

  const deletePlan = (id: string) => {
    backendPlanDelete(id).then(() => {
      setPlans((prev) => prev.filter((plan) => plan.id !== id))
      setTodos((prev) => prev.filter((todo) => todo.fromPlanId !== id))
    })
  }

  const togglePlanActive = (id: string) => {
    setPlans((prev) => {
      const next = prev.map((plan) => (plan.id === id ? { ...plan, active: !plan.active } : plan))
      const updated = next.find((p) => p.id === id)
      if (updated) backendPlanUpdate(updated)
      return next
    })
  }

  const togglePlanImportant = (id: string) => {
    setPlans((prev) => {
      const next = prev.map((plan) => (plan.id === id ? { ...plan, important: !plan.important } : plan))
      const updated = next.find((p) => p.id === id)
      if (updated) backendPlanUpdate(updated)
      return next
    })
  }

  const completePlanOnce = (id: string) => {
    setPlans((prev) => {
      const next = prev.map((plan) => {
        if (plan.id === id) {
          const newTotalCount = plan.totalCompletedCount + 1
          const newCurrentCount = plan.currentCount + 1
          const updated: Plan = {
            ...plan,
            currentCount: newCurrentCount,
            totalCompletedCount: newTotalCount,
            active: plan.repeatCount && newTotalCount >= (plan.repeatCount ?? 0) ? false : plan.active,
          }
          backendPlanUpdate(updated)
          return updated
        }
        return plan
      })
      return next
    })
  }

  const endPlan = (id: string) => {
    setPlans((prev) => {
      const next = prev.map((plan) => {
        if (plan.id === id) {
          const updated: Plan = { ...plan, active: false, repeatCount: plan.totalCompletedCount }
          backendPlanUpdate(updated)
          return updated
        }
        return plan
      })
      return next
    })
  }

  return (
    <TodoContext.Provider
      value={{
        todos,
        plans,
        settings,
        history,
        addTodo,
        updateTodo,
        deleteTodo,
        toggleComplete,
        toggleImportant,
        updateSettings,
        addPlan,
        updatePlan,
        deletePlan,
        togglePlanActive,
        togglePlanImportant,
        completePlanOnce,
        endPlan,
      }}
    >
      {children}
    </TodoContext.Provider>
  )
}

export function useTodo() {
  const context = useContext(TodoContext)
  if (!context) {
    throw new Error("useTodo must be used within a TodoProvider")
  }
  return context
}
