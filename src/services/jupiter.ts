import { getSolPrice } from "../lib/jupiter";
import { PublicKey } from "@solana/web3.js";

// Standard Solana Mint Addresses
export const SOL_MINT = "So11111111111111111111111111111111111111112";
export const USDC_MINT = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";

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
   * to calculate an estimated USDC return with simulated slippage.
   */
  static async getQuote(
    amountLamports: number,
    slippageBps: number = 50 // 0.5% default
  ): Promise<JupiterQuoteResponse> {
    try {
      const url = `https://quote-api.jup.ag/v6/quote?inputMint=${SOL_MINT}&outputMint=${USDC_MINT}&amount=${amountLamports}&slippageBps=${slippageBps}`;
      const res = await fetch(url);
      
      if (res.ok) {
        const quote: JupiterQuoteResponse = await res.json();
        return quote;
      } else {
        const errText = await res.text();
        console.warn(`Jupiter Quote API failed with status ${res.status}:`, errText);
      }
    } catch (e) {
      console.warn("Could not retrieve quote from Jupiter API. Falling back to simulation.", e);
    }

    // SIMULATED FALLBACK
    const solPrice = await getSolPrice();
    const solAmount = amountLamports / 1e9;
    
    // Calculate expected USDC output (USDC has 6 decimals on Solana)
    const expectedUsdc = solAmount * solPrice;
    const slippageFactor = 1 - (slippageBps / 10000);
    const minUsdc = expectedUsdc * slippageFactor;
    
    const outAmountLamports = Math.floor(expectedUsdc * 1e6).toString();
    const minOutAmountLamports = Math.floor(minUsdc * 1e6).toString();

    return {
      inputMint: SOL_MINT,
      inAmount: amountLamports.toString(),
      outputMint: USDC_MINT,
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
   */
  static async getSwapTransaction(
    quoteResponse: JupiterQuoteResponse,
    userPublicKey: string,
    destinationWallet?: string
  ): Promise<JupiterSwapResponse> {
    try {
      let destinationTokenAccount: string | undefined = undefined;
      
      if (destinationWallet) {
        try {
          const TOKEN_PROGRAM_ID = new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA");
          const ASSOCIATED_TOKEN_PROGRAM_ID = new PublicKey("ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL");
          
          const [ataAddress] = PublicKey.findProgramAddressSync(
            [
              new PublicKey(destinationWallet).toBuffer(),
              TOKEN_PROGRAM_ID.toBuffer(),
              new PublicKey(USDC_MINT).toBuffer()
            ],
            ASSOCIATED_TOKEN_PROGRAM_ID
          );
          destinationTokenAccount = ataAddress.toBase58();
          console.log(`Derived USDC Associated Token Account for recipient ${destinationWallet} is: ${destinationTokenAccount}`);
        } catch (deriveErr) {
          console.error("Failed to derive USDC Associated Token Account for destination wallet", deriveErr);
        }
      }

      const res = await fetch("https://quote-api.jup.ag/v6/swap", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          quoteResponse,
          userPublicKey,
          wrapAndUnwrapSol: true,
          destinationTokenAccount
        })
      });

      if (res.ok) {
        const swapResponse: JupiterSwapResponse = await res.json();
        return swapResponse;
      } else {
        const errText = await res.text();
        console.warn(`Jupiter Swap API failed with status ${res.status}:`, errText);
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
    outAmountUSDC: number;
  }> {
    const lamports = Math.floor(solAmount * 1e9);
    const quote = await this.getQuote(lamports);
    
    // USDC has 6 decimals on Solana
    const outAmountUSDC = parseInt(quote.outAmount) / 1e6;
    
    return {
      quote,
      outAmountUSDC
    };
  }
}
