//! URL utilities for WASM

use wasm_bindgen::prelude::*;
use url::Url;
use js_sys::Array;

/// Validate if a string is a valid URL
#[wasm_bindgen]
pub fn validate_url(url_str: &str) -> bool {
    Url::parse(url_str).is_ok()
}

/// Get the domain from a URL
#[wasm_bindgen]
pub fn get_url_domain(url_str: &str) -> Option<String> {
    Url::parse(url_str)
        .ok()
        .and_then(|url| url.host_str().map(|s| s.to_string()))
}

/// Get the path from a URL
#[wasm_bindgen]
pub fn get_url_path(url_str: &str) -> Option<String> {
    Url::parse(url_str)
        .ok()
        .map(|url| url.path().to_string())
}

/// Get the query string from a URL
#[wasm_bindgen]
pub fn get_url_query(url_str: &str) -> Option<String> {
    Url::parse(url_str)
        .ok()
        .and_then(|url| url.query().map(|s| s.to_string()))
}

/// Get the fragment (hash) from a URL
#[wasm_bindgen]
pub fn get_url_fragment(url_str: &str) -> Option<String> {
    Url::parse(url_str)
        .ok()
        .and_then(|url| url.fragment().map(|s| s.to_string()))
}

/// Get the port from a URL
#[wasm_bindgen]
pub fn get_url_port(url_str: &str) -> Option<u16> {
    Url::parse(url_str)
        .ok()
        .and_then(|url| url.port())
}

/// Get the scheme (protocol) from a URL
#[wasm_bindgen]
pub fn get_url_scheme(url_str: &str) -> Option<String> {
    Url::parse(url_str)
        .ok()
        .map(|url| url.scheme().to_string())
}

/// Join a base URL with a relative path
#[wasm_bindgen]
pub fn join_url(base: &str, relative: &str) -> Result<String, JsValue> {
    match Url::parse(base) {
        Ok(base_url) => match base_url.join(relative) {
            Ok(joined_url) => Ok(joined_url.to_string()),
            Err(e) => Err(JsValue::from_str(&format!("Failed to join URLs: {}", e))),
        },
        Err(e) => Err(JsValue::from_str(&format!("Invalid base URL: {}", e))),
    }
}

/// Parse query parameters from a URL
#[wasm_bindgen]
pub fn parse_query_params(url_str: &str) -> Result<js_sys::Map, JsValue> {
    let url = match Url::parse(url_str) {
        Ok(url) => url,
        Err(e) => return Err(JsValue::from_str(&format!("Invalid URL: {}", e))),
    };

    let map = js_sys::Map::new();
    
    for (key, value) in url.query_pairs() {
        map.set(&JsValue::from_str(&key), &JsValue::from_str(&value));
    }
    
    Ok(map)
}

/// Build a URL with query parameters
#[wasm_bindgen]
pub fn build_url_with_params(base_url: &str, params: &js_sys::Map) -> Result<String, JsValue> {
    let mut url = match Url::parse(base_url) {
        Ok(url) => url,
        Err(e) => return Err(JsValue::from_str(&format!("Invalid base URL: {}", e))),
    };

    url.query_pairs_mut().clear();
    
    // Add parameters from the Map
    let entries = js_sys::Object::entries(params);
    for i in 0..entries.length() {
        let entry = entries.get(i);
        let key_value = js_sys::Array::from(&entry);
        if key_value.length() == 2 {
            let key = key_value.get(0).as_string().unwrap_or_default();
            let value = key_value.get(1).as_string().unwrap_or_default();
            url.query_pairs_mut().append_pair(&key, &value);
        }
    }

    Ok(url.to_string())
}

/// Check if two URLs have the same origin (protocol + domain + port)
#[wasm_bindgen]
pub fn same_origin(url1: &str, url2: &str) -> Result<bool, JsValue> {
    let parsed_url1 = match Url::parse(url1) {
        Ok(url) => url,
        Err(e) => return Err(JsValue::from_str(&format!("Invalid URL 1: {}", e))),
    };
    
    let parsed_url2 = match Url::parse(url2) {
        Ok(url) => url,
        Err(e) => return Err(JsValue::from_str(&format!("Invalid URL 2: {}", e))),
    };

    Ok(parsed_url1.origin() == parsed_url2.origin())
}

/// Extract all path segments from a URL
#[wasm_bindgen]
pub fn get_path_segments(url_str: &str) -> Result<Array, JsValue> {
    let url = match Url::parse(url_str) {
        Ok(url) => url,
        Err(e) => return Err(JsValue::from_str(&format!("Invalid URL: {}", e))),
    };

    let segments = Array::new();
    if let Some(path_segments) = url.path_segments() {
        for segment in path_segments {
            if !segment.is_empty() {
                segments.push(&JsValue::from_str(segment));
            }
        }
    }
    
    Ok(segments)
}
