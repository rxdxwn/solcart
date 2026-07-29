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
  Sparkles
} from "lucide-react";
import { RetailerService } from "../../../services/retailers";
import { useCart } from "../../../context/CartContext";
import { Product } from "../../../types";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ProductDetailPage({ params }: PageProps) {
  const router = useRouter();
  const { id } = use(params);
  const { addToCart, solPrice } = useCart();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<"specs" | "shipping" | "reviews">("specs");
  
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
        headers: { "Content-Type": "application/json" },
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
      title: "Extremely fast fulfillment!",
      comment: `Ordered this shoe with SOL. SOLCart swapped it to USDC and Nike placed the order within 10 minutes. Delivered in pristine Nike box. Amazing experience!`
    },
    {
      id: "r2",
      author: "David K.",
      rating: 4,
      date: "1 week ago",
      title: "Decent markup, seamless experience",
      comment: "A small 10% markup, but totally worth it to avoid off-ramping to fiat. Transaction was confirmed on-chain in 2 seconds. Highly recommend."
    },
    {
      id: "r3",
      author: "Sarah L.",
      rating: 5,
      date: "3 weeks ago",
      title: "Apple product via Solana!",
      comment: "Was skeptical at first, but my order number registered on Apple's tracking portal. Perfect shipping. Will buy again!"
    }
  ];

  // Retrieve related products in same category
  const relatedProducts = RetailerService.getProducts()
    .filter(p => p.category === product.category && p.id !== product.id)
    .slice(0, 3);

  const handleAddToCart = () => {
    addToCart(product, quantity);
  };

  const handleBuyNow = () => {
    addToCart(product, quantity);
    router.push("/checkout");
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      
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
          <div className="relative aspect-[4/3] rounded-2xl border border-brand-border/40 bg-brand-card/40 overflow-hidden shadow-2xl">
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-cover"
              priority
            />
            {/* Retailer badge */}
            <span className="absolute top-4 left-4 px-3 py-1.5 rounded-lg bg-brand-dark/95 border border-brand-border/60 text-xs font-bold text-white flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-brand-purple"></span>
              Sourced from {retailer?.name || product.retailerId}
            </span>
          </div>

          {/* Secure Purchase assurances */}
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-xl border border-brand-border/30 bg-brand-card/20 p-3 text-center flex flex-col items-center justify-center">
              <ShieldCheck className="h-4 w-4 text-brand-purple mb-1" />
              <span className="text-[9px] font-bold text-white">Non-Custodial</span>
            </div>
            <div className="rounded-xl border border-brand-border/30 bg-brand-card/20 p-3 text-center flex flex-col items-center justify-center">
              <Sparkles className="h-4 w-4 text-brand-green mb-1" />
              <span className="text-[9px] font-bold text-white">Auto-Swapped</span>
            </div>
            <div className="rounded-xl border border-brand-border/30 bg-brand-card/20 p-3 text-center flex flex-col items-center justify-center">
              <RotateCcw className="h-4 w-4 text-indigo-400 mb-1" />
              <span className="text-[9px] font-bold text-white">Refund Protection</span>
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
          <div className="mt-8 p-6 rounded-2xl border border-brand-border/60 bg-brand-card/30">
            <div className="flex items-baseline justify-between">
              <span className="text-xs text-brand-text-muted font-semibold">Price (USD):</span>
              <span className="text-2xl font-black text-white">${product.retailPrice.toFixed(2)}</span>
            </div>

            {/* Pay with SOL Equivalent */}
            <div className="mt-4 pt-4 border-t border-brand-border/40 flex items-center justify-between">
              <span className="text-xs font-bold text-brand-purple">PAY IN SOL</span>
              <div className="text-right">
                <p className="text-xl font-extrabold text-brand-green">{solPriceEquivalent.toFixed(4)} SOL</p>
                <p className="text-[10px] text-brand-text-muted mt-0.5">1 SOL = ${solPrice.toFixed(2)} (Jupiter Price API)</p>
              </div>
            </div>

            {/* Inventory Status */}
            <div className="mt-4 flex items-center gap-2 text-xs">
              <span className={`h-2 w-2 rounded-full ${product.stockCount > 10 ? 'bg-brand-green' : 'bg-amber-500'}`}></span>
              <span className="text-brand-text-muted">
                {product.stockCount > 0 ? `In Stock (${product.stockCount} left)` : "Out of Stock"}
              </span>
              <span className="text-brand-text-muted">•</span>
              <span className="text-brand-text-muted flex items-center gap-1">
                <Clock className="h-3.5 w-3.5 text-brand-purple" />
                Est: {product.estimatedDelivery}
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

      {/* Tabs section (Specs / Shipping / Reviews) */}
      <div className="mt-20 border-b border-brand-border/40">
        <div className="flex gap-8 text-sm font-bold">
          <button
            onClick={() => setActiveTab("specs")}
            className={`pb-4 border-b-2 transition-all ${activeTab === "specs" ? 'border-brand-purple text-white' : 'border-transparent text-brand-text-muted hover:text-white'}`}
          >
            Specifications
          </button>
          <button
            onClick={() => setActiveTab("shipping")}
            className={`pb-4 border-b-2 transition-all ${activeTab === "shipping" ? 'border-brand-purple text-white' : 'border-transparent text-brand-text-muted hover:text-white'}`}
          >
            Fulfillment & Delivery
          </button>
          <button
            onClick={() => setActiveTab("reviews")}
            className={`pb-4 border-b-2 transition-all ${activeTab === "reviews" ? 'border-brand-purple text-white' : 'border-transparent text-brand-text-muted hover:text-white'}`}
          >
            Reviews (${(product.reviews || []).length})
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

        {activeTab === "shipping" && (
          <div className="max-w-3xl space-y-6 text-xs sm:text-sm leading-relaxed text-brand-text-muted">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-brand-purple/10 border border-brand-purple/20 rounded-xl text-brand-purple">
                <Package className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-bold text-white">Digital Code Delivery</h4>
                <p className="mt-1">
                  Once your SOL payment is broadcasted and verified on-chain, we convert the payment to USDC via Jupiter Swap API. Your gift card order details are sent to our admin team who will assign your code. Codes will appear on your customer dashboard and be sent to your email.
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
        <div className="mt-20 pt-8 border-t border-brand-border/20">
          <h3 className="text-lg font-bold text-white mb-6">Related Products</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {relatedProducts.map(rel => {
              const relSol = parseFloat((rel.marketplacePrice / solPrice).toFixed(4));
              return (
                <Link 
                  key={rel.id}
                  href={`/product/${rel.id}`}
                  className="glass-card rounded-2xl border border-brand-border/40 p-4 flex flex-col group"
                >
                  <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-brand-dark/20 mb-4">
                    <Image
                      src={rel.image}
                      alt={rel.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <span className="text-[9px] font-bold text-brand-text-muted uppercase">{rel.brand}</span>
                  <h4 className="text-xs font-bold text-white line-clamp-1 mt-1 group-hover:text-brand-purple transition-colors">
                    {rel.name}
                  </h4>
                  <div className="mt-4 pt-3 border-t border-brand-border/30 flex items-center justify-between">
                    <span className="text-xs font-black text-white">${rel.marketplacePrice.toFixed(2)}</span>
                    <span className="text-xs font-extrabold text-brand-green">{relSol.toFixed(4)} SOL</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
}
