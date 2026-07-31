"use client";

import React from "react";
import Link from "next/link";
import { 
  ShoppingBag, 
  Trash2, 
  Plus, 
  Minus, 
  ShieldCheck, 
  ArrowRight, 
  RefreshCw, 
  Sparkles, 
  ArrowLeft,
  Info,
  Coins
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "../../context/CartContext";
import { useSolanaWallet } from "../../context/SolanaWalletContext";
import { GiftCardArtwork } from "../../components/ui/GiftCardArtwork";

export default function CartPage() {
  const { 
    cartItems, 
    updateQuantity, 
    removeFromCart, 
    subtotalUSD, 
    shippingUSD, 
    marketplaceFeeUSD, 
    totalUSD, 
    totalSOL, 
    solPrice,
    isRefreshingPrice,
    refreshSOLPrice
  } = useCart();
  
  const { connected, connect } = useSolanaWallet();

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 w-full">
      <div className="flex items-center justify-between mb-8 border-b border-brand-border/40 pb-4">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
          <ShoppingBag className="h-7 w-7 text-brand-purple" />
          Shopping Cart
        </h1>
        <Link href="/marketplace" className="text-xs font-semibold text-brand-purple hover:underline flex items-center gap-1">
          <ArrowLeft className="h-4 w-4" />
          Continue Shopping
        </Link>
      </div>

      {cartItems.length === 0 ? (
        <div className="text-center py-24 border border-dashed border-brand-border/40 rounded-3xl bg-brand-card/10 flex flex-col items-center">
          <ShoppingBag className="h-12 w-12 text-brand-text-muted mb-4" />
          <p className="text-sm font-bold text-white">Your cart is empty</p>
          <p className="text-xs text-brand-text-muted mt-1.5 max-w-xs">
            Browse our catalog and add digital gift cards from top global brands.
          </p>
          <Link
            href="/marketplace"
            className="mt-6 px-6 py-2.5 rounded-full bg-brand-purple hover:bg-brand-purple/90 text-xs font-bold text-white transition-colors"
          >
            Explore Catalog
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* 1. Items List */}
          <div className="lg:col-span-2 space-y-4">
            <AnimatePresence initial={false}>
              {cartItems.map((item) => {
                const solItemEquivalent = parseFloat((item.product.retailPrice / solPrice).toFixed(4));
                return (
                  <motion.div 
                    key={item.product.id}
                    initial={{ opacity: 0, height: 0, y: 15 }}
                    animate={{ opacity: 1, height: "auto", y: 0 }}
                    exit={{ opacity: 0, height: 0, y: -15 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <div className="rounded-2xl border border-brand-border/40 bg-brand-card/20 p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
                      <div className="flex items-center gap-4">
                        
                        {/* Thumbnail */}
                        <div className="relative h-12 w-20 shrink-0">
                          <GiftCardArtwork brand={item.product.brand} value={item.product.retailPrice} imageUrl={item.product.image} className="shadow-md" isThumbnail={true} />
                        </div>

                        <div>
                          <span className="text-[9px] font-black text-brand-purple uppercase tracking-widest">{item.product.brand}</span>
                          <h3 className="text-xs font-bold text-white line-clamp-1 max-w-[250px] mt-0.5">
                            <Link href={`/product/${item.product.id}`} className="hover:underline">{item.product.name}</Link>
                          </h3>
                          <p className="text-[10px] text-brand-text-muted mt-1">Delivery: <span className="text-white font-medium">Instant Digital</span></p>
                        </div>

                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto mt-3 sm:mt-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-brand-border/20">
                        
                        {/* Quantity controls */}
                        <div className="flex items-center border border-brand-border rounded-lg bg-brand-dark/40 overflow-hidden h-9">
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                            className="px-3 hover:bg-brand-card text-brand-text-muted hover:text-white h-full cursor-pointer"
                          >
                            -
                          </button>
                          <span className="px-4 text-xs font-bold text-white">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                            className="px-3 hover:bg-brand-card text-brand-text-muted hover:text-white h-full cursor-pointer"
                          >
                            +
                          </button>
                        </div>

                        {/* Price in USD / SOL */}
                        <div className="text-right">
                          <p className="text-xs font-bold text-white">
                            ${(item.product.retailPrice * item.quantity).toFixed(2)}
                          </p>
                          <p className="text-[10px] text-brand-green font-semibold mt-0.5">
                            {(solItemEquivalent * item.quantity).toFixed(4)} SOL
                          </p>
                        </div>

                        {/* Remove */}
                        <button
                          onClick={() => removeFromCart(item.product.id)}
                          className="p-2 text-brand-text-muted hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
                          title="Remove product"
                        >
                          <Trash2 className="h-4.5 w-4.5" />
                        </button>

                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {/* 2. Order Summary Sidebar */}
          <div className="glass-panel rounded-2xl p-6 border border-brand-border/40 space-y-6">
            
            {/* SOL Price Refresh */}
            <div className="flex items-center justify-between border-b border-brand-border/40 pb-4">
              <span className="text-xs font-bold text-white">Order Summary</span>
              <button 
                onClick={() => refreshSOLPrice()}
                title="Refresh SOL conversion rate"
                className="text-brand-text-muted hover:text-white flex items-center justify-center p-1.5 hover:bg-brand-purple/10 rounded-lg transition-colors cursor-pointer"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isRefreshingPrice ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {/* Calculations */}
            <div className="space-y-3.5 text-xs text-brand-text-muted">
              <div className="flex justify-between">
                <span>Items Subtotal:</span>
                <span className="text-white font-medium">${subtotalUSD.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="flex items-center gap-1">
                  Digital Delivery:
                  <span title="Instant automated digital code dispatch is free">
                    <Info className="h-3 w-3 text-brand-text-muted/60" />
                  </span>
                </span>
                <span className="text-white font-medium">
                  FREE
                </span>
              </div>
              <div className="flex justify-between">
                <span className="flex items-center gap-1">
                  Service Fee:
                  <span title="Covers secure transaction routing operations">
                    <Info className="h-3 w-3 text-brand-text-muted/60" />
                  </span>
                </span>
                <span className="text-white font-medium">${marketplaceFeeUSD.toFixed(2)}</span>
              </div>
              
              <div className="pt-4 border-t border-brand-border/40 flex items-baseline justify-between text-sm">
                <span className="font-bold text-white">Total USD:</span>
                <span className="font-black text-white">${totalUSD.toFixed(2)}</span>
              </div>

              {/* Dynamic SOL total */}
              <div className="rounded-xl border border-brand-purple/30 bg-gradient-to-tr from-brand-purple/5 to-indigo-950/20 p-4 mt-2 flex flex-col gap-1.5 text-center shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 w-12 h-12 bg-brand-purple/5 rounded-full blur-xl pointer-events-none"></div>
                <span className="text-[9px] font-black text-brand-purple tracking-widest uppercase font-semibold">Pay with SOL</span>
                <span className="text-2xl font-black text-brand-green">{totalSOL.toFixed(4)} SOL</span>
                <span className="text-[9px] text-brand-text-muted">1 SOL = ${solPrice.toFixed(2)}</span>
              </div>

            </div>

            {/* Checkout Action Button */}
            <div className="pt-2">
              {connected ? (
                <Link
                  href="/checkout"
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-brand-purple to-indigo-600 font-bold text-xs text-white hover:scale-[1.01] shadow-lg shadow-brand-purple/10 flex items-center justify-center gap-2 transition-all text-center"
                >
                  Proceed to Checkout
                  <ArrowRight className="h-4.5 w-4.5" />
                </Link>
              ) : (
                <button
                  onClick={() => connect()}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-brand-purple to-indigo-600 font-bold text-xs text-white shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Coins className="h-4.5 w-4.5 text-brand-green" />
                  Connect Wallet to Checkout
                </button>
              )}
            </div>

            {/* Shopping Security Guarantees */}
            <div className="flex items-center gap-2 text-[10px] text-brand-text-muted justify-center pt-2">
              <ShieldCheck className="h-4.5 w-4.5 text-brand-green" />
              <span>Payments secured by Solana</span>
            </div>

          </div>

        </div>
      )}
    </div>
  );
}
