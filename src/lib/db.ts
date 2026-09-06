import fs from "fs";
import path from "path";
import { supabaseAdmin, isSupabaseConfigured } from "./supabase";
import { Product, Order, Transaction, ShippingAddress, RefundRequest, ActivityLog, CustomerDetails } from "@/types";
import { sendEmail, SOLCART_SUPPORT_EMAIL } from "./email";
import { APP_VERSION } from "./version";

// =========================================================================
// LOCAL FILE DATABASE FALLBACK
// =========================================================================
const DB_FILE_PATH = path.join(process.cwd(), "src", "data", "db.json");

const INITIAL_STORE = {
  retailers: [
    {
      id: "amazon",
      name: "Amazon",
      logo: "https://images.unsplash.com/photo-1523474253046-8cd2748b5fd2?w=100&auto=format&fit=crop&q=60",
      markupPercentage: 0,
      isActive: true,
      description: "Sourced globally. Delivering electronics, books, home products, and daily essentials."
    },
    {
      id: "apple",
      name: "Apple",
      logo: "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=100&auto=format&fit=crop&q=60",
      markupPercentage: 0,
      isActive: true,
      description: "Premium computers, smartphones, tablets, and accessories with top-tier technology."
    },
    {
      id: "nike",
      name: "Nike",
      logo: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=100&auto=format&fit=crop&q=60",
      markupPercentage: 0,
      isActive: true,
      description: "Athletic footwear, activewear, sports equipment, and street-style fashion."
    },
    {
      id: "walmart",
      name: "Walmart",
      logo: "https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=100&auto=format&fit=crop&q=60",
      markupPercentage: 0,
      isActive: true,
      description: "Everyday low prices on groceries, home appliances, household goods, and toys."
    },
    {
      id: "target",
      name: "Target",
      logo: "https://images.unsplash.com/photo-1558317374-067fb5f30001?w=100&auto=format&fit=crop&q=60",
      markupPercentage: 0,
      isActive: true,
      description: "Trendy home decor, fashionable apparel, beauty essentials, and kitchen supplies."
    }
  ],
  products: [] as Product[],
  orders: [] as Order[],
  transactions: [] as Transaction[],
  users: [] as any[],
  tickets: [] as any[],
  giftCardPool: [] as any[],
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
  version: APP_VERSION
};

function readLocalDb(): any {
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
    console.error("Failed to read local DB file", e);
    return INITIAL_STORE;
  }
}

function writeLocalDb(data: any) {
  try {
    const dir = path.dirname(DB_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DB_FILE_PATH, JSON.stringify(data, null, 2), "utf-8");
  } catch (e) {
    console.error("Failed to write local DB file", e);
  }
}

// =========================================================================
// UNIFIED DATABASE ADAPTER CLASS WITH EXPLICIT EXCEPTION THROWING
// =========================================================================
export class DbAdapter {
  
  // 1. Settings operations
  static async getSettings(): Promise<any> {
    if (isSupabaseConfigured()) {
      if (!supabaseAdmin) throw new Error("Supabase admin client not initialized");
      const { data, error } = await supabaseAdmin
        .from("settings")
        .select("*")
        .eq("id", "default")
        .maybeSingle();

      if (error) {
        console.error("Supabase getSettings failed:", error);
        throw new Error(`Supabase query error: ${error.message}`);
      }
      if (data) {
        return {
          marketplaceMarkup: parseFloat(data.marketplace_markup),
          supportedCryptos: data.supported_cryptos,
          defaultSolWallet: data.default_sol_wallet,
          rpcProvider: data.rpc_provider,
          emailAlerts: data.email_alerts,
          maintenanceMode: data.maintenance_mode,
          taxRate: parseFloat(data.tax_rate),
          shippingFeeUSD: parseFloat(data.shipping_fee_usd),
          freeShippingThresholdUSD: parseFloat(data.free_shipping_threshold_usd),
          featureFlags: data.feature_flags
        };
      } else {
        // Automatically seed settings table with defaults if row is missing
        const defaultSettings = {
          id: "default",
          marketplace_markup: 0.00,
          supported_cryptos: ["SOL", "USDC"],
          default_sol_wallet: "So11111111111111111111111111111111111111112",
          rpc_provider: "Helius Mainnet Beta",
          email_alerts: false,
          maintenance_mode: false,
          tax_rate: 0.00,
          shipping_fee_usd: 0.00,
          free_shipping_threshold_usd: 0.00,
          feature_flags: { autoSwap: true, mockFulfillment: true, analyticsDashboard: true }
        };
        const { error: insertErr } = await supabaseAdmin
          .from("settings")
          .insert(defaultSettings);
        if (insertErr) {
          console.error("Supabase auto-seed settings failed:", insertErr);
          throw new Error(`Supabase insert error: ${insertErr.message}`);
        }
        return {
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
        };
      }
    }
    return readLocalDb().settings;
  }

