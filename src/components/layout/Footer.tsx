"use client";

import React from "react";
import Link from "next/link";
import { ArrowUpRight, ShieldCheck, Zap } from "lucide-react";
import { Logo } from "../ui/Logo";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-[#FF0000] text-black py-16 mt-auto border-t-4 border-black">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-[1.7fr_1fr_1fr]">
          <div className="max-w-sm space-y-4">
            <Logo size="md" className="brightness-0" />
            <p className="text-sm font-medium leading-relaxed text-black/80">
              A considered marketplace for buying digital gift cards with crypto—fast settlement, transparent pricing, and delivery in seconds.
            </p>
            <div className="flex flex-wrap gap-4 pt-1 text-[10px] font-black uppercase tracking-wider text-black">
              <span className="inline-flex items-center gap-1.5">
                <Zap className="h-4 w-4 text-black stroke-[3px]" /> Instant delivery
              </span>
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-black stroke-[3px]" /> Secure checkout
              </span>
            </div>
          </div>
          <div>
            <h4 className="mb-4 text-[10px] font-black uppercase tracking-[.16em] text-black border-b border-black/20 pb-1">
              Explore
            </h4>
            <ul className="space-y-3 text-sm font-semibold text-black/80">
              <li>
                <Link href="/marketplace" className="hover:text-black hover:underline transition-colors">
                  Gift Card Store
                </Link>
              </li>
              <li>
                <Link href="/launch" className="hover:text-black hover:underline transition-colors text-black font-extrabold flex items-center gap-1">
                  Launch Calendar <span className="px-1.5 py-0.5 rounded bg-black text-[#FF0000] text-[8px] tracking-wide font-black">NEW</span>
                </Link>
              </li>
              <li>
                <Link href="/marketplace?category=Retail" className="hover:text-black hover:underline transition-colors">
                  Retail
                </Link>
              </li>
              <li>
                <Link href="/marketplace?category=Gaming" className="hover:text-black hover:underline transition-colors">
                  Gaming
                </Link>
              </li>
              <li>
                <Link href="/marketplace?category=Entertainment" className="hover:text-black hover:underline transition-colors">
                  Entertainment
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="mb-4 text-[10px] font-black uppercase tracking-[.16em] text-black border-b border-black/20 pb-1">
              Account & Support
            </h4>
            <ul className="space-y-3 text-sm font-semibold text-black/80">
              <li>
                <Link href="/dashboard" className="hover:text-black hover:underline transition-colors">
                  My Orders
                </Link>
              </li>
              <li>
                <Link href="/contact" className="inline-flex items-center gap-1 hover:text-black hover:underline transition-colors">
                  Get Support <ArrowUpRight className="h-3.5 w-3.5 stroke-[2.5px]" />
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-6 border-t border-black/20 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[11px] font-medium text-black/70">
            &copy; {currentYear} SOLCart. All rights reserved. Sourced gift cards are trademarks of their respective brand issuers.
          </p>
        </div>
      </div>
    </footer>
  );
}
