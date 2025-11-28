"use client"

import { useState, useEffect, useRef } from "react"
import { useTodo } from "@/context/todo-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DatePicker } from "@/components/ui/date-picker"
import { CategoryInput } from "@/components/ui/category-input"
import { AnimatedField } from "@/components/ui/animated-field"
import { X, Flag, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { PRIORITY_CONFIG } from "@/lib/constants"

interface TodoEditorProps {
  todoId: string
  onClose: () => void
}

export function TodoEditor({ todoId, onClose }: TodoEditorProps) {
  const { todos, updateTodo, deleteTodo } = useTodo()
  const todo = todos.find((t) => t.id === todoId)
  const prevTodoIdRef = useRef(todoId)

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [dueDate, setDueDate] = useState("")
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium")
  const [category, setCategory] = useState("")
  const [isVisible, setIsVisible] = useState(false)
  const [isContentVisible, setIsContentVisible] = useState(false)

  useEffect(() => {
    if (todo) {
      setTitle(todo.title)
      setDescription(todo.description)
      setDueDate(todo.dueDate || "")
      setPriority(todo.priority)
      setCategory(todo.category)
    }
  }, [todo])

  useEffect(() => {
    if (prevTodoIdRef.current !== todoId) {
      setIsContentVisible(false)
      prevTodoIdRef.current = todoId
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setIsContentVisible(true))
      })
    }
  }, [todoId])

  useEffect(() => {
    requestAnimationFrame(() => {
      setIsVisible(true)
      setTimeout(() => setIsContentVisible(true), 50)
    })
  }, [])

  if (!todo) return null

  const handleSave = () => {
    updateTodo(todoId, { title, description, dueDate: dueDate || null, priority, category })
  }

  const handleDelete = () => {
    deleteTodo(todoId)
    onClose()
  }

  const handleDueDateChange = (value: string) => {
    setDueDate(value)
    updateTodo(todoId, { dueDate: value || null })
  }

  const handleCategoryChange = (value: string) => {
    setCategory(value)
    updateTodo(todoId, { category: value })
  }

  return (
    <div
      className={cn(
        "w-96 h-full bg-card border-l border-border flex flex-col rounded-lg shadow-2xl transition-all duration-300 ease-out",
        isVisible ? "opacity-100" : "opacity-0",
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h3 className="font-semibold text-card-foreground">编辑任务</h3>
        <button
          onClick={onClose}
          className="p-1.5 rounded-md hover:bg-muted transition-all duration-200 hover:rotate-90"
        >
          <X className="w-5 h-5 text-muted-foreground" />
        </button>
      </div>

      {/* Form */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatedField delay={50} isVisible={isContentVisible}>
          <Label htmlFor="title">标题</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={handleSave}
            className="bg-input border-border transition-all duration-200 focus:scale-[1.01]"
          />
        </AnimatedField>

        <AnimatedField delay={100} isVisible={isContentVisible}>
          <Label htmlFor="description">描述</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onBlur={handleSave}
            rows={4}
            className="bg-input border-border resize-none transition-all duration-200 focus:scale-[1.01]"
            placeholder="添加任务描述..."
          />
        </AnimatedField>

        <AnimatedField delay={150} isVisible={isContentVisible}>
          <Label className="flex items-center gap-2">截止日期</Label>
          <DatePicker value={dueDate} onChange={handleDueDateChange} />
        </AnimatedField>

        <AnimatedField delay={200} isVisible={isContentVisible}>
          <Label className="flex items-center gap-2">
            <Flag className="w-4 h-4" />
            优先级
          </Label>
          <Select
            value={priority}
            onValueChange={(value: "low" | "medium" | "high") => {
              setPriority(value)
              updateTodo(todoId, { priority: value })
            }}
          >
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
        </AnimatedField>

        <AnimatedField delay={250} isVisible={isContentVisible}>
          <Label>分类</Label>
          <CategoryInput value={category} onChange={handleCategoryChange} />
        </AnimatedField>

        <AnimatedField delay={300} isVisible={isContentVisible} className="pt-4 border-t border-border">
          <p className="text-xs text-muted-foreground">创建于 {todo.createdAt}</p>
        </AnimatedField>
      </div>

      {/* Footer */}
      <AnimatedField delay={350} isVisible={isContentVisible} className="p-4 border-t border-border">
        <Button
          variant="destructive"
          className="w-full transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
          onClick={handleDelete}
        >
          <Trash2 className="w-4 h-4 mr-2" />
          删除任务
        </Button>
      </AnimatedField>
    </div>
  )
}