  static async updateSettings(payload: any): Promise<any> {
    if (isSupabaseConfigured()) {
      if (!supabaseAdmin) throw new Error("Supabase admin client not initialized");
      const dbPayload = {
        marketplace_markup: payload.marketplaceMarkup,
        supported_cryptos: payload.supportedCryptos,
        default_sol_wallet: payload.defaultSolWallet,
        rpc_provider: payload.rpcProvider,
        email_alerts: payload.emailAlerts,
        maintenance_mode: payload.maintenanceMode,
        tax_rate: payload.taxRate,
        shipping_fee_usd: payload.shippingFeeUSD,
        free_shipping_threshold_usd: payload.freeShippingThresholdUSD,
        feature_flags: payload.featureFlags,
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabaseAdmin
        .from("settings")
        .update(dbPayload)
        .eq("id", "default")
        .select()
        .single();

      if (error) {
        console.error("Supabase updateSettings failed:", error);
        throw new Error(`Supabase query error: ${error.message}`);
      }
      return data;
    }
    const store = readLocalDb();
    store.settings = { ...store.settings, ...payload };
    writeLocalDb(store);
    return store.settings;
  }

  // 2. Products operations
  static async getProducts(): Promise<Product[]> {
    if (isSupabaseConfigured()) {
      if (!supabaseAdmin) throw new Error("Supabase admin client not initialized");
      const { data, error } = await supabaseAdmin
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Supabase getProducts failed:", error);
        throw new Error(`Supabase query error: ${error.message}`);
      }
      if (data) {
        return data.map(p => ({
          id: p.id,
          name: p.name,
          description: p.description,
          brand: p.brand,
          image: p.image,
          category: p.category,
          retailPrice: parseFloat(p.retail_price),
          marketplacePrice: parseFloat(p.marketplace_price),
          stockCount: p.stock_count,
          isFeatured: p.is_featured,
          rating: parseFloat(p.rating),
          reviewsCount: p.reviews_count,
          specs: p.specs,
          reviews: p.reviews || [],
          estimatedDelivery: p.estimated_delivery,
          retailerId: p.retailer_id,
          pricePoints: p.price_points || p.pricePoints || (p.retail_price ? [parseFloat(p.retail_price)] : [50]),
          regions: p.regions && p.regions.length > 0 ? p.regions : [p.region || "United States"],
          region: p.region || (p.regions && p.regions.length > 0 ? p.regions[0] : "United States"),
          currency: p.currency || "USD"
        }));
      }
    }
    return readLocalDb().products;
  }

  static async addProduct(payload: Omit<Product, "rating" | "reviewsCount" | "reviews" | "marketplacePrice"> & { marketplacePrice?: number }): Promise<Product> {
    const region = payload.region || (payload.regions && payload.regions.length > 0 ? payload.regions[0] : "United States");
    const currency = payload.currency || "USD";
    const basePrice = payload.retailPrice || 50;
    const defaultProduct = {
      rating: 5.0,
      reviewsCount: 0,
      reviews: [] as any[],
      marketplacePrice: payload.marketplacePrice || basePrice,
      pricePoints: payload.pricePoints && payload.pricePoints.length > 0 ? payload.pricePoints : [basePrice],
      regions: payload.regions && payload.regions.length > 0 ? payload.regions : [region],
      region: region,
      currency: currency,
      description: payload.description || "Digital gift card",
      stockCount: payload.stockCount !== undefined ? payload.stockCount : 50,
      isFeatured: payload.isFeatured !== undefined ? payload.isFeatured : false
    };
    const newProd = { ...defaultProduct, ...payload } as Product;
    newProd.region = payload.region || region;
    newProd.currency = payload.currency || currency;
    newProd.retailPrice = basePrice;
    newProd.marketplacePrice = payload.marketplacePrice || basePrice;
    newProd.pricePoints = payload.pricePoints && payload.pricePoints.length > 0 ? payload.pricePoints : [basePrice];
    newProd.regions = payload.regions && payload.regions.length > 0 ? payload.regions : [newProd.region];

    if (isSupabaseConfigured()) {
      if (!supabaseAdmin) throw new Error("Supabase admin client not initialized");
      const dbPayload = {
        id: newProd.id,
        name: newProd.name,
        description: newProd.description,
        brand: newProd.brand,
        image: newProd.image,
        category: newProd.category,
        retail_price: newProd.retailPrice,
        marketplace_price: newProd.marketplacePrice,
        stock_count: newProd.stockCount,
        is_featured: newProd.isFeatured,
        rating: newProd.rating,
        reviews_count: newProd.reviewsCount,
        specs: newProd.specs,
        reviews: newProd.reviews,
        estimated_delivery: newProd.estimatedDelivery,
        retailer_id: newProd.retailerId,
        price_points: newProd.pricePoints,
        regions: newProd.regions,
        currency: newProd.currency,
        created_at: new Date().toISOString()
      };

      const { error } = await supabaseAdmin
        .from("products")
        .insert(dbPayload);

      if (error) {
        console.error("Supabase addProduct failed:", error);
        throw new Error(`Supabase query error: ${error.message}`);
      }
      return newProd;
    }
    const store = readLocalDb();
    store.products = [newProd, ...(store.products || []).filter((p: any) => p.id !== newProd.id)];
    writeLocalDb(store);
    return newProd;
  }

