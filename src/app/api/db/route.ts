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

const DEFAULT_PRODUCTS: Product[] = [
  {
    id: "p1",
    name: "Sony WH-1000XM4 Wireless Noise Cancelling Headphones",
    description: "Sony's intelligent industry-leading noise canceling headphones with premium sound elevate your listening experience with the ability to personalize and control everything you hear.",
    brand: "Sony",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80",
    category: "Electronics",
    rating: 4.8,
    reviewsCount: 14205,
    retailPrice: 348.00,
    marketplacePrice: 382.80,
    estimatedDelivery: "2-3 business days",
    specs: {
      "Battery Life": "Up to 30 Hours",
      "Noise Cancelling": "Active Noise Cancelling (ANC)",
      "Connection": "Bluetooth 5.0 & 3.5mm Jack",
      "Weight": "254 grams",
      "Charging": "USB-C Quick Charge (10 min for 5 hours)"
    },
    retailerId: "amazon",
    stockCount: 82,
    isFeatured: true
  },
  {
    id: "p2",
    name: "MacBook Air M3 (13-inch, 8GB RAM, 256GB SSD)",
    description: "The M3 chip brings even greater capabilities to the superportable 13-inch MacBook Air. With up to 18 hours of battery life, you can take it anywhere and breeze through work and play.",
    brand: "Apple",
    image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&auto=format&fit=crop&q=80",
    category: "Computers",
    rating: 4.9,
    reviewsCount: 382,
    retailPrice: 1099.00,
    marketplacePrice: 1230.88,
    estimatedDelivery: "Next day delivery",
    specs: {
      "Processor": "Apple M3 8-Core CPU",
      "Graphics": "10-core GPU",
      "Memory": "8GB Unified memory",
      "Storage": "256GB Superfast SSD",
      "Battery": "Up to 18 hours"
    },
    retailerId: "apple",
    stockCount: 15,
    isFeatured: true
  },
  {
    id: "p3",
    name: "iPhone 15 Pro Max (256GB, Natural Titanium)",
    description: "Forged in titanium and featuring the groundbreaking A17 Pro chip, a customizable Action button, and the most powerful iPhone camera system ever.",
    brand: "Apple",
    image: "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=600&auto=format&fit=crop&q=80",
    category: "Electronics",
    rating: 4.7,
    reviewsCount: 948,
    retailPrice: 1199.00,
    marketplacePrice: 1342.88,
    estimatedDelivery: "Next day delivery",
    specs: {
      "Processor": "A17 Pro Chip with 6-core GPU",
      "Screen Size": "6.7-inch Super Retina XDR OLED",
      "Camera": "48MP Main | 12MP Ultra Wide | 5x Telephoto",
      "Connector": "USB-C (supports USB 3)",
      "Material": "Aerospace-grade Titanium"
    },
    retailerId: "apple",
    stockCount: 22,
    isFeatured: true
  },
  {
    id: "p4",
    name: "Nike Air Force 1 '07 Classic Low-Top Sneakers",
    description: "The radiance lives on in the Nike Air Force 1 '07, the b-ball icon that puts a fresh spin on what you know best: crisp leather, bold colors and the perfect amount of flash to make you shine.",
    brand: "Nike",
    image: "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=600&auto=format&fit=crop&q=80",
    category: "Apparel",
    rating: 4.6,
    reviewsCount: 2043,
    retailPrice: 115.00,
    marketplacePrice: 124.20,
    estimatedDelivery: "3-5 business days",
    specs: {
      "Style": "Low-Cut Silhouette",
      "Cushioning": "Nike Air Cushioning",
      "Outsole": "Non-Marking Rubber",
      "Material": "Genuine Leather Upper"
    },
    retailerId: "nike",
    stockCount: 120,
    isFeatured: false
  }
];

const INITIAL_ORDERS: Order[] = [
  {
    id: "ord-827391",
    walletAddress: "Sol11111111111111111111111111111111111111112",
    customerDetails: {
      name: "Ridhwan Solcart",
      email: "ridhwan@solcart.io",
      phone: "+1 (555) 019-2831"
    },
    shippingAddress: {
      id: "addr-1",
      name: "Ridhwan Solcart",
      streetAddress: "123 Solana Boulevard, Suite 500",
      city: "San Francisco",
      state: "CA",
      postalCode: "94105",
      country: "United States",
      isDefault: true
    },
    items: [
      {
        productId: "p2",
        productName: "MacBook Air M3 (13-inch, 8GB RAM, 256GB SSD)",
        brand: "Apple",
        retailerId: "apple",
        quantity: 1,
        retailPriceUSD: 1099.00,
        marketplacePriceUSD: 1230.88,
        image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&auto=format&fit=crop&q=80"
      }
    ],
    retailerId: "apple",
    retailPriceUSD: 1099.00,
    paidSOL: 7.23,
    receivedUSDC: 1230.88,
    txHash: "5k9X...82jQ",
    swapTxHash: "mock_jup_swap_8271",
    status: "paid",
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
  }
];

const INITIAL_STORE = {
  retailers: [...DEFAULT_RETAILERS],
  products: [...DEFAULT_PRODUCTS],
  orders: [...INITIAL_ORDERS],
  transactions: [] as Transaction[],
  settings: {
    marketplaceMarkup: 10,
    supportedCryptos: ["SOL", "USDC"],
    defaultSolWallet: "So11111111111111111111111111111111111111112",
    rpcProvider: "Helius Mainnet Beta",
    emailAlerts: false,
    maintenanceMode: false,
    taxRate: 5,
    shippingFeeUSD: 5.00,
    freeShippingThresholdUSD: 100.00,
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
