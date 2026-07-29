import { NextResponse } from "next/server";
import { DbAdapter } from "@/lib/db";
import { sendVerificationEmail } from "@/lib/email";

export async function POST(request: Request) {
  try {
    const { email, walletAddress, name } = await request.json();

    if (!email || !walletAddress) {
      return NextResponse.json({ success: false, error: "Missing email or walletAddress" }, { status: 400 });
    }

    const emailLower = email.toLowerCase().trim();
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // Look up user by wallet address
    const users = await DbAdapter.getUsers();
    const existingUser = users.find((u: any) => u.id === walletAddress);

    if (existingUser) {
      await DbAdapter.updateUser(existingUser.id, {
        email: emailLower,
        verificationCode: code,
        resetCode: new Date().toISOString(), // Use resetCode as OTP creation timestamp
        isVerified: false
      });
    } else {
      // Create new customer user with ID as walletAddress
      const newUser = {
        id: walletAddress,
        email: emailLower,
        name: name || emailLower.split("@")[0],
        passwordHash: "", // No password needed for customers
        role: "customer",
        isVerified: false,
        verificationCode: code,
        resetCode: new Date().toISOString(), // Use resetCode as OTP creation timestamp
        createdAt: new Date().toISOString()
      };
      await DbAdapter.createUser(newUser);
    }

    // Send the OTP verification email
    const emailSent = await sendVerificationEmail(emailLower, code);
    if (!emailSent) {
      return NextResponse.json({ success: false, error: "Failed to send email. Check SMTP settings." }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "Verification code sent to your email." });
  } catch (e: any) {
    console.error("Checkout OTP request failed:", e);
    return NextResponse.json({ success: false, error: e.message || e }, { status: 500 });
  }
}
