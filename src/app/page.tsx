"use client";

import React from "react";
import Link from "next/link";
import { 
  ArrowRight, 
  Wallet, 
  RefreshCw, 
  ShieldCheck, 
  Cpu, 
  LineChart, 
  Truck, 
  ShoppingBag,
  ArrowRightCircle,
  Coins,
  CheckCircle2
} from "lucide-react";
import { useSolanaWallet } from "../context/SolanaWalletContext";

export default function Home() {
  const { connected, connect } = useSolanaWallet();

  const handleWalletCTA = () => {
    if (!connected) {
      connect("SOLCart Test Wallet"); // default to test wallet for easy trial
    }
  };

  const steps = [
    {
      icon: <ShoppingBag className="h-6 w-6 text-brand-purple" />,
      title: "Browse Products",
      desc: "Explore items from Amazon, Nike, Apple, Best Buy, and others."
    },
    {
      icon: <Wallet className="h-6 w-6 text-brand-green" />,
      title: "Pay with SOL",
      desc: "Connect your wallet and sign the secure payment transaction."
    },
    {
      icon: <RefreshCw className="h-6 w-6 text-indigo-400" />,
      title: "Swapped to USDT",
      desc: "Jupiter Protocol swaps your SOL to USDT instantly to settle funds."
    },
    {
      icon: <Cpu className="h-6 w-6 text-pink-500" />,
      title: "Order Purchased",
      desc: "Fulfillment agents automatically buy the items from the retailer."
    },
    {
      icon: <Truck className="h-6 w-6 text-blue-400" />,
      title: "Tracking Sent",
      desc: "Courier tracking number is sent to your email and dashboard."
    },
    {
      icon: <CheckCircle2 className="h-6 w-6 text-brand-green" />,
      title: "Delivered",
      desc: "Your packages arrive at your shipping address as normal."
    }
  ];

  return (
    <div className="flex flex-col w-full pb-20">
      
      {/* 1. Hero Section */}
      <section className="relative w-full py-20 md:py-32 overflow-hidden flex flex-col items-center text-center px-4 sm:px-6 lg:px-8">
        
        {/* Background glow animations */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-brand-purple/10 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute top-1/3 left-1/3 w-[300px] h-[300px] bg-brand-green/5 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="max-w-4xl mx-auto flex flex-col items-center relative z-10">
          
          {/* Announcement Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-brand-purple/20 bg-brand-purple/5 text-xs text-white mb-6">
            <span className="h-2 w-2 rounded-full bg-brand-green animate-pulse-slow"></span>
            <span className="font-semibold">Solana Mainnet & Devnet live</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-[1.1] text-white">
            Shop the World's Biggest <br className="hidden sm:inline" />
            Stores Using <span className="solana-gradient-text">Solana</span>.
          </h1>
          
          <p className="max-w-xl text-md sm:text-lg text-brand-text-muted mt-6 leading-relaxed">
            Pay with SOL. We handle the rest. Instantly swap to USDT and purchase goods from major stores with auto-fulfillment.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mt-10 w-full sm:w-auto justify-center">
            <Link
              href="/marketplace"
              className="flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-gradient-to-r from-brand-purple to-indigo-600 text-sm font-bold text-white shadow-xl shadow-brand-purple/10 hover:shadow-brand-purple/20 transition-all hover:scale-[1.02]"
            >
              Start Shopping
              <ArrowRight className="h-4 w-4" />
            </Link>

            {connected ? (
              <Link
                href="/dashboard"
                className="flex items-center justify-center gap-2 px-8 py-3.5 rounded-full border border-brand-border bg-brand-card/40 text-sm font-semibold text-white hover:border-brand-purple/30 transition-all"
              >
                Go to Dashboard
              </Link>
            ) : (
              <button
                onClick={handleWalletCTA}
                className="flex items-center justify-center gap-2 px-8 py-3.5 rounded-full border border-brand-border bg-brand-card/40 text-sm font-semibold text-white hover:border-brand-purple/30 transition-all"
              >
                <Wallet className="h-4 w-4 text-brand-green" />
                Connect Wallet
              </button>
            )}
          </div>
        </div>

        {/* Hero Product Cards Mock Mock Mock */}
        <div className="w-full max-w-5xl mx-auto mt-20 relative flex justify-center px-4">
          <div className="w-full h-44 sm:h-72 rounded-2xl glass-panel border border-brand-border/60 relative overflow-hidden flex items-center justify-center shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-t from-brand-dark via-brand-dark/40 to-transparent"></div>
            
            {/* Displaying floating stats / tags */}
            <div className="absolute top-6 left-6 right-6 flex flex-wrap gap-3 items-center justify-between z-10 text-xs">
              <span className="px-3 py-1 bg-brand-card/80 border border-brand-border/60 rounded-full font-mono text-brand-text-muted">
                jupiter-router-status: <span className="text-brand-green">100% active</span>
              </span>
              <span className="px-3 py-1 bg-brand-card/80 border border-brand-border/60 rounded-full font-mono text-brand-text-muted">
                oracle-feed: <span className="text-brand-purple">Jupiter Price API</span>
              </span>
            </div>

            <div className="z-10 text-center flex flex-col items-center max-w-lg px-6">
              <p className="text-xl sm:text-2xl font-bold text-white tracking-tight">Buy on Nike, Apple, Amazon seamlessly</p>
              <p className="text-xs text-brand-text-muted mt-2">
                No bank transfers. No cards. Just sign a transaction with SOL, and your packages ship within 24 hours.
              </p>
            </div>
            
            {/* Visual grids representing the networks */}
            <div className="absolute bottom-[-10px] w-full flex items-center justify-around opacity-20 pointer-events-none px-4">
              <div className="h-20 w-32 border border-dashed border-brand-purple rounded-lg"></div>
              <div className="h-20 w-32 border border-dashed border-brand-green rounded-lg"></div>
              <div className="h-20 w-32 border border-dashed border-brand-purple rounded-lg"></div>
            </div>
          </div>
        </div>

      </section>

      {/* 2. How It Works (Workflow Chart) */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">How It Works</h2>
          <p className="text-sm text-brand-text-muted mt-3">
            Behind the scenes, we manage the swap slippage and retailer settlement in seconds.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 relative">
          {steps.map((step, idx) => (
            <div key={idx} className="glass-card rounded-xl p-5 border border-brand-border/40 relative flex flex-col items-center text-center">
              
              {/* Arrow link logic */}
              {idx < steps.length - 1 && (
                <div className="hidden lg:block absolute right-[-15px] top-1/2 -translate-y-1/2 z-10 text-brand-border">
                  <ArrowRightCircle className="h-6 w-6 text-brand-purple/40" />
                </div>
              )}

              <div className="h-12 w-12 rounded-full bg-brand-dark border border-brand-border/60 flex items-center justify-center mb-4 shadow-inner">
                {step.icon}
              </div>
              <h3 className="text-xs font-bold text-white tracking-tight">{step.title}</h3>
              <p className="text-[10px] text-brand-text-muted mt-2 leading-relaxed">
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Features Section */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">Full Suite of Features</h2>
          <p className="text-sm text-brand-text-muted mt-3">
            Everything you expect from modern Web3 shopping, tailored for high-speed commerce.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          
          {/* Card 1: Pay using SOL */}
          <div className="glass-card rounded-2xl p-6 border border-brand-border/40">
            <div className="h-10 w-10 rounded-lg bg-brand-purple/10 border border-brand-purple/20 flex items-center justify-center mb-5">
              <Wallet className="h-5 w-5 text-brand-purple" />
            </div>
            <h3 className="text-md font-bold text-white tracking-tight">Pay using SOL</h3>
            <p className="text-xs text-brand-text-muted mt-3 leading-relaxed">
              Connect your browser wallet (Phantom, Solflare, Backpack) or use our simulated sandbox wallet. Purchase products using native SOL with single-click transactions.
            </p>
          </div>

          {/* Card 2: Instant Conversion to USDT */}
          <div className="glass-card rounded-2xl p-6 border border-brand-border/40">
            <div className="h-10 w-10 rounded-lg bg-brand-green/10 border border-brand-green/20 flex items-center justify-center mb-5">
              <RefreshCw className="h-5 w-5 text-brand-green" />
            </div>
            <h3 className="text-md font-bold text-white tracking-tight">Instant USDT Swaps</h3>
            <p className="text-xs text-brand-text-muted mt-3 leading-relaxed">
              All payment transactions are automatically routed through Jupiter Swap protocols. SOL is swapped to USDT immediately to shield settlements from market volatility.
            </p>
          </div>

          {/* Card 3: Secure Checkout */}
          <div className="glass-card rounded-2xl p-6 border border-brand-border/40">
            <div className="h-10 w-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-5">
              <ShieldCheck className="h-5 w-5 text-blue-400" />
            </div>
            <h3 className="text-md font-bold text-white tracking-tight">Non-Custodial Security</h3>
            <p className="text-xs text-brand-text-muted mt-3 leading-relaxed">
              We never hold your funds. You sign transactions directly from your wallet extension. All orders are logged transparently on-chain and in our secure log service.
            </p>
          </div>

          {/* Card 4: Automatic Order Fulfillment */}
          <div className="glass-card rounded-2xl p-6 border border-brand-border/40">
            <div className="h-10 w-10 rounded-lg bg-pink-500/10 border border-pink-500/20 flex items-center justify-center mb-5">
              <Cpu className="h-5 w-5 text-pink-400" />
            </div>
            <h3 className="text-md font-bold text-white tracking-tight">Automatic Fulfillment</h3>
            <p className="text-xs text-brand-text-muted mt-3 leading-relaxed">
              Once the Solana transaction confirms, our platform API communicates with retailer fulfillment protocols to buy items and direct them to your home address.
            </p>
          </div>

          {/* Card 5: Live Price Updates */}
          <div className="glass-card rounded-2xl p-6 border border-brand-border/40">
            <div className="h-10 w-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-5">
              <LineChart className="h-5 w-5 text-indigo-400" />
            </div>
            <h3 className="text-md font-bold text-white tracking-tight">Live Price Feeds</h3>
            <p className="text-xs text-brand-text-muted mt-3 leading-relaxed">
              Dynamic prices sync with Jupiter Price API nodes. The conversion from USD to SOL is automatically refreshed in the shopping cart and checkout screens.
            </p>
          </div>

          {/* Card 6: Order Tracking */}
          <div className="glass-card rounded-2xl p-6 border border-brand-border/40">
            <div className="h-10 w-10 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center mb-5">
              <Truck className="h-5 w-5 text-orange-400" />
            </div>
            <h3 className="text-md font-bold text-white tracking-tight">Full Tracking & Refunds</h3>
            <p className="text-xs text-brand-text-muted mt-3 leading-relaxed">
              Monitor your order lifecycle from the customer dashboard. Retrieve courier tracking numbers, shipping statuses, and submit refund requests easily.
            </p>
          </div>

        </div>
      </section>

      {/* 4. Bottom Call-To-Action */}
      <section className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 mt-16">
        <div className="rounded-3xl border border-brand-border/60 bg-gradient-to-tr from-brand-card to-indigo-950/20 p-8 sm:p-12 relative overflow-hidden flex flex-col items-center text-center shadow-2xl">
          <div className="absolute bottom-0 right-0 w-[300px] h-[300px] bg-brand-purple/5 rounded-full blur-[100px] pointer-events-none"></div>
          
          <h2 className="text-xl sm:text-3xl font-extrabold text-white">Spend Your SOL at Major Online Retailers</h2>
          <p className="text-xs sm:text-sm text-brand-text-muted mt-4 max-w-xl leading-relaxed">
            Ready to experience decentralized e-commerce? Start exploring our catalog of electronics, computers, active apparel, and household items.
          </p>
          
          <div className="mt-8">
            <Link
              href="/marketplace"
              className="inline-flex items-center gap-2 px-8 py-3 rounded-full bg-white text-brand-dark text-xs font-bold shadow-lg hover:bg-zinc-100 hover:scale-[1.02] transition-all"
            >
              Browse Catalog
              <ArrowRight className="h-4 w-4 text-brand-dark" />
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
