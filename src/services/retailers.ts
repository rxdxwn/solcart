import { Product, RetailerConfig } from "../types";

const DEFAULT_RETAILERS: RetailerConfig[] = [
  {
    id: "amazon",
    name: "Amazon",
    logo: "https://images.unsplash.com/photo-1523474253046-8cd2748b5fd2?w=100&auto=format&fit=crop&q=60",
    markupPercentage: 0,
    isActive: true,
    description: "Shop millions of items worldwide with Amazon Digital Gift Cards."
  },
  {
    id: "apple",
    name: "Apple",
    logo: "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=100&auto=format&fit=crop&q=60",
    markupPercentage: 0,
    isActive: true,
    description: "App Store & iTunes credit for apps, games, music, movies, and iCloud storage."
  },
  {
    id: "steam",
    name: "Steam",
    logo: "https://images.unsplash.com/photo-1612287230202-1bf1d85d1bdf?w=100&auto=format&fit=crop&q=60",
    markupPercentage: 0,
    isActive: true,
    description: "Top up Steam Wallets to buy thousands of PC games instantly."
  },
  {
    id: "playstation",
    name: "PlayStation",
    logo: "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=100&auto=format&fit=crop&q=60",
    markupPercentage: 0,
    isActive: true,
    description: "Download the latest PS5 games and add-ons via PlayStation Network store."
  },
  {
    id: "xbox",
    name: "Xbox",
    logo: "https://images.unsplash.com/photo-1605901309584-818e25960a8f?w=100&auto=format&fit=crop&q=60",
    markupPercentage: 0,
    isActive: true,
    description: "Redeem Xbox Game Pass and purchase Microsoft digital store credits."
  },
  {
    id: "spotify",
    name: "Spotify",
    logo: "https://images.unsplash.com/photo-1614680376593-902f74fa0d41?w=100&auto=format&fit=crop&q=60",
    markupPercentage: 0,
    isActive: true,
    description: "Upgrade or renew Spotify Premium for uninterrupted ad-free music."
  },
  {
    id: "netflix",
    name: "Netflix",
    logo: "https://images.unsplash.com/photo-1574375927938-d5a98e8edd85?w=100&auto=format&fit=crop&q=60",
    markupPercentage: 0,
    isActive: true,
    description: "Settle subscription payments for unlimited streaming of movies and TV shows."
  },
  {
    id: "noon",
    name: "Noon",
    logo: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=100&auto=format&fit=crop&q=60",
    markupPercentage: 0,
    isActive: true,
    description: "Shop millions of items on Noon.com in the UAE, Saudi Arabia, and Egypt."
  }
];

