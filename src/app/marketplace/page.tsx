"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { 
  Filter, 
  Search, 
  Star, 
  Clock, 
  ShoppingCart, 
  ChevronDown, 
  Tag, 
  RefreshCw,
  SlidersHorizontal,
  X
} from "lucide-react";
import { RetailerService } from "../../services/retailers";
import { useCart } from "../../context/CartContext";
import { Product, RetailerConfig } from "../../types";
import { motion } from "framer-motion";
import { GiftCardArtwork } from "../../components/ui/GiftCardArtwork";

function MarketplaceContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addToCart, solPrice, isRefreshingPrice, refreshSOLPrice } = useCart();

  // Load static catalog lists using reactive state and local database sync
  const [retailers, setRetailers] = useState<RetailerConfig[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const handleSync = () => {
      const refreshedRetailers = RetailerService.getRetailers();
      const refreshedProducts = RetailerService.getProducts();
      setRetailers(refreshedRetailers);
      setAllProducts(refreshedProducts);
      setProducts(refreshedProducts);
    };

    handleSync();
    window.addEventListener("solcart-db-synced", handleSync);
    return () => window.removeEventListener("solcart-db-synced", handleSync);
  }, []);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRetailers, setSelectedRetailers] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<string>("all");
  const [minRating, setMinRating] = useState<number>(0);
  const [sortBy, setSortBy] = useState<string>("featured");
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Sync state with URL search params on mount & change
  useEffect(() => {
    const search = searchParams.get("search") || "";
    setSearchTerm(search);

    const retailerParam = searchParams.get("retailer");
    if (retailerParam) {
      setSelectedRetailers([retailerParam]);
    } else {
      setSelectedRetailers([]);
    }

    const categoryParam = searchParams.get("category");
    if (categoryParam) {
      setSelectedCategories([categoryParam]);
    } else {
      setSelectedCategories([]);
    }
  }, [searchParams]);

  // Extract unique categories & brands for filter options
  const categories = Array.from(new Set(allProducts.map(p => p.category)));
  const brands = Array.from(new Set(allProducts.map(p => p.brand)));

  // Filter and Sort Handler
  useEffect(() => {
    let filtered = [...allProducts];

    // 1. Search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        p => p.name.toLowerCase().includes(term) || 
             p.brand.toLowerCase().includes(term) ||
             p.description.toLowerCase().includes(term)
      );
    }

    // 2. Retailers filter
    if (selectedRetailers.length > 0) {
      filtered = filtered.filter(p => selectedRetailers.includes(p.retailerId));
    }

    // 3. Category filter
    if (selectedCategories.length > 0) {
      filtered = filtered.filter(p => selectedCategories.includes(p.category));
    }

    // 4. Brand filter
    if (selectedBrands.length > 0) {
      filtered = filtered.filter(p => selectedBrands.includes(p.brand));
    }

    // 5. Price filter
    if (priceRange !== "all") {
      if (priceRange === "under100") {
        filtered = filtered.filter(p => p.marketplacePrice < 100);
      } else if (priceRange === "100to500") {
        filtered = filtered.filter(p => p.marketplacePrice >= 100 && p.marketplacePrice <= 500);
      } else if (priceRange === "500to1000") {
        filtered = filtered.filter(p => p.marketplacePrice >= 500 && p.marketplacePrice <= 1000);
      } else if (priceRange === "over1000") {
        filtered = filtered.filter(p => p.marketplacePrice > 1000);
      }
    }

    // 6. Rating filter
    if (minRating > 0) {
      filtered = filtered.filter(p => p.rating >= minRating);
    }

    // 7. Sorting logic
    if (sortBy === "priceAsc") {
      filtered.sort((a, b) => a.marketplacePrice - b.marketplacePrice);
    } else if (sortBy === "priceDesc") {
      filtered.sort((a, b) => b.marketplacePrice - a.marketplacePrice);
    } else if (sortBy === "rating") {
      filtered.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === "featured") {
      filtered.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
    }

    setProducts(filtered);
  }, [searchTerm, selectedRetailers, selectedCategories, selectedBrands, priceRange, minRating, sortBy, allProducts]);

  const toggleRetailer = (id: string) => {
    setSelectedRetailers(prev => 
      prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]
    );
  };

  const toggleCategory = (cat: string) => {
    setSelectedCategories(prev => 
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const toggleBrand = (brand: string) => {
    setSelectedBrands(prev => 
      prev.includes(brand) ? prev.filter(b => b !== brand) : [...prev, brand]
    );
  };

  const clearAllFilters = () => {
    setSelectedRetailers([]);
    setSelectedCategories([]);
    setSelectedBrands([]);
    setPriceRange("all");
    setMinRating(0);
    setSearchTerm("");
    router.push("/marketplace");
  };

  const getRetailerName = (id: string) => {
    return retailers.find(r => r.id === id)?.name || id;
  };

  return (
    <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Header Banner Section */}
      <div className="rounded-3xl border border-brand-border/40 bg-gradient-to-r from-brand-card/40 via-indigo-950/10 to-brand-dark p-8 sm:p-10 relative overflow-hidden mb-10 shadow-2xl">
        {/* Background glows */}
        <div className="absolute top-1/2 left-1/3 w-[300px] h-[300px] bg-brand-purple/5 rounded-full blur-[100px] pointer-events-none"></div>
        
        {/* Floating cards in banner background (Desktop only) */}
        <div className="absolute right-12 top-0 bottom-0 w-1/3 hidden lg:flex items-center justify-center gap-6 opacity-15 pointer-events-none select-none">
          <div className="transform -rotate-12 scale-[0.8] -translate-y-2">
            <GiftCardArtwork brand="Amazon" value="$50" className="w-36 shadow-2xl blur-[0.5px]" />
          </div>
          <div className="transform rotate-12 scale-[0.9] translate-y-4">
            <GiftCardArtwork brand="Apple" value="$100" className="w-36 shadow-2xl" />
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">Marketplace</h1>
            <p className="text-xs text-brand-text-muted mt-2 leading-relaxed max-w-md">
              Digital gift cards from top global brands. Sourced officially and delivered instantly.
            </p>
          </div>
          
          {/* SOL Price indicator */}
          <div className="flex items-center gap-3 self-start md:self-auto bg-brand-dark/85 backdrop-blur-sm border border-brand-border/60 rounded-full px-4 py-2 text-xs">
            <span className="h-2 w-2 rounded-full bg-brand-green animate-pulse"></span>
            <span className="font-semibold text-brand-text-muted">SOL Rate:</span>
            <span className="font-bold text-white">${solPrice.toFixed(2)}</span>
            <button 
              onClick={() => refreshSOLPrice()}
              className={`text-brand-purple hover:text-brand-green transition-colors ml-1 ${isRefreshingPrice ? 'animate-spin' : ''}`}
            >
              <RefreshCw className="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Main search input for mobile */}
      <div className="flex sm:hidden w-full relative mb-6">
        <input
          type="text"
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full h-11 rounded-lg border border-brand-border bg-brand-card/60 pl-10 pr-4 text-xs text-white"
        />
        <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-brand-text-muted" />
      </div>

      <div className="flex gap-8 items-start">
        
        {/* 1. Sidebar Filters (Desktop) */}
        <aside className="hidden lg:block w-64 shrink-0 glass-panel rounded-2xl p-6 border border-brand-border/40 sticky top-24">
          <div className="flex items-center justify-between border-b border-brand-border/40 pb-4 mb-6">
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <Filter className="h-4 w-4 text-brand-purple" />
              Filters
            </span>
            {(selectedRetailers.length > 0 || selectedCategories.length > 0 || selectedBrands.length > 0 || priceRange !== "all" || minRating > 0 || searchTerm !== "") && (
              <button 
                onClick={clearAllFilters}
                className="text-[10px] font-semibold text-brand-purple hover:text-brand-green transition-colors"
              >
                Clear All
              </button>
            )}
          </div>

          {/* Brands */}
          <div className="mb-6">
            <h3 className="text-xs font-bold text-white mb-3">Brands</h3>
            <div className="space-y-2.5">
              {brands.map(brand => (
                <label key={brand} className="flex items-center gap-2.5 text-xs text-brand-text-muted hover:text-white cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={selectedBrands.includes(brand)}
                    onChange={() => toggleBrand(brand)}
                    className="h-4 w-4 rounded border-brand-border bg-brand-dark text-brand-purple focus:ring-brand-purple"
                  />
                  <span>{brand}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Price Filters */}
          <div className="mb-6">
            <h3 className="text-xs font-bold text-white mb-3">Price (USD)</h3>
            <div className="space-y-2.5">
              {[
                { value: "all", label: "All Prices" },
                { value: "under100", label: "Under $100" },
                { value: "100to500", label: "$100 - $500" },
                { value: "500to1000", label: "$500 - $1,000" },
                { value: "over1000", label: "Over $1,000" }
              ].map(opt => (
                <label key={opt.value} className="flex items-center gap-2.5 text-xs text-brand-text-muted hover:text-white cursor-pointer select-none">
                  <input
                    type="radio"
                    name="priceRangeRadio"
                    checked={priceRange === opt.value}
                    onChange={() => setPriceRange(opt.value)}
                    className="h-4 w-4 border-brand-border bg-brand-dark text-brand-purple focus:ring-brand-purple"
                  />
                  <span>{opt.label}</span>
                </label>
              ))}
            </div>
          </div>

        </aside>

        {/* 2. Products List Area */}
        <div className="flex-1">
          
          {/* Sorting & Filter buttons */}
          <div className="flex items-center justify-between mb-6 gap-4 bg-brand-card/20 border border-brand-border/40 rounded-xl px-4 py-3">
            <span className="text-xs text-brand-text-muted">
              Showing <span className="text-white font-bold">{products.length}</span> products
            </span>

            <div className="flex items-center gap-3">
              <button 
                onClick={() => setShowMobileFilters(true)}
                className="lg:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-brand-border bg-brand-card/60 text-xs text-white"
              >
                <SlidersHorizontal className="h-4 w-4" />
                Filters
              </button>
              
              {/* Sort selector */}
              <div className="flex items-center gap-2">
                <span className="hidden sm:inline text-xs text-brand-text-muted font-medium">Sort By:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-brand-dark border border-brand-border rounded-lg text-xs text-white px-3 py-1.5 focus:outline-none focus:border-brand-purple/40"
                >
                  <option value="featured">Featured</option>
                  <option value="priceAsc">Price: Low to High</option>
                  <option value="priceDesc">Price: High to Low</option>
                  <option value="rating">Rating</option>
                </select>
              </div>
            </div>
          </div>

          {/* Grid of products */}
          {products.length === 0 ? (
            <div className="w-full text-center py-20 border border-dashed border-brand-border/40 rounded-3xl bg-brand-card/10">
              <Tag className="h-10 w-10 text-brand-text-muted mx-auto mb-4" />
              <p className="text-sm font-bold text-white">No products found</p>
              <p className="text-xs text-brand-text-muted mt-1.5">Try adjusting your filters or search terms.</p>
              <button
                onClick={clearAllFilters}
                className="mt-6 px-5 py-2.5 bg-brand-purple text-xs font-semibold rounded-full text-white"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {products.map((product) => {
                const solPriceEquivalent = parseFloat((product.retailPrice / solPrice).toFixed(4));
                return (
                  <motion.div 
                    key={product.id}
                    layout
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    whileHover={{ y: -6, transition: { duration: 0.2 } }}
                    className="glass-card rounded-2xl border border-brand-border/40 overflow-hidden flex flex-col h-full group relative hover:border-brand-purple/40 hover:shadow-lg hover:shadow-brand-purple/5 transition-all duration-300"
                  >
                    {/* Brand Colored Accent Strip */}
                    <div className="h-1 w-full bg-gradient-to-r from-brand-purple to-brand-green opacity-70 group-hover:opacity-100 transition-opacity"></div>

                    <Link href={`/product/${product.id}`} className="flex flex-col flex-1">
                      {/* Image Area */}
                      <div className="p-5 aspect-[4/3] bg-brand-dark/20 flex items-center justify-center relative overflow-hidden shrink-0 border-b border-brand-border/40">
                        {/* Background subtle glow */}
                        <div className="absolute inset-0 bg-radial-gradient from-brand-purple/5 to-transparent pointer-events-none"></div>
                        <GiftCardArtwork brand={product.brand} value={product.retailPrice} imageUrl={product.image} className="shadow-lg transform group-hover:scale-[1.03] group-hover:rotate-1 transition-all duration-300" />
                        
                        {/* Retailer badge */}
                        <span className="absolute top-3 left-3 px-2.5 py-1 text-[9px] font-extrabold rounded-md bg-brand-dark/85 backdrop-blur-sm border border-brand-border/60 text-white flex items-center gap-1.5 shadow-md z-10">
                          <span className="h-1.5 w-1.5 rounded-full bg-brand-green animate-pulse"></span>
                          {getRetailerName(product.retailerId)}
                        </span>
                      </div>

                      {/* Description Details */}
                      <div className="p-5 flex flex-col flex-1 justify-between">
                        <div>
                          <span className="text-[9px] font-black text-brand-purple uppercase tracking-widest">
                            {product.brand}
                          </span>
                          
                          <h4 className="text-xs font-bold text-white group-hover:text-brand-purple transition-colors line-clamp-1 mt-1 leading-snug">
                            {product.name}
                          </h4>

                          {/* Ratings & Badges */}
                          <div className="flex items-center justify-between gap-1.5 mt-2 flex-wrap">
                            <div className="flex items-center gap-1">
                              <div className="flex items-center text-amber-400">
                                <Star className="h-3 w-3 fill-current" />
                                <span className="text-[11px] font-bold text-white ml-1">{product.rating}</span>
                              </div>
                              <span className="text-[10px] text-brand-text-muted">
                                ({product.reviewsCount.toLocaleString()})
                              </span>
                            </div>
                            <span className="px-2 py-0.5 rounded text-[8px] bg-brand-green/10 text-brand-green border border-brand-green/20 font-bold uppercase tracking-wider shrink-0 flex items-center gap-1">
                              <span className="h-1 w-1 rounded-full bg-brand-green animate-pulse"></span>
                              Instant
                            </span>
                          </div>

                          {/* Stock status */}
                          <div className="flex items-center gap-2 text-[10px] text-brand-text-muted mt-3">
                            <span className={`h-1.5 w-1.5 rounded-full ${product.stockCount > 10 ? 'bg-brand-green' : 'bg-amber-500'} animate-pulse`}></span>
                            <span>In Stock ({product.stockCount} left)</span>
                          </div>
                        </div>

                        {/* Pricing block */}
                        <div className="mt-4 pt-3.5 border-t border-brand-border/20 flex items-center justify-between">
                          <div>
                            <span className="text-[9px] text-brand-text-muted uppercase tracking-wider block font-semibold">USD Price</span>
                            <span className="text-sm font-extrabold text-white">${product.retailPrice.toFixed(2)}</span>
                          </div>

                          <div className="text-right">
                            <span className="text-[9px] text-brand-purple uppercase tracking-wider block font-bold">SOL Amount</span>
                            <span className="text-xs font-black text-brand-green">{solPriceEquivalent.toFixed(4)} SOL</span>
                          </div>
                        </div>
                      </div>
                    </Link>

                    {/* Actions block outside Link overlay */}
                    <div className="px-5 pb-5 pt-0 flex gap-2.5 relative z-10">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          addToCart(product, 1);
                        }}
                        className="flex-1 py-2.5 rounded-lg bg-brand-card hover:bg-brand-border border border-brand-border/80 text-[11px] font-bold text-white flex items-center justify-center gap-1.5 transition-all hover:scale-[1.01] cursor-pointer"
                      >
                        <ShoppingCart className="h-4 w-4 text-brand-purple" />
                        Add to Cart
                      </button>
                      <Link
                        href={`/product/${product.id}`}
                        className="px-4 py-2.5 rounded-lg bg-brand-purple hover:bg-brand-purple/95 text-[11px] font-extrabold text-white flex items-center justify-center transition-all hover:scale-[1.01]"
                      >
                        Buy Now
                      </Link>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}

        </div>

      </div>

      {/* 3. Mobile Filters Slide-Over Drawer */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-50 flex justify-end bg-brand-dark/80 backdrop-blur-sm lg:hidden">
          <div className="w-full max-w-xs bg-brand-card border-l border-brand-border p-6 overflow-y-auto flex flex-col h-full">
            <div className="flex items-center justify-between border-b border-brand-border/40 pb-4 mb-6">
              <span className="text-sm font-bold text-white flex items-center gap-1.5">
                <Filter className="h-4 w-4" />
                Filters
              </span>
              <button 
                onClick={() => setShowMobileFilters(false)}
                className="p-1 rounded-full hover:bg-brand-border text-brand-text-muted hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Brands */}
            <div className="mb-6">
              <h3 className="text-xs font-bold text-white mb-3">Brands</h3>
              <div className="space-y-2.5">
                {brands.map(brand => (
                  <label key={brand} className="flex items-center gap-2.5 text-xs text-brand-text-muted hover:text-white cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={selectedBrands.includes(brand)}
                      onChange={() => toggleBrand(brand)}
                      className="h-4 w-4 rounded border-brand-border bg-brand-dark text-brand-purple focus:ring-brand-purple"
                    />
                    <span>{brand}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Price range */}
            <div className="mb-6">
              <h3 className="text-xs font-bold text-white mb-3">Price Range</h3>
              <div className="space-y-2.5">
                {[
                  { value: "all", label: "All Prices" },
                  { value: "under100", label: "Under $100" },
                  { value: "100to500", label: "$100 - $500" },
                  { value: "500to1000", label: "$500 - $1,000" },
                  { value: "over1000", label: "Over $1,000" }
                ].map(opt => (
                  <label key={opt.value} className="flex items-center gap-2.5 text-xs text-brand-text-muted">
                    <input
                      type="radio"
                      name="priceRangeRadioMobile"
                      checked={priceRange === opt.value}
                      onChange={() => setPriceRange(opt.value)}
                      className="h-4 w-4 border-brand-border bg-brand-dark text-brand-purple focus:ring-brand-purple"
                    />
                    <span>{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <button
              onClick={() => setShowMobileFilters(false)}
              className="mt-auto w-full py-3 bg-brand-purple text-xs font-bold text-white rounded-lg"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

export default function Marketplace() {
  return (
    <Suspense fallback={
      <div className="mx-auto max-w-7xl px-4 py-20 text-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-purple border-t-transparent mx-auto"></div>
        <p className="text-xs text-brand-text-muted mt-4">Loading marketplace...</p>
      </div>
    }>
      <MarketplaceContent />
    </Suspense>
  );
}