  static async deleteProduct(productId: string): Promise<boolean> {
    if (isSupabaseConfigured()) {
      if (!supabaseAdmin) throw new Error("Supabase admin client not initialized");
      const { error } = await supabaseAdmin
        .from("products")
        .delete()
        .eq("id", productId);

      if (error) {
        console.error("Supabase deleteProduct failed:", error);
        throw new Error(`Supabase query error: ${error.message}`);
      }
      return true;
    }
    const store = readLocalDb();
    const lenBefore = store.products.length;
    store.products = store.products.filter((p: any) => p.id !== productId);
    writeLocalDb(store);
    return store.products.length < lenBefore;
  }

  static async updateProductStock(productId: string, stockCount: number): Promise<boolean> {
    if (isSupabaseConfigured()) {
      if (!supabaseAdmin) throw new Error("Supabase admin client not initialized");
      const { error } = await supabaseAdmin
        .from("products")
        .update({ stock_count: stockCount })
        .eq("id", productId);

      if (error) {
        console.error("Supabase updateProductStock failed:", error);
        throw new Error(`Supabase query error: ${error.message}`);
      }
      return true;
    }
    const store = readLocalDb();
    const idx = store.products.findIndex((p: any) => p.id === productId);
    if (idx !== -1) {
      store.products[idx].stockCount = stockCount;
      writeLocalDb(store);
      return true;
    }
    return false;
  }

  static async updateProduct(productId: string, updates: Partial<Product>): Promise<Product | null> {
    if (isSupabaseConfigured()) {
      if (!supabaseAdmin) throw new Error("Supabase admin client not initialized");
      
      const dbPayload: any = {};
      if (updates.name !== undefined) dbPayload.name = updates.name;
      if (updates.description !== undefined) dbPayload.description = updates.description;
      if (updates.brand !== undefined) dbPayload.brand = updates.brand;
      if (updates.image !== undefined) dbPayload.image = updates.image;
      if (updates.category !== undefined) dbPayload.category = updates.category;
      if (updates.retailPrice !== undefined) dbPayload.retail_price = updates.retailPrice;
      if (updates.marketplacePrice !== undefined) dbPayload.marketplace_price = updates.marketplacePrice;
      if (updates.stockCount !== undefined) dbPayload.stock_count = updates.stockCount;
      if (updates.isFeatured !== undefined) dbPayload.is_featured = updates.isFeatured;
      if (updates.specs !== undefined) dbPayload.specs = updates.specs;
      if (updates.estimatedDelivery !== undefined) dbPayload.estimated_delivery = updates.estimatedDelivery;
      if (updates.retailerId !== undefined) dbPayload.retailer_id = updates.retailerId;
      if (updates.regions !== undefined) dbPayload.regions = updates.regions;
      if (updates.region !== undefined) dbPayload.region = updates.region;
      if (updates.pricePoints !== undefined) dbPayload.price_points = updates.pricePoints;
      if (updates.currency !== undefined) dbPayload.currency = updates.currency;

      const { data, error } = await supabaseAdmin
        .from("products")
        .update(dbPayload)
        .eq("id", productId)
        .select()
        .single();

      if (error) {
        console.error("Supabase updateProduct failed:", error);
        throw new Error(`Supabase query error: ${error.message}`);
      }
      return data;
    }
    const store = readLocalDb();
    const idx = store.products.findIndex((p: any) => p.id === productId);
    if (idx !== -1) {
      store.products[idx] = { ...store.products[idx], ...updates };
      writeLocalDb(store);
      return store.products[idx];
    }
    return null;
  }

