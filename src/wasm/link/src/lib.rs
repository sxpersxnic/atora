//! Link utilities WASM module
//! 
//! This crate provides core link-related functionality for URL manipulation,
//! link validation, and link processing.

use wasm_bindgen::prelude::*;

// Set up panic hook and allocator for better WASM performance
#[cfg(feature = "wee_alloc")]
#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

// Module declarations
mod core;

// Re-export public functions from core module
pub use core::*;

#[wasm_bindgen(start)]
pub fn main() {
    console_error_panic_hook::set_once();
}
