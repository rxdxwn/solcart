import { NextResponse } from "next/server";
import crypto from "crypto";
import { sendVerificationEmail } from "@/lib/email";
import { DbAdapter } from "@/lib/db";

function hashPassword(password: string) {
  return crypto.createHash("sha256").update(password).digest("hex");
}

export async function POST(request: Request) {
  try {
    const { email, password, name } = await request.json();

    if (!email || !password || !name) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    const emailLower = email.toLowerCase().trim();
    if (!emailLower.includes("@")) {
      return NextResponse.json({ success: false, error: "Invalid email format" }, { status: 400 });
    }

    const users = await DbAdapter.getUsers();
    
    // Check if user already exists
    const existingUser = users.find((u: any) => u.email === emailLower);
    if (existingUser) {
      if (existingUser.isVerified) {
        return NextResponse.json({ success: false, error: "Email is already registered" }, { status: 400 });
      }
    }

    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const passwordHash = hashPassword(password);

    if (existingUser) {
      await DbAdapter.updateUser(emailLower, {
        name,
        passwordHash,
        verificationCode,
        createdAt: new Date().toISOString()
      });
    } else {
      const role = "customer";
      const newUser = {
        id: `usr-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        email: emailLower,
        name,
        passwordHash,
        role,
        isVerified: false,
        verificationCode,
        createdAt: new Date().toISOString()
      };
      await DbAdapter.createUser(newUser);
    }

    // Send real verification email via Gmail SMTP
    const emailSent = await sendVerificationEmail(emailLower, verificationCode);
    if (!emailSent) {
      return NextResponse.json({ success: false, error: "Failed to send verification email. Please check SMTP settings." }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "Verification code sent to your email." });
  } catch (e: any) {
    console.error("Signup error:", e);
    return NextResponse.json({ success: false, error: e.message || e }, { status: 500 });
  }
}
