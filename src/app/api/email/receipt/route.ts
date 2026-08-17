import { NextResponse } from "next/server";
import { sendOrderReceiptEmail } from "@/lib/email";

export async function POST(request: Request) {
  try {
    const { order } = await request.json();

    if (!order || !order.customerDetails || !order.customerDetails.email) {
      return NextResponse.json({ success: false, error: "Invalid order object" }, { status: 400 });
    }

    const emailSent = await sendOrderReceiptEmail(order.customerDetails.email, order);
    if (emailSent) {
      return NextResponse.json({ success: true, message: "Order receipt sent successfully." });
    } else {
      return NextResponse.json({ success: false, error: "Failed to deliver email" }, { status: 500 });
    }
  } catch (e: any) {
    console.error("Receipt email API error:", e);
    return NextResponse.json({ success: false, error: e.message || e }, { status: 500 });
  }
}
