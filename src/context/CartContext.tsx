"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { CartItem, Product } from "../types";
import { getSolPrice } from "../lib/jupiter";

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

  useEffect(() => {
    refreshSOLPrice();
    const interval = setInterval(refreshSOLPrice, 15000); // Poll every 15 seconds (auto-refresh)
    return () => clearInterval(interval);
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

  // Flat $5.00 shipping, free shipping for orders over $100
  const shippingUSD = subtotalUSD > 0 && subtotalUSD < 100 ? 5.00 : 0;

  // Platform checkout fee: 1.5% of subtotal
  const marketplaceFeeUSD = parseFloat((subtotalUSD * 0.015).toFixed(2));

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
