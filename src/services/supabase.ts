import { Order, Transaction, ShippingAddress, RefundRequest, ActivityLog, CustomerDetails, Product } from "../types";
import { authenticatedFetch } from "../lib/api-client";

// Simulated Database Keys
const STORAGE_KEYS = {
  ORDERS: "solcart_db_orders",
  TRANSACTIONS: "solcart_db_transactions",
  PRODUCTS: "solcart_db_products",
  ADDRESSES: "solcart_db_addresses",
  REFUNDS: "solcart_db_refunds",
  ACTIVITY_LOGS: "solcart_db_activity_logs",
  CURRENT_USER: "solcart_current_user",
  STAFF: "solcart_db_staff",
  SUPPLIERS: "solcart_db_suppliers",
  TICKETS: "solcart_db_tickets",
  SETTINGS: "solcart_db_settings"
};

// Initial Database Seeds
const MOCK_ADDRESSES: ShippingAddress[] = [];

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
  supportedCryptos: ["SOL", "USDC"],
  defaultSolWallet: "So11111111111111111111111111111111111111112",
  rpcProvider: "Helius Mainnet Beta",
  emailAlerts: false,
  maintenanceMode: false,
  taxRate: 5,
  shippingFeeUSD: 5.00,
  freeShippingThresholdUSD: 100.00,
  featureFlags: { autoSwap: true, mockFulfillment: true, analyticsDashboard: true }
};

const MOCK_ORDERS: Order[] = [];

const MOCK_TRANSACTIONS: Transaction[] = [];

