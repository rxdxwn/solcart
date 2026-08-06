import { NextRequest } from "next/server";
import { DbAdapter } from "./db";

/**
 * Server-side authentication utility for API routes.
 * Validates authentication tokens and enforces role-based access control.
 */

export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string;
  role: string;
  isVerified: boolean;
}

/**
 * Extracts and validates the authentication token from the request.
 * Returns the authenticated user if valid, null otherwise.
 */
export async function authenticateRequest(request: Request): Promise<AuthenticatedUser | null> {
  try {
    // Extract authentication token from Authorization header
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return null;
    }

    const token = authHeader.substring(7); // Remove "Bearer " prefix
    
    // Parse the token (format: base64-encoded JSON with email)
    // In a production system, this would be a JWT or session token
    let tokenData;
    try {
      const decoded = Buffer.from(token, "base64").toString("utf-8");
      tokenData = JSON.parse(decoded);
    } catch {
      return null;
    }

    if (!tokenData.email) {
      return null;
    }

    // Validate the user exists and is verified
    const users = await DbAdapter.getUsers();
    const user = users.find((u: any) => u.email === tokenData.email.toLowerCase());
    
    if (!user || !user.isVerified) {
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      isVerified: user.isVerified
    };
  } catch (error) {
    console.error("Authentication error:", error);
    return null;
  }
}

/**
 * Checks if a user has administrative privileges.
 */
export function isAdmin(user: AuthenticatedUser | null): boolean {
  if (!user) return false;
  const adminRoles = ["Owner", "Super Admin"];
  return adminRoles.includes(user.role);
}

/**
 * Checks if a user has specific role.
 */
export function hasRole(user: AuthenticatedUser | null, allowedRoles: string[]): boolean {
  if (!user) return false;
  return allowedRoles.includes(user.role);
}
