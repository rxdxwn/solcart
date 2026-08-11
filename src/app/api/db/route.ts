import { NextRequest, NextResponse } from "next/server";
import { DbAdapter } from "@/lib/db";
import { authenticateRequest, isStaffRole } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    // Authenticate the request
    const user = authenticateRequest(request);
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }
    
    // Only staff members can access this endpoint
    if (!isStaffRole(user.role)) {
      return NextResponse.json(
        { success: false, error: "Insufficient permissions" },
        { status: 403 }
      );
    }

    const settings = await DbAdapter.getSettings();
    const products = await DbAdapter.getProducts();
    const orders = await DbAdapter.getOrders();
    const transactions = await DbAdapter.getTransactions();
    const users = await DbAdapter.getUsers();
    const tickets = await DbAdapter.getTickets();
    const activityLogs = await DbAdapter.getActivityLogs();

    const safeSettings = settings || { marketplaceMarkup: 0 };

    const data = {
      settings: safeSettings,
      products,
      orders,
      transactions,
      users,
      tickets,
      activityLogs,
      retailers: [
        {
          id: "amazon",
          name: "Amazon",
          logo: "https://images.unsplash.com/photo-1523474253046-8cd2748b5fd2?w=100&auto=format&fit=crop&q=60",
          markupPercentage: safeSettings.marketplaceMarkup || 0,
          isActive: true,
          description: "Sourced globally. Delivering electronics, books, home products, and daily essentials."
        },
        {
          id: "apple",
          name: "Apple",
          logo: "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=100&auto=format&fit=crop&q=60",
          markupPercentage: safeSettings.marketplaceMarkup || 0,
          isActive: true,
          description: "Premium computers, smartphones, tablets, and accessories with top-tier technology."
        },
        {
          id: "nike",
          name: "Nike",
          logo: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=100&auto=format&fit=crop&q=60",
          markupPercentage: safeSettings.marketplaceMarkup || 0,
          isActive: true,
          description: "Athletic footwear, activewear, sports equipment, and street-style fashion."
        },
        {
          id: "walmart",
          name: "Walmart",
          logo: "https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=100&auto=format&fit=crop&q=60",
          markupPercentage: safeSettings.marketplaceMarkup || 0,
          isActive: true,
          description: "Everyday low prices on groceries, home appliances, household goods, and toys."
        },
        {
          id: "target",
          name: "Target",
          logo: "https://images.unsplash.com/photo-1558317374-067fb5f30001?w=100&auto=format&fit=crop&q=60",
          markupPercentage: safeSettings.marketplaceMarkup || 0,
          isActive: true,
          description: "Trendy home decor, fashionable apparel, beauty essentials, and kitchen supplies."
        }
      ],
      version: "4.20.0"
    };

    return NextResponse.json({
      success: true,
      version: "4.20.0",
      data
    });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Authenticate the request
    const user = authenticateRequest(request);
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { action, payload } = body;

    let resultData = null;

    if (action === "updateRetailerMarkup") {
      // Only staff can update retailer markup
      if (!isStaffRole(user.role)) {
        return NextResponse.json(
          { success: false, error: "Insufficient permissions" },
          { status: 403 }
        );
      }
      const { markupPercentage } = payload;
      resultData = await DbAdapter.updateSettings({ marketplaceMarkup: markupPercentage });
    } else if (action === "addProduct") {
      // Only staff can add products
      if (!isStaffRole(user.role)) {
        return NextResponse.json(
          { success: false, error: "Insufficient permissions" },
          { status: 403 }
        );
      }
      resultData = await DbAdapter.addProduct(payload);
    } else if (action === "deleteProduct") {
      // Only staff can delete products
      if (!isStaffRole(user.role)) {
        return NextResponse.json(
          { success: false, error: "Insufficient permissions" },
          { status: 403 }
        );
      }
      resultData = await DbAdapter.deleteProduct(payload.productId);
    } else if (action === "createOrder") {
      resultData = await DbAdapter.createOrder(payload);
    } else if (action === "updateOrderStatus") {
      // Only staff can update order status
      if (!isStaffRole(user.role)) {
        return NextResponse.json(
          { success: false, error: "Insufficient permissions" },
          { status: 403 }
        );
      }
      const { orderId, status, details } = payload;
      resultData = await DbAdapter.updateOrderStatus(orderId, status, details);
    } else if (action === "updateSettings") {
      // Only staff can update settings
      if (!isStaffRole(user.role)) {
        return NextResponse.json(
          { success: false, error: "Insufficient permissions" },
          { status: 403 }
        );
      }
      resultData = await DbAdapter.updateSettings(payload);
    } else if (action === "createTransaction") {
      resultData = await DbAdapter.createTransaction(payload);
    } else if (action === "addProductReview") {
      const { productId, author, rating, comment } = payload;
      resultData = await DbAdapter.addProductReview(productId, author, rating, comment);
    } else if (action === "createSupportTicket") {
      resultData = await DbAdapter.createTicket(payload);
    } else if (action === "deliverGiftCardCode") {
      // CRITICAL: Only staff can deliver gift card codes
      if (!isStaffRole(user.role)) {
        return NextResponse.json(
          { success: false, error: "Insufficient permissions" },
          { status: 403 }
        );
      }
      const { orderId, giftCardCode } = payload;
      resultData = await DbAdapter.deliverGiftCardCode(orderId, giftCardCode);
    } else if (action === "updateOrderCustomerName") {
      // Only staff can update customer names
      if (!isStaffRole(user.role)) {
        return NextResponse.json(
          { success: false, error: "Insufficient permissions" },
          { status: 403 }
        );
      }
      const { orderId, customerName } = payload;
      resultData = await DbAdapter.updateOrderCustomerName(orderId, customerName);
    } else if (action === "updateProductStock") {
      // Only staff can update product stock
      if (!isStaffRole(user.role)) {
        return NextResponse.json(
          { success: false, error: "Insufficient permissions" },
          { status: 403 }
        );
      }
      const { productId, stockCount } = payload;
      resultData = await DbAdapter.updateProductStock(productId, stockCount);
    } else if (action === "addTicketComment") {
      // Only staff can add ticket comments
      if (!isStaffRole(user.role)) {
        return NextResponse.json(
          { success: false, error: "Insufficient permissions" },
          { status: 403 }
        );
      }
      const { ticketId, comment } = payload;
      resultData = await DbAdapter.addTicketComment(ticketId, comment);
    } else if (action === "createUser") {
      // Only staff can create users
      if (!isStaffRole(user.role)) {
        return NextResponse.json(
          { success: false, error: "Insufficient permissions" },
          { status: 403 }
        );
      }
      resultData = await DbAdapter.createUser(payload);
    } else if (action === "updateUser") {
      // Only staff can update users
      if (!isStaffRole(user.role)) {
        return NextResponse.json(
          { success: false, error: "Insufficient permissions" },
          { status: 403 }
        );
      }
      const { email, updates } = payload;
      resultData = await DbAdapter.updateUser(email, updates);
    } else if (action === "deleteUser") {
      // Only staff can delete users
      if (!isStaffRole(user.role)) {
        return NextResponse.json(
          { success: false, error: "Insufficient permissions" },
          { status: 403 }
        );
      }
      const { id } = payload;
      resultData = await DbAdapter.deleteUser(id);
    }

    return NextResponse.json({
      success: true,
      data: resultData
    });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
