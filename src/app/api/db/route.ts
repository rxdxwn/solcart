import { NextResponse } from "next/server";
import { DbAdapter } from "@/lib/db";
import crypto from "crypto";

// Helper function to hash passwords (must match the one in login route)
function hashPassword(password: string) {
  return crypto.createHash("sha256").update(password).digest("hex");
}

// Authentication middleware: validates user credentials from request headers
async function authenticateRequest(request: Request): Promise<{ authenticated: boolean; user?: any; error?: string }> {
  try {
    // Extract authentication credentials from headers
    const authHeader = request.headers.get("x-auth-email");
    const authPassword = request.headers.get("x-auth-password");

    if (!authHeader || !authPassword) {
      return { authenticated: false, error: "Missing authentication credentials" };
    }

    const emailLower = authHeader.toLowerCase().trim();
    const users = await DbAdapter.getUsers();
    const user = users.find((u: any) => u.email === emailLower);

    if (!user) {
      return { authenticated: false, error: "Invalid credentials" };
    }

    // Validate password
    const passwordHash = hashPassword(authPassword);
    const isDefaultStaffPassword = passwordHash === "3a9cd1b4a74d80ab706ab8d419ca3795e34fe3f0b89126a38c0d4f2c1ecd118e"; // 'solcart123'
    const isValid = user.passwordHash === passwordHash || 
                    ((!user.passwordHash || user.passwordHash === "") && isDefaultStaffPassword);

    if (!isValid) {
      return { authenticated: false, error: "Invalid credentials" };
    }

    if (!user.isVerified) {
      return { authenticated: false, error: "Account not verified" };
    }

    return { authenticated: true, user };
  } catch (e: any) {
    return { authenticated: false, error: "Authentication failed" };
  }
}

// Authorization check: determines if user has admin privileges
function isAdminUser(user: any): boolean {
  return user && user.role && user.role !== "customer";
}

// Define which actions require admin privileges
const ADMIN_ONLY_ACTIONS = [
  "updateRetailerMarkup",
  "addProduct",
  "deleteProduct",
  "updateSettings",
  "deliverGiftCardCode",
  "updateProductStock",
  "createUser",
  "updateUser",
  "deleteUser",
  "updateOrderCustomerName"
];

// Define which actions are allowed for authenticated non-admin users
const AUTHENTICATED_USER_ACTIONS = [
  "createOrder",
  "createTransaction",
  "addProductReview",
  "addTicketComment"
];

// Define which actions are publicly accessible (no authentication required)
const PUBLIC_ACTIONS = [
  "createSupportTicket"
];

// Define which actions require at least staff-level access (admin or staff)
const STAFF_ACTIONS = [
  "updateOrderStatus"
];

export async function GET() {
  try {
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

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, payload } = body;

    // Check if action is publicly accessible
    const isPublicAction = PUBLIC_ACTIONS.includes(action);

    // Authenticate the request (skip for public actions)
    let user = null;
    if (!isPublicAction) {
      const authResult = await authenticateRequest(request);
      
      if (!authResult.authenticated) {
        return NextResponse.json(
          { success: false, error: authResult.error || "Authentication required" },
          { status: 401 }
        );
      }

      user = authResult.user;
    }

    // Check authorization based on action type (only for authenticated actions)
    if (!isPublicAction) {
      if (ADMIN_ONLY_ACTIONS.includes(action)) {
        if (!isAdminUser(user)) {
          return NextResponse.json(
            { success: false, error: "Admin privileges required for this action" },
            { status: 403 }
          );
        }
      } else if (STAFF_ACTIONS.includes(action)) {
        if (!isAdminUser(user)) {
          return NextResponse.json(
            { success: false, error: "Staff privileges required for this action" },
            { status: 403 }
          );
        }
      } else if (!AUTHENTICATED_USER_ACTIONS.includes(action)) {
        // Unknown action
        return NextResponse.json(
          { success: false, error: "Unknown or unauthorized action" },
          { status: 400 }
        );
      }
    }

    let resultData = null;

    if (action === "updateRetailerMarkup") {
      const { markupPercentage } = payload;
      resultData = await DbAdapter.updateSettings({ marketplaceMarkup: markupPercentage });
    } else if (action === "addProduct") {
      resultData = await DbAdapter.addProduct(payload);
    } else if (action === "deleteProduct") {
      resultData = await DbAdapter.deleteProduct(payload.productId);
    } else if (action === "createOrder") {
      resultData = await DbAdapter.createOrder(payload);
    } else if (action === "updateOrderStatus") {
      const { orderId, status, details } = payload;
      resultData = await DbAdapter.updateOrderStatus(orderId, status, details);
    } else if (action === "updateSettings") {
      resultData = await DbAdapter.updateSettings(payload);
    } else if (action === "createTransaction") {
      resultData = await DbAdapter.createTransaction(payload);
    } else if (action === "addProductReview") {
      const { productId, author, rating, comment } = payload;
      resultData = await DbAdapter.addProductReview(productId, author, rating, comment);
    } else if (action === "createSupportTicket") {
      resultData = await DbAdapter.createTicket(payload);
    } else if (action === "deliverGiftCardCode") {
      const { orderId, giftCardCode } = payload;
      resultData = await DbAdapter.deliverGiftCardCode(orderId, giftCardCode);
    } else if (action === "updateOrderCustomerName") {
      const { orderId, customerName } = payload;
      resultData = await DbAdapter.updateOrderCustomerName(orderId, customerName);
    } else if (action === "updateProductStock") {
      const { productId, stockCount } = payload;
      resultData = await DbAdapter.updateProductStock(productId, stockCount);
    } else if (action === "addTicketComment") {
      const { ticketId, comment } = payload;
      resultData = await DbAdapter.addTicketComment(ticketId, comment);
    } else if (action === "createUser") {
      resultData = await DbAdapter.createUser(payload);
    } else if (action === "updateUser") {
      const { email, updates } = payload;
      resultData = await DbAdapter.updateUser(email, updates);
    } else if (action === "deleteUser") {
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
