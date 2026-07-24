import { Order, Transaction, ShippingAddress, RefundRequest, ActivityLog, CustomerDetails } from "../types";

// Simulated Database Keys
const STORAGE_KEYS = {
  ORDERS: "solcart_db_orders",
  TRANSACTIONS: "solcart_db_transactions",
  ADDRESSES: "solcart_db_addresses",
  REFUNDS: "solcart_db_refunds",
  ACTIVITY_LOGS: "solcart_db_activity_logs",
  CURRENT_USER: "solcart_session_user",
  STAFF: "solcart_db_staff",
  SUPPLIERS: "solcart_db_suppliers",
  TICKETS: "solcart_db_tickets",
  SETTINGS: "solcart_db_settings"
};

// Initial Database Seeds
const MOCK_ADDRESSES: ShippingAddress[] = [
  {
    id: "addr-1",
    name: "Ridhwan Solcart",
    streetAddress: "123 Solana Boulevard, Suite 500",
    city: "San Francisco",
    state: "CA",
    postalCode: "94105",
    country: "United States",
    isDefault: true
  }
];

const DEFAULT_STAFF = [
  { id: "staff-1", name: "Sarah Owner", email: "owner@solcart.io", role: "Owner", permissions: ["*"], createdAt: "2025-01-10T12:00:00Z", lastActive: "Just now", status: "Active", assignedOrders: 1 },
  { id: "staff-2", name: "Alex SuperAdmin", email: "superadmin@solcart.io", role: "Super Admin", permissions: ["*"], createdAt: "2025-01-11T12:00:00Z", lastActive: "Just now", status: "Active", assignedOrders: 0 },
  { id: "staff-3", name: "Fred Finance", email: "finance@solcart.io", role: "Finance Manager", permissions: ["overview", "analytics", "payments", "refunds", "finance"], createdAt: "2025-01-12T12:00:00Z", lastActive: "2 hours ago", status: "Active", assignedOrders: 0 },
  { id: "staff-4", name: "Olivia Operations", email: "ops@solcart.io", role: "Operations Manager", permissions: ["overview", "orders", "retailers", "products", "inventory", "notifications", "settings"], createdAt: "2025-01-13T12:00:00Z", lastActive: "1 day ago", status: "Active", assignedOrders: 2 },
  { id: "staff-5", name: "Steve Support", email: "support@solcart.io", role: "Customer Support", permissions: ["orders", "refunds", "support"], createdAt: "2025-01-14T12:00:00Z", lastActive: "5 mins ago", status: "Active", assignedOrders: 1 },
  { id: "staff-6", name: "Frank Fulfillment", email: "fulfillment@solcart.io", role: "Fulfillment Manager", permissions: ["orders", "inventory"], createdAt: "2025-01-15T12:00:00Z", lastActive: "3 days ago", status: "Active", assignedOrders: 1 },
  { id: "staff-7", name: "Ana Analyst", email: "analyst@solcart.io", role: "Read-Only Analyst", permissions: ["overview", "analytics", "customers", "payments", "refunds", "retailers", "products", "inventory", "finance"], createdAt: "2025-01-16T12:00:00Z", lastActive: "4 hours ago", status: "Active", assignedOrders: 0 }
];

const DEFAULT_SUPPLIERS = [
  { id: "sup-1", name: "Amazon Fulfillment Center", status: "Active", productsCount: 150, ordersCount: 452, avgDeliveryDays: 2.4, failureRate: 1.2, revenueUSD: 8520.40, healthStatus: "Good" },
  { id: "sup-2", name: "Nike Logistics Direct", status: "Active", productsCount: 45, ordersCount: 128, avgDeliveryDays: 3.1, failureRate: 0.5, revenueUSD: 5410.90, healthStatus: "Excellent" },
  { id: "sup-3", name: "Apple Store Wholesale", status: "Active", productsCount: 22, ordersCount: 98, avgDeliveryDays: 1.8, failureRate: 2.1, revenueUSD: 14520.10, healthStatus: "Good" },
  { id: "sup-4", name: "Walmart Distribution Network", status: "Warning", productsCount: 110, ordersCount: 54, avgDeliveryDays: 5.5, failureRate: 8.5, revenueUSD: 1240.20, healthStatus: "Critical" }
];

