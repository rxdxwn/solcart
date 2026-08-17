import { NextResponse } from "next/server";
import crypto from "crypto";
import { sendPasswordResetEmail } from "@/lib/email";
import { DbAdapter } from "@/lib/db";

function hashPassword(password: string) {
  return crypto.createHash("sha256").update(password).digest("hex");
}

export async function POST(request: Request) {
  try {
    const { action, email, code, newPassword } = await request.json();

    if (!email) {
      return NextResponse.json({ success: false, error: "Missing email address" }, { status: 400 });
    }

    const emailLower = email.toLowerCase().trim();
    const users = await DbAdapter.getUsers();

    const user = users.find((u: any) => u.email === emailLower);
    if (!user) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    if (action === "request") {
      const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
      await DbAdapter.updateUser(emailLower, { resetCode });

      const emailSent = await sendPasswordResetEmail(emailLower, resetCode);
      if (!emailSent) {
        return NextResponse.json({ success: false, error: "Failed to send reset email. Check SMTP settings." }, { status: 500 });
      }

      return NextResponse.json({ success: true, message: "Password reset code sent to your email." });
    }

    if (action === "confirm") {
      if (!code || !newPassword) {
        return NextResponse.json({ success: false, error: "Missing reset code or new password" }, { status: 400 });
      }

      if (!user.resetCode || user.resetCode !== code.trim()) {
        return NextResponse.json({ success: false, error: "Invalid password reset code" }, { status: 400 });
      }

      await DbAdapter.updateUser(emailLower, {
        passwordHash: hashPassword(newPassword),
        resetCode: null,
        isVerified: true // Auto-verify on successful password reset
      });

      return NextResponse.json({ success: true, message: "Password updated successfully! You can now log in." });
    }

    return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 });
  } catch (e: any) {
    console.error("Reset password error:", e);
    return NextResponse.json({ success: false, error: e.message || e }, { status: 500 });
  }
}
