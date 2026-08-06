/**
 * Authentication helper for server-side API calls
 * Generates the X-Admin-Auth header from stored user credentials
 */

import crypto from "crypto";

/**
 * Hash a password using SHA-256
 */
export function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex");
}

/**
 * Generate authentication header for API requests
 * Returns base64-encoded "email:passwordHash"
 */
export function generateAuthHeader(email: string, passwordHash: string): string {
  const credentials = `${email}:${passwordHash}`;
  return Buffer.from(credentials).toString("base64");
}

/**
 * Get authentication headers for fetch requests
 * Retrieves credentials from localStorage and generates the auth header
 */
export function getAuthHeaders(): HeadersInit {
  if (typeof window === "undefined") {
    return { "Content-Type": "application/json" };
  }

  try {
    const storedUser = localStorage.getItem("solcart_current_user");
    const storedPassword = localStorage.getItem("solcart_user_password_hash");
    
    if (!storedUser || !storedPassword) {
      return { "Content-Type": "application/json" };
    }

    const user = JSON.parse(storedUser);
    const authHeader = generateAuthHeader(user.email, storedPassword);

    return {
      "Content-Type": "application/json",
      "X-Admin-Auth": authHeader
    };
  } catch (e) {
    console.error("Failed to generate auth headers:", e);
    return { "Content-Type": "application/json" };
  }
}

/**
 * Store password hash in localStorage for subsequent API calls
 * This should be called after successful login
 */
export function storePasswordHash(passwordHash: string): void {
  if (typeof window !== "undefined") {
    localStorage.setItem("solcart_user_password_hash", passwordHash);
  }
}

/**
 * Clear stored password hash on logout
 */
export function clearPasswordHash(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem("solcart_user_password_hash");
  }
}
