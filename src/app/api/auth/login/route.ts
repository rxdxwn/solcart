import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import crypto from "crypto";

const DB_FILE_PATH = path.join(process.cwd(), "src", "data", "db.json");

function readDb() {
  if (!fs.existsSync(DB_FILE_PATH)) {
    return { users: [] };
  }
  return JSON.parse(fs.readFileSync(DB_FILE_PATH, "utf-8"));
}

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
    const store = readDb();
    if (!store.users) store.users = [];

    const user = store.users.find((u: any) => u.email === emailLower);
    if (!user) {
      return NextResponse.json({ success: false, error: "Invalid email or password" }, { status: 401 });
    }

    const passwordHash = hashPassword(password);
    if (user.passwordHash !== passwordHash) {
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
