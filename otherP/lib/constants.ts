// 星期常量
export const WEEK_DAYS = [
  { value: 0, label: "周日" },
  { value: 1, label: "周一" },
  { value: 2, label: "周二" },
  { value: 3, label: "周三" },
  { value: 4, label: "周四" },
  { value: 5, label: "周五" },
  { value: 6, label: "周六" },
] as const

export const WEEK_DAY_LABELS = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"] as const

// 月份日期常量
export const MONTH_DAYS = Array.from({ length: 31 }, (_, i) => ({ value: i + 1, label: `${i + 1}日` }))

// 重复周期标签
export const CYCLE_LABELS: Record<string, string> = {
  daily: "每天",
  weekly: "每周",
  monthly: "每月",
}

// 优先级配置
export const PRIORITY_CONFIG = {
  high: { color: "bg-destructive", label: "高优先级" },
  medium: { color: "bg-yellow-500", label: "中优先级" },
  low: { color: "bg-muted-foreground", label: "低优先级" },
} as const

// 紧迫度样式配置
export const URGENCY_STYLES = {
  overdue: {
    border: "border-l-4 border-l-red-500",
    bg: "bg-red-500/5",
    badge: "bg-red-500/20 text-red-400",
    label: "已过期",
  },
  urgent: {
    border: "border-l-4 border-l-orange-500",
    bg: "bg-orange-500/5",
    badge: "bg-orange-500/20 text-orange-400",
    label: "今天到期",
  },
  soon: {
    border: "border-l-4 border-l-yellow-500",
    bg: "bg-yellow-500/5",
    badge: "bg-yellow-500/20 text-yellow-400",
    label: "即将到期",
  },
  normal: {
    border: "border-l-4 border-l-blue-500/50",
    bg: "",
    badge: "bg-blue-500/20 text-blue-400",
    label: "",
  },
  none: {
    border: "",
    bg: "",
    badge: "",
    label: "",
  },
} as const

// 分类选项
export const CATEGORIES = ["工作", "生活", "健康", "学习"] as const