  static async addProductReview(productId: string, author: string, rating: number, comment: string): Promise<any> {
    if (isSupabaseConfigured()) {
      if (!supabaseAdmin) throw new Error("Supabase admin client not initialized");
      
      const { data: prod, error: fetchErr } = await supabaseAdmin
        .from("products")
        .select("*")
        .eq("id", productId)
        .single();

      if (fetchErr) {
        console.error("Supabase fetch product for review failed:", fetchErr);
        throw new Error(`Supabase query error: ${fetchErr.message}`);
      }

      const reviews = prod.reviews || [];
      const newReview = {
        author,
        rating: parseFloat(rating as any),
        comment,
        date: new Date().toLocaleDateString()
      };
      reviews.unshift(newReview);

      const totalRating = reviews.reduce((acc: number, r: any) => acc + r.rating, 0);
      const newAverage = parseFloat((totalRating / reviews.length).toFixed(1));

      const { error: updateErr } = await supabaseAdmin
        .from("products")
        .update({
          reviews,
          rating: newAverage,
          reviews_count: reviews.length
        })
        .eq("id", productId);

      if (updateErr) {
        console.error("Supabase addProductReview failed:", updateErr);
        throw new Error(`Supabase query error: ${updateErr.message}`);
      }
      return { rating: newAverage, reviewsCount: reviews.length };
    }
    const store = readLocalDb();
    const pIndex = store.products.findIndex((p: any) => p.id === productId);
    if (pIndex !== -1) {
      const prod = store.products[pIndex];
      if (!prod.reviews) prod.reviews = [];
      const newReview = {
        author,
        rating: parseFloat(rating as any),
        comment,
        date: new Date().toLocaleDateString()
      };
      prod.reviews.unshift(newReview);
      const totalRating = prod.reviews.reduce((acc: number, r: any) => acc + r.rating, 0);
      prod.rating = parseFloat((totalRating / prod.reviews.length).toFixed(1));
      prod.reviewsCount = prod.reviews.length;
      writeLocalDb(store);
      return { rating: prod.rating, reviewsCount: prod.reviewsCount };
    }
    return null;
  }

  // 3. Orders operations
  static async getOrders(): Promise<Order[]> {
    if (isSupabaseConfigured()) {
      if (!supabaseAdmin) throw new Error("Supabase admin client not initialized");
      const { data, error } = await supabaseAdmin
        .from("orders")
        .select("*")
        .order("timestamp", { ascending: false });

      if (error) {
        console.error("Supabase getOrders failed:", error);
        throw new Error(`Supabase query error: ${error.message}`);
      }
      if (data) {
        return data.map(o => ({
          id: o.id,
          walletAddress: o.wallet_address,
          customerDetails: o.customer_details,
          shippingAddress: o.shipping_address,
          items: o.items,
          retailerId: o.retailer_id,
          retailPriceUSD: parseFloat(o.retail_price_usd),
          paidSOL: parseFloat(o.paid_sol),
          receivedUSDC: parseFloat(o.received_usdc),
          txHash: o.tx_hash,
          swapTxHash: o.swap_tx_hash,
          status: o.status,
          giftCardCode: o.gift_card_code,
          timestamp: o.timestamp
        }));
      }
    }
    return readLocalDb().orders;
  }

  static async createOrder(order: Order): Promise<Order> {
    if (isSupabaseConfigured()) {
      if (!supabaseAdmin) throw new Error("Supabase admin client not initialized");
      const dbPayload = {
        id: order.id,
        wallet_address: order.walletAddress,
        customer_details: order.customerDetails,
        shipping_address: order.shippingAddress,
        items: order.items,
        retailer_id: order.retailerId,
        retail_price_usd: order.retailPriceUSD,
        paid_sol: order.paidSOL,
        received_usdc: order.receivedUSDC,
        tx_hash: order.txHash,
        swap_tx_hash: order.swapTxHash,
        status: order.status,
        gift_card_code: order.giftCardCode,
        timestamp: order.timestamp || new Date().toISOString()
      };

      const { error } = await supabaseAdmin
        .from("orders")
        .insert(dbPayload);

      if (error) {
        console.error("Supabase createOrder failed:", error);
        throw new Error(`Supabase query error: ${error.message}`);
      }
      return order;
    }
    const store = readLocalDb();
    store.orders.unshift(order);
    writeLocalDb(store);
    return order;
  }

