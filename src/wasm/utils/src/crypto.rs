//! Cryptographic utilities for WASM

use wasm_bindgen::prelude::*;
use sha2::{Sha256, Digest};
use uuid::Uuid;

/// Generate a SHA-256 hash of the input string
#[wasm_bindgen]
pub fn sha256_hash(input: &str) -> String {
    let mut hasher = Sha256::new();
    hasher.update(input.as_bytes());
    format!("{:x}", hasher.finalize())
}

/// Encode a string to base64
#[wasm_bindgen]
pub fn encode_base64(input: &str) -> String {
    base64::encode(input.as_bytes())
}

/// Decode a base64 string
#[wasm_bindgen]
pub fn decode_base64(input: &str) -> Result<String, JsValue> {
    match base64::decode(input) {
        Ok(bytes) => match String::from_utf8(bytes) {
            Ok(text) => Ok(text),
            Err(e) => Err(JsValue::from_str(&format!("UTF-8 decode error: {}", e))),
        },
        Err(e) => Err(JsValue::from_str(&format!("Base64 decode error: {}", e))),
    }
}

/// Generate a random UUID v4
#[wasm_bindgen]
pub fn generate_uuid() -> String {
    Uuid::new_v4().to_string()
}

/// Validate if a string is a valid UUID
#[wasm_bindgen]
pub fn is_valid_uuid(uuid_str: &str) -> bool {
    Uuid::parse_str(uuid_str).is_ok()
}

/// Create a simple hash from a string (for non-cryptographic purposes)
#[wasm_bindgen]
pub fn simple_hash(input: &str) -> u32 {
    let mut hash = 0u32;
    for byte in input.bytes() {
        hash = hash.wrapping_mul(31).wrapping_add(byte as u32);
    }
    hash
}

/// Generate a checksum for data integrity
#[wasm_bindgen]
pub fn generate_checksum(data: &str) -> String {
    // Simple checksum using SHA-256 truncated to 8 characters
    let hash = sha256_hash(data);
    hash[..8].to_string()
}

/// Verify data against a checksum
#[wasm_bindgen]
pub fn verify_checksum(data: &str, checksum: &str) -> bool {
    let computed_checksum = generate_checksum(data);
    computed_checksum == checksum
}
