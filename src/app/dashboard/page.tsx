"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  ShoppingBag, 
  Coins, 
  Settings, 
  Wallet,
  ArrowRight,
  LogOut,
  Info,
  Clock,
  ExternalLink,
  Shield,
  Activity,
  CheckCircle,
  Copy,
  X
} from "lucide-react";
import { useSolanaWallet } from "../../context/SolanaWalletContext";
import { SupabaseService } from "../../services/supabase";
import { APP_VERSION } from "../../lib/version";
import { Order, Transaction, ActivityLog } from "../../types";

export default function CustomerDashboard() {
  const { connected, walletAddress, balance, connect, disconnect, networkStatus } = useSolanaWallet();
  const [activeTab, setActiveTab] = useState<"orders" | "transactions" | "settings">("orders");
  const [orders, setOrders] = useState<Order[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Sync data from Server
  const refreshData = async () => {
    if (!connected || !walletAddress) return;
    try {
      await SupabaseService.syncWithServer();
      const allOrders = SupabaseService.getOrders();
      const filteredOrders = allOrders.filter(
        o => o.walletAddress.toLowerCase() === walletAddress.toLowerCase()
      );
      setOrders(filteredOrders);

      const allTxs = SupabaseService.getTransactions();
      const filteredTxs = allTxs.filter(
        t => t.walletAddress.toLowerCase() === walletAddress.toLowerCase()
      );
      setTransactions(filteredTxs);

      const allLogs = SupabaseService.getActivityLogs();
      const filteredLogs = allLogs.filter(
        l => l.userId === walletAddress || (l.details && l.details.toLowerCase().includes(walletAddress.toLowerCase()))
      );
      setLogs(filteredLogs);
    } catch (e) {
      console.warn("Dashboard sync failed", e);
    }
  };

  useEffect(() => {
    refreshData();
  }, [walletAddress, connected]);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  };

  // If wallet is not connected, show premium Connect CTA
  if (!connected || !walletAddress) {
    return (
      <div className="mx-auto max-w-md px-6 py-28 flex flex-col items-center justify-center text-center">
        <div className="h-16 w-16 rounded-2xl bg-brand-purple/10 border border-brand-purple/20 flex items-center justify-center text-brand-purple mb-6 shadow-lg shadow-brand-purple/5">
          <Wallet className="h-8 w-8" />
        </div>
        <h2 className="text-2xl font-black text-white tracking-tight">Customer Dashboard</h2>
        <p className="text-xs text-brand-text-muted mt-3 mb-8 leading-relaxed max-w-sm">
          Connect your Solana wallet to access your order history, view purchased gift card codes, and audit transactions.
        </p>

        <button
          onClick={() => connect()}
          className="px-8 py-3.5 bg-gradient-to-r from-brand-purple to-indigo-600 hover:scale-[1.01] rounded-xl text-xs font-bold text-white shadow-xl shadow-brand-purple/20 flex items-center gap-2 transition-all"
        >
          <Wallet className="h-4.5 w-4.5" />
          Connect Solana Wallet
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 w-full relative font-sans">
      
      {/* 1. Header Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 items-start">
        
        {/* User Card */}
        <div className="md:col-span-2 glass-panel rounded-2xl p-5 border border-brand-border/40 flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-gradient-to-tr from-brand-purple to-brand-green p-0.5 shadow-md">
            <div className="h-full w-full bg-brand-dark rounded-full flex items-center justify-center font-black text-white text-sm">
              W
            </div>
          </div>
          <div className="min-w-0">
            <h2 className="text-md font-bold text-white flex items-center gap-1.5 truncate">
              Wallet Account
              <span className="px-2 py-0.5 rounded text-[8px] bg-brand-purple/10 text-brand-purple border border-brand-purple/20 font-bold uppercase shrink-0">
                Customer
              </span>
            </h2>
            <p className="text-[10px] text-brand-text-muted mt-1 font-mono truncate select-all">{walletAddress}</p>
          </div>
        </div>

        {/* Quick Wallet Stats */}
        <div className="glass-panel rounded-2xl p-5 border border-brand-border/40 space-y-3">
          <div className="flex justify-between items-center text-xs">
            <span className="text-brand-text-muted flex items-center gap-1.5 font-bold">
              <Shield className="h-4 w-4 text-brand-green" />
              Status:
            </span>
            <span className="text-brand-green font-extrabold flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-green animate-pulse"></span>
              Connected
            </span>
          </div>
          <div className="flex justify-between items-center text-xs pt-2 border-t border-brand-border/20">
            <span className="text-brand-text-muted">On-Chain Balance:</span>
            <span className="text-white font-extrabold">{balance.toFixed(4)} SOL</span>
          </div>
        </div>

      </div>

      {/* 2. Side-By-Side Layout (Menu Left, Panels Right) */}
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        
        {/* Navigation Sidebar */}
        <nav className="w-full lg:w-56 shrink-0 flex lg:flex-col gap-1 overflow-x-auto pb-2 lg:pb-0">
          {[
            { id: "orders", label: "Order History", icon: <ShoppingBag className="h-4 w-4" /> },
            { id: "transactions", label: "Transactions Log", icon: <Coins className="h-4 w-4" /> },
            { id: "settings", label: "Account Security", icon: <Settings className="h-4 w-4" /> }
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
            onClick={disconnect}
            className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs font-semibold text-red-400 hover:bg-red-500/5 hover:text-red-300 border border-transparent transition-all mt-auto pt-4 lg:pt-2.5"
          >
            <LogOut className="h-4 w-4" />
            <span>Disconnect</span>
          </button>
        </nav>

        {/* Dynamic Panels */}
        <div className="flex-1 w-full min-w-0">
          
          {/* ORDERS TAB */}
          {activeTab === "orders" && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Purchase History</h3>
              
              {orders.length === 0 ? (
                <div className="glass-panel border border-brand-border/40 rounded-2xl p-10 text-center">
                  <ShoppingBag className="h-8 w-8 text-brand-text-muted mx-auto mb-4" />
                  <p className="text-xs text-brand-text-muted">No orders found for this wallet address.</p>
                  <Link href="/marketplace" className="text-xs text-brand-purple font-bold hover:underline mt-4 inline-block">
                    Browse Gift Cards
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {orders.map(o => (
                    <div 
                      key={o.id} 
                      onClick={() => setSelectedOrder(o)}
                      className="glass-panel border border-brand-border/40 hover:border-brand-purple/40 rounded-2xl p-5 cursor-pointer transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
                    >
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-xs text-white">{o.id}</span>
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                            o.status === "delivered" ? "bg-brand-green/10 text-brand-green border border-brand-green/20" : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                          }`}>
                            {o.status}
                          </span>
                        </div>
                        <p className="text-[10px] text-brand-text-muted">
                          Placed on: {new Date(o.timestamp).toLocaleString()}
                        </p>
                        <p className="text-xs text-white font-semibold truncate max-w-[200px] sm:max-w-sm">
                          {o.items.map(it => `${it.productName} (x${it.quantity})`).join(", ")}
                        </p>
                      </div>

                      <div className="text-right shrink-0">
                        <p className="font-black text-white text-sm">${o.retailPriceUSD.toFixed(2)}</p>
                        <p className="text-[10px] text-brand-green font-mono font-bold">{o.paidSOL.toFixed(4)} SOL</p>
                        {o.giftCardCode && (
                          <span className="inline-block mt-1 text-[9px] px-2 py-0.5 bg-brand-purple/10 border border-brand-purple/20 text-brand-purple font-black tracking-widest uppercase rounded">
                            Code Loaded
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TRANSACTIONS TAB */}
          {activeTab === "transactions" && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">On-Chain Payments Log</h3>
              
              {transactions.length === 0 ? (
                <div className="glass-panel border border-brand-border/40 rounded-2xl p-10 text-center">
                  <Coins className="h-8 w-8 text-brand-text-muted mx-auto mb-4" />
                  <p className="text-xs text-brand-text-muted">No transactions logged for this wallet.</p>
                </div>
              ) : (
                <div className="rounded-2xl border border-brand-border/40 overflow-hidden bg-brand-card/10">
                  <table className="w-full text-left text-xs font-sans">
                    <thead className="bg-brand-dark/80 text-brand-text-muted border-b border-brand-border/40 font-bold uppercase text-[9px] tracking-wider">
                      <tr>
                        <th className="p-4">Tx ID</th>
                        <th className="p-4">Type</th>
                        <th className="p-4">Amount</th>
                        <th className="p-4">Asset</th>
                        <th className="p-4">Status</th>
                        <th className="p-4 text-right">Signature Hash</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-brand-border/30 font-mono text-[11px] text-brand-text-muted">
                      {transactions.map(tx => (
                        <tr key={tx.id} className="hover:bg-brand-card/20 transition-all">
                          <td className="p-4 text-white font-bold">{tx.id}</td>
                          <td className="p-4 capitalize font-sans text-white">{tx.type}</td>
                          <td className="p-4 text-white font-bold">{tx.amount.toFixed(4)}</td>
                          <td className="p-4 font-bold text-brand-purple">{tx.token}</td>
                          <td className="p-4 font-sans">
                            <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase bg-brand-green/10 text-brand-green border border-brand-green/20">
                              {tx.status}
                            </span>
                          </td>
                          <td className="p-4 text-right truncate max-w-[140px] text-[10px]" title={tx.txHash}>
                            <a 
                              href={`https://explorer.solana.com/tx/${tx.txHash}?cluster=devnet`} 
                              target="_blank" 
                              rel="noreferrer"
                              className="hover:text-brand-purple inline-flex items-center gap-1"
                            >
                              {tx.txHash.slice(0, 8)}...{tx.txHash.slice(-8)}
                              <ExternalLink className="h-3 w-3 shrink-0" />
                            </a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* SETTINGS TAB */}
          {activeTab === "settings" && (
            <div className="space-y-6">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Account Activity & Security</h3>
              
              <div className="glass-panel border border-brand-border/40 rounded-2xl p-5 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 bg-brand-purple/10 border border-brand-purple/20 rounded-xl flex items-center justify-center text-brand-purple">
                    <Shield className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-extrabold text-white">Cryptographic Node Address</h4>
                    <p className="text-[10px] text-brand-text-muted mt-0.5">Your primary identity key used to track digital purchases.</p>
                  </div>
                </div>

                <div className="flex gap-2 p-3 bg-brand-dark/40 border border-brand-border/60 rounded-xl font-mono text-[10px] text-white">
                  <span className="truncate flex-1 select-all">{walletAddress}</span>
                  <button 
                    onClick={() => handleCopy(walletAddress, "wallet")}
                    className="text-brand-text-muted hover:text-white transition-colors"
                  >
                    {copiedText === "wallet" ? <CheckCircle className="h-4 w-4 text-brand-green" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Account Security Monitor */}
              <div className="glass-panel border border-brand-border/40 rounded-2xl p-5 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center justify-center text-amber-500">
                    <Activity className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-extrabold text-white">Account Security Monitor</h4>
                    <p className="text-[10px] text-brand-text-muted mt-0.5">Recent authentication history, on-chain activities, and connection events.</p>
                  </div>
                </div>

                <div className="rounded-xl border border-brand-border/40 overflow-hidden bg-brand-dark/20 text-[10px] font-sans">
                  <div className="grid grid-cols-3 bg-brand-dark/60 text-brand-text-muted p-3 font-bold border-b border-brand-border/40">
                    <span>Action / Event</span>
                    <span>Details</span>
                    <span className="text-right">Timestamp</span>
                  </div>
                  <div className="divide-y divide-brand-border/30 max-h-56 overflow-y-auto">
                    {logs.length === 0 ? (
                      <div className="p-4 text-center text-brand-text-muted">
                        No security activity logged.
                      </div>
                    ) : (
                      logs.map(log => (
                        <div key={log.id} className="grid grid-cols-3 p-3 text-brand-text-muted hover:bg-brand-card/15 transition-all">
                          <span className="font-bold text-white">{log.action}</span>
                          <span className="truncate pr-2">{log.details}</span>
                          <span className="text-right text-[9px] font-mono">{new Date(log.timestamp).toLocaleString()}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* DETAILED ORDER MODAL */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-dark/85 backdrop-blur-md">
          <div className="w-full max-w-lg rounded-2xl border border-brand-border bg-brand-card p-6 shadow-2xl relative space-y-6 font-sans">
            <button 
              onClick={() => setSelectedOrder(null)}
              className="absolute right-4 top-4 p-1.5 rounded-full hover:bg-brand-border/40 text-brand-text-muted hover:text-white transition-colors"
            >
              <X className="h-4 w-4" />
            </button>

            <div>
              <h3 className="text-sm font-black text-white uppercase tracking-wider">Order Receipt</h3>
              <p className="text-[10px] text-brand-text-muted mt-1">ID: {selectedOrder.id}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <p className="text-brand-text-muted uppercase text-[9px]">Recipient</p>
                <p className="font-bold text-white mt-0.5">{selectedOrder.customerDetails.name}</p>
                <p className="text-[10px] text-brand-text-muted mt-0.5">{selectedOrder.customerDetails.email}</p>
              </div>
              <div>
                <p className="text-brand-text-muted uppercase text-[9px]">Delivery Region</p>
                <p className="font-bold text-white mt-0.5">{selectedOrder.shippingAddress?.country || "Global"}</p>
              </div>
            </div>

            <div className="border-t border-brand-border/40 pt-4 space-y-3">
              <p className="text-brand-text-muted uppercase text-[9px] font-bold">Purchased Items</p>
              <div className="space-y-2">
                {selectedOrder.items.map((it, idx) => (
                  <div key={idx} className="flex justify-between items-center text-xs text-white">
                    <span>{it.productName} (x{it.quantity})</span>
                    <span className="font-bold">${(it.marketplacePriceUSD * it.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>

            {selectedOrder.giftCardCode && (
              <div className="p-4 bg-brand-purple/10 border border-brand-purple/30 rounded-xl space-y-2 text-center">
                <p className="text-[10px] font-bold text-brand-purple uppercase tracking-widest">Digital Gift Card Code</p>
                <p className="text-md font-mono font-black text-white tracking-widest select-all select-none">
                  {selectedOrder.giftCardCode}
                </p>
                <button 
                  onClick={() => handleCopy(selectedOrder.giftCardCode!, "gc-code")}
                  className="px-3 py-1 bg-brand-purple/20 hover:bg-brand-purple/35 text-[9px] font-bold text-brand-purple rounded transition-all inline-flex items-center gap-1"
                >
                  {copiedText === "gc-code" ? <CheckCircle className="h-3 w-3 text-brand-green" /> : <Copy className="h-3 w-3" />}
                  Copy Code
                </button>
              </div>
            )}

            <div className="border-t border-brand-border/40 pt-4 flex justify-between items-center text-xs">
              <div>
                <p className="text-brand-text-muted">SOL Signature</p>
                <p className="font-mono text-[9px] text-brand-text-muted truncate max-w-[150px]" title={selectedOrder.txHash}>
                  {selectedOrder.txHash}
                </p>
              </div>
              <div className="text-right">
                <p className="font-black text-white text-base">${selectedOrder.retailPriceUSD.toFixed(2)}</p>
                <p className="text-[10px] text-brand-green font-mono font-bold">{selectedOrder.paidSOL.toFixed(4)} SOL</p>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