  static async updateOrderStatus(orderId: string, status: string, details?: any): Promise<boolean> {
    if (isSupabaseConfigured()) {
      if (!supabaseAdmin) throw new Error("Supabase admin client not initialized");
      const payload: any = { status };
      if (details) {
        if (details.swapTxHash) payload.swap_tx_hash = details.swapTxHash;
        if (details.giftCardCode) payload.gift_card_code = details.giftCardCode;
      }

      const { error } = await supabaseAdmin
        .from("orders")
        .update(payload)
        .eq("id", orderId);

      if (error) {
        console.error("Supabase updateOrderStatus failed:", error);
        throw new Error(`Supabase query error: ${error.message}`);
      }
      return true;
    }
    const store = readLocalDb();
    const idx = store.orders.findIndex((o: any) => o.id === orderId);
    if (idx !== -1) {
      store.orders[idx] = {
        ...store.orders[idx],
        status,
        ...details
      };
      writeLocalDb(store);
      return true;
    }
    return false;
  }

  static async deliverGiftCardCode(orderId: string, giftCardCode: string): Promise<boolean> {
    if (isSupabaseConfigured()) {
      if (!supabaseAdmin) throw new Error("Supabase admin client not initialized");
      const { error } = await supabaseAdmin
        .from("orders")
        .update({ gift_card_code: giftCardCode })
        .eq("id", orderId);

      if (error) {
        console.error("Supabase deliverGiftCardCode failed:", error);
        throw new Error(`Supabase query error: ${error.message}`);
      }
      return true;
    }
    const store = readLocalDb();
    const idx = store.orders.findIndex((o: any) => o.id === orderId);
    if (idx !== -1) {
      store.orders[idx].giftCardCode = giftCardCode;
      writeLocalDb(store);
      return true;
    }
    return false;
  }

  static async updateOrderCustomerName(orderId: string, customerName: string): Promise<boolean> {
    if (isSupabaseConfigured()) {
      if (!supabaseAdmin) throw new Error("Supabase admin client not initialized");
      
      const { data: order, error: fetchErr } = await supabaseAdmin
        .from("orders")
        .select("customer_details")
        .eq("id", orderId)
        .single();

      if (fetchErr) {
        console.error("Supabase fetch order customer name failed:", fetchErr);
        throw new Error(`Supabase query error: ${fetchErr.message}`);
      }

      const custDetails = order.customer_details;
      custDetails.name = customerName;

      const { error: updateErr } = await supabaseAdmin
        .from("orders")
        .update({ customer_details: custDetails })
        .eq("id", orderId);

      if (updateErr) {
        console.error("Supabase updateOrderCustomerName failed:", updateErr);
        throw new Error(`Supabase query error: ${updateErr.message}`);
      }
      return true;
    }
    const store = readLocalDb();
    const idx = store.orders.findIndex((o: any) => o.id === orderId);
    if (idx !== -1) {
      store.orders[idx].customerDetails.name = customerName;
      writeLocalDb(store);
      return true;
    }
    return false;
  }

  // 4. Transactions operations
  static async getTransactions(): Promise<Transaction[]> {
    if (isSupabaseConfigured()) {
      if (!supabaseAdmin) throw new Error("Supabase admin client not initialized");
      const { data, error } = await supabaseAdmin
        .from("transactions")
        .select("*")
        .order("timestamp", { ascending: false });

      if (error) {
        console.error("Supabase getTransactions failed:", error);
        throw new Error(`Supabase query error: ${error.message}`);
      }
      if (data) {
        return data.map(t => ({
          id: t.id,
          orderId: t.order_id,
          walletAddress: t.wallet_address,
          type: t.type,
          amount: parseFloat(t.amount),
          token: t.token,
          status: t.status,
          txHash: t.tx_hash,
          timestamp: t.timestamp
        }));
      }
    }
    return readLocalDb().transactions;
  }

  static async createTransaction(tx: Transaction): Promise<Transaction> {
    if (isSupabaseConfigured()) {
      if (!supabaseAdmin) throw new Error("Supabase admin client not initialized");
      const dbPayload = {
        id: tx.id,
        order_id: tx.orderId,
        wallet_address: tx.walletAddress,
        type: tx.type,
        amount: tx.amount,
        token: tx.token,
        status: tx.status,
        tx_hash: tx.txHash,
        timestamp: tx.timestamp || new Date().toISOString()
      };

      const { error } = await supabaseAdmin
        .from("transactions")
        .insert(dbPayload);

      if (error) {
        console.error("Supabase createTransaction failed:", error);
        throw new Error(`Supabase query error: ${error.message}`);
      }
      return tx;
    }
    const store = readLocalDb();
    store.transactions.unshift(tx);
    writeLocalDb(store);
    return tx;
  }

