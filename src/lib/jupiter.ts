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
    const isClient = typeof window !== "undefined";
    const url = isClient ? "/api/price" : "https://api.jup.ag/price/v2?ids=SOL";
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Jupiter API returned status ${response.status}`);
    }
    const data = await response.json();

    if (isClient) {
      if (typeof data.price === "number") {
        return parseFloat(data.price.toFixed(2));
      }
      throw new Error("Invalid response format from local price proxy");
    }
    
    const priceString = data?.data?.SOL?.price;
    if (!priceString) {
      throw new Error("Invalid response format from Jupiter Price API");
    }
    const price = parseFloat(priceString);
    if (isNaN(price)) {
      throw new Error("Fetched price is not a number");
    }
    
    // Format to 2 decimal places (as a number)
    return parseFloat(price.toFixed(2));
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
      throw new Error("Failed to fetch live SOL price after retry");
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
