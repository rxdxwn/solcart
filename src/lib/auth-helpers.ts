import { NextRequest } from "next/server";
import { DbAdapter } from "./db";
import crypto from "crypto";

function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex");
}

export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string;
  role: string;
  createdAt: string;
}

/**
 * Validates authentication from request headers.
 * Expects either:
 * - X-User-Email and X-User-Password headers for basic auth
 * - X-User-Id header for session-based auth (validates user exists)
 * 
 * @param request - The Next.js request object
 * @returns The authenticated user object or null if authentication fails
 */
export async function authenticateRequest(request: NextRequest): Promise<AuthenticatedUser | null> {
  try {
    const userEmail = request.headers.get("x-user-email");
    const userPassword = request.headers.get("x-user-password");
    const userId = request.headers.get("x-user-id");

    // If userId is provided, validate it exists
    if (userId) {
      const users = await DbAdapter.getUsers();
      const user = users.find((u: any) => u.id === userId);
      if (user && user.isVerified) {
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          createdAt: user.createdAt
        };
      }
    }

    // If email and password are provided, validate credentials
    if (userEmail && userPassword) {
      const users = await DbAdapter.getUsers();
      const emailLower = userEmail.toLowerCase().trim();
      const user = users.find((u: any) => u.email === emailLower);
      
      if (!user) {
        return null;
      }

      const passwordHash = hashPassword(userPassword);
      const isDefaultStaffPassword = passwordHash === "3a9cd1b4a74d80ab706ab8d419ca3795e34fe3f0b89126a38c0d4f2c1ecd118e"; // 'solcart123'
      const isValid = user.passwordHash === passwordHash || 
                      ((!user.passwordHash || user.passwordHash === "") && isDefaultStaffPassword);
      
      if (!isValid || !user.isVerified) {
        return null;
      }

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        createdAt: user.createdAt
      };
    }

    return null;
  } catch (error) {
    console.error("Authentication error:", error);
    return null;
  }
}

/**
 * Checks if a user has admin/staff privileges
 * @param user - The authenticated user object
 * @returns true if user is admin/staff, false otherwise
 */
export function isAdmin(user: AuthenticatedUser | null): boolean {
  if (!user) return false;
  return user.role !== "customer" && user.role !== undefined;
}

/**
 * Checks if a user has permission to perform an action on a specific user record
 * @param authenticatedUser - The authenticated user making the request
 * @param targetUserId - The ID of the user being acted upon
 * @returns true if the user has permission, false otherwise
 */
export function canModifyUser(authenticatedUser: AuthenticatedUser | null, targetUserId: string): boolean {
  if (!authenticatedUser) return false;
  
  // Admins can modify any user
  if (isAdmin(authenticatedUser)) return true;
  
  // Users can only modify themselves
  return authenticatedUser.id === targetUserId;
}
