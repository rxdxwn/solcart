"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { 
  ShoppingBag, 
  Search, 
  Wallet, 
  User, 
  LogOut, 
  Settings, 
  LayoutDashboard, 
  Coins, 
  ChevronDown,
  UserCheck,
  Menu,
  X
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useSolanaWallet, WalletProviderName } from "../../context/SolanaWalletContext";
import { useCart } from "../../context/CartContext";
import { APP_VERSION } from "../../lib/version";


export default function Navbar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, login, logout, isAdmin } = useAuth();
  const { 
    connected, 
    walletAddress, 
    walletName, 
    balance, 
    connect, 
    disconnect, 
    requestFaucet,
    networkStatus,
    setNetworkStatus,
    isSolflareDetected,
    loading: walletLoading 
  } = useSolanaWallet();
  
  const { cartItems } = useCart();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [mounted, setMounted] = useState(false);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showWalletDropdown, setShowWalletDropdown] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [authEmail, setAuthEmail] = useState("");
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [solflareNotFoundModal, setSolflareNotFoundModal] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const profileRef = useRef<HTMLDivElement>(null);
  const walletRef = useRef<HTMLDivElement>(null);

  // Sync search input with URL params
  useEffect(() => {
    const q = searchParams.get("search") || "";
    setSearchQuery(q);
  }, [searchParams]);

  // Handle click outside to close dropdowns
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfileDropdown(false);
      }
      if (walletRef.current && !walletRef.current.contains(event.target as Node)) {
        setShowWalletDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/marketplace?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push("/marketplace");
    }
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (authEmail) {
      const success = await login(authEmail);
      if (success) {
        setShowAuthModal(false);
        setAuthEmail("");
      }
    }
  };

  const handleWalletSelect = async (name: WalletProviderName) => {
    setShowWalletModal(false);
    const res = await connect(name);
    if (!res.success && res.notFound) {
      if (name === "Solflare") {
        setSolflareNotFoundModal(true);
      }
    }
  };

  const truncateAddress = (addr: string) => {
    if (!addr) return "";
    if (addr === "SOLCartTestWa11et111111111111111111111111") return "SOLCart Test Wallet";
    return `${addr.slice(0, 4)}...${addr.slice(-4)}`;
  };

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <>
      <nav className="sticky top-0 z-40 w-full border-b border-brand-border/40 bg-brand-dark/80 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between gap-4">
            
            {/* Logo */}
            <div className="flex items-center">
              <Link href="/" className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-tr from-brand-purple to-brand-green p-0.5 shadow-md shadow-brand-purple/20">
                  <div className="flex h-full w-full items-center justify-center rounded-[6px] bg-brand-dark font-black tracking-tighter text-white">
                    S
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-bold tracking-tight text-white">
                    SOL<span className="solana-gradient-text">Cart</span>
                  </span>
                  <span className="text-[10px] font-mono font-extrabold px-2 py-0.5 rounded-full bg-brand-purple/20 text-brand-purple border border-brand-purple/30 shadow-sm">
                    {APP_VERSION}
                  </span>
                </div>
              </Link>
            </div>


            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center gap-6">
              <Link href="/marketplace" className="text-sm font-medium text-brand-text-muted hover:text-white transition-colors">
                Marketplace
              </Link>
              {mounted && connected && (
                <Link href="/dashboard" className="text-sm font-medium text-brand-text-muted hover:text-white transition-colors">
                  Dashboard
                </Link>
              )}
              {mounted && user && isAdmin && (
                <Link href="/admin" className="text-sm font-medium text-brand-text-muted hover:text-white transition-colors flex items-center gap-1">
                  <LayoutDashboard className="h-4 w-4" />
                  Admin
                </Link>
              )}
            </div>

            {/* Search Bar */}
            <form onSubmit={handleSearchSubmit} className="hidden sm:flex flex-1 max-w-md relative">
              <input
                type="text"
                placeholder="Search products, brands, stores..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-9 rounded-full border border-brand-border bg-brand-dark/40 pl-10 pr-4 text-sm text-white placeholder-brand-text-muted/60 focus:outline-none focus:border-brand-purple/50 focus:ring-1 focus:ring-brand-purple/20 transition-all"
              />
              <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-brand-text-muted/60" />
            </form>

            {/* Actions */}
            <div className="hidden md:flex items-center gap-4">
              
              {/* Shopping Cart */}
              <Link href="/cart" className="relative p-2 rounded-full border border-brand-border/60 hover:border-brand-purple/40 hover:bg-brand-card/40 transition-all text-brand-text-muted hover:text-white">
                <ShoppingBag className="h-5 w-5" />
                {mounted && cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-brand-purple text-[10px] font-bold text-white shadow-md shadow-brand-purple/30">
                    {cartCount}
                  </span>
                )}
              </Link>

              {/* Wallet Adapter Section */}
              <div ref={walletRef} className="relative">
                {mounted && connected ? (
                  <div className="flex items-center gap-2">
                    {walletName === "SOLCart Test Wallet" && (
                      <button 
                        onClick={requestFaucet}
                        className="px-2.5 py-1 text-xs font-semibold rounded bg-brand-green/10 text-brand-green border border-brand-green/20 hover:bg-brand-green/20 transition-all flex items-center gap-1.5"
                      >
                        <Coins className="h-3 w-3" />
                        Faucet
                      </button>
                    )}
                    <button
                      onClick={() => setShowWalletDropdown(!showWalletDropdown)}
                      className="flex h-9 items-center gap-2 rounded-full border border-brand-border bg-brand-card/60 px-4 text-xs font-medium text-white hover:border-brand-purple/30 transition-all"
                    >
                      <span className="h-2 w-2 rounded-full bg-brand-green animate-pulse-slow"></span>
                      <span>{truncateAddress(walletAddress!)}</span>
                      <span className="text-brand-text-muted">({balance.toFixed(2)} SOL)</span>
                      <ChevronDown className="h-3 w-3 text-brand-text-muted" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowWalletModal(true)}
                    className="flex h-9 items-center gap-2 rounded-full bg-gradient-to-r from-brand-purple to-indigo-600 px-4 text-xs font-semibold text-white shadow-lg shadow-brand-purple/10 hover:shadow-brand-purple/20 transition-all"
                  >
                    <Wallet className="h-4 w-4" />
                    Connect Wallet
                  </button>
                )}

                {/* Wallet Dropdown menu */}
                {mounted && showWalletDropdown && connected && (
                  <div className="absolute right-0 mt-2 w-64 rounded-xl border border-brand-border bg-brand-card p-2 shadow-xl backdrop-blur-lg z-50">
                    <div className="px-3 py-2 border-b border-brand-border/40 mb-2">
                      <p className="text-[10px] font-bold text-brand-text-muted uppercase tracking-wider mb-1">Active Network</p>
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => setNetworkStatus("Devnet")}
                          className={`flex-1 py-1 text-[10px] font-bold rounded border transition-all ${
                            networkStatus === "Devnet"
                              ? "bg-brand-purple text-white border-brand-purple"
                              : "bg-brand-dark/40 text-brand-text-muted border-brand-border/60 hover:text-white"
                          }`}
                        >
                          Devnet
                        </button>
                        <button
                          onClick={() => setNetworkStatus("Mainnet")}
                          className={`flex-1 py-1 text-[10px] font-bold rounded border transition-all ${
                            networkStatus === "Mainnet"
                              ? "bg-brand-green/20 text-brand-green border-brand-green/40"
                              : "bg-brand-dark/40 text-brand-text-muted border-brand-border/60 hover:text-white"
                          }`}
                        >
                          Mainnet
                        </button>
                      </div>
                    </div>

                    <div className="px-3 py-1.5 text-xs text-brand-text-muted flex justify-between items-center mb-1">
                      <span>Connected via:</span>
                      <span className="text-white font-semibold">{walletName}</span>
                    </div>

                    <button
                      onClick={disconnect}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-medium text-red-400 hover:bg-red-500/10 transition-colors mt-1"
                    >
                      <LogOut className="h-4 w-4" />
                      Disconnect Wallet
                    </button>
                  </div>
                )}
              </div>


              {/* Profile Account */}
              <div ref={profileRef} className="relative">
                {mounted && user ? (
                  <button
                    onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-brand-border bg-brand-card/60 text-brand-text-muted hover:text-white hover:border-brand-purple/30 transition-all"
                  >
                    <UserCheck className="h-5 w-5 text-brand-green" />
                  </button>
                ) : (
                  <button
                    onClick={() => setShowAuthModal(true)}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-brand-border bg-brand-card/60 text-brand-text-muted hover:text-white hover:border-brand-purple/30 transition-all"
                  >
                    <User className="h-5 w-5" />
                  </button>
                )}

                {/* Profile Dropdown */}
                {showProfileDropdown && user && (
                  <div className="absolute right-0 mt-2 w-56 rounded-xl border border-brand-border bg-brand-card p-1.5 shadow-xl backdrop-blur-lg">
                    <div className="px-3 py-2 border-b border-brand-border/40 mb-1">
                      <p className="text-xs font-semibold text-white truncate">{user.name}</p>
                      <p className="text-[10px] text-brand-text-muted truncate mt-0.5">{user.email}</p>
                    </div>
                    <Link
                      href="/dashboard"
                      onClick={() => setShowProfileDropdown(false)}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-medium text-brand-text-muted hover:text-white hover:bg-brand-border/40 transition-colors"
                    >
                      <LayoutDashboard className="h-4 w-4" />
                      Dashboard
                    </Link>
                    {isAdmin && (
                      <Link
                        href="/admin"
                        onClick={() => setShowProfileDropdown(false)}
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-medium text-brand-text-muted hover:text-white hover:bg-brand-border/40 transition-colors"
                      >
                        <Settings className="h-4 w-4" />
                        Admin Panel
                      </Link>
                    )}
                    <button
                      onClick={() => {
                        setShowProfileDropdown(false);
                        logout();
                      }}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-medium text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>

            </div>

            {/* Mobile Menu Button */}
            <div className="flex items-center md:hidden gap-2">
              <Link href="/cart" className="relative p-2 rounded-full border border-brand-border/60 text-brand-text-muted hover:text-white">
                <ShoppingBag className="h-5 w-5" />
                {mounted && cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-brand-purple text-[10px] font-bold text-white">
                    {cartCount}
                  </span>
                )}
              </Link>
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="p-2 text-brand-text-muted hover:text-white"
              >
                {showMobileMenu ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>

          </div>
        </div>

        {/* Mobile Menu */}
        {showMobileMenu && (
          <div className="md:hidden border-t border-brand-border/40 bg-brand-dark px-4 py-4 space-y-4">
            {/* Search */}
            <form onSubmit={handleSearchSubmit} className="relative w-full">
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-10 rounded-full border border-brand-border bg-brand-dark/40 pl-10 pr-4 text-sm text-white"
              />
              <Search className="absolute left-3.5 top-3 h-4 w-4 text-brand-text-muted/60" />
            </form>

            <div className="flex flex-col gap-2">
              <Link
                href="/marketplace"
                onClick={() => setShowMobileMenu(false)}
                className="px-3 py-2 rounded-lg text-sm font-medium text-brand-text-muted hover:text-white hover:bg-brand-card"
              >
                Marketplace
              </Link>
              {mounted && connected && (
                <Link
                  href="/dashboard"
                  onClick={() => setShowMobileMenu(false)}
                  className="px-3 py-2 rounded-lg text-sm font-medium text-brand-text-muted hover:text-white hover:bg-brand-card"
                >
                  Dashboard
                </Link>
              )}
              {mounted && user && isAdmin && (
                <Link
                  href="/admin"
                  onClick={() => setShowMobileMenu(false)}
                  className="px-3 py-2 rounded-lg text-sm font-medium text-brand-text-muted hover:text-white hover:bg-brand-card"
                >
                  Admin Panel
                </Link>
              )}
            </div>

            {/* Wallet & Auth triggers */}
            <div className="flex flex-col gap-3 pt-2 border-t border-brand-border/25">
              {mounted && connected ? (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between px-3 text-xs text-brand-text-muted">
                    <span>{truncateAddress(walletAddress!)}</span>
                    <span className="font-bold text-white">{balance.toFixed(2)} SOL</span>
                  </div>
                  {walletName === "SOLCart Test Wallet" && (
                    <button 
                      onClick={() => {
                        requestFaucet();
                        setShowMobileMenu(false);
                      }}
                      className="w-full py-2 text-xs font-semibold rounded-lg bg-brand-green/10 text-brand-green border border-brand-green/20"
                    >
                      Request Faucet (+10 SOL)
                    </button>
                  )}
                  <button
                    onClick={() => {
                      disconnect();
                      setShowMobileMenu(false);
                    }}
                    className="w-full py-2 text-xs font-semibold rounded-lg bg-red-500/10 text-red-400 border border-red-500/20"
                  >
                    Disconnect Wallet
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setShowWalletModal(true);
                    setShowMobileMenu(false);
                  }}
                  className="w-full py-2.5 rounded-full bg-gradient-to-r from-brand-purple to-indigo-600 text-xs font-semibold text-white"
                >
                  Connect Wallet
                </button>
              )}

              {mounted && user ? (
                <div className="flex items-center justify-between px-3 pt-1 text-xs">
                  <span className="text-brand-text-muted truncate">User: {user.email}</span>
                  <button
                    onClick={() => {
                      logout();
                      setShowMobileMenu(false);
                    }}
                    className="text-red-400 font-medium hover:underline"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setShowAuthModal(true);
                    setShowMobileMenu(false);
                  }}
                  className="w-full py-2.5 rounded-full border border-brand-border bg-brand-card text-xs font-semibold text-white"
                >
                  Sign In / Register
                </button>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Wallet Selector Modal */}
      {showWalletModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-dark/80 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-brand-border bg-brand-card p-6 shadow-2xl relative">
            <button 
              onClick={() => setShowWalletModal(false)}
              className="absolute right-4 top-4 p-1.5 rounded-full hover:bg-brand-border/40 text-brand-text-muted hover:text-white transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
            <h3 className="text-lg font-bold text-white tracking-tight">Connect a Wallet</h3>
            <p className="text-xs text-brand-text-muted mt-1.5 mb-6">
              Connect your Solflare extension, browser wallet, or use the Sandbox Test Wallet.
            </p>
            <div className="flex flex-col gap-2.5">
              <button
                onClick={() => handleWalletSelect("Solflare")}
                className="flex items-center justify-between w-full p-3 rounded-xl border border-[#ff4a00]/40 bg-[#ff4a00]/10 hover:bg-[#ff4a00]/20 text-white transition-all text-left group"
              >
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-[#ff4a00] flex items-center justify-center font-bold text-white text-xs shadow-md shadow-[#ff4a00]/20">
                    S
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white group-hover:text-[#ff4a00] transition-colors">Solflare Wallet</span>
                    <p className="text-[10px] text-brand-text-muted">Full Native Integration</p>
                  </div>
                </div>
                {isSolflareDetected ? (
                  <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-brand-green/20 text-brand-green border border-brand-green/30">
                    Detected
                  </span>
                ) : (
                  <span className="text-[10px] text-brand-text-muted">Extension / Web</span>
                )}
              </button>

              <button
                onClick={() => handleWalletSelect("SOLCart Test Wallet")}
                className="flex items-center justify-between w-full p-3 rounded-xl border border-brand-purple/30 bg-brand-purple/5 hover:bg-brand-purple/10 text-white transition-all text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-brand-purple to-brand-green p-0.5">
                    <div className="h-full w-full bg-brand-card rounded-[6px] flex items-center justify-center font-bold text-white text-xs">SOL</div>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">SOLCart Test Wallet</p>
                    <p className="text-[10px] text-brand-green font-semibold">Instant Faucet & Dev Sandbox</p>
                  </div>
                </div>
                <span className="text-[10px] text-brand-green font-bold">Sandbox</span>
              </button>

              <button
                onClick={() => handleWalletSelect("Phantom")}
                className="flex items-center justify-between w-full p-3 rounded-xl border border-brand-border/80 bg-brand-dark/20 hover:bg-brand-card transition-all text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-[#ab9ef4] flex items-center justify-center font-bold text-brand-dark text-xs">P</div>
                  <span className="text-xs font-semibold text-white">Phantom Wallet</span>
                </div>
                <span className="text-[10px] text-brand-text-muted">Browser Wallet</span>
              </button>

              <button
                onClick={() => handleWalletSelect("Backpack")}
                className="flex items-center justify-between w-full p-3 rounded-xl border border-brand-border/80 bg-brand-dark/20 hover:bg-brand-card transition-all text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-[#e21a24]/10 border border-[#e21a24]/30 flex items-center justify-center font-bold text-[#e21a24] text-xs">B</div>
                  <span className="text-xs font-semibold text-white">Backpack Wallet</span>
                </div>
                <span className="text-[10px] text-brand-text-muted">Browser Wallet</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Solflare Extension Not Found Dialog */}
      {solflareNotFoundModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-dark/85 backdrop-blur-md">
          <div className="w-full max-w-sm rounded-2xl border border-[#ff4a00]/40 bg-brand-card p-6 shadow-2xl relative text-center space-y-4">
            <button 
              onClick={() => setSolflareNotFoundModal(false)}
              className="absolute right-4 top-4 p-1.5 rounded-full hover:bg-brand-border/40 text-brand-text-muted hover:text-white transition-colors"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="h-14 w-14 rounded-2xl bg-[#ff4a00]/15 border border-[#ff4a00]/40 flex items-center justify-center font-black text-[#ff4a00] text-2xl mx-auto shadow-lg shadow-[#ff4a00]/10">
              S
            </div>

            <div>
              <h3 className="text-lg font-extrabold text-white">Solflare Wallet Required</h3>
              <p className="text-xs text-brand-text-muted leading-relaxed mt-2">
                Solflare extension was not detected in your browser. Install Solflare or use the SOLCart Sandbox Wallet to continue testing.
              </p>
            </div>

            <div className="flex flex-col gap-2.5 pt-2">
              <a
                href="https://solflare.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 rounded-xl bg-[#ff4a00] hover:bg-[#ff4a00]/90 text-xs font-extrabold text-white shadow-lg shadow-[#ff4a00]/20 flex items-center justify-center gap-2"
              >
                Install Solflare Extension
              </a>
              <a
                href="https://solflare.com/access-wallet"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 rounded-xl border border-brand-border bg-brand-dark/40 hover:bg-brand-card text-xs font-semibold text-white flex items-center justify-center gap-2"
              >
                Open Solflare Web Wallet
              </a>
              <button
                onClick={() => {
                  setSolflareNotFoundModal(false);
                  connect("SOLCart Test Wallet");
                }}
                className="w-full py-2 text-xs font-bold text-brand-green hover:underline mt-1"
              >
                Use SOLCart Test Wallet Sandbox Instead
              </button>
            </div>
          </div>
        </div>
      )}


      {/* Auth Login Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-dark/80 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-brand-border bg-brand-card p-6 shadow-2xl relative">
            <button 
              onClick={() => setShowAuthModal(false)}
              className="absolute right-4 top-4 p-1.5 rounded-full hover:bg-brand-border/40 text-brand-text-muted hover:text-white transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
            <h3 className="text-lg font-bold text-white tracking-tight">Sign In or Register</h3>
            <p className="text-xs text-brand-text-muted mt-1.5 mb-6">
              Access your order history, transaction receipts, saved addresses, and refunds.
            </p>
            <form onSubmit={handleAuthSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-brand-text-muted mb-1.5">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  className="w-full h-10 px-3.5 rounded-lg border border-brand-border bg-brand-dark/40 text-xs text-white placeholder-brand-text-muted/50 focus:outline-none focus:border-brand-purple/50 focus:ring-1 focus:ring-brand-purple/20"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2.5 rounded-lg bg-brand-purple text-xs font-bold text-white shadow-md shadow-brand-purple/20 hover:bg-brand-purple/95 transition-all"
              >
                Sign In
              </button>
              
              <div className="pt-2 text-center">
                <p className="text-[10px] text-brand-text-muted">
                  Tip: Use <span className="text-brand-purple font-semibold">admin@solcart.com</span> to access the Admin Panel immediately!
                </p>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
