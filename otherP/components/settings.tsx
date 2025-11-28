"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useTodo } from "@/context/todo-context"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Eye, ArrowUpDown, Bell, Volume2, Info, ArrowLeft } from "lucide-react"
import { cn } from "@/lib/utils"

interface SettingsProps {
  onBack?: () => void
}

const SORT_OPTIONS = [
  { value: "date", label: "按日期" },
  { value: "priority", label: "按优先级" },
  { value: "name", label: "按名称" },
]

export function Settings({ onBack }: SettingsProps) {
  const { settings, updateSettings } = useTodo()
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    requestAnimationFrame(() => setIsVisible(true))
  }, [])

  const settingSections = [
    {
      title: "显示设置",
      items: [
        {
          icon: Eye,
          label: "显示已完成任务",
          description: "在任务列表中显示已完成的任务",
          type: "switch" as const,
          value: settings.showCompleted,
          onChange: (v: boolean) => updateSettings({ showCompleted: v }),
        },
        {
          icon: ArrowUpDown,
          label: "默认排序方式",
          description: "选择任务的默认排序方式",
          type: "select" as const,
          value: settings.sortBy,
          options: SORT_OPTIONS,
          onChange: (v: string) => updateSettings({ sortBy: v as "date" | "priority" | "name" }),
        },
      ],
    },
    {
      title: "通知设置",
      items: [
        {
          icon: Bell,
          label: "启用通知",
          description: "接收任务到期提醒通知",
          type: "switch" as const,
          value: settings.notifications,
          onChange: (v: boolean) => updateSettings({ notifications: v }),
        },
        {
          icon: Volume2,
          label: "声音提示",
          description: "任务完成时播放提示音",
          type: "switch" as const,
          value: settings.soundEnabled,
          onChange: (v: boolean) => updateSettings({ soundEnabled: v }),
        },
      ],
    },
  ]

  let itemIndex = 0

  return (
    <div className="flex-1 bg-background overflow-y-auto">
      <div className="max-w-2xl mx-auto p-6">
        {/* Header */}
        <div
          className={cn(
            "flex items-center gap-4 mb-6 transition-all duration-300",
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4",
          )}
        >
          {onBack && (
            <button
              onClick={onBack}
              className="p-2 rounded-lg hover:bg-muted transition-all duration-200 hover:-translate-x-1"
            >
              <ArrowLeft className="w-5 h-5 text-muted-foreground" />
            </button>
          )}
          <h2 className="text-2xl font-semibold text-foreground">设置</h2>
        </div>

        <div className="space-y-8">
          {settingSections.map((section, sectionIndex) => (
            <SettingSection
              key={section.title}
              title={section.title}
              isVisible={isVisible}
              delay={50 + sectionIndex * 100}
            >
              {section.items.map((item) => {
                const currentIndex = itemIndex++
                return (
                  <SettingItem
                    key={item.label}
                    icon={item.icon}
                    label={item.label}
                    description={item.description}
                    isVisible={isVisible}
                    delay={100 + currentIndex * 75}
                  >
                    {item.type === "switch" && (
                      <Switch
                        checked={item.value as boolean}
                        onCheckedChange={item.onChange as (v: boolean) => void}
                        className="transition-transform duration-200 hover:scale-105"
                      />
                    )}
                    {item.type === "select" && (
                      <Select value={item.value as string} onValueChange={item.onChange as (v: string) => void}>
                        <SelectTrigger className="w-32 bg-input border-border transition-all duration-200 hover:scale-[1.02]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {item.options?.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </SettingItem>
                )
              })}
            </SettingSection>
          ))}

          {/* About Section */}
          <SettingSection title="关于" isVisible={isVisible} delay={350}>
            <SettingItem
              icon={Info}
              label="Todo List v1.0"
              description="Windows风格任务管理应用"
              isVisible={isVisible}
              delay={400}
              iconClassName="bg-primary/20 text-primary"
            />
          </SettingSection>
        </div>
      </div>
    </div>
  )
}

function SettingSection({
  title,
  isVisible,
  delay,
  children,
}: { title: string; isVisible: boolean; delay: number; children: React.ReactNode }) {
  return (
    <div>
      <h3
        className={cn(
          "text-sm font-medium text-muted-foreground mb-4 transition-all duration-300",
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2",
        )}
        style={{ transitionDelay: `${delay}ms` }}
      >
        {title}
      </h3>
      <div className="space-y-2">{children}</div>
    </div>
  )
}

function SettingItem({
  icon: Icon,
  label,
  description,
  isVisible,
  delay,
  iconClassName,
  children,
}: {
  icon: React.ElementType
  label: string
  description: string
  isVisible: boolean
  delay: number
  iconClassName?: string
  children?: React.ReactNode
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-between p-4 rounded-lg bg-card border border-border transition-all duration-300 hover:bg-card/80 hover:scale-[1.01]",
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
      )}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div className="flex items-center gap-4">
        <div className={cn("w-10 h-10 rounded-lg bg-muted flex items-center justify-center", iconClassName)}>
          <Icon className="w-5 h-5 text-muted-foreground" />
        </div>
        <div>
          <Label className="text-card-foreground">{label}</Label>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
      {children}
    </div>
  )
}
