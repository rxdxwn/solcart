import { NextRequest } from "next/server";
import { DbAdapter } from "./db";

/**
 * Server-side authentication helper for API routes.
 * Validates the user session from the Authorization header.
 */
export async function authenticateRequest(request: NextRequest | Request): Promise<{ authenticated: boolean; user?: any; isAdmin: boolean }> {
  try {
    // Extract authorization header
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return { authenticated: false, isAdmin: false };
    }

    // Expected format: "Bearer <email>"
    // In a production system, this would be a JWT or session token
    const parts = authHeader.split(" ");
    if (parts.length !== 2 || parts[0] !== "Bearer") {
      return { authenticated: false, isAdmin: false };
    }

    const email = parts[1];
    if (!email || !email.includes("@")) {
      return { authenticated: false, isAdmin: false };
    }

    // Fetch user from database
    const users = await DbAdapter.getUsers();
    const user = users.find((u: any) => u.email === email.toLowerCase().trim());

    if (!user || !user.isVerified) {
      return { authenticated: false, isAdmin: false };
    }

    // Check if user is admin (any role other than "customer")
    const isAdmin = user.role && user.role !== "customer";

    return {
      authenticated: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      },
      isAdmin
    };
  } catch (error) {
    console.error("Authentication error:", error);
    return { authenticated: false, isAdmin: false };
  }
}

/**
 * Checks if the authenticated user has admin privileges.
 */
export function requireAdmin(authResult: { authenticated: boolean; isAdmin: boolean }): boolean {
  return authResult.authenticated && authResult.isAdmin;
}
