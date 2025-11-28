"use client"

import { useState, useRef, useEffect } from "react"
import { Calendar, ChevronLeft, ChevronRight, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { createPortal } from "react-dom"

interface DatePickerProps {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
}

export function DatePicker({ value, onChange, disabled = false }: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [currentMonth, setCurrentMonth] = useState(() => {
    if (value) return new Date(value)
    return new Date()
  })
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0 })
  const containerRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLDivElement>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const formatDate = (date: Date) => date.toISOString().split("T")[0]
  const formatDisplayDate = (dateStr: string) => {
    if (!dateStr) return ""
    const date = new Date(dateStr)
    return date.toLocaleDateString("zh-CN", { year: "numeric", month: "long", day: "numeric" })
  }

  const quickDates = [
    { label: "昨天", date: formatDate(yesterday) },
    { label: "今天", date: formatDate(today) },
    { label: "明天", date: formatDate(tomorrow) },
  ]

  const isQuickDateSelected = (date: string) => value === date

  const updatePosition = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect()
      setPosition({
        top: rect.bottom + 4,
        left: rect.left,
        width: rect.width,
      })
    }
  }

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  useEffect(() => {
    if (value) {
      setCurrentMonth(new Date(value))
    }
  }, [value])

  useEffect(() => {
    if (isOpen) {
      updatePosition()
    }
  }, [isOpen])

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startDay = firstDay.getDay()

    const days: (number | null)[] = []
    for (let i = 0; i < startDay; i++) {
      days.push(null)
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i)
    }
    return days
  }

  const handleDateSelect = (day: number) => {
    const selected = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
    onChange(formatDate(selected))
    setIsOpen(false)
  }

  const goToPrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
  }

  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))
  }

  const isToday = (day: number) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
    return formatDate(date) === formatDate(today)
  }

  const isSelected = (day: number) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
    return formatDate(date) === value
  }

  const isPast = (day: number) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
    return date < new Date(formatDate(yesterday))
  }

  const weekDays = ["日", "一", "二", "三", "四", "五", "六"]
  const days = getDaysInMonth(currentMonth)

  const calendarDropdown =
    isOpen &&
    !disabled &&
    mounted &&
    createPortal(
      <div
        ref={containerRef}
        className={cn(
          "fixed rounded-lg shadow-xl overflow-hidden",
          "border border-border",
          "animate-in fade-in-0 zoom-in-95 duration-150",
        )}
        style={{
          backgroundColor: "hsl(240 6% 10%)",
          top: position.top,
          left: position.left,
          width: position.width,
          zIndex: 9999,
        }}
      >
        {/* 月份导航 */}
        <div className="flex items-center justify-between px-3 py-2 border-b border-border bg-muted/30">
          <button type="button" onClick={goToPrevMonth} className="p-1.5 rounded-md hover:bg-muted transition-colors">
            <ChevronLeft className="w-4 h-4 text-muted-foreground" />
          </button>
          <span className="text-sm font-medium">
            {currentMonth.toLocaleDateString("zh-CN", { year: "numeric", month: "long" })}
          </span>
          <button type="button" onClick={goToNextMonth} className="p-1.5 rounded-md hover:bg-muted transition-colors">
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        {/* 星期标题 */}
        <div className="grid grid-cols-7 gap-0 px-2 py-1.5 border-b border-border/50">
          {weekDays.map((day) => (
            <div key={day} className="text-center text-xs font-medium text-muted-foreground py-1">
              {day}
            </div>
          ))}
        </div>

        {/* 日期格子 */}
        <div className="grid grid-cols-7 gap-0.5 p-2">
          {days.map((day, index) => (
            <div key={index} className="aspect-square flex items-center justify-center">
              {day !== null && (
                <button
                  type="button"
                  onClick={() => handleDateSelect(day)}
                  className={cn(
                    "w-8 h-8 text-sm rounded-lg transition-all duration-150",
                    "hover:bg-primary/20 hover:text-primary",
                    isSelected(day) &&
                      "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
                    isToday(day) && !isSelected(day) && "ring-1 ring-primary/50 text-primary",
                    isPast(day) && !isSelected(day) && "text-muted-foreground/50",
                  )}
                >
                  {day}
                </button>
              )}
            </div>
          ))}
        </div>

        {/* 底部快捷操作 */}
        <div className="flex items-center justify-between px-3 py-2 border-t border-border bg-muted/30">
          <button
            type="button"
            onClick={() => {
              onChange(formatDate(today))
              setIsOpen(false)
            }}
            className="text-xs text-primary hover:underline"
          >
            跳转到今天
          </button>
          <button
            type="button"
            onClick={() => {
              onChange("")
              setIsOpen(false)
            }}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            清除日期
          </button>
        </div>
      </div>,
      document.body,
    )

  return (
    <div className="relative space-y-2">
      {/* 快捷日期按钮 */}
      <div className="flex gap-2">
        {quickDates.map((item) => (
          <button
            key={item.label}
            type="button"
            onClick={() => !disabled && onChange(item.date)}
            disabled={disabled}
            className={cn(
              "flex-1 px-3 py-1.5 text-xs font-medium rounded-lg border transition-all duration-200",
              "hover:scale-[1.02] active:scale-[0.98]",
              isQuickDateSelected(item.date)
                ? "bg-primary text-primary-foreground border-primary shadow-sm"
                : "bg-muted/50 border-border hover:bg-muted hover:border-muted-foreground/30",
              disabled && "opacity-50 cursor-not-allowed hover:scale-100",
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* 日期输入框 */}
      <div
        ref={triggerRef}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-2 bg-input border border-border rounded-lg px-3 py-2 transition-all duration-200 cursor-pointer",
          "hover:border-muted-foreground/50",
          isOpen && "ring-2 ring-primary/20 border-primary/50",
          disabled && "opacity-50 cursor-not-allowed",
        )}
      >
        <Calendar className="w-4 h-4 text-muted-foreground flex-shrink-0" />
        <span className={cn("flex-1 text-sm", !value && "text-muted-foreground/50")}>
          {value ? formatDisplayDate(value) : "选择日期..."}
        </span>
        {value && !disabled && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onChange("")
            }}
            className="p-0.5 rounded hover:bg-muted transition-colors"
          >
            <X className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground" />
          </button>
        )}
      </div>

      {/* 日历通过 Portal 渲染 */}
      {calendarDropdown}
    </div>
  )
}
