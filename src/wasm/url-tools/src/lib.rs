//! URL utilities WASM module
//! 
//! This crate provides various URL manipulation and parsing utilities
//! that can be used from JavaScript via WASM bindings.

use wasm_bindgen::prelude::*;

// Set up panic hook for better WASM error handling
#[cfg(feature = "wee_alloc")]
#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

// Module declarations
mod url_utils;

// Re-export all public functions
pub use url_utils::*;

#[wasm_bindgen(start)]
pub fn main() {
    console_error_panic_hook::set_once();
}
