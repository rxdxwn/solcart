"use client";

import React from "react";
import Link from "next/link";
import { CheckCircle, Shield, AlertTriangle } from "lucide-react";

import { APP_VERSION } from "../../lib/version";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-brand-border/40 bg-brand-dark/40 py-12 mt-auto">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-4">
          
          {/* Column 1: Info */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-tr from-brand-purple to-brand-green p-0.5">
                <span className="font-extrabold text-[12px] text-white">S</span>
              </div>
              <span className="text-md font-bold tracking-tight text-white">SOLCart</span>
              <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-brand-purple/20 text-brand-purple border border-brand-purple/30">
                {APP_VERSION}
              </span>
            </div>
            <p className="text-xs leading-relaxed text-brand-text-muted">
              Pay with Solana. Buy digital gift cards from major brands across the world instantly and securely.
            </p>
          </div>

          {/* Column 2: Brands */}
          <div>
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-4">Supported Brands</h4>
            <ul className="flex flex-col gap-2.5 text-xs text-brand-text-muted">
              <li>
                <Link href="/marketplace?brand=Amazon" className="hover:text-white transition-colors">Amazon</Link>
              </li>
              <li>
                <Link href="/marketplace?brand=Apple" className="hover:text-white transition-colors">Apple Store</Link>
              </li>
              <li>
                <Link href="/marketplace?brand=Nike" className="hover:text-white transition-colors">Nike</Link>
              </li>
              <li>
                <Link href="/marketplace?brand=Walmart" className="hover:text-white transition-colors">Walmart</Link>
              </li>
            </ul>
          </div>

          {/* Column 3: System Status */}
          <div className="flex flex-col gap-3 md:col-span-2">
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-3">Service Health</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs text-brand-green">
                <CheckCircle className="h-4 w-4" />
                <span>SOL Swaps (Jupiter V6): Operational</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-brand-green">
                <CheckCircle className="h-4 w-4" />
                <span>Digital Delivery: Instant Email Dispatch</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-brand-green">
                <CheckCircle className="h-4 w-4" />
                <span>Solana RPC (Helius): Connected</span>
              </div>
            </div>
          </div>

        </div>

        <div className="mt-12 pt-8 border-t border-brand-border/20 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[11px] text-brand-text-muted">
            &copy; {currentYear} SOLCart Inc. Sourced products are trademarks of their respective retailers.
          </p>
          <div className="flex items-center gap-4 text-[11px] text-brand-text-muted">
            <span className="flex items-center gap-1 font-mono font-semibold text-brand-purple">
              SOLCart Engine {APP_VERSION}
            </span>
            <span className="flex items-center gap-1">
              <Shield className="h-3.5 w-3.5 text-brand-green" />
              Secure 256-bit AES Swap
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

