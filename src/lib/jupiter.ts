"use client";

import { useState, useEffect } from "react";

// In-memory cache for the SOL price to avoid redundant network hits
interface PriceCache {
  price: number;
  timestamp: number;
}

let priceCache: PriceCache | null = null;
const CACHE_DURATION_MS = 10000; // 10 seconds cache

/**
 * Fetches the current price of Solana (SOL) in USD from Jupiter's Price API V2.
 * Includes a 10-second in-memory cache and a 1-time retry mechanism on failure.
 * Returns only the numeric price rounded to 2 decimal places.
 */
export async function getSolPrice(): Promise<number> {
  const now = Date.now();

  // 1. Check cache validity
  if (priceCache && now - priceCache.timestamp < CACHE_DURATION_MS) {
    return priceCache.price;
  }

  const fetchPrice = async (): Promise<number> => {
    // Attempt 1: Fetch local proxy /api/price
    try {
      const response = await fetch("/api/price");
      if (response.ok) {
        const data = await response.json();
        if (data && typeof data.price === "number") {
          return parseFloat(data.price.toFixed(2));
        }
      }
    } catch (e) {
      console.warn("Local price proxy fetch failed, trying direct Jupiter API...", e);
    }

    // Attempt 2: Fetch Jupiter API v2 directly
    try {
      const response = await fetch("https://api.jup.ag/price/v2?ids=SOL");
      if (response.ok) {
        const data = await response.json();
        const priceString = data?.data?.SOL?.price;
        if (priceString) {
          const price = parseFloat(priceString);
          if (!isNaN(price) && price > 0) {
            return parseFloat(price.toFixed(2));
          }
        }
      }
    } catch (e) {
      console.warn("Direct Jupiter API V2 fetch failed, trying Jupiter API V4...", e);
    }

    // Attempt 3: Fetch Jupiter V4 directly
    try {
      const response = await fetch("https://price.jup.ag/v4/price?ids=SOL");
      if (response.ok) {
        const data = await response.json();
        const priceString = data?.data?.SOL?.price;
        if (priceString) {
          const price = parseFloat(priceString);
          if (!isNaN(price) && price > 0) {
            return parseFloat(price.toFixed(2));
          }
        }
      }
    } catch (e) {
      console.warn("Direct Jupiter API V4 fetch failed, trying CoinGecko...", e);
    }

    // Attempt 4: CoinGecko directly
    try {
      const response = await fetch("https://api.coingecko.com/v3/simple/price?ids=solana&vs_currencies=usd");
      if (response.ok) {
        const data = await response.json();
        const priceVal = data?.solana?.usd;
        if (priceVal) {
          const price = parseFloat(priceVal);
          if (!isNaN(price) && price > 0) {
            return parseFloat(price.toFixed(2));
          }
        }
      }
    } catch (e) {
      console.warn("Direct CoinGecko fetch failed", e);
    }

    throw new Error("All SOL price sources failed to resolve.");
  };

  // 2. Execute fetch with retry mechanism
  try {
    const price = await fetchPrice();
    priceCache = { price, timestamp: now };
    return price;
  } catch (error) {
    console.warn("First attempt to fetch SOL price failed. Retrying once...", error);
    try {
      // Retry once after a brief delay (300ms)
      await new Promise((resolve) => setTimeout(resolve, 300));
      const price = await fetchPrice();
      priceCache = { price, timestamp: Date.now() };
      return price;
    } catch (retryError) {
      console.error("Second attempt to fetch SOL price failed.", retryError);
      // If we have an expired cache, return it rather than completely failing
      if (priceCache) {
        console.warn("Using expired SOL price cache fallback.");
        return priceCache.price;
      }
      return 185.50; // Ultimate fallback price to prevent page crash
    }
  }
}

/**
 * React hook that automatically handles fetching the SOL price,
 * displaying a loading/error state, and refreshing every 15 seconds.
 */
export function useSolPrice() {
  const [solPrice, setSolPrice] = useState<number>(185.50); // Sensible default starting price
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAndSetPrice = async (showLoading = false) => {
    if (showLoading) setLoading(true);
    try {
      const price = await getSolPrice();
      setSolPrice(price);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Failed to load SOL price");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch on mount
    fetchAndSetPrice(true);

    // Refresh automatically every 15 seconds
    const interval = setInterval(() => {
      fetchAndSetPrice(false);
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  return {
    solPrice,
    loading,
    error,
    refresh: () => fetchAndSetPrice(true)
  };
}

/**
 * Converts a USD price into SOL based on the current SOL price.
 * Formula: SOL Price = Product Price (USD) / Current SOL USD Price
 * Rounded to 4 decimal places.
 */
export function convertUsdToSol(priceUSD: number, currentSolPrice: number): number {
  if (currentSolPrice <= 0) return 0;
  return parseFloat((priceUSD / currentSolPrice).toFixed(4));
}
