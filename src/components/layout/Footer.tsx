"use client";

import React from "react";
import Link from "next/link";
import { ArrowUpRight, ShieldCheck, Zap } from "lucide-react";
import { Logo } from "../ui/Logo";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-white/8 bg-[#030303] py-12 mt-auto">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-[1.7fr_1fr_1fr]">
          <div className="max-w-sm space-y-4">
            <Logo size="md" />
            <p className="text-sm leading-relaxed text-brand-text-muted">A considered marketplace for buying digital gift cards with crypto—fast settlement, transparent pricing, and delivery in seconds.</p>
            <div className="flex gap-3 pt-1 text-[10px] font-bold uppercase tracking-wider text-white">
              <span className="inline-flex items-center gap-1.5"><Zap className="h-3.5 w-3.5 text-brand-purple" /> Instant delivery</span>
              <span className="inline-flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5 text-brand-purple" /> Secure checkout</span>
            </div>
          </div>
          <div>
            <h4 className="mb-4 text-[10px] font-black uppercase tracking-[.16em] text-white">Explore</h4>
            <ul className="space-y-3 text-sm text-brand-text-muted">
              <li><Link href="/marketplace" className="hover:text-white transition-colors">Gift card marketplace</Link></li>
              <li><Link href="/marketplace?category=Gaming" className="hover:text-white transition-colors">Gaming</Link></li>
              <li><Link href="/marketplace?category=Entertainment" className="hover:text-white transition-colors">Entertainment</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-4 text-[10px] font-black uppercase tracking-[.16em] text-white">Account & support</h4>
            <ul className="space-y-3 text-sm text-brand-text-muted">
              <li><Link href="/dashboard" className="hover:text-white transition-colors">My orders</Link></li>
              <li><Link href="/contact" className="inline-flex items-center gap-1 hover:text-white transition-colors">Get support <ArrowUpRight className="h-3.5 w-3.5" /></Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-6 border-t border-white/8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[11px] text-brand-text-muted">
            &copy; {currentYear} SOLCart. All rights reserved. Sourced gift cards are trademarks of their respective brand issuers.
          </p>
        </div>
      </div>
    </footer>
  );
}
