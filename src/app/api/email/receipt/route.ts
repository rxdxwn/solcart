import { NextResponse } from "next/server";
import { sendOrderReceiptEmail } from "@/lib/email";
import { DbAdapter } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const { orderId } = await request.json();

    // Validate that orderId is provided
    if (!orderId || typeof orderId !== "string") {
      return NextResponse.json({ success: false, error: "Missing or invalid orderId" }, { status: 400 });
    }

    // Fetch the order from the database to ensure it exists and is legitimate
    const orders = await DbAdapter.getOrders();
    const order = orders.find(o => o.id === orderId);

    if (!order) {
      return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 });
    }

    // Validate that the order has customer details with an email
    if (!order.customerDetails || !order.customerDetails.email) {
      return NextResponse.json({ success: false, error: "Order has no customer email" }, { status: 400 });
    }

    // Send email using the verified order data from the database
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
