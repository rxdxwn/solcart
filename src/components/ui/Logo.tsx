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
  // Dimensions calculated based on the image's ~4.2:1 aspect ratio
  const dimensions = {
    sm: { width: 92, height: 22 },
    md: { width: 118, height: 28 },
    lg: { width: 152, height: 36 }
  };

  const { width, height } = dimensions[size];

  return (
    <Link href="/" className={`flex items-center gap-2.5 shrink-0 ${className}`}>
      <Image
        src="/logo.png"
        alt="SOLCart Logo"
        width={width}
        height={height}
        className="object-contain"
        priority
      />
      {showVersion && (
        <span className="font-mono font-extrabold rounded bg-[#FF0000]/10 text-[#FF0000] border border-[#FF0000]/25 shadow-sm text-[8px] px-1.5 py-0.5 leading-none shrink-0 self-center">
          {APP_VERSION}
        </span>
      )}
    </Link>
  );
}

export function LogoMark({ size = "md", className = "" }: { size?: "sm" | "md" | "lg"; className?: string }) {
  const sizes = {
    sm: 24,
    md: 32,
    lg: 40
  };

  const imgSize = sizes[size];

  return (
    <div className={`relative shrink-0 flex items-center justify-center ${className}`} style={{ width: imgSize, height: imgSize }}>
      <Image
        src="/logo_symbol.png"
        alt="SOLCart Logo Mark"
        width={imgSize}
        height={imgSize}
        className="object-contain"
        priority
      />
    </div>
  );
}

export function LogoText({ size = "md", className = "" }: { size?: "sm" | "md" | "lg"; className?: string }) {
  const dimensions = {
    sm: { width: 92, height: 22 },
    md: { width: 118, height: 28 },
    lg: { width: 152, height: 36 }
  };

  const { width, height } = dimensions[size];

  return (
    <Image
      src="/logo.png"
      alt="SOLCart Logo Text"
      width={width}
      height={height}
      className={`object-contain ${className}`}
      priority
    />
  );
}