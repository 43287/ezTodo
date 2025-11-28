# Windows Todo List 项目文档

## 项目概述

这是一个采用 Windows 11 Fluent Design 风格的 Todo List 桌面应用，使用 React 和 Next.js 构建。应用支持任务管理和计划管理两大核心功能，具有丰富的动画效果和现代化的用户界面。

---

## 技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| Next.js | 16+ | React 框架，App Router |
| React | 19+ | UI 组件库 |
| TypeScript | 5+ | 类型安全 |
| Tailwind CSS | 4.0 | 样式框架 |
| shadcn/ui | 最新 | UI 组件库 |
| Lucide React | 最新 | 图标库 |

---

## 项目结构

\`\`\`
├── app/
│   ├── globals.css          # 全局样式和设计令牌
│   ├── layout.tsx           # 应用布局
│   └── page.tsx             # 主页面入口
├── components/
│   ├── ui/                  # 可复用 UI 组件
│   │   ├── animated-field.tsx   # 动画字段包装器（共享）
│   │   ├── category-input.tsx   # 分类输入（带历史记录）
│   │   ├── date-picker.tsx      # 日期选择器
│   │   ├── number-stepper.tsx   # 数字增减器
│   │   ├── plan-toggle.tsx      # 计划切换开关（共享）
│   │   ├── repeat-toggle.tsx    # 重复周期开关（共享）
│   │   └── ...                  # shadcn/ui 组件
│   ├── sidebar.tsx          # 侧边栏导航
│   ├── todo-list.tsx        # 任务/计划列表视图
│   ├── todo-item.tsx        # 任务项组件
│   ├── plan-item.tsx        # 计划项组件
│   ├── todo-creator.tsx     # 统一的任务/计划创建面板
│   ├── todo-editor.tsx      # 任务编辑面板
│   ├── plan-editor.tsx      # 计划编辑面板
│   ├── history-view.tsx     # 历程视图
│   ├── settings.tsx         # 设置页面
│   └── window-controls.tsx  # 窗口控制按钮
├── context/
│   └── todo-context.tsx     # 全局状态管理
├── lib/
│   ├── constants.ts         # 共享常量定义
│   ├── utils.ts             # 通用工具函数 (cn)
│   └── utils/
│       └── date.ts          # 日期相关工具函数
└── docs/
    └── README.md            # 本文档
\`\`\`

---

## 共享组件

### AnimatedField (`components/ui/animated-field.tsx`)

动画字段包装器，用于表单字段的入场动画，在多个编辑器中复用：

\`\`\`tsx
import { AnimatedField } from "@/components/ui/animated-field"

<AnimatedField delay={100} isVisible={true}>
  <Label>标题</Label>
  <Input />
</AnimatedField>
\`\`\`

### RepeatToggle (`components/ui/repeat-toggle.tsx`)

重复周期开关，用于计划的重复设置：

\`\`\`tsx
import { RepeatToggle } from "@/components/ui/repeat-toggle"

<RepeatToggle
  isRepeating={isRepeating}
  onToggle={() => setIsRepeating(!isRepeating)}
  disabled={false}
  title="周期重复"
/>
\`\`\`

### PlanToggle (`components/ui/plan-toggle.tsx`)

计划/任务切换开关，用于创建面板：

\`\`\`tsx
import { PlanToggle } from "@/components/ui/plan-toggle"

<PlanToggle
  isPlan={isPlan}
  onToggle={() => setIsPlan(!isPlan)}
  isVisible={true}
/>
\`\`\`

---

## 共享常量 (`lib/constants.ts`)

集中管理所有共享常量，避免重复定义：

| 常量 | 类型 | 用途 |
|------|------|------|
| `WEEK_DAYS` | `Array<{value, label}>` | 星期选择器选项 |
| `WEEK_DAY_LABELS` | `string[]` | 星期标签（周日-周六） |
| `MONTH_DAYS` | `Array<{value, label}>` | 月份日期选项（1-31日） |
| `CYCLE_LABELS` | `Record<string, string>` | 重复周期标签 |
| `PRIORITY_CONFIG` | `Record<string, {color, label}>` | 优先级配置 |
| `URGENCY_STYLES` | `Record<string, {...}>` | 紧迫度样式配置 |
| `CATEGORIES` | `string[]` | 分类选项 |

---

## 日期工具函数 (`lib/utils/date.ts`)

| 函数 | 参数 | 返回值 | 功能 |
|------|------|--------|------|
| `getUrgencyLevel()` | `dueDate: string \| null` | `UrgencyLevel` | 计算截止日期紧迫程度 |
| `formatDate()` | `date?: Date` | `string` | 格式化日期为 YYYY-MM-DD |
| `formatTimestamp()` | `timestamp: string` | `string` | 格式化时间戳为可读格式 |
| `groupByDate()` | `items: T[]` | `Record<string, T[]>` | 按日期分组 |
| `formatDateLabel()` | `dateStr: string` | `string` | 格式化日期标题（今天、昨天等） |

---

## 核心数据模型

### Todo（任务）

\`\`\`typescript
interface Todo {
  id: string
  title: string
  description: string
  completed: boolean
  important: boolean
  dueDate: string | null
  createdAt: string
  completedAt?: string
  priority: "low" | "medium" | "high"
  category: string
  fromPlanId?: string  // 关联的计划ID（如果由计划生成）
}
\`\`\`

### Plan（计划）

\`\`\`typescript
interface Plan {
  id: string
  title: string
  description: string
  repeatCycle: "daily" | "weekly" | "monthly"  // 重复周期
  planDays: number[]           // 计划日（周几或月几号）
  startTime: string            // 开始时间 (HH:mm)
  endTime: string              // 结束时间 (HH:mm)
  repeatCount: number | null   // 重复次数（null为无限，1为不重复）
  currentCount: number         // 当前周期完成次数
  cycleTargetCount: number     // 每周期目标次数
  totalCompletedCount: number  // 总完成次数
  lastResetDate: string        // 上次重置日期
  createdAt: string
  category: string
  active: boolean              // 是否启用
  important: boolean           // 重要标记
}
\`\`\`

### HistoryRecord（历程记录）

\`\`\`typescript
interface HistoryRecord {
  id: string
  type: "todo_created" | "todo_completed" | "plan_created" | "plan_completed"
  title: string
  timestamp: string
  itemId: string
  itemType: "todo" | "plan"
}
\`\`\`

---

## 视图说明

| 视图 | 说明 |
|------|------|
| all | 所有任务和计划，分组显示（进行中/本周期完成/已暂停/已完成） |
| important | 标记为重要的任务和计划 |
| completed | 已完成的任务和达到目标的计划 |
| history | 操作历程记录 |
| settings | 应用设置 |

---

## Context API 方法

\`\`\`typescript
// 任务操作
addTodo(todo: Omit<Todo, "id" | "createdAt">): void
updateTodo(id: string, updates: Partial<Todo>): void
deleteTodo(id: string): void
toggleComplete(id: string): void
toggleImportant(id: string): void

// 计划操作
addPlan(plan: Omit<Plan, "id" | "createdAt" | ...>): void
updatePlan(id: string, updates: Partial<Plan>): void
deletePlan(id: string): void
togglePlanActive(id: string): void
togglePlanImportant(id: string): void
completePlanOnce(id: string): void    // 完成一次计划
endPlan(id: string): void             // 结束计划

// 设置操作
updateSettings(updates: Partial<Settings>): void
\`\`\`

---

## 动画效果

### 面板动画
- **打开**: `slide-in-from-right` + `opacity` 过渡
- **关闭**: 保留内容直到动画完成，向右滑出

### 列表项动画
- **入场**: 交错动画 (`animationDelay: index * 50ms`)
- **悬停**: `scale-[1.005]` + 背景色变化
- **选中**: `scale-[1.01]` + 阴影效果

### 开关动画
- 渐变背景过渡
- 滑块位移 + 缩放
- 图标旋转效果

---

## 计划周期重置逻辑

计划在以下情况下自动重置 `currentCount`:

- **每天**: 日期变化时
- **每周**: 进入新的一周时（周一为起点）
- **每月**: 进入新的月份时

当 `currentCount >= cycleTargetCount` 时，计划显示为"本周期已完成"状态。

---

## 重构优化记录

### 1. 提取共享组件
- `AnimatedField`: 从 `todo-editor`、`plan-editor`、`todo-creator` 中提取
- `RepeatToggle`: 从多处重复的开关代码中提取
- `PlanToggle`: 从 `todo-creator` 中提取

### 2. 删除冗余文件
- `plan-creator.tsx`: 功能已整合到 `todo-creator.tsx`
- `plan-list.tsx`: 功能已整合到 `todo-list.tsx`
- `editor-panel.tsx`: 未被实际使用
- `toggle-switch.tsx`: 未被实际使用

### 3. 常量集中管理
将分散在各组件中的常量提取到 `lib/constants.ts`

### 4. 工具函数模块化
日期相关函数提取到 `lib/utils/date.ts`

---

## 未来扩展

- [ ] 数据持久化（localStorage / IndexedDB）
- [ ] 后端 API 集成
- [ ] 多语言支持
- [ ] 深色/浅色主题切换
- [ ] 拖拽排序
- [ ] 子任务支持
- [ ] 标签系统
- [ ] 日历视图
- [ ] 数据导出/导入
