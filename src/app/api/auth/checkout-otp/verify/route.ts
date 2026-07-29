import { NextResponse } from "next/server";
import { DbAdapter } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const { email, walletAddress, code } = await request.json();

    if (!email || !walletAddress || !code) {
      return NextResponse.json({ success: false, error: "Missing email, walletAddress, or code" }, { status: 400 });
    }

    const emailLower = email.toLowerCase().trim();
    const users = await DbAdapter.getUsers();
    
    // Look up by walletAddress
    const user = users.find((u: any) => u.id === walletAddress);
    if (!user) {
      return NextResponse.json({ success: false, error: "User profile not found for this wallet." }, { status: 404 });
    }

    // Check code matches
    if (!user.verificationCode || user.verificationCode !== code.trim()) {
      return NextResponse.json({ success: false, error: "Invalid verification code." }, { status: 400 });
    }

    // Check expiration (60 seconds)
    const timestampStr = user.resetCode;
    if (!timestampStr) {
      return NextResponse.json({ success: false, error: "No OTP timestamp found. Please request a new code." }, { status: 400 });
    }

    const createdTime = new Date(timestampStr).getTime();
    const now = Date.now();
    const diffSeconds = (now - createdTime) / 1000;

    if (diffSeconds > 60) {
      return NextResponse.json({ success: false, error: "Verification code has expired (60s limit). Please request a new one." }, { status: 400 });
    }

    // Clear verification codes, mark as verified, and associate the verified email
    await DbAdapter.updateUser(user.id, {
      email: emailLower, // Update to the verified email
      isVerified: true,
      verificationCode: null,
      resetCode: null
    });

    return NextResponse.json({ success: true, message: "Email verified successfully!" });
  } catch (e: any) {
    console.error("Checkout OTP verification failed:", e);
    return NextResponse.json({ success: false, error: e.message || e }, { status: 500 });
  }
}
