"use client";

import React from "react";

interface GiftCardArtworkProps {
  brand: string;
  value: string | number;
  imageUrl?: string;
  className?: string;
  aspectRatio?: "card" | "video" | "square";
  isThumbnail?: boolean;
}

export function GiftCardArtwork({ brand, value, imageUrl, className = "", aspectRatio = "card", isThumbnail = false }: GiftCardArtworkProps) {
  const brandKey = brand.toLowerCase();
  
  // Format value
  const displayValue = typeof value === "number" ? `$${value}` : value;

  // Configuration for each brand card
  const config: Record<string, {
    bg: string;
    logoUrl: string;
    logoClass?: string;
    label: string;
    accentColor: string;
  }> = {
    amazon: {
      bg: "bg-gradient-to-br from-[#191E26] via-[#232F3E] to-[#0F141A]",
      logoUrl: "https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg",
      logoClass: "invert brightness-0 filter group-hover:brightness-100 group-hover:invert-0 transition-all duration-300",
      label: "DIGITAL GIFT CARD",
      accentColor: "#FF9900"
    },
    apple: {
      bg: "bg-gradient-to-br from-[#1C1C1E] via-[#2C2C2E] to-[#101012]",
      logoUrl: "https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg",
      logoClass: "invert filter brightness-200",
      label: "App Store & iTunes",
      accentColor: "#FFFFFF"
    },
    steam: {
      bg: "bg-gradient-to-br from-[#171A21] via-[#2A475E] to-[#1B2838]",
      logoUrl: "https://upload.wikimedia.org/wikipedia/commons/8/83/Steam_icon_logo.svg",
      logoClass: "invert filter brightness-110",
      label: "STEAM WALLET CODE",
      accentColor: "#66C0F4"
    },
    playstation: {
      bg: "bg-gradient-to-br from-[#003087] via-[#0054B4] to-[#001D4A]",
      logoUrl: "https://upload.wikimedia.org/wikipedia/commons/0/00/PlayStation_logo.svg",
      logoClass: "invert filter brightness-200",
      label: "PLAYSTATION STORE",
      accentColor: "#0072CE"
    },
    xbox: {
      bg: "bg-gradient-to-br from-[#0E7A0D] via-[#1A1A1A] to-[#050B05]",
      logoUrl: "https://upload.wikimedia.org/wikipedia/commons/f/f9/Xbox_one_logo.svg",
      logoClass: "invert filter brightness-200",
      label: "XBOX LIVE GOLD",
      accentColor: "#107C10"
    },
    spotify: {
      bg: "bg-gradient-to-br from-[#191414] via-[#103018] to-[#121212]",
      logoUrl: "https://upload.wikimedia.org/wikipedia/commons/1/19/Spotify_logo_without_text.svg",
      logoClass: "brightness-100",
      label: "SPOTIFY PREMIUM",
      accentColor: "#1DB954"
    },
    netflix: {
      bg: "bg-gradient-to-br from-[#141414] via-[#3C0509] to-[#0A0A0A]",
      logoUrl: "https://upload.wikimedia.org/wikipedia/commons/0/0c/Netflix_2016_N_logo.svg",
      logoClass: "brightness-100 filter",
      label: "NETFLIX STORE VOUCHER",
      accentColor: "#E50914"
    },
    nike: {
      bg: "bg-gradient-to-br from-[#111111] via-[#222222] to-[#0A0A0A]",
      logoUrl: "https://upload.wikimedia.org/wikipedia/commons/a/a6/Logo_NIKE.svg",
      logoClass: "invert filter brightness-200",
      label: "NIKE VOUCHER",
      accentColor: "#FFFFFF"
    }
  };

  const isConfigured = brandKey in config;

  // Determine aspect ratio class
  const aspectClass = 
    aspectRatio === "video" ? "aspect-[16/9]" : 
    aspectRatio === "square" ? "aspect-square" : 
    "aspect-[1.586/1]"; // Standard credit card/gift card ratio

  // If not configured and imageUrl exists, render custom image directly
  if (!isConfigured && imageUrl) {
    return (
      <div className={`relative w-full ${aspectClass} rounded-xl border border-white/10 overflow-hidden shadow-2xl group ${className}`}>
        <img
          src={imageUrl}
          alt={`${brand} Gift Card`}
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-103 transition-transform duration-500 select-none pointer-events-none"
        />
        {/* Holographic light overlay */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent pointer-events-none opacity-60"></div>
        {/* Value badge */}
        {!isThumbnail && (
          <div className="absolute top-3 right-3 px-2 py-1 rounded bg-black/70 backdrop-blur-sm text-[8px] sm:text-[9px] font-black text-white border border-white/10 shadow-md leading-none">
            {displayValue}
          </div>
        )}
      </div>
    );
  }

  const cardConfig = config[brandKey] || {
    bg: "bg-gradient-to-br from-brand-card via-indigo-950/40 to-brand-dark",
    logoUrl: "",
    label: "GLOBAL VOUCHER",
    accentColor: "#9945FF"
  };

  // Render simplified card if in thumbnail mode
  if (isThumbnail) {
    return (
      <div className={`relative w-full ${aspectClass} rounded-xl ${cardConfig.bg} border border-white/10 overflow-hidden shadow-2xl p-2 flex items-center justify-center select-none group ${className}`}>
        {/* Background radial highlight */}
        <div 
          className="absolute -top-1/4 -right-1/4 w-3/4 h-3/4 rounded-full blur-[40px] opacity-15 pointer-events-none"
          style={{ backgroundColor: cardConfig.accentColor }}
        ></div>
        
        {/* Center brand logo */}
        <div className="flex items-center justify-center z-10 w-full h-full max-h-[75%]">
          {cardConfig.logoUrl ? (
            <img 
              src={cardConfig.logoUrl} 
              alt={`${brand} logo`}
              onError={(e) => {
                (e.target as HTMLElement).style.display = "none";
                const fb = document.getElementById(`fallback-thumb-${brandKey}`);
                if (fb) fb.style.display = "block";
              }}
              className={`h-4.5 w-auto max-w-[80%] object-contain select-none pointer-events-none ${cardConfig.logoClass || ""}`}
            />
          ) : null}
          <span 
            id={`fallback-thumb-${brandKey}`} 
            className="text-[9px] font-black text-white uppercase tracking-wider text-center" 
            style={{ display: cardConfig.logoUrl ? "none" : "block" }}
          >
            {brand}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative w-full ${aspectClass} rounded-xl ${cardConfig.bg} border border-white/10 overflow-hidden shadow-2xl p-4 flex flex-col justify-between select-none group ${className}`}>
      
      {/* Holographic light overlay */}
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent pointer-events-none opacity-40 group-hover:scale-150 transition-transform duration-1000"></div>
      
      {/* Background radial highlight */}
      <div 
        className="absolute -top-1/4 -right-1/4 w-3/4 h-3/4 rounded-full blur-[60px] opacity-15 pointer-events-none transition-all duration-500 group-hover:scale-110"
        style={{ backgroundColor: cardConfig.accentColor }}
      ></div>

      {/* Top row */}
      <div className="flex justify-between items-start z-10">
        <div className="flex flex-col items-start">
          <span className="text-[7px] sm:text-[8px] font-black tracking-widest text-white/50 uppercase leading-none">
            Digital Code
          </span>
          <span className="text-[9px] sm:text-[10px] font-bold text-white tracking-tight mt-1 leading-none">
            {cardConfig.label}
          </span>
        </div>
        <div className="px-2 py-0.5 rounded bg-black/60 backdrop-blur-sm text-[8px] sm:text-[9px] font-black text-white border border-white/10 shadow-sm leading-none shrink-0">
          {displayValue}
        </div>
      </div>

      {/* Center brand logo */}
      <div className="flex items-center justify-center py-2 z-10 flex-1 min-h-0">
        {cardConfig.logoUrl ? (
          <img 
            src={cardConfig.logoUrl} 
            alt={`${brand} logo`}
            onError={(e) => {
              (e.target as HTMLElement).style.display = "none";
              const fb = document.getElementById(`fallback-${brandKey}`);
              if (fb) fb.style.display = "block";
            }}
            className={`h-8 sm:h-9 w-auto max-w-[65%] object-contain select-none pointer-events-none ${cardConfig.logoClass || ""}`}
          />
        ) : null}
        <span 
          id={`fallback-${brandKey}`} 
          className="text-sm font-black text-white" 
          style={{ display: cardConfig.logoUrl ? "none" : "block" }}
        >
          {brand}
        </span>
      </div>

      {/* Bottom row */}
      <div className="flex justify-between items-center z-10 pt-1.5 border-t border-white/5">
        <div className="flex items-center gap-1">
          <span className="h-1 w-1 rounded-full bg-brand-green animate-pulse"></span>
          <span className="text-[7px] font-bold text-white/40 tracking-wider uppercase font-mono">
            INSTANT DELIVERY
          </span>
        </div>
        <div className="flex items-center text-[7px] text-white/40 font-mono">
          <span>•••• •••• •••• {brand.slice(0, 3).toUpperCase()}</span>
        </div>
      </div>
      
    </div>
  );
}
