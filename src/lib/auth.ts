import { NextRequest } from "next/server";
import { DbAdapter } from "./db";

/**
 * Authentication and Authorization Module
 * 
 * This module provides authentication and role-based access control (RBAC) for the API.
 * 
 * Security Model:
 * - Authentication is required for all administrative actions
 * - Public actions (createSupportTicket, createUser, addProductReview, createOrder) 
 *   are allowed without authentication
 * - Role-based permissions control which actions each user role can perform
 * - Sensitive actions like updateSettings require admin/operations roles
 * 
 * Token Format:
 * - Bearer token in Authorization header
 * - Token is base64-encoded JSON containing user data
 * - Token is validated against the database to ensure user exists and is verified
 * 
 * Note: In production, this should use JWT tokens with proper signing and expiration.
 */

/**
 * Role-based permission definitions
 * Defines which roles can perform which actions
 */
const ROLE_PERMISSIONS: Record<string, string[]> = {
  "Super Admin": ["*"], // Full access
  "Owner": ["*"], // Full access
  "Operations Manager": [
    "updateSettings",
    "updateRetailerMarkup",
    "addProduct",
    "deleteProduct",
    "updateProductStock",
    "updateOrderStatus",
    "updateOrderCustomerName",
    "deliverGiftCardCode",
    "addTicketComment"
  ],
  "Finance Manager": [
    "createTransaction",
    "updateOrderStatus",
    "deliverGiftCardCode"
  ],
  "Fulfillment Manager": [
    "updateOrderStatus",
    "updateProductStock",
    "deliverGiftCardCode",
    "updateOrderCustomerName"
  ],
  "Customer Support": [
    "updateOrderStatus",
    "addTicketComment",
    "createSupportTicket"
  ],
  "Read-Only Analyst": [], // No write permissions
  "customer": [
    "createOrder",
    "addProductReview",
    "createSupportTicket"
  ]
};

/**
 * Validates the authentication token from the request
 * Returns the authenticated user or null if invalid
 */
export async function validateAuth(request: NextRequest): Promise<any | null> {
  try {
    // Check for Authorization header with Bearer token
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return null;
    }

    const token = authHeader.substring(7); // Remove "Bearer " prefix
    
    // Parse the token (in this implementation, it's a JSON string of user data)
    // In production, this should be a JWT or session token validated against a secure store
    let userData;
    try {
      userData = JSON.parse(Buffer.from(token, "base64").toString("utf-8"));
    } catch {
      return null;
    }

    // Validate that the user exists in the database
    const users = await DbAdapter.getUsers();
    const user = users.find((u: any) => 
      u.id === userData.id && 
      u.email === userData.email &&
      u.isVerified === true
    );

    if (!user) {
      return null;
    }

    // Return safe user object
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      createdAt: user.createdAt
    };
  } catch (error) {
    console.error("Auth validation error:", error);
    return null;
  }
}

/**
 * Checks if a user has permission to perform a specific action
 */
export function hasPermission(user: any, action: string): boolean {
  if (!user || !user.role) {
    return false;
  }

  const role = user.role;
  const permissions = ROLE_PERMISSIONS[role] || [];

  // Check for wildcard permission
  if (permissions.includes("*")) {
    return true;
  }

  // Check for specific action permission
  return permissions.includes(action);
}

/**
 * Checks if a user is an admin (staff member)
 */
export function isAdmin(user: any): boolean {
  if (!user || !user.role) {
    return false;
  }
  return user.role !== "customer";
}
