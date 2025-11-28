"use client"

import { useState, useRef } from "react"
import { getCurrentWindow } from "@tauri-apps/api/window"
import { Sidebar } from "@/components/sidebar"
import { TodoList } from "@/components/todo-list"
import { TodoEditor } from "@/components/todo-editor"
import { TodoCreator } from "@/components/todo-creator"
import { PlanEditor } from "@/components/plan-editor"
import { HistoryView } from "@/components/history-view"
import { Settings } from "@/components/settings"
import { WindowControls } from "@/components/window-controls"
import { TodoProvider } from "@/context/todo-context"

export type View = "list" | "important" | "completed" | "history" | "settings"

type EditorType = "todo" | "plan" | "create" | null

export default function Home() {
  const [currentView, setCurrentView] = useState<View>("list")
  const [editingTodoId, setEditingTodoId] = useState<string | null>(null)
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [editorType, setEditorType] = useState<EditorType>(null)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [isClosing, setIsClosing] = useState(false)
  const [closingContent, setClosingContent] = useState<{
    type: EditorType
    todoId: string | null
    planId: string | null
  } | null>(null)
  const previousViewRef = useRef<View>("list")

  const handleViewChange = (view: View) => {
    if (view === "settings") {
      if (currentView === "settings") {
        setCurrentView(previousViewRef.current)
        return
      }
      previousViewRef.current = currentView
    }
    setCurrentView(view)
    if (editingTodoId || editingPlanId || isCreating) {
      setClosingContent({ type: editorType, todoId: editingTodoId, planId: editingPlanId })
      setIsClosing(true)
      setEditingTodoId(null)
      setEditingPlanId(null)
      setIsCreating(false)
      setEditorType(null)
      setTimeout(() => {
        setIsClosing(false)
        setClosingContent(null)
      }, 200)
    }
  }

  const closePanel = () => {
    if (isClosing) return
    setClosingContent({ type: editorType, todoId: editingTodoId, planId: editingPlanId })
    setIsClosing(true)
    setEditingTodoId(null)
    setEditingPlanId(null)
    setIsCreating(false)
    setEditorType(null)
    setTimeout(() => {
      setIsClosing(false)
      setClosingContent(null)
    }, 200)
  }

  const handleEditTodo = (id: string) => {
    if (editingTodoId === id && editorType === "todo") {
      closePanel()
      return
    }

    if (editorType === "plan" || editorType === "create") {
      setIsTransitioning(true)
      setTimeout(() => {
        setIsCreating(false)
        setEditingPlanId(null)
        setEditingTodoId(id)
        setEditorType("todo")
        setIsTransitioning(false)
      }, 150)
    } else {
      setIsCreating(false)
      setEditingPlanId(null)
      setEditingTodoId(id)
      setEditorType("todo")
    }
  }

  const handleEditPlan = (id: string) => {
    if (editingPlanId === id && editorType === "plan") {
      closePanel()
      return
    }

    if (editorType === "todo" || editorType === "create") {
      setIsTransitioning(true)
      setTimeout(() => {
        setIsCreating(false)
        setEditingTodoId(null)
        setEditingPlanId(id)
        setEditorType("plan")
        setIsTransitioning(false)
      }, 150)
    } else {
      setIsCreating(false)
      setEditingTodoId(null)
      setEditingPlanId(id)
      setEditorType("plan")
    }
  }

  const handleToggleCreate = () => {
    if (isCreating) {
      closePanel()
    } else {
      if (editorType === "todo" || editorType === "plan") {
        setIsTransitioning(true)
        setTimeout(() => {
          setEditingTodoId(null)
          setEditingPlanId(null)
          setIsCreating(true)
          setEditorType("create")
          setIsTransitioning(false)
        }, 150)
      } else {
        setEditingTodoId(null)
        setEditingPlanId(null)
        setIsCreating(true)
        setEditorType("create")
      }
    }
  }

  const handleClosePanel = () => {
    closePanel()
  }

  const showRightPanel = editingTodoId || editingPlanId || isCreating || isClosing

  const renderPanelContent = () => {
    if (isClosing && closingContent) {
      if (closingContent.type === "todo" && closingContent.todoId) {
        return <TodoEditor todoId={closingContent.todoId} onClose={handleClosePanel} />
      }
      if (closingContent.type === "plan" && closingContent.planId) {
        return <PlanEditor planId={closingContent.planId} onClose={handleClosePanel} />
      }
      if (closingContent.type === "create") {
        return <TodoCreator view={currentView} onClose={handleClosePanel} />
      }
    }
    if (editingTodoId) {
      return <TodoEditor todoId={editingTodoId} onClose={handleClosePanel} />
    }
    if (editingPlanId) {
      return <PlanEditor planId={editingPlanId} onClose={handleClosePanel} />
    }
    if (isCreating) {
      return <TodoCreator view={currentView} onClose={handleClosePanel} />
    }
    return null
  }

  return (
    <TodoProvider>
      <div className="flex h-screen bg-background relative">
        <div
          className="fixed top-0 left-0 right-0 h-9 z-40 titlebar"
          onDoubleClick={async () => {
            const win = getCurrentWindow()
            await win.toggleMaximize()
          }}
          onMouseDown={async (e) => {
            if (e.button !== 0) return
            const win = getCurrentWindow()
            await win.startDragging()
          }}
        />
        <div className="absolute top-0 right-0 z-50 no-drag">
          <WindowControls />
        </div>

        <Sidebar currentView={currentView} onViewChange={handleViewChange} />
        <main className="flex-1 flex overflow-hidden relative">
          <div
            className={`flex-1 flex transition-all duration-300 ease-out pt-6 relative z-30 ${
              currentView === "settings" || currentView === "history"
                ? "opacity-0 -translate-x-4 pointer-events-none absolute inset-0"
                : "opacity-100 translate-x-0"
            }`}
          >
            <TodoList
              view={currentView}
              onEditTodo={handleEditTodo}
              onEditPlan={handleEditPlan}
              editingTodoId={editingTodoId}
              editingPlanId={editingPlanId}
              onToggleCreate={handleToggleCreate}
              isCreating={isCreating}
            />
          </div>

          {showRightPanel && (
            <>
              <div
                className={`fixed inset-0 bg-black/40 z-20 transition-opacity duration-200 cursor-pointer ${
                  isClosing ? "opacity-0" : "opacity-100 animate-in fade-in"
                }`}
                onClick={handleClosePanel}
              />
              <div
                className={`fixed right-0 top-0 bottom-0 z-50 transition-all duration-200 ease-out ${
                  isClosing
                    ? "opacity-0 translate-x-8 scale-95"
                    : isTransitioning
                      ? "opacity-0 translate-x-4 scale-95"
                      : "opacity-100 translate-x-0 scale-100 animate-in slide-in-from-right duration-300"
                }`}
              >
                {renderPanelContent()}
              </div>
            </>
          )}

          <div
            className={`absolute inset-0 pt-6 transition-all duration-300 ease-out ${
              currentView === "history" ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4 pointer-events-none"
            }`}
          >
            <HistoryView />
          </div>

          <div
            className={`absolute inset-0 pt-6 transition-all duration-300 ease-out ${
              currentView === "settings" ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4 pointer-events-none"
            }`}
          >
            <Settings onBack={() => setCurrentView(previousViewRef.current)} />
          </div>
        </main>
      </div>
    </TodoProvider>
  )
}
