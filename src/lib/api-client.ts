/**
 * Get the authorization header for authenticated API requests
 */
export function getAuthHeaders(): HeadersInit {
  if (typeof window === "undefined") {
    return {};
  }
  
  const token = localStorage.getItem("solcart_session_token");
  
  if (!token) {
    return {};
  }
  
  return {
    "Authorization": `Bearer ${token}`
  };
}

/**
 * Make an authenticated fetch request to /api/db
 */
export async function authenticatedFetch(action: string, payload: any): Promise<Response> {
  const token = typeof window !== "undefined" ? localStorage.getItem("solcart_session_token") : null;
  const headers: HeadersInit = {
    "Content-Type": "application/json"
  };
  
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  
  return fetch("/api/db", {
    method: "POST",
    headers,
    body: JSON.stringify({ action, payload })
  });
}

/**
 * Make an authenticated GET request to /api/db
 */
export async function authenticatedGet(): Promise<Response> {
  const token = typeof window !== "undefined" ? localStorage.getItem("solcart_session_token") : null;
  const headers: HeadersInit = {};
  
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  
  return fetch("/api/db", {
    method: "GET",
    headers
  });
}

