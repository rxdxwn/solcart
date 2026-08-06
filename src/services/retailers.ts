import { Product, RetailerConfig } from "../types";

/**
 * Get authentication headers for API requests
 */
function getAuthHeaders(): HeadersInit {
  if (typeof window === "undefined") {
    return { "Content-Type": "application/json" };
  }

  try {
    const storedUser = localStorage.getItem("solcart_current_user");
    const storedPassword = localStorage.getItem("solcart_user_password_hash");
    
    if (!storedUser || !storedPassword) {
      return { "Content-Type": "application/json" };
    }

    const user = JSON.parse(storedUser);
    const authHeader = Buffer.from(`${user.email}:${storedPassword}`).toString("base64");

    return {
      "Content-Type": "application/json",
      "X-Admin-Auth": authHeader
    };
  } catch (e) {
    console.error("Failed to generate auth headers:", e);
    return { "Content-Type": "application/json" };
  }
}

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
  }
];

const DEFAULT_PRODUCTS: Product[] = [
  {
    id: "p-amazon-50",
    name: "Amazon Gift Card $50",
    description: "Shop millions of products globally. Amazon gift card codes are region-locked to Amazon.com stores.",
    brand: "Amazon",
    image: "https://images.unsplash.com/photo-1513151233558-d860c5398176?w=600&auto=format&fit=crop&q=80",
    category: "Retail",
    rating: 4.9,
    reviewsCount: 142,
    retailPrice: 50.00,
    marketplacePrice: 50.00,
    estimatedDelivery: "Instant Digital Delivery",
    specs: {
      "Region": "United States",
      "Format": "Digital Code",
      "Redemption": "Online Store",
      "Expiration": "None"
    },
    retailerId: "amazon",
    stockCount: 500,
    isFeatured: true,
    reviews: []
  },
  {
    id: "p-apple-100",
    name: "Apple App Store & iTunes Gift Card $100",
    description: "Redeem on Apple Store, iTunes, Apple Books, or iCloud subscriptions. Perfect gift for any Apple user.",
    brand: "Apple",
    image: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&auto=format&fit=crop&q=80",
    category: "Entertainment",
    rating: 4.8,
    reviewsCount: 96,
    retailPrice: 100.00,
    marketplacePrice: 100.00,
    estimatedDelivery: "Instant Digital Delivery",
    specs: {
      "Region": "United States",
      "Format": "Digital Code",
      "Redemption": "App Store / iTunes",
      "Expiration": "None"
    },
    retailerId: "apple",
    stockCount: 200,
    isFeatured: true,
    reviews: []
  },
  {
    id: "p-steam-50",
    name: "Steam Wallet Code $50",
    description: "Add funds directly to your Steam Account. Instant access to purchase games, expansions, and community items.",
    brand: "Steam",
    image: "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=600&auto=format&fit=crop&q=80",
    category: "Gaming",
    rating: 4.9,
    reviewsCount: 312,
    retailPrice: 50.00,
    marketplacePrice: 50.00,
    estimatedDelivery: "Instant Digital Delivery",
    specs: {
      "Region": "Global / USD",
      "Format": "Digital Code",
      "Redemption": "Steam Client",
      "Expiration": "None"
    },
    retailerId: "steam",
    stockCount: 800,
    isFeatured: true,
    reviews: []
  },
  {
    id: "p-psn-50",
    name: "PlayStation Store Gift Card $50",
    description: "Buy and download games, DLCs, and subscribe to PlayStation Plus directly through your console.",
    brand: "PlayStation",
    image: "https://images.unsplash.com/photo-1592155931584-901ac15763e3?w=600&auto=format&fit=crop&q=80",
    category: "Gaming",
    rating: 4.7,
    reviewsCount: 215,
    retailPrice: 50.00,
    marketplacePrice: 50.00,
    estimatedDelivery: "Instant Digital Delivery",
    specs: {
      "Region": "United States",
      "Format": "Digital Code",
      "Redemption": "PSN Console / Web",
      "Expiration": "None"
    },
    retailerId: "playstation",
    stockCount: 450,
    isFeatured: true,
    reviews: []
  },
  {
    id: "p-spotify-30",
    name: "Spotify Premium 3-Month Subscription Card $30",
    description: "Enjoy ad-free music, offline playback, and unlimited skips with a premium individual Spotify account.",
    brand: "Spotify",
    image: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=600&auto=format&fit=crop&q=80",
    category: "Entertainment",
    rating: 4.7,
    reviewsCount: 88,
    retailPrice: 30.00,
    marketplacePrice: 30.00,
    estimatedDelivery: "Instant Digital Delivery",
    specs: {
      "Region": "United States",
      "Format": "Digital Code",
      "Redemption": "Spotify Web Portal",
      "Expiration": "None"
    },
    retailerId: "spotify",
    stockCount: 150,
    isFeatured: false,
    reviews: []
  },
  {
    id: "p-netflix-50",
    name: "Netflix Digital Gift Card $50",
    description: "Stream premium films, television shows, and original documentaries. Automatically applied directly to your Netflix account billing.",
    brand: "Netflix",
    image: "https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?w=600&auto=format&fit=crop&q=80",
    category: "Entertainment",
    rating: 4.8,
    reviewsCount: 174,
    retailPrice: 50.00,
    marketplacePrice: 50.00,
    estimatedDelivery: "Instant Digital Delivery",
    specs: {
      "Region": "United States",
      "Format": "Digital Code",
      "Redemption": "Netflix Web Portal",
      "Expiration": "None"
    },
    retailerId: "netflix",
    stockCount: 300,
    isFeatured: true,
    reviews: []
  }
];


