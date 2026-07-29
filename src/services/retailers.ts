import { Product, RetailerConfig } from "../types";

const DEFAULT_RETAILERS: RetailerConfig[] = [
  {
    id: "amazon",
    name: "Amazon",
    logo: "https://images.unsplash.com/photo-1523474253046-8cd2748b5fd2?w=100&auto=format&fit=crop&q=60",
    markupPercentage: 10,
    isActive: true,
    description: "Sourced globally. Delivering electronics, books, home products, and daily essentials."
  },
  {
    id: "apple",
    name: "Apple",
    logo: "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=100&auto=format&fit=crop&q=60",
    markupPercentage: 12,
    isActive: true,
    description: "Premium computers, smartphones, tablets, and accessories with top-tier technology."
  },
  {
    id: "nike",
    name: "Nike",
    logo: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=100&auto=format&fit=crop&q=60",
    markupPercentage: 8,
    isActive: true,
    description: "Innovative athletic footwear, apparel, accessories, and sporting gear."
  },
  {
    id: "adidas",
    name: "Adidas",
    logo: "https://images.unsplash.com/photo-1587563876167-18d96b6e029d?w=100&auto=format&fit=crop&q=60",
    markupPercentage: 8,
    isActive: true,
    description: "Original sportswear, classics sneakers, and high-performance training clothing."
  },
  {
    id: "bestbuy",
    name: "Best Buy",
    logo: "https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=100&auto=format&fit=crop&q=60",
    markupPercentage: 10,
    isActive: true,
    description: "Top-tier consumer electronics, 4K TVs, gaming consoles, and smart appliances."
  },
  {
    id: "walmart",
    name: "Walmart",
    logo: "https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=100&auto=format&fit=crop&q=60",
    markupPercentage: 6,
    isActive: true,
    description: "Everyday low prices on groceries, home appliances, household goods, and toys."
  },
  {
    id: "target",
    name: "Target",
    logo: "https://images.unsplash.com/photo-1558317374-067fb5f30001?w=100&auto=format&fit=crop&q=60",
    markupPercentage: 7,
    isActive: true,
    description: "Trendy home decor, fashionable apparel, beauty essentials, and kitchen supplies."
  }
];

const DEFAULT_PRODUCTS: Product[] = [];


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
      const res = await fetch("/api/db");
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
      headers: { "Content-Type": "application/json" },
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
      headers: { "Content-Type": "application/json" },
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
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "resetToDefault", payload: {} })
    }).catch(() => {});
  }
}

