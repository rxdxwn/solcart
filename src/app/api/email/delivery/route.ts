import { NextResponse } from "next/server";
import { sendGiftCardCodeEmail } from "@/lib/email";
import { DbAdapter } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const { toEmail, orderId, giftCardCode } = await request.json();

    if (!toEmail || !orderId || !giftCardCode) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    // Security validation: Verify the order exists and the provided data matches
    const orders = await DbAdapter.getOrders();
    const order = orders.find((o: any) => o.id === orderId);

    if (!order) {
      return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 });
    }

    // Verify the gift card code matches the order's assigned code
    if (order.giftCardCode !== giftCardCode) {
      return NextResponse.json({ success: false, error: "Invalid gift card code for this order" }, { status: 403 });
    }

    // Verify the recipient email matches the order's customer email
    if (order.customerDetails?.email !== toEmail) {
      return NextResponse.json({ success: false, error: "Email address does not match order customer" }, { status: 403 });
    }

    // All validations passed - send the email
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
