## 目标
- 在 Tauri 后端实现 Todo 的新增、保存与读取。
- 保持与现有前端（Next 静态导出）一致的交互方式，通过 `invoke` 调用命令。

## 架构与存储选型
- 后端形态：扩展 Tauri 命令（与桌面应用同进程）。
- 存储：轻量 JSON 文件，位于应用数据目录（避免外部依赖，适合离线）。
- 运行内缓存：使用 `State<RwLock<Vec<Todo>>>` 作为内存快照，启动时加载，写入时同步到磁盘。

## 目录与文件
- 新增 `src-tauri/src/api/todo.rs` 定义领域命令：`todo_create`、`todo_list`、`todo_get`、`todo_update`、`todo_delete`。
- 在 `src-tauri/src/lib.rs` 注册命令并初始化状态（参考：`src-tauri/src/lib.rs:9-13`）。

## 数据类型
```rs
use serde::{Serialize, Deserialize};

#[derive(Serialize, Deserialize, Clone)]
pub struct Todo { pub id: String, pub title: String, pub content: Option<String>, pub done: bool, pub created_at: i64, pub updated_at: i64 }

#[derive(Deserialize)]
pub struct TodoCreateInput { pub title: String, pub content: Option<String> }
```

## 命令设计
```rs
#[tauri::command]
pub async fn todo_create(state: tauri::State<'_, AppState>, input: TodoCreateInput) -> Result<Todo, String> { /* 生成id与时间，写入内存与文件 */ }

#[tauri::command]
pub async fn todo_list(state: tauri::State<'_, AppState>) -> Result<Vec<Todo>, String> { /* 返回内存快照 */ }

#[tauri::command]
pub async fn todo_get(state: tauri::State<'_, AppState>, id: String) -> Result<Todo, String> { /* 查找并返回 */ }

#[tauri::command]
pub async fn todo_update(state: tauri::State<'_, AppState>, todo: Todo) -> Result<Todo, String> { /* 覆盖更新并持久化 */ }

#[tauri::command]
pub async fn todo_delete(state: tauri::State<'_, AppState>, id: String) -> Result<bool, String> { /* 删除并持久化 */ }
```

## 状态管理与持久化
```rs
use std::sync::RwLock;

pub struct AppState { pub todos: RwLock<Vec<Todo>>, pub data_path: std::path::PathBuf }

fn load_from_disk(path: &std::path::Path) -> Vec<Todo> { /* 若文件缺失返回空vec */ }

fn save_to_disk(path: &std::path::Path, todos: &Vec<Todo>) -> Result<(), String> { /* 覆盖写入 */ }
```
- 应用启动时：解析应用数据目录，定位 `todos.json`，加载为 `Vec<Todo>`。
- 每次变更：更新内存后调用 `save_to_disk` 原子化写入（临时文件写入后替换）。

## 前端调用封装
```ts
import { invoke } from "@tauri-apps/api/core";

export async function todoCreate(input: { title: string; content?: string }) {
    return await invoke("todo_create", { input });
}

export async function todoList() {
    return await invoke("todo_list");
}

export async function todoGet(id: string) {
    return await invoke("todo_get", { id });
}
```

## 安全与可靠性
- 输入校验：前端用 `zod`，后端校验空标题与长度上限。
- 错误分层：`BAD_INPUT`、`IO_ERROR`、`NOT_FOUND`、`INTERNAL`，统一转为字符串返回。
- 文件写入：使用临时文件 + 重命名避免部分写入；并发通过 `RwLock` 保证一致性。

## 性能与复杂度
- 命令复杂度：
  - `todo_create` O(1)，`todo_get` O(n)（可加索引改为 O(1)），`todo_list` O(n)。
- 优化建议：
  - 读取热点加 `HashMap` 索引（id→位置），大列表分页或窗口化。
  - 批量更新合并写入，减少磁盘 I/O。

## 集成步骤
1. 创建 `api/todo.rs` 并实现类型、命令、持久化函数。
2. 在 `lib.rs` 初始化 `AppState`，注册命令。
3. 在前端新增 `lib/tauriClient.ts` 并封装调用函数。
4. 为核心纯函数添加单元测试（加载/保存/更新）并在 CI 执行。

## 参考文件
- 命令注册入口：`src-tauri/src/lib.rs:9-13`
- 示例命令：`src-tauri/src/lib.rs:3-5`
- 程序入口：`src-tauri/src/main.rs:4-6`
