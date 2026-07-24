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
  login: (email: string) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshUser: () => void;
  hasPermission: (module: string, action?: "view" | "edit") => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = () => {
    const currentUser = SupabaseService.getCurrentUser();
    setUser(currentUser);
    setLoading(false);
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (email: string): Promise<boolean> => {
    setLoading(true);
    const res = await SupabaseService.signIn(email);
    if (res.success) {
      setUser(res.user);
      setLoading(false);
      return true;
    }
    setLoading(false);
    return false;
  };

  const logout = async () => {
    setLoading(true);
    await SupabaseService.signOut();
    setUser(null);
    setLoading(false);
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
        logout,
        refreshUser,
        hasPermission
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
