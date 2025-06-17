//! Text processing utilities for WASM

use wasm_bindgen::prelude::*;
use js_sys::Array;
use regex::Regex;
use unicode_segmentation::UnicodeSegmentation;

/// Extract email addresses from text using regex
#[wasm_bindgen]
pub fn extract_email_addresses(text: &str) -> Array {
    let email_regex = Regex::new("\\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Z|a-z]{2,}\\b").unwrap();
    let emails: Array = Array::new();
    
    for email in email_regex.find_iter(text) {
        emails.push(&JsValue::from_str(email.as_str()));
    }
    
    emails
}

/// Extract URLs from text
#[wasm_bindgen]
pub fn extract_urls(text: &str) -> Array {
    let url_regex = Regex::new("https?://[^\\s<>\"]+").unwrap();
    let urls: Array = Array::new();
    
    for url_match in url_regex.find_iter(text) {
        urls.push(&JsValue::from_str(url_match.as_str()));
    }
    
    urls
}

/// Count Unicode graphemes (visual characters)
#[wasm_bindgen]
pub fn count_graphemes(text: &str) -> usize {
    text.graphemes(true).count()
}

/// Truncate text to a specified number of graphemes
#[wasm_bindgen]
pub fn truncate_text(text: &str, max_length: usize) -> String {
    let graphemes: Vec<&str> = text.graphemes(true).collect();
    if graphemes.len() <= max_length {
        text.to_string()
    } else {
        graphemes[..max_length].join("") + "..."
    }
}

/// Check if text contains only ASCII characters
#[wasm_bindgen]
pub fn is_ascii_only(text: &str) -> bool {
    text.is_ascii()
}

/// Convert text to slug format (lowercase, replace spaces with hyphens)
#[wasm_bindgen]
pub fn to_slug(text: &str) -> String {
    let slug_regex = Regex::new("[^a-zA-Z0-9 -]").unwrap();
    let spaces_regex = Regex::new("\\s+").unwrap();
    
    let cleaned = slug_regex.replace_all(text, "");
    let with_hyphens = spaces_regex.replace_all(&cleaned, "-");
    
    with_hyphens.to_lowercase()
}

/// Validate if text matches a regex pattern
#[wasm_bindgen]
pub fn matches_pattern(text: &str, pattern: &str) -> Result<bool, JsValue> {
    match Regex::new(pattern) {
        Ok(regex) => Ok(regex.is_match(text)),
        Err(e) => Err(JsValue::from_str(&format!("Invalid regex pattern: {}", e))),
    }
}
