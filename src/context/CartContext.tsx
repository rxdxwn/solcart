"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { CartItem, Product } from "../types";
import { getSolPrice } from "../lib/jupiter";
import { SupabaseService } from "../services/supabase";

interface CartContextType {
  cartItems: CartItem[];
  subtotalUSD: number;
  shippingUSD: number;
  marketplaceFeeUSD: number;
  totalUSD: number;
  totalSOL: number;
  solPrice: number;
  isRefreshingPrice: boolean;
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  refreshSOLPrice: () => Promise<number>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [solPrice, setSolPrice] = useState<number>(185.50);
  const [isRefreshingPrice, setIsRefreshingPrice] = useState(false);

  // Load cart from storage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("solcart_cart_items");
      if (stored) {
        try {
          setCartItems(JSON.parse(stored));
        } catch {
          setCartItems([]);
        }
      }
    }
  }, []);

  // Sync cart items to localStorage
  const saveCart = (items: CartItem[]) => {
    setCartItems(items);
    if (typeof window !== "undefined") {
      localStorage.setItem("solcart_cart_items", JSON.stringify(items));
    }
  };

  // Poll for Jupiter SOL price updates
  const refreshSOLPrice = async (): Promise<number> => {
    setIsRefreshingPrice(true);
    try {
      const price = await getSolPrice();
      setSolPrice(price);
      setIsRefreshingPrice(false);
      return price;
    } catch {
      setIsRefreshingPrice(false);
      return solPrice;
    }
  };

  const [settings, setSettings] = useState(() => {
    return typeof window !== "undefined" ? SupabaseService.getSettings() : {
      marketplaceMarkup: 10,
      supportedCryptos: ["SOL", "USDC"],
      defaultSolWallet: "So11111111111111111111111111111111111111112",
      rpcProvider: "Helius Mainnet Beta",
      emailAlerts: false,
      maintenanceMode: false,
      taxRate: 5,
      shippingFeeUSD: 5.00,
      freeShippingThresholdUSD: 100.00,
      featureFlags: { autoSwap: true, mockFulfillment: true, analyticsDashboard: true }
    };
  });

  useEffect(() => {
    const handleSync = () => {
      setSettings(SupabaseService.getSettings());
    };
    
    const sync = async () => {
      await SupabaseService.syncWithServer();
      handleSync();
    };
    sync();
    refreshSOLPrice();
    
    window.addEventListener("solcart-db-synced", handleSync);
    const interval = setInterval(refreshSOLPrice, 15000); // Poll every 15 seconds (auto-refresh)
    return () => {
      clearInterval(interval);
      window.removeEventListener("solcart-db-synced", handleSync);
    };
  }, []);

  const addToCart = (product: Product, quantity: number = 1) => {
    const items = [...cartItems];
    const index = items.findIndex(item => item.product.id === product.id);

    if (index !== -1) {
      items[index].quantity += quantity;
    } else {
      items.push({ product, quantity });
    }

    saveCart(items);
  };

  const removeFromCart = (productId: string) => {
    const items = cartItems.filter(item => item.product.id !== productId);
    saveCart(items);
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    const items = cartItems.map(item => {
      if (item.product.id === productId) {
        return { ...item, quantity };
      }
      return item;
    });
    saveCart(items);
  };

  const clearCart = () => {
    saveCart([]);
  };

  // Pricing calculations
  // subtotal is based on marketplacePrice (which includes retailer markup)
  const subtotalUSD = cartItems.reduce(
    (acc, item) => acc + item.product.marketplacePrice * item.quantity,
    0
  );

  const configuredShippingFee = settings.shippingFeeUSD !== undefined ? settings.shippingFeeUSD : 5.00;
  const configuredThreshold = settings.freeShippingThresholdUSD !== undefined ? settings.freeShippingThresholdUSD : 100.00;

  // Shipping cost dynamic based on admin controls
  const shippingUSD = subtotalUSD > 0 && subtotalUSD < configuredThreshold ? configuredShippingFee : 0;

  // Platform checkout fee: dynamic based on taxRate settings
  const taxRate = settings.taxRate !== undefined ? settings.taxRate : 5;
  const marketplaceFeeUSD = parseFloat((subtotalUSD * (taxRate / 100)).toFixed(2));

  const totalUSD = parseFloat((subtotalUSD + shippingUSD + marketplaceFeeUSD).toFixed(2));

  // Dynamic SOL equivalent based on live SOL price
  const totalSOL = totalUSD > 0 ? parseFloat((totalUSD / solPrice).toFixed(4)) : 0;

  return (
    <CartContext.Provider
      value={{
        cartItems,
        subtotalUSD,
        shippingUSD,
        marketplaceFeeUSD,
        totalUSD,
        totalSOL,
        solPrice,
        isRefreshingPrice,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        refreshSOLPrice
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