const MOCK_REFUNDS: RefundRequest[] = [];

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
        id: isAdmin ? "usr-admin-777" : `usr-${emailLower.replace(/[^a-z0-9]/g, '-')}`,
        email: emailLower,
        name: isAdmin ? "SOLCart Admin" : emailLower.split('@')[0],
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
      if (user) {
        this.logActivity("Auth", `User signed out: ${user.email}`, "info", user.name);
      }
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
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
      const res = await authenticatedFetch("/api/db");
      if (res.ok) {
        const result = await res.json();
        if (result.success && result.data) {
          if (result.data.orders) {
            localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(result.data.orders));
          }
          if (result.data.transactions) {
            localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(result.data.transactions));
          }
          if (result.data.products) {
            localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(result.data.products));
          }
          if (result.data.settings) {
            localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(result.data.settings));
          }
          if (result.data.users) {
            const staffList = result.data.users.filter((u: any) => u.role !== 'customer');
            localStorage.setItem(STORAGE_KEYS.STAFF, JSON.stringify(staffList));
            localStorage.setItem("solcart_all_users", JSON.stringify(result.data.users));
          }
          if (result.data.tickets) {
            localStorage.setItem(STORAGE_KEYS.TICKETS, JSON.stringify(result.data.tickets));
          }
          if (result.data.activityLogs) {
            localStorage.setItem(STORAGE_KEYS.ACTIVITY_LOGS, JSON.stringify(result.data.activityLogs));
          }
          window.dispatchEvent(new Event("solcart-db-synced"));
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
    authenticatedFetch("/api/db", {
      method: "POST",
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

      authenticatedFetch("/api/db", {
        method: "POST",
        body: JSON.stringify({
          action: "updateOrderStatus",
          payload: { orderId, status, details }
        })
      }).catch(() => {});

      this.logActivity("Orders", `Order ${orderId} status updated from ${oldStatus} to ${status}`, "info", actor);
    }
  }


  static getProducts(): Product[] {
    if (typeof window === "undefined") return [];
    this.syncWithServer();
    const stored = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    try {
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
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

    // Post to central server DB API
    authenticatedFetch("/api/db", {
      method: "POST",
      body: JSON.stringify({
        action: "createTransaction",
        payload: newTx
      })
    }).catch(() => {});

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
    const currentUser = this.getCurrentUser();
    if (!currentUser) return [];

    const stored = localStorage.getItem(STORAGE_KEYS.ADDRESSES);
    let allAddresses: ShippingAddress[] = [];
    if (stored) {
      allAddresses = JSON.parse(stored);
    }
    return allAddresses.filter((a) => a.userId === currentUser.id);
  }

  static addAddress(address: Omit<ShippingAddress, "id">): ShippingAddress {
    const currentUser = this.getCurrentUser();
    if (!currentUser) throw new Error("Not logged in");

    const stored = localStorage.getItem(STORAGE_KEYS.ADDRESSES);
    const allAddresses: ShippingAddress[] = stored ? JSON.parse(stored) : [];
    const userAddresses = allAddresses.filter((a) => a.userId === currentUser.id);

    const newAddr: ShippingAddress = {
      ...address,
      id: `addr-${Math.random().toString(36).substr(2, 9)}`,
      userId: currentUser.id,
      isDefault: userAddresses.length === 0 ? true : address.isDefault
    };

    if (newAddr.isDefault) {
      allAddresses.forEach(a => {
        if (a.userId === currentUser.id) a.isDefault = false;
      });
    }

    allAddresses.push(newAddr);
    localStorage.setItem(STORAGE_KEYS.ADDRESSES, JSON.stringify(allAddresses));
    return newAddr;
  }

  static updateAddress(id: string, updated: Partial<ShippingAddress>): void {
    const currentUser = this.getCurrentUser();
    if (!currentUser) return;

    const stored = localStorage.getItem(STORAGE_KEYS.ADDRESSES);
    const allAddresses: ShippingAddress[] = stored ? JSON.parse(stored) : [];
    const index = allAddresses.findIndex(a => a.id === id && a.userId === currentUser.id);
    
    if (index !== -1) {
      if (updated.isDefault) {
        allAddresses.forEach(a => {
          if (a.userId === currentUser.id) a.isDefault = false;
        });
      }
      allAddresses[index] = { ...allAddresses[index], ...updated };
      localStorage.setItem(STORAGE_KEYS.ADDRESSES, JSON.stringify(allAddresses));
    }
  }

  static deleteAddress(id: string): void {
    const currentUser = this.getCurrentUser();
    if (!currentUser) return;

    const stored = localStorage.getItem(STORAGE_KEYS.ADDRESSES);
    let allAddresses: ShippingAddress[] = stored ? JSON.parse(stored) : [];
    
    const deletedWasDefault = allAddresses.find(a => a.id === id && a.userId === currentUser.id)?.isDefault;
    allAddresses = allAddresses.filter(a => !(a.id === id && a.userId === currentUser.id));
    
    if (deletedWasDefault) {
      const remaining = allAddresses.filter(a => a.userId === currentUser.id);
      if (remaining.length > 0) {
        remaining[0].isDefault = true;
      }
    }
    
    localStorage.setItem(STORAGE_KEYS.ADDRESSES, JSON.stringify(allAddresses));
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

  static async updateStaff(id: string, updatedFields: any): Promise<void> {
    const currentUser = this.getCurrentUser();
    const actor = currentUser ? currentUser.name : "System";
    try {
      const staff = this.getStaff();
      const member = staff.find(s => s.id === id);
      if (member) {
        await authenticatedFetch("/api/db", {
          method: "POST",
          body: JSON.stringify({
            action: "updateUser",
            payload: { email: member.email, updates: updatedFields }
          })
        });
        this.logActivity("Staff", `Updated permissions/role for staff member ${member.name}`, "security", actor);
      }
    } catch (e) {
      console.error("Failed to update staff:", e);
    }
  }

  static async addStaff(newMember: any): Promise<void> {
    const currentUser = this.getCurrentUser();
    const actor = currentUser ? currentUser.name : "System";
    const passwordHash = "****118e"; // SHA-256 of 'solcart123'
    const newUser = {
      id: `staff-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      email: newMember.email.toLowerCase().trim(),
      name: newMember.name,
      passwordHash,
      role: newMember.role,
      isVerified: true,
      createdAt: new Date().toISOString()
    };
    try {
      await authenticatedFetch("/api/db", {
        method: "POST",
        body: JSON.stringify({ action: "createUser", payload: newUser })
      });
      this.logActivity("Staff", `Added new staff member: ${newMember.name} as ${newMember.role}`, "security", actor);
    } catch (e) {
      console.error("Failed to add staff:", e);
    }
  }

  static async removeStaff(id: string): Promise<void> {
    const currentUser = this.getCurrentUser();
    const actor = currentUser ? currentUser.name : "System";
    try {
      await authenticatedFetch("/api/db", {
        method: "POST",
        body: JSON.stringify({
          action: "deleteUser",
          payload: { id }
        })
      });
      this.logActivity("Staff", `Removed staff member: ${id}`, "security", actor);
    } catch (e) {
      console.error("Failed to remove staff:", e);
    }
  }

  /* =========================================================================
     INVENTORY & SUPPLIERS
     ========================================================================= */

  static getSuppliers(): any[] {
    if (typeof window === "undefined") return [];
    
    const orders = this.getOrders();
    const products = this.getProducts();
    const refunds = this.getRefundRequests();

    const baseSuppliers = [
      { id: "amazon", name: "Amazon Fulfillment Center", status: "Active" },
      { id: "nike", name: "Nike Logistics Direct", status: "Active" },
      { id: "apple", name: "Apple Store Wholesale", status: "Active" },
      { id: "walmart", name: "Walmart Distribution Network", status: "Active" },
      { id: "target", name: "Target Distribution", status: "Active" }
    ];

    const storedStatus = localStorage.getItem("solcart_supplier_statuses");
    const statuses: Record<string, string> = storedStatus ? JSON.parse(storedStatus) : {};

    return baseSuppliers.map(sup => {
      const currentStatus = statuses[sup.id] || sup.status;
      const supOrders = orders.filter(o => o.retailerId === sup.id);
      const supProducts = products.filter(p => p.retailerId === sup.id);
      const supRefunds = refunds.filter(r => {
        const order = orders.find(o => o.id === r.orderId);
        return order && order.retailerId === sup.id;
      });

      const revenueUSD = supOrders.reduce((sum, o) => sum + o.retailPriceUSD, 0);
      const failureRate = supOrders.length > 0 ? (supRefunds.length / supOrders.length) * 100 : 0;
      
      let healthStatus = "Excellent";
      if (failureRate > 5) healthStatus = "Warning";
      if (failureRate > 15) healthStatus = "Critical";

      return {
        id: sup.id,
        name: sup.name,
        status: currentStatus,
        productsCount: supProducts.length,
        ordersCount: supOrders.length,
        avgDeliveryDays: supOrders.filter(o => o.status === "delivered").length > 0 ? 2.4 : 0.0,
        failureRate: parseFloat(failureRate.toFixed(1)),
        revenueUSD: parseFloat(revenueUSD.toFixed(2)),
        healthStatus
      };
    });
  }

  static updateSupplierStatus(id: string, status: string): void {
    const storedStatus = localStorage.getItem("solcart_supplier_statuses");
    const statuses: Record<string, string> = storedStatus ? JSON.parse(storedStatus) : {};
    statuses[id] = status;
    localStorage.setItem("solcart_supplier_statuses", JSON.stringify(statuses));
    
    const currentUser = this.getCurrentUser();
    const actor = currentUser ? currentUser.name : "System";
    const suppliers = this.getSuppliers();
    const sup = suppliers.find(s => s.id === id);
    if (sup) {
      this.logActivity("Inventory", `Supplier ${sup.name} status changed to ${status}`, "info", actor);
    }
  }

  /* =========================================================================
     SUPPORT TICKETS
     ========================================================================= */

  static getTickets(): any[] {
    if (typeof window === "undefined") return [];
    const stored = localStorage.getItem(STORAGE_KEYS.TICKETS);
    if (!stored) {
      return [];
    }
    return JSON.parse(stored);
  }

  static async addTicketComment(id: string, text: string, author: string): Promise<void> {
    try {
      await authenticatedFetch("/api/db", {
        method: "POST",
        body: JSON.stringify({
          action: "addTicketComment",
          payload: { ticketId: id, comment: text }
        })
      });
      this.logActivity("Support", `Added internal note and emailed reply to ticket ${id}`, "info", author);
    } catch (e) {
      console.error("Failed to add ticket comment:", e);
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
      
      // Post to central server DB API
      authenticatedFetch("/api/db", {
        method: "POST",
        body: JSON.stringify({
          action: "updateSettings",
          payload: merged
        })
      }).catch(() => {});

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
    const currentUser = this.getCurrentUser();
    const stored = localStorage.getItem(STORAGE_KEYS.ACTIVITY_LOGS);
    const allLogs: ActivityLog[] = stored ? JSON.parse(stored) : [];

    if (currentUser && currentUser.role === "customer") {
      return allLogs.filter((log) => log.userId === currentUser.id);
    }
    return allLogs;
  }

  static logActivity(category: string, message: string, type: ActivityLog['type'] = "info", user?: string): void {
    if (typeof window === "undefined") return;
    const currentUser = this.getCurrentUser();
    
    const newLog: ActivityLog = {
      id: `log-${Math.random().toString(36).substr(2, 9)}`,
      action: category,
      details: user ? `[${user}] ${message}` : message,
      timestamp: new Date().toISOString(),
      type,
      userId: currentUser ? currentUser.id : undefined
    };

    const stored = localStorage.getItem(STORAGE_KEYS.ACTIVITY_LOGS);
    const logs: ActivityLog[] = stored ? JSON.parse(stored) : [];
    logs.unshift(newLog);
    if (logs.length > 200) logs.pop();
    
    localStorage.setItem(STORAGE_KEYS.ACTIVITY_LOGS, JSON.stringify(logs));
  }

  static getAllUsers(): any[] {
    if (typeof window === "undefined") return [];
    const stored = localStorage.getItem("solcart_all_users");
    if (!stored) return [];
    try {
      return JSON.parse(stored);
    } catch {
      return [];
    }
  }

  static async deleteUser(id: string): Promise<void> {
    try {
      await authenticatedFetch("/api/db", {
        method: "POST",
        body: JSON.stringify({
          action: "deleteUser",
          payload: { id }
        })
      });
      // also remove from staff local caching
      const staff = this.getStaff();
      const filteredStaff = staff.filter(s => s.id !== id);
      localStorage.setItem(STORAGE_KEYS.STAFF, JSON.stringify(filteredStaff));
      
      const all = this.getAllUsers();
      const filteredAll = all.filter(u => u.id !== id);
      localStorage.setItem("solcart_all_users", JSON.stringify(filteredAll));
    } catch (e) {
      console.error("Failed to delete user:", e);
    }
  }
}
