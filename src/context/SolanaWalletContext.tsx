"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { Transaction, SystemProgram, PublicKey, LAMPORTS_PER_SOL, VersionedTransaction, Connection } from "@solana/web3.js";
import { HeliusService, MERCHANT_WALLET_ADDRESS } from "../services/helius";
import { JupiterService } from "../services/jupiter";

export type WalletProviderName = "Phantom" | "Solflare" | "Backpack";
export type SolanaNetwork = "Mainnet" | "Devnet";

interface SolanaWalletContextType {
  connected: boolean;
  walletAddress: string | null;
  walletName: WalletProviderName | null;
  balance: number;
  loading: boolean;
  networkStatus: SolanaNetwork;
  isSolflareDetected: boolean;
  setNetworkStatus: (net: SolanaNetwork) => void;
  connect: (providerName?: WalletProviderName) => Promise<{ success: boolean; notFound?: boolean }>;
  disconnect: () => void;
  requestFaucet: () => Promise<void>;
  signPaymentTransaction: (amountSOL: number) => Promise<{ success: boolean; signature: string; error?: string }>;
}

const SolanaWalletContext = createContext<SolanaWalletContextType | undefined>(undefined);

// Helper to detect Solflare provider on window
const getSolflareProvider = () => {
  if (typeof window === "undefined") return null;
  const win = window as any;
  if (win.solflare?.isSolflare) {
    return win.solflare;
  }
  if (win.solana?.isSolflare) {
    return win.solana;
  }
  if (win.solflare) {
    return win.solflare;
  }
  return null;
};

// Helper to detect generic Phantom/Backpack providers
const getWalletProvider = (name: WalletProviderName) => {
  if (typeof window === "undefined") return null;
  const win = window as any;
  if (name === "Solflare") return getSolflareProvider();
  if (name === "Phantom") return win.solana?.isPhantom ? win.solana : win.solana;
  if (name === "Backpack") return win.backpack;
  return null;
};

