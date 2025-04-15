use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn is_external(href: &str) -> bool {
    href.starts_with("http://") || href.starts_with("https://")
}