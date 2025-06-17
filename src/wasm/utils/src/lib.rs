use wasm_bindgen::prelude::*;

// Set up panic hook and allocator for better WASM performance
#[cfg(feature = "wee_alloc")]
#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

// Module declarations
mod text;
mod crypto;
mod math;
mod time;
mod validation;

// Re-export public functions from modules
pub use text::*;
pub use crypto::*;
pub use math::*;
pub use time::*;
pub use validation::*;

#[wasm_bindgen(start)]
pub fn main() {
    console_error_panic_hook::set_once();
}
