/**
 * Authentication header utility for API requests
 * Retrieves user credentials from localStorage and adds them to request headers
 */

const STORAGE_KEY = "solcart_session_user";

interface UserCredentials {
  email: string;
  password?: string;
}

/**
 * Retrieves stored user credentials from localStorage
 * Note: In production, consider using secure session tokens instead of storing passwords
 */
function getUserCredentials(): UserCredentials | null {
  if (typeof window === "undefined") return null;
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    
    const user = JSON.parse(stored);
    return {
      email: user.email,
      password: user.password // This should be the plain password stored during login
    };
  } catch {
    return null;
  }
}

/**
 * Stores user credentials in localStorage after successful login
 * @param email User's email
 * @param password User's password (plain text - consider using tokens in production)
 */
export function storeUserCredentials(email: string, password: string): void {
  if (typeof window === "undefined") return;
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    const user = stored ? JSON.parse(stored) : {};
    user.password = password; // Store password for API authentication
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  } catch (e) {
    console.error("Failed to store user credentials:", e);
  }
}

/**
 * Clears stored user credentials on logout
 */
export function clearUserCredentials(): void {
  if (typeof window === "undefined") return;
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const user = JSON.parse(stored);
      delete user.password;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    }
  } catch (e) {
    console.error("Failed to clear user credentials:", e);
  }
}

/**
 * Creates headers object with authentication credentials
 * @param additionalHeaders Optional additional headers to include
 * @returns Headers object with authentication and content-type
 */
export function getAuthHeaders(additionalHeaders?: Record<string, string>): Record<string, string> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...additionalHeaders
  };
  
  const credentials = getUserCredentials();
  if (credentials && credentials.email && credentials.password) {
    headers["x-auth-email"] = credentials.email;
    headers["x-auth-password"] = credentials.password;
  }
  
  return headers;
}

/**
 * Makes an authenticated POST request to /api/db
 * @param action The action to perform
 * @param payload The payload data
 * @returns Promise with the response
 */
export async function authenticatedDbRequest(action: string, payload: any): Promise<Response> {
  return fetch("/api/db", {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ action, payload })
  });
}
