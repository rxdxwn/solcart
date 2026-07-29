import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { sendPasswordResetEmail } from "@/lib/email";

const DB_FILE_PATH = path.join(process.cwd(), "src", "data", "db.json");

function readDb() {
  if (!fs.existsSync(DB_FILE_PATH)) {
    return { users: [] };
  }
  return JSON.parse(fs.readFileSync(DB_FILE_PATH, "utf-8"));
}

function writeDb(data: any) {
  fs.writeFileSync(DB_FILE_PATH, JSON.stringify(data, null, 2), "utf-8");
}

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
    const store = readDb();
    if (!store.users) store.users = [];

    const user = store.users.find((u: any) => u.email === emailLower);
    if (!user) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    if (action === "request") {
      const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
      user.resetCode = resetCode;
      writeDb(store);

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

      user.passwordHash = hashPassword(newPassword);
      user.resetCode = null;
      user.isVerified = true; // Auto-verify on successful password reset
      writeDb(store);

      return NextResponse.json({ success: true, message: "Password updated successfully! You can now log in." });
    }

    return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 });
  } catch (e: any) {
    console.error("Reset password error:", e);
    return NextResponse.json({ success: false, error: e.message || e }, { status: 500 });
  }
}
