"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { APP_VERSION } from "../../lib/version";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  showVersion?: boolean;
  className?: string;
}

export function Logo({ size = "md", showVersion = false, className = "" }: LogoProps) {
  const logoDimensions = {
    sm: { width: 101, height: 24 },
    md: { width: 135, height: 32 },
    lg: { width: 151, height: 36 }
  };

  return (
    <Link href="/" className={`flex items-center gap-2 group transition-transform duration-300 hover:scale-[1.01] ${className}`}>
      <Image
        src="/logo.png"
        alt="SOLCart Logo"
        width={logoDimensions[size].width}
        height={logoDimensions[size].height}
        className="object-contain"
        priority
      />
      {showVersion && (
        <span className="font-mono font-extrabold rounded bg-brand-purple/20 text-brand-purple border border-brand-purple/30 shadow-sm text-[8px] px-1.5 py-0.5 leading-none shrink-0 self-center">
          {APP_VERSION}
        </span>
      )}
    </Link>
  );
}

export function LogoMark({ size = "md", className = "" }: { size?: "sm" | "md" | "lg"; className?: string }) {
  const sizes = {
    sm: "h-7 w-7",
    md: "h-9 w-9",
    lg: "h-10 w-10"
  };

  return (
    <div className={`relative shrink-0 overflow-hidden rounded ${sizes[size]} ${className}`}>
      <Image
        src="/logo.png"
        alt="SOLCart Icon"
        fill
        className="object-cover object-left"
        priority
      />
    </div>
  );
}

export function LogoText({ size = "md", className = "" }: { size?: "sm" | "md" | "lg"; className?: string }) {
  const sizeClasses = {
    sm: "text-base font-bold",
    md: "text-lg font-bold",
    lg: "text-xl font-extrabold",
  };

  return (
    <span className={`tracking-tight text-white leading-none ${sizeClasses[size]} ${className}`}>
      SOL<span className="solana-gradient-text">Cart</span>
    </span>
  );
}