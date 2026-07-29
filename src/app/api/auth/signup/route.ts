import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { sendVerificationEmail } from "@/lib/email";

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
    const { email, password, name } = await request.json();

    if (!email || !password || !name) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    const emailLower = email.toLowerCase().trim();
    if (!emailLower.includes("@")) {
      return NextResponse.json({ success: false, error: "Invalid email format" }, { status: 400 });
    }

    const store = readDb();
    if (!store.users) store.users = [];

    // Check if user already exists
    const existingUser = store.users.find((u: any) => u.email === emailLower);
    if (existingUser) {
      if (existingUser.isVerified) {
        return NextResponse.json({ success: false, error: "Email is already registered" }, { status: 400 });
      }
      // If registered but not verified, we can overwrite or update their verification code
    }

    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const passwordHash = hashPassword(password);

    if (existingUser) {
      existingUser.name = name;
      existingUser.passwordHash = passwordHash;
      existingUser.verificationCode = verificationCode;
      existingUser.createdAt = new Date().toISOString();
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
      store.users.push(newUser);
    }

    writeDb(store);

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
