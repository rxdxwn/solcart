import { NextRequest } from "next/server";
import crypto from "crypto";
import { DbAdapter } from "./db";

// In-memory session store (in production, use Redis or database)
const sessions = new Map<string, { userId: string; email: string; role: string; expiresAt: number }>();

// Session expiry: 24 hours
const SESSION_DURATION = 24 * 60 * 60 * 1000;

/**
 * Create a new session token for a user
 */
export function createSession(userId: string, email: string, role: string): string {
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = Date.now() + SESSION_DURATION;
  
  sessions.set(token, { userId, email, role, expiresAt });
  
  // Clean up expired sessions periodically
  cleanupExpiredSessions();
  
  return token;
}

/**
 * Verify a session token and return user info
 */
export function verifySession(token: string): { userId: string; email: string; role: string } | null {
  const session = sessions.get(token);
  
  if (!session) {
    return null;
  }
  
  if (Date.now() > session.expiresAt) {
    sessions.delete(token);
    return null;
  }
  
  return { userId: session.userId, email: session.email, role: session.role };
}

/**
 * Invalidate a session token
 */
export function invalidateSession(token: string): void {
  sessions.delete(token);
}

/**
 * Clean up expired sessions
 */
function cleanupExpiredSessions(): void {
  const now = Date.now();
  for (const [token, session] of sessions.entries()) {
    if (now > session.expiresAt) {
      sessions.delete(token);
    }
  }
}

/**
 * Extract and verify authentication from request
 */
export function authenticateRequest(request: NextRequest): { userId: string; email: string; role: string } | null {
  const authHeader = request.headers.get("authorization");
  
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }
  
  const token = authHeader.substring(7);
  return verifySession(token);
}

/**
 * Check if user has admin/staff role
 */
export function isStaffRole(role: string): boolean {
  return role !== "customer" && role !== undefined && role !== "";
}

/**
 * Check if user has permission for a specific action
 */
export function hasPermission(role: string, action: string): boolean {
  const PERMISSIONS_MAP: Record<string, string[]> = {
    "Super Admin": ["*"],
    "Owner": ["*"],
    "Finance Manager": ["overview", "analytics", "payments", "refunds", "finance"],
    "Operations Manager": ["overview", "orders", "retailers", "products", "inventory", "notifications", "settings"],
    "Customer Support": ["orders", "refunds", "support"],
    "Fulfillment Manager": ["orders", "inventory"],
    "Read-Only Analyst": ["overview", "analytics", "customers", "payments", "refunds", "retailers", "products", "inventory", "finance"]
  };
  
  const permissions = PERMISSIONS_MAP[role] || [];
  
  // Check for wildcard permission
  if (permissions.includes("*")) {
    return true;
  }
  
  return permissions.includes(action);
}

/**
 * Actions that require authentication
 */
export const PROTECTED_ACTIONS = [
  "updateRetailerMarkup",
  "addProduct",
  "deleteProduct",
  "updateOrderStatus",
  "updateSettings",
  "deliverGiftCardCode",
  "updateOrderCustomerName",
  "updateProductStock",
  "addTicketComment",
  "createUser",
  "updateUser",
  "deleteUser"
];

/**
 * Actions that require staff/admin role
 */
export const ADMIN_ONLY_ACTIONS = [
  "updateRetailerMarkup",
  "addProduct",
  "deleteProduct",
  "updateOrderStatus",
  "updateSettings",
  "deliverGiftCardCode",
  "updateOrderCustomerName",
  "updateProductStock",
  "addTicketComment",
  "createUser",
  "updateUser",
  "deleteUser"
];
