/**
 * Client-side utility for making authenticated API requests
 */

/**
 * Gets the authentication token from localStorage
 * Returns a base64-encoded token containing user data
 */
export function getAuthToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  const userStr = localStorage.getItem("solcart_current_user");
  if (!userStr) {
    return null;
  }

  try {
    // Encode user data as base64 token
    return Buffer.from(userStr).toString("base64");
  } catch {
    return null;
  }
}

/**
 * Makes an authenticated request to the /api/db endpoint
 * Automatically includes the authentication token if available
 */
export async function authenticatedFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = getAuthToken();
  
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  // Add authorization header if token is available
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  return fetch(url, {
    ...options,
    headers,
  });
}

/**
 * Makes an authenticated POST request to /api/db with action and payload
 */
export async function dbAction(action: string, payload: any): Promise<any> {
  const response = await authenticatedFetch("/api/db", {
    method: "POST",
    body: JSON.stringify({ action, payload }),
  });

  return response.json();
}
