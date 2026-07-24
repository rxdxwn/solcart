import { getSolPrice } from "../lib/jupiter";

// Standard Solana Mint Addresses
export const SOL_MINT = "So11111111111111111111111111111111111111112";
export const USDT_MINT = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";

export interface JupiterQuoteResponse {
  inputMint: string;
  inAmount: string;
  outputMint: string;
  outAmount: string;
  otherAmountThreshold: string;
  swapMode: string;
  slippageBps: number;
  platformFee?: {
    amount: string;
    feeBps: number;
  };
  priceImpactPct: string;
  routePlan: any[];
  contextSlot: number;
  timeTaken: number;
}

export interface JupiterSwapResponse {
  swapTransaction: string; // base64 serialized transaction
  lastValidBlockHeight: number;
}

export class JupiterService {
  /**
   * Fetches a swap quote from Jupiter API.
   * In local/simulated environment, it uses the live SOL price from Pyth
   * to calculate an estimated USDT return with simulated slippage.
   */
  static async getQuote(
    amountLamports: number,
    slippageBps: number = 50 // 0.5% default
  ): Promise<JupiterQuoteResponse> {
    try {
      const url = `https://quote-api.jup.ag/v6/quote?inputMint=${SOL_MINT}&outputMint=${USDT_MINT}&amount=${amountLamports}&slippageBps=${slippageBps}`;
      const res = await fetch(url);
      
      if (res.ok) {
        const quote: JupiterQuoteResponse = await res.json();
        return quote;
      }
    } catch (e) {
      console.warn("Could not retrieve quote from Jupiter API. Falling back to simulation.", e);
    }

    // SIMULATED FALLBACK
    const solPrice = await getSolPrice();
    const solAmount = amountLamports / 1e9;
    
    // Calculate expected USDT output (USDT has 6 decimals on Solana)
    const expectedUsdt = solAmount * solPrice;
    const slippageFactor = 1 - (slippageBps / 10000);
    const minUsdt = expectedUsdt * slippageFactor;
    
    const outAmountLamports = Math.floor(expectedUsdt * 1e6).toString();
    const minOutAmountLamports = Math.floor(minUsdt * 1e6).toString();

    return {
      inputMint: SOL_MINT,
      inAmount: amountLamports.toString(),
      outputMint: USDT_MINT,
      outAmount: outAmountLamports,
      otherAmountThreshold: minOutAmountLamports,
      swapMode: "ExactIn",
      slippageBps,
      priceImpactPct: "0.02",
      routePlan: [],
      contextSlot: 0,
      timeTaken: 0.05
    };
  }

  /**
   * Generates a serialized Base64 transaction from the Jupiter swap API.
   * To use this in production, post the quote response and user wallet address.
   */
  static async getSwapTransaction(
    quoteResponse: JupiterQuoteResponse,
    userPublicKey: string
  ): Promise<JupiterSwapResponse> {
    try {
      const res = await fetch("https://quote-api.jup.ag/v6/swap", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          quoteResponse,
          userPublicKey,
          wrapAndUnwrapSol: true,
          // Optional: Add referral fees here
        })
      });

      if (res.ok) {
        const swapResponse: JupiterSwapResponse = await res.json();
        return swapResponse;
      }
    } catch (e) {
      console.warn("Could not fetch swap transaction from Jupiter API. Falling back to simulation.", e);
    }

    // SIMULATED FALLBACK
    // Return a mock base64 string and block height
    return {
      swapTransaction: "c29sY2FydF9tb2NrX3N3YXBfdHJhbnNhY3Rpb25fZGF0YV9iYXNlNjQ=",
      lastValidBlockHeight: 184592019
    };
  }

  /**
   * Helper to execute a swap.
   * 1. Get quote.
   * 2. Build swap transaction.
   * 3. Return parameters.
   */
  static async prepareSwap(solAmount: number): Promise<{
    quote: JupiterQuoteResponse;
    outAmountUSDT: number;
  }> {
    const lamports = Math.floor(solAmount * 1e9);
    const quote = await this.getQuote(lamports);
    
    // USDT has 6 decimals on Solana
    const outAmountUSDT = parseInt(quote.outAmount) / 1e6;
    
    return {
      quote,
      outAmountUSDT
    };
  }
}
