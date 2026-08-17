import { NextResponse } from "next/server";
import { sendGiftCardCodeEmail } from "@/lib/email";

export async function POST(request: Request) {
  try {
    const { toEmail, orderId, giftCardCode } = await request.json();

    if (!toEmail || !orderId || !giftCardCode) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    const emailSent = await sendGiftCardCodeEmail(toEmail, orderId, giftCardCode);
    if (emailSent) {
      return NextResponse.json({ success: true, message: "Gift card code delivered to email successfully." });
    } else {
      return NextResponse.json({ success: false, error: "Failed to deliver email" }, { status: 500 });
    }
  } catch (e: any) {
    console.error("Delivery email API error:", e);
    return NextResponse.json({ success: false, error: e.message || e }, { status: 500 });
  }
}
