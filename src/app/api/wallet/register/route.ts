import { NextResponse } from "next/server";
import { DbAdapter } from "@/lib/db";

/**
 * Public endpoint for registering wallet addresses as customer accounts.
 * This endpoint is intentionally unauthenticated to allow wallet connections,
 * but strictly limits the account type to "customer" with no privileges.
 */
export async function POST(request: Request) {
  try {
    const { walletAddress } = await request.json();

    if (!walletAddress || typeof walletAddress !== "string") {
      return NextResponse.json(
        { success: false, error: "Invalid wallet address" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const users = await DbAdapter.getUsers();
    const existingUser = users.find((u: any) => u.id === walletAddress);

    if (existingUser) {
      // User already exists, return success
      return NextResponse.json({
        success: true,
        message: "Wallet already registered"
      });
    }

    // Create a new customer account with strictly limited privileges
    // Force role to "customer" and isVerified to false to prevent privilege escalation
    const newUser = {
      id: walletAddress,
      email: `${walletAddress.substring(0, 8)}@solcart-user.io`,
      name: `Wallet ${walletAddress.substring(0, 6)}`,
      passwordHash: "", // No password for wallet-based accounts
      role: "customer", // Hardcoded to customer role
      isVerified: false, // Not verified by default
      verificationCode: null,
      resetCode: null,
      createdAt: new Date().toISOString()
    };

    await DbAdapter.createUser(newUser);

    return NextResponse.json({
      success: true,
      message: "Wallet registered successfully"
    });
  } catch (e: any) {
    console.error("Wallet registration error:", e);
    return NextResponse.json(
      { success: false, error: e.message || "Registration failed" },
      { status: 500 }
    );
  }
}