const DEFAULT_PRODUCTS: Product[] = [
  {
    id: "p-amazon-50-us",
    name: "Amazon $50 Gift Card",
    description: "Shop millions of products on Amazon. Valid for United States Amazon accounts.",
    brand: "Amazon",
    image: "/images/amazon-card.jpg",
    category: "Retail",
    rating: 4.9,
    reviewsCount: 142,
    retailPrice: 50.00,
    marketplacePrice: 50.00,
    estimatedDelivery: "Instant Digital Delivery",
    specs: {
      "Format": "Digital Code",
      "Redemption": "Amazon.com",
      "Region": "United States (US)",
      "Expiration": "None"
    },
    retailerId: "amazon",
    stockCount: 500,
    isFeatured: true,
    reviews: [],
    pricePoints: [50],
    currency: "USD",
    region: "United States",
    regions: ["United States"]
  },
  {
    id: "p-apple-100-us",
    name: "Apple $100 App Store & iTunes Card",
    description: "Redeem for apps, games, music, movies, and iCloud subscriptions on US Apple accounts.",
    brand: "Apple",
    image: "/images/apple-card.jpg",
    category: "Entertainment",
    rating: 4.8,
    reviewsCount: 98,
    retailPrice: 100.00,
    marketplacePrice: 100.00,
    estimatedDelivery: "Instant Digital Delivery",
    specs: {
      "Format": "Digital Code",
      "Redemption": "App Store / iTunes",
      "Region": "United States (US)",
      "Expiration": "None"
    },
    retailerId: "apple",
    stockCount: 200,
    isFeatured: true,
    reviews: [],
    pricePoints: [100],
    currency: "USD",
    region: "United States",
    regions: ["United States"]
  },
  {
    id: "p-steam-50-us",
    name: "Steam $50 Wallet Card",
    description: "Add $50 directly to your Steam Account. Instant access to games and DLCs.",
    brand: "Steam",
    image: "/images/steam-card.jpg",
    category: "Gaming",
    rating: 4.9,
    reviewsCount: 230,
    retailPrice: 50.00,
    marketplacePrice: 50.00,
    estimatedDelivery: "Instant Digital Delivery",
    specs: {
      "Format": "Digital Code",
      "Redemption": "Steam Client",
      "Region": "United States (US)",
      "Expiration": "None"
    },
    retailerId: "steam",
    stockCount: 800,
    isFeatured: true,
    reviews: [],
    pricePoints: [50],
    currency: "USD",
    region: "United States",
    regions: ["United States"]
  },
  {
    id: "p-amazon-25-uk",
    name: "Amazon £25 Gift Card",
    description: "Shop millions of items on Amazon.co.uk. Redeemable on UK accounts.",
    brand: "Amazon",
    image: "/images/amazon-card.jpg",
    category: "Retail",
    rating: 4.9,
    reviewsCount: 85,
    retailPrice: 25.00,
    marketplacePrice: 25.00,
    estimatedDelivery: "Instant Digital Delivery",
    specs: {
      "Format": "Digital Code",
      "Redemption": "Amazon.co.uk",
      "Region": "United Kingdom (GB)",
      "Expiration": "None"
    },
    retailerId: "amazon",
    stockCount: 300,
    isFeatured: true,
    reviews: [],
    pricePoints: [25],
    currency: "GBP",
    region: "United Kingdom",
    regions: ["United Kingdom"]
  },
  {
    id: "p-nike-50-us",
    name: "Nike $50 Gift Card",
    description: "Shop the latest Nike footwear, apparel, and equipment online or in-store.",
    brand: "Nike",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&auto=format&fit=crop&q=60",
    category: "Apparel",
    rating: 4.7,
    reviewsCount: 64,
    retailPrice: 50.00,
    marketplacePrice: 50.00,
    estimatedDelivery: "Instant Digital Delivery",
    specs: {
      "Format": "Digital Code",
      "Redemption": "Nike US Stores & Online",
      "Region": "United States (US)",
      "Expiration": "None"
    },
    retailerId: "nike",
    stockCount: 100,
    isFeatured: true,
    reviews: [],
    pricePoints: [50],
    currency: "USD",
    region: "United States",
    regions: ["United States"]
  }
];


export class RetailerService {
  private static isSyncing = false;

  /**
   * Guards against the server sync overwriting local product edits before the
   * POST write to the central DB has landed. Once a local product mutation has
   * happened, the local copy wins until the server write confirms.
   */
  private static markProductsDirty(): void {
    if (typeof window === "undefined") return;
    localStorage.setItem("solcart_products_dirty", String(Date.now()));
  }

  private static clearProductsDirty(): void {
    if (typeof window === "undefined") return;
    localStorage.removeItem("solcart_products_dirty");
  }

  private static hasPendingProductWrites(): boolean {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("solcart_products_dirty") !== null;
  }

  private static getStoredRetailers(): RetailerConfig[] {
    if (typeof window === "undefined") return DEFAULT_RETAILERS;
    const stored = localStorage.getItem("solcart_retailers");
    if (!stored) {
      localStorage.setItem("solcart_retailers", JSON.stringify(DEFAULT_RETAILERS));
      return DEFAULT_RETAILERS;
    }
    try {
      return JSON.parse(stored);
    } catch {
      return DEFAULT_RETAILERS;
    }
  }

  private static getStoredProducts(): Product[] {
    if (typeof window === "undefined") return DEFAULT_PRODUCTS;
    const stored = localStorage.getItem("solcart_products");
    if (!stored) {
      localStorage.setItem("solcart_products", JSON.stringify(DEFAULT_PRODUCTS));
      return DEFAULT_PRODUCTS;
    }
    try {
      return JSON.parse(stored);
    } catch {
      return DEFAULT_PRODUCTS;
    }
  }