const DEFAULT_TICKETS = [
  { id: "tkt-1", customer: "Alice Johnson", email: "alice@gmail.com", subject: "Nike sneaker size exchange request", message: "Hi support, I ordered Nike Pegasus shoes (size 10) but they are a bit too tight. Can I swap them for a size 10.5? The order reference is #ord-827392.", status: "open", assignedTo: "Steve Support", timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), comments: [{ author: "Steve Support", text: "Checking current inventory for size 10.5.", timestamp: new Date(Date.now() - 11 * 60 * 60 * 1000).toISOString() }] },
  { id: "tkt-2", customer: "Bob Smith", email: "bob.smith@yahoo.com", subject: "Payment confirmed but order state stuck", message: "Hello, my transaction on Solana went through and the SOL was deducted, but the dashboard still shows 'Pending Payment'. Please verify.", status: "resolved", assignedTo: "Steve Support", timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(), comments: [{ author: "Steve Support", text: "Transaction verified on Helius RPC. Updated order status to Paid. Fulfillment in progress.", timestamp: new Date(Date.now() - 47 * 60 * 60 * 1000).toISOString() }] },
  { id: "tkt-3", customer: "John Doe", email: "john.doe@gmail.com", subject: "Refund request details", message: "Hi, I requested a refund on my cancelled order ord-482716. Can you please check if the SOL has been sent back to my wallet?", status: "waiting", assignedTo: "Steve Support", timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), comments: [] }
];

const DEFAULT_SETTINGS = {
  marketplaceMarkup: 10,
  supportedCryptos: ["SOL", "USDT"],
  defaultSolWallet: "So11111111111111111111111111111111111111112",
  rpcProvider: "Helius Mainnet Beta",
  emailAlerts: false,
  maintenanceMode: false,
  taxRate: 5,
  featureFlags: { autoSwap: true, mockFulfillment: true, analyticsDashboard: true }
};

