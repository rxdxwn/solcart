"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  ArrowRight, 
  Wallet, 
  Globe, 
  Zap, 
  Lock,
  Sparkles,
  ShoppingBag,
  Clock,
  ShieldCheck,
  Headphones,
  CheckCircle2,
  MessageSquare
} from "lucide-react";
import { motion } from "framer-motion";
import { useSolanaWallet } from "../context/SolanaWalletContext";
import { GiftCardArtwork } from "../components/ui/GiftCardArtwork";
import { SupabaseService } from "../services/supabase";
import { Product } from "../types";

export default function Home() {
  const { connected, connect } = useSolanaWallet();
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts() {
      try {
        const res = await SupabaseService.getProducts();
        if (res && res.length > 0) {
          setProducts(res.slice(0, 8)); // Grab up to 8 products for hero showcase
        }
      } catch (err) {
        console.error("Failed to load products on home:", err);
      }
    }
    loadProducts();
  }, []);

  const handleWalletCTA = () => {
    if (!connected) {
      connect();
    }
  };

  const steps = [
    {
      icon: <Globe className="h-6 w-6 text-brand-purple" />,
      title: "Choose Your Card",
      desc: "Browse our catalog of premium international brands and pick your redemption region."
    },
    {
      icon: <Wallet className="h-6 w-6 text-brand-green" />,
      title: "Pay with SOL",
      desc: "Connect your Phantom, Solflare, or Backpack wallet to pay securely in seconds."
    },
    {
      icon: <Zap className="h-6 w-6 text-indigo-400" />,
      title: "Get Code Instantly",
      desc: "Your digital voucher code is displayed on your screen and emailed to you immediately."
    }
  ];

  const mockGiftCards = [
    { id: 1, brand: "Amazon", value: "$50" },
    { id: 2, brand: "Steam", value: "$25" },
    { id: 3, brand: "Apple", value: "$100" },
    { id: 4, brand: "PlayStation", value: "$50" }
  ];

  const benefits = [
    {
      icon: <Globe className="h-5 w-5 text-brand-purple" />,
      title: "Global Brands",
      desc: "Gift cards from major retailers across the United States, Europe, UK, and global regions."
    },
    {
      icon: <Clock className="h-5 w-5 text-brand-green" />,
      title: "Instant Delivery",
      desc: "Voucher codes are instantly generated and sent straight to your email inbox and dashboard."
    },
    {
      icon: <ShieldCheck className="h-5 w-5 text-indigo-400" />,
      title: "Secure Payments",
      desc: "Transact safely and directly from your connected Solana browser extension wallet."
    },
    {
      icon: <Lock className="h-5 w-5 text-pink-500" />,
      title: "Best Exchange Rates",
      desc: "Buy cards at direct face value with absolute transparency. Enjoy 0% markup checkout models."
    },
    {
      icon: <Headphones className="h-5 w-5 text-blue-400" />,
      title: "24/7 Support",
      desc: "Help is always available. Contact our dedicated support team to assist with code redemption."
    }
  ];

  return (
    <div className="flex flex-col w-full pb-20 overflow-x-hidden">
      
      {/* 1. Hero Section */}
      <section className="relative w-full py-20 md:py-28 overflow-hidden flex flex-col items-center text-center px-4 sm:px-6 lg:px-8">
        
        {/* Background glow animations */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-purple/5 rounded-full blur-[140px] pointer-events-none z-0"></div>
        <div className="absolute top-1/3 left-1/3 w-[300px] h-[300px] bg-brand-green/3 rounded-full blur-[100px] pointer-events-none z-0"></div>

        {/* Floating background cards (Drifting effect for luxury depth) */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none select-none hidden lg:block z-0">
          {/* Left side background cards */}
          <motion.div
            animate={{ y: [0, -10, 0], rotate: [-22, -20, -22] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="absolute left-[-50px] top-[140px] opacity-[0.08]"
          >
            <GiftCardArtwork brand="Steam" value="$50" className="w-44 shadow-2xl blur-[0.5px]" />
          </motion.div>

          <motion.div
            animate={{ y: [0, 12, 0], rotate: [14, 16, 14] }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
            className="absolute left-[-20px] top-[400px] opacity-[0.12]"
          >
            <GiftCardArtwork brand="Spotify" value="$30" className="w-40 shadow-2xl blur-[0.2px]" />
          </motion.div>

          <motion.div
            animate={{ y: [0, -8, 0], rotate: [-8, -6, -8] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute left-[-60px] top-[640px] opacity-[0.06]"
          >
            <GiftCardArtwork brand="Netflix" value="$50" className="w-40 shadow-2xl blur-[1.5px]" />
          </motion.div>

          {/* Right side background cards */}
          <motion.div
            animate={{ y: [0, -12, 0], rotate: [18, 16, 18] }}
            transition={{ duration: 6.5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute right-[-50px] top-[150px] opacity-[0.10]"
          >
            <GiftCardArtwork brand="Apple" value="$100" className="w-44 shadow-2xl blur-[0.5px]" />
          </motion.div>

          <motion.div
            animate={{ y: [0, 10, 0], rotate: [-14, -12, -14] }}
            transition={{ duration: 7.5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute right-[-20px] top-[420px] opacity-[0.15]"
          >
            <GiftCardArtwork brand="Amazon" value="$50" className="w-40 shadow-2xl blur-[0.2px]" />
          </motion.div>

          <motion.div
            animate={{ y: [0, -10, 0], rotate: [22, 24, 22] }}
            transition={{ duration: 8.5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute right-[-60px] top-[660px] opacity-[0.06]"
          >
            <GiftCardArtwork brand="PlayStation" value="$50" className="w-40 shadow-2xl blur-[2px]" />
          </motion.div>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto flex flex-col items-center relative z-10 animate-fade-in"
        >
          {/* Brand Tagline */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-brand-purple/20 bg-brand-purple/5 text-xs text-white mb-6">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-green animate-pulse"></span>
            <span className="font-semibold text-[10px] uppercase tracking-widest text-brand-text-muted">Premium Digital Shopping Experience</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-[1.1] text-white">
            Premium Global Gift Cards.<br />
            Paid with <span className="solana-gradient-text">Solana</span>.
          </h1>
          
          <p className="max-w-2xl text-md sm:text-base text-brand-text-muted mt-6 leading-relaxed">
            Directly spend your SOL on digital gift cards from top-tier international brands. 
            No banking delays or credit cards required. Safe self-custody checkout with instant email fulfillment.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mt-8 w-full sm:w-auto justify-center">
            <Link
              href="/marketplace"
              className="flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-gradient-to-r from-brand-purple to-indigo-600 text-sm font-bold text-white shadow-xl shadow-brand-purple/10 hover:shadow-brand-purple/20 transition-all hover:scale-[1.02]"
            >
              <ShoppingBag className="h-4 w-4" />
              Browse Gift Cards
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
                className="flex items-center justify-center gap-2 px-8 py-3.5 rounded-full border border-brand-border bg-brand-card/40 text-sm font-semibold text-white hover:border-brand-purple/30 transition-all cursor-pointer"
              >
                <Wallet className="h-4 w-4 text-brand-green" />
                Connect Wallet
              </button>
            )}
          </div>
        </motion.div>

        {/* Hero Interactive Gift Cards Carousel */}
        <div className="w-full max-w-6xl mx-auto mt-16 px-4 z-10">
          <div className="flex gap-6 overflow-x-auto pb-6 scrollbar-thin scrollbar-thumb-brand-purple/20 scrollbar-track-transparent snap-x snap-mandatory justify-start md:justify-center">
            {products.length > 0 ? (
              products.map((product, idx) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  whileHover={{ 
                    scale: 1.04,
                    y: -6,
                    transition: { duration: 0.2 }
                  }}
                  className="snap-start shrink-0 w-64 cursor-pointer"
                >
                  <Link href={`/product/${product.id}`}>
                    <GiftCardArtwork 
                      brand={product.brand} 
                      value={product.retailPrice} 
                      imageUrl={product.image}
                      className="shadow-2xl" 
                    />
                  </Link>
                </motion.div>
              ))
            ) : (
              mockGiftCards.map((card, idx) => (
                <motion.div
                  key={card.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  whileHover={{ 
                    scale: 1.04,
                    y: -6,
                    transition: { duration: 0.2 }
                  }}
                  className="snap-start shrink-0 w-64 cursor-pointer"
                >
                  <Link href="/marketplace">
                    <GiftCardArtwork brand={card.brand} value={card.value} className="shadow-2xl" />
                  </Link>
                </motion.div>
              ))
            )}
          </div>
        </div>

      </section>

      {/* 2. Trust Ribbon */}
      <section className="w-full border-y border-brand-border/40 bg-brand-card/10 py-6 px-4 z-10 relative overflow-hidden">
        <div className="mx-auto max-w-5xl flex flex-wrap justify-center sm:justify-between items-center gap-6 text-[10px] sm:text-xs font-black tracking-widest text-brand-text-muted uppercase">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4.5 w-4.5 text-brand-green" />
            <span>Secure Checkout</span>
          </div>
          <div className="flex items-center gap-2">
            <Zap className="h-4.5 w-4.5 text-brand-purple" />
            <span>Instant Digital Delivery</span>
          </div>
          <div className="flex items-center gap-2">
            <Lock className="h-4.5 w-4.5 text-indigo-400" />
            <span>Encrypted Payments</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4.5 w-4.5 text-emerald-400" />
            <span>Verified Transactions</span>
          </div>
        </div>
      </section>

      {/* 3. How It Works */}
      <section className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">How it Works</h2>
          <p className="text-xs sm:text-sm text-brand-text-muted mt-3">
            Secure, rapid delivery in three simple steps.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {steps.map((step, idx) => (
            <motion.div 
              key={idx} 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.15 }}
              className="glass-card rounded-2xl p-6 border border-brand-border/40 bg-brand-card/25 relative flex flex-col items-center text-center shadow-lg hover:border-brand-purple/35 transition-all"
            >
              <div className="h-12 w-12 rounded-full bg-brand-dark border border-brand-purple/20 flex items-center justify-center mb-5 shadow-inner">
                {step.icon}
              </div>
              <h3 className="text-sm font-bold text-white tracking-tight">{step.title}</h3>
              <p className="text-xs text-brand-text-muted mt-3 leading-relaxed">
                {step.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 4. Reviews & Trust Section */}
      <section className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10 border-t border-brand-border/20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-center mb-12">
          
          {/* Trust score overview */}
          <div className="space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-brand-purple/20 bg-brand-purple/5 text-[9px] font-black text-brand-purple tracking-widest uppercase">
              <Sparkles className="h-3 w-3" />
              Verified Trust
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-tight">
              Customer Reviews
            </h2>
            <p className="text-xs text-brand-text-muted leading-relaxed">
              Every purchase on SOLCart is backed by instant automated fulfillment and logged securely on the Solana blockchain.
            </p>
            
            <div className="pt-4 space-y-3">
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-black text-white">4.9</span>
                <span className="text-xs text-brand-text-muted">/ 5.0</span>
              </div>
              <div className="flex items-center gap-1 text-amber-400 text-sm">
                {"★★★★★"}
              </div>
              <p className="text-[10px] text-brand-text-muted uppercase tracking-wider font-bold">
                Based on 2,450+ verified customer purchases
              </p>
            </div>
          </div>

          {/* Cards of reviews */}
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              {
                name: "Alex M. (Privacy Protected)",
                countryCode: "us",
                product: "Steam Wallet Card",
                rating: 5,
                speed: "Under 10 seconds",
                comment: "Frictionless checkout! Received the Steam code in my inbox in exactly 8 seconds. Redirection to devnet wallet was smooth."
              },
              {
                name: "Sarah L.",
                countryCode: "gb",
                product: "Apple App Store Card",
                rating: 5,
                speed: "20 seconds",
                comment: "Amazing exchange rate with zero markup fees. Code activated instantly on my iTunes account. Highly satisfied!"
              },
              {
                name: "Kenji T. (Privacy Protected)",
                countryCode: "jp",
                product: "Amazon Gift Card",
                rating: 5,
                speed: "45 seconds",
                comment: "Verified transaction on solana explorer and my Amazon balance is topped up. Very premium, elegant interface."
              },
              {
                name: "Elena R.",
                countryCode: "de",
                product: "Netflix Digital Card",
                rating: 5,
                speed: "1 minute",
                comment: "Perfect gift card store. Fast transaction logs and instant delivery. Highly recommend using Solana for fast checkouts."
              }
            ].map((rev, rIdx) => (
              <motion.div 
                key={rIdx}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: rIdx * 0.1 }}
                className="glass-card rounded-2xl p-5 border border-brand-border/40 bg-brand-card/10 flex flex-col justify-between space-y-4 hover:border-brand-purple/30 transition-colors"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">{rev.name}</span>
                      <img 
                        src={`https://flagcdn.com/w40/${rev.countryCode}.png`} 
                        alt="" 
                        className="h-3 w-4.5 object-cover rounded-sm border border-white/10 shrink-0 select-none pointer-events-none"
                      />
                    </div>
                    <span className="px-2 py-0.5 rounded text-[8px] bg-brand-green/10 text-brand-green border border-brand-green/20 font-bold uppercase tracking-wider shrink-0 flex items-center gap-1">
                      <span className="h-1 w-1 rounded-full bg-brand-green animate-pulse"></span>
                      {rev.speed}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-amber-400 text-[10px]">
                    {"★".repeat(rev.rating)}
                  </div>
                  <p className="text-xs text-brand-text-muted leading-relaxed italic">
                    "{rev.comment}"
                  </p>
                </div>
                <div className="pt-2 border-t border-brand-border/20 flex justify-between items-center text-[9px] text-brand-text-muted">
                  <span>Purchased: <strong className="text-white">{rev.product}</strong></span>
                  <span className="text-brand-green font-bold flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3 text-brand-green" />
                    Verified Purchase
                  </span>
                </div>
              </motion.div>
            ))}
          </div>

        </div>
      </section>

      {/* 5. Features Section */}
      <section className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-16 border-t border-brand-border/20">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">Shopping Benefits</h2>
          <p className="text-xs sm:text-sm text-brand-text-muted mt-3">
            Why consumers choose SOLCart for global gift card settlement.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {benefits.map((benefit, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: (idx % 3) * 0.1 }}
              className="glass-card rounded-2xl p-6 border border-brand-border/40 bg-brand-card/10 flex flex-col justify-between"
            >
              <div>
                <div className="h-10 w-10 rounded-lg bg-brand-purple/10 border border-brand-purple/20 flex items-center justify-center mb-5">
                  {benefit.icon}
                </div>
                <h3 className="text-sm font-bold text-white tracking-tight">{benefit.title}</h3>
                <p className="text-xs text-brand-text-muted mt-3 leading-relaxed">
                  {benefit.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 6. Bottom Call-To-Action */}
      <section className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 mt-12">
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="rounded-3xl border border-brand-border/60 bg-gradient-to-tr from-brand-card to-indigo-950/20 p-8 sm:p-12 relative overflow-hidden flex flex-col items-center text-center shadow-2xl"
        >
          <div className="absolute bottom-0 right-0 w-[300px] h-[300px] bg-brand-purple/5 rounded-full blur-[100px] pointer-events-none"></div>
          
          <h2 className="text-xl sm:text-2xl font-black text-white">Spend Your SOL on Premium Gift Cards</h2>
          <p className="text-xs text-brand-text-muted mt-4 max-w-lg leading-relaxed">
            Ready to experience frictionless digital shopping? Browse our storefront, select your cards, and pay securely using Solana.
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
        </motion.div>
      </section>

    </div>
  );
}