  // 5. Users operations
  static async getUsers(): Promise<any[]> {
    if (isSupabaseConfigured()) {
      if (!supabaseAdmin) throw new Error("Supabase admin client not initialized");
      const { data, error } = await supabaseAdmin
        .from("users")
        .select("*");

      if (error) {
        console.error("Supabase getUsers failed:", error);
        throw new Error(`Supabase query error: ${error.message}`);
      }
      if (data) {
        return data.map(u => ({
          id: u.id,
          email: u.email,
          name: u.name,
          passwordHash: u.password_hash,
          role: u.role,
          isVerified: u.is_verified,
          verificationCode: u.verification_code,
          resetCode: u.reset_code,
          createdAt: u.created_at
        }));
      }
    }
    return readLocalDb().users;
  }

  static async createUser(user: any): Promise<any> {
    if (isSupabaseConfigured()) {
      if (!supabaseAdmin) throw new Error("Supabase admin client not initialized");
      const dbPayload = {
        id: user.id,
        email: user.email,
        name: user.name,
        password_hash: user.passwordHash,
        role: user.role,
        is_verified: user.isVerified,
        verification_code: user.verificationCode,
        reset_code: user.resetCode,
        created_at: user.createdAt || new Date().toISOString()
      };

      const { error } = await supabaseAdmin
        .from("users")
        .upsert(dbPayload, { onConflict: "id" });

      if (error) {
        console.error("Supabase createUser failed:", error);
        throw new Error(`Supabase query error: ${error.message}`);
      }
      return user;
    }
    const store = readLocalDb();
    const existingIdx = store.users.findIndex((u: any) => u.id === user.id);
    if (existingIdx !== -1) {
      store.users[existingIdx] = { ...store.users[existingIdx], ...user };
    } else {
      store.users.push(user);
    }
    writeLocalDb(store);
    return user;
  }

  static async updateUser(emailOrId: string, updates: any): Promise<boolean> {
    if (isSupabaseConfigured()) {
      if (!supabaseAdmin) throw new Error("Supabase admin client not initialized");
      const dbPayload: any = {};
      if (updates.email !== undefined) dbPayload.email = updates.email;
      if (updates.name !== undefined) dbPayload.name = updates.name;
      if (updates.passwordHash !== undefined) dbPayload.password_hash = updates.passwordHash;
      if (updates.role !== undefined) dbPayload.role = updates.role;
      if (updates.isVerified !== undefined) dbPayload.is_verified = updates.isVerified;
      if (updates.verificationCode !== undefined) dbPayload.verification_code = updates.verificationCode;
      if (updates.resetCode !== undefined) dbPayload.reset_code = updates.resetCode;

      const isEmail = emailOrId.includes("@");
      const query = supabaseAdmin.from("users").update(dbPayload);
      const { error } = isEmail 
        ? await query.eq("email", emailOrId.toLowerCase())
        : await query.eq("id", emailOrId);

      if (error) {
        console.error("Supabase updateUser failed:", error);
        throw new Error(`Supabase query error: ${error.message}`);
      }
      return true;
    }
    const store = readLocalDb();
    const isEmail = emailOrId.includes("@");
    const idx = store.users.findIndex((u: any) => 
      isEmail ? u.email.toLowerCase() === emailOrId.toLowerCase() : u.id === emailOrId
    );
    if (idx !== -1) {
      store.users[idx] = {
        ...store.users[idx],
        ...updates
      };
      writeLocalDb(store);
      return true;
    }
    return false;
  }

  static async deleteUser(id: string): Promise<boolean> {
    if (isSupabaseConfigured()) {
      if (!supabaseAdmin) throw new Error("Supabase admin client not initialized");
      const { error } = await supabaseAdmin
        .from("users")
        .delete()
        .eq("id", id);
      if (error) {
        console.error("Supabase deleteUser failed:", error);
        throw new Error(`Supabase query error: ${error.message}`);
      }
      return true;
    }
    const store = readLocalDb();
    const lenBefore = store.users.length;
    store.users = store.users.filter((u: any) => u.id !== id);
    writeLocalDb(store);
    return store.users.length < lenBefore;
  }

  // 6. Tickets operations
  static async getTickets(): Promise<any[]> {
    if (isSupabaseConfigured()) {
      if (!supabaseAdmin) throw new Error("Supabase admin client not initialized");
      const { data, error } = await supabaseAdmin
        .from("tickets")
        .select("*")
        .order("timestamp", { ascending: false });

      if (error) {
        console.error("Supabase getTickets failed:", error);
        throw new Error(`Supabase query error: ${error.message}`);
      }
      if (data) {
        return data.map(t => ({
          id: t.id,
          customer: t.customer,
          email: t.email,
          subject: t.subject,
          message: t.message,
          status: t.status,
          comments: t.comments || [],
          assignedTo: t.assigned_to,
          timestamp: t.timestamp
        }));
      }
    }
    return readLocalDb().tickets || [];
  }

