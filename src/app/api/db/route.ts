import { NextResponse } from "next/server";
import { Product, RetailerConfig, Order, Transaction } from "@/types";
import fs from "fs";
import path from "path";

// Initial Seeds
const DEFAULT_RETAILERS: RetailerConfig[] = [
  {
    id: "amazon",
    name: "Amazon",
    logo: "https://images.unsplash.com/photo-1523474253046-8cd2748b5fd2?w=100&auto=format&fit=crop&q=60",
    markupPercentage: 10,
    isActive: true,
    description: "Sourced globally. Delivering electronics, books, home products, and daily essentials."
  },
  {
    id: "apple",
    name: "Apple",
    logo: "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=100&auto=format&fit=crop&q=60",
    markupPercentage: 12,
    isActive: true,
    description: "Premium computers, smartphones, tablets, and accessories with top-tier technology."
  },
  {
    id: "nike",
    name: "Nike",
    logo: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=100&auto=format&fit=crop&q=60",
    markupPercentage: 8,
    isActive: true,
    description: "Innovative athletic footwear, apparel, accessories, and sporting gear."
  },
  {
    id: "adidas",
    name: "Adidas",
    logo: "https://images.unsplash.com/photo-1587563876167-18d96b6e029d?w=100&auto=format&fit=crop&q=60",
    markupPercentage: 8,
    isActive: true,
    description: "Original sportswear, classics sneakers, and high-performance training clothing."
  },
  {
    id: "bestbuy",
    name: "Best Buy",
    logo: "https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=100&auto=format&fit=crop&q=60",
    markupPercentage: 10,
    isActive: true,
    description: "Top-tier consumer electronics, 4K TVs, gaming consoles, and smart appliances."
  },
  {
    id: "walmart",
    name: "Walmart",
    logo: "https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=100&auto=format&fit=crop&q=60",
    markupPercentage: 6,
    isActive: true,
    description: "Everyday low prices on groceries, home appliances, household goods, and toys."
  },
  {
    id: "target",
    name: "Target",
    logo: "https://images.unsplash.com/photo-1558317374-067fb5f30001?w=100&auto=format&fit=crop&q=60",
    markupPercentage: 7,
    isActive: true,
    description: "Trendy home decor, fashionable apparel, beauty essentials, and kitchen supplies."
  }
];

const DEFAULT_PRODUCTS: Product[] = [];

const INITIAL_ORDERS: Order[] = [];

const INITIAL_STORE = {
  retailers: [...DEFAULT_RETAILERS],
  products: [...DEFAULT_PRODUCTS],
  orders: [...INITIAL_ORDERS],
  transactions: [] as Transaction[],
  users: [] as any[],
  tickets: [] as any[],
  settings: {
    marketplaceMarkup: 0,
    supportedCryptos: ["SOL", "USDC"],
    defaultSolWallet: "So11111111111111111111111111111111111111112",
    rpcProvider: "Helius Mainnet Beta",
    emailAlerts: false,
    maintenanceMode: false,
    taxRate: 0,
    shippingFeeUSD: 0,
    freeShippingThresholdUSD: 0,
    featureFlags: { autoSwap: true, mockFulfillment: true, analyticsDashboard: true }
  },
  version: "4.20.0"
};

// JSON Database file path inside workspace
const DB_FILE_PATH = path.join(process.cwd(), "src", "data", "db.json");

function readDb() {
  try {
    if (!fs.existsSync(DB_FILE_PATH)) {
      const dir = path.dirname(DB_FILE_PATH);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(DB_FILE_PATH, JSON.stringify(INITIAL_STORE, null, 2), "utf-8");
      return INITIAL_STORE;
    }
    const dataStr = fs.readFileSync(DB_FILE_PATH, "utf-8");
    return JSON.parse(dataStr);
  } catch (e) {
    console.error("Failed to read persistent JSON DB, returning defaults", e);
    return INITIAL_STORE;
  }
}

function writeDb(data: any) {
  try {
    const dir = path.dirname(DB_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DB_FILE_PATH, JSON.stringify(data, null, 2), "utf-8");
  } catch (e) {
    console.error("Failed to write persistent JSON DB", e);
  }
}

export async function GET() {
  const store = readDb();
  return NextResponse.json({
    success: true,
    version: store.version,
    data: store
  });
}

