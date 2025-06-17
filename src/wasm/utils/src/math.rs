//! Mathematical utilities for WASM

use wasm_bindgen::prelude::*;
use nalgebra::{Vector3, Matrix3};
use js_sys::Array;

/// Calculate the distance between two 2D points
#[wasm_bindgen]
pub fn distance_2d(x1: f64, y1: f64, x2: f64, y2: f64) -> f64 {
    ((x2 - x1).powi(2) + (y2 - y1).powi(2)).sqrt()
}

/// Calculate the distance between two 3D points
#[wasm_bindgen]
pub fn distance_3d(x1: f64, y1: f64, z1: f64, x2: f64, y2: f64, z2: f64) -> f64 {
    ((x2 - x1).powi(2) + (y2 - y1).powi(2) + (z2 - z1).powi(2)).sqrt()
}

/// Calculate the dot product of two 3D vectors
#[wasm_bindgen]
pub fn vector3_dot_product(ax: f64, ay: f64, az: f64, bx: f64, by: f64, bz: f64) -> f64 {
    let a = Vector3::new(ax, ay, az);
    let b = Vector3::new(bx, by, bz);
    a.dot(&b)
}

/// Calculate the cross product of two 3D vectors
#[wasm_bindgen]
pub fn vector3_cross_product(ax: f64, ay: f64, az: f64, bx: f64, by: f64, bz: f64) -> Array {
    let a = Vector3::new(ax, ay, az);
    let b = Vector3::new(bx, by, bz);
    let cross = a.cross(&b);
    
    let result = Array::new();
    result.push(&JsValue::from_f64(cross.x));
    result.push(&JsValue::from_f64(cross.y));
    result.push(&JsValue::from_f64(cross.z));
    result
}

/// Calculate the magnitude (length) of a 3D vector
#[wasm_bindgen]
pub fn vector3_magnitude(x: f64, y: f64, z: f64) -> f64 {
    let vector = Vector3::new(x, y, z);
    vector.magnitude()
}

/// Normalize a 3D vector
#[wasm_bindgen]
pub fn vector3_normalize(x: f64, y: f64, z: f64) -> Array {
    let vector = Vector3::new(x, y, z);
    let normalized = vector.normalize();
    
    let result = Array::new();
    result.push(&JsValue::from_f64(normalized.x));
    result.push(&JsValue::from_f64(normalized.y));
    result.push(&JsValue::from_f64(normalized.z));
    result
}

/// Calculate the determinant of a 3x3 matrix
#[wasm_bindgen]
pub fn matrix3_determinant(
    m11: f64, m12: f64, m13: f64,
    m21: f64, m22: f64, m23: f64,
    m31: f64, m32: f64, m33: f64,
) -> f64 {
    let matrix = Matrix3::new(
        m11, m12, m13,
        m21, m22, m23,
        m31, m32, m33,
    );
    matrix.determinant()
}

/// Linear interpolation between two values
#[wasm_bindgen]
pub fn lerp(a: f64, b: f64, t: f64) -> f64 {
    a + t * (b - a)
}

/// Clamp a value between min and max
#[wasm_bindgen]
pub fn clamp(value: f64, min: f64, max: f64) -> f64 {
    if value < min {
        min
    } else if value > max {
        max
    } else {
        value
    }
}

/// Convert degrees to radians
#[wasm_bindgen]
pub fn degrees_to_radians(degrees: f64) -> f64 {
    degrees * std::f64::consts::PI / 180.0
}

/// Convert radians to degrees
#[wasm_bindgen]
pub fn radians_to_degrees(radians: f64) -> f64 {
    radians * 180.0 / std::f64::consts::PI
}
