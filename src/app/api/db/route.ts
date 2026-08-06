import { NextResponse } from "next/server";
import { DbAdapter } from "@/lib/db";
import crypto from "crypto";

/**
 * Server-side authentication helper
 * Validates the X-Admin-Auth header against stored admin credentials
 */
async function authenticateAdmin(request: Request): Promise<{ authenticated: boolean; user?: any; error?: string }> {
  const authHeader = request.headers.get("X-Admin-Auth");
  
  if (!authHeader) {
    return { authenticated: false, error: "Missing authentication header" };
  }

  try {
    // Parse the auth header (expected format: "email:passwordHash")
    const decoded = Buffer.from(authHeader, "base64").toString("utf-8");
    const [email, passwordHash] = decoded.split(":");

    if (!email || !passwordHash) {
      return { authenticated: false, error: "Invalid authentication format" };
    }

    // Fetch users and validate credentials
    const users = await DbAdapter.getUsers();
    const user = users.find((u: any) => u.email === email.toLowerCase().trim());

    if (!user) {
      return { authenticated: false, error: "Invalid credentials" };
    }

    // Verify password hash
    const isDefaultStaffPassword = passwordHash === "3a9cd1b4a74d80ab706ab8d419ca3795e34fe3f0b89126a38c0d4f2c1ecd118e"; // 'solcart123'
    const isValid = user.passwordHash === passwordHash || 
                    ((!user.passwordHash || user.passwordHash === "") && isDefaultStaffPassword);

    if (!isValid) {
      return { authenticated: false, error: "Invalid credentials" };
    }

    if (!user.isVerified) {
      return { authenticated: false, error: "Account not verified" };
    }

    // Check if user has admin role (not a customer)
    if (user.role === "customer" || !user.role) {
      return { authenticated: false, error: "Insufficient permissions" };
    }

    return { 
      authenticated: true, 
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    };
  } catch (e: any) {
    return { authenticated: false, error: "Authentication failed" };
  }
}

/**
 * Sanitize user objects by removing sensitive fields
 */
function sanitizeUsers(users: any[]): any[] {
  return users.map(u => ({
    id: u.id,
    email: u.email,
    name: u.name,
    role: u.role,
    isVerified: u.isVerified,
    createdAt: u.createdAt
    // Explicitly exclude: passwordHash, verificationCode, resetCode
  }));
}

export async function GET(request: Request) {
  try {
    // Authenticate the request
    const authResult = await authenticateAdmin(request);
    
    if (!authResult.authenticated) {
      return NextResponse.json(
        { success: false, error: authResult.error || "Unauthorized" }, 
        { status: 401 }
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

    // Sanitize users to remove sensitive fields
    const sanitizedUsers = sanitizeUsers(users);

    const data = {
      settings: safeSettings,
      products,
      orders,
      transactions,
      users: sanitizedUsers,
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
    // Authenticate the request
    const authResult = await authenticateAdmin(request);
    
    if (!authResult.authenticated) {
      return NextResponse.json(
        { success: false, error: authResult.error || "Unauthorized" }, 
        { status: 401 }
      );
    }

    const body = await request.json();
    const { action, payload } = body;

    let resultData = null;

    // Define actions that require elevated privileges
    const privilegedActions = [
      "updateSettings",
      "createUser", 
      "updateUser", 
      "deleteUser"
    ];

    // Check if user has sufficient permissions for privileged actions
    if (privilegedActions.includes(action)) {
      const userRole = authResult.user?.role;
      const allowedRoles = ["Super Admin", "Owner"];
      
      if (!allowedRoles.includes(userRole)) {
        return NextResponse.json(
          { success: false, error: "Insufficient permissions for this action" }, 
          { status: 403 }
        );
      }
    }

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
    } else {
      return NextResponse.json(
        { success: false, error: "Invalid action" }, 
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: resultData
    });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