export const SolanaWalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [connected, setConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [walletName, setWalletName] = useState<WalletProviderName | null>(null);
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(false);
  const [networkStatus, setNetworkStatusState] = useState<SolanaNetwork>("Mainnet");
  const [isSolflareDetected, setIsSolflareDetected] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [walletNotFound, setWalletNotFound] = useState<string | null>(null);

  // Check Solflare extension availability
  useEffect(() => {
    if (typeof window !== "undefined") {
      const provider = getSolflareProvider();
      setIsSolflareDetected(!!provider);
    }
  }, []);

  const setNetworkStatus = (net: SolanaNetwork) => {
    setNetworkStatusState(net);
    localStorage.setItem("solcart_wallet_network", net);
  };

  // Sync balance when address or network changes
  const refreshBalance = useCallback(async (address: string, net: SolanaNetwork) => {
    if (!address) {
      setBalance(0);
      return;
    }

    try {
      const currentProvider = walletName ? getWalletProvider(walletName) : getSolflareProvider();
      if (currentProvider && currentProvider.connection && typeof currentProvider.connection.getBalance === "function") {
        try {
          const pk = currentProvider.publicKey ? currentProvider.publicKey : new PublicKey(address);
          const lamports = await currentProvider.connection.getBalance(pk);
          const sol = lamports / 1e9;
          setBalance(sol);
          if (typeof window !== "undefined") {
            localStorage.setItem(`solcart_balance_${address}`, sol.toString());
          }
          return;
        } catch (err) {
          console.warn("Wallet injected connection getBalance failed, using failover RPC pool", err);
        }
      }

      // Query via HeliusService multi-RPC failover pool
      let bal = await HeliusService.getBalance(address, net);

      // If active network returns 0, check alternate network
      if (bal === 0) {
        const altNet: SolanaNetwork = net === "Mainnet" ? "Devnet" : "Mainnet";
        const altBal = await HeliusService.getBalance(address, altNet);
        if (altBal > 0) {
          setNetworkStatusState(altNet);
          localStorage.setItem("solcart_wallet_network", altNet);
          bal = altBal;
        }
      }

      setBalance(bal);
    } catch (e) {
      console.warn("Error refreshing wallet balance", e);
    }
  }, [walletName]);

  useEffect(() => {
    if (!walletAddress) {
      setBalance(0);
      return;
    }

    refreshBalance(walletAddress, networkStatus);
    const interval = setInterval(() => {
      refreshBalance(walletAddress, networkStatus);
    }, 8000);
    return () => clearInterval(interval);
  }, [walletAddress, networkStatus, refreshBalance]);

  // Handle Solflare & wallet event listeners (accountChanged, disconnect, connect)
  useEffect(() => {
    if (!walletName) return;
    const provider = getWalletProvider(walletName);
    if (!provider || typeof provider.on !== "function") return;

    const handleAccountChange = (newPublicKey: any) => {
      if (newPublicKey) {
        const addr = newPublicKey.toString();
        setWalletAddress(addr);
        localStorage.setItem("solcart_wallet_address", addr);
      } else {
        disconnect();
      }
    };

    const handleDisconnect = () => {
      disconnect();
    };

    try {
      provider.on("accountChanged", handleAccountChange);
      provider.on("disconnect", handleDisconnect);
    } catch (e) {
      console.warn("Could not register wallet event listeners", e);
    }

    return () => {
      try {
        if (typeof provider.off === "function") {
          provider.off("accountChanged", handleAccountChange);
          provider.off("disconnect", handleDisconnect);
        }
      } catch {}
    };
  }, [walletName]);

  // Load wallet connection from storage on mount & auto-reconnect trusted session
  useEffect(() => {
    const storedConnected = localStorage.getItem("solcart_wallet_connected") === "true";
    const storedAddress = localStorage.getItem("solcart_wallet_address");
    const storedName = localStorage.getItem("solcart_wallet_name") as WalletProviderName | null;
    const storedNet = (localStorage.getItem("solcart_wallet_network") as SolanaNetwork) || "Mainnet";

    if (storedNet) setNetworkStatusState(storedNet);

    if (storedConnected && storedAddress && storedName) {
      setConnected(true);
      setWalletAddress(storedAddress);
      setWalletName(storedName);

      if (storedName === "Solflare") {
        const solflare = getSolflareProvider();
        if (solflare && typeof solflare.connect === "function") {
          solflare.connect({ onlyIfTrusted: true }).then((res: any) => {
            if (solflare.publicKey) {
              setWalletAddress(solflare.publicKey.toString());
            }
          }).catch(() => {
            // silent fail
          });
        }
      }
    }
  }, []);

  // Primary connection action
  const connectDirect = async (providerName: WalletProviderName): Promise<{ success: boolean; notFound?: boolean }> => {
    setLoading(true);
    try {
      const provider = getWalletProvider(providerName);

      if (!provider) {
        setLoading(false);
        return { success: false, notFound: true };
      }

      const response = await provider.connect();
      const address = (response?.publicKey || provider.publicKey)?.toString();

      if (!address) {
        throw new Error("Public key not received from wallet");
      }

      let targetNet: SolanaNetwork = networkStatus;
      let mainnetBal = await HeliusService.getBalance(address, "Mainnet");
      if (mainnetBal === 0 && targetNet === "Devnet") {
        const devnetBal = await HeliusService.getBalance(address, "Devnet");
        if (devnetBal > 0) {
          targetNet = "Devnet";
        } else {
          targetNet = "Mainnet";
        }
      }

      setConnected(true);
      setWalletAddress(address);
      setWalletName(providerName);
      setNetworkStatusState(targetNet);

      localStorage.setItem("solcart_wallet_connected", "true");
      localStorage.setItem("solcart_wallet_address", address);
      localStorage.setItem("solcart_wallet_name", providerName);
      localStorage.setItem("solcart_wallet_network", targetNet);

      await refreshBalance(address, targetNet);
      
      // Track wallet address in user database as customer
      try {
        await fetch("/api/db", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "createUser",
            payload: {
              id: address,
              email: `${address.substring(0, 8)}@solcart-user.io`, // temporary placeholder email
              name: `Wallet ${address.substring(0, 6)}`,
              passwordHash: "",
              role: "customer",
              isVerified: false,
              createdAt: new Date().toISOString()
            }
          })
        });
      } catch (e) {
        console.warn("Failed to register connected wallet in database", e);
      }

      setLoading(false);
      return { success: true };

    } catch (e: any) {
      console.error(`Error connecting to ${providerName}`, e);
      setLoading(false);
      return { success: false };
    }
  };

  const connect = async (providerName?: WalletProviderName): Promise<{ success: boolean; notFound?: boolean }> => {
    if (!providerName) {
      setShowModal(true);
      return { success: false };
    }
    return connectDirect(providerName);
  };

  const disconnect = () => {
    if (walletName) {
      const provider = getWalletProvider(walletName);
      if (provider && typeof provider.disconnect === "function") {
        try {
          provider.disconnect();
        } catch {}
      }
    }

    setConnected(false);
    setWalletAddress(null);
    setWalletName(null);
    setBalance(0);
    setNetworkStatusState("Mainnet");

    localStorage.removeItem("solcart_wallet_connected");
    localStorage.removeItem("solcart_wallet_address");
    localStorage.removeItem("solcart_wallet_name");
    localStorage.removeItem("solcart_wallet_network");
  };

  // Faucet is removed from production
  const requestFaucet = async () => {
    console.warn("Faucet has been removed from production environments.");
  };

  const signPaymentTransaction = async (amountSOL: number): Promise<{ success: boolean; signature: string; error?: string }> => {
    if (!connected || !walletAddress || !walletName) {
      return { success: false, signature: "", error: "Wallet not connected" };
    }

    const provider = getWalletProvider(walletName);
    if (!provider) {
      return { success: false, signature: "", error: "Wallet provider not found" };
    }

    try {
      const endpoint = HeliusService.getRpcUrl(networkStatus);
      const connection = new Connection(endpoint, "confirmed");

      const recentBlockhash = await connection.getLatestBlockhash();
      const transaction = new Transaction({
        feePayer: new PublicKey(walletAddress),
        blockhash: recentBlockhash.blockhash,
        lastValidBlockHeight: recentBlockhash.lastValidBlockHeight
      }).add(
        SystemProgram.transfer({
          fromPubkey: new PublicKey(walletAddress),
          toPubkey: new PublicKey(MERCHANT_WALLET_ADDRESS),
          lamports: Math.round(amountSOL * LAMPORTS_PER_SOL)
        })
      );

      const { signature } = await provider.signAndSendTransaction(transaction);
      
      const confirmation = await connection.confirmTransaction({
        signature,
        blockhash: recentBlockhash.blockhash,
        lastValidBlockHeight: recentBlockhash.lastValidBlockHeight
      });

      if (confirmation.value.err) {
        throw new Error("On-chain transaction execution failed");
      }

      return { success: true, signature };
    } catch (e: any) {
      console.error("Payment signing failed", e);
      const msg = e.message || "User cancelled payment transaction signing";
      return { success: false, signature: "", error: msg };
    }
  };

  return (
    <SolanaWalletContext.Provider
      value={{
        connected,
        walletAddress,
        walletName,
        balance,
        loading,
        networkStatus,
        isSolflareDetected,
        setNetworkStatus,
        connect,
        disconnect,
        requestFaucet,
        signPaymentTransaction
      }}
    >
      {children}

      {/* Global Wallet Selection modal */}
      {showModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-brand-dark/85 backdrop-blur-md">
          <div className="w-full max-w-sm rounded-2xl border border-brand-border bg-brand-card p-6 shadow-2xl relative space-y-4">
            <button 
              onClick={() => {
                setShowModal(false);
                setWalletNotFound(null);
              }}
              className="absolute right-4 top-4 p-1.5 rounded-full hover:bg-brand-border/40 text-brand-text-muted hover:text-white transition-colors"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="text-center">
              <h3 className="text-lg font-extrabold text-white">Connect Solana Wallet</h3>
              <p className="text-xs text-brand-text-muted mt-1 leading-relaxed">
                Connect your browser wallet to authorize on-chain payments.
              </p>
            </div>

            {walletNotFound && (
              <div className="p-2.5 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-lg text-center font-bold">
                {walletNotFound} Extension Not Found! Please install it.
              </div>
            )}

            <div className="space-y-2.5 pt-2">
              <button
                onClick={async () => {
                  const res = await connectDirect("Phantom");
                  if (res.notFound) {
                    setWalletNotFound("Phantom");
                  } else if (res.success) {
                    setShowModal(false);
                  }
                }}
                className="flex items-center justify-between w-full p-3 rounded-xl border border-brand-border/80 bg-brand-dark/20 hover:bg-brand-card transition-all text-left text-white font-sans"
              >
                <span className="text-xs font-bold">Phantom Wallet</span>
                <span className="text-[10px] text-brand-text-muted font-bold">Browser Wallet</span>
              </button>

              <button
                onClick={async () => {
                  const res = await connectDirect("Solflare");
                  if (res.notFound) {
                    setWalletNotFound("Solflare");
                  } else if (res.success) {
                    setShowModal(false);
                  }
                }}
                className="flex items-center justify-between w-full p-3 rounded-xl border border-brand-border/80 bg-brand-dark/20 hover:bg-brand-card transition-all text-left text-white font-sans"
              >
                <span className="text-xs font-bold">Solflare Wallet</span>
                <span className="text-[10px] text-brand-text-muted font-bold">Browser Wallet</span>
              </button>

              <button
                onClick={async () => {
                  const res = await connectDirect("Backpack");
                  if (res.notFound) {
                    setWalletNotFound("Backpack");
                  } else if (res.success) {
                    setShowModal(false);
                  }
                }}
                className="flex items-center justify-between w-full p-3 rounded-xl border border-brand-border/80 bg-brand-dark/20 hover:bg-brand-card transition-all text-left text-white font-sans"
              >
                <span className="text-xs font-bold">Backpack Wallet</span>
                <span className="text-[10px] text-brand-text-muted font-bold">Browser Wallet</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </SolanaWalletContext.Provider>
  );
};

export const useSolanaWallet = () => {
  const context = useContext(SolanaWalletContext);
  if (context === undefined) {
    throw new Error("useSolanaWallet must be used within a SolanaWalletProvider");
  }
  return context;
};
