"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { Transaction, SystemProgram, PublicKey, LAMPORTS_PER_SOL, VersionedTransaction, Connection } from "@solana/web3.js";
import { HeliusService, MERCHANT_WALLET_ADDRESS } from "../services/helius";
import { JupiterService } from "../services/jupiter";

export type WalletProviderName = "Phantom" | "Solflare" | "Backpack" | "SOLCart Test Wallet";
export type SolanaNetwork = "Mainnet" | "Devnet" | "Simulated";

interface SolanaWalletContextType {
  connected: boolean;
  walletAddress: string | null;
  walletName: WalletProviderName | null;
  balance: number;
  loading: boolean;
  networkStatus: SolanaNetwork;
  isSolflareDetected: boolean;
  setNetworkStatus: (net: SolanaNetwork) => void;
  connect: (providerName: WalletProviderName) => Promise<{ success: boolean; notFound?: boolean }>;
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
  const [networkStatus, setNetworkStatusState] = useState<SolanaNetwork>("Devnet");
  const [isSolflareDetected, setIsSolflareDetected] = useState(false);

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

    // Handle mock addresses
    if (address.startsWith("MOCK_") || address === "SOLCartTestWa11et111111111111111111111111" || net === "Simulated") {
      const mockBal = await HeliusService.getBalance(address, "Simulated");
      setBalance(mockBal);
      return;
    }

