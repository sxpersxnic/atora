//! Validation utilities for WASM

use wasm_bindgen::prelude::*;
use regex::Regex;

/// Validate an email address
#[wasm_bindgen]
pub fn validate_email(email: &str) -> bool {
    let email_regex = Regex::new(r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$").unwrap();
    email_regex.is_match(email)
}

/// Validate a phone number (basic international format)
#[wasm_bindgen]
pub fn validate_phone(phone: &str) -> bool {
    let phone_regex = Regex::new(r"^\+?[1-9]\d{1,14}$").unwrap();
    let cleaned = phone.chars().filter(|c| c.is_ascii_digit() || *c == '+').collect::<String>();
    phone_regex.is_match(&cleaned)
}

/// Validate a credit card number using Luhn algorithm
#[wasm_bindgen]
pub fn validate_credit_card(card_number: &str) -> bool {
    let digits: Vec<u32> = card_number
        .chars()
        .filter(|c| c.is_ascii_digit())
        .map(|c| c.to_digit(10).unwrap())
        .collect();

    if digits.len() < 13 || digits.len() > 19 {
        return false;
    }

    let mut sum = 0;
    let mut alternate = false;

    for &digit in digits.iter().rev() {
        let mut n = digit;
        if alternate {
            n *= 2;
            if n > 9 {
                n = (n % 10) + 1;
            }
        }
        sum += n;
        alternate = !alternate;
    }

    sum % 10 == 0
}

/// Validate IPv4 address
#[wasm_bindgen]
pub fn validate_ipv4(ip: &str) -> bool {
    let parts: Vec<&str> = ip.split('.').collect();
    if parts.len() != 4 {
        return false;
    }

    for part in parts {
        if let Ok(num) = part.parse::<u8>() {
            if part.len() > 1 && part.starts_with('0') {
                return false; // No leading zeros
            }
        } else {
            return false;
        }
    }

    true
}

/// Validate IPv6 address (basic validation)
#[wasm_bindgen]
pub fn validate_ipv6(ip: &str) -> bool {
    let ipv6_regex = Regex::new(r"^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$|^::1$|^::$").unwrap();
    ipv6_regex.is_match(ip)
}

/// Validate MAC address
#[wasm_bindgen]
pub fn validate_mac_address(mac: &str) -> bool {
    let mac_regex = Regex::new(r"^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$").unwrap();
    mac_regex.is_match(mac)
}

/// Validate password strength (returns score 0-4)
#[wasm_bindgen]
pub fn validate_password_strength(password: &str) -> u8 {
    let mut score = 0;

    // Length check
    if password.len() >= 8 {
        score += 1;
    }

    // Lowercase check
    if password.chars().any(|c| c.is_ascii_lowercase()) {
        score += 1;
    }

    // Uppercase check
    if password.chars().any(|c| c.is_ascii_uppercase()) {
        score += 1;
    }

    // Number check
    if password.chars().any(|c| c.is_ascii_digit()) {
        score += 1;
    }

    // Special character check
    if password.chars().any(|c| "!@#$%^&*()_+-=[]{}|;':\",./<>?".contains(c)) {
        score += 1;
    }

    score.min(4)
}

/// Validate hexadecimal color code
#[wasm_bindgen]
pub fn validate_hex_color(color: &str) -> bool {
    let hex_regex = Regex::new(r"^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$").unwrap();
    hex_regex.is_match(color)
}

/// Validate Social Security Number (US format)
#[wasm_bindgen]
pub fn validate_ssn(ssn: &str) -> bool {
    let ssn_regex = Regex::new(r"^\d{3}-\d{2}-\d{4}$").unwrap();
    ssn_regex.is_match(ssn)
}

/// Validate postal code (supports US ZIP and international formats)
#[wasm_bindgen]
pub fn validate_postal_code(code: &str, country: &str) -> bool {
    match country.to_uppercase().as_str() {
        "US" => {
            let us_zip_regex = Regex::new(r"^\d{5}(-\d{4})?$").unwrap();
            us_zip_regex.is_match(code)
        }
        "CA" => {
            let ca_postal_regex = Regex::new(r"^[A-Za-z]\d[A-Za-z] \d[A-Za-z]\d$").unwrap();
            ca_postal_regex.is_match(code)
        }
        "UK" | "GB" => {
            let uk_postal_regex = Regex::new(r"^[A-Z]{1,2}\d[A-Z\d]? \d[A-Z]{2}$").unwrap();
            uk_postal_regex.is_match(code)
        }
        _ => {
            // Generic alphanumeric validation for other countries
            let generic_regex = Regex::new(r"^[A-Za-z0-9\s-]{3,10}$").unwrap();
            generic_regex.is_match(code)
        }
    }
}
