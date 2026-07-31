"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  TrendingUp, 
  ShoppingBag, 
  Users, 
  Coins, 
  Settings, 
  Tag, 
  ArrowUpRight, 
  FileText, 
  Activity,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  Truck,
  RotateCcw,
  AlertTriangle,
  Cpu,
  Layers,
  ShieldAlert,
  HelpCircle,
  Bell,
  Search,
  ChevronDown,
  LayoutDashboard,
  CheckCircle,
  XCircle,
  Eye,
  Lock,
  Download,
  Info,
  LogOut
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { RetailerService } from "../../services/retailers";
import { SupabaseService } from "../../services/supabase";
import { APP_VERSION } from "../../lib/version";

import { Order, Transaction, Product, RetailerConfig, RefundRequest, ActivityLog } from "../../types";
import { Connection, PublicKey, Transaction as SolanaTx, TransactionInstruction, SystemProgram } from "@solana/web3.js";

// Recharts imports for beautiful business analytics
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  Legend, 
  Cell, 
  PieChart, 
  Pie 
} from "recharts";

// Predefined mock data for charts
const REVENUE_TREND_DATA = [
  { date: "Jul 12", SOL: 12.4, USDC: 950 },
  { date: "Jul 13", SOL: 18.2, USDC: 1420 },
  { date: "Jul 14", SOL: 15.6, USDC: 1210 },
  { date: "Jul 15", SOL: 24.8, USDC: 1890 },
  { date: "Jul 16", SOL: 32.1, USDC: 2510 },
  { date: "Jul 17", SOL: 29.5, USDC: 2280 },
  { date: "Jul 18", SOL: 38.6, USDC: 3100 }
];

const CATEGORY_SALES_DATA = [
  { name: "Electronics", value: 4500, color: "#8b5cf6" },
  { name: "Active Apparel", value: 2800, color: "#ec4899" },
  { name: "Computers", value: 5200, color: "#3b82f6" },
  { name: "Household", value: 1200, color: "#10b981" }
];

const RETAILER_SALES_DATA = [
  { name: "Amazon", sales: 8200 },
  { name: "Apple", sales: 14500 },
  { name: "Nike", sales: 5400 },
  { name: "Walmart", sales: 1200 }
];

const CUSTOMER_GROWTH_DATA = [
  { date: "Jul 12", total: 45 },
  { date: "Jul 13", total: 48 },
  { date: "Jul 14", total: 52 },
  { date: "Jul 15", total: 58 },
  { date: "Jul 16", total: 64 },
  { date: "Jul 17", total: 72 },
  { date: "Jul 18", total: 81 }
];

