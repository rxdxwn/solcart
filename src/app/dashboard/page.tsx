"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  User, 
  ShoppingBag, 
  MapPin, 
  Settings, 
  Wallet, 
  LogOut, 
  ArrowUpRight, 
  Clock, 
  CheckCircle, 
  HelpCircle, 
  Truck,
  RotateCcw,
  Coins,
  Shield,
  Trash2,
  Calendar,
  X
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useSolanaWallet } from "../../context/SolanaWalletContext";
import { SupabaseService } from "../../services/supabase";
import { Order, Transaction, ShippingAddress, RefundRequest, ActivityLog } from "../../types";

export default function CustomerDashboard() {
  const { user, logout, login } = useAuth();
  const { connected, walletAddress, balance, connect, requestFaucet } = useSolanaWallet();

  // Navigation Tab
  const [activeTab, setActiveTab] = useState<"orders" | "transactions" | "addresses" | "settings">("orders");

  // Database Records States
  const [orders, setOrders] = useState<Order[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [addresses, setAddresses] = useState<ShippingAddress[]>([]);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  
  // Auth Form State
  const [authEmail, setAuthEmail] = useState("");

  // Address creation forms
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addrName, setAddrName] = useState("");
  const [addrStreet, setAddrStreet] = useState("");
  const [addrCity, setAddrCity] = useState("");
  const [addrState, setAddrState] = useState("");
  const [addrZip, setAddrZip] = useState("");
  const [addrCountry, setAddrCountry] = useState("United States");

  // Refund states
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [refundOrderId, setRefundOrderId] = useState("");
  const [refundReason, setRefundReason] = useState("");

  // Selected Order Detail Modal
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Sync database items when wallet or auth session alters
  useEffect(() => {
    if (walletAddress) {
      setOrders(SupabaseService.getOrdersByWallet(walletAddress));
      setTransactions(
        SupabaseService.getTransactions().filter(
          t => t.walletAddress.toLowerCase() === walletAddress.toLowerCase()
        )
      );
    } else {
      setOrders([]);
      setTransactions([]);
    }
    setAddresses(SupabaseService.getAddresses());
    setLogs(SupabaseService.getActivityLogs());
  }, [walletAddress, user]);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (authEmail) {
      await login(authEmail);
    }
  };

  const handleRequestRefund = (e: React.FormEvent) => {
    e.preventDefault();
    if (refundOrderId && refundReason) {
      SupabaseService.createRefundRequest(refundOrderId, refundReason);
      
      // Update UI state
      if (walletAddress) {
        setOrders(SupabaseService.getOrdersByWallet(walletAddress));
      }
      setLogs(SupabaseService.getActivityLogs());
      
      // Close
      setShowRefundModal(false);
      setRefundReason("");
      setRefundOrderId("");
    }
  };

  const handleAddAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (addrName && addrStreet && addrCity && addrState && addrZip) {
      SupabaseService.addAddress({
        name: addrName,
        streetAddress: addrStreet,
        city: addrCity,
        state: addrState,
        postalCode: addrZip,
        country: addrCountry,
        isDefault: addresses.length === 0
      });

      // Reload
      setAddresses(SupabaseService.getAddresses());
      
      // Reset
      setAddrName("");
      setAddrStreet("");
      setAddrCity("");
      setAddrState("");
      setAddrZip("");
      setShowAddressForm(false);
    }
  };

  const handleDeleteAddress = (id: string) => {
    SupabaseService.deleteAddress(id);
    setAddresses(SupabaseService.getAddresses());
  };

  const handleSetDefaultAddress = (id: string) => {
    SupabaseService.updateAddress(id, { isDefault: true });
    setAddresses(SupabaseService.getAddresses());
  };

  const getStatusBadgeClass = (status: Order['status']) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
      case 'paid': return 'bg-brand-green/10 text-brand-green border-brand-green/20';
      case 'swapping': return 'bg-brand-purple/10 text-brand-purple border-brand-purple/20';
      case 'purchased': return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
      case 'shipped': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'delivered': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'refunded': return 'bg-red-500/10 text-red-400 border-red-500/20';
      default: return 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20';
    }
  };

  // If user is guest, show login gate
  if (!user) {
    return (
      <div className="mx-auto max-w-sm px-4 py-24 flex flex-col items-center justify-center text-center">
        <div className="h-12 w-12 rounded-full bg-brand-purple/10 border border-brand-purple/20 flex items-center justify-center text-brand-purple mb-4">
          <User className="h-6 w-6" />
        </div>
        <h2 className="text-xl font-bold text-white tracking-tight">Customer Dashboard</h2>
        <p className="text-xs text-brand-text-muted mt-2 mb-8 leading-relaxed">
          Please sign in to view your orders, transaction hashes, courier tracking updates, and saved addresses.
        </p>

        <form onSubmit={handleLoginSubmit} className="w-full space-y-4">
          <input
            type="email"
            required
            placeholder="Enter your email (e.g. customer@solcart.com)"
            value={authEmail}
            onChange={(e) => setAuthEmail(e.target.value)}
            className="w-full h-10 px-3.5 rounded-lg border border-brand-border bg-brand-dark/40 text-xs text-white placeholder-brand-text-muted/50 focus:outline-none focus:border-brand-purple/40"
          />
          <button
            type="submit"
            className="w-full py-2.5 rounded-lg bg-brand-purple text-xs font-bold text-white shadow-md hover:bg-brand-purple/95 transition-all"
          >
            Sign In
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 w-full">
      
      {/* 1. Header Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 items-start">
        
        {/* User Card */}
        <div className="md:col-span-2 glass-panel rounded-2xl p-5 border border-brand-border/40 flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-gradient-to-tr from-brand-purple to-brand-green p-0.5 shadow-md">
            <div className="h-full w-full bg-brand-dark rounded-full flex items-center justify-center font-bold text-white text-md">
              {user.name[0]}
            </div>
          </div>
          <div>
            <h2 className="text-md font-bold text-white flex items-center gap-1.5">
              {user.name}
              <span className="px-2 py-0.5 rounded text-[8px] bg-brand-purple/10 text-brand-purple border border-brand-purple/20 font-bold uppercase">
                {user.role}
              </span>
            </h2>
            <p className="text-[10px] text-brand-text-muted mt-1">{user.email}</p>
          </div>
        </div>

        {/* Quick Wallet Stats */}
        <div className="glass-panel rounded-2xl p-5 border border-brand-border/40 space-y-3">
          <div className="flex justify-between items-center text-xs">
            <span className="text-brand-text-muted flex items-center gap-1.5">
              <Wallet className="h-4 w-4 text-brand-purple" />
              Settling Wallet:
            </span>
            <span className="font-mono text-white font-semibold">
              {connected ? `${walletAddress?.slice(0, 4)}...${walletAddress?.slice(-4)}` : "Disconnected"}
            </span>
          </div>
          {connected ? (
            <div className="flex justify-between items-center text-xs pt-2 border-t border-brand-border/20">
              <span className="text-brand-text-muted">Balance:</span>
              <div className="flex items-center gap-2">
                <span className="text-white font-extrabold">{balance.toFixed(2)} SOL</span>
                <button
                  onClick={requestFaucet}
                  className="px-2 py-0.5 text-[10px] font-bold rounded bg-brand-green/10 text-brand-green border border-brand-green/20"
                >
                  Faucet
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => connect("SOLCart Test Wallet")}
              className="w-full py-1.5 bg-brand-purple text-[10px] font-bold text-white rounded-lg"
            >
              Connect Wallet
            </button>
          )}
        </div>

      </div>

      {/* 2. Side-By-Side Layout (Menu Left, Panels Right) */}
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        
        {/* Navigation Sidebar */}
        <nav className="w-full lg:w-56 shrink-0 flex lg:flex-col gap-1 overflow-x-auto pb-2 lg:pb-0">
          {[
            { id: "orders", label: "Order History", icon: <ShoppingBag className="h-4 w-4" /> },
            { id: "transactions", label: "Transactions Log", icon: <Coins className="h-4 w-4" /> },
            { id: "addresses", label: "Saved Addresses", icon: <MapPin className="h-4 w-4" /> },
            { id: "settings", label: "Settings & Logs", icon: <Settings className="h-4 w-4" /> }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs font-semibold select-none transition-all ${
                activeTab === tab.id 
                  ? 'bg-brand-purple/10 text-brand-purple border border-brand-purple/20' 
                  : 'text-brand-text-muted hover:text-white hover:bg-brand-card/30 border border-transparent'
              }`}
            >
              {tab.icon}
              <span className="whitespace-nowrap">{tab.label}</span>
            </button>
          ))}
          <button
            onClick={() => logout()}
            className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs font-semibold text-red-400 hover:bg-red-500/10 transition-colors ml-auto lg:ml-0 lg:mt-6"
          >
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
          </button>
        </nav>

        {/* Display Panel */}
        <div className="flex-1 w-full">
          
          {/* Orders History Tab */}
          {activeTab === "orders" && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-white mb-2">Orders Settle History</h3>
              {orders.length === 0 ? (
                <div className="text-center py-16 border border-dashed border-brand-border/40 rounded-2xl bg-brand-card/10">
                  <ShoppingBag className="h-8 w-8 text-brand-text-muted mx-auto mb-3" />
                  <p className="text-xs font-bold text-white">No orders found</p>
                  <p className="text-[10px] text-brand-text-muted mt-1">Orders you purchase will appear here.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {orders.map(order => (
                    <div 
                      key={order.id}
                      className="rounded-xl border border-brand-border/40 bg-brand-card/20 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white hover:underline cursor-pointer" onClick={() => setSelectedOrder(order)}>
                            {order.id}
                          </span>
                          <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase border ${getStatusBadgeClass(order.status)}`}>
                            {order.status}
                          </span>
                        </div>
                        <p className="text-[10px] text-brand-text-muted">
                          Sourced Store: <span className="text-white capitalize font-semibold">{order.retailerId}</span> • 
                          Date: {new Date(order.timestamp).toLocaleDateString()}
                        </p>
                        <p className="text-[10px] text-brand-text-muted mt-1">
                          Items Count: {order.items.reduce((ac, it) => ac + it.quantity, 0)} • Total: <span className="text-white font-semibold">${order.retailPriceUSD.toFixed(2)}</span>
                        </p>
                      </div>

                      <div className="flex items-center gap-2.5 self-end sm:self-auto">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="px-3.5 py-1.5 bg-brand-card border border-brand-border/80 text-[10px] font-bold text-white rounded-lg hover:bg-brand-border transition-colors"
                        >
                          View Receipt
                        </button>
                        {order.status === "paid" && (
                          <button
                            onClick={() => {
                              setRefundOrderId(order.id);
                              setShowRefundModal(true);
                            }}
                            className="px-3.5 py-1.5 bg-red-500/10 border border-red-500/20 text-[10px] font-bold text-red-400 rounded-lg hover:bg-red-500/20 transition-colors"
                          >
                            Request Refund
                          </button>
                        )}
                        {order.trackingNumber && (
                          <a
                            href={`https://www.17track.net/en/track?nums=${order.trackingNumber}`}
                            target="_blank"
                            rel="noreferrer"
                            className="px-3.5 py-1.5 bg-blue-500/10 border border-blue-500/20 text-[10px] font-bold text-blue-400 rounded-lg hover:bg-blue-500/20 transition-colors flex items-center gap-1"
                          >
                            <Truck className="h-3 w-3" />
                            Track
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Transactions Log Tab */}
          {activeTab === "transactions" && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-white mb-2">On-Chain Transactions Log</h3>
              {transactions.length === 0 ? (
                <div className="text-center py-16 border border-dashed border-brand-border/40 rounded-2xl bg-brand-card/10">
                  <Coins className="h-8 w-8 text-brand-text-muted mx-auto mb-3" />
                  <p className="text-xs font-bold text-white">No transactions found</p>
                </div>
              ) : (
                <div className="rounded-xl border border-brand-border/40 overflow-hidden bg-brand-card/10">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-brand-dark/60 text-brand-text-muted border-b border-brand-border/40">
                      <tr>
                        <th className="p-3">Type</th>
                        <th className="p-3">Amount</th>
                        <th className="p-3">Status</th>
                        <th className="p-3">Transaction Signature</th>
                        <th className="p-3">Time</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-brand-border/40">
                      {transactions.map(tx => (
                        <tr key={tx.id} className="hover:bg-brand-card/20">
                          <td className="p-3 capitalize font-bold text-white">{tx.type}</td>
                          <td className="p-3">
                            <span className={tx.type === "refund" ? "text-red-400 font-semibold" : "text-brand-green font-semibold"}>
                              {tx.type === "refund" ? "-" : ""}{tx.amount} {tx.token}
                            </span>
                          </td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase border ${
                              tx.status === 'success' ? 'bg-brand-green/10 text-brand-green border-brand-green/20' : 'bg-red-500/10 text-red-400 border-red-500/20'
                            }`}>
                              {tx.status}
                            </span>
                          </td>
                          <td className="p-3 font-mono text-[10px] text-brand-text-muted">
                            <a 
                              href={tx.txHash.startsWith("mock_") ? "#" : `https://explorer.solana.com/tx/${tx.txHash}`} 
                              target="_blank" 
                              rel="noreferrer"
                              className="hover:underline flex items-center gap-1"
                            >
                              {tx.txHash.slice(0, 12)}...
                              <ArrowUpRight className="h-3 w-3" />
                            </a>
                          </td>
                          <td className="p-3 text-[10px] text-brand-text-muted">
                            {new Date(tx.timestamp).toLocaleTimeString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Saved Addresses Tab */}
          {activeTab === "addresses" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-sm font-bold text-white">Shipping Addresses Directory</h3>
                {!showAddressForm && (
                  <button
                    onClick={() => setShowAddressForm(true)}
                    className="text-xs font-bold text-brand-purple hover:underline"
                  >
                    + Add Address
                  </button>
                )}
              </div>

              {showAddressForm && (
                <form onSubmit={handleAddAddress} className="glass-panel border border-brand-border/40 rounded-xl p-5 space-y-4 max-w-xl">
                  <h4 className="text-xs font-bold text-white border-b border-brand-border/40 pb-2 mb-2">New Address Record</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="col-span-1 sm:col-span-2">
                      <label className="block text-[10px] font-bold text-brand-text-muted mb-1">Recipient Name</label>
                      <input
                        type="text"
                        required
                        placeholder="Jane Doe"
                        value={addrName}
                        onChange={(e) => setAddrName(e.target.value)}
                        className="w-full h-9 px-3 bg-brand-dark/40 border border-brand-border rounded-lg text-xs text-white"
                      />
                    </div>
                    <div className="col-span-1 sm:col-span-2">
                      <label className="block text-[10px] font-bold text-brand-text-muted mb-1">Street Address</label>
                      <input
                        type="text"
                        required
                        placeholder="123 Block St"
                        value={addrStreet}
                        onChange={(e) => setAddrStreet(e.target.value)}
                        className="w-full h-9 px-3 bg-brand-dark/40 border border-brand-border rounded-lg text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-brand-text-muted mb-1">City</label>
                      <input
                        type="text"
                        required
                        placeholder="Dallas"
                        value={addrCity}
                        onChange={(e) => setAddrCity(e.target.value)}
                        className="w-full h-9 px-3 bg-brand-dark/40 border border-brand-border rounded-lg text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-brand-text-muted mb-1">State</label>
                      <input
                        type="text"
                        required
                        placeholder="Texas"
                        value={addrState}
                        onChange={(e) => setAddrState(e.target.value)}
                        className="w-full h-9 px-3 bg-brand-dark/40 border border-brand-border rounded-lg text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-brand-text-muted mb-1">Postal Code</label>
                      <input
                        type="text"
                        required
                        placeholder="75001"
                        value={addrZip}
                        onChange={(e) => setAddrZip(e.target.value)}
                        className="w-full h-9 px-3 bg-brand-dark/40 border border-brand-border rounded-lg text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-brand-text-muted mb-1">Country</label>
                      <input
                        type="text"
                        required
                        placeholder="United States"
                        value={addrCountry}
                        onChange={(e) => setAddrCountry(e.target.value)}
                        className="w-full h-9 px-3 bg-brand-dark/40 border border-brand-border rounded-lg text-xs text-white"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 justify-end pt-2">
                    <button
                      type="button"
                      onClick={() => setShowAddressForm(false)}
                      className="px-4 py-2 border border-brand-border rounded-lg text-xs text-brand-text-muted"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-brand-purple rounded-lg text-xs font-bold text-white"
                    >
                      Save
                    </button>
                  </div>
                </form>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {addresses.map(a => (
                  <div 
                    key={a.id} 
                    className="p-4 rounded-xl border border-brand-border/40 bg-brand-card/20 flex flex-col justify-between"
                  >
                    <div>
                      <p className="text-xs font-bold text-white flex items-center gap-1.5">
                        <MapPin className="h-4 w-4 text-brand-purple" />
                        {a.name}
                      </p>
                      <p className="text-[10px] text-brand-text-muted mt-2 leading-relaxed">
                        {a.streetAddress}, {a.city}, {a.state} {a.postalCode}, {a.country}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-brand-border/20 flex items-center justify-between">
                      {a.isDefault ? (
                        <span className="px-2 py-0.5 rounded text-[8px] bg-brand-purple/20 text-brand-purple font-semibold border border-brand-purple/30">
                          Default Address
                        </span>
                      ) : (
                        <button
                          onClick={() => handleSetDefaultAddress(a.id)}
                          className="text-[9px] text-brand-text-muted hover:text-white hover:underline font-semibold"
                        >
                          Set Default
                        </button>
                      )}
                      
                      {!a.isDefault && (
                        <button
                          onClick={() => handleDeleteAddress(a.id)}
                          className="text-brand-text-muted hover:text-red-400 p-1"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Settings & Logs Tab */}
          {activeTab === "settings" && (
            <div className="space-y-6">
              
              {/* Profile Config */}
              <div className="glass-panel border border-brand-border/40 rounded-xl p-5 space-y-4">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider border-b border-brand-border/40 pb-2">Profile Configuration</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="block text-[10px] font-bold text-brand-text-muted mb-1">User Identification Code</span>
                    <input
                      type="text"
                      disabled
                      value={user.id}
                      className="w-full h-9 px-3 rounded-lg border border-brand-border bg-brand-dark/20 text-brand-text-muted font-mono"
                    />
                  </div>
                  <div>
                    <span className="block text-[10px] font-bold text-brand-text-muted mb-1">Registration Date</span>
                    <input
                      type="text"
                      disabled
                      value={new Date(user.createdAt).toLocaleDateString()}
                      className="w-full h-9 px-3 rounded-lg border border-brand-border bg-brand-dark/20 text-brand-text-muted"
                    />
                  </div>
                </div>
              </div>

              {/* Security Logs Activity */}
              <div className="glass-panel border border-brand-border/40 rounded-xl p-5 space-y-4">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider border-b border-brand-border/40 pb-2 flex items-center gap-1.5">
                  <Shield className="h-4 w-4 text-brand-green" />
                  Account Security Monitor (Simulated activity log)
                </h3>
                <div className="max-h-56 overflow-y-auto space-y-2.5 pr-2 font-mono text-[10px] text-brand-text-muted">
                  {logs.map(log => (
                    <div key={log.id} className="flex items-start gap-3 p-2 rounded bg-brand-dark/30 border border-brand-border/20">
                      <span className="text-[9px] text-brand-purple shrink-0 mt-0.5">[{new Date(log.timestamp).toLocaleTimeString()}]</span>
                      <div>
                        <span className="text-white font-bold">{log.action}: </span>
                        <span>{log.details}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

        </div>

      </div>

      {/* 3. Detailed Receipt Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-brand-dark/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-2xl border border-brand-border bg-brand-card p-6 shadow-2xl relative overflow-y-auto max-h-[90vh] space-y-5">
            <button 
              onClick={() => setSelectedOrder(null)}
              className="absolute right-4 top-4 p-1.5 rounded-full hover:bg-brand-border/40 text-brand-text-muted hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Header info */}
            <div>
              <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase border ${getStatusBadgeClass(selectedOrder.status)}`}>
                {selectedOrder.status}
              </span>
              <h3 className="text-md font-bold text-white mt-2">Receipt: {selectedOrder.id}</h3>
              <p className="text-[10px] text-brand-text-muted mt-0.5">
                Processed on: {new Date(selectedOrder.timestamp).toLocaleString()}
              </p>
            </div>

            {/* Address */}
            <div className="border-t border-brand-border/40 pt-4 text-xs">
              <h4 className="font-bold text-white uppercase tracking-wider text-[10px] mb-1.5">Shipping Address</h4>
              <p className="text-brand-text-muted">{selectedOrder.shippingAddress.name}</p>
              <p className="text-brand-text-muted leading-relaxed mt-0.5">
                {selectedOrder.shippingAddress.streetAddress}, {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} {selectedOrder.shippingAddress.postalCode}, {selectedOrder.shippingAddress.country}
              </p>
            </div>

            {/* Items grid */}
            <div className="border-t border-brand-border/40 pt-4 space-y-3">
              <h4 className="font-bold text-white uppercase tracking-wider text-[10px] mb-2">Purchased Items</h4>
              {selectedOrder.items.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center gap-3 text-xs text-brand-text-muted">
                  <span>{item.productName} (x{item.quantity})</span>
                  <span className="font-bold text-white">${(item.marketplacePriceUSD * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            {/* Financial summary details */}
            <div className="border-t border-brand-border/40 pt-4 space-y-2 text-xs text-brand-text-muted leading-relaxed font-mono">
              <div className="flex justify-between">
                <span>Paid SOL:</span>
                <span className="text-brand-green font-bold">{selectedOrder.paidSOL} SOL</span>
              </div>
              <div className="flex justify-between">
                <span>Received USDT (Swapped):</span>
                <span className="text-white font-bold">{selectedOrder.receivedUSDT} USDT</span>
              </div>
              <div className="flex justify-between">
                <span>Retail Price Settle (USD):</span>
                <span className="text-white font-semibold">${selectedOrder.retailPriceUSD.toFixed(2)}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-brand-border/20 text-[10px]">
                <span>SOL Transaction Hash:</span>
                <span className="truncate max-w-[150px] text-brand-purple font-semibold">{selectedOrder.txHash}</span>
              </div>
              {selectedOrder.swapTxHash && (
                <div className="flex justify-between text-[10px]">
                  <span>Jupiter Swap Hash:</span>
                  <span className="truncate max-w-[150px] text-brand-purple font-semibold">{selectedOrder.swapTxHash}</span>
                </div>
              )}
              {selectedOrder.trackingNumber && (
                <div className="flex justify-between pt-2 border-t border-brand-border/20 text-xs">
                  <span className="text-white font-bold">Courier Tracking:</span>
                  <span className="text-blue-400 font-semibold">{selectedOrder.trackingNumber} ({selectedOrder.carrier})</span>
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* 4. Refund Request Form Modal */}
      {showRefundModal && (
        <div className="fixed inset-0 z-50 bg-brand-dark/85 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleRequestRefund} className="w-full max-w-sm rounded-2xl border border-brand-border bg-brand-card p-6 shadow-2xl relative space-y-4">
            <button 
              type="button"
              onClick={() => setShowRefundModal(false)}
              className="absolute right-4 top-4 p-1.5 rounded-full hover:bg-brand-border text-brand-text-muted hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
            
            <div className="text-center">
              <RotateCcw className="h-8 w-8 text-red-400 mx-auto mb-2" />
              <h3 className="text-md font-bold text-white">Request Order Refund</h3>
              <p className="text-[10px] text-brand-text-muted leading-relaxed mt-1">
                Refunding order {refundOrderId}. Payment will be refunded back to the transaction signer wallet address in SOL.
              </p>
            </div>

            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-brand-text-muted">Reason for Refund</label>
              <textarea
                required
                rows={3}
                placeholder="e.g. Sourced item has sizing issues, retailer canceled..."
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
                className="w-full p-3 rounded-lg border border-brand-border bg-brand-dark/40 text-xs text-white placeholder-brand-text-muted/40 focus:outline-none focus:border-brand-purple/40"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-lg bg-red-500 hover:bg-red-600 text-xs font-bold text-white shadow-md transition-colors"
            >
              Submit Refund Request
            </button>
          </form>
        </div>
      )}

    </div>
  );
}
