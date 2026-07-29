"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  ArrowRight, 
  Wallet, 
  RefreshCw, 
  ShieldCheck, 
  Gift,
  Mail,
  Globe,
  Zap,
  Cpu,
  Lock,
  ArrowRightCircle,
  CheckCircle2,
  Sparkles
} from "lucide-react";
import { useSolanaWallet } from "../context/SolanaWalletContext";

export default function Home() {
  const { connected, connect } = useSolanaWallet();
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  const handleWalletCTA = () => {
    if (!connected) {
      connect();
    }
  };

  const steps = [
    {
      icon: <Globe className="h-5 w-5 text-brand-purple" />,
      title: "Select Country & Brand",
      desc: "Choose from major retailers and specify your redemption country."
    },
    {
      icon: <Wallet className="h-5 w-5 text-brand-green" />,
      title: "Connect & Pay SOL",
      desc: "Connect your Phantom, Solflare, or Backpack wallet to pay in SOL."
    },
    {
      icon: <RefreshCw className="h-5 w-5 text-indigo-400" />,
      title: "Jupiter USDC Swap",
      desc: "Jupiter Protocol swaps SOL to USDC instantly to settle merchant funds."
    },
    {
      icon: <Cpu className="h-5 w-5 text-pink-500" />,
      title: "Code Claimed",
      desc: "Fulfillment agents instantly retrieve the digital gift card code."
    },
    {
      icon: <Mail className="h-5 w-5 text-blue-400" />,
      title: "Email Dispatch",
      desc: "Your digital code is emailed to you along with the HTML invoice."
    },
    {
      icon: <CheckCircle2 className="h-5 w-5 text-brand-green" />,
      title: "Instant Redeem",
      desc: "Reveal your gift card code in your dashboard and start shopping."
    }
  ];

  const mockGiftCards = [
    {
      id: 1,
      brand: "Amazon",
      color: "from-amber-500 to-orange-600",
      value: "$50",
      description: "Shop millions of items worldwide.",
      logoText: "Amazon"
    },
    {
      id: 2,
      brand: "Steam",
      color: "from-blue-600 to-cyan-700",
      value: "$25",
      description: "Access thousands of PC games instantly.",
      logoText: "STEAM"
    },
    {
      id: 3,
      brand: "Apple",
      color: "from-zinc-700 to-zinc-900",
      value: "$100",
      description: "Buy apps, music, storage, and devices.",
      logoText: "Apple"
    },
    {
      id: 4,
      brand: "PlayStation",
      color: "from-indigo-600 to-blue-800",
      value: "$50",
      description: "Download games and multiplayer add-ons.",
      logoText: "PSN"
    }
  ];

  return (
    <div className="flex flex-col w-full pb-20 overflow-x-hidden">
      
      {/* 1. Hero Section */}
      <section className="relative w-full py-20 md:py-28 overflow-hidden flex flex-col items-center text-center px-4 sm:px-6 lg:px-8">
        
        {/* Background glow animations */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-purple/10 rounded-full blur-[140px] pointer-events-none"></div>
        <div className="absolute top-1/3 left-1/3 w-[300px] h-[300px] bg-brand-green/5 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="max-w-4xl mx-auto flex flex-col items-center relative z-10">
          
          {/* Announcement Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-brand-purple/20 bg-brand-purple/5 text-xs text-white mb-6 animate-fade-in">
            <span className="h-2 w-2 rounded-full bg-brand-green animate-pulse-slow"></span>
            <span className="font-semibold text-[11px] uppercase tracking-wider text-brand-text-muted">Fast Digital Gift Card Delivery</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-[1.1] text-white">
            Buy Global Gift Cards <br className="hidden sm:inline" />
            Instantly with <span className="solana-gradient-text">Solana</span>.
          </h1>
          
          <p className="max-w-2xl text-md sm:text-lg text-brand-text-muted mt-6 leading-relaxed">
            Spend your SOL directly on digital gift cards from top brands worldwide.
            No credit cards, no bank transfers. Fast on-chain swaps with instant delivery.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mt-10 w-full sm:w-auto justify-center">
            <Link
              href="/marketplace"
              className="flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-gradient-to-r from-brand-purple to-indigo-600 text-sm font-bold text-white shadow-xl shadow-brand-purple/10 hover:shadow-brand-purple/20 transition-all hover:scale-[1.02]"
            >
              Browse Gift Cards
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

        {/* Hero Interactive Gift Cards Grid */}
        <div className="w-full max-w-5xl mx-auto mt-16 px-4 z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {mockGiftCards.map((card, idx) => (
              <div
                key={card.id}
                onMouseEnter={() => setHoveredCard(idx)}
                onMouseLeave={() => setHoveredCard(null)}
                className={`relative rounded-2xl p-5 border border-brand-border/60 bg-brand-card/30 backdrop-blur-md overflow-hidden transition-all duration-500 cursor-pointer h-48 flex flex-col justify-between shadow-lg ${
                  hoveredCard === idx ? 'border-brand-purple/80 scale-[1.05] shadow-brand-purple/15' : 'hover:border-brand-border'
                }`}
              >
                {/* Glowing element inside the card */}
                <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${card.color} opacity-20 rounded-full blur-2xl transition-all duration-500 ${
                  hoveredCard === idx ? 'scale-150 opacity-40' : ''
                }`}></div>

                {/* Card Top */}
                <div className="flex justify-between items-start">
                  <div className="flex flex-col items-start">
                    <span className="text-[10px] font-bold text-brand-text-muted uppercase tracking-widest">Digital Code</span>
                    <span className="text-sm font-black text-white mt-0.5">{card.brand}</span>
                  </div>
                  <div className={`px-2.5 py-1 rounded bg-gradient-to-r ${card.color} text-[10px] font-black text-white`}>
                    {card.value}
                  </div>
                </div>

                {/* Card Mid: Visual Sim */}
                <div className="h-10 w-full rounded bg-brand-dark/40 border border-brand-border/40 relative flex items-center justify-center overflow-hidden">
                  <div className="absolute left-3 w-5 h-4 bg-yellow-600/30 rounded border border-yellow-600/50"></div> {/* Chip mock */}
                  <span className="font-mono text-[9px] text-brand-text-muted tracking-[0.2em] ml-8 select-none">•••• •••• •••• {card.brand.slice(0, 4).toUpperCase()}</span>
                </div>

                {/* Card Bottom */}
                <div className="flex justify-between items-center text-[10px]">
                  <span className="text-brand-text-muted">{card.description}</span>
                  <Sparkles className={`h-3.5 w-3.5 text-brand-purple transition-all ${hoveredCard === idx ? 'rotate-12 scale-125' : 'opacity-40'}`} />
                </div>
              </div>
            ))}
          </div>
        </div>

      </section>

      {/* 2. How It Works (Workflow Chart) */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">How it Works</h2>
          <p className="text-sm text-brand-text-muted mt-3">
            Settle payments in SOL. Receive your digital gift card codes in seconds with seamless Jupiter conversions.
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

              <div className="h-10 w-10 rounded-full bg-brand-dark border border-brand-border/60 flex items-center justify-center mb-4 shadow-inner">
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
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">Engineered for Web3 Shopping</h2>
          <p className="text-sm text-brand-text-muted mt-3">
            Secure, non-custodial checkout built directly on the fastest blockchain in the world.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          
          {/* Card 1: Pay using SOL */}
          <div className="glass-card rounded-2xl p-6 border border-brand-border/40 bg-brand-card/10">
            <div className="h-10 w-10 rounded-lg bg-brand-purple/10 border border-brand-purple/20 flex items-center justify-center mb-5">
              <Wallet className="h-5 w-5 text-brand-purple" />
            </div>
            <h3 className="text-md font-bold text-white tracking-tight">Pay with SOL</h3>
            <p className="text-xs text-brand-text-muted mt-3 leading-relaxed">
              Connect your browser wallet (Phantom, Solflare, Backpack) or use our simulated sandbox wallet. Buy global cards using native SOL in a single transaction.
            </p>
          </div>

          {/* Card 2: Instant Conversion to USDC */}
          <div className="glass-card rounded-2xl p-6 border border-brand-border/40 bg-brand-card/10">
            <div className="h-10 w-10 rounded-lg bg-brand-green/10 border border-brand-green/20 flex items-center justify-center mb-5">
              <RefreshCw className="h-5 w-5 text-brand-green" />
            </div>
            <h3 className="text-md font-bold text-white tracking-tight">Instant USDC Swaps</h3>
            <p className="text-xs text-brand-text-muted mt-3 leading-relaxed">
              All payment transactions are automatically routed through Jupiter Swap protocols. SOL is swapped to USDC immediately to shield settlements from market volatility.
            </p>
          </div>

          {/* Card 3: Non-Custodial Security */}
          <div className="glass-card rounded-2xl p-6 border border-brand-border/40 bg-brand-card/10">
            <div className="h-10 w-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-5">
              <ShieldCheck className="h-5 w-5 text-blue-400" />
            </div>
            <h3 className="text-md font-bold text-white tracking-tight">Non-Custodial Security</h3>
            <p className="text-xs text-brand-text-muted mt-3 leading-relaxed">
              We never hold your funds. You sign transactions directly from your wallet extension. All orders are logged transparently on-chain and in our secure database.
            </p>
          </div>

          {/* Card 4: Instant Digital Code Delivery */}
          <div className="glass-card rounded-2xl p-6 border border-brand-border/40 bg-brand-card/10">
            <div className="h-10 w-10 rounded-lg bg-pink-500/10 border border-pink-500/20 flex items-center justify-center mb-5">
              <Zap className="h-5 w-5 text-pink-400" />
            </div>
            <h3 className="text-md font-bold text-white tracking-tight">Instant Digital Delivery</h3>
            <p className="text-xs text-brand-text-muted mt-3 leading-relaxed">
              No physical addresses needed. Once the Solana transaction is confirmed, your digital code is emailed to you instantly and shown on your user dashboard.
            </p>
          </div>

          {/* Card 5: Region & Country Selector */}
          <div className="glass-card rounded-2xl p-6 border border-brand-border/40 bg-brand-card/10">
            <div className="h-10 w-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-5">
              <Globe className="h-5 w-5 text-indigo-400" />
            </div>
            <h3 className="text-md font-bold text-white tracking-tight">Global Store Support</h3>
            <p className="text-xs text-brand-text-muted mt-3 leading-relaxed">
              We support gift cards from different stores across the world. A simple checkout country option ensures you receive the correct regional code to redeem.
            </p>
          </div>

          {/* Card 6: Zero Platform Markups */}
          <div className="glass-card rounded-2xl p-6 border border-brand-border/40 bg-brand-card/10">
            <div className="h-10 w-10 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center mb-5">
              <Lock className="h-5 w-5 text-orange-400" />
            </div>
            <h3 className="text-md font-bold text-white tracking-tight">Zero Flat Platform Markup</h3>
            <p className="text-xs text-brand-text-muted mt-3 leading-relaxed">
              Our admin panel is pre-configured with a 0% marketplace default markup and flat platform tax rate. Spend SOL at direct face value.
            </p>
          </div>

        </div>
      </section>

      {/* 4. Bottom Call-To-Action */}
      <section className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 mt-12">
        <div className="rounded-3xl border border-brand-border/60 bg-gradient-to-tr from-brand-card to-indigo-950/20 p-8 sm:p-12 relative overflow-hidden flex flex-col items-center text-center shadow-2xl">
          <div className="absolute bottom-0 right-0 w-[300px] h-[300px] bg-brand-purple/5 rounded-full blur-[100px] pointer-events-none"></div>
          
          <Gift className="h-12 w-12 text-brand-purple mb-4 animate-bounce" />
          <h2 className="text-xl sm:text-3xl font-extrabold text-white">Spend Your SOL on Premium Gift Cards</h2>
          <p className="text-xs sm:text-sm text-brand-text-muted mt-4 max-w-xl leading-relaxed">
            Ready to experience frictionless shopping? Browse our marketplace, select your cards, and pay securely using Solana.
          </p>
          
          <div className="mt-8">
            <Link
              href="/marketplace"
              className="inline-flex items-center gap-2 px-8 py-3 rounded-full bg-white text-brand-dark text-xs font-bold shadow-lg hover:bg-zinc-100 hover:scale-[1.02] transition-all"
            >
              Start Shopping
              <ArrowRight className="h-4 w-4 text-brand-dark" />
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
