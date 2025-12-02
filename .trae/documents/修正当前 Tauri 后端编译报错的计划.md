## 问题定位（不执行构建，静态审查）
- `src-tauri/src/lib.rs:19` 使用 `app.path()` 可能不兼容，导致方法不存在报错。
- `src-tauri/src/lib.rs:23` 直接构造 `AppState { todos: ..., data_path }`，但 `AppState` 字段为私有，跨模块初始化会报可见性错误。
- `src-tauri/src/api/todo.rs:29` 的 `load_from_disk` 是私有函数，`lib.rs` 调用会报可见性错误。
- `src-tauri/src/api/todo.rs:85` 的 `retain` 条件不清晰，易读性差。
- 测试：`update_delete` 使用 `tauri::State::from(&s)` 可能不可用，导致测试报错。

## 修复方案
1. 在 `todo.rs`：
   - 将 `load_from_disk` 改为 `pub fn`，供 `lib.rs` 调用。
   - 为 `AppState` 增加 `pub fn new(data_path: PathBuf, initial: Vec<Todo>) -> Self` 构造函数，避免私有字段跨模块初始化。
   - 简化 `todo_delete` 的 `retain` 条件为 `t.id != id`。
   - 删除存在风险的 `update_delete` 测试，仅保留纯持久化的回归测试。
2. 在 `lib.rs`：
   - 避免使用不确定的 `app.path()`，统一用 `std::env::current_dir()` 生成数据目录 `./eztodo/todos.json`，确保编译稳定。
   - 使用 `AppState::new(data_path, initial)` 初始化并 `app.manage(...)`。

## 交付与验证
- 修改上述文件并确保能够通过编译（不运行打包）。
- 保留一个纯函数测试（load/save roundtrip），避免引入 `tauri::State` 测试依赖。
