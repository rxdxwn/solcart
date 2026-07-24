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

const DEFAULT_PRODUCTS: Product[] = [
  {
    id: "p1",
    name: "Sony WH-1000XM4 Wireless Noise Cancelling Headphones",
    description: "Sony's intelligent industry-leading noise canceling headphones with premium sound elevate your listening experience with the ability to personalize and control everything you hear.",
    brand: "Sony",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80",
    category: "Electronics",
    rating: 4.8,
    reviewsCount: 14205,
    retailPrice: 348.00,
    marketplacePrice: 382.80, // 348 + 10% Amazon markup
    estimatedDelivery: "2-3 business days",
    specs: {
      "Battery Life": "Up to 30 Hours",
      "Noise Cancelling": "Active Noise Cancelling (ANC)",
      "Connection": "Bluetooth 5.0 & 3.5mm Jack",
      "Weight": "254 grams",
      "Charging": "USB-C Quick Charge (10 min for 5 hours)"
    },
    retailerId: "amazon",
    stockCount: 82,
    isFeatured: true
  },
  {
    id: "p2",
    name: "MacBook Air M3 (13-inch, 8GB RAM, 256GB SSD)",
    description: "The M3 chip brings even greater capabilities to the superportable 13-inch MacBook Air. With up to 18 hours of battery life, you can take it anywhere and breeze through work and play.",
    brand: "Apple",
    image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&auto=format&fit=crop&q=80",
    category: "Computers",
    rating: 4.9,
    reviewsCount: 382,
    retailPrice: 1099.00,
    marketplacePrice: 1230.88, // 1099 + 12% Apple markup
    estimatedDelivery: "Next day delivery",
    specs: {
      "Processor": "Apple M3 8-Core CPU",
      "Graphics": "10-core GPU",
      "Memory": "8GB Unified memory",
      "Storage": "256GB Superfast SSD",
      "Battery": "Up to 18 hours"
    },
    retailerId: "apple",
    stockCount: 15,
    isFeatured: true
  },
  {
    id: "p3",
    name: "iPhone 15 Pro Max (256GB, Natural Titanium)",
    description: "Forged in titanium and featuring the groundbreaking A17 Pro chip, a customizable Action button, and the most powerful iPhone camera system ever.",
    brand: "Apple",
    image: "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=600&auto=format&fit=crop&q=80",
    category: "Electronics",
    rating: 4.7,
    reviewsCount: 948,
    retailPrice: 1199.00,
    marketplacePrice: 1342.88, // 1199 + 12% Apple markup
    estimatedDelivery: "Next day delivery",
    specs: {
      "Processor": "A17 Pro Chip with 6-core GPU",
      "Screen Size": "6.7-inch Super Retina XDR OLED",
      "Camera": "48MP Main | 12MP Ultra Wide | 5x Telephoto",
      "Connector": "USB-C (supports USB 3)",
      "Material": "Aerospace-grade Titanium"
    },
    retailerId: "apple",
    stockCount: 22,
    isFeatured: true
  },
  {
    id: "p4",
    name: "Nike Air Force 1 '07 Classic Low-Top Sneakers",
    description: "The radiance lives on in the Nike Air Force 1 '07, the b-ball icon that puts a fresh spin on what you know best: crisp leather, bold colors and the perfect amount of flash to make you shine.",
    brand: "Nike",
    image: "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=600&auto=format&fit=crop&q=80",
    category: "Apparel",
    rating: 4.6,
    reviewsCount: 2043,
    retailPrice: 115.00,
    marketplacePrice: 124.20, // 115 + 8% Nike markup
    estimatedDelivery: "3-5 business days",
    specs: {
      "Upper Material": "Genuine & Synthetic Leather",
      "Cushioning": "Nike Air Sole unit",
      "Outsole": "Pivot-point rubber traction pattern",
      "Style": "Classic Retro Basket"
    },
    retailerId: "nike",
    stockCount: 120,
    isFeatured: true
  },
  {
    id: "p5",
    name: "Nike Air Zoom Pegasus 41 Road Running Shoes",
    description: "With responsive cushioning and standard support, the Pegasus 41 delivers an energized ride for daily road runs. Experience lightweight energy return with ReactX foam and Zoom Air units.",
    brand: "Nike",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80",
    category: "Apparel",
    rating: 4.5,
    reviewsCount: 524,
    retailPrice: 140.00,
    marketplacePrice: 151.20, // 140 + 8% Nike markup
    estimatedDelivery: "3-5 business days",
    specs: {
      "Midsole": "ReactX Foam (13% more responsive)",
      "Air Units": "Dual Zoom Air units (forefoot & heel)",
      "Upper": "Engineered sandwich mesh",
      "Weight": "9.9 oz (Men's Size 9)"
    },
    retailerId: "nike",
    stockCount: 45,
    isFeatured: false
  },
  {
    id: "p6",
    name: "Adidas Ultraboost Light Running Shoes",
    description: "Experience epic energy with the new Ultraboost Light, the lightest Ultraboost ever. The magic lies in the Light BOOST midsole, a new generation of adidas BOOST with 30% lighter material.",
    brand: "Adidas",
    image: "https://images.unsplash.com/photo-1587563876167-18d96b6e029d?w=600&auto=format&fit=crop&q=80",
    category: "Apparel",
    rating: 4.8,
    reviewsCount: 1109,
    retailPrice: 190.00,
    marketplacePrice: 205.20, // 190 + 8% Adidas markup
    estimatedDelivery: "3-5 business days",
    specs: {
      "Midsole": "Light BOOST energy return",
      "Upper": "adidas PRIMEKNIT+ textile yarn",
      "Outsole": "Continental™ Better Rubber",
      "Drop": "10mm heel-to-toe drop"
    },
    retailerId: "adidas",
    stockCount: 38,
    isFeatured: true
  },
  {
    id: "p7",
    name: "LG C3 65-inch Class OLED evo 4K Smart TV",
    description: "The LG OLED evo C3 is powered by the a9 AI Processor Gen6—engineered exclusively for LG OLED—for ultra-realistic picture and sound. Self-lit pixels glow brighter than before.",
    brand: "LG",
    image: "https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=600&auto=format&fit=crop&q=80",
    category: "Electronics",
    rating: 4.9,
    reviewsCount: 785,
    retailPrice: 1599.00,
    marketplacePrice: 1758.90, // 1599 + 10% Best Buy markup
    estimatedDelivery: "2-4 business days",
    specs: {
      "Display Type": "OLED evo",
      "Resolution": "4K Ultra HD (3,840 x 2,160)",
      "Refresh Rate": "120Hz Native",
      "HDMI Inputs": "4 (HDMI 2.1)",
      "Smart Platform": "webOS 23"
    },
    retailerId: "bestbuy",
    stockCount: 8,
    isFeatured: true
  },
  {
    id: "p8",
    name: "Kindle Paperwhite (16 GB, Black, 6.8-inch Display)",
    description: "Now with a 6.8” display and thinner borders, adjustable warm light, up to 10 weeks of battery life, and 20% faster page turns. Built to withstand accidental immersion in water.",
    brand: "Amazon",
    image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80",
    category: "Electronics",
    rating: 4.7,
    reviewsCount: 3209,
    retailPrice: 149.00,
    marketplacePrice: 163.90, // 149 + 10% Amazon markup
    estimatedDelivery: "2-3 business days",
    specs: {
      "Display Size": "6.8-inch glare-free paperwhite",
      "Storage": "16 GB",
      "Waterproofing": "IPX8 (up to 2 meters for 60 mins)",
      "Battery Life": "Up to 10 weeks on a single charge"
    },
    retailerId: "amazon",
    stockCount: 50,
    isFeatured: false
  },
  {
    id: "p9",
    name: "Keurig K-Express Single Serve Coffee Maker",
    description: "Enjoy delicious hot or iced coffee made in minutes. This coffee maker features an option for a stronger brew and features a sleek design that fits any kitchen counter.",
    brand: "Keurig",
    image: "https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=600&auto=format&fit=crop&q=80",
    category: "Home & Kitchen",
    rating: 4.4,
    reviewsCount: 5410,
    retailPrice: 59.00,
    marketplacePrice: 62.54, // 59 + 6% Walmart markup
    estimatedDelivery: "2-3 business days",
    specs: {
      "Water Reservoir": "42 oz removable tank",
      "Cup Sizes": "8, 10, or 12 oz cups",
      "Brew Speed": "Fresh coffee in under 60 seconds",
      "Special Feature": "STRONG button for bold flavor"
    },
    retailerId: "walmart",
    stockCount: 95,
    isFeatured: false
  },
  {
    id: "p10",
    name: "Dyson V8 Absolute Cordless Stick Vacuum",
    description: "Engineered for homes with pets. De-tangling Motorbar cleaner head deep cleans carpets and hard floors, converting easily to a handheld vacuum for high, low, and in-between spaces.",
    brand: "Dyson",
    image: "https://images.unsplash.com/photo-1558317374-067fb5f30001?w=600&auto=format&fit=crop&q=80",
    category: "Home & Kitchen",
    rating: 4.6,
    reviewsCount: 1530,
    retailPrice: 399.00,
    marketplacePrice: 426.93, // 399 + 7% Target markup
    estimatedDelivery: "2-4 business days",
    specs: {
      "Run Time": "Up to 40 minutes of fade-free power",
      "Weight": "5.63 lbs",
      "Filtration": "Whole-machine filtration captures 99.99% particles",
      "Suction Power": "115 AW max"
    },
    retailerId: "target",
    stockCount: 14,
    isFeatured: true
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
          const markupDecimal = newMarkup / 100;
          return {
            ...product,
            marketplacePrice: parseFloat((product.retailPrice * (1 + markupDecimal)).toFixed(2))
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
    
    const marketplacePrice = parseFloat((product.retailPrice * (1 + retailer.markupPercentage / 100)).toFixed(2));
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
      
      const retailers = this.getStoredRetailers();
      const retailer = retailers.find(r => r.id === merged.retailerId) || { markupPercentage: 10 };
      
      merged.marketplacePrice = parseFloat((merged.retailPrice * (1 + retailer.markupPercentage / 100)).toFixed(2));
      
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

