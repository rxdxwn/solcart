import { PriceCache } from "../types";

const CACHE_KEY = "solcart_sol_price_cache";
const CACHE_DURATION_MS = 15000; // 15 seconds cache duration
const DEFAULT_FALLBACK_PRICE = 185.50; // Decent default SOL price in USD

export class PythService {
  /**
   * Fetches the current SOL price in USD.
   * Leverages public Jupiter/CoinGecko APIs and includes fallback logic.
   */
  static async getSOLPrice(): Promise<number> {
    // 1. Try to read from cache first
    const cached = this.getCachedPrice();
    if (cached) {
      return cached.priceUSD;
    }

    try {
      // 2. Fetch from Jupiter Price API V2 (very fast and no API keys required)
      const res = await fetch("https://api.jup.ag/price/v2?ids=SOL", {
        next: { revalidate: 15 } // Next.js fetch caching
      });
      
      if (res.ok) {
        const data = await res.json();
        const priceStr = data?.data?.SOL?.price;
        if (priceStr) {
          const price = parseFloat(priceStr);
          this.setCachedPrice(price);
          return price;
        }
      }
    } catch (e) {
      console.warn("Could not fetch price from Jupiter API, trying backup...", e);
    }

    try {
      // Backup: Try CoinGecko simple price API
      const res = await fetch("https://api.coingecko.com/v3/simple/price?ids=solana&vs_currencies=usd");
      if (res.ok) {
        const data = await res.json();
        const price = data?.solana?.usd;
        if (price) {
          this.setCachedPrice(price);
          return price;
        }
      }
    } catch (e) {
      console.warn("Could not fetch price from CoinGecko backup, using fallback.", e);
    }

    // 3. Fallback: Return cached price (even if expired) or absolute default
    const expiredCache = this.getExpiredCachedPrice();
    return expiredCache ? expiredCache.priceUSD : DEFAULT_FALLBACK_PRICE;
  }

  private static getCachedPrice(): PriceCache | null {
    if (typeof window === "undefined") return null;
    try {
      const stored = localStorage.getItem(CACHE_KEY);
      if (!stored) return null;
      const cache: PriceCache = JSON.parse(stored);
      const age = Date.now() - new Date(cache.lastUpdated).getTime();
      if (age < CACHE_DURATION_MS) {
        return cache;
      }
    } catch (e) {
      console.error("Failed to read price cache", e);
    }
    return null;
  }

  private static getExpiredCachedPrice(): PriceCache | null {
    if (typeof window === "undefined") return null;
    try {
      const stored = localStorage.getItem(CACHE_KEY);
      if (!stored) return null;
      return JSON.parse(stored);
    } catch {
      return null;
    }
  }

  private static setCachedPrice(price: number): void {
    if (typeof window === "undefined") return;
    try {
      const cache: PriceCache = {
        symbol: "SOL",
        priceUSD: price,
        lastUpdated: new Date().toISOString()
      };
      localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
    } catch (e) {
      console.error("Failed to save price cache", e);
    }
  }
}
