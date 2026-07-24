import { Suspense } from "react";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "../context/AuthContext";
import { SolanaWalletProvider } from "../context/SolanaWalletContext";
import { CartProvider } from "../context/CartContext";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SOLCart – Shop Major Online Retailers Using Solana",
  description: "Spend your SOL directly on Amazon, Nike, Apple, Best Buy, and Walmart. Fast conversions to USDT, automatic order fulfillment, and live tracking.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-[#06020D] text-[#F1EFF8]">
        <AuthProvider>
          <SolanaWalletProvider>
            <CartProvider>
              <Suspense fallback={<div className="h-16 bg-[#06020D] border-b border-brand-border/40 w-full" />}>
                <Navbar />
              </Suspense>
              <main className="flex flex-col flex-1">
                {children}
              </main>
              <Footer />
            </CartProvider>
          </SolanaWalletProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
