import { NextResponse } from "next/server";
import { DbAdapter } from "@/lib/db";
import { APP_VERSION } from "@/lib/version";

export async function GET() {
  try {
    const settings = await DbAdapter.getSettings();
    const products = await DbAdapter.getProducts();
    const orders = await DbAdapter.getOrders();
    const transactions = await DbAdapter.getTransactions();
    const users = await DbAdapter.getUsers();
    const tickets = await DbAdapter.getTickets();
    const activityLogs = await DbAdapter.getActivityLogs();
    const giftCardPool = await DbAdapter.getGiftCardPool();
    const launches = await DbAdapter.getLaunches();

    const safeSettings = settings || { marketplaceMarkup: 0 };

    const data = {
      settings: safeSettings,
      products,
      orders,
      transactions,
      users,
      tickets,
      activityLogs,
      giftCardPool,
      launches,
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
        },
        {
          id: "noon",
          name: "Noon",
          logo: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=100&auto=format&fit=crop&q=60",
          markupPercentage: safeSettings.marketplaceMarkup || 0,
          isActive: true,
          description: "Shop millions of items on Noon.com in the UAE, Saudi Arabia, and Egypt."
        }
      ],
      version: APP_VERSION
    };

    return NextResponse.json({
      success: true,
      version: APP_VERSION,
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

    let resultData = null;

    if (action === "updateRetailerMarkup") {
      const { markupPercentage } = payload;
      resultData = await DbAdapter.updateSettings({ marketplaceMarkup: markupPercentage });
    } else if (action === "addProduct") {
      resultData = await DbAdapter.addProduct(payload);
    } else if (action === "updateProduct") {
      const { productId, updates } = payload;
      resultData = await DbAdapter.updateProduct(productId, updates);
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
    } else if (action === "saveGiftCardPool") {
      resultData = await DbAdapter.saveGiftCardPool(payload);
    } else if (action === "saveLaunches") {
      resultData = await DbAdapter.saveLaunches(payload);
    }

    return NextResponse.json({
      success: true,
      data: resultData
    });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