const MOCK_ORDERS: Order[] = [
  {
    id: "ord-827392",
    walletAddress: "PhanToM528aBCDeFGHiJKLmNoPQRstUVwXyz1234567",
    customerDetails: { name: "John Doe", email: "john.doe@gmail.com", phone: "+1 555-0199" },
    shippingAddress: { id: "addr-1", name: "John Doe", streetAddress: "1600 Amphitheatre Pkwy", city: "Mountain View", state: "CA", postalCode: "94043", country: "United States", isDefault: true },
    items: [
      { productId: "p-nike-1", productName: "Nike Air Max 270", brand: "Nike", retailerId: "nike", quantity: 1, retailPriceUSD: 150.00, marketplacePriceUSD: 165.00, image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300" }
    ],
    retailerId: "nike",
    retailPriceUSD: 165.00,
    paidSOL: 2.1054,
    receivedUSDT: 165.00,
    txHash: "5TqW6Y6D1a2b3c4d5e6f7g8h9i0jKaKbKcKdKeKfKgKhKiKjKlKmKnKoKpKqKrKs",
    status: "delivered",
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    trackingNumber: "UPS-1Z999AA10123456784",
    carrier: "UPS"
  },
  {
    id: "ord-981273",
    walletAddress: "SoLFLarE987aBCDeFGHiJKLmNoPQRstUVwXyz7654321",
    customerDetails: { name: "Alice Johnson", email: "alice.j@outlook.com", phone: "+1 555-0144" },
    shippingAddress: { id: "addr-2", name: "Alice Johnson", streetAddress: "742 Evergreen Terrace", city: "Springfield", state: "IL", postalCode: "62704", country: "United States", isDefault: false },
    items: [
      { productId: "p-apple-1", productName: "Apple AirPods Pro (2nd Gen)", brand: "Apple", retailerId: "apple", quantity: 1, retailPriceUSD: 249.00, marketplacePriceUSD: 273.90, image: "https://images.unsplash.com/photo-1588449668338-d15168836f43?w=300" }
    ],
    retailerId: "apple",
    retailPriceUSD: 273.90,
    paidSOL: 3.5115,
    receivedUSDT: 273.90,
    txHash: "4PqW5X5C2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d",
    status: "shipped",
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    trackingNumber: "FedEx-781234567890",
    carrier: "FedEx"
  },
  {
    id: "ord-102938",
    walletAddress: "BacKPaCK111aBCDeFGHiJKLmNoPQRstUVwXyz9999999",
    customerDetails: { name: "Bob Smith", email: "bob.smith@yahoo.com", phone: "+1 555-0188" },
    shippingAddress: { id: "addr-3", name: "Bob Smith", streetAddress: "221B Baker St", city: "London", state: "England", postalCode: "NW1 6XE", country: "United Kingdom", isDefault: false },
    items: [
      { productId: "p-amazon-2", productName: "Logitech MX Mouse", brand: "Logitech", retailerId: "amazon", quantity: 2, retailPriceUSD: 99.00, marketplacePriceUSD: 108.90, image: "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=300" }
    ],
    retailerId: "amazon",
    retailPriceUSD: 217.80,
    paidSOL: 2.7923,
    receivedUSDT: 217.80,
    txHash: "3RqW4Z4D3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d",
    status: "paid",
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
  },
  {
    id: "ord-482716",
    walletAddress: "PhanToM528aBCDeFGHiJKLmNoPQRstUVwXyz1234567",
    customerDetails: { name: "John Doe", email: "john.doe@gmail.com", phone: "+1 555-0199" },
    shippingAddress: { id: "addr-1", name: "John Doe", streetAddress: "1600 Amphitheatre Pkwy", city: "Mountain View", state: "CA", postalCode: "94043", country: "United States", isDefault: true },
    items: [
      { productId: "p-nike-2", productName: "Nike Tech Fleece Hoodie", brand: "Nike", retailerId: "nike", quantity: 1, retailPriceUSD: 120.00, marketplacePriceUSD: 132.00, image: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=300" }
    ],
    retailerId: "nike",
    retailPriceUSD: 132.00,
    paidSOL: 1.6923,
    receivedUSDT: 132.00,
    txHash: "2AqW3Y3B4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d",
    status: "refunded",
    timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
  }
];

const MOCK_TRANSACTIONS: Transaction[] = [
  { id: "tx-1", orderId: "ord-827392", walletAddress: "PhanToM528aBCDeFGHiJKLmNoPQRstUVwXyz1234567", type: "payment", amount: 2.1054, token: "SOL", status: "success", txHash: "5TqW6Y6D1a2b3c4d5e6f7g8h9i0jKaKbKcKdKeKfKgKhKiKjKlKmKnKoKpKqKrKs", timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
  { id: "tx-2", orderId: "ord-827392", walletAddress: "PhanToM528aBCDeFGHiJKLmNoPQRstUVwXyz1234567", type: "swap", amount: 165.00, token: "USDT", status: "success", txHash: "swap_hash_1234", timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
  { id: "tx-3", orderId: "ord-981273", walletAddress: "SoLFLarE987aBCDeFGHiJKLmNoPQRstUVwXyz7654321", type: "payment", amount: 3.5115, token: "SOL", status: "success", txHash: "4PqW5X5C2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d", timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() },
  { id: "tx-4", orderId: "ord-102938", walletAddress: "BacKPaCK111aBCDeFGHiJKLmNoPQRstUVwXyz9999999", type: "payment", amount: 2.7923, token: "SOL", status: "success", txHash: "3RqW4Z4D3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d", timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString() },
  { id: "tx-5", orderId: "ord-482716", walletAddress: "PhanToM528aBCDeFGHiJKLmNoPQRstUVwXyz1234567", type: "payment", amount: 1.6923, token: "SOL", status: "success", txHash: "2AqW3Y3B4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d", timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() },
  { id: "tx-6", orderId: "ord-482716", walletAddress: "PhanToM528aBCDeFGHiJKLmNoPQRstUVwXyz1234567", type: "refund", amount: 1.6923, token: "SOL", status: "success", txHash: "refund_hash_4455", timestamp: new Date(Date.now() - 4.8 * 24 * 60 * 60 * 1000).toISOString() }
];

const MOCK_REFUNDS: RefundRequest[] = [
  { id: "ref-482716", orderId: "ord-482716", reason: "Item fit was too small, requesting SOL refund", status: "approved", paidSOL: 1.6923, refundAmountUSD: 132.00, refundTxHash: "refund_hash_4455", timestamp: new Date(Date.now() - 4.9 * 24 * 60 * 60 * 1000).toISOString() }
];

export class SupabaseService {
  /* =========================================================================
     AUTHENTICATION OPERATIONS (Production: supabase.auth.*)
     ========================================================================= */

  static async signIn(email: string): Promise<{ success: boolean; user?: any; error?: string }> {
    if (!email.includes("@")) {
      return { success: false, error: "Invalid email format" };
    }

    const emailLower = email.toLowerCase();
    const staffMembers = this.getStaff();
    const matchedStaff = staffMembers.find(s => s.email === emailLower);

    let user;
    if (matchedStaff) {
      user = {
        id: matchedStaff.id,
        email: matchedStaff.email,
        name: matchedStaff.name,
        role: matchedStaff.role,
        permissions: matchedStaff.permissions,
        createdAt: matchedStaff.createdAt
      };
      
      // Update last active
      matchedStaff.lastActive = "Just now";
      localStorage.setItem(STORAGE_KEYS.STAFF, JSON.stringify(staffMembers));
    } else {
      const isAdmin = emailLower.startsWith("admin");
      user = {
        id: isAdmin ? "usr-admin-777" : "usr-customer-111",
        email: emailLower,
        name: isAdmin ? "SOLCart Admin" : "Ridhwan Solcart",
        role: isAdmin ? "Super Admin" : "customer",
        permissions: isAdmin ? ["*"] : [],
        createdAt: new Date().toISOString()
      };
    }

    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
      this.logActivity("Auth", `User signed in successfully: ${email} (${user.role})`, "info", user.name);
    }

    return { success: true, user };
  }

  static async signOut(): Promise<void> {
    if (typeof window !== "undefined") {
      const user = this.getCurrentUser();
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
      if (user) {
        this.logActivity("Auth", `User signed out: ${user.email}`, "info", user.name);
      }
    }
  }

  static getCurrentUser(): any | null {
    if (typeof window === "undefined") return null;
    const stored = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    return stored ? JSON.parse(stored) : null;
  }

  /* =========================================================================
     ORDER OPERATIONS (Production: supabase.from('orders').*)
     ========================================================================= */

  private static isSyncing = false;

  static async syncWithServer(): Promise<void> {
    if (typeof window === "undefined" || this.isSyncing) return;
    this.isSyncing = true;
    try {
      const res = await fetch("/api/db");
      if (res.ok) {
        const result = await res.json();
        if (result.success && result.data && result.data.orders) {
          localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(result.data.orders));
        }
      }
    } catch (e) {
      console.warn("SupabaseService background sync skipped", e);
    } finally {
      this.isSyncing = false;
    }
  }

  static getOrders(): Order[] {
    if (typeof window === "undefined") return [];
    this.syncWithServer();
    const stored = localStorage.getItem(STORAGE_KEYS.ORDERS);
    if (!stored) {
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(MOCK_ORDERS));
      return MOCK_ORDERS;
    }
    try {
      return JSON.parse(stored);
    } catch {
      return MOCK_ORDERS;
    }
  }

  static getOrdersByWallet(walletAddress: string): Order[] {
    return this.getOrders().filter(o => o.walletAddress.toLowerCase() === walletAddress.toLowerCase());
  }

  static getOrderById(id: string): Order | undefined {
    return this.getOrders().find(o => o.id === id);
  }

  static createOrder(order: Omit<Order, "id" | "timestamp">): Order {
    const newOrder: Order = {
      ...order,
      id: `ord-${Math.floor(100000 + Math.random() * 900000)}`,
      timestamp: new Date().toISOString()
    };

    const orders = this.getOrders();
    orders.unshift(newOrder);
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));

    // Post to central server DB API
    fetch("/api/db", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "createOrder",
        payload: newOrder
      })
    }).catch(() => {});

    this.logActivity(
      "Orders", 
      `New order created: ${newOrder.id} Sourced from ${newOrder.retailerId.toUpperCase()}. Total: $${newOrder.retailPriceUSD.toFixed(2)}`,
      "info",
      newOrder.customerDetails.name
    );

    return newOrder;
  }

  static updateOrderStatus(orderId: string, status: Order['status'], details?: Partial<Order>): void {
    const orders = this.getOrders();
    const index = orders.findIndex(o => o.id === orderId);
    const currentUser = this.getCurrentUser();
    const actor = currentUser ? currentUser.name : "System";
    
    if (index !== -1) {
      const oldStatus = orders[index].status;
      orders[index].status = status;
      if (details) {
        orders[index] = { ...orders[index], ...details };
      }
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));

      fetch("/api/db", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "updateOrderStatus",
          payload: { orderId, status, details }
        })
      }).catch(() => {});

      this.logActivity("Orders", `Order ${orderId} status updated from ${oldStatus} to ${status}`, "info", actor);
    }
  }


  /* =========================================================================
     TRANSACTION OPERATIONS (Production: supabase.from('transactions').*)
     ========================================================================= */

  static getTransactions(): Transaction[] {
    if (typeof window === "undefined") return [];
    const stored = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    if (!stored) {
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(MOCK_TRANSACTIONS));
      return MOCK_TRANSACTIONS;
    }
    return JSON.parse(stored);
  }

  static createTransaction(tx: Omit<Transaction, "id" | "timestamp">): Transaction {
    const newTx: Transaction = {
      ...tx,
      id: `tx-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString()
    };

    const txs = this.getTransactions();
    txs.unshift(newTx);
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(txs));

    const currentUser = this.getCurrentUser();
    const actor = currentUser ? currentUser.name : "System";

    this.logActivity(
      "Transactions", 
      `Tx logged: ${newTx.type} of ${newTx.amount} ${newTx.token} - Status: ${newTx.status}`,
      "info",
      actor
    );

    return newTx;
  }

  /* =========================================================================
     ADDRESS OPERATIONS (Production: supabase.from('addresses').*)
     ========================================================================= */

  static getAddresses(): ShippingAddress[] {
    if (typeof window === "undefined") return [];
    const stored = localStorage.getItem(STORAGE_KEYS.ADDRESSES);
    if (!stored) {
      localStorage.setItem(STORAGE_KEYS.ADDRESSES, JSON.stringify(MOCK_ADDRESSES));
      return MOCK_ADDRESSES;
    }
    return JSON.parse(stored);
  }

  static addAddress(address: Omit<ShippingAddress, "id">): ShippingAddress {
    const addresses = this.getAddresses();
    const newAddr: ShippingAddress = {
      ...address,
      id: `addr-${Math.random().toString(36).substr(2, 9)}`,
      isDefault: addresses.length === 0 ? true : address.isDefault
    };

    if (newAddr.isDefault) {
      addresses.forEach(a => a.isDefault = false);
    }

    addresses.push(newAddr);
    localStorage.setItem(STORAGE_KEYS.ADDRESSES, JSON.stringify(addresses));
    return newAddr;
  }

  static updateAddress(id: string, updated: Partial<ShippingAddress>): void {
    const addresses = this.getAddresses();
    const index = addresses.findIndex(a => a.id === id);
    if (index !== -1) {
      if (updated.isDefault) {
        addresses.forEach(a => a.isDefault = false);
      }
      addresses[index] = { ...addresses[index], ...updated };
      localStorage.setItem(STORAGE_KEYS.ADDRESSES, JSON.stringify(addresses));
    }
  }

  static deleteAddress(id: string): void {
    let addresses = this.getAddresses();
    const deletedWasDefault = addresses.find(a => a.id === id)?.isDefault;
    addresses = addresses.filter(a => a.id !== id);
    
    if (deletedWasDefault && addresses.length > 0) {
      addresses[0].isDefault = true;
    }
    
    localStorage.setItem(STORAGE_KEYS.ADDRESSES, JSON.stringify(addresses));
  }

  /* =========================================================================
     REFUND OPERATIONS (Production: supabase.from('refunds').*)
     ========================================================================= */

  static getRefundRequests(): RefundRequest[] {
    if (typeof window === "undefined") return [];
    const stored = localStorage.getItem(STORAGE_KEYS.REFUNDS);
    if (!stored) {
      localStorage.setItem(STORAGE_KEYS.REFUNDS, JSON.stringify(MOCK_REFUNDS));
      return MOCK_REFUNDS;
    }
    return JSON.parse(stored);
  }

  static createRefundRequest(orderId: string, reason: string): RefundRequest | null {
    const order = this.getOrderById(orderId);
    if (!order) return null;

    const existing = this.getRefundRequests().find(r => r.orderId === orderId);
    if (existing) return existing;

    const newRefund: RefundRequest = {
      id: `ref-${Math.random().toString(36).substr(2, 9)}`,
      orderId,
      reason,
      status: "pending",
      paidSOL: order.paidSOL,
      refundAmountUSD: order.retailPriceUSD,
      timestamp: new Date().toISOString()
    };

    const refunds = this.getRefundRequests();
    refunds.unshift(newRefund);
    localStorage.setItem(STORAGE_KEYS.REFUNDS, JSON.stringify(refunds));

    this.updateOrderStatus(orderId, "refunded");
    this.logActivity("Refunds", `Refund requested for order ${orderId}. Reason: ${reason}`, "warning", order.customerDetails.name);

    return newRefund;
  }

  static updateRefundRequestStatus(refundId: string, status: RefundRequest['status'], refundTxHash?: string): void {
    const refunds = this.getRefundRequests();
    const index = refunds.findIndex(r => r.id === refundId);
    const currentUser = this.getCurrentUser();
    const actor = currentUser ? currentUser.name : "System";

    if (index !== -1) {
      refunds[index].status = status;
      if (refundTxHash) {
        refunds[index].refundTxHash = refundTxHash;
      }
      localStorage.setItem(STORAGE_KEYS.REFUNDS, JSON.stringify(refunds));
      
      const orderId = refunds[index].orderId;
      if (status === "approved") {
        this.updateOrderStatus(orderId, "refunded");
      }
      
      this.logActivity("Refunds", `Refund request ${refundId} was ${status}`, "info", actor);
    }
  }

  /* =========================================================================
     STAFF MANAGEMENT
     ========================================================================= */

  static getStaff(): any[] {
    if (typeof window === "undefined") return [];
    const stored = localStorage.getItem(STORAGE_KEYS.STAFF);
    if (!stored) {
      localStorage.setItem(STORAGE_KEYS.STAFF, JSON.stringify(DEFAULT_STAFF));
      return DEFAULT_STAFF;
    }
    return JSON.parse(stored);
  }

  static updateStaff(id: string, updatedFields: any): void {
    const staff = this.getStaff();
    const idx = staff.findIndex(s => s.id === id);
    const currentUser = this.getCurrentUser();
    const actor = currentUser ? currentUser.name : "System";
    
    if (idx !== -1) {
      staff[idx] = { ...staff[idx], ...updatedFields };
      localStorage.setItem(STORAGE_KEYS.STAFF, JSON.stringify(staff));
      this.logActivity("Staff", `Updated permissions/role for staff member ${staff[idx].name}`, "security", actor);
    }
  }

  static addStaff(newMember: any): void {
    const staff = this.getStaff();
    const currentUser = this.getCurrentUser();
    const actor = currentUser ? currentUser.name : "System";
    
    staff.push({
      id: `staff-${Math.random().toString(36).substr(2, 9)}`,
      status: "Active",
      createdAt: new Date().toISOString(),
      lastActive: "Never",
      assignedOrders: 0,
      ...newMember
    });
    localStorage.setItem(STORAGE_KEYS.STAFF, JSON.stringify(staff));
    this.logActivity("Staff", `Added new staff member: ${newMember.name} as ${newMember.role}`, "security", actor);
  }

  static removeStaff(id: string): void {
    const staff = this.getStaff();
    const member = staff.find(s => s.id === id);
    const currentUser = this.getCurrentUser();
    const actor = currentUser ? currentUser.name : "System";
    
    if (member) {
      const filtered = staff.filter(s => s.id !== id);
      localStorage.setItem(STORAGE_KEYS.STAFF, JSON.stringify(filtered));
      this.logActivity("Staff", `Removed staff member: ${member.name}`, "security", actor);
    }
  }

  /* =========================================================================
     INVENTORY & SUPPLIERS
     ========================================================================= */

  static getSuppliers(): any[] {
    if (typeof window === "undefined") return [];
    const stored = localStorage.getItem(STORAGE_KEYS.SUPPLIERS);
    if (!stored) {
      localStorage.setItem(STORAGE_KEYS.SUPPLIERS, JSON.stringify(DEFAULT_SUPPLIERS));
      return DEFAULT_SUPPLIERS;
    }
    return JSON.parse(stored);
  }

  static updateSupplierStatus(id: string, status: string): void {
    const suppliers = this.getSuppliers();
    const idx = suppliers.findIndex(s => s.id === id);
    const currentUser = this.getCurrentUser();
    const actor = currentUser ? currentUser.name : "System";

    if (idx !== -1) {
      suppliers[idx].status = status;
      localStorage.setItem(STORAGE_KEYS.SUPPLIERS, JSON.stringify(suppliers));
      this.logActivity("Inventory", `Supplier ${suppliers[idx].name} status changed to ${status}`, "info", actor);
    }
  }

  /* =========================================================================
     SUPPORT TICKETS
     ========================================================================= */

  static getTickets(): any[] {
    if (typeof window === "undefined") return [];
    const stored = localStorage.getItem(STORAGE_KEYS.TICKETS);
    if (!stored) {
      localStorage.setItem(STORAGE_KEYS.TICKETS, JSON.stringify(DEFAULT_TICKETS));
      return DEFAULT_TICKETS;
    }
    return JSON.parse(stored);
  }

  static addTicketComment(id: string, text: string, author: string): void {
    const tickets = this.getTickets();
    const idx = tickets.findIndex(t => t.id === id);
    if (idx !== -1) {
      if (!tickets[idx].comments) tickets[idx].comments = [];
      tickets[idx].comments.push({
        author,
        text,
        timestamp: new Date().toISOString()
      });
      localStorage.setItem(STORAGE_KEYS.TICKETS, JSON.stringify(tickets));
      this.logActivity("Support", `Added internal note to ticket ${id}`, "info", author);
    }
  }

  static updateTicket(id: string, updatedFields: any): void {
    const tickets = this.getTickets();
    const idx = tickets.findIndex(t => t.id === id);
    const currentUser = this.getCurrentUser();
    const actor = currentUser ? currentUser.name : "System";

    if (idx !== -1) {
      tickets[idx] = { ...tickets[idx], ...updatedFields };
      localStorage.setItem(STORAGE_KEYS.TICKETS, JSON.stringify(tickets));
      this.logActivity("Support", `Updated ticket ${id} attributes`, "info", actor);
    }
  }

  /* =========================================================================
     SYSTEM SETTINGS
     ========================================================================= */

  static getSettings(): any {
    if (typeof window === "undefined") return DEFAULT_SETTINGS;
    const stored = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!stored) {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
      return DEFAULT_SETTINGS;
    }
    return JSON.parse(stored);
  }

  static updateSettings(updated: any): void {
    const settings = this.getSettings();
    const merged = { ...settings, ...updated };
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(merged));
      const currentUser = this.getCurrentUser();
      const actor = currentUser ? currentUser.name : "System";
      this.logActivity("Settings", "Updated global system configurations", "security", actor);
    }
  }

  /* =========================================================================
     ACTIVITY LOGS (Production: supabase.from('activity_logs').*)
     ========================================================================= */

  static getActivityLogs(): ActivityLog[] {
    if (typeof window === "undefined") return [];
    const stored = localStorage.getItem(STORAGE_KEYS.ACTIVITY_LOGS);
    return stored ? JSON.parse(stored) : [];
  }

  static logActivity(category: string, message: string, type: ActivityLog['type'] = "info", user?: string): void {
    if (typeof window === "undefined") return;
    
    const newLog: ActivityLog = {
      id: `log-${Math.random().toString(36).substr(2, 9)}`,
      action: category,
      details: user ? `[${user}] ${message}` : message,
      timestamp: new Date().toISOString(),
      type
    };

    const logs = this.getActivityLogs();
    logs.unshift(newLog);
    if (logs.length > 200) logs.pop();
    
    localStorage.setItem(STORAGE_KEYS.ACTIVITY_LOGS, JSON.stringify(logs));
  }
}
