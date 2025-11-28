"use client"

import { useState, useEffect, useRef } from "react"
import { useTodo } from "@/context/todo-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { NumberStepper } from "@/components/ui/number-stepper"
import { CategoryInput } from "@/components/ui/category-input"
import { AnimatedField } from "@/components/ui/animated-field"
import { RepeatToggle } from "@/components/ui/repeat-toggle"
import { X, Trash2, Repeat, CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { WEEK_DAYS, MONTH_DAYS } from "@/lib/constants"

interface PlanEditorProps {
  planId: string
  onClose: () => void
}

export function PlanEditor({ planId, onClose }: PlanEditorProps) {
  const { plans, updatePlan, deletePlan, completePlanOnce, endPlan } = useTodo()
  const plan = plans.find((p) => p.id === planId)
  const prevPlanIdRef = useRef(planId)

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [repeatCycle, setRepeatCycle] = useState<"daily" | "weekly" | "monthly">("weekly")
  const [planDays, setPlanDays] = useState<number[]>([])
  const [startTime, setStartTime] = useState("20:00")
  const [endTime, setEndTime] = useState("21:00")
  const [isRepeating, setIsRepeating] = useState(false)
  const [repeatCount, setRepeatCount] = useState<string>("")
  const [cycleTargetCount, setCycleTargetCount] = useState<string>("1")
  const [category, setCategory] = useState("生活")
  const [isContentVisible, setIsContentVisible] = useState(false)

  useEffect(() => {
    if (plan) {
      setTitle(plan.title)
      setDescription(plan.description)
      setRepeatCycle(plan.repeatCycle)
      setPlanDays(plan.planDays)
      setStartTime(plan.startTime)
      setEndTime(plan.endTime)
      setIsRepeating(plan.repeatCount === null || plan.repeatCount > 1)
      setRepeatCount(plan.repeatCount?.toString() || "")
      setCycleTargetCount(plan.cycleTargetCount?.toString() || "1")
      setCategory(plan.category)
    }
  }, [plan])

  useEffect(() => {
    if (prevPlanIdRef.current !== planId) {
      setIsContentVisible(false)
      prevPlanIdRef.current = planId
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setIsContentVisible(true))
      })
    }
  }, [planId])

  useEffect(() => {
    requestAnimationFrame(() => setTimeout(() => setIsContentVisible(true), 50))
  }, [])

  if (!plan) return null

  const isPlanEnded = !plan.active && plan.repeatCount && plan.totalCompletedCount >= plan.repeatCount
  const isCycleCompleted = plan.currentCount >= plan.cycleTargetCount

  const toggleDay = (day: number) => {
    const newDays = planDays.includes(day)
      ? planDays.filter((d) => d !== day)
      : [...planDays, day].sort((a, b) => a - b)
    setPlanDays(newDays)
    updatePlan(planId, { planDays: newDays })
  }

  const handleDelete = () => {
    deletePlan(planId)
    onClose()
  }

  const handleCategoryChange = (value: string) => {
    setCategory(value)
    updatePlan(planId, { category: value })
  }

  const handleCycleTargetChange = (value: string) => {
    setCycleTargetCount(value)
    updatePlan(planId, { cycleTargetCount: value ? Number.parseInt(value) : 1 })
  }

  const handleRepeatCountChange = (value: string) => {
    setRepeatCount(value)
    updatePlan(planId, { repeatCount: value ? Number.parseInt(value) : null })
  }

  const handleRepeatingChange = (value: boolean) => {
    setIsRepeating(value)
    if (!value) {
      setRepeatCount("1")
      updatePlan(planId, { repeatCount: 1 })
    } else {
      setRepeatCount("")
      updatePlan(planId, { repeatCount: null })
    }
  }

  return (
    <div className="w-96 h-full border-l border-border bg-card flex flex-col shadow-2xl">
      {/* Header */}
      <div className="p-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300",
              isPlanEnded ? "bg-green-500/20" : isCycleCompleted ? "bg-emerald-500/20" : "bg-violet-500/20",
            )}
          >
            {isPlanEnded || isCycleCompleted ? (
              <CheckCircle2 className={cn("w-4 h-4", isPlanEnded ? "text-green-400" : "text-emerald-400")} />
            ) : (
              <Repeat className="w-4 h-4 text-violet-400" />
            )}
          </div>
          <h3 className="font-semibold text-foreground">
            {isPlanEnded ? "已完成的计划" : isCycleCompleted ? "本周期已完成" : "编辑计划"}
          </h3>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} className="hover:rotate-90 transition-all duration-200">
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Form */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* 进度条 */}
        <AnimatedField delay={50} isVisible={isContentVisible}>
          <div
            className={cn(
              "p-3 rounded-lg border",
              isPlanEnded
                ? "bg-green-500/10 border-green-500/30"
                : isCycleCompleted
                  ? "bg-emerald-500/10 border-emerald-500/30"
                  : "bg-violet-500/10 border-violet-500/30",
            )}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">本周期进度</span>
              <span className={cn("text-sm font-medium", isCycleCompleted ? "text-emerald-400" : "text-violet-400")}>
                {plan.currentCount} / {plan.cycleTargetCount} 次
              </span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden mb-3">
              <div
                className={cn(
                  "h-full transition-all duration-300",
                  isCycleCompleted ? "bg-emerald-500" : "bg-violet-500",
                )}
                style={{ width: `${Math.min((plan.currentCount / plan.cycleTargetCount) * 100, 100)}%` }}
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">总完成次数</span>
              <span className={cn("text-sm font-medium", isPlanEnded ? "text-green-400" : "text-violet-400")}>
                {plan.totalCompletedCount} 次{plan.repeatCount && ` / ${plan.repeatCount} 次`}
              </span>
            </div>
            {plan.repeatCount && (
              <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className={cn("h-full transition-all duration-300", isPlanEnded ? "bg-green-500" : "bg-violet-500")}
                  style={{ width: `${Math.min((plan.totalCompletedCount / plan.repeatCount) * 100, 100)}%` }}
                />
              </div>
            )}
          </div>
        </AnimatedField>

        {/* 重复开关 */}
        <AnimatedField delay={250} isVisible={isContentVisible}>
          <RepeatToggle
            isRepeating={isRepeating}
            onToggle={() => handleRepeatingChange(!isRepeating)}
            disabled={!!isPlanEnded}
          />
        </AnimatedField>

        <div
          className={cn(
            "space-y-4 transition-all duration-500 ease-out overflow-hidden",
            isRepeating ? "max-h-[250px] opacity-100" : "max-h-0 opacity-0",
          )}
        >
          <AnimatedField delay={275} isVisible={isContentVisible && isRepeating}>
            <Label>重复周期</Label>
            <Select
              value={repeatCycle}
              onValueChange={(v: "daily" | "weekly" | "monthly") => {
                setRepeatCycle(v)
                updatePlan(planId, { repeatCycle: v })
              }}
              disabled={!!isPlanEnded}
            >
              <SelectTrigger className="bg-input">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">每天</SelectItem>
                <SelectItem value="weekly">每周</SelectItem>
                <SelectItem value="monthly">每月</SelectItem>
              </SelectContent>
            </Select>
          </AnimatedField>

          <AnimatedField delay={300} isVisible={isContentVisible && isRepeating}>
            <Label>总重复次数（留空为无限）</Label>
            <NumberStepper
              value={repeatCount}
              onChange={handleRepeatCountChange}
              min={1}
              max={999}
              placeholder="无限"
              allowEmpty
              disabled={!!isPlanEnded}
            />
          </AnimatedField>
        </div>

        {/* 计划日 - 只在开启重复且不是每天时显示 */}
        {isRepeating && repeatCycle !== "daily" && (
          <AnimatedField delay={325} isVisible={isContentVisible}>
            <Label>计划日</Label>
            <div className="flex flex-wrap gap-2">
              {(repeatCycle === "weekly" ? WEEK_DAYS : MONTH_DAYS).map((day) => (
                <button
                  key={day.value}
                  type="button"
                  onClick={() => !isPlanEnded && toggleDay(day.value)}
                  disabled={!!isPlanEnded}
                  className={cn(
                    "px-3 py-1.5 text-sm rounded-md border transition-all duration-200",
                    planDays.includes(day.value)
                      ? "bg-violet-500 border-violet-500 text-white"
                      : "border-border hover:border-violet-500/50",
                    isPlanEnded && "opacity-50 cursor-not-allowed",
                  )}
                >
                  {day.label}
                </button>
              ))}
            </div>
          </AnimatedField>
        )}

        {/* 时间 */}
        <AnimatedField delay={350} isVisible={isContentVisible}>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>开始时间</Label>
              <Input
                type="time"
                value={startTime}
                onChange={(e) => {
                  setStartTime(e.target.value)
                  updatePlan(planId, { startTime: e.target.value })
                }}
                className="bg-input"
                disabled={!!isPlanEnded}
              />
            </div>
            <div className="space-y-2">
              <Label>结束时间</Label>
              <Input
                type="time"
                value={endTime}
                onChange={(e) => {
                  setEndTime(e.target.value)
                  updatePlan(planId, { endTime: e.target.value })
                }}
                className="bg-input"
                disabled={!!isPlanEnded}
              />
            </div>
          </div>
        </AnimatedField>

        {/* 每周期目标次数 */}
        <AnimatedField delay={375} isVisible={isContentVisible}>
          <Label>每周期目标次数</Label>
          <NumberStepper
            value={cycleTargetCount}
            onChange={handleCycleTargetChange}
            min={1}
            max={99}
            placeholder="1"
            disabled={!!isPlanEnded}
          />
          <p className="text-xs text-muted-foreground mt-1">达到目标次数后，本周期计划自动完成</p>
        </AnimatedField>

        {/* 分类 */}
        <AnimatedField delay={400} isVisible={isContentVisible}>
          <Label>分类</Label>
          <CategoryInput value={category} onChange={handleCategoryChange} disabled={!!isPlanEnded} />
        </AnimatedField>
      </div>

      {/* Footer */}
      <AnimatedField delay={450} isVisible={isContentVisible} className="p-4 border-t border-border">
        <Button
          variant="destructive"
          className="w-full transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
          onClick={handleDelete}
        >
          <Trash2 className="w-4 h-4 mr-2" />
          删除计划
        </Button>
      </AnimatedField>
    </div>
  )
}