export class RetailerService {
  private static isSyncing = false;

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
      const res = await fetch("/api/db", {
        headers: getAuthHeaders()
      });
      if (res.ok) {
        const result = await res.json();
        if (result.success && result.data) {
          localStorage.setItem("solcart_retailers", JSON.stringify(result.data.retailers));
          localStorage.setItem("solcart_products", JSON.stringify(result.data.products));
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

      // Post to central server DB API
      fetch("/api/db", {
        method: "POST",
        headers: getAuthHeaders(),
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

  static addProduct(product: Omit<Product, "marketplacePrice">): void {
    const products = this.getStoredProducts();
    const retailers = this.getStoredRetailers();
    const retailer = retailers.find(r => r.id === product.retailerId) || { markupPercentage: 10 };
    
    const marketplacePrice = product.retailPrice;
    const newProduct: Product = {
      ...product,
      marketplacePrice
    };
    
    products.push(newProduct);
    localStorage.setItem("solcart_products", JSON.stringify(products));

    fetch("/api/db", {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({
        action: "addProduct",
        payload: newProduct
      })
    }).catch(() => {});
  }

  static deleteProduct(productId: string): void {
    const products = this.getStoredProducts().filter(p => p.id !== productId);
    localStorage.setItem("solcart_products", JSON.stringify(products));

    fetch("/api/db", {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({
        action: "deleteProduct",
        payload: { productId }
      })
    }).catch(() => {});
  }

  static updateProduct(productId: string, updatedFields: Partial<Omit<Product, "marketplacePrice">>): void {
    const products = this.getStoredProducts();
    const index = products.findIndex(p => p.id === productId);
    if (index !== -1) {
      const existing = products[index];
      const merged = { ...existing, ...updatedFields };
      merged.marketplacePrice = merged.retailPrice;
      
      products[index] = merged as Product;
      localStorage.setItem("solcart_products", JSON.stringify(products));
    }
  }

  static resetDatabase(): void {
    if (typeof window !== "undefined") {
      localStorage.removeItem("solcart_retailers");
      localStorage.removeItem("solcart_products");
    }
    fetch("/api/db", {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ action: "resetToDefault", payload: {} })
    }).catch(() => {});
  }
}

