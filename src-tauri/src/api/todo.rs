use serde::{Deserialize, Serialize};
use std::{fs, io::Write, path::PathBuf, sync::RwLock, time::{SystemTime, UNIX_EPOCH}};
use time::OffsetDateTime;

#[derive(Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct Todo {
	pub id: String,
	pub title: String,
	pub description: String,
	pub completed: bool,
	pub important: bool,
	pub due_date: Option<String>,
	pub created_at: String,
	pub completed_at: Option<String>,
	pub priority: String,
	pub category: String,
	pub from_plan_id: Option<String>,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct TodoCreateInput {
	title: String,
	description: Option<String>,
	important: Option<bool>,
	due_date: Option<String>,
	priority: Option<String>,
	category: Option<String>,
	from_plan_id: Option<String>,
}

pub struct AppState {
	todos: RwLock<Vec<Todo>>,
	data_path: PathBuf,
}

impl AppState {
	pub fn new(data_path: PathBuf, initial: Vec<Todo>) -> Self {
		Self { todos: RwLock::new(initial), data_path }
	}

	pub fn snapshot(&self) -> Result<Vec<Todo>, String> {
		self.todos.read().map_err(|_| "LOCK_ERROR".to_string()).map(|v| v.clone())
	}
}

fn now_ms() -> i64 {
	SystemTime::now().duration_since(UNIX_EPOCH).unwrap().as_millis() as i64
}

fn today_str() -> String {
	let now = OffsetDateTime::now_utc();
	format!("{:04}-{:02}-{:02}", now.year(), u8::try_from(now.month() as i32).unwrap_or(1), now.day())
}

pub fn load_from_disk(path: &std::path::Path) -> Vec<Todo> {
	match fs::read_to_string(path) {
		Ok(s) => serde_json::from_str::<Vec<Todo>>(&s).unwrap_or_default(),
		Err(_) => Vec::new(),
	}
}

fn save_to_disk(path: &std::path::Path, todos: &Vec<Todo>) -> Result<(), String> {
	if let Some(parent) = path.parent() { fs::create_dir_all(parent).map_err(|e| e.to_string())? }
	let tmp = path.with_extension("json.tmp");
	let data = serde_json::to_vec(todos).map_err(|e| e.to_string())?;
	let mut f = fs::File::create(&tmp).map_err(|e| e.to_string())?;
	f.write_all(&data).map_err(|e| e.to_string())?;
	fs::rename(&tmp, path).map_err(|e| e.to_string())?;
	Ok(())
}

#[tauri::command]
pub fn todo_create(state: tauri::State<'_, AppState>, input: TodoCreateInput) -> Result<Todo, String> {
	let mut todos = state.todos.write().map_err(|_| "LOCK_ERROR".to_string())?;
	if input.title.trim().is_empty() { return Err("BAD_INPUT".to_string()) }
	let now = now_ms();
	let t = Todo {
		id: now.to_string(),
		title: input.title,
		description: input.description.unwrap_or_default(),
		completed: false,
		important: input.important.unwrap_or(false),
		due_date: input.due_date,
		created_at: today_str(),
		completed_at: None,
		priority: input.priority.unwrap_or_else(|| "medium".into()),
		category: input.category.unwrap_or_default(),
		from_plan_id: input.from_plan_id,
	};
	todos.push(t.clone());
	save_to_disk(&state.data_path, &todos)?;
	Ok(t)
}

#[tauri::command]
pub fn todo_list(state: tauri::State<'_, AppState>) -> Result<Vec<Todo>, String> {
	let todos = state.todos.read().map_err(|_| "LOCK_ERROR".to_string())?;
	Ok(todos.clone())
}

#[tauri::command]
pub fn todo_get(state: tauri::State<'_, AppState>, id: String) -> Result<Todo, String> {
	let todos = state.todos.read().map_err(|_| "LOCK_ERROR".to_string())?;
	match todos.iter().find(|t| t.id == id) { Some(t) => Ok(t.clone()), None => Err("NOT_FOUND".to_string()) }
}

#[tauri::command]
pub fn todo_update(state: tauri::State<'_, AppState>, todo: Todo) -> Result<Todo, String> {
	let mut todos = state.todos.write().map_err(|_| "LOCK_ERROR".to_string())?;
	if let Some(idx) = todos.iter().position(|t| t.id == todo.id) {
		let new = todo.clone();
		todos[idx] = new.clone();
		save_to_disk(&state.data_path, &todos)?;
		Ok(new)
	} else { Err("NOT_FOUND".to_string()) }
}

#[tauri::command]
pub fn todo_delete(state: tauri::State<'_, AppState>, id: String) -> Result<bool, String> {
	let mut todos = state.todos.write().map_err(|_| "LOCK_ERROR".to_string())?;
	let len0 = todos.len();
	todos.retain(|t| t.id != id);
	if todos.len() == len0 { return Err("NOT_FOUND".to_string()) }
	save_to_disk(&state.data_path, &todos)?;
	Ok(true)
}

#[cfg(test)]
mod tests {
	use super::*;
	use std::env;

	#[test]
	fn load_save_roundtrip() {
		let dir = env::temp_dir().join("eztodo_test");
		fs::create_dir_all(&dir).unwrap();
		let path = dir.join("todos.json");
		let a = Todo {
			id: "1".into(),
			title: "t".into(),
			description: "d".into(),
			completed: false,
			important: false,
			due_date: None,
			created_at: "2025-01-01".into(),
			completed_at: None,
			priority: "medium".into(),
			category: "cat".into(),
			from_plan_id: None,
		};
		let mut v = Vec::new();
		v.push(a.clone());
		save_to_disk(&path, &v).unwrap();
		let out = load_from_disk(&path);
		assert_eq!(out.len(), 1);
		assert_eq!(out[0].id, "1");
	}

    // 保留纯持久化回归测试，移除依赖 tauri::State 的测试
}
