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
  title: "SOLCart — Buy Digital Gift Cards with Solana",
  description: "Spend your SOL directly on digital gift cards from top global brands with instant email code delivery and secure on-chain payments.",
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
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-[#06020D] text-[#F1EFF8]">
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const stored = localStorage.getItem('solcart_active_theme');
                  if (stored) {
                    document.documentElement.setAttribute('data-theme', stored);
                  }
                } catch (e) {}
              })();
            `
          }}
        />
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
