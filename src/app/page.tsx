"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  ArrowRight, 
  Wallet, 
  Globe, 
  Zap, 
  Lock,
  ShoppingBag,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Calendar
} from "lucide-react";
import { motion } from "framer-motion";
import { useSolanaWallet } from "../context/SolanaWalletContext";
import { useCart } from "../context/CartContext";
import { GiftCardArtwork } from "../components/ui/GiftCardArtwork";
import { SupabaseService } from "../services/supabase";
import { Product } from "../types";

export default function Home() {
  const { connected, connect } = useSolanaWallet();
  const { solPrice } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadProducts = () => {
      if (!isMounted) return;
      // Get initial products to showcase
      setProducts(SupabaseService.getProducts().slice(0, 8));
      setIsLoadingProducts(false);
    };

    const syncProducts = async () => {
      try {
        await SupabaseService.syncWithServer();
        loadProducts();
      } catch (err) {
        console.error("Failed to load products on home:", err);
        if (isMounted) setIsLoadingProducts(false);
      }
    };

    window.addEventListener("solcart-db-synced", loadProducts);
    syncProducts();

    return () => {
      isMounted = false;
      window.removeEventListener("solcart-db-synced", loadProducts);
    };
  }, []);

  const handleWalletCTA = () => {
    if (!connected) {
      connect();
    }
  };

  return (
    <div className="flex flex-col w-full pb-0 bg-black text-white overflow-x-hidden">
      
      {/* 1. Iconic Stark Hero Section */}
      <section className="relative w-full py-20 md:py-32 flex flex-col items-center text-center px-4 border-b border-[#1A1A1A]">
        {/* Subtle background red glow */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#FF0000]/5 rounded-full blur-[140px] pointer-events-none z-0"></div>

        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto flex flex-col items-center relative z-10"
        >
          {/* Accent Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#FF0000]/30 bg-[#FF0000]/5 text-xs text-[#FF0000] font-black uppercase tracking-wider mb-8">
            <span className="h-2 w-2 rounded-full bg-[#FF0000] animate-pulse"></span>
            SOLCart Premium Store
          </div>

          {/* Stark Typography Title */}
          <h1 className="text-5xl sm:text-8xl font-black tracking-tighter leading-none text-white uppercase select-none">
            ANY GIFTCARD.<br />
            PAID WITH <span className="text-[#FF0000]">SOL</span>.
          </h1>
          
          <p className="max-w-2xl text-sm sm:text-base text-zinc-400 mt-8 leading-relaxed font-medium">
            Spend your Solana directly on digital gift cards from top global brands. No markup, instant settlement, self-custody wallet connection.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mt-10 w-full sm:w-auto justify-center">
            <Link
              href="/marketplace"
              className="flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-[#FF0000] text-black font-black text-xs uppercase tracking-wider hover:bg-[#E30A17] hover:scale-102 transition-all shadow-lg shadow-[#FF0000]/10"
            >
              <ShoppingBag className="h-4 w-4 stroke-[3px]" />
              Start Shopping
            </Link>

            {connected ? (
              <Link
                href="/dashboard"
                className="flex items-center justify-center gap-2 px-8 py-4 rounded-xl border border-[#222222] bg-[#0A0A0A] text-xs font-black uppercase tracking-wider text-white hover:border-[#FF0000]/50 hover:bg-black transition-all"
              >
                Go to Dashboard
              </Link>
            ) : (
              <button
                onClick={handleWalletCTA}
                className="flex items-center justify-center gap-2 px-8 py-4 rounded-xl border border-[#222222] bg-[#0A0A0A] text-xs font-black uppercase tracking-wider text-white hover:border-[#FF0000]/50 hover:bg-black transition-all cursor-pointer"
              >
                <Wallet className="h-4 w-4 text-[#FF0000]" />
                Connect Wallet
              </button>
            )}
          </div>
        </motion.div>
      </section>

      {/* 2. Featured Cards Showcase (Minimalist Grid) */}
      <section className="w-full py-16 px-4 max-w-7xl mx-auto border-b border-[#1A1A1A]">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-10 gap-4">
          <div>
            <span className="text-[10px] font-black uppercase text-[#FF0000] tracking-wider">Catalog Preview</span>
            <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-white mt-1">Featured Gift Cards</h3>
          </div>
          <Link href="/marketplace" className="text-xs font-black uppercase text-[#FF0000] hover:underline flex items-center gap-1">
            Browse full marketplace <ArrowRight className="h-3 w-3 stroke-[3px]" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {products.length > 0 ? (
            products.slice(0, 4).map((product) => (
              <motion.div
                key={product.id}
                whileHover={{ y: -4 }}
                className="group border border-[#222222] bg-[#0A0A0A] p-4 rounded-2xl flex flex-col justify-between transition-all hover:border-[#FF0000]/50"
              >
                <GiftCardArtwork 
                  brand={product.brand} 
                  value={product.retailPrice} 
                  imageUrl={product.image}
                  className="shadow-md" 
                />
                
                <div className="mt-4 flex flex-col gap-1.5">
                  <h4 className="text-sm font-black text-white uppercase tracking-tight">{product.brand}</h4>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-zinc-500 font-bold">{product.regions?.[0] || "Global"}</span>
                    <span className="font-bold text-[#FF0000]">
                      {parseFloat((product.retailPrice / solPrice).toFixed(3))} SOL
                    </span>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <p className="text-zinc-500 text-xs">
              {isLoadingProducts ? "Loading products..." : "No products available."}
            </p>
          )}
        </div>
      </section>

      {/* 3. LIGHT UP YOUR ROOM SECTION (Solid, Bright Red background) */}
      <section className="w-full bg-[#FF0000] text-black py-24 px-4 flex flex-col items-center justify-center text-center relative select-none">
        {/* Intense white-red bright core styling to maximize glow */}
        <div className="max-w-4xl mx-auto flex flex-col items-center justify-center">
          
          <Globe className="h-16 w-16 text-black stroke-[3px] animate-bounce mb-8" />
          
          <h2 className="text-4xl sm:text-7xl font-black tracking-tighter leading-[0.95] text-black uppercase">
            WE SELL ANY GIFTCARD<br />
            FOR ALL COUNTRIES.
          </h2>
          
          <p className="max-w-2xl text-base sm:text-lg font-extrabold text-black/95 mt-8 leading-snug">
            Currently launching weekly new countries! We start with 4 active settlement currencies (USD, GBP, SGD, CAD) and scale globally. Track every upcoming weekly release and conversion values live.
          </p>

          <div className="mt-10">
            <Link
              href="/launch"
              className="inline-flex items-center gap-2.5 px-8 py-4 rounded-xl bg-black text-[#FF0000] text-xs font-black uppercase tracking-wider hover:bg-zinc-900 transition-all hover:scale-103 shadow-2xl"
            >
              <Calendar className="h-4.5 w-4.5 stroke-[3px]" />
              View Launch Calendar
            </Link>
          </div>

        </div>
      </section>

      {/* 4. Simplistic Steps (How It Works) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full border-t border-[#1A1A1A]">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-[10px] font-black uppercase text-[#FF0000] tracking-wider">Operations</span>
          <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white mt-1">Instant Fulfillment</h2>
          <p className="text-xs text-zinc-500 mt-2 font-medium">
            Frictionless settlement model operating in three plain steps.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              icon: <Globe className="h-6 w-6 text-[#FF0000] stroke-[2.5px]" />,
              title: "1. Browse Cards",
              desc: "Select from hundreds of premium global gift cards. Filter by region and brand denomination."
            },
            {
              icon: <Wallet className="h-6 w-6 text-[#FF0000] stroke-[2.5px]" />,
              title: "2. Sign Transaction",
              desc: "Connect your Solana browser wallet and instantly sign secure checkout settlement payloads."
            },
            {
              icon: <Zap className="h-6 w-6 text-[#FF0000] stroke-[2.5px]" />,
              title: "3. Instant Code",
              desc: "Your voucher redemption code is displayed immediately on-screen and delivered straight to your inbox."
            }
          ].map((step, idx) => (
            <div 
              key={idx}
              className="border border-[#222222] bg-[#0A0A0A] p-6 rounded-2xl flex flex-col items-start gap-4 hover:border-[#FF0000]/30 transition-colors"
            >
              <div className="h-10 w-10 rounded-lg bg-[#FF0000]/10 flex items-center justify-center border border-[#FF0000]/20">
                {step.icon}
              </div>
              <h3 className="text-sm font-black uppercase tracking-wider text-white">{step.title}</h3>
              <p className="text-xs text-zinc-400 leading-relaxed font-medium">
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Minimalist Reviews Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-[#1A1A1A] w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          <div className="lg:col-span-4 space-y-4">
            <span className="text-[10px] font-black uppercase text-[#FF0000] tracking-wider">Feedbacks</span>
            <h3 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white mt-1">Verified Customers</h3>
            <p className="text-xs text-zinc-500 leading-relaxed font-medium">
              Every purchase log is cryptographically secure and processed instantaneously. Direct settlement at exact rate margins.
            </p>
            
            <div className="pt-4 space-y-2">
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-black text-white">4.9</span>
                <span className="text-xs text-zinc-500 font-bold">/ 5.0 rating</span>
              </div>
              <div className="text-[#FF0000] font-black text-xs tracking-wider">★★★★★</div>
            </div>
          </div>

          <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              {
                name: "Alex M.",
                product: "Steam Wallet Card",
                time: "8 seconds delivery",
                text: "Frictionless checkout! Received the Steam code in my inbox in exactly 8 seconds. Redirection to devnet wallet was smooth."
              },
              {
                name: "Sarah L.",
                product: "Apple Store Card",
                time: "20 seconds delivery",
                text: "Amazing exchange rate with zero markup fees. Code activated instantly on my iTunes account. Highly satisfied!"
              }
            ].map((rev, idx) => (
              <div 
                key={idx}
                className="border border-[#222222] bg-[#0A0A0A] p-5 rounded-2xl flex flex-col justify-between gap-4 hover:border-zinc-800 transition-colors text-xs"
              >
                <div className="space-y-2">
                  <div className="flex justify-between items-center font-black">
                    <span className="text-white uppercase tracking-tight">{rev.name}</span>
                    <span className="px-2 py-0.5 rounded bg-[#FF0000]/10 text-[#FF0000] border border-[#FF0000]/25 text-[8px] tracking-wide uppercase">
                      {rev.time}
                    </span>
                  </div>
                  <p className="text-zinc-400 leading-relaxed font-medium italic">"{rev.text}"</p>
                </div>
                <div className="border-t border-[#222222] pt-2 text-[9px] text-zinc-500 font-black uppercase tracking-wider flex justify-between">
                  <span>Purchased: <strong className="text-white">{rev.product}</strong></span>
                  <span className="text-[#FF0000] flex items-center gap-1 font-black">
                    <ShieldCheck className="h-3 w-3 stroke-[2.5px]" /> Verified
                  </span>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

    </div>
  );
}
