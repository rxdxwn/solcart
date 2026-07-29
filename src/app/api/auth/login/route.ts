import { NextResponse } from "next/server";
import crypto from "crypto";
import { DbAdapter } from "@/lib/db";

function hashPassword(password: string) {
  return crypto.createHash("sha256").update(password).digest("hex");
}

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ success: false, error: "Missing email or password" }, { status: 400 });
    }

    const emailLower = email.toLowerCase().trim();
    const users = await DbAdapter.getUsers();

    const user = users.find((u: any) => u.email === emailLower);
    if (!user) {
      return NextResponse.json({ success: false, error: "Invalid email or password" }, { status: 401 });
    }

    const passwordHash = hashPassword(password);
    const isDefaultStaffPassword = passwordHash === "3a9cd1b4a74d80ab706ab8d419ca3795e34fe3f0b89126a38c0d4f2c1ecd118e"; // 'solcart123'
    const isValid = user.passwordHash === passwordHash || 
                    ((!user.passwordHash || user.passwordHash === "") && isDefaultStaffPassword);
    
    if (!isValid) {
      return NextResponse.json({ success: false, error: "Invalid email or password" }, { status: 401 });
    }

    if (!user.isVerified) {
      return NextResponse.json({ 
        success: false, 
        unverified: true, 
        error: "Please verify your account first." 
      }, { status: 403 });
    }

    // Return safe user object
    const safeUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      createdAt: user.createdAt
    };

    return NextResponse.json({ success: true, user: safeUser });
  } catch (e: any) {
    console.error("Login API error:", e);
    return NextResponse.json({ success: false, error: e.message || e }, { status: 500 });
  }
}
