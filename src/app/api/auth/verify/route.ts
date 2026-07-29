import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

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

export async function POST(request: Request) {
  try {
    const { email, code } = await request.json();

    if (!email || !code) {
      return NextResponse.json({ success: false, error: "Missing email or verification code" }, { status: 400 });
    }

    const emailLower = email.toLowerCase().trim();
    const store = readDb();
    if (!store.users) store.users = [];

    const user = store.users.find((u: any) => u.email === emailLower);
    if (!user) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    if (user.isVerified) {
      return NextResponse.json({ success: false, error: "User is already verified" }, { status: 400 });
    }

    if (user.verificationCode !== code.trim()) {
      return NextResponse.json({ success: false, error: "Invalid verification code" }, { status: 400 });
    }

    user.isVerified = true;
    user.verificationCode = null;

    writeDb(store);

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
