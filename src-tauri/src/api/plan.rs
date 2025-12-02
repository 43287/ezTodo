use serde::{Deserialize, Serialize};
use std::{fs, io::Write, path::PathBuf, sync::RwLock};
use time::{Date, Month, OffsetDateTime};

#[derive(Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct Plan {
	id: String,
	title: String,
	description: String,
	repeat_cycle: String,
	plan_days: Vec<i32>,
	start_time: String,
	end_time: String,
	repeat_count: Option<i32>,
	current_count: i32,
	cycle_target_count: i32,
	total_completed_count: i32,
	last_reset_date: String,
	created_at: String,
	category: String,
	active: bool,
	important: bool,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PlanCreateInput {
	title: String,
	description: String,
	repeat_cycle: String,
	plan_days: Vec<i32>,
	start_time: String,
	end_time: String,
	repeat_count: Option<i32>,
	cycle_target_count: i32,
	category: String,
	active: bool,
	important: bool,
}

pub struct PlanState {
	plans: RwLock<Vec<Plan>>,
	data_path: PathBuf,
}

impl PlanState {
	pub fn new(data_path: PathBuf, initial: Vec<Plan>) -> Self { Self { plans: RwLock::new(initial), data_path } }
}

fn today_str() -> String {
	let now = OffsetDateTime::now_utc().date();
	format!("{:04}-{:02}-{:02}", now.year(), now.month() as u8, now.day())
}

fn parse_date(s: &str) -> Option<Date> {
	let parts: Vec<&str> = s.split('-').collect();
	if parts.len() != 3 { return None }
	let y = parts[0].parse::<i32>().ok()?;
	let m = parts[1].parse::<u8>().ok()?;
	let d = parts[2].parse::<u8>().ok()?;
	Date::from_calendar_date(y, Month::try_from(m).ok()?, d).ok()
}

fn same_week(a: Date, b: Date) -> bool {
	let weekday_a = a.weekday().number_from_monday() as i32;
	let weekday_b = b.weekday().number_from_monday() as i32;
	let start_a = a - time::Duration::days((weekday_a - 1) as i64);
	let start_b = b - time::Duration::days((weekday_b - 1) as i64);
	start_a == start_b
}

pub fn load_from_disk(path: &std::path::Path) -> Vec<Plan> {
	match fs::read_to_string(path) {
		Ok(s) => serde_json::from_str::<Vec<Plan>>(&s).unwrap_or_default(),
		Err(_) => Vec::new(),
	}
}

fn save_to_disk(path: &std::path::Path, plans: &Vec<Plan>) -> Result<(), String> {
	if let Some(parent) = path.parent() { fs::create_dir_all(parent).map_err(|e| e.to_string())? }
	let tmp = path.with_extension("json.tmp");
	let data = serde_json::to_vec(plans).map_err(|e| e.to_string())?;
	let mut f = fs::File::create(&tmp).map_err(|e| e.to_string())?;
	f.write_all(&data).map_err(|e| e.to_string())?;
	fs::rename(&tmp, path).map_err(|e| e.to_string())?;
	Ok(())
}

#[tauri::command]
pub fn plan_list(state: tauri::State<'_, PlanState>) -> Result<Vec<Plan>, String> {
	let plans = state.plans.read().map_err(|_| "LOCK_ERROR".to_string())?;
	Ok(plans.clone())
}

#[tauri::command]
pub fn plan_create(state: tauri::State<'_, PlanState>, input: PlanCreateInput) -> Result<Plan, String> {
	let mut plans = state.plans.write().map_err(|_| "LOCK_ERROR".to_string())?;
	let id = format!("plan-{}", OffsetDateTime::now_utc().unix_timestamp_nanos());
	let today = today_str();
	let p = Plan {
		id,
		title: input.title,
		description: input.description,
		repeat_cycle: input.repeat_cycle,
		plan_days: input.plan_days,
		start_time: input.start_time,
		end_time: input.end_time,
		repeat_count: input.repeat_count,
		current_count: 0,
		cycle_target_count: input.cycle_target_count,
		total_completed_count: 0,
		last_reset_date: today.clone(),
		created_at: today,
		category: input.category,
		active: input.active,
		important: input.important,
	};
	plans.push(p.clone());
	save_to_disk(&state.data_path, &plans)?;
	Ok(p)
}

#[tauri::command]
pub fn plan_update(state: tauri::State<'_, PlanState>, plan: Plan) -> Result<Plan, String> {
	let mut plans = state.plans.write().map_err(|_| "LOCK_ERROR".to_string())?;
	if let Some(idx) = plans.iter().position(|x| x.id == plan.id) {
		plans[idx] = plan.clone();
		save_to_disk(&state.data_path, &plans)?;
		Ok(plan)
	} else { Err("NOT_FOUND".to_string()) }
}

#[tauri::command]
pub fn plan_delete(state: tauri::State<'_, PlanState>, id: String) -> Result<bool, String> {
	let mut plans = state.plans.write().map_err(|_| "LOCK_ERROR".to_string())?;
	let len0 = plans.len();
	plans.retain(|p| p.id != id);
	if plans.len() == len0 { return Err("NOT_FOUND".to_string()) }
	save_to_disk(&state.data_path, &plans)?;
	Ok(true)
}

#[tauri::command]
pub fn plan_refresh(state: tauri::State<'_, PlanState>) -> Result<Vec<Plan>, String> {
	let mut plans = state.plans.write().map_err(|_| "LOCK_ERROR".to_string())?;
	let today = today_str();
	let today_date = parse_date(&today).ok_or_else(|| "DATE_PARSE".to_string())?;
	for p in plans.iter_mut() {
		if let Some(last) = parse_date(&p.last_reset_date) {
			let need_reset = match p.repeat_cycle.as_str() {
				"daily" => today != p.last_reset_date,
				"weekly" => !same_week(today_date, last),
				"monthly" => today_date.month() != last.month() || today_date.year() != last.year(),
				_ => false,
			};
			if need_reset { p.current_count = 0; p.last_reset_date = today.clone(); }
		}
	}
	save_to_disk(&state.data_path, &plans)?;
	Ok(plans.clone())
}

