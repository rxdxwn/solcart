"use client";

import React, { use, useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { 
  Star, 
  ShoppingCart, 
  ChevronRight, 
  Clock, 
  ShieldCheck, 
  ArrowLeft, 
  Package, 
  Truck,
  RotateCcw,
  Sparkles,
  Zap
} from "lucide-react";
import { RetailerService } from "../../../services/retailers";
import { useCart } from "../../../context/CartContext";
import { motion } from "framer-motion";
import { Product } from "../../../types";
import { GiftCardArtwork } from "../../../components/ui/GiftCardArtwork";
import { getAuthHeaders } from "../../../lib/auth-headers";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ProductDetailPage({ params }: PageProps) {
  const router = useRouter();
  const { id } = use(params);
  const { addToCart, solPrice } = useCart();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<"specs" | "delivery" | "reviews">("specs");
  
  // Product Reviews Submission States
  const [revAuthor, setRevAuthor] = useState("");
  const [revRating, setRevRating] = useState(5);
  const [revComment, setRevComment] = useState("");
  const [revError, setRevError] = useState("");
  const [revSuccess, setRevSuccess] = useState("");

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setRevError("");
    setRevSuccess("");

    if (!revAuthor.trim() || !revComment.trim()) {
      setRevError("Please fill in all fields.");
      return;
    }

    try {
      const res = await fetch("/api/db", {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          action: "addProductReview",
          payload: {
            productId: id,
            author: revAuthor.trim(),
            rating: revRating,
            comment: revComment.trim()
          }
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setRevSuccess("Your review has been posted successfully!");
        setRevAuthor("");
        setRevComment("");
        setRevRating(5);
        
        // Refresh product info from local DB
        const refreshedProduct = RetailerService.getProductById(id);
        if (refreshedProduct) {
          setProduct(refreshedProduct);
        }
      } else {
        setRevError(data.error || "Failed to submit review");
      }
    } catch (err: any) {
      setRevError(err.message || "Network error. Failed to post review.");
    }
  };

  useEffect(() => {
    const handleSync = () => {
      const prod = RetailerService.getProductById(id);
      if (prod) {
        setProduct(prod);
      }
    };
    
    handleSync();
    window.addEventListener("solcart-db-synced", handleSync);
    return () => window.removeEventListener("solcart-db-synced", handleSync);
  }, [id]);

  if (!product) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center flex flex-col items-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-purple border-t-transparent"></div>
        <p className="text-xs text-brand-text-muted mt-4">Retrieving product details...</p>
      </div>
    );
  }

  const solPriceEquivalent = parseFloat((product.retailPrice / solPrice).toFixed(4));
  const retailers = RetailerService.getRetailers();
  const retailer = retailers.find(r => r.id === product.retailerId);

  // Generate some high quality mock reviews
  const mockReviews = [
    {
      id: "r1",
      author: "Alex M.",
      rating: 5,
      date: "2 days ago",
      title: "Extremely fast delivery!",
      comment: `Purchased this gift card with SOL. Swapped instantly and the digital code was emailed within seconds. Super convenient!`
    },
    {
      id: "r2",
      author: "David K.",
      rating: 5,
      date: "1 week ago",
      title: "Zero added markup, seamless experience",
      comment: "Absolutely love the zero added markup fees on direct face-value gift cards. Transaction was confirmed on-chain in 2 seconds."
    },
    {
      id: "r3",
      author: "Sarah L.",
      rating: 5,
      date: "3 weeks ago",
      title: "Voucher redeemed instantly!",
      comment: "Redeemed my code on the brand store immediately without any region locked issues. Will buy my gaming credits here again!"
    }
  ];

  // Retrieve related products in same category, fallback to same retailer
  const relatedProducts = (() => {
    const allProducts = RetailerService.getProducts();
    const sameCategory = allProducts.filter(p => p.category === product.category && p.id !== product.id);
    if (sameCategory.length > 0) {
      return sameCategory.slice(0, 3);
    }
    // Fallback: same retailer, different category
    const sameRetailer = allProducts.filter(p => p.retailerId === product.retailerId && p.id !== product.id);
    if (sameRetailer.length > 0) {
      return sameRetailer.slice(0, 3);
    }
    // Fallback: any other products
    return allProducts.filter(p => p.id !== product.id).slice(0, 3);
  })();

  const handleAddToCart = () => {
    addToCart(product, quantity);
  };

  const handleBuyNow = () => {
    addToCart(product, quantity);
    router.push("/checkout");
  };

  return (
    <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-brand-text-muted mb-8">
        <Link href="/" className="hover:text-white transition-colors">Home</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link href="/marketplace" className="hover:text-white transition-colors">Marketplace</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-white truncate max-w-xs">{product.name}</span>
      </nav>

      {/* Product View Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
        
        {/* Gallery / Image Card */}
        <div className="flex flex-col gap-4">
          <div className="p-8 aspect-[4/3] rounded-3xl border border-brand-border/40 bg-gradient-to-br from-brand-card/50 to-indigo-950/20 flex items-center justify-center relative overflow-hidden shadow-2xl group">
            {/* Background subtle glow */}
            <div className="absolute inset-0 bg-radial-gradient from-brand-purple/10 to-transparent pointer-events-none"></div>
            
            <GiftCardArtwork brand={product.brand} value={product.retailPrice} imageUrl={product.image} className="shadow-2xl max-w-[90%] transform group-hover:scale-[1.01] transition-transform duration-500" />
            
            {/* Retailer badge */}
            <span className="absolute top-4 left-4 px-3 py-1.5 rounded-lg bg-brand-dark/95 border border-brand-border/60 text-xs font-bold text-white flex items-center gap-2 shadow-lg shadow-brand-dark/50 z-10">
              <span className="h-2 w-2 rounded-full bg-brand-purple animate-pulse"></span>
              Official Digital Card for {retailer?.name || product.retailerId}
            </span>
          </div>

          {/* Secure Purchase assurances */}
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-xl border border-brand-border/30 bg-brand-card/20 p-3 text-center flex flex-col items-center justify-center">
              <Zap className="h-4 w-4 text-brand-purple mb-1 animate-pulse" />
              <span className="text-[9px] font-bold text-white uppercase tracking-wider">Instant Delivery</span>
            </div>
            <div className="rounded-xl border border-brand-border/30 bg-brand-card/20 p-3 text-center flex flex-col items-center justify-center">
              <Sparkles className="h-4 w-4 text-brand-green mb-1" />
              <span className="text-[9px] font-bold text-white uppercase tracking-wider">Best Price</span>
            </div>
            <div className="rounded-xl border border-brand-border/30 bg-brand-card/20 p-3 text-center flex flex-col items-center justify-center">
              <ShieldCheck className="h-4 w-4 text-indigo-400 mb-1" />
              <span className="text-[9px] font-bold text-white uppercase tracking-wider">Secure Checkout</span>
            </div>
          </div>
        </div>

        {/* Purchase Info Panel */}
        <div className="flex flex-col">
          <span className="text-xs font-black text-brand-purple uppercase tracking-wider">
            {product.brand}
          </span>
          <h1 className="text-xl sm:text-3xl font-extrabold text-white mt-2 leading-tight">
            {product.name}
          </h1>

          {/* Ratings */}
          <div className="flex items-center gap-2 mt-3">
            <div className="flex items-center text-amber-400">
              {[...Array(5)].map((_, idx) => (
                <Star 
                  key={idx} 
                  className={`h-4 w-4 ${idx < Math.floor(product.rating) ? 'fill-current' : 'opacity-30'}`} 
                />
              ))}
              <span className="text-xs font-bold text-white ml-2">{product.rating}</span>
            </div>
            <span className="text-xs text-brand-text-muted">•</span>
            <span className="text-xs text-brand-text-muted hover:underline cursor-pointer">
              {product.reviewsCount.toLocaleString()} reviews
            </span>
          </div>

          <p className="text-xs sm:text-sm text-brand-text-muted leading-relaxed mt-6">
            {product.description}
          </p>

          {/* Pricing Block */}
          <div className="mt-8 p-6 rounded-2xl border border-brand-border/60 bg-gradient-to-tr from-brand-card/50 to-indigo-950/20 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-16 h-16 bg-brand-purple/5 rounded-full blur-xl pointer-events-none"></div>
            
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] text-brand-text-muted uppercase tracking-wider block font-semibold">USD Price</span>
                <span className="text-3xl font-black text-white">${product.retailPrice.toFixed(2)}</span>
              </div>
              <div className="text-right bg-brand-green/5 border border-brand-green/20 rounded-xl px-4 py-2.5 shadow-inner">
                <span className="text-[9px] text-brand-purple uppercase tracking-wider block font-bold">SOL Amount</span>
                <span className="text-lg font-black text-brand-green">{solPriceEquivalent.toFixed(4)} SOL</span>
                <span className="text-[8px] text-brand-text-muted block mt-0.5 font-mono">1 SOL = ${solPrice.toFixed(0)}</span>
              </div>
            </div>

            {/* Inventory Status */}
            <div className="mt-5 pt-4 border-t border-brand-border/20 flex items-center justify-between text-xs text-brand-text-muted">
              <div className="flex items-center gap-1.5">
                <span className={`h-2.5 w-2.5 rounded-full ${product.stockCount > 10 ? 'bg-brand-green' : 'bg-amber-500'} animate-pulse`}></span>
                <span>{product.stockCount > 0 ? `In Stock (${product.stockCount} left)` : "Out of Stock"}</span>
              </div>
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5 text-brand-purple" />
                Delivery: Instant Email
              </span>
            </div>
          </div>

          {/* Add to Cart Actions */}
          <div className="mt-8 flex flex-col sm:flex-row gap-4 items-center">
            
            {/* Quantity select */}
            <div className="flex items-center border border-brand-border rounded-lg h-12 bg-brand-dark/40 overflow-hidden w-full sm:w-auto">
              <button 
                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                className="px-4 text-lg hover:bg-brand-card text-brand-text-muted hover:text-white h-full"
              >
                -
              </button>
              <span className="px-6 text-sm font-semibold text-white">{quantity}</span>
              <button 
                onClick={() => setQuantity(q => q + 1)}
                className="px-4 text-lg hover:bg-brand-card text-brand-text-muted hover:text-white h-full"
              >
                +
              </button>
            </div>

            {/* Buy Buttons */}
            <button
              onClick={handleAddToCart}
              className="w-full sm:flex-1 h-12 rounded-xl bg-brand-card border border-brand-border hover:bg-brand-border text-sm font-bold text-white flex items-center justify-center gap-2 transition-all"
            >
              <ShoppingCart className="h-5 w-5 text-brand-purple" />
              Add to Cart
            </button>

            <button
              onClick={handleBuyNow}
              className="w-full sm:flex-1 h-12 rounded-xl bg-brand-purple hover:bg-brand-purple/90 text-sm font-black text-white shadow-lg shadow-brand-purple/10 hover:shadow-brand-purple/20 transition-all"
            >
              Buy Now
            </button>
          </div>

        </div>

      </div>

      {/* Tabs section (Details / Delivery Info / Reviews) */}
      <div className="mt-20 border-b border-brand-border/40">
        <div className="flex gap-8 text-sm font-bold">
          <button
            onClick={() => setActiveTab("specs")}
            className={`pb-4 border-b-2 transition-all ${activeTab === "specs" ? 'border-brand-purple text-white' : 'border-transparent text-brand-text-muted hover:text-white'}`}
          >
            Details
          </button>
          <button
            onClick={() => setActiveTab("delivery")}
            className={`pb-4 border-b-2 transition-all ${activeTab === "delivery" ? 'border-brand-purple text-white' : 'border-transparent text-brand-text-muted hover:text-white'}`}
          >
            Delivery Info
          </button>
          <button
            onClick={() => setActiveTab("reviews")}
            className={`pb-4 border-b-2 transition-all ${activeTab === "reviews" ? 'border-brand-purple text-white' : 'border-transparent text-brand-text-muted hover:text-white'}`}
          >
            Reviews ({(product.reviews || []).length + mockReviews.length})
          </button>
        </div>
      </div>

      {/* Tab Panels */}
      <div className="py-8">
        
        {activeTab === "specs" && (
          <div className="max-w-2xl">
            <div className="rounded-2xl border border-brand-border/40 overflow-hidden divide-y divide-brand-border/40">
              {Object.entries(product.specs).map(([key, val]) => (
                <div key={key} className="grid grid-cols-3 p-4 text-xs">
                  <span className="font-bold text-white capitalize">{key}</span>
                  <span className="col-span-2 text-brand-text-muted">{val}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "delivery" && (
          <div className="max-w-3xl space-y-6 text-xs sm:text-sm leading-relaxed text-brand-text-muted">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-brand-purple/10 border border-brand-purple/20 rounded-xl text-brand-purple shrink-0">
                <Package className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-bold text-white">Instant Digital Fulfillment</h4>
                <p className="mt-1">
                  Once your Solana transaction is broadcasted and confirmed on-chain, our automated system immediately processes the order and secures your digital gift card code.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-4 pt-4 border-t border-brand-border/20">
              <div className="p-3 bg-brand-green/10 border border-brand-green/20 rounded-xl text-brand-green shrink-0">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-bold text-white">Redemption Guide</h4>
                <p className="mt-1">
                  1. Copy the digital code delivered directly on your screen post-checkout or in your email inbox.<br/>
                  2. Go to the brand's official store/app store account page.<br/>
                  3. Select "Redeem Gift Card" or input the code in the voucher box at checkout.
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === "reviews" && (
          <div className="max-w-3xl space-y-6">
            {/* Add Review Form */}
            <div className="glass-panel p-5 rounded-2xl border border-brand-border/40 bg-brand-card/5 max-w-2xl mb-8">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Write a Product Review</h4>
              {revError && <div className="p-2 mb-3 rounded bg-red-500/10 border border-red-500/20 text-xs text-red-400 font-semibold">{revError}</div>}
              {revSuccess && <div className="p-2 mb-3 rounded bg-green-500/10 border border-green-500/20 text-xs text-brand-green font-semibold">{revSuccess}</div>}
              <form onSubmit={handleSubmitReview} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-brand-text-muted mb-1.5">Your Name</label>
                    <input
                      type="text"
                      required
                      placeholder="Jane Doe"
                      value={revAuthor}
                      onChange={(e) => setRevAuthor(e.target.value)}
                      className="w-full h-10 px-3.5 bg-brand-dark/40 border border-brand-border rounded-lg text-xs text-white placeholder-brand-text-muted/40 focus:outline-none focus:border-brand-purple/40"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-brand-text-muted mb-1.5">Rating (Stars)</label>
                    <div className="flex gap-2 items-center h-10">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRevRating(star)}
                          className="focus:outline-none"
                        >
                          <Star className={`h-5 w-5 ${star <= revRating ? 'text-amber-400 fill-current' : 'text-brand-text-muted opacity-30 hover:opacity-75'}`} />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-brand-text-muted mb-1.5">Review Comments</label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Tell us what you think of this gift card..."
                    value={revComment}
                    onChange={(e) => setRevComment(e.target.value)}
                    className="w-full p-3 bg-brand-dark/40 border border-brand-border rounded-lg text-xs text-white placeholder-brand-text-muted/40 focus:outline-none focus:border-brand-purple/40 resize-none"
                  />
                </div>
                <button
                  type="submit"
                  className="px-5 py-2 bg-brand-purple hover:bg-brand-purple/95 rounded-lg text-xs font-bold text-white shadow-md shadow-brand-purple/20 transition-all"
                >
                  Submit Review
                </button>
              </form>
            </div>

            {/* List Reviews */}
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-2">Customer Reviews</h4>
            {(!product.reviews || product.reviews.length === 0) ? (
              <p className="text-xs text-brand-text-muted py-4">No reviews yet for this product. Be the first to leave one!</p>
            ) : (
              <div className="space-y-4">
                {product.reviews.map((rev: any, idx: number) => (
                  <div key={idx} className="p-5 rounded-2xl border border-brand-border/40 bg-brand-card/10">
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-xs font-bold text-white">{rev.author}</span>
                      <span className="text-[10px] text-brand-text-muted">{rev.date}</span>
                    </div>
                    <div className="flex items-center text-amber-400 mt-2">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`h-3 w-3 ${i < rev.rating ? 'fill-current' : 'opacity-20'}`} />
                      ))}
                    </div>
                    <p className="text-xs text-brand-text-muted mt-3 leading-relaxed">
                      {rev.comment}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>

      {/* Related Products carousel */}
      {relatedProducts.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mt-20 pt-8 border-t border-brand-border/20"
        >
          <h3 className="text-lg font-bold text-white mb-6">Related Products</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {relatedProducts.map((rel, relIdx) => {
              const relSol = parseFloat((rel.marketplacePrice / solPrice).toFixed(4));
              return (
                <motion.div
                  key={rel.id}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: relIdx * 0.1 }}
                  whileHover={{ y: -4 }}
                >
                  <Link 
                    href={`/product/${rel.id}`}
                    className="glass-card rounded-2xl border border-brand-border/40 p-4 flex flex-col group h-full"
                  >
                    <div className="p-4 aspect-[4/3] rounded-xl bg-brand-dark/20 mb-4 flex items-center justify-center relative overflow-hidden">
                      <GiftCardArtwork brand={rel.brand} value={rel.marketplacePrice} imageUrl={rel.image} className="shadow-md transform group-hover:scale-102 transition-transform duration-500" />
                    </div>
                    <span className="text-[9px] font-black text-brand-purple uppercase tracking-widest">{rel.brand}</span>
                    <h4 className="text-xs font-bold text-white line-clamp-1 mt-1 group-hover:text-brand-purple transition-colors">
                      {rel.name}
                    </h4>
                    <div className="mt-4 pt-3 border-t border-brand-border/30 flex items-center justify-between">
                      <span className="text-xs font-extrabold text-white">${rel.marketplacePrice.toFixed(2)}</span>
                      <span className="text-xs font-black text-brand-green">{relSol.toFixed(4)} SOL</span>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}

    </div>
  );
}