export default function AdminDashboard() {
  const { user, login, logout, hasPermission, bypassLoginForTesting } = useAuth();

  // Dynamic Chart Data Helpers
  const getRevenueTrendData = () => {
    if (orders.length === 0) {
      return [{ date: new Date().toLocaleDateString('en-US', {month: 'short', day: 'numeric'}), SOL: 0, USDC: 0 }];
    }
    const grouped: Record<string, { date: string; SOL: number; USDC: number }> = {};
    orders.forEach(o => {
      const d = new Date(o.timestamp);
      const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      if (!grouped[dateStr]) {
        grouped[dateStr] = { date: dateStr, SOL: 0, USDC: 0 };
      }
      grouped[dateStr].SOL += o.paidSOL;
      grouped[dateStr].USDC += o.receivedUSDC;
    });
    return Object.values(grouped).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  const getCategorySalesData = () => {
    if (orders.length === 0) {
      return [{ name: "No Sales", value: 0, color: "#8b5cf6" }];
    }
    const counts: Record<string, number> = {};
    orders.forEach(o => {
      o.items.forEach(it => {
        const category = it.brand || "Retail";
        counts[category] = (counts[category] || 0) + (it.marketplacePriceUSD * it.quantity);
      });
    });
    const colors = ["#8b5cf6", "#ec4899", "#3b82f6", "#10b981", "#f59e0b", "#ef4444"];
    return Object.entries(counts).map(([name, value], idx) => ({
      name,
      value,
      color: colors[idx % colors.length]
    }));
  };

  const getRetailerSalesData = () => {
    if (orders.length === 0) {
      return [{ name: "No Sales", sales: 0 }];
    }
    const counts: Record<string, number> = {};
    orders.forEach(o => {
      const ret = o.retailerId || "Other";
      const name = ret.charAt(0).toUpperCase() + ret.slice(1);
      counts[name] = (counts[name] || 0) + o.retailPriceUSD;
    });
    return Object.entries(counts).map(([name, sales]) => ({ name, sales }));
  };

  const getCustomerGrowthData = () => {
    if (orders.length === 0) {
      return [{ date: new Date().toLocaleDateString('en-US', {month: 'short', day: 'numeric'}), total: 0 }];
    }
    const grouped: Record<string, Set<string>> = {};
    orders.forEach(o => {
      const d = new Date(o.timestamp);
      const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      if (!grouped[dateStr]) {
        grouped[dateStr] = new Set();
      }
      grouped[dateStr].add(o.walletAddress.toLowerCase());
    });
    let cumulative = 0;
    const dates = Object.keys(grouped).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
    return dates.map(d => {
      cumulative += grouped[d].size;
      return { date: d, total: cumulative };
    });
  };

  // Active Sidebar module Tab
  const [activeTab, setActiveTab] = useState<string>("overview");

  // Database States
  const [orders, setOrders] = useState<Order[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [retailers, setRetailers] = useState<RetailerConfig[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [refunds, setRefunds] = useState<RefundRequest[]>([]);
  const [staff, setStaff] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>({});
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [editingStockProductId, setEditingStockProductId] = useState<string | null>(null);
  const [notifications, setNotifications] = useState([
    { id: 1, title: "Failed Swaps Alert", text: "Route aggregator returned high-slippage warning.", type: "error" },
    { id: 2, title: "Fulfillment Delay", text: "Brand inventory dispatch tracking is pending.", type: "warning" }
  ]);

  // Detailed Modal/Drawer state
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<any | null>(null);
  const [newNote, setNewNote] = useState("");
  const [newTicketNote, setNewTicketNote] = useState("");
  const [assignedStaffName, setAssignedStaffName] = useState("");

  // Filters state
  const [searchQuery, setSearchQuery] = useState("");
  const [orderStatusFilter, setOrderStatusFilter] = useState("all");
  const [selectedCustomerFilter, setSelectedCustomerFilter] = useState("all");
  const [dateFilterRange, setDateFilterRange] = useState("last30");

  // Editing States
  const [editingRetailerId, setEditingRetailerId] = useState<string | null>(null);
  const [editingMarkup, setEditingMarkup] = useState<number>(10);
  const [newTrackingNum, setNewTrackingNum] = useState("");
  const [newCarrier, setNewCarrier] = useState("");

  // Add/Edit Product form state
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [newProdName, setNewProdName] = useState("");
  const [newProdBrand, setNewProdBrand] = useState("");
  const [newProdCategory, setNewProdCategory] = useState("Electronics");
  const [newProdRetailPrice, setNewProdRetailPrice] = useState("");
  const [newProdRetailer, setNewProdRetailer] = useState("amazon");
  const [newProdStock, setNewProdStock] = useState("50");
  const [newProdImage, setNewProdImage] = useState("");
  const [newProdDesc, setNewProdDesc] = useState("");
  const [editingStock, setEditingStock] = useState<Record<string, string>>({});
  const [giftCardCodeInput, setGiftCardCodeInput] = useState("");
  const [editingCustomerName, setEditingCustomerName] = useState("");
  const [isEditingCustomer, setIsEditingCustomer] = useState(false);

  // Admin Login States
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setLoginLoading(true);
    try {
      const res = await login(adminEmail, adminPassword);
      if (!res.success) {
        setLoginError(res.error || "Invalid administrator credentials.");
      }
    } catch (e: any) {
      setLoginError(e.message || "Failed to log in.");
    } finally {
      setLoginLoading(false);
    }
  };

  const isStaff = user && user.role !== "customer";

  // Add Staff form state
  const [showStaffForm, setShowStaffForm] = useState(false);
  const [newStaffName, setNewStaffName] = useState("");
  const [newStaffEmail, setNewStaffEmail] = useState("");
  const [newStaffRole, setNewStaffRole] = useState("Customer Support");

  // Notifications Bell dropdown
  const [showNotifications, setShowNotifications] = useState(false);

  // Sync admin database logs on load/changes
  const refreshAllData = async () => {
    setDataLoading(true);
    try {
      await Promise.all([
        RetailerService.syncWithServer(),
        SupabaseService.syncWithServer()
      ]);
    } catch (e) {
      console.warn("Admin server sync skipped", e);
    }
    setOrders(SupabaseService.getOrders());
    setTransactions(SupabaseService.getTransactions());
    setRetailers(RetailerService.getRetailers());
    setProducts(RetailerService.getProducts());
    setRefunds(SupabaseService.getRefundRequests());
    setStaff(SupabaseService.getStaff());
    setSuppliers(SupabaseService.getSuppliers());
    setTickets(SupabaseService.getTickets());
    setSettings(SupabaseService.getSettings());
    setLogs(SupabaseService.getActivityLogs());
    setDataLoading(false);
  };

  useEffect(() => {
    refreshAllData();
  }, [editingRetailerId, showProductForm, showStaffForm]);

  // Handle Developer Role Switching
  const handleRoleSwitch = async (roleEmail: string) => {
    await bypassLoginForTesting(roleEmail);
    refreshAllData();
  };

  // Helper colors for status badges
  const getStatusBadge = (status: string | undefined | null) => {
    if (!status) return 'bg-brand-border/10 text-brand-text-muted border border-brand-border/20';
    switch (status.toLowerCase()) {
      case 'paid':
      case 'active':
      case 'success':
      case 'resolved':
      case 'good':
      case 'excellent':
        return 'bg-brand-green/10 text-brand-green border border-brand-green/20';
      case 'shipped':
      case 'processing':
      case 'approved':
        return 'bg-blue-500/10 text-blue-400 border border-blue-500/20';
      case 'delivered':
      case 'completed':
        return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
      case 'pending':
      case 'waiting':
      case 'warning':
        return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
      case 'refunded':
      case 'cancelled':
      case 'rejected':
      case 'disabled':
      case 'failed':
      case 'critical':
        return 'bg-red-500/10 text-red-400 border border-red-500/20';
      default:
        return 'bg-brand-card text-brand-text-muted border border-brand-border/60';
    }
  };

  // CSV Exporter Helper
  const downloadCSV = (filename: string, rows: any[][]) => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + rows.map(e => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Log audit log
    SupabaseService.logActivity("Reports", `Downloaded financial report: ${filename}`, "info", user?.name);
    setLogs(SupabaseService.getActivityLogs());
  };

  // Generate Reports
  const exportRevenueReport = () => {
    const rows = [
      ["Order ID", "Date", "Customer", "Wallet Address", "Retailer", "Retail Cost (USD)", "Marketplace Price (USD)", "SOL Paid", "USDC Swapped", "Fulfillment Status"],
      ...orders.map(o => [o.id, o.timestamp, o.customerDetails.name, o.walletAddress, o.retailerId, o.retailPriceUSD, o.retailPriceUSD, o.paidSOL, o.receivedUSDC, o.status])
    ];
    downloadCSV(`solcart_revenue_report_${new Date().toISOString().slice(0,10)}.csv`, rows);
  };

  const exportAuditLogs = () => {
    const rows = [
      ["Log ID", "Category", "Details", "Timestamp", "Type"],
      ...logs.map(l => [l.id, l.action, l.details, l.timestamp, l.type])
    ];
    downloadCSV(`solcart_audit_logs_${new Date().toISOString().slice(0,10)}.csv`, rows);
  };

  // Calculate Overview Metrics
  const totalSalesUSD = orders.reduce((acc, o) => acc + o.retailPriceUSD, 0);
  const totalUSDC = orders.reduce((acc, o) => acc + o.receivedUSDC, 0);
  const totalSOL = orders.reduce((acc, o) => acc + o.paidSOL, 0);
  const taxRate = settings.taxRate !== undefined ? settings.taxRate : 5;
  const totalFEEUSD = orders.reduce((acc, o) => acc + (o.retailPriceUSD * (taxRate / 100)), 0);

  // Dynamic Time-Based Revenue aggregates
  const todaysRevenueUSD = orders
    .filter(o => {
      const orderDate = new Date(o.timestamp);
      const today = new Date();
      return orderDate.getDate() === today.getDate() &&
             orderDate.getMonth() === today.getMonth() &&
             orderDate.getFullYear() === today.getFullYear();
    })
    .reduce((acc, o) => acc + o.retailPriceUSD, 0);

  const weeklyRevenueUSD = orders
    .filter(o => {
      const orderDate = new Date(o.timestamp);
      const today = new Date();
      const diffTime = Math.abs(today.getTime() - orderDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= 7;
    })
    .reduce((acc, o) => acc + o.retailPriceUSD, 0);
  
  const totalSourcedRetailUSD = orders.reduce((acc, o) => {
    const innerSum = o.items.reduce((ac, it) => ac + (it.retailPriceUSD * it.quantity), 0);
    return acc + innerSum;
  }, 0);
  
  const netProfitUSD = totalSalesUSD - totalSourcedRetailUSD + totalFEEUSD;
  const uniqueBuyersCount = Array.from(new Set(orders.map(o => o.walletAddress.toLowerCase()))).length;

  const pendingOrders = orders.filter(o => o.status === "pending" || o.status === "paid").length;
  const completedOrders = orders.filter(o => o.status === "delivered").length;
  const refundedOrders = orders.filter(o => o.status === "refunded").length;

  const paymentSuccessRate = transactions.length > 0
    ? ((transactions.filter(t => t.status === "success").length / transactions.length) * 100).toFixed(1) + "%"
    : "0.0%";
  const conversionRate = orders.length > 0 ? "100.0%" : "0.0%";
  const failedPayments = transactions.filter(t => t.status === "failed").length;

  // Actions handlers
  const handleUpdateMarkup = (retailerId: string) => {
    if (!hasPermission("retailers", "edit")) return;
    RetailerService.updateRetailerMarkup(retailerId, editingMarkup);
    setEditingRetailerId(null);
    refreshAllData();
  };

  const handleUpdateOrderStatus = (orderId: string, status: Order['status']) => {
    if (!hasPermission("orders", "edit")) return;
    let details: Partial<Order> = {};
    if (status === "shipped") {
      details = {
        trackingNumber: newTrackingNum || `UPS-${Math.floor(1000000000 + Math.random() * 9000000000)}`,
        carrier: newCarrier || "UPS"
      };
    }
    SupabaseService.updateOrderStatus(orderId, status, details);
    
    // Clear tracking fields and update selected order details
    setNewTrackingNum("");
    setNewCarrier("");
    refreshAllData();
    
    // Refresh modal info
    const updated = SupabaseService.getOrderById(orderId);
    if (updated) setSelectedOrder(updated);
  };

  const handleAddInternalNote = (orderId: string) => {
    if (!newNote.trim()) return;
    const actor = user?.name || "Admin Staff";
    SupabaseService.logActivity("Orders", `[Order Note - ${orderId}] ${newNote}`, "info", actor);
    setNewNote("");
    refreshAllData();
  };

  const handleApproveRefund = (refundId: string) => {
    if (!hasPermission("refunds", "edit")) return;
    const refundHash = `mock_refund_tx_${Math.random().toString(36).substr(2, 16)}`;
    SupabaseService.updateRefundRequestStatus(refundId, "approved", refundHash);
    
    const refReq = refunds.find(r => r.id === refundId);
    if (refReq) {
      const orderObj = orders.find(o => o.id === refReq.orderId);
      SupabaseService.createTransaction({
        orderId: refReq.orderId,
        walletAddress: orderObj?.walletAddress || "",
        type: "refund",
        amount: refReq.paidSOL,
        token: "SOL",
        status: "success",
        txHash: refundHash
      });
    }
    refreshAllData();
  };

  const handleRejectRefund = (refundId: string) => {
    if (!hasPermission("refunds", "edit")) return;
    SupabaseService.updateRefundRequestStatus(refundId, "rejected");
    refreshAllData();
  };

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasPermission("products", "edit")) return;
    if (newProdName && newProdBrand && newProdRetailPrice) {
      if (editingProductId) {
        // Edit existing product
        RetailerService.updateProduct(editingProductId, {
          name: newProdName,
          description: newProdDesc || "No description provided",
          brand: newProdBrand,
          image: newProdImage || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop",
          category: newProdCategory,
          retailPrice: parseFloat(newProdRetailPrice),
          specs: { "Retailer Sourced": newProdRetailer },
          retailerId: newProdRetailer,
          stockCount: parseInt(newProdStock) || 50,
        });
      } else {
        // Add new product
        RetailerService.addProduct({
          id: `p-${Math.random().toString(36).substr(2, 9)}`,
          name: newProdName,
          description: newProdDesc || "No description provided",
          brand: newProdBrand,
          image: newProdImage || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop",
          category: newProdCategory,
          rating: 4.5,
          reviewsCount: 1,
          retailPrice: parseFloat(newProdRetailPrice),
          estimatedDelivery: "3-5 business days",
          specs: { "Retailer Sourced": newProdRetailer },
          retailerId: newProdRetailer,
          stockCount: parseInt(newProdStock) || 50,
          isFeatured: false
        });
      }

      // Clear Form
      setNewProdName("");
      setNewProdBrand("");
      setNewProdRetailPrice("");
      setNewProdImage("");
      setNewProdDesc("");
      setNewProdRetailer("amazon");
      setNewProdStock("50");
      setNewProdCategory("Electronics");
      setEditingProductId(null);
      setShowProductForm(false);
      refreshAllData();
    }
  };

  const handleEditProduct = (product: Product) => {
    if (!hasPermission("products", "edit")) return;
    setEditingProductId(product.id);
    setNewProdName(product.name);
    setNewProdBrand(product.brand);
    setNewProdCategory(product.category);
    setNewProdRetailPrice(product.retailPrice.toString());
    setNewProdRetailer(product.retailerId);
    setNewProdStock(product.stockCount.toString());
    setNewProdImage(product.image);
    setNewProdDesc(product.description);
    setShowProductForm(true);
  };

  const handleDeleteProduct = (id: string) => {
    if (!hasPermission("products", "edit")) return;
    RetailerService.deleteProduct(id);
    refreshAllData();
  };

  const handleUpdateStock = async (productId: string, stockVal: string) => {
    if (!hasPermission("products", "edit")) return;
    const stockCount = parseInt(stockVal, 10);
    if (isNaN(stockCount)) return;

    try {
      const res = await fetch("/api/db", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "updateProductStock",
          payload: { productId, stockCount }
        })
      });
      if (res.ok) {
        RetailerService.updateProduct(productId, { stockCount });
        setEditingStock(prev => {
          const next = { ...prev };
          delete next[productId];
          return next;
        });
        refreshAllData();
      }
    } catch (err) {
      console.error("Failed to update stock:", err);
    }
  };

  const handleUpdateCustomerName = async (orderId: string) => {
    if (!hasPermission("orders", "edit")) return;
    if (!editingCustomerName.trim()) return;

    try {
      const res = await fetch("/api/db", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "updateOrderCustomerName",
          payload: { orderId, customerName: editingCustomerName.trim() }
        })
      });
      if (res.ok) {
        // Also update local storage to match
        SupabaseService.updateOrderStatus(orderId, selectedOrder!.status, {
          customerDetails: {
            ...selectedOrder!.customerDetails,
            name: editingCustomerName.trim()
          }
        });
        setSelectedOrder(prev => {
          if (!prev) return null;
          return {
            ...prev,
            customerDetails: {
              ...prev.customerDetails,
              name: editingCustomerName.trim()
            }
          };
        });
        setIsEditingCustomer(false);
        refreshAllData();
      }
    } catch (err) {
      console.error("Failed to update customer name:", err);
    }
  };

  const handleDeliverGiftCardCode = async (orderId: string) => {
    if (!hasPermission("orders", "edit")) return;
    if (!giftCardCodeInput.trim()) return;

    try {
      // 1. Deliver the code inside the db
      const resVal = await fetch("/api/db", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "deliverGiftCardCode",
          payload: { orderId, giftCardCode: giftCardCodeInput.trim() }
        })
      });

      if (resVal.ok) {
        // 2. Mark order as delivered (which means completed gift card assignment)
        await fetch("/api/db", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "updateOrderStatus",
            payload: { orderId, status: "delivered" }
          })
        });

        // 3. Update localStorage
        SupabaseService.updateOrderStatus(orderId, "delivered", {
          giftCardCode: giftCardCodeInput.trim()
        });

        // 4. Send the code via email to customer
        await fetch("/api/email/delivery", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            toEmail: selectedOrder!.customerDetails.email,
            orderId,
            giftCardCode: giftCardCodeInput.trim()
          })
        }).catch(e => console.warn("Failed to dispatch gift card code email", e));

        setSelectedOrder(prev => {
          if (!prev) return null;
          return {
            ...prev,
            status: "delivered",
            giftCardCode: giftCardCodeInput.trim()
          };
        });

        setGiftCardCodeInput("");
        refreshAllData();
      }
    } catch (err) {
      console.error("Failed to deliver gift card code:", err);
    }
  };

  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasPermission("staff", "edit")) return;
    if (newStaffName && newStaffEmail) {
      await SupabaseService.addStaff({
        name: newStaffName,
        email: newStaffEmail,
        role: newStaffRole,
        permissions: newStaffRole === "Super Admin" || newStaffRole === "Owner" ? ["*"] : ["overview", "orders"]
      });
      setNewStaffName("");
      setNewStaffEmail("");
      setShowStaffForm(false);
      await refreshAllData();
    }
  };

  const handleRemoveStaff = async (id: string) => {
    if (!hasPermission("staff", "edit")) return;
    await SupabaseService.removeStaff(id);
    await refreshAllData();
  };

  const handleDeleteCustomer = async (userId: string) => {
    if (!hasPermission("staff", "edit")) return;
    if (!confirm("Are you sure you want to delete this customer record?")) return;
    await SupabaseService.deleteUser(userId);
    await refreshAllData();
  };

  const handleTicketComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTicketNote.trim() || !selectedTicket) return;
    await SupabaseService.addTicketComment(selectedTicket.id, newTicketNote, user?.name || "Agent Support");
    setNewTicketNote("");
    await refreshAllData();
    
    // Refresh detailed ticket modal
    const updated = SupabaseService.getTickets().find(t => t.id === selectedTicket.id);
    if (updated) setSelectedTicket(updated);
  };

  const handleResolveTicket = (ticketId: string) => {
    SupabaseService.updateTicket(ticketId, { status: "resolved" });
    refreshAllData();
    setSelectedTicket(null);
  };

  const uniqueCustomers = Array.from(new Set(orders.map(o => o.customerDetails?.name).filter(Boolean)));

  const getAggregatedCustomers = () => {
    const dbCustomers = SupabaseService.getAllUsers().filter((u: any) => u.role === 'customer');
    
    const customerMap: Record<string, {
      id: string;
      name: string;
      email: string;
      walletAddress: string;
      totalOrders: number;
      totalSpend: number;
      status: string;
    }> = {};

    dbCustomers.forEach((u: any) => {
      const wallet = u.id;
      customerMap[wallet.toLowerCase()] = {
        id: u.id,
        name: u.name || `Wallet ${u.id.substring(0, 6)}`,
        email: u.email || "N/A",
        walletAddress: u.id,
        totalOrders: 0,
        totalSpend: 0,
        status: u.isVerified ? "Verified" : "Registered"
      };
    });

    orders.forEach(o => {
      const walletKey = o.walletAddress.toLowerCase();
      if (!customerMap[walletKey]) {
        customerMap[walletKey] = {
          id: o.walletAddress,
          name: o.customerDetails.name,
          email: o.customerDetails.email,
          walletAddress: o.walletAddress,
          totalOrders: 0,
          totalSpend: 0,
          status: "Unregistered Buyer"
        };
      }
      
      const cust = customerMap[walletKey];
      cust.totalOrders += 1;
      cust.totalSpend += o.retailPriceUSD;
      if (o.customerDetails.name && o.customerDetails.name !== cust.name) {
        cust.name = o.customerDetails.name;
      }
      if (o.customerDetails.email && o.customerDetails.email !== cust.email && !cust.email.includes("@solcart-user.io")) {
        cust.email = o.customerDetails.email;
      }
    });

    return Object.values(customerMap);
  };

  // Filter orders based on query & state
  const filteredOrders = orders.filter(o => {
    const matchesSearch = o.id.includes(searchQuery) || 
      o.customerDetails.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      o.walletAddress.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = orderStatusFilter === "all" || o.status === orderStatusFilter;
    const matchesCustomer = selectedCustomerFilter === "all" || o.customerDetails.name === selectedCustomerFilter;
    return matchesSearch && matchesStatus && matchesCustomer;
  });

  if (!isStaff) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-brand-dark px-4 py-12 sm:px-6 lg:px-8 font-sans">
        <div className="w-full max-w-md space-y-8 glass-panel border border-brand-border/40 p-8 rounded-2xl relative shadow-2xl">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 rounded-xl bg-brand-purple/10 border border-brand-purple/20 flex items-center justify-center text-brand-purple mb-4">
              <Lock className="h-6 w-6" />
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight">SOLCart Admin Portal</h2>
            <p className="text-xs text-brand-text-muted mt-2">
              Access restricted to authorized personnel. Please sign in.
            </p>
          </div>

          {loginError && (
            <div className="p-3.5 bg-red-500/15 border border-red-500/30 rounded-xl text-red-400 text-xs">
              {loginError}
            </div>
          )}

          <form className="mt-8 space-y-6" onSubmit={handleAdminLogin}>
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-brand-text-muted uppercase tracking-wider mb-1.5">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="admin@solcart.io"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  className="w-full h-10 px-3.5 rounded-lg border border-brand-border bg-brand-dark/40 text-xs text-white placeholder-brand-text-muted/40 focus:outline-none focus:border-brand-purple/40"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-brand-text-muted uppercase tracking-wider mb-1.5">Password</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="w-full h-10 px-3.5 rounded-lg border border-brand-border bg-brand-dark/40 text-xs text-white placeholder-brand-text-muted/40 focus:outline-none focus:border-brand-purple/40"
                />
              </div>
            </div>

            <button
               type="submit"
               disabled={loginLoading}
               className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-brand-purple to-indigo-600 font-extrabold text-xs text-white hover:scale-[1.01] shadow-lg shadow-brand-purple/10 flex items-center justify-center gap-2 transition-all disabled:opacity-40"
            >
              {loginLoading ? "Authenticating..." : "Sign In to Operations"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-brand-dark text-white font-sans overflow-hidden">
      
      {/* SIDEBAR NAVIGATION */}
      <aside className="hidden md:flex flex-col w-64 bg-brand-card/90 border-r border-brand-border/60 shrink-0 select-none">
        
        {/* Sidebar Header */}
        <div className="flex items-center justify-between px-6 h-16 border-b border-brand-border/40">
          <div className="flex items-center gap-3">
            <Activity className="h-6 w-6 text-brand-purple" />
            <span className="font-extrabold tracking-widest text-sm bg-gradient-to-r from-brand-purple to-indigo-400 bg-clip-text text-transparent uppercase">SOLCart Ops</span>
          </div>
          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-brand-purple/20 text-brand-purple border border-brand-purple/30">
            {APP_VERSION}
          </span>
        </div>


        {/* Sidebar Navigation Items */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {[
            { id: "overview", label: "Overview", icon: LayoutDashboard },
            { id: "orders", label: "Orders Manager", icon: ShoppingBag },
            { id: "analytics", label: "Sales Analytics", icon: TrendingUp },
            { id: "customers", label: "Customer List", icon: Users },
            { id: "payments", label: "Payments Ledger", icon: Coins },
            { id: "refunds", label: "Returns & Refunds", icon: RotateCcw },
            { id: "products", label: "Product Catalog", icon: Cpu },
            { id: "inventory", label: "Inventory Catalog", icon: Layers },
            { id: "staff", label: "Staff Directory", icon: ShieldAlert },
            { id: "support", label: "Support Desk", icon: HelpCircle },
            { id: "finance", label: "Financial Reports", icon: FileText },
            { id: "logs", label: "Activity Audit Logs", icon: Activity },
            { id: "settings", label: "System Settings", icon: Settings }
          ].map(item => {
            const hasAccess = hasPermission(item.id, "view");
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setSelectedOrder(null);
                  setSelectedTicket(null);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
                  activeTab === item.id 
                    ? 'bg-brand-purple text-white shadow-lg shadow-brand-purple/20' 
                    : 'text-brand-text-muted hover:text-white hover:bg-brand-card'
                } ${!hasAccess ? 'opacity-40 cursor-not-allowed' : ''}`}
              >
                <div className="flex items-center gap-3">
                  <item.icon className="h-4.5 w-4.5" />
                  <span>{item.label}</span>
                </div>
                {!hasAccess && <Lock className="h-3 w-3 text-red-400" />}
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer - Current Profile info */}
        <div className="p-4 border-t border-brand-border/40 bg-brand-dark/20 flex items-center justify-between gap-2 text-xs">
          <div className="min-w-0">
            <p className="text-[10px] font-bold text-brand-text-muted uppercase">Signed in as</p>
            <p className="font-extrabold text-white truncate mt-0.5">{user?.name || "Super Admin"}</p>
            <div className="flex items-center gap-1.5 mt-1 text-[10px] font-semibold text-brand-purple">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-purple animate-pulse"></span>
              <span>{user?.role || "Owner"}</span>
            </div>
          </div>
          <button
            onClick={() => logout()}
            className="p-1.5 text-brand-text-muted hover:text-red-400 hover:bg-red-500/5 rounded-lg transition-all shrink-0"
            title="Log Out Staff Session"
          >
            <LogOut className="h-4.5 w-4.5" />
          </button>
        </div>
      </aside>

      {/* MAIN CONTAINER */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        
        {/* TOP BAR */}
        <header className="h-16 border-b border-brand-border/40 bg-brand-card/30 flex items-center justify-between px-6 shrink-0 z-20">
          
          <div className="flex items-center gap-4 flex-1">
            <span className="md:hidden font-black text-xs text-brand-purple uppercase">SOLCart Ops</span>
            {/* Quick Search */}
            <div className="relative max-w-xs w-full hidden sm:block">
              <input
                type="text"
                placeholder="Global query..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-8 pl-8 pr-3 text-xs bg-brand-dark/40 border border-brand-border/60 rounded-lg text-white placeholder-brand-text-muted focus:outline-none focus:border-brand-purple/50 focus:ring-1 focus:ring-brand-purple/10"
              />
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-brand-text-muted/60" />
            </div>
          </div>

          {/* User Controls / Alerts / Switcher */}
          <div className="flex items-center gap-4 text-xs font-semibold">
            
            {/* Admin Header Controls */}


            {/* Alert Notifications center */}
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-1.5 rounded-lg hover:bg-brand-card/60 text-brand-text-muted hover:text-white transition-colors"
              >
                <Bell className="h-4.5 w-4.5" />
                <span className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full bg-brand-purple"></span>
              </button>
              
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-72 rounded-xl border border-brand-border bg-brand-card p-3 shadow-xl backdrop-blur-lg z-30 space-y-2.5">
                  <div className="flex justify-between items-center border-b border-brand-border/40 pb-1.5">
                    <p className="text-[10px] font-bold text-brand-text-muted uppercase tracking-wider">System Alerts ({notifications.length})</p>
                    {notifications.length > 0 && (
                      <button 
                        onClick={() => setNotifications([])}
                        className="text-[9px] font-bold text-brand-purple hover:underline"
                      >
                        Clear All
                      </button>
                    )}
                  </div>
                  <div className="space-y-2 max-h-56 overflow-y-auto font-sans">
                    {notifications.length === 0 ? (
                      <p className="text-center text-[10px] text-brand-text-muted py-4">No active system alerts.</p>
                    ) : (
                      notifications.map(n => (
                        <div 
                          key={n.id} 
                          className={`p-2 rounded-lg text-[10px] relative group border ${
                            n.type === 'error' ? 'bg-red-500/5 border-red-500/10' : 'bg-amber-500/5 border-amber-500/10'
                          }`}
                        >
                          <button
                            onClick={() => setNotifications(prev => prev.filter(item => item.id !== n.id))}
                            className="absolute top-1.5 right-1.5 p-0.5 rounded hover:bg-brand-border/40 text-brand-text-muted hover:text-white"
                          >
                            <X className="h-3 w-3" />
                          </button>
                          <p className={`font-bold ${n.type === 'error' ? 'text-red-400' : 'text-amber-400'} pr-5`}>
                            {n.title}
                          </p>
                          <p className="text-brand-text-muted mt-0.5 pr-5 leading-normal">{n.text}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

          </div>
        </header>

        {/* MAIN PANEL CONTENT */}
        <main className="p-6 space-y-8 flex-1">
          
          {/* SECURITY ACCESS SHIELD GATEKEEPER */}
          {!hasPermission(activeTab, "view") ? (
            <div className="mx-auto max-w-md px-6 py-20 flex flex-col items-center justify-center text-center bg-brand-card/40 border border-brand-border/60 rounded-3xl backdrop-blur-lg">
              <div className="h-14 w-14 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 mb-6">
                <Lock className="h-7 w-7" />
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight">Access Locked</h2>
              <p className="text-xs text-brand-text-muted mt-3 mb-8 leading-relaxed max-w-sm">
                Your employee profile ({user?.role}) does not carry sufficient permissions to access the **{activeTab.toUpperCase()}** administrative panel.
              </p>
              <div className="text-xs bg-brand-dark border border-brand-border/60 px-4 py-2.5 rounded-xl font-mono text-left max-w-xs">
                <p className="font-bold text-brand-purple uppercase tracking-wider text-[10px]">Required Scope:</p>
                <p className="text-white mt-1">scope:admin:{activeTab}</p>
                <p className="text-red-400 mt-0.5 font-bold">status: ACCESS_DENIED (403)</p>
              </div>
            </div>
          ) : (
            
            // OTHERWISE SHOW THE CORRESPONDING TAB PANEL
            <div className="w-full space-y-8 animate-fade-in-slow">
              
              {/* ===================================================================
                  PANEL: OVERVIEW
                  =================================================================== */}
              {activeTab === "overview" && (
                <div className="space-y-8">
                  
                  {/* Title */}
                  <div>
                    <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
                      <LayoutDashboard className="h-6 w-6 text-brand-purple" />
                      Operations Dashboard
                    </h1>
                    <p className="text-xs text-brand-text-muted mt-1">Operational status, live profit calculations, and network node volumes.</p>
                  </div>

                  {/* 20 KPI cards (split grid) */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    
                    {/* Financial Metrics */}
                    <div className="glass-panel p-4 rounded-xl border border-brand-border/40 flex flex-col justify-between">
                      <span className="text-[10px] font-bold text-brand-text-muted uppercase">Today's Revenue</span>
                      {dataLoading ? (
                        <div className="h-6 w-20 bg-brand-border/40 animate-pulse rounded mt-1.5"></div>
                      ) : (
                        <p className="text-lg sm:text-2xl font-black text-white mt-1.5">${todaysRevenueUSD.toFixed(2)}</p>
                      )}
                    </div>
                    <div className="glass-panel p-4 rounded-xl border border-brand-border/40 flex flex-col justify-between">
                      <span className="text-[10px] font-bold text-brand-text-muted uppercase">Weekly Revenue</span>
                      {dataLoading ? (
                        <div className="h-6 w-20 bg-brand-border/40 animate-pulse rounded mt-1.5"></div>
                      ) : (
                        <p className="text-lg sm:text-2xl font-black text-white mt-1.5">${weeklyRevenueUSD.toFixed(2)}</p>
                      )}
                    </div>
                    <div className="glass-panel p-4 rounded-xl border border-brand-border/40 flex flex-col justify-between">
                      <span className="text-[10px] font-bold text-brand-text-muted uppercase">Total Revenue</span>
                      {dataLoading ? (
                        <div className="h-6 w-20 bg-brand-border/40 animate-pulse rounded mt-1.5"></div>
                      ) : (
                        <p className="text-lg sm:text-2xl font-black text-white mt-1.5">${totalSalesUSD.toFixed(2)}</p>
                      )}
                    </div>
                    <div className="glass-panel p-4 rounded-xl border border-brand-border/40 flex flex-col justify-between">
                      <span className="text-[10px] font-bold text-brand-text-muted uppercase">Net profit</span>
                      {dataLoading ? (
                        <div className="h-6 w-20 bg-brand-border/40 animate-pulse rounded mt-1.5"></div>
                      ) : (
                        <p className="text-lg sm:text-2xl font-black text-brand-green mt-1.5">${netProfitUSD.toFixed(2)}</p>
                      )}
                    </div>

                    {/* Order Metrics */}
                    <div className="glass-panel p-4 rounded-xl border border-brand-border/40 flex flex-col justify-between">
                      <span className="text-[10px] font-bold text-brand-text-muted uppercase">Total Orders</span>
                      {dataLoading ? (
                        <div className="h-6 w-12 bg-brand-border/40 animate-pulse rounded mt-1.5"></div>
                      ) : (
                        <p className="text-lg sm:text-2xl font-black text-white mt-1.5">{orders.length}</p>
                      )}
                    </div>
                    <div className="glass-panel p-4 rounded-xl border border-brand-border/40 flex flex-col justify-between">
                      <span className="text-[10px] font-bold text-brand-text-muted uppercase">Pending orders</span>
                      {dataLoading ? (
                        <div className="h-6 w-12 bg-brand-border/40 animate-pulse rounded mt-1.5"></div>
                      ) : (
                        <p className="text-lg sm:text-2xl font-black text-amber-400 mt-1.5">{pendingOrders}</p>
                      )}
                    </div>
                    <div className="glass-panel p-4 rounded-xl border border-brand-border/40 flex flex-col justify-between">
                      <span className="text-[10px] font-bold text-brand-text-muted uppercase">Completed orders</span>
                      {dataLoading ? (
                        <div className="h-6 w-12 bg-brand-border/40 animate-pulse rounded mt-1.5"></div>
                      ) : (
                        <p className="text-lg sm:text-2xl font-black text-brand-green mt-1.5">{completedOrders}</p>
                      )}
                    </div>
                    <div className="glass-panel p-4 rounded-xl border border-brand-border/40 flex flex-col justify-between">
                      <span className="text-[10px] font-bold text-brand-text-muted uppercase">Refunded orders</span>
                      {dataLoading ? (
                        <div className="h-6 w-12 bg-brand-border/40 animate-pulse rounded mt-1.5"></div>
                      ) : (
                        <p className="text-lg sm:text-2xl font-black text-red-400 mt-1.5">{refundedOrders}</p>
                      )}
                    </div>

                    {/* Crypto & Swap Metrics */}
                    <div className="glass-panel p-4 rounded-xl border border-brand-border/40 flex flex-col justify-between">
                      <span className="text-[10px] font-bold text-brand-text-muted uppercase">SOL Volume Paid</span>
                      {dataLoading ? (
                        <div className="h-6 w-20 bg-brand-border/40 animate-pulse rounded mt-1.5"></div>
                      ) : (
                        <p className="text-lg sm:text-2xl font-black text-white mt-1.5">{totalSOL.toFixed(2)} SOL</p>
                      )}
                    </div>
                    <div className="glass-panel p-4 rounded-xl border border-brand-border/40 flex flex-col justify-between">
                      <span className="text-[10px] font-bold text-brand-text-muted uppercase">USDC Converted</span>
                      {dataLoading ? (
                        <div className="h-6 w-20 bg-brand-border/40 animate-pulse rounded mt-1.5"></div>
                      ) : (
                        <p className="text-lg sm:text-2xl font-black text-white mt-1.5">${totalUSDC.toFixed(2)}</p>
                      )}
                    </div>
                    <div className="glass-panel p-4 rounded-xl border border-brand-border/40 flex flex-col justify-between">
                      <span className="text-[10px] font-bold text-brand-text-muted uppercase">Marketplace fees</span>
                      {dataLoading ? (
                        <div className="h-6 w-20 bg-brand-border/40 animate-pulse rounded mt-1.5"></div>
                      ) : (
                        <p className="text-lg sm:text-2xl font-black text-brand-green mt-1.5">${totalFEEUSD.toFixed(2)}</p>
                      )}
                    </div>
                    <div className="glass-panel p-4 rounded-xl border border-brand-border/40 flex flex-col justify-between">
                      <span className="text-[10px] font-bold text-brand-text-muted uppercase">Failed payments</span>
                      {dataLoading ? (
                        <div className="h-6 w-12 bg-brand-border/40 animate-pulse rounded mt-1.5"></div>
                      ) : (
                        <p className="text-lg sm:text-2xl font-black text-red-400 mt-1.5">{failedPayments}</p>
                      )}
                    </div>

                    {/* Customers & Health */}
                    <div className="glass-panel p-4 rounded-xl border border-brand-border/40 flex flex-col justify-between">
                      <span className="text-[10px] font-bold text-brand-text-muted uppercase">Active Customers</span>
                      {dataLoading ? (
                        <div className="h-6 w-12 bg-brand-border/40 animate-pulse rounded mt-1.5"></div>
                      ) : (
                        <p className="text-lg sm:text-2xl font-black text-white mt-1.5">{uniqueBuyersCount}</p>
                      )}
                    </div>
                    <div className="glass-panel p-4 rounded-xl border border-brand-border/40 flex flex-col justify-between">
                      <span className="text-[10px] font-bold text-brand-text-muted uppercase">AOV (Avg Basket)</span>
                      {dataLoading ? (
                        <div className="h-6 w-16 bg-brand-border/40 animate-pulse rounded mt-1.5"></div>
                      ) : (
                        <p className="text-lg sm:text-2xl font-black text-white mt-1.5">${orders.length > 0 ? (totalSalesUSD / orders.length).toFixed(2) : "0"}</p>
                      )}
                    </div>
                    <div className="glass-panel p-4 rounded-xl border border-brand-border/40 flex flex-col justify-between">
                      <span className="text-[10px] font-bold text-brand-text-muted uppercase">Payment Success</span>
                      {dataLoading ? (
                        <div className="h-6 w-16 bg-brand-border/40 animate-pulse rounded mt-1.5"></div>
                      ) : (
                        <p className="text-lg sm:text-2xl font-black text-brand-green mt-1.5">{paymentSuccessRate}</p>
                      )}
                    </div>
                    <div className="glass-panel p-4 rounded-xl border border-brand-border/40 flex flex-col justify-between">
                      <span className="text-[10px] font-bold text-brand-text-muted uppercase">Conversion rate</span>
                      {dataLoading ? (
                        <div className="h-6 w-16 bg-brand-border/40 animate-pulse rounded mt-1.5"></div>
                      ) : (
                        <p className="text-lg sm:text-2xl font-black text-white mt-1.5">{conversionRate}</p>
                      )}
                    </div>
                  </div>

                  {/* Charts Row */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    
                    {/* Revenue Trends */}
                    <div className="glass-panel rounded-2xl p-5 border border-brand-border/40">
                      <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Revenue & SOL Volume received</h3>
                      <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={getRevenueTrendData()} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <defs>
                              <linearGradient id="colorUsdc" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#2a2935" />
                            <XAxis dataKey="date" stroke="#6b7280" style={{ fontSize: 10 }} />
                            <YAxis stroke="#6b7280" style={{ fontSize: 10 }} />
                            <Tooltip contentStyle={{ backgroundColor: "#1c1b26", borderColor: "#373549", color: "#fff" }} />
                            <Area type="monotone" dataKey="USDC" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorUsdc)" strokeWidth={2.5} name="Revenue ($)" />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Sales by Retailer */}
                    <div className="glass-panel rounded-2xl p-5 border border-brand-border/40">
                      <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Total Sales by retail partner</h3>
                      <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={getRetailerSalesData()} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#2a2935" />
                            <XAxis dataKey="name" stroke="#6b7280" style={{ fontSize: 10 }} />
                            <YAxis stroke="#6b7280" style={{ fontSize: 10 }} />
                            <Tooltip contentStyle={{ backgroundColor: "#1c1b26", borderColor: "#373549", color: "#fff" }} />
                            <Bar dataKey="sales" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={36}>
                              <Cell fill="#8b5cf6" />
                              <Cell fill="#a855f7" />
                              <Cell fill="#ec4899" />
                              <Cell fill="#eab308" />
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                  </div>

                </div>
              )}

              {/* ===================================================================
                  PANEL: ORDERS MANAGER
                  =================================================================== */}
              {activeTab === "orders" && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h1 className="text-xl font-bold">Orders Management</h1>
                      <p className="text-xs text-brand-text-muted mt-1">Review checkout signatures, dispatch carrier tracking, and settle customer refunds.</p>
                    </div>
                    {/* Filter controls */}
                    <div className="flex items-center gap-3 text-xs">
                      {/* Customer Filter Dropdown */}
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-brand-text-muted font-bold uppercase">Customer:</span>
                        <select
                          value={selectedCustomerFilter}
                          onChange={(e) => setSelectedCustomerFilter(e.target.value)}
                          className="h-8 px-2.5 bg-brand-dark/40 border border-brand-border/60 rounded-lg text-xs font-bold text-white cursor-pointer focus:outline-none hover:border-brand-purple/40"
                        >
                          <option value="all">All Customers</option>
                          {uniqueCustomers.map((custName: any) => (
                            <option key={custName} value={custName}>{custName}</option>
                          ))}
                        </select>
                      </div>

                      {/* Status filter buttons */}
                      <div className="flex gap-2">
                        {["all", "paid", "shipped", "delivered", "refunded"].map(status => (
                          <button
                            key={status}
                            onClick={() => setOrderStatusFilter(status)}
                            className={`px-3 py-1.5 rounded-lg border font-bold capitalize transition-all ${
                              orderStatusFilter === status 
                                ? 'bg-brand-purple border-brand-purple text-white shadow-md' 
                                : 'bg-brand-card/40 border-brand-border/60 text-brand-text-muted hover:text-white'
                            }`}
                          >
                            {status}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Orders Data Table */}
                  <div className="rounded-xl border border-brand-border/40 overflow-hidden bg-brand-card/15">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-brand-dark/80 text-brand-text-muted border-b border-brand-border/40">
                        <tr>
                          <th className="p-3.5">Order ID</th>
                          <th className="p-3.5">Date</th>
                          <th className="p-3.5">Customer details</th>
                          <th className="p-3.5">Retailer</th>
                          <th className="p-3.5">Price Paid</th>
                          <th className="p-3.5">SOL Amount</th>
                          <th className="p-3.5">Status</th>
                          <th className="p-3.5 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-brand-border/40">
                        {filteredOrders.map(order => (
                          <tr key={order.id} className="hover:bg-brand-card/25 transition-colors">
                            <td className="p-3.5 font-bold text-white flex items-center gap-1.5">
                              {order.id}
                            </td>
                            <td className="p-3.5 text-brand-text-muted">
                              {new Date(order.timestamp).toLocaleDateString()}
                            </td>
                            <td className="p-3.5">
                              <p className="font-bold text-white">{order.customerDetails.name}</p>
                              <p className="text-[10px] text-brand-text-muted font-mono truncate max-w-[140px]">{order.walletAddress}</p>
                            </td>
                            <td className="p-3.5 font-bold uppercase text-brand-text-muted text-[10px]">
                              {order.retailerId}
                            </td>
                            <td className="p-3.5 font-extrabold text-white">
                              ${order.retailPriceUSD.toFixed(2)}
                            </td>
                            <td className="p-3.5 font-semibold text-brand-green">
                              {order.paidSOL.toFixed(4)} SOL
                            </td>
                            <td className="p-3.5">
                              <span className={`px-2 py-1 rounded-full text-[9px] font-bold uppercase ${getStatusBadge(order.status)}`}>
                                {order.status}
                              </span>
                            </td>
                            <td className="p-3.5 text-right">
                              <button
                                onClick={() => setSelectedOrder(order)}
                                className="px-3 py-1.5 bg-brand-purple/20 text-brand-purple hover:bg-brand-purple/35 rounded-lg border border-brand-purple/30 font-bold flex items-center gap-1.5 ml-auto"
                              >
                                <Eye className="h-3.5 w-3.5" />
                                Inspect
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* ORDER DETAIL SLIDING PANEL / MODAL */}
                  {selectedOrder && (
                    <div className="fixed inset-0 bg-brand-dark/70 backdrop-blur-sm z-50 flex justify-end animate-fade-in font-sans">
                      <div className="w-full max-w-lg bg-brand-card border-l border-brand-border/60 h-full p-6 overflow-y-auto space-y-6 flex flex-col justify-between shadow-2xl">
                        
                        {/* Header Details */}
                        <div className="space-y-6">
                          <div className="flex justify-between items-center border-b border-brand-border/40 pb-4">
                            <div>
                              <h2 className="text-lg font-black text-white">Order Details: {selectedOrder.id}</h2>
                              <p className="text-[10px] text-brand-text-muted mt-0.5">Placed: {new Date(selectedOrder.timestamp).toLocaleString()}</p>
                            </div>
                            <button 
                              onClick={() => setSelectedOrder(null)}
                              className="p-1.5 rounded-lg hover:bg-brand-dark/60 text-brand-text-muted hover:text-white"
                            >
                              <X className="h-5 w-5" />
                            </button>
                          </div>

                          {/* Customer & Address details */}
                          <div className="grid grid-cols-2 gap-4 text-xs">
                            <div className="space-y-1">
                              <p className="font-bold text-brand-text-muted uppercase text-[9px] tracking-wider font-sans">Customer Details</p>
                              {isEditingCustomer ? (
                                <div className="space-y-2 mt-1">
                                  <input
                                    type="text"
                                    value={editingCustomerName}
                                    onChange={(e) => setEditingCustomerName(e.target.value)}
                                    className="w-full px-2.5 py-1 bg-brand-dark border border-brand-border/60 rounded text-xs text-white"
                                    placeholder="Edit name..."
                                  />
                                  <div className="flex gap-1.5">
                                    <button
                                      onClick={() => handleUpdateCustomerName(selectedOrder.id)}
                                      className="px-2 py-0.5 rounded bg-brand-purple text-[10px] font-bold text-white hover:bg-brand-purple/90"
                                    >
                                      Save
                                    </button>
                                    <button
                                      onClick={() => setIsEditingCustomer(false)}
                                      className="px-2 py-0.5 rounded bg-brand-dark border border-brand-border text-[10px] font-bold text-white hover:bg-brand-border"
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <div className="flex items-start gap-1.5 mt-1">
                                  <div>
                                    <p className="text-white font-bold">{selectedOrder.customerDetails.name}</p>
                                    <p className="text-brand-text-muted">{selectedOrder.customerDetails.email}</p>
                                    <p className="text-brand-text-muted">{selectedOrder.customerDetails.phone}</p>
                                  </div>
                                  <button
                                    onClick={() => {
                                      setEditingCustomerName(selectedOrder.customerDetails.name);
                                      setIsEditingCustomer(true);
                                    }}
                                    className="text-[10px] font-bold text-brand-purple hover:underline"
                                  >
                                    Edit
                                  </button>
                                </div>
                              )}
                            </div>
                            <div className="space-y-1">
                              <p className="font-bold text-brand-text-muted uppercase text-[9px] tracking-wider font-sans">Shipping Address</p>
                              <p className="text-white font-bold">{selectedOrder.shippingAddress.name}</p>
                              <p className="text-brand-text-muted">{selectedOrder.shippingAddress.streetAddress}</p>
                              <p className="text-brand-text-muted">{selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} {selectedOrder.shippingAddress.postalCode}</p>
                              <p className="text-brand-text-muted">{selectedOrder.shippingAddress.country}</p>
                            </div>
                          </div>

                          {/* Order Products */}
                          <div className="space-y-2.5">
                            <p className="font-bold text-brand-text-muted uppercase text-[9px] tracking-wider font-sans">Ordered Products</p>
                            {selectedOrder.items.map((item, idx) => (
                              <div key={idx} className="flex justify-between items-center p-3 rounded-xl border border-brand-border/60 bg-brand-dark/30">
                                <div>
                                  <p className="font-bold text-white text-xs">{item.productName}</p>
                                  <p className="text-[10px] text-brand-text-muted mt-0.5">Qty: {item.quantity} x ${item.marketplacePriceUSD}</p>
                                </div>
                                <span className="font-extrabold text-white text-xs">${(item.marketplacePriceUSD * item.quantity).toFixed(2)}</span>
                              </div>
                            ))}
                          </div>

                          {/* Transactions hash */}
                          <div className="p-4 rounded-xl border border-brand-border/60 bg-brand-dark/20 text-[10px] font-mono space-y-1.5">
                            <p className="font-bold text-brand-purple uppercase tracking-wider text-[9px] font-sans">Blockchain logs</p>
                            <p className="truncate text-brand-text-muted">Payment TX: <span className="text-white font-semibold">{selectedOrder.txHash}</span></p>
                            <p className="truncate text-brand-text-muted">Swap Status: <span className="text-brand-green font-semibold">{"SOL -> USDC Swapped (100%)"}</span></p>
                          </div>

                          {/* Actions / Update panel */}
                          {hasPermission("orders", "edit") && (
                            <div className="space-y-3 p-4 rounded-xl border border-brand-purple/20 bg-brand-purple/5">
                              <p className="font-bold text-brand-purple uppercase tracking-wider text-[9px] font-sans">Administrative Actions</p>
                              
                              {selectedOrder.status !== "delivered" && selectedOrder.status !== "refunded" ? (
                                <div className="space-y-2">
                                  <label className="block text-[10px] font-bold text-brand-text-muted uppercase">Assign Digital Gift Card Code</label>
                                  <div className="flex gap-2">
                                    <input
                                      type="text"
                                      placeholder="e.g. AMZN-XYZ-123-ABC"
                                      value={giftCardCodeInput}
                                      onChange={(e) => setGiftCardCodeInput(e.target.value)}
                                      className="flex-1 px-3 py-1.5 text-xs bg-brand-dark border border-brand-border/60 rounded-lg text-white"
                                    />
                                    <button
                                      onClick={() => handleDeliverGiftCardCode(selectedOrder.id)}
                                      className="px-4 bg-brand-purple hover:bg-brand-purple/95 rounded-lg text-xs font-bold text-white transition-colors"
                                    >
                                      Deliver Code
                                    </button>
                                  </div>
                                  <p className="text-[9px] text-brand-text-muted mt-1">Assigning a code will mark this order as Completed/Delivered and instantly email the code to the customer.</p>
                                </div>
                              ) : (
                                <div className="space-y-1.5">
                                  <p className="text-[10px] text-brand-text-muted font-bold uppercase">Delivered Gift Card Code</p>
                                  <p className="p-2.5 rounded bg-brand-dark/60 border border-brand-border/40 font-mono text-xs text-brand-green font-bold select-all tracking-wider text-center">
                                    {selectedOrder.giftCardCode || "N/A - Direct delivery"}
                                  </p>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Internal Notes log */}
                          <div className="space-y-3 pt-2">
                            <p className="font-bold text-brand-text-muted uppercase text-[9px] tracking-wider font-sans">Internal Activity log & Notes</p>
                            <div className="space-y-2 max-h-40 overflow-y-auto">
                              {logs.filter(l => l.details.includes(selectedOrder.id)).map(l => (
                                <div key={l.id} className="p-2 bg-brand-dark/40 rounded-lg text-[10px] text-brand-text-muted">
                                  <p className="font-semibold text-white">{l.details}</p>
                                  <p className="mt-0.5">{new Date(l.timestamp).toLocaleString()}</p>
                                </div>
                              ))}
                            </div>
                            
                            <div className="flex gap-2">
                              <input
                                type="text"
                                placeholder="Add note to order history..."
                                value={newNote}
                                onChange={(e) => setNewNote(e.target.value)}
                                className="flex-1 px-3 py-1.5 text-xs bg-brand-dark border border-brand-border/60 rounded-lg text-white focus:outline-none focus:border-brand-purple"
                              />
                              <button
                                onClick={() => handleAddInternalNote(selectedOrder.id)}
                                className="px-3 bg-brand-card hover:bg-brand-border border border-brand-border text-xs font-bold text-white rounded-lg"
                              >
                                Add
                              </button>
                            </div>
                          </div>

                        </div>

                        {/* Invoice & Close */}
                        <div className="pt-6 border-t border-brand-border/40 flex justify-between gap-4">
                          <button
                            onClick={() => {
                              downloadCSV(`invoice_${selectedOrder.id}.csv`, [
                                ["Invoice SOLCart Inc."],
                                ["Order reference", selectedOrder.id],
                                ["Customer name", selectedOrder.customerDetails.name],
                                ["Customer wallet", selectedOrder.walletAddress],
                                ["Paid SOL", selectedOrder.paidSOL],
                                ["Swapped USDC", selectedOrder.receivedUSDC],
                                ["Marketplace price", selectedOrder.retailPriceUSD]
                              ]);
                            }}
                            className="flex-1 py-2 border border-brand-border bg-brand-card text-xs font-bold hover:bg-brand-border rounded-lg text-white flex items-center justify-center gap-1.5"
                          >
                            <Download className="h-4 w-4" />
                            Download Invoice
                          </button>
                          <button
                            onClick={() => setSelectedOrder(null)}
                            className="px-6 py-2 bg-brand-purple hover:bg-brand-purple/95 text-xs font-bold rounded-lg text-white"
                          >
                            Close
                          </button>
                        </div>

                      </div>
                    </div>
                  )}

                </div>
              )}

              {/* ===================================================================
                  PANEL: SALES ANALYTICS
                  ================================================================== */}
              {activeTab === "analytics" && (
                <div className="space-y-8 animate-fade-in">
                  <div>
                    <h1 className="text-xl font-bold">Sales & Profits Analytics</h1>
                    <p className="text-xs text-brand-text-muted mt-1">Review profitability coefficients, product margins, CLV index, and country sales.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="glass-panel p-5 rounded-2xl border border-brand-border/40 text-center">
                      <span className="text-[10px] font-bold text-brand-text-muted uppercase">Cumulative gross profit</span>
                      <p className="text-2xl font-black text-brand-green mt-2">${netProfitUSD.toFixed(2)}</p>
                      <p className="text-[10px] text-brand-text-muted mt-1">Net markup + flat transaction fees</p>
                    </div>
                    <div className="glass-panel p-5 rounded-2xl border border-brand-border/40 text-center">
                      <span className="text-[10px] font-bold text-brand-text-muted uppercase">Average order margin</span>
                      <p className="text-2xl font-black text-white mt-2">10.0%</p>
                      <p className="text-[10px] text-brand-text-muted mt-1">Sourced cost markup premium</p>
                    </div>
                    <div className="glass-panel p-5 rounded-2xl border border-brand-border/40 text-center">
                      <span className="text-[10px] font-bold text-brand-text-muted uppercase">Customer lifetime value</span>
                      <p className="text-2xl font-black text-white mt-2">${(totalSalesUSD / (uniqueBuyersCount || 1)).toFixed(2)}</p>
                      <p className="text-[10px] text-brand-text-muted mt-1">Revenue divided by unique wallet clients</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    
                    {/* Category Pie Chart */}
                    <div className="glass-panel rounded-2xl p-5 border border-brand-border/40">
                      <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Sales by Category</h3>
                      <div className="h-64 w-full flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={getCategorySalesData()}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={80}
                              paddingAngle={5}
                              dataKey="value"
                            >
                              {getCategorySalesData().map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip contentStyle={{ backgroundColor: "#1c1b26", borderColor: "#373549" }} />
                            <Legend verticalAlign="bottom" height={36} iconType="circle" />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Customer Growth Trend */}
                    <div className="glass-panel rounded-2xl p-5 border border-brand-border/40">
                      <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Customer Wallet growth</h3>
                      <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={getCustomerGrowthData()} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#2a2935" />
                            <XAxis dataKey="date" stroke="#6b7280" style={{ fontSize: 10 }} />
                            <YAxis stroke="#6b7280" style={{ fontSize: 10 }} />
                            <Tooltip contentStyle={{ backgroundColor: "#1c1b26", borderColor: "#373549" }} />
                            <Area type="monotone" dataKey="total" stroke="#ec4899" fill="#ec4899" fillOpacity={0.1} strokeWidth={2.5} name="Total Wallets" />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                  </div>

                </div>
              )}

              {/* ===================================================================
                  PANEL: CUSTOMER LIST
                  ================================================================== */}
              {activeTab === "customers" && (
                <div className="space-y-4">
                  <div>
                    <h1 className="text-xl font-bold">Registered Customer Directory</h1>
                    <p className="text-xs text-brand-text-muted mt-1">Review lifetime shopping volumes, wallets, and account statuses.</p>
                  </div>

                  <div className="rounded-xl border border-brand-border/40 overflow-hidden bg-brand-card/15">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-brand-dark/80 text-brand-text-muted border-b border-brand-border/40">
                        <tr>
                          <th className="p-3.5">Customer Name</th>
                          <th className="p-3.5">Email</th>
                          <th className="p-3.5">Wallet Client</th>
                          <th className="p-3.5">Total Orders</th>
                          <th className="p-3.5">Total Spend</th>
                          <th className="p-3.5">Status</th>
                          <th className="p-3.5 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-brand-border/40">
                        {getAggregatedCustomers().length === 0 ? (
                          <tr>
                            <td colSpan={7} className="p-8 text-center text-brand-text-muted">
                              No registered customers found.
                            </td>
                          </tr>
                        ) : (
                          getAggregatedCustomers().map((cust, idx) => (
                            <tr key={idx} className="hover:bg-brand-card/25">
                              <td className="p-3.5 font-bold text-white">{cust.name}</td>
                              <td className="p-3.5 text-brand-text-muted">{cust.email}</td>
                              <td className="p-3.5 font-mono text-brand-text-muted text-[10px] select-all">{cust.walletAddress}</td>
                              <td className="p-3.5 font-bold text-white">{cust.totalOrders}</td>
                              <td className="p-3.5 font-bold text-brand-green">${cust.totalSpend.toFixed(2)}</td>
                              <td className="p-3.5">
                                <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                                  cust.status === "Verified" 
                                    ? "bg-brand-green/10 text-brand-green border border-brand-green/20" 
                                    : "bg-brand-purple/10 text-brand-purple border border-brand-purple/20"
                                }`}>
                                  {cust.status}
                                </span>
                              </td>
                              <td className="p-3.5 text-right">
                                <button
                                  onClick={() => handleDeleteCustomer(cust.id)}
                                  className="p-1 text-red-400 hover:text-red-300 hover:bg-red-500/5 rounded transition-all"
                                  title="Delete User Account"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* ===================================================================
                  PANEL: PAYMENTS LEDGER
                  ================================================================== */}
              {activeTab === "payments" && (
                <div className="space-y-4">
                  <div>
                    <h1 className="text-xl font-bold">Solana Transactions Ledger</h1>
                    <p className="text-xs text-brand-text-muted mt-1">Audit on-chain signatures, USD equivalent values, and transaction confirmations.</p>
                  </div>

                  <div className="rounded-xl border border-brand-border/40 overflow-hidden bg-brand-card/15">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-brand-dark/80 text-brand-text-muted border-b border-brand-border/40">
                        <tr>
                          <th className="p-3.5">Tx ID</th>
                          <th className="p-3.5">Type</th>
                          <th className="p-3.5">Wallet</th>
                          <th className="p-3.5">Amount</th>
                          <th className="p-3.5">Token</th>
                          <th className="p-3.5">Status</th>
                          <th className="p-3.5">On-chain hash</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-brand-border/40 font-mono text-[11px]">
                        {transactions.map(tx => (
                          <tr key={tx.id} className="hover:bg-brand-card/25">
                            <td className="p-3.5 text-brand-text-muted font-bold">{tx.id}</td>
                            <td className="p-3.5 capitalize font-sans font-bold text-white">{tx.type}</td>
                            <td className="p-3.5 text-[10px] text-brand-text-muted truncate max-w-[120px]" title={tx.walletAddress}>{tx.walletAddress}</td>
                            <td className="p-3.5 font-bold text-white">{tx.amount.toFixed(4)}</td>
                            <td className="p-3.5 text-brand-purple font-bold">{tx.token}</td>
                            <td className="p-3.5 font-sans">
                              <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${getStatusBadge(tx.status)}`}>
                                {tx.status}
                              </span>
                            </td>
                            <td className="p-3.5 text-[10px] text-brand-text-muted truncate max-w-[140px]">{tx.txHash}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* ===================================================================
                  PANEL: RETURNS & REFUNDS
                  ================================================================== */}
              {activeTab === "refunds" && (
                <div className="space-y-4">
                  <div>
                    <h1 className="text-xl font-bold">Returns & Refunds Management</h1>
                    <p className="text-xs text-brand-text-muted mt-1">Audit customer returns, examine proofs, and issue SOL back on-chain.</p>
                  </div>

                  <div className="rounded-xl border border-brand-border/40 overflow-hidden bg-brand-card/15">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-brand-dark/80 text-brand-text-muted border-b border-brand-border/40">
                        <tr>
                          <th className="p-3.5">Refund ID</th>
                          <th className="p-3.5">Order Reference</th>
                          <th className="p-3.5">Reason for return</th>
                          <th className="p-3.5">Refund SOL</th>
                          <th className="p-3.5">Status</th>
                          <th className="p-3.5 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-brand-border/40">
                        {refunds.map(ref => (
                          <tr key={ref.id} className="hover:bg-brand-card/25">
                            <td className="p-3.5 font-bold text-white">{ref.id}</td>
                            <td className="p-3.5 text-brand-text-muted font-bold">{ref.orderId}</td>
                            <td className="p-3.5 text-brand-text-muted text-xs font-semibold">{ref.reason}</td>
                            <td className="p-3.5 font-bold text-brand-green">{ref.paidSOL.toFixed(4)} SOL</td>
                            <td className="p-3.5">
                              <span className={`px-2 py-1 rounded text-[9px] font-bold uppercase ${getStatusBadge(ref.status)}`}>
                                {ref.status}
                              </span>
                            </td>
                            <td className="p-3.5 text-right">
                              {ref.status === "pending" && hasPermission("refunds", "edit") ? (
                                <div className="flex gap-2 justify-end">
                                  <button
                                    onClick={() => handleApproveRefund(ref.id)}
                                    className="px-2.5 py-1.5 bg-brand-green/20 text-brand-green border border-brand-green/30 hover:bg-brand-green/30 rounded-lg font-bold"
                                  >
                                    Approve SOL Refund
                                  </button>
                                  <button
                                    onClick={() => handleRejectRefund(ref.id)}
                                    className="px-2.5 py-1.5 bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 rounded-lg font-bold"
                                  >
                                    Reject
                                  </button>
                                </div>
                              ) : (
                                <span className="text-brand-text-muted text-[10px]">No Actions Pending</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* ===================================================================
                  PANEL: RETAILERS MARKUP
                  ================================================================== */}
              {activeTab === "retailers" && (
                <div className="space-y-4">
                  <div>
                    <h1 className="text-xl font-bold">Retailers Config & Markups</h1>
                    <p className="text-xs text-brand-text-muted mt-1">Configure active status coefficients and profit margins per retailer partner.</p>
                  </div>

                  <div className="rounded-xl border border-brand-border/40 overflow-hidden bg-brand-card/15 max-w-4xl font-sans">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-brand-dark/80 text-brand-text-muted border-b border-brand-border/40">
                        <tr>
                          <th className="p-3.5">Retailer</th>
                          <th className="p-3.5">Markup Percentage</th>
                          <th className="p-3.5">API Integration</th>
                          <th className="p-3.5">Status</th>
                          <th className="p-3.5 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-brand-border/40">
                        {retailers.map(ret => (
                          <tr key={ret.id} className="hover:bg-brand-card/25">
                            <td className="p-3.5 font-bold text-white uppercase">{ret.name}</td>
                            <td className="p-3.5 font-black text-brand-purple">
                              {editingRetailerId === ret.id ? (
                                <div className="flex items-center gap-2">
                                  <input
                                    type="number"
                                    value={editingMarkup}
                                    onChange={(e) => setEditingMarkup(parseFloat(e.target.value))}
                                    className="w-16 px-2 py-1 text-xs bg-brand-dark border border-brand-border/60 rounded text-white"
                                  />
                                  <span>%</span>
                                </div>
                              ) : (
                                <span>{ret.markupPercentage}%</span>
                              )}
                            </td>
                            <td className="p-3.5 font-mono text-[10px] text-brand-text-muted">Connected (Mock Fulfillment)</td>
                            <td className="p-3.5">
                              <span className={`px-2 py-1 rounded text-[9px] font-bold uppercase ${getStatusBadge(ret.isActive ? "active" : "disabled")}`}>
                                {ret.isActive ? "Active" : "Disabled"}
                              </span>
                            </td>
                            <td className="p-3.5 text-right">
                              {hasPermission("retailers", "edit") && (
                                editingRetailerId === ret.id ? (
                                  <button
                                    onClick={() => handleUpdateMarkup(ret.id)}
                                    className="px-2.5 py-1.5 bg-brand-green/20 text-brand-green border border-brand-green/30 rounded-lg font-bold"
                                  >
                                    Save
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => {
                                      setEditingRetailerId(ret.id);
                                      setEditingMarkup(ret.markupPercentage);
                                    }}
                                    className="px-2.5 py-1.5 bg-brand-card hover:bg-brand-border border border-brand-border text-white rounded-lg font-bold"
                                  >
                                    Adjust
                                  </button>
                                )
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* ===================================================================
                  PANEL: PRODUCTS CATALOG
                  ================================================================== */}
              {activeTab === "products" && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h1 className="text-xl font-bold">Products Inventory</h1>
                      <p className="text-xs text-brand-text-muted mt-1">Review active items, add custom listings, and adjust stock counts.</p>
                    </div>
                    {hasPermission("products", "edit") && (
                      <button
                        onClick={() => {
                          setNewProdName("");
                          setNewProdBrand("");
                          setNewProdCategory("Electronics");
                          setNewProdRetailPrice("");
                          setNewProdRetailer("amazon");
                          setNewProdStock("50");
                          setNewProdImage("");
                          setNewProdDesc("");
                          setEditingProductId(null);
                          setShowProductForm(true);
                        }}
                        className="px-4 py-2 bg-brand-purple hover:bg-brand-purple/95 rounded-lg text-xs font-bold text-white flex items-center gap-1.5"
                      >
                        <Plus className="h-4 w-4" />
                        Add Product
                      </button>
                    )}
                  </div>

{/* Add Product Form */}
                  {showProductForm && (
                    <form onSubmit={handleAddProduct} className="p-5 rounded-2xl border border-brand-border/40 bg-brand-card/25 max-w-2xl space-y-4 animate-fade-in text-xs">
                      <h3 className="text-xs font-bold text-brand-purple uppercase tracking-wider">
                        {editingProductId ? "Edit Product Details" : "New Product Details"}
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-brand-text-muted font-bold">Product Name</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Beats Wireless Headphones"
                            value={newProdName}
                            onChange={(e) => setNewProdName(e.target.value)}
                            className="w-full px-3 py-2 bg-brand-dark border border-brand-border/60 rounded-lg text-white"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-brand-text-muted font-bold">Brand</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Beats"
                            value={newProdBrand}
                            onChange={(e) => setNewProdBrand(e.target.value)}
                            className="w-full px-3 py-2 bg-brand-dark border border-brand-border/60 rounded-lg text-white"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-brand-text-muted font-bold">Retailer</label>
                          <select
                            value={newProdRetailer}
                            onChange={(e) => setNewProdRetailer(e.target.value)}
                            className="w-full px-3 py-2 bg-brand-dark border border-brand-border/60 rounded-lg text-white cursor-pointer"
                          >
                            {retailers.filter(r => r.isActive).map(r => (
                              <option key={r.id} value={r.id}>{r.name}</option>
                            ))}
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="text-brand-text-muted font-bold">Base Retail Cost (USD)</label>
                          <input
                            type="number"
                            required
                            placeholder="100.00"
                            value={newProdRetailPrice}
                            onChange={(e) => setNewProdRetailPrice(e.target.value)}
                            className="w-full px-3 py-2 bg-brand-dark border border-brand-border/60 rounded-lg text-white"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-brand-text-muted font-bold">Stock Count</label>
                          <input
                            type="number"
                            required
                            placeholder="50"
                            value={newProdStock}
                            onChange={(e) => setNewProdStock(e.target.value)}
                            className="w-full px-3 py-2 bg-brand-dark border border-brand-border/60 rounded-lg text-white"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-brand-text-muted font-bold">Category</label>
                          <select
                            value={newProdCategory}
                            onChange={(e) => setNewProdCategory(e.target.value)}
                            className="w-full px-3 py-2 bg-brand-dark border border-brand-border/60 rounded-lg text-white cursor-pointer"
                          >
                            <option value="Electronics">Electronics</option>
                            <option value="Apparel">Apparel</option>
                            <option value="Gaming">Gaming</option>
                            <option value="Retail">Retail</option>
                            <option value="Food & Drink">Food & Drink</option>
                            <option value="Entertainment">Entertainment</option>
                          </select>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-brand-text-muted font-bold">Image URL</label>
                        <input
                          type="url"
                          required
                          placeholder="https://images.unsplash.com/photo-..."
                          value={newProdImage}
                          onChange={(e) => setNewProdImage(e.target.value)}
                          className="w-full px-3 py-2 bg-brand-dark border border-brand-border/60 rounded-lg text-white"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-brand-text-muted font-bold">Description</label>
                        <textarea
                          required
                          rows={3}
                          placeholder="Provide details about the gift card, region locking, and terms..."
                          value={newProdDesc}
                          onChange={(e) => setNewProdDesc(e.target.value)}
                          className="w-full px-3 py-2 bg-brand-dark border border-brand-border/60 rounded-lg text-white resize-none"
                        />
                      </div>

                      <div className="flex gap-4">
                        <button
                          type="submit"
                          className="flex-1 py-2 bg-brand-purple hover:bg-brand-purple/95 rounded-lg text-xs font-bold text-white"
                        >
                          {editingProductId ? "Save Changes" : "Confirm & Add"}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setShowProductForm(false);
                            setEditingProductId(null);
                          }}
                          className="px-6 py-2 bg-brand-dark hover:bg-brand-border border border-brand-border rounded-lg text-xs font-bold text-white"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Products Grid */}
                  <div className="rounded-xl border border-brand-border/40 overflow-hidden bg-brand-card/15">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-brand-dark/80 text-brand-text-muted border-b border-brand-border/40">
                        <tr>
                          <th className="p-3.5">Product Name</th>
                          <th className="p-3.5">Category</th>
                          <th className="p-3.5">Cost Price</th>
                          <th className="p-3.5">Stock Status</th>
                          <th className="p-3.5 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-brand-border/40">
                        {products.slice(0, 15).map(prod => (
                          <tr key={prod.id} className="hover:bg-brand-card/25">
                            <td className="p-3.5 font-bold text-white">{prod.name}</td>
                            <td className="p-3.5 text-brand-text-muted">{prod.category}</td>
                            <td className="p-3.5 font-bold text-white">${prod.retailPrice.toFixed(2)}</td>
                            <td className="p-3.5 font-bold">
                              <span className={`px-2 py-0.5 rounded text-[10px] ${prod.stockCount > 10 ? 'text-brand-green bg-brand-green/5' : 'text-amber-400 bg-amber-500/5'}`}>
                                {prod.stockCount} in stock
                              </span>
                            </td>
                            <td className="p-3.5 text-right font-sans">
                              {hasPermission("products", "edit") && (
                                <div className="flex items-center justify-end gap-2">
                                  <button
                                    onClick={() => handleEditProduct(prod)}
                                    className="p-1.5 text-brand-purple hover:text-brand-green hover:bg-brand-purple/10 rounded-lg transition-all"
                                    title="Edit Product"
                                  >
                                    <Edit2 className="h-4 w-4" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteProduct(prod.id)}
                                    className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all"
                                    title="Delete Product"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </div>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* ===================================================================
                  PANEL: SUPPLIERS & INVENTORY
                  ================================================================== */}
              {activeTab === "inventory" && (
                <div className="space-y-4 font-sans">
                  <div>
                    <h1 className="text-xl font-bold">Product Stock & Catalog Control</h1>
                    <p className="text-xs text-brand-text-muted mt-1">Adjust and manage inventory stock counts for all active gift card brands.</p>
                  </div>

                  {/* Product Stock Levels Table */}
                  <div className="pt-2">
                     <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-3">Product Stock Levels</h2>
                    <div className="rounded-xl border border-brand-border/40 overflow-hidden bg-brand-card/15">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-brand-dark/80 text-brand-text-muted border-b border-brand-border/40">
                          <tr>
                            <th className="p-3.5">Product / Gift Card</th>
                            <th className="p-3.5">Brand</th>
                            <th className="p-3.5">Stock Level</th>
                            <th className="p-3.5">Status</th>
                            <th className="p-3.5 text-right">Update Stock</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-brand-border/40">
                          {products.length === 0 ? (
                            <tr>
                              <td colSpan={5} className="p-8 text-center text-brand-text-muted">
                                No products in catalog yet. Please add a product to track its stock.
                              </td>
                            </tr>
                          ) : (
                            products.map(prod => {
                              const stock = prod.stockCount;
                              let statusText = "In Stock";
                              let statusClass = "text-brand-green bg-brand-green/5";
                              if (stock === 0) {
                                statusText = "Out of Stock";
                                statusClass = "text-red-400 bg-red-500/5";
                              } else if (stock <= 10) {
                                statusText = "Low Stock";
                                statusClass = "text-amber-400 bg-amber-500/5";
                              }

                              return (
                                <tr key={prod.id} className="hover:bg-brand-card/25">
                                  <td className="p-3.5 flex items-center gap-3">
                                    <div className="relative h-8 w-8 rounded overflow-hidden shrink-0 bg-brand-dark">
                                      <img
                                        src={prod.image || "https://images.unsplash.com/photo-1574634534894-89d7576c8259?w=100"}
                                        alt={prod.name}
                                        className="h-full w-full object-cover"
                                      />
                                    </div>
                                    <span className="font-bold text-white">{prod.name}</span>
                                  </td>
                                  <td className="p-3.5 text-brand-text-muted">{prod.brand}</td>
                                  <td className="p-3.5 font-bold text-white font-mono">{stock}</td>
                                  <td className="p-3.5 font-bold">
                                    <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-black tracking-wider ${statusClass}`}>
                                      {statusText}
                                    </span>
                                  </td>
                                  <td className="p-3.5 text-right">
                                    {editingStockProductId === prod.id ? (
                                      <div className="inline-flex items-center gap-2">
                                        <input
                                          type="number"
                                          placeholder="Set Stock"
                                          value={editingStock[prod.id] !== undefined ? editingStock[prod.id] : stock.toString()}
                                          onChange={(e) => {
                                            setEditingStock(prev => ({
                                              ...prev,
                                              [prod.id]: e.target.value
                                            }));
                                          }}
                                          className="w-16 px-2 py-1 bg-brand-dark border border-brand-purple/40 rounded text-center text-white font-mono text-xs focus:outline-none"
                                        />
                                        <button
                                          onClick={async () => {
                                            await handleUpdateStock(prod.id, editingStock[prod.id] !== undefined ? editingStock[prod.id] : stock.toString());
                                            setEditingStockProductId(null);
                                          }}
                                          className="px-2.5 py-1 bg-brand-green hover:bg-brand-green/90 rounded text-[10px] font-bold text-brand-dark transition-colors"
                                        >
                                          Save
                                        </button>
                                        <button
                                          onClick={() => setEditingStockProductId(null)}
                                          className="px-2.5 py-1 bg-brand-card hover:bg-brand-border border border-brand-border rounded text-[10px] font-bold text-white transition-colors"
                                        >
                                          Cancel
                                        </button>
                                      </div>
                                    ) : (
                                      <button
                                        onClick={() => {
                                          setEditingStockProductId(prod.id);
                                          setEditingStock(prev => ({
                                            ...prev,
                                            [prod.id]: stock.toString()
                                          }));
                                        }}
                                        className="px-3 py-1 bg-brand-purple/10 hover:bg-brand-purple/20 border border-brand-purple/25 rounded text-[10px] font-bold text-brand-purple transition-all"
                                      >
                                        Edit Stock
                                      </button>
                                    )}
                                  </td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* ===================================================================
                  PANEL: STAFF MANAGEMENT
                  ================================================================== */}
              {activeTab === "staff" && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h1 className="text-xl font-bold">Employee Directory & RBAC</h1>
                      <p className="text-xs text-brand-text-muted mt-1">Configure employee roles, restrict page modules, and add new administrative members.</p>
                    </div>
                    {hasPermission("staff", "edit") && (
                      <button
                        onClick={() => setShowStaffForm(!showStaffForm)}
                        className="px-4 py-2 bg-brand-purple hover:bg-brand-purple/95 rounded-lg text-xs font-bold text-white flex items-center gap-1.5"
                      >
                        <Plus className="h-4 w-4" />
                        Invite Employee
                      </button>
                    )}
                  </div>

                  {/* Add Staff form */}
                  {showStaffForm && (
                    <form onSubmit={handleAddStaff} className="p-5 rounded-2xl border border-brand-border/40 bg-brand-card/25 max-w-md space-y-4 animate-fade-in text-xs">
                      <h3 className="text-xs font-bold text-brand-purple uppercase tracking-wider">Staff Account Invite</h3>
                      <div className="space-y-3">
                        <div className="space-y-1">
                          <label className="text-brand-text-muted font-bold">Full Name</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. John Support"
                            value={newStaffName}
                            onChange={(e) => setNewStaffName(e.target.value)}
                            className="w-full px-3 py-2 bg-brand-dark border border-brand-border/60 rounded-lg text-white"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-brand-text-muted font-bold">Email Address</label>
                          <input
                            type="email"
                            required
                            placeholder="e.g. john@solcart.io"
                            value={newStaffEmail}
                            onChange={(e) => setNewStaffEmail(e.target.value)}
                            className="w-full px-3 py-2 bg-brand-dark border border-brand-border/60 rounded-lg text-white"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-brand-text-muted font-bold">Organizational Role</label>
                          <select
                            value={newStaffRole}
                            onChange={(e) => setNewStaffRole(e.target.value)}
                            className="w-full px-3 py-2 bg-brand-dark border border-brand-border/60 rounded-lg text-white cursor-pointer"
                          >
                            <option value="Finance Manager">Finance Manager</option>
                            <option value="Operations Manager">Operations Manager</option>
                            <option value="Customer Support">Customer Support</option>
                            <option value="Fulfillment Manager">Fulfillment Manager</option>
                            <option value="Read-Only Analyst">Read-Only Analyst</option>
                          </select>
                        </div>
                      </div>

                      <div className="flex gap-4">
                        <button
                          type="submit"
                          className="flex-1 py-2 bg-brand-purple hover:bg-brand-purple/95 rounded-lg text-xs font-bold text-white"
                        >
                          Send Invite
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowStaffForm(false)}
                          className="px-4 py-2 bg-brand-dark border border-brand-border text-xs font-bold text-white rounded-lg"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Staff Table */}
                  <div className="rounded-xl border border-brand-border/40 overflow-hidden bg-brand-card/15">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-brand-dark/80 text-brand-text-muted border-b border-brand-border/40">
                        <tr>
                          <th className="p-3.5">Name</th>
                          <th className="p-3.5">Email</th>
                          <th className="p-3.5">Role</th>
                          <th className="p-3.5">Status</th>
                          <th className="p-3.5">Active Tasks</th>
                          <th className="p-3.5 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-brand-border/40">
                        {staff.map(member => (
                          <tr key={member.id} className="hover:bg-brand-card/25">
                            <td className="p-3.5 font-bold text-white">{member.name}</td>
                            <td className="p-3.5 text-brand-text-muted">{member.email}</td>
                            <td className="p-3.5 font-bold text-brand-purple text-[10px] tracking-wide uppercase">{member.role}</td>
                            <td className="p-3.5">
                              <span className={`px-2 py-1 rounded text-[9px] font-bold uppercase ${getStatusBadge(member.status)}`}>
                                {member.status}
                              </span>
                            </td>
                            <td className="p-3.5 text-brand-text-muted font-bold">{member.assignedOrders} Orders</td>
                            <td className="p-3.5 text-right font-sans">
                              {hasPermission("staff", "edit") && member.role !== "Owner" && (
                                <button
                                  onClick={() => handleRemoveStaff(member.id)}
                                  className="text-xs text-red-400 hover:text-red-300 font-bold"
                                >
                                  Suspend
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* ===================================================================
                  PANEL: SUPPORT CENTER
                  ================================================================== */}
              {activeTab === "support" && (
                <div className="space-y-4">
                  <div>
                    <h1 className="text-xl font-bold">Help Desk Tickets Center</h1>
                    <p className="text-xs text-brand-text-muted mt-1">Review customer messages, assign support staff, and log response comments.</p>
                  </div>

                  <div className="rounded-xl border border-brand-border/40 overflow-hidden bg-brand-card/15">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-brand-dark/80 text-brand-text-muted border-b border-brand-border/40">
                        <tr>
                          <th className="p-3.5">Ticket ID</th>
                          <th className="p-3.5">Customer Name</th>
                          <th className="p-3.5">Subject</th>
                          <th className="p-3.5">Assigned Agent</th>
                          <th className="p-3.5">Status</th>
                          <th className="p-3.5 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-brand-border/40">
                        {tickets.map(tkt => (
                          <tr key={tkt.id} className="hover:bg-brand-card/25">
                            <td className="p-3.5 font-bold text-white">{tkt.id}</td>
                            <td className="p-3.5 text-white font-bold">
                              <p>{tkt.customer}</p>
                              <p className="text-[10px] font-normal text-brand-text-muted">{tkt.email}</p>
                            </td>
                            <td className="p-3.5 text-brand-text-muted text-xs font-semibold">{tkt.subject}</td>
                            <td className="p-3.5 font-bold text-brand-purple text-[10px] uppercase">{tkt.assignedTo || "Unassigned"}</td>
                            <td className="p-3.5">
                              <span className={`px-2.5 py-1 rounded text-[9px] font-bold uppercase ${getStatusBadge(tkt.status)}`}>
                                {tkt.status}
                              </span>
                            </td>
                            <td className="p-3.5 text-right">
                              <button
                                onClick={() => setSelectedTicket(tkt)}
                                className="px-3 py-1.5 bg-brand-purple/20 text-brand-purple border border-brand-purple/30 hover:bg-brand-purple/30 rounded-lg font-bold ml-auto"
                              >
                                View Ticket
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* TICKET DETAILS MODAL */}
                  {selectedTicket && (
                    <div className="fixed inset-0 bg-brand-dark/70 backdrop-blur-sm z-50 flex justify-center items-center p-4">
                      <div className="w-full max-w-lg bg-brand-card border border-brand-border/60 rounded-3xl p-6 space-y-4 max-h-[90vh] overflow-y-auto shadow-2xl animate-fade-in-slow text-xs">
                        
                        <div className="flex justify-between items-start border-b border-brand-border/40 pb-3">
                          <div>
                            <h3 className="font-extrabold text-sm text-white">Ticket details: {selectedTicket.id}</h3>
                            <span className="text-[10px] text-brand-text-muted">Customer: {selectedTicket.customer} ({selectedTicket.email})</span>
                          </div>
                          <button 
                            onClick={() => setSelectedTicket(null)}
                            className="p-1 rounded-lg hover:bg-brand-dark text-brand-text-muted hover:text-white"
                          >
                            <X className="h-5 w-5" />
                          </button>
                        </div>

                        <div className="p-4 rounded-xl border border-brand-border/60 bg-brand-dark/30">
                          <p className="font-bold text-white mb-2">Subject: {selectedTicket.subject}</p>
                          <p className="text-brand-text-muted leading-relaxed">{selectedTicket.message}</p>
                        </div>

                        {/* Comment Thread */}
                        <div className="space-y-3">
                          <p className="font-bold text-brand-text-muted uppercase text-[9px] tracking-wider">Internal Notes Thread</p>
                          <div className="space-y-2 max-h-40 overflow-y-auto">
                            {selectedTicket.comments?.map((c: any, index: number) => (
                              <div key={index} className="p-2.5 bg-brand-dark/20 border border-brand-border/40 rounded-lg">
                                <div className="flex justify-between font-bold text-[10px] text-brand-purple uppercase">
                                  <span>{c.author}</span>
                                  <span className="text-brand-text-muted font-normal font-sans lowercase">{new Date(c.timestamp).toLocaleString()}</span>
                                </div>
                                <p className="text-brand-text-muted mt-1">{c.text}</p>
                              </div>
                            ))}
                          </div>

                          <form onSubmit={handleTicketComment} className="flex gap-2">
                            <input
                              type="text"
                              required
                              placeholder="Write internal support comment..."
                              value={newTicketNote}
                              onChange={(e) => setNewTicketNote(e.target.value)}
                              className="flex-1 px-3 py-2 bg-brand-dark border border-brand-border/60 rounded-lg text-xs text-white"
                            />
                            <button
                              type="submit"
                              className="px-4 py-2 bg-brand-purple hover:bg-brand-purple/95 rounded-lg text-xs font-bold text-white"
                            >
                              Post
                            </button>
                          </form>
                        </div>

                        <div className="flex justify-between items-center pt-4 border-t border-brand-border/40">
                          {selectedTicket.status !== "resolved" ? (
                            <button
                              onClick={() => handleResolveTicket(selectedTicket.id)}
                              className="px-4 py-2 bg-brand-green hover:bg-brand-green/95 text-xs font-bold rounded-lg text-white"
                            >
                              Mark Resolved
                            </button>
                          ) : (
                            <span className="text-brand-green font-bold text-xs flex items-center gap-1.5">
                              <CheckCircle className="h-4 w-4" />
                              Resolved
                            </span>
                          )}
                          
                          <button
                            onClick={() => setSelectedTicket(null)}
                            className="px-4 py-2 bg-brand-dark border border-brand-border text-xs font-bold hover:bg-brand-border rounded-lg text-white"
                          >
                            Close
                          </button>
                        </div>

                      </div>
                    </div>
                  )}

                </div>
              )}

              {/* ===================================================================
                  PANEL: FINANCIAL REPORTS
                  ================================================================== */}
              {activeTab === "finance" && (
                <div className="space-y-6">
                  <div>
                    <h1 className="text-xl font-bold">Financial Reports Center</h1>
                    <p className="text-xs text-brand-text-muted mt-1">Generate and download official CSV spreadsheets for audits, tax records, and revenue splits.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
                    
                    <div className="p-5 rounded-2xl border border-brand-border/40 bg-brand-card/15 flex justify-between items-center gap-4">
                      <div>
                        <h3 className="font-extrabold text-sm text-white">Full Revenue Report</h3>
                        <p className="text-[11px] text-brand-text-muted mt-1">Detailed list of all client purchases, wallet inputs, and Swapped USDC totals.</p>
                      </div>
                      <button
                        onClick={exportRevenueReport}
                        className="p-3 bg-brand-purple hover:bg-brand-purple/95 rounded-xl text-white transition-all shrink-0 flex items-center gap-1.5 text-xs font-bold"
                      >
                        <Download className="h-4 w-4" />
                        Export CSV
                      </button>
                    </div>

                    <div className="p-5 rounded-2xl border border-brand-border/40 bg-brand-card/15 flex justify-between items-center gap-4">
                      <div>
                        <h3 className="font-extrabold text-sm text-white">Platform System Audit logs</h3>
                        <p className="text-[11px] text-brand-text-muted mt-1">Full operational log of staff login times, actions, status overrides, and settings logs.</p>
                      </div>
                      <button
                        onClick={exportAuditLogs}
                        className="p-3 bg-brand-purple hover:bg-brand-purple/95 rounded-xl text-white transition-all shrink-0 flex items-center gap-1.5 text-xs font-bold"
                      >
                        <Download className="h-4 w-4" />
                        Export CSV
                      </button>
                    </div>

                  </div>
                </div>
              )}

              {/* ===================================================================
                  PANEL: AUDIT LOGS
                  ================================================================== */}
              {activeTab === "logs" && (
                <div className="space-y-4">
                  <div>
                    <h1 className="text-xl font-bold">System Audit Logs</h1>
                    <p className="text-xs text-brand-text-muted mt-1">Transparent record of every staff modification, settings update, and transaction settlement.</p>
                  </div>

                  <div className="rounded-xl border border-brand-border/40 overflow-hidden bg-brand-card/15">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-brand-dark/80 text-brand-text-muted border-b border-brand-border/40">
                        <tr>
                          <th className="p-3.5">Timestamp</th>
                          <th className="p-3.5">Action Module</th>
                          <th className="p-3.5">Audit details</th>
                          <th className="p-3.5">Log Type</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-brand-border/40 font-mono text-[10px]">
                        {logs.map(log => (
                          <tr key={log.id} className="hover:bg-brand-card/20">
                            <td className="p-3.5 text-brand-text-muted">
                              {new Date(log.timestamp).toLocaleString()}
                            </td>
                            <td className="p-3.5 font-bold text-brand-purple uppercase">
                              {log.action}
                            </td>
                            <td className="p-3.5 text-white font-semibold">
                              {log.details}
                            </td>
                            <td className="p-3.5 font-sans">
                              <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase ${
                                log.type === 'security' 
                                  ? 'bg-red-500/15 text-red-400' 
                                  : log.type === 'warning'
                                  ? 'bg-amber-500/15 text-amber-400'
                                  : 'bg-blue-500/15 text-blue-400'
                              }`}>
                                {log.type}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* ===================================================================
                  PANEL: SYSTEM SETTINGS
                  ================================================================== */}
              {activeTab === "settings" && (
                <div className="space-y-6 max-w-2xl">
                  <div>
                    <h1 className="text-xl font-bold">Global System Configurations</h1>
                    <p className="text-xs text-brand-text-muted mt-1">Configure RPC endpoints, defaults settings, fiat markup rates, and maintenance locks.</p>
                  </div>

                  <div className="p-6 rounded-2xl border border-brand-border/40 bg-brand-card/15 space-y-6 text-xs font-sans">

                    {/* USDC Associated Token Account Initialization Status */}
                    <div className="p-4 rounded-xl border border-brand-border/40 bg-brand-dark/20 space-y-3">
                      <div>
                        <p className="font-bold text-white">USDC Settlement Account Initialization</p>
                        <p className="text-[10px] text-brand-text-muted mt-1">
                          To receive swapped USDC directly to your merchant wallet (GpTU73xt6bWcPisc9Lt8mUZBva92oF8DUoM2bUmo8yWA), your USDC Associated Token Account (ATA) must be initialized on-chain.
                        </p>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                        <span className="text-[10px] text-brand-text-muted font-mono bg-brand-dark px-2 py-1 rounded border border-brand-border/30">
                          ATA: 5kKXsamwHHXtAVAgLAC16TSe2T6XYuifHjoh5k3Dd4dx
                        </span>
                        <button
                          onClick={async () => {
                            if (typeof window === "undefined") return;
                            try {
                              const provider = (window as any).solflare || (window as any).solana;
                              if (!provider) {
                                alert("Please install Solflare or Phantom wallet extension.");
                                return;
                              }
                              await provider.connect();
                              const feePayer = provider.publicKey ? new PublicKey(provider.publicKey.toString()) : null;
                              if (!feePayer) {
                                alert("Please connect your wallet first.");
                                return;
                              }
                              
                               let connection = new Connection("https://api.mainnet-beta.solana.com", "confirmed");
                               let blockhash = "";
                               try {
                                 const bhRes = await connection.getLatestBlockhash("confirmed");
                                 blockhash = bhRes.blockhash;
                               } catch (err) {
                                 console.warn("Primary RPC failed in ATA initializer, switching to publicnode", err);
                                 connection = new Connection("https://solana-rpc.publicnode.com", "confirmed");
                                 const bhRes = await connection.getLatestBlockhash("confirmed");
                                 blockhash = bhRes.blockhash;
                               }
                              
                              const TOKEN_PROGRAM_ID = new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA");
                              const ASSOCIATED_TOKEN_PROGRAM_ID = new PublicKey("ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL");
                              const USDC_MINT = new PublicKey("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v");
                              const merchantWallet = new PublicKey("GpTU73xt6bWcPisc9Lt8mUZBva92oF8DUoM2bUmo8yWA");
                              const SYSVAR_RENT_PUBKEY = new PublicKey("SysvarRent111111111111111111111111111111111");
                              
                              const [ataAddress] = PublicKey.findProgramAddressSync(
                                [
                                  merchantWallet.toBuffer(),
                                  TOKEN_PROGRAM_ID.toBuffer(),
                                  USDC_MINT.toBuffer()
                                ],
                                ASSOCIATED_TOKEN_PROGRAM_ID
                              );
                              
                              const checkInfo = await connection.getAccountInfo(ataAddress);
                              if (checkInfo) {
                                alert("USDC Associated Token Account is ALREADY initialized and active!");
                                return;
                              }
                              
                              const instruction = new TransactionInstruction({
                                keys: [
                                  { pubkey: feePayer, isSigner: true, isWritable: true },
                                  { pubkey: ataAddress, isSigner: false, isWritable: true },
                                  { pubkey: merchantWallet, isSigner: false, isWritable: false },
                                  { pubkey: USDC_MINT, isSigner: false, isWritable: false },
                                  { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
                                  { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
                                  { pubkey: SYSVAR_RENT_PUBKEY, isSigner: false, isWritable: false }
                                ],
                                programId: ASSOCIATED_TOKEN_PROGRAM_ID,
                                data: Buffer.alloc(0)
                              });
                              
                              const tx = new SolanaTx().add(instruction);
                              tx.recentBlockhash = blockhash;
                              tx.feePayer = feePayer;
                              
                              let txHash = "";
                              if (typeof provider.signAndSendTransaction === "function") {
                                const res = await provider.signAndSendTransaction(tx);
                                txHash = typeof res === "string" ? res : res.signature;
                              } else {
                                const signed = await provider.signTransaction(tx);
                                txHash = await connection.sendRawTransaction(signed.serialize(), { skipPreflight: false });
                              }
                              
                              alert(`Initialization transaction submitted: ${txHash}. Please wait a few seconds for confirmation.`);
                            } catch (err: any) {
                              console.error(err);
                              alert(`Failed to initialize account: ${err.message || err}`);
                            }
                          }}
                          className="px-3 py-1.5 rounded-lg bg-brand-purple hover:bg-brand-purple/80 text-white text-[10px] font-bold transition-all text-center whitespace-nowrap"
                        >
                          Initialize USDC ATA
                        </button>
                      </div>
                    </div>
                    
                    <hr className="border-brand-border/40" />
                    
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-bold text-white">Maintenance Mode</p>
                        <p className="text-[10px] text-brand-text-muted">Lock shopping checkout screens for users during service releases.</p>
                      </div>
                      <button
                        onClick={() => {
                          if (!hasPermission("settings", "edit")) return;
                          SupabaseService.updateSettings({ maintenanceMode: !settings.maintenanceMode });
                          refreshAllData();
                        }}
                        className={`px-4 py-2 rounded-lg text-xs font-bold text-white transition-all ${
                          settings.maintenanceMode 
                            ? 'bg-red-500 hover:bg-red-600' 
                            : 'bg-brand-card hover:bg-brand-border border border-brand-border'
                        }`}
                      >
                        {settings.maintenanceMode ? "Disable Maintenance" : "Enable Maintenance"}
                      </button>
                    </div>

                    {/* Markup configuration removed */}

                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-bold text-white">Flat Platform Tax Rate</p>
                        <p className="text-[10px] text-brand-text-muted">Operational fee charged during checkout swaps.</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <input
                          type="number"
                          value={settings.taxRate !== undefined ? settings.taxRate : 5}
                          onChange={(e) => {
                            if (!hasPermission("settings", "edit")) return;
                            SupabaseService.updateSettings({ taxRate: parseFloat(e.target.value) });
                            refreshAllData();
                          }}
                          className="w-16 px-2 py-1 bg-brand-dark border border-brand-border/60 rounded text-center text-white"
                        />
                        <span className="font-bold text-white">%</span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-bold text-white">Flat Shipping Price (USD)</p>
                        <p className="text-[10px] text-brand-text-muted">Set standard shipping fee applied to orders.</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-brand-text-muted">$</span>
                        <input
                          type="number"
                          step="0.01"
                          value={settings.shippingFeeUSD !== undefined ? settings.shippingFeeUSD : 5.00}
                          onChange={(e) => {
                            if (!hasPermission("settings", "edit")) return;
                            SupabaseService.updateSettings({ shippingFeeUSD: parseFloat(e.target.value) });
                            refreshAllData();
                          }}
                          className="w-20 px-2 py-1 bg-brand-dark border border-brand-border/60 rounded text-center text-white font-mono"
                        />
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-bold text-white">Free Shipping Threshold (USD)</p>
                        <p className="text-[10px] text-brand-text-muted">Minimum subtotal required to qualify for free shipping.</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-brand-text-muted">$</span>
                        <input
                          type="number"
                          step="1"
                          value={settings.freeShippingThresholdUSD !== undefined ? settings.freeShippingThresholdUSD : 100.00}
                          onChange={(e) => {
                            if (!hasPermission("settings", "edit")) return;
                            SupabaseService.updateSettings({ freeShippingThresholdUSD: parseFloat(e.target.value) });
                            refreshAllData();
                          }}
                          className="w-20 px-2 py-1 bg-brand-dark border border-brand-border/60 rounded text-center text-white font-mono"
                        />
                      </div>
                    </div>


                    <div className="space-y-2">
                      <p className="font-bold text-white font-sans">Default RPC Provider</p>
                      <input
                        type="text"
                        value={settings.rpcProvider || "Helius Mainnet Beta"}
                        onChange={(e) => {
                          if (!hasPermission("settings", "edit")) return;
                          SupabaseService.updateSettings({ rpcProvider: e.target.value });
                          refreshAllData();
                        }}
                        className="w-full px-3 py-2 bg-brand-dark border border-brand-border/60 rounded-lg text-white"
                      />
                    </div>

                    <div className="space-y-2">
                      <p className="font-bold text-white font-sans">Escrow Settlement Wallet Address</p>
                      <input
                        type="text"
                        value={settings.defaultSolWallet || "So11111111111111111111111111111111111111112"}
                        onChange={(e) => {
                          if (!hasPermission("settings", "edit")) return;
                          SupabaseService.updateSettings({ defaultSolWallet: e.target.value });
                          refreshAllData();
                        }}
                        className="w-full px-3 py-2 bg-brand-dark border border-brand-border/60 rounded-lg text-white font-mono"
                      />
                    </div>

                  </div>
                </div>
              )}

            </div>
          )}

        </main>

      </div>

    </div>
  );
}
