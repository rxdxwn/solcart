const CACHE_KEY = "solcart_forex_cache";
const CACHE_DURATION_MS = 60 * 60 * 1000; // 1 hour cache duration

// Fallback rates (how many of native currency equals 1 USD)
const FALLBACK_RATES: Record<string, number> = {
  USD: 1.0,
  SGD: 1.34,
  GBP: 0.78,
  CAD: 1.37,
  EUR: 0.92,
  AED: 3.67
};

// =========================================================================
// SUPPORTED LAUNCH REGIONS
// -------------------------------------------------------------------------
// Idea 2: Limited launch countries (US, UK, SG, CA) that already have
// pre-saved gift card inventory in the GC_INVENTORY store. All other
// countries are surfaced in the UI as "Available soon".
//
// Each region lists its native currency so prices can be displayed in the
// customer's local currency via the live forex feed. SOL settlement always
// happens against the USD face value, which removes forex-slippage risk on
// the payment side (Idea 1 margin buffer can absorb minor rate drift).
// =========================================================================
export interface RegionInfo {
  name: string;
  code: string;
  currency: string;
}

export const SUPPORTED_REGIONS: RegionInfo[] = [
  { name: "United States", code: "US", currency: "USD" },
  { name: "United Kingdom", code: "GB", currency: "GBP" },
  { name: "Singapore", code: "SG", currency: "SGD" },
  { name: "Canada", code: "CA", currency: "CAD" }
];

export function getRegionInfo(name: string): RegionInfo | undefined {
  return SUPPORTED_REGIONS.find(r => r.name === name);
}

export function isRegionSupported(name: string): boolean {
  return !!getRegionInfo(name);
}

export class ForexService {
  private static rates: Record<string, number> = { ...FALLBACK_RATES };
  private static lastUpdated = 0;
  private static isFetching = false;

  private static loadCache() {
    if (typeof window === "undefined") return;
    try {
      const stored = localStorage.getItem(CACHE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        const age = Date.now() - parsed.timestamp;
        if (age < CACHE_DURATION_MS) {
          this.rates = parsed.rates;
          this.lastUpdated = parsed.timestamp;
        }
      }
    } catch (e) {
      console.warn("Failed to load forex cache", e);
    }
  }

  private static saveCache() {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify({
        rates: this.rates,
        timestamp: this.lastUpdated
      }));
    } catch (e) {
      console.warn("Failed to save forex cache", e);
    }
  }

  static async fetchRates(): Promise<Record<string, number>> {
    this.loadCache();
    
    // If rates are valid and not expired, return them
    if (Date.now() - this.lastUpdated < CACHE_DURATION_MS) {
      return this.rates;
    }

    if (this.isFetching) return this.rates;
    this.isFetching = true;

    try {
      const res = await fetch("https://open.er-api.com/v6/latest/USD");
      if (res.ok) {
        const data = await res.json();
        if (data && data.rates) {
          const newRates: Record<string, number> = {};
          // Only extract currencies we care about
          const keys = ["USD", "SGD", "GBP", "CAD", "EUR", "AED"];
          keys.forEach(k => {
            if (data.rates[k]) {
              newRates[k] = data.rates[k];
            } else {
              newRates[k] = FALLBACK_RATES[k];
            }
          });
          this.rates = newRates;
          this.lastUpdated = Date.now();
          this.saveCache();
        }
      }
    } catch (e) {
      console.warn("Failed to fetch live forex rates, using cached or fallbacks", e);
    } finally {
      this.isFetching = false;
    }

    return this.rates;
  }

  /**
   * Converts a native currency amount to USD
   */
  static convertToUSD(amount: number, currency: string): number {
    this.loadCache();
    const rate = this.rates[currency.toUpperCase()] || FALLBACK_RATES[currency.toUpperCase()] || 1.0;
    return parseFloat((amount / rate).toFixed(2));
  }

  /**
   * Converts a USD amount to a native currency amount
   */
  static convertFromUSD(amount: number, currency: string): number {
    this.loadCache();
    const rate = this.rates[currency.toUpperCase()] || FALLBACK_RATES[currency.toUpperCase()] || 1.0;
    return parseFloat((amount * rate).toFixed(2));
  }

  /**
   * Gets the symbol for a currency code
   */
  static getCurrencySymbol(currency: string): string {
    switch (currency.toUpperCase()) {
      case "SGD": return "S$";
      case "GBP": return "£";
      case "EUR": return "€";
      case "CAD": return "C$";
      case "AED": return "AED ";
      case "USD":
      default: return "$";
    }
  }
}