  /**
   * Syncs browser local storage with server DB API endpoint
   */
  static async syncWithServer(): Promise<void> {
    if (typeof window === "undefined" || this.isSyncing) return;
    this.isSyncing = true;
    try {
      const res = await fetch("/api/db");
      if (res.ok) {
        const result = await res.json();
        if (result.success && result.data) {
          if (result.data.retailers) {
            localStorage.setItem("solcart_retailers", JSON.stringify(result.data.retailers));
          }
          if (result.data.products && Array.isArray(result.data.products)) {
            const currentLocal = this.getStoredProducts();
            const serverProducts: Product[] = result.data.products;
            const serverIdSet = new Set(serverProducts.map(sp => sp.id));
            const localOnly = currentLocal.filter(p => !serverIdSet.has(p.id));
            
            if (this.hasPendingProductWrites()) {
              const localMap = new Map(currentLocal.map(p => [p.id, p]));
              const mergedServer = serverProducts.map(sp => localMap.get(sp.id) || sp);
              const finalProducts = [...localOnly, ...mergedServer];
              localStorage.setItem("solcart_products", JSON.stringify(finalProducts));
            } else {
              const finalProducts = [...localOnly, ...serverProducts];
              localStorage.setItem("solcart_products", JSON.stringify(finalProducts));
            }
          }
          window.dispatchEvent(new Event("solcart-db-synced"));
        }
      }
    } catch (e) {
      console.warn("RetailerService background sync skipped", e);
    } finally {
      this.isSyncing = false;
    }
  }

  static getRetailers(): RetailerConfig[] {
    this.syncWithServer();
    return this.getStoredRetailers();
  }

  static updateRetailerMarkup(retailerId: string, newMarkup: number): void {
    const retailers = this.getStoredRetailers();
    const index = retailers.findIndex(r => r.id === retailerId);
    if (index !== -1) {
      retailers[index].markupPercentage = newMarkup;
      localStorage.setItem("solcart_retailers", JSON.stringify(retailers));
      
      const products = this.getStoredProducts();
      const updatedProducts = products.map(product => {
        if (product.retailerId === retailerId) {
          return {
            ...product,
            marketplacePrice: product.retailPrice
          };
        }
        return product;
      });
      localStorage.setItem("solcart_products", JSON.stringify(updatedProducts));
      this.markProductsDirty();
      window.dispatchEvent(new Event("solcart-db-synced"));

      // Post to central server DB API
      fetch("/api/db", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "updateRetailerMarkup",
          payload: { retailerId, markupPercentage: newMarkup }
        })
      }).catch(() => {});
    }
  }

  static getProducts(): Product[] {
    this.syncWithServer();
    return this.getStoredProducts();
  }

  static getProductById(id: string): Product | undefined {
    return this.getProducts().find(p => p.id === id);
  }

  static async addProduct(product: Omit<Product, "marketplacePrice">): Promise<void> {
    const products = this.getStoredProducts();
    const marketplacePrice = product.retailPrice;
    const newProduct: Product = {
      ...product,
      marketplacePrice
    };
    
    // Put at top of list so newest added products are instantly visible
    const updatedProducts = [newProduct, ...products.filter(p => p.id !== newProduct.id)];
    this.markProductsDirty();
    localStorage.setItem("solcart_products", JSON.stringify(updatedProducts));
    window.dispatchEvent(new Event("solcart-db-synced"));

    try {
      await fetch("/api/db", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "addProduct",
          payload: newProduct
        })
      });
    } finally {
      this.clearProductsDirty();
    }
  }

  static deleteProduct(productId: string): void {
    const products = this.getStoredProducts().filter(p => p.id !== productId);
    this.markProductsDirty();
    localStorage.setItem("solcart_products", JSON.stringify(products));
    window.dispatchEvent(new Event("solcart-db-synced"));

    fetch("/api/db", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "deleteProduct",
        payload: { productId }
      })
    }).then(() => this.clearProductsDirty()).catch(() => {});
  }

  static async updateProduct(productId: string, updatedFields: Partial<Omit<Product, "marketplacePrice">>): Promise<void> {
    const products = this.getStoredProducts();
    const index = products.findIndex(p => p.id === productId);
    if (index !== -1) {
      const existing = products[index];
      const merged = { ...existing, ...updatedFields };
      if (merged.retailPrice !== undefined) {
        merged.marketplacePrice = merged.retailPrice;
      }
      
      products[index] = merged as Product;
      this.markProductsDirty();
      localStorage.setItem("solcart_products", JSON.stringify(products));
      window.dispatchEvent(new Event("solcart-db-synced"));

      try {
        await fetch("/api/db", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "updateProduct",
            payload: { productId, updates: updatedFields }
          })
        });
      } finally {
        this.clearProductsDirty();
      }
    }
  }

  static resetDatabase(): void {
    if (typeof window !== "undefined") {
      localStorage.removeItem("solcart_retailers");
      localStorage.removeItem("solcart_products");
      this.clearProductsDirty();
    }
    fetch("/api/db", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "resetToDefault", payload: {} })
    }).catch(() => {});
  }
}

