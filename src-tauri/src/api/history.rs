use serde::{Deserialize, Serialize};
use tauri::State;
use crate::api::todo::AppState as TodoState;

#[derive(Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct HistoryRecord {
	id: String,
	#[serde(rename = "type")]
	type_: String,
	title: String,
	timestamp: String,
	item_id: String,
	item_type: String,
}

#[tauri::command]
pub fn history_list(state: State<'_, TodoState>) -> Result<Vec<HistoryRecord>, String> {
	let todos = state.snapshot()?;
	let mut records: Vec<HistoryRecord> = Vec::new();
	for t in todos.iter() {
    let created = HistoryRecord {
        id: format!("h-{}-created", t.id),
        type_: "todo_created".into(),
        title: t.title.clone(),
        timestamp: t.created_at.clone(),
        item_id: t.id.clone(),
        item_type: "todo".into(),
    };
		records.push(created);
		if let Some(done_ts) = &t.completed_at {
			let completed = HistoryRecord {
				id: format!("h-{}-completed", t.id),
				type_: "todo_completed".into(),
				title: t.title.clone(),
				timestamp: done_ts.clone(),
				item_id: t.id.clone(),
				item_type: "todo".into(),
			};
			records.push(completed);
		}
	}
	Ok(records)
}
