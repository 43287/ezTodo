export type UrgencyLevel = "overdue" | "urgent" | "soon" | "normal" | "none"

/**
 * 计算截止日期的紧迫程度
 */
export function getUrgencyLevel(dueDate: string | null): UrgencyLevel {
  if (!dueDate) return "none"

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const due = new Date(dueDate)
  due.setHours(0, 0, 0, 0)

  const diffDays = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

  if (diffDays < 0) return "overdue"
  if (diffDays === 0) return "urgent"
  if (diffDays <= 2) return "soon"
  return "normal"
}

/**
 * 格式化日期为 YYYY-MM-DD
 */
export function formatDate(date: Date = new Date()): string {
  return date.toISOString().split("T")[0]
}

/**
 * 格式化时间戳为可读格式
 */
export function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp)
  return `${date.getMonth() + 1}月${date.getDate()}日 ${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`
}

/**
 * 按日期分组
 */
export function groupByDate<T extends { timestamp: string }>(items: T[]): Record<string, T[]> {
  return items.reduce((acc: Record<string, T[]>, item) => {
    const date = item.timestamp.split("T")[0]
    if (!acc[date]) acc[date] = []
    acc[date].push(item)
    return acc
  }, {})
}

/**
 * 格式化分组日期标题
 */
export function formatDateLabel(dateStr: string): string {
  const date = new Date(dateStr)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  if (dateStr === formatDate(today)) return "今天"
  if (dateStr === formatDate(yesterday)) return "昨天"
  return `${date.getMonth() + 1}月${date.getDate()}日`
}
