"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Tag, ChevronDown, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { useTodo } from "@/context/todo-context"
import { createPortal } from "react-dom"

interface CategoryInputProps {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
}

export function CategoryInput({ value, onChange, disabled = false }: CategoryInputProps) {
  const { todos, plans } = useTodo()
  const [isOpen, setIsOpen] = useState(false)
  const [inputValue, setInputValue] = useState(value)
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0 })
  const containerRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const existingCategories = Array.from(new Set([...todos.map((t) => t.category), ...plans.map((p) => p.category)]))
    .filter(Boolean)
    .sort()

  const filteredCategories = existingCategories.filter((cat) => cat.toLowerCase().includes(inputValue.toLowerCase()))

  const showCreateOption = inputValue.trim() && !existingCategories.includes(inputValue.trim())

  useEffect(() => {
    setInputValue(value)
  }, [value])

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
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  useEffect(() => {
    if (isOpen) {
      updatePosition()
    }
  }, [isOpen])

  const handleSelect = (category: string) => {
    setInputValue(category)
    onChange(category)
    setIsOpen(false)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value)
    setIsOpen(true)
  }

  const handleInputBlur = () => {
    setTimeout(() => {
      if (inputValue.trim()) {
        onChange(inputValue.trim())
      }
    }, 150)
  }

  const handleClear = () => {
    setInputValue("")
    onChange("")
    inputRef.current?.focus()
  }

  const dropdownContent =
    isOpen &&
    !disabled &&
    (filteredCategories.length > 0 || showCreateOption) &&
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
        <div className="max-h-48 overflow-y-auto p-1">
          {showCreateOption && (
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => handleSelect(inputValue.trim())}
              className={cn(
                "w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md text-left",
                "hover:bg-primary/20 text-primary transition-colors",
              )}
            >
              <Tag className="w-4 h-4" />
              创建 "{inputValue.trim()}"
            </button>
          )}
          {filteredCategories.map((category) => (
            <button
              key={category}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => handleSelect(category)}
              className={cn(
                "w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md text-left",
                "hover:bg-muted/80 transition-colors",
                category === value && "bg-muted",
              )}
            >
              <Tag className="w-4 h-4 text-muted-foreground" />
              {category}
            </button>
          ))}
        </div>
      </div>,
      document.body,
    )

  return (
    <div className="relative">
      <div
        ref={triggerRef}
        className={cn(
          "flex items-center gap-2 bg-input border border-border rounded-lg px-3 py-2 transition-all duration-200",
          "focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary/50",
          isOpen && "ring-2 ring-primary/20 border-primary/50",
          disabled && "opacity-50 cursor-not-allowed",
        )}
      >
        <Tag className="w-4 h-4 text-muted-foreground flex-shrink-0" />
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          onBlur={handleInputBlur}
          placeholder="选择或输入分类..."
          disabled={disabled}
          className={cn(
            "flex-1 bg-transparent border-0 outline-none text-sm",
            "placeholder:text-muted-foreground/50",
            disabled && "cursor-not-allowed",
          )}
        />
        {inputValue && !disabled && (
          <button type="button" onClick={handleClear} className="p-0.5 rounded hover:bg-muted transition-colors">
            <X className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
        )}
        <ChevronDown
          className={cn("w-4 h-4 text-muted-foreground transition-transform duration-200", isOpen && "rotate-180")}
        />
      </div>

      {/* 下拉框通过 Portal 渲染 */}
      {dropdownContent}
    </div>
  )
}
