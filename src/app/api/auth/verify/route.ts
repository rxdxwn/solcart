import { NextResponse } from "next/server";
import { DbAdapter } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const { email, code } = await request.json();

    if (!email || !code) {
      return NextResponse.json({ success: false, error: "Missing email or verification code" }, { status: 400 });
    }

    const emailLower = email.toLowerCase().trim();
    const users = await DbAdapter.getUsers();

    const user = users.find((u: any) => u.email === emailLower);
    if (!user) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    if (user.isVerified) {
      return NextResponse.json({ success: false, error: "User is already verified" }, { status: 400 });
    }

    if (user.verificationCode !== code.trim()) {
      return NextResponse.json({ success: false, error: "Invalid verification code" }, { status: 400 });
    }

    await DbAdapter.updateUser(emailLower, {
      isVerified: true,
      verificationCode: null
    });

    // Return the safe user object
    const safeUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      createdAt: user.createdAt
    };

    return NextResponse.json({ success: true, user: safeUser });
  } catch (e: any) {
    console.error("Verification error:", e);
    return NextResponse.json({ success: false, error: e.message || e }, { status: 500 });
  }
}