    try {
      // 1. Try injected Solflare/wallet provider RPC connection first
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

      // 2. Query via HeliusService multi-RPC failover pool
      let bal = await HeliusService.getBalance(address, net);

      // If active network returns 0, check alternate network (Devnet <-> Mainnet auto-detect)
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
    if (!walletName || walletName === "SOLCart Test Wallet") return;
    const provider = getWalletProvider(walletName);
    if (!provider || typeof provider.on !== "function") return;

    const handleAccountChange = (newPublicKey: any) => {
      if (newPublicKey) {
        const addr = newPublicKey.toString();
        setWalletAddress(addr);
        localStorage.setItem("solcart_wallet_address", addr);
      } else {
        // Disconnected or logged out from wallet popup
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
    const storedNet = (localStorage.getItem("solcart_wallet_network") as SolanaNetwork) || "Devnet";

    if (storedNet) setNetworkStatusState(storedNet);

    if (storedConnected && storedAddress && storedName) {
      setConnected(true);
      setWalletAddress(storedAddress);
      setWalletName(storedName);

      // Attempt silent reconnect if extension exists
      if (storedName === "Solflare") {
        const solflare = getSolflareProvider();
        if (solflare && typeof solflare.connect === "function") {
          solflare.connect({ onlyIfTrusted: true }).then((res: any) => {
            if (solflare.publicKey) {
              setWalletAddress(solflare.publicKey.toString());
            }
          }).catch(() => {
            // silent fail if not trusted yet
          });
        }
      }
    }
  }, []);

  const connect = async (providerName: WalletProviderName): Promise<{ success: boolean; notFound?: boolean }> => {
    setLoading(true);

    if (providerName === "SOLCart Test Wallet") {
      const mockAddress = "SOLCartTestWa11et111111111111111111111111";
      setConnected(true);
      setWalletAddress(mockAddress);
      setWalletName(providerName);
      setNetworkStatusState("Simulated");
      
      localStorage.setItem("solcart_wallet_connected", "true");
      localStorage.setItem("solcart_wallet_address", mockAddress);
      localStorage.setItem("solcart_wallet_name", providerName);
      localStorage.setItem("solcart_wallet_network", "Simulated");

      await refreshBalance(mockAddress, "Simulated");
      setLoading(false);
      return { success: true };
    }

    try {
      const provider = getWalletProvider(providerName);

      if (!provider) {
        setLoading(false);
        return { success: false, notFound: true };
      }

      // Connect to browser wallet popup/extension
      const response = await provider.connect();
      const address = (response?.publicKey || provider.publicKey)?.toString();

      if (!address) {
        throw new Error("Public key not received from wallet");
      }

      // Auto-detect network with balance (prefer Mainnet, fallback to Devnet if Devnet has funds)
      let targetNet: SolanaNetwork = networkStatus === "Simulated" ? "Mainnet" : networkStatus;
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
      setLoading(false);
      return { success: true };

    } catch (e: any) {
      console.error(`Error connecting to ${providerName}`, e);
      setLoading(false);
      return { success: false };
    }
  };

  const disconnect = () => {
    if (walletName && walletName !== "SOLCart Test Wallet") {
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
    setNetworkStatusState("Devnet");

    localStorage.removeItem("solcart_wallet_connected");
    localStorage.removeItem("solcart_wallet_address");
    localStorage.removeItem("solcart_wallet_name");
    localStorage.removeItem("solcart_wallet_network");
  };

  const requestFaucet = async () => {
    if (!walletAddress) return;
    const addedAmount = 10;
    const nextBal = await HeliusService.addMockFaucet(walletAddress, 10);
    setBalance(nextBal);
  };

  const signPaymentTransaction = async (
    amountSOL: number
  ): Promise<{ success: boolean; signature: string; error?: string }> => {
    if (!walletAddress) {
      return { success: false, signature: "", error: "Wallet not connected" };
    }

    if (balance < amountSOL) {
      return { success: false, signature: "", error: `Insufficient balance. Required: ${amountSOL.toFixed(4)} SOL, Current: ${balance.toFixed(4)} SOL` };
    }

    // 1. Simulated or Test Sandbox Wallet execution
    if (walletAddress.startsWith("MOCK_") || walletAddress === "SOLCartTestWa11et111111111111111111111111" || networkStatus === "Simulated") {
      await new Promise(resolve => setTimeout(resolve, 1500));
      const success = await HeliusService.deductMockBalance(walletAddress, amountSOL);
      if (success) {
        const txHash = `mock_tx_${Math.random().toString(36).substr(2, 16)}_${Date.now()}`;
        await refreshBalance(walletAddress, "Simulated");
        return { success: true, signature: txHash };
      } else {
        return { success: false, signature: "", error: "Sandbox transaction failed" };
      }
    }

    // 2. Real Solflare / Browser Wallet On-Chain Transaction Signature & Submission
    try {
      const provider = getWalletProvider(walletName || "Solflare");

      if (!provider) {
        return { success: false, signature: "", error: `${walletName || "Solflare"} extension not detected in browser.` };
      }

      let connection = HeliusService.getConnection(networkStatus === "Mainnet" ? "Mainnet" : "Devnet");
      const fromPubkey = new PublicKey(walletAddress);
      
      // Auto-failover blockhash fetch to bypass 403 Forbidden
      let blockhash = "";
      try {
        const bhRes = await connection.getLatestBlockhash("confirmed");
        blockhash = bhRes.blockhash;
      } catch (err) {
        console.warn("Primary RPC connection failed, falling back to public RPC nodes", err);
        const fallbackUrl = networkStatus === "Mainnet" 
          ? "https://solana-rpc.publicnode.com" 
          : "https://api.devnet.solana.com";
        connection = new Connection(fallbackUrl, "confirmed");
        const bhRes = await connection.getLatestBlockhash("confirmed");
        blockhash = bhRes.blockhash;
      }

      let txHash = "";

      if (networkStatus === "Mainnet") {
        // Execute REAL SOL -> USDC Swap with output routing to MERCHANT_WALLET_ADDRESS
        try {
          const swapRes = await fetch("/api/swap", {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              solAmount: amountSOL,
              userPublicKey: walletAddress,
              destinationWallet: MERCHANT_WALLET_ADDRESS
            })
          });

          if (!swapRes.ok) {
            const errBody = await swapRes.json().catch(() => ({ error: "Unknown error" }));
            throw new Error(errBody.error || `HTTP ${swapRes.status}`);
          }

          const swapData = await swapRes.json();
          if (!swapData.success || !swapData.swapTransaction) {
            throw new Error(swapData.error || "Failed to retrieve swap transaction from proxy.");
          }

          // Web-safe Base64 deserialization without Node.js Buffer
          const binaryString = window.atob(swapData.swapTransaction);
          const len = binaryString.length;
          const bytes = new Uint8Array(len);
          for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }
          const transaction = VersionedTransaction.deserialize(bytes);

          if (typeof provider.signTransaction === "function") {
            const signed = await provider.signTransaction(transaction);
            const rpcPool = [
              connection,
              new Connection("https://rpc.ankr.com/solana", "confirmed"),
              new Connection("https://api.mainnet-beta.solana.com", "confirmed"),
              new Connection("https://solana-mainnet.rpc.extrnode.com", "confirmed")
            ];
            let broadcastErr: any = null;
            for (const conn of rpcPool) {
              try {
                txHash = await conn.sendRawTransaction(signed.serialize(), { skipPreflight: false });
                if (txHash) {
                  connection = conn;
                  broadcastErr = null;
                  break;
                }
              } catch (err) {
                console.warn("Failed to broadcast swap transaction on RPC node, trying next...", err);
                broadcastErr = err;
              }
            }
            if (broadcastErr) throw broadcastErr;
          } else if (typeof provider.signAndSendTransaction === "function") {
            const res = await provider.signAndSendTransaction(transaction);
            txHash = typeof res === "string" ? res : res.signature;
          } else {
            throw new Error("Wallet provider does not support signing versioned transactions.");
          }
        } catch (swapError: any) {
          console.warn("Mainnet Jupiter Swap failed, falling back to direct transfer", swapError);
          const errorMsg = swapError.message || swapError.toString();
          alert(`Jupiter swap to USDC failed. Error: ${errorMsg}\n\nFalling back to direct SOL transfer to merchant.`);
          // Fallback to direct SOL transfer if swap fails
          const toPubkey = new PublicKey(MERCHANT_WALLET_ADDRESS);
          const lamports = Math.max(1, Math.round(amountSOL * LAMPORTS_PER_SOL));
          const transaction = new Transaction().add(
            SystemProgram.transfer({ fromPubkey, toPubkey, lamports })
          );
          transaction.recentBlockhash = blockhash;
          transaction.feePayer = fromPubkey;

          if (typeof provider.signTransaction === "function") {
            const signed = await provider.signTransaction(transaction);
            const rpcPool = [
              connection,
              new Connection("https://rpc.ankr.com/solana", "confirmed"),
              new Connection("https://api.mainnet-beta.solana.com", "confirmed")
            ];
            let broadcastErr: any = null;
            for (const conn of rpcPool) {
              try {
                txHash = await conn.sendRawTransaction(signed.serialize(), { skipPreflight: false });
                if (txHash) {
                  connection = conn;
                  broadcastErr = null;
                  break;
                }
              } catch (err) {
                console.warn("Failed to broadcast fallback transaction on RPC node, trying next...", err);
                broadcastErr = err;
              }
            }
            if (broadcastErr) throw broadcastErr;
          } else if (typeof provider.signAndSendTransaction === "function") {
            const res = await provider.signAndSendTransaction(transaction);
            txHash = typeof res === "string" ? res : res.signature;
          } else {
            throw new Error("Wallet provider does not support signTransaction or signAndSendTransaction");
          }
        }
      } else {
        // Devnet fallback: Direct SOL transfer
        const toPubkey = new PublicKey(MERCHANT_WALLET_ADDRESS);
        const lamports = Math.max(1, Math.round(amountSOL * LAMPORTS_PER_SOL));
        const transaction = new Transaction().add(
          SystemProgram.transfer({ fromPubkey, toPubkey, lamports })
        );
        transaction.recentBlockhash = blockhash;
        transaction.feePayer = fromPubkey;

        if (typeof provider.signTransaction === "function") {
          const signed = await provider.signTransaction(transaction);
          txHash = await connection.sendRawTransaction(signed.serialize(), { skipPreflight: false });
        } else if (typeof provider.signAndSendTransaction === "function") {
          const res = await provider.signAndSendTransaction(transaction);
          txHash = typeof res === "string" ? res : res.signature;
        } else {
          throw new Error("Wallet provider does not support signTransaction or signAndSendTransaction");
        }
      }

      // Wait for on-chain block confirmation
      const confirmed = await HeliusService.confirmTransaction(txHash, networkStatus);

      if (!confirmed) {
        return { success: false, signature: txHash, error: "Transaction broadcasted but failed to confirm on Solana network." };
      }

      // Refresh balance after successful transaction
      await refreshBalance(walletAddress, networkStatus);

      return { success: true, signature: txHash };
    } catch (e: any) {
      console.error("Solana transaction execution error", e);
      const msg = e?.message || "User rejected transaction signature";
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

