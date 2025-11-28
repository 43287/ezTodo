"use client"

import { useTodo, type HistoryRecord } from "@/context/todo-context"
import { CheckCircle2, Plus, Repeat, Clock } from "lucide-react"
import { useMemo } from "react"
import { formatDateLabel } from "@/lib/utils/date"

const HISTORY_CONFIG = {
  todo_created: { icon: Plus, color: "text-blue-400 bg-blue-500/10", label: "创建任务" },
  todo_completed: { icon: CheckCircle2, color: "text-green-400 bg-green-500/10", label: "完成任务" },
  plan_created: { icon: Repeat, color: "text-violet-400 bg-violet-500/10", label: "创建计划" },
  plan_completed: { icon: CheckCircle2, color: "text-violet-400 bg-violet-500/10", label: "完成计划" },
} as const

function formatRelativeTime(timestamp: string) {
  const date = new Date(timestamp)
  const diffMs = Date.now() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return "刚刚"
  if (diffMins < 60) return `${diffMins}分钟前`
  if (diffHours < 24) return `${diffHours}小时前`
  if (diffDays < 7) return `${diffDays}天前`

  return date.toLocaleDateString("zh-CN", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })
}

function groupHistoryByDate(history: HistoryRecord[]) {
  const dateMap = new Map<string, HistoryRecord[]>()

  history.forEach((record) => {
    const dateKey = record.timestamp.split("T")[0]
    if (!dateMap.has(dateKey)) dateMap.set(dateKey, [])
    dateMap.get(dateKey)!.push(record)
  })

  return Array.from(dateMap.entries())
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([date, records]) => ({ date, label: formatDateLabel(date), records }))
}

export function HistoryView() {
  const { history } = useTodo()
  const groupedHistory = useMemo(() => groupHistoryByDate(history), [history])

  return (
    <div className="flex-1 flex flex-col bg-background">
      <header className="p-6 border-b border-border">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-2xl font-semibold text-foreground">历程</h2>
          <span className="text-sm text-muted-foreground">{history.length} 条记录</span>
        </div>
        <p className="text-sm text-muted-foreground">查看最近的任务和计划活动</p>
      </header>

      <div className="flex-1 overflow-y-auto p-4">
        {history.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <Clock className="w-12 h-12 mb-3 opacity-50" />
            <p className="text-lg">暂无历程记录</p>
            <p className="text-sm">开始创建和完成任务后将在此显示</p>
          </div>
        ) : (
          <div className="space-y-6">
            {groupedHistory.map((group, groupIndex) => (
              <div
                key={group.date}
                className="animate-in fade-in slide-in-from-left-2 duration-300"
                style={{ animationDelay: `${groupIndex * 100}ms` }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <h3 className="text-sm font-medium text-foreground">{group.label}</h3>
                  <div className="flex-1 h-px bg-border" />
                </div>

                <div className="space-y-2">
                  {group.records.map((record, recordIndex) => {
                    const config = HISTORY_CONFIG[record.type]
                    const Icon = config.icon

                    return (
                      <div
                        key={record.id}
                        className="flex items-start gap-3 p-3 rounded-lg bg-card border border-border hover:border-primary/30 hover:bg-card/80 transition-all duration-200"
                        style={{ animationDelay: `${groupIndex * 100 + recordIndex * 50}ms` }}
                      >
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${config.color}`}
                        >
                          <Icon className="w-5 h-5" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-foreground truncate">{record.title}</p>
                              <p className="text-xs text-muted-foreground mt-0.5">{config.label}</p>
                            </div>
                            <span className="text-xs text-muted-foreground whitespace-nowrap">
                              {formatRelativeTime(record.timestamp)}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 mt-2">
                            {record.itemType === "plan" ? (
                              <span className="text-xs px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-400 flex items-center gap-1">
                                <Repeat className="w-3 h-3" />
                                计划
                              </span>
                            ) : (
                              <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400">
                                任务
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