export async function POST(request: Request) {
  try {
    const store = readDb();
    const body = await request.json();
    const { action, payload } = body;

    if (action === "updateRetailerMarkup") {
      const { retailerId, markupPercentage } = payload;
      const rIndex = store.retailers.findIndex((r: any) => r.id === retailerId);
      if (rIndex !== -1) {
        store.retailers[rIndex].markupPercentage = markupPercentage;
        store.products = store.products.map((p: any) => {
          if (p.retailerId === retailerId) {
            return {
              ...p,
              marketplacePrice: parseFloat((p.retailPrice * (1 + markupPercentage / 100)).toFixed(2))
            };
          }
          return p;
        });
      }
    } else if (action === "addProduct") {
      const retailer = store.retailers.find((r: any) => r.id === payload.retailerId) || { markupPercentage: 10 };
      const marketplacePrice = parseFloat((payload.retailPrice * (1 + retailer.markupPercentage / 100)).toFixed(2));
      const newProd: Product = {
        rating: 5.0,
        reviewsCount: 1,
        estimatedDelivery: "2-4 business days",
        ...payload,
        marketplacePrice
      };
      store.products.push(newProd);
    } else if (action === "deleteProduct") {
      store.products = store.products.filter((p: any) => p.id !== payload.productId);
    } else if (action === "createOrder") {
      store.orders.unshift(payload);
    } else if (action === "updateOrderStatus") {
      const { orderId, status, details } = payload;
      const oIndex = store.orders.findIndex((o: any) => o.id === orderId);
      if (oIndex !== -1) {
        store.orders[oIndex] = {
          ...store.orders[oIndex],
          status,
          ...details
        };
      }
    } else if (action === "updateSettings") {
      store.settings = {
        ...store.settings,
        ...payload
      };
    } else if (action === "createTransaction") {
      store.transactions.unshift(payload);
    } else if (action === "addProductReview") {
      const { productId, author, rating, comment } = payload;
      const pIndex = store.products.findIndex((p: any) => p.id === productId);
      if (pIndex !== -1) {
        const prod = store.products[pIndex];
        if (!prod.reviews) prod.reviews = [];
        const newReview = {
          author,
          rating: parseFloat(rating),
          comment,
          date: new Date().toLocaleDateString()
        };
        prod.reviews.unshift(newReview);
        const totalRating = prod.reviews.reduce((acc: number, r: any) => acc + r.rating, 0);
        prod.rating = parseFloat((totalRating / prod.reviews.length).toFixed(1));
        prod.reviewsCount = prod.reviews.length;
      }
    } else if (action === "createSupportTicket") {
      if (!store.tickets) store.tickets = [];
      store.tickets.unshift({
        id: `tkt-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        status: "open",
        timestamp: new Date().toISOString(),
        comments: [] as any[],
        ...payload
      });
    } else if (action === "deliverGiftCardCode") {
      const { orderId, giftCardCode } = payload;
      const oIndex = store.orders.findIndex((o: any) => o.id === orderId);
      if (oIndex !== -1) {
        store.orders[oIndex].giftCardCode = giftCardCode;
      }
    } else if (action === "updateOrderCustomerName") {
      const { orderId, customerName } = payload;
      const oIndex = store.orders.findIndex((o: any) => o.id === orderId);
      if (oIndex !== -1) {
        store.orders[oIndex].customerDetails.name = customerName;
      }
    } else if (action === "updateProductStock") {
      const { productId, stockCount } = payload;
      const pIndex = store.products.findIndex((p: any) => p.id === productId);
      if (pIndex !== -1) {
        store.products[pIndex].stockCount = parseInt(stockCount, 10);
      }
    } else if (action === "addTicketComment") {
      const { ticketId, comment } = payload;
      const tIndex = store.tickets.findIndex((t: any) => t.id === ticketId);
      if (tIndex !== -1) {
        if (!store.tickets[tIndex].comments) store.tickets[tIndex].comments = [];
        store.tickets[tIndex].comments.push({
          id: `cmt-${Date.now()}`,
          comment,
          timestamp: new Date().toISOString()
        });
      }
    }

    // Persist changes directly to file
    writeDb(store);

    return NextResponse.json({
      success: true,
      version: store.version,
      data: store
    });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
