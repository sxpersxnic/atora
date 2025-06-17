//! Time and date utilities for WASM

use wasm_bindgen::prelude::*;
use chrono::{DateTime, Utc, Duration, NaiveDateTime};
use js_sys::Date;

/// Get current UTC timestamp as milliseconds since epoch
#[wasm_bindgen]
pub fn current_timestamp_ms() -> f64 {
    Utc::now().timestamp_millis() as f64
}

/// Get current UTC timestamp as seconds since epoch
#[wasm_bindgen]
pub fn current_timestamp_secs() -> i64 {
    Utc::now().timestamp()
}

/// Format a timestamp (milliseconds) as ISO 8601 string
#[wasm_bindgen]
pub fn format_timestamp_iso(timestamp_ms: f64) -> Result<String, JsValue> {
    let timestamp_secs = (timestamp_ms / 1000.0) as i64;
    let naive_dt = match NaiveDateTime::from_timestamp_opt(timestamp_secs, 0) {
        Some(dt) => dt,
        None => return Err(JsValue::from_str("Invalid timestamp")),
    };
    
    let dt: DateTime<Utc> = DateTime::from_utc(naive_dt, Utc);
    Ok(dt.to_rfc3339())
}

/// Parse an ISO 8601 date string to timestamp (milliseconds)
#[wasm_bindgen]
pub fn parse_iso_to_timestamp(iso_string: &str) -> Result<f64, JsValue> {
    match iso_string.parse::<DateTime<Utc>>() {
        Ok(dt) => Ok(dt.timestamp_millis() as f64),
        Err(e) => Err(JsValue::from_str(&format!("Parse error: {}", e))),
    }
}

/// Calculate the difference between two timestamps in milliseconds
#[wasm_bindgen]
pub fn timestamp_diff_ms(timestamp1_ms: f64, timestamp2_ms: f64) -> f64 {
    (timestamp2_ms - timestamp1_ms).abs()
}

/// Add days to a timestamp
#[wasm_bindgen]
pub fn add_days_to_timestamp(timestamp_ms: f64, days: i32) -> Result<f64, JsValue> {
    let timestamp_secs = (timestamp_ms / 1000.0) as i64;
    let naive_dt = match NaiveDateTime::from_timestamp_opt(timestamp_secs, 0) {
        Some(dt) => dt,
        None => return Err(JsValue::from_str("Invalid timestamp")),
    };
    
    let dt: DateTime<Utc> = DateTime::from_utc(naive_dt, Utc);
    let new_dt = dt + Duration::days(days as i64);
    Ok(new_dt.timestamp_millis() as f64)
}

/// Add hours to a timestamp
#[wasm_bindgen]
pub fn add_hours_to_timestamp(timestamp_ms: f64, hours: i32) -> Result<f64, JsValue> {
    let timestamp_secs = (timestamp_ms / 1000.0) as i64;
    let naive_dt = match NaiveDateTime::from_timestamp_opt(timestamp_secs, 0) {
        Some(dt) => dt,
        None => return Err(JsValue::from_str("Invalid timestamp")),
    };
    
    let dt: DateTime<Utc> = DateTime::from_utc(naive_dt, Utc);
    let new_dt = dt + Duration::hours(hours as i64);
    Ok(new_dt.timestamp_millis() as f64)
}

/// Check if a timestamp is in the past
#[wasm_bindgen]
pub fn is_timestamp_in_past(timestamp_ms: f64) -> bool {
    let current_ms = current_timestamp_ms();
    timestamp_ms < current_ms
}

/// Check if a timestamp is in the future
#[wasm_bindgen]
pub fn is_timestamp_in_future(timestamp_ms: f64) -> bool {
    let current_ms = current_timestamp_ms();
    timestamp_ms > current_ms
}

/// Get the start of day (00:00:00) for a given timestamp
#[wasm_bindgen]
pub fn start_of_day(timestamp_ms: f64) -> Result<f64, JsValue> {
    let timestamp_secs = (timestamp_ms / 1000.0) as i64;
    let naive_dt = match NaiveDateTime::from_timestamp_opt(timestamp_secs, 0) {
        Some(dt) => dt,
        None => return Err(JsValue::from_str("Invalid timestamp")),
    };
    
    let dt: DateTime<Utc> = DateTime::from_utc(naive_dt, Utc);
    let start_of_day = dt.date_naive().and_hms_opt(0, 0, 0).unwrap();
    let start_of_day_utc: DateTime<Utc> = DateTime::from_utc(start_of_day, Utc);
    Ok(start_of_day_utc.timestamp_millis() as f64)
}
