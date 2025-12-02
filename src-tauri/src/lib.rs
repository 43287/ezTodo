// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

mod api {
	pub mod todo;
	pub mod plan;
	pub mod history;
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
	use api::todo::{AppState as TodoState, Todo};
	use api::plan::{Plan, PlanState};
	use std::path::PathBuf;
	use tauri::Manager;

	let builder = tauri::Builder::default()
		.plugin(tauri_plugin_opener::init())
		.setup(|app| {
			let data_dir: PathBuf = std::env::current_dir().unwrap().join("eztodo");
			let todos_path = data_dir.join("todos.json");
			let plans_path = data_dir.join("plans.json");
			let initial_todos = if todos_path.exists() { api::todo::load_from_disk(&todos_path) } else { Vec::<Todo>::new() };
			let initial_plans = if plans_path.exists() { api::plan::load_from_disk(&plans_path) } else { Vec::<Plan>::new() };
			app.manage(TodoState::new(todos_path, initial_todos));
			app.manage(PlanState::new(plans_path, initial_plans));
			Ok(())
		})
		.invoke_handler(tauri::generate_handler![
			greet,
			api::todo::todo_create,
			api::todo::todo_list,
			api::todo::todo_get,
			api::todo::todo_update,
			api::todo::todo_delete,
			api::plan::plan_list,
			api::plan::plan_create,
			api::plan::plan_update,
			api::plan::plan_delete,
			api::plan::plan_refresh,
			api::history::history_list,
		]);

	builder.run(tauri::generate_context!()).expect("error while running tauri application");
}