  static async createTicket(payload: any): Promise<any> {
    const newTicket = {
      id: payload.id || `tkt-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      status: "open",
      comments: [] as any[],
      timestamp: new Date().toISOString(),
      ...payload
    };

    // Send a copy of the ticket message to support email
    try {
      const subject = `[SUPPORT ALERT] Ticket #${newTicket.id} - ${newTicket.subject}`;
      const html = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 8px;">
          <h2 style="color: #6366f1; text-align: center;">New Help Desk Ticket</h2>
          <p><strong>Ticket ID:</strong> #${newTicket.id}</p>
          <p><strong>Customer Name:</strong> ${newTicket.customer}</p>
          <p><strong>Customer Email:</strong> ${newTicket.email}</p>
          <p><strong>Subject:</strong> ${newTicket.subject}</p>
          <p><strong>Message:</strong></p>
          <div style="background-color: #f9fafb; padding: 15px; border-radius: 6px; border: 1px solid #eaeaea; margin-top: 10px;">
            ${newTicket.message.replace(/\n/g, "<br/>")}
          </div>
          <hr style="border: none; border-top: 1px solid #eaeaea; margin: 20px 0;" />
          <p style="text-align: center; color: #9ca3af; font-size: 12px;">SOLCart - Digital Gift Card Payment Gateway</p>
        </div>
      `;
      sendEmail({ to: SOLCART_SUPPORT_EMAIL, subject, html }).catch(err => {
        console.warn("Failed to notify support email:", err);
      });
    } catch (e) {
      console.warn("Support alert block failed:", e);
    }

    if (isSupabaseConfigured()) {
      if (!supabaseAdmin) throw new Error("Supabase admin client not initialized");
      const dbPayload = {
        id: newTicket.id,
        customer: newTicket.customer,
        email: newTicket.email,
        subject: newTicket.subject,
        message: newTicket.message,
        status: newTicket.status,
        comments: newTicket.comments,
        assigned_to: newTicket.assignedTo,
        timestamp: newTicket.timestamp
      };

      const { error } = await supabaseAdmin
        .from("tickets")
        .insert(dbPayload);

      if (error) {
        console.error("Supabase createTicket failed:", error);
        throw new Error(`Supabase query error: ${error.message}`);
      }
      return newTicket;
    }
    const store = readLocalDb();
    if (!store.tickets) store.tickets = [];
    store.tickets.unshift(newTicket);
    writeLocalDb(store);
    return newTicket;
  }

  static async addTicketComment(ticketId: string, comment: string): Promise<any> {
    if (isSupabaseConfigured()) {
      if (!supabaseAdmin) throw new Error("Supabase admin client not initialized");
      
      const { data: ticket, error: fetchErr } = await supabaseAdmin
        .from("tickets")
        .select("*")
        .eq("id", ticketId)
        .single();

      if (fetchErr) {
        console.error("Supabase fetch ticket for comment failed:", fetchErr);
        throw new Error(`Supabase query error: ${fetchErr.message}`);
      }

      const comments = ticket.comments || [];
      comments.push({
        id: `cmt-${Date.now()}`,
        comment,
        timestamp: new Date().toISOString()
      });

      const { error: updateErr } = await supabaseAdmin
        .from("tickets")
        .update({ comments })
        .eq("id", ticketId);

      if (updateErr) {
        console.error("Supabase addTicketComment failed:", updateErr);
        throw new Error(`Supabase query error: ${updateErr.message}`);
      }

      // Send email to customer directly with the comment reply
      try {
        await sendEmail({
          to: ticket.email,
          subject: `Re: [SOLCart Support] ${ticket.subject}`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 8px;">
              <h2 style="color: #8b5cf6;">SOLCart Support Response</h2>
              <p>Dear ${ticket.customer},</p>
              <p>Our support team has responded to your inquiry regarding <strong>"${ticket.subject}"</strong>:</p>
              <div style="background-color: #f9f9f9; padding: 15px; border-left: 4px solid #8b5cf6; margin: 20px 0; font-style: italic; white-space: pre-wrap;">
                ${comment}
              </div>
              <p style="color: #666; font-size: 11px; margin-top: 30px; border-top: 1px solid #eaeaea; padding-top: 15px;">
                This is a response to the support ticket you created on our site. You can reply directly to this email if you have any follow-up questions.
              </p>
            </div>
          `
        });
      } catch (emailErr) {
        console.error("Failed to email ticket reply:", emailErr);
      }

      return comments;
    }
    const store = readLocalDb();
    const idx = store.tickets.findIndex((t: any) => t.id === ticketId);
    if (idx !== -1) {
      const ticket = store.tickets[idx];
      if (!ticket.comments) ticket.comments = [];
      const newComment = {
        id: `cmt-${Date.now()}`,
        comment,
        timestamp: new Date().toISOString()
      };
      ticket.comments.push(newComment);
      writeLocalDb(store);

      // Send email to customer directly
      try {
        await sendEmail({
          to: ticket.email,
          subject: `Re: [SOLCart Support] ${ticket.subject}`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 8px;">
              <h2 style="color: #8b5cf6;">SOLCart Support Response</h2>
              <p>Dear ${ticket.customer},</p>
              <p>Our support team has responded to your inquiry regarding <strong>"${ticket.subject}"</strong>:</p>
              <div style="background-color: #f9f9f9; padding: 15px; border-left: 4px solid #8b5cf6; margin: 20px 0; font-style: italic; white-space: pre-wrap;">
                ${comment}
              </div>
              <p style="color: #666; font-size: 11px; margin-top: 30px; border-top: 1px solid #eaeaea; padding-top: 15px;">
                This is a response to the support ticket you created on our site. You can reply directly to this email if you have any follow-up questions.
              </p>
            </div>
          `
        });
      } catch (emailErr) {
        console.error("Failed to email ticket reply:", emailErr);
      }

      return ticket.comments;
    }
    return null;
  }

  // 7. Activity Logs operations
  static async getActivityLogs(): Promise<ActivityLog[]> {
    if (isSupabaseConfigured()) {
      if (!supabaseAdmin) throw new Error("Supabase admin client not initialized");
      const { data, error } = await supabaseAdmin
        .from("activity_logs")
        .select("*")
        .order("timestamp", { ascending: false })
        .limit(200);

      if (error) {
        console.error("Supabase getActivityLogs failed:", error);
        throw new Error(`Supabase query error: ${error.message}`);
      }
      if (data) {
        return data.map(log => ({
          id: log.id,
          action: log.action,
          details: log.details,
          timestamp: log.timestamp,
          type: log.type,
          userId: log.user_id
        }));
      }
    }
    return readLocalDb().activityLogs || [];
  }

  static async logActivity(category: string, message: string, type: ActivityLog['type'] = "info", userId?: string): Promise<ActivityLog | null> {
    const newLog: ActivityLog = {
      id: `log-${Math.random().toString(36).substr(2, 9)}`,
      action: category,
      details: message,
      timestamp: new Date().toISOString(),
      type,
      userId
    };

    if (isSupabaseConfigured()) {
      if (!supabaseAdmin) throw new Error("Supabase admin client not initialized");
      const dbPayload = {
        id: newLog.id,
        action: newLog.action,
        details: newLog.details,
        timestamp: newLog.timestamp,
        type: newLog.type,
        user_id: newLog.userId
      };

      const { error } = await supabaseAdmin
        .from("activity_logs")
        .insert(dbPayload);

      if (error) {
        console.error("Supabase logActivity failed:", error);
        throw new Error(`Supabase query error: ${error.message}`);
      }
      return newLog;
    }
    const store = readLocalDb();
    if (!store.activityLogs) store.activityLogs = [];
    store.activityLogs.unshift(newLog);
    if (store.activityLogs.length > 200) store.activityLogs.pop();
    writeLocalDb(store);
    return newLog;
  }

  static async getGiftCardPool(): Promise<any[]> {
    if (isSupabaseConfigured()) {
      return [];
    }
    const store = readLocalDb();
    return store.giftCardPool || [];
  }

  static async saveGiftCardPool(pool: any[]): Promise<boolean> {
    if (isSupabaseConfigured()) {
      return true;
    }
    const store = readLocalDb();
    store.giftCardPool = pool;
    writeLocalDb(store);
    return true;
  }

  static async getLaunches(): Promise<any[]> {
    if (isSupabaseConfigured()) {
      return [];
    }
    const store = readLocalDb();
    return store.launches || [];
  }

  static async saveLaunches(launches: any[]): Promise<boolean> {
    if (isSupabaseConfigured()) {
      return true;
    }
    const store = readLocalDb();
    store.launches = launches;
    writeLocalDb(store);
    return true;
  }
}

