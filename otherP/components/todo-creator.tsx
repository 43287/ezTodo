"use client"

import { useState, useEffect } from "react"
import { useTodo } from "@/context/todo-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { NumberStepper } from "@/components/ui/number-stepper"
import { CategoryInput } from "@/components/ui/category-input"
import { DatePicker } from "@/components/ui/date-picker"
import { AnimatedField } from "@/components/ui/animated-field"
import { PlanToggle } from "@/components/ui/plan-toggle"
import { RepeatToggle } from "@/components/ui/repeat-toggle"
import { X, Flag, Plus, Repeat } from "lucide-react"
import { cn } from "@/lib/utils"
import type { View } from "@/app/page"
import { WEEK_DAYS, PRIORITY_CONFIG } from "@/lib/constants"

interface TodoCreatorProps {
  view: View
  onClose: () => void
}

export function TodoCreator({ view, onClose }: TodoCreatorProps) {
  const { addTodo, addPlan } = useTodo()
  const [isVisible, setIsVisible] = useState(false)
  const [isPlan, setIsPlan] = useState(false)

  // 通用字段
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState("默认")
  const [important, setImportant] = useState(view === "important")

  // 任务专用字段
  const [dueDate, setDueDate] = useState("")
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium")

  // 计划专用字段
  const [repeatCycle, setRepeatCycle] = useState<"daily" | "weekly" | "monthly">("weekly")
  const [planDays, setPlanDays] = useState<number[]>([6, 0])
  const [startTime, setStartTime] = useState("20:00")
  const [endTime, setEndTime] = useState("21:00")
  const [isRepeating, setIsRepeating] = useState(false)
  const [repeatCount, setRepeatCount] = useState<string>("")
  const [cycleTargetCount, setCycleTargetCount] = useState<string>("1")

  useEffect(() => {
    requestAnimationFrame(() => setIsVisible(true))
  }, [])

  const handleCreate = () => {
    if (!title.trim()) return

    if (isPlan) {
      addPlan({
        title: title.trim(),
        description,
        repeatCycle,
        planDays,
        startTime,
        endTime,
        repeatCount: isRepeating ? (repeatCount ? Number.parseInt(repeatCount) : null) : 1,
        cycleTargetCount: cycleTargetCount ? Number.parseInt(cycleTargetCount) : 1,
        category,
        active: true,
        important,
      })
    } else {
      addTodo({
        title: title.trim(),
        description,
        completed: false,
        important,
        dueDate: dueDate || null,
        priority,
        category,
      })
    }
    onClose()
  }

  const handleClose = () => {
    setIsVisible(false)
    setTimeout(onClose, 200)
  }

  const togglePlanDay = (day: number) => {
    setPlanDays((prev) => (prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]))
  }

  return (
    <div
      className={cn(
        "w-96 h-full bg-card border-l border-border flex flex-col shadow-2xl transition-all duration-300 ease-out",
        isVisible ? "opacity-100" : "opacity-0",
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h3 className="font-semibold text-card-foreground flex items-center gap-2">
          {isPlan ? (
            <>
              <Repeat className="w-5 h-5 text-violet-500" />
              新建计划
            </>
          ) : (
            <>
              <Plus className="w-5 h-5 text-primary" />
              新建任务
            </>
          )}
        </h3>
        <button
          onClick={handleClose}
          className="p-1.5 rounded-md hover:bg-muted transition-all duration-200 hover:rotate-90"
        >
          <X className="w-5 h-5 text-muted-foreground" />
        </button>
      </div>

      {/* Form */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <PlanToggle isPlan={isPlan} onToggle={() => setIsPlan(!isPlan)} isVisible={isVisible} />

        {/* 标题 */}
        <AnimatedField isVisible={isVisible} delay={50}>
          <Label htmlFor="new-title">
            标题 <span className="text-destructive">*</span>
          </Label>
          <Input
            id="new-title"
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleCreate()}
            className="bg-input border-border transition-all duration-200 focus:scale-[1.01]"
            placeholder={isPlan ? "输入计划标题..." : "输入任务标题..."}
          />
        </AnimatedField>

        {/* 描述 */}
        <AnimatedField isVisible={isVisible} delay={100}>
          <Label htmlFor="new-description">描述</Label>
          <Textarea
            id="new-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="bg-input border-border resize-none transition-all duration-200 focus:scale-[1.01]"
            placeholder={isPlan ? "添加计划描述..." : "添加任务描述..."}
          />
        </AnimatedField>

        {/* 计划专用字段 */}
        <div
          className={cn(
            "space-y-4 transition-all duration-500 ease-out overflow-hidden",
            isPlan ? "max-h-[800px] opacity-100" : "max-h-0 opacity-0",
          )}
        >
          <RepeatToggle isRepeating={isRepeating} onToggle={() => setIsRepeating(!isRepeating)} />

          <div
            className={cn(
              "space-y-4 transition-all duration-500 ease-out overflow-hidden",
              isRepeating ? "max-h-[200px] opacity-100" : "max-h-0 opacity-0",
            )}
          >
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Repeat className="w-4 h-4" />
                重复周期
              </Label>
              <Select value={repeatCycle} onValueChange={(v: "daily" | "weekly" | "monthly") => setRepeatCycle(v)}>
                <SelectTrigger className="bg-input border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">每天</SelectItem>
                  <SelectItem value="weekly">每周</SelectItem>
                  <SelectItem value="monthly">每月</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>总重复次数（留空为无限）</Label>
              <NumberStepper
                value={repeatCount}
                onChange={setRepeatCount}
                min={1}
                max={999}
                placeholder="无限"
                allowEmpty
              />
            </div>
          </div>

          {isRepeating && repeatCycle === "weekly" && (
            <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
              <Label>计划日</Label>
              <div className="flex flex-wrap gap-2">
                {WEEK_DAYS.map((day) => (
                  <button
                    key={day.value}
                    onClick={() => togglePlanDay(day.value)}
                    className={cn(
                      "px-3 py-1.5 text-xs rounded-md transition-all duration-200",
                      planDays.includes(day.value)
                        ? "bg-violet-500 text-white scale-105"
                        : "bg-muted text-muted-foreground hover:bg-muted/80 hover:scale-105",
                    )}
                  >
                    {day.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {isRepeating && repeatCycle === "monthly" && (
            <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
              <Label>每月日期</Label>
              <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
                {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                  <button
                    key={day}
                    onClick={() => togglePlanDay(day)}
                    className={cn(
                      "w-8 h-8 text-xs rounded-md transition-all duration-200",
                      planDays.includes(day)
                        ? "bg-violet-500 text-white scale-105"
                        : "bg-muted text-muted-foreground hover:bg-muted/80",
                    )}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>开始时间</Label>
              <Input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="bg-input border-border"
              />
            </div>
            <div className="space-y-2">
              <Label>结束时间</Label>
              <Input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="bg-input border-border"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>每周期目标次数</Label>
            <NumberStepper value={cycleTargetCount} onChange={setCycleTargetCount} min={1} max={99} placeholder="1" />
            <p className="text-xs text-muted-foreground">达到目标次数后，本周期计划自动完成</p>
          </div>
        </div>

        {/* 任务专用字段 */}
        <div
          className={cn(
            "space-y-4 transition-all duration-500 ease-out overflow-hidden",
            !isPlan ? "max-h-[400px] opacity-100" : "max-h-0 opacity-0",
          )}
        >
          <div className="space-y-2">
            <Label className="flex items-center gap-2">截止日期</Label>
            <DatePicker value={dueDate} onChange={setDueDate} />
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Flag className="w-4 h-4" />
              优先级
            </Label>
            <Select value={priority} onValueChange={(value: "low" | "medium" | "high") => setPriority(value)}>
              <SelectTrigger className="bg-input border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(
                  Object.entries(PRIORITY_CONFIG) as [
                    keyof typeof PRIORITY_CONFIG,
                    (typeof PRIORITY_CONFIG)[keyof typeof PRIORITY_CONFIG],
                  ][]
                ).map(([key, config]) => (
                  <SelectItem key={key} value={key}>
                    <div className="flex items-center gap-2">
                      <span className={cn("w-2 h-2 rounded-full", config.color)} />
                      {config.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <AnimatedField isVisible={isVisible} delay={350}>
          <Label>分类</Label>
          <CategoryInput value={category} onChange={setCategory} />
        </AnimatedField>

        {/* 重要标记 */}
        <AnimatedField
          isVisible={isVisible}
          delay={400}
          className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
        >
          <span className="text-sm text-foreground">标记为重要</span>
          <button
            onClick={() => setImportant(!important)}
            className={cn(
              "relative w-10 h-6 rounded-full transition-all duration-300",
              important ? "bg-yellow-500 shadow-lg shadow-yellow-500/30" : "bg-muted",
            )}
          >
            <span
              className={cn(
                "absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all duration-300",
                important ? "left-5" : "left-1",
              )}
            />
          </button>
        </AnimatedField>
      </div>

      {/* Footer */}
      <div
        className={cn(
          "p-4 border-t border-border flex gap-2 transition-all duration-300 delay-[450ms]",
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2",
        )}
      >
        <Button
          variant="outline"
          className="flex-1 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] bg-transparent"
          onClick={handleClose}
        >
          取消
        </Button>
        <Button
          className={cn(
            "flex-1 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]",
            isPlan &&
              "bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 shadow-lg shadow-violet-500/20",
          )}
          onClick={handleCreate}
          disabled={!title.trim() || (isPlan && isRepeating && repeatCycle !== "daily" && planDays.length === 0)}
        >
          {isPlan ? (
            <>
              <Repeat className="w-4 h-4 mr-2" />
              创建计划
            </>
          ) : (
            <>
              <Plus className="w-4 h-4 mr-2" />
              创建任务
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
