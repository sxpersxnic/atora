//! Core link functionality for the WASM module

use wasm_bindgen::prelude::*;

/// Check if a URL is external (starts with http:// or https://)
#[wasm_bindgen]
pub fn is_external(href: &str) -> bool {
    href.starts_with("http://") || href.starts_with("https://")
}

/// Check if a URL is internal (relative path)
#[wasm_bindgen]
pub fn is_internal(href: &str) -> bool {
    !is_external(href)
}

/// Normalize a URL by removing trailing slashes and fragments
#[wasm_bindgen]
pub fn normalize_url(url: &str) -> String {
    let mut normalized = url.trim_end_matches('/').to_string();
    
    // Remove fragment
    if let Some(hash_pos) = normalized.find('#') {
        normalized.truncate(hash_pos);
    }
    
    normalized
}

/// Get the protocol from a URL
#[wasm_bindgen]
pub fn get_protocol(url: &str) -> Option<String> {
    if let Some(pos) = url.find("://") {
        Some(url[..pos].to_string())
    } else {
        None
    }
}

/// Check if a URL uses HTTPS
#[wasm_bindgen]
pub fn is_secure(url: &str) -> bool {
    url.starts_with("https://")
}
