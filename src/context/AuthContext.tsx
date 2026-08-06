"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { SupabaseService } from "../services/supabase";

// Role-to-module permission map
const PERMISSIONS_MAP: Record<string, string[]> = {
  "Super Admin": ["*"],
  "Owner": ["*"],
  "Finance Manager": ["overview", "analytics", "payments", "refunds", "finance"],
  "Operations Manager": ["overview", "orders", "retailers", "products", "inventory", "notifications", "settings"],
  "Customer Support": ["orders", "refunds", "support"],
  "Fulfillment Manager": ["orders", "inventory"],
  "Read-Only Analyst": ["overview", "analytics", "customers", "payments", "refunds", "retailers", "products", "inventory", "finance"]
};

interface AuthContextType {
  user: any | null;
  loading: boolean;
  isAdmin: boolean; // True if user is any staff member (non-customer)
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string; unverified?: boolean }>;
  signup: (email: string, password: string, name: string) => Promise<{ success: boolean; error?: string }>;
  verify: (email: string, code: string) => Promise<{ success: boolean; error?: string }>;
  requestReset: (email: string) => Promise<{ success: boolean; error?: string }>;
  confirmReset: (email: string, code: string, newPassword: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshUser: () => void;
  hasPermission: (module: string, action?: "view" | "edit") => boolean;
  bypassLoginForTesting: (email: string) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = () => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("solcart_current_user");
      setUser(stored ? JSON.parse(stored) : null);
    }
    setLoading(false);
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string; unverified?: boolean }> => {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        // Store user data with password for API authentication
        const userWithAuth = { ...data.user, password };
        localStorage.setItem("solcart_current_user", JSON.stringify(userWithAuth));
        setUser(data.user);
        setLoading(false);
        return { success: true };
      }
      setLoading(false);
      return { 
        success: false, 
        error: data.error || "Login failed", 
        unverified: data.unverified 
      };
    } catch (e: any) {
      setLoading(false);
      return { success: false, error: e.message || "Network error" };
    }
  };

  const signup = async (email: string, password: string, name: string): Promise<{ success: boolean; error?: string }> => {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name })
      });
      const data = await res.json();
      setLoading(false);
      return { success: res.ok && data.success, error: data.error };
    } catch (e: any) {
      setLoading(false);
      return { success: false, error: e.message || "Network error" };
    }
  };

  const verify = async (email: string, code: string): Promise<{ success: boolean; error?: string }> => {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        localStorage.setItem("solcart_current_user", JSON.stringify(data.user));
        setUser(data.user);
        setLoading(false);
        return { success: true };
      }
      setLoading(false);
      return { success: false, error: data.error || "Verification failed" };
    } catch (e: any) {
      setLoading(false);
      return { success: false, error: e.message || "Network error" };
    }
  };

  const requestReset = async (email: string): Promise<{ success: boolean; error?: string }> => {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "request", email })
      });
      const data = await res.json();
      setLoading(false);
      return { success: res.ok && data.success, error: data.error };
    } catch (e: any) {
      setLoading(false);
      return { success: false, error: e.message || "Network error" };
    }
  };

  const confirmReset = async (email: string, code: string, newPassword: string): Promise<{ success: boolean; error?: string }> => {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "confirm", email, code, newPassword })
      });
      const data = await res.json();
      setLoading(false);
      return { success: res.ok && data.success, error: data.error };
    } catch (e: any) {
      setLoading(false);
      return { success: false, error: e.message || "Network error" };
    }
  };

  const logout = async () => {
    setLoading(true);
    localStorage.removeItem("solcart_current_user");
    setUser(null);
    setLoading(false);
  };

  const bypassLoginForTesting = async (email: string): Promise<{ success: boolean; error?: string }> => {
    setLoading(true);
    try {
      const res = await fetch("/api/db");
      const data = await res.json();
      const targetUser = data?.success && data.data?.users?.find((u: any) => u.email.toLowerCase() === email.toLowerCase());
      if (targetUser) {
        localStorage.setItem("solcart_current_user", JSON.stringify(targetUser));
        setUser(targetUser);
        setLoading(false);
        return { success: true };
      }
      setLoading(false);
      return { success: false, error: "User not found" };
    } catch (e: any) {
      setLoading(false);
      return { success: false, error: e.message || "Network error" };
    }
  };

  // User is considered an admin if they have any staff role
  const isAdmin = user && user.role !== "customer" && user.role !== undefined;

  const hasPermission = (module: string, action: "view" | "edit" = "view"): boolean => {
    if (!user) return false;
    
    const role = user.role;
    if (role === "customer") return false;

    // Super Admin and Owner have master overrides
    if (role === "Super Admin" || role === "Owner") {
      return true;
    }

    // Analysts are strictly read-only
    if (role === "Read-Only Analyst" && action === "edit") {
      return false;
    }

    const allowedModules = PERMISSIONS_MAP[role] || [];
    
    // Check if the module is in the allowed list
    return allowedModules.includes("*") || allowedModules.includes(module);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAdmin,
        login,
        signup,
        verify,
        requestReset,
        confirmReset,
        logout,
        refreshUser,
        hasPermission,
        bypassLoginForTesting
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
