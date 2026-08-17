import { NextResponse } from "next/server";
import { Connection, PublicKey } from "@solana/web3.js";

const SOL_MINT = "So11111111111111111111111111111111111111112";
const USDC_MINT = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";

export async function POST(request: Request) {
  try {
    const { solAmount, userPublicKey, destinationWallet } = await request.json();

    if (!solAmount || !userPublicKey || !destinationWallet) {
      return NextResponse.json({ success: false, error: "Missing required parameters" }, { status: 400 });
    }

    const lamports = Math.max(1, Math.round(solAmount * 1e9));

    // 1. Fetch Quote using Jupiter Swap API v1 (keyless access)
    let quoteResponse: any = null;
    let quoteError: any = null;

    const quoteUrls = [
      `https://api.jup.ag/swap/v1/quote?inputMint=${SOL_MINT}&outputMint=${USDC_MINT}&amount=${lamports}&slippageBps=100`
    ];

    for (const url of quoteUrls) {
      try {
        const res = await fetch(url, { signal: AbortSignal.timeout(6000) });
        if (res.ok) {
          quoteResponse = await res.json();
          quoteError = null;
          break;
        } else {
          const errText = await res.text();
          quoteError = new Error(`Status ${res.status}: ${errText}`);
        }
      } catch (err: any) {
        quoteError = err;
      }
    }

    if (!quoteResponse) {
      return NextResponse.json({ 
        success: false, 
        error: `Jupiter Quote failed. Error: ${quoteError?.message || quoteError}` 
      }, { status: 502 });
    }

    // 2. Derive ATA for Merchant USDC settlement
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
    const destinationTokenAccount = ataAddress.toBase58();

    // 3. Request Swap Transaction from Jupiter Swap API v1
    let swapData: any = null;
    let swapError: any = null;

    const swapUrls = [
      "https://api.jup.ag/swap/v1/swap"
    ];

    for (const url of swapUrls) {
      try {
        const res = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            quoteResponse,
            userPublicKey,
            wrapAndUnwrapSol: true,
            destinationTokenAccount,
            dynamicComputeUnitLimit: true,
            prioritizationFeeLamports: "auto"
          }),
          signal: AbortSignal.timeout(6000)
        });

        if (res.ok) {
          swapData = await res.json();
          swapError = null;
          break;
        } else {
          const errText = await res.text();
          swapError = new Error(`Status ${res.status}: ${errText}`);
        }
      } catch (err: any) {
        swapError = err;
      }
    }

    if (!swapData) {
      return NextResponse.json({ 
        success: false, 
        error: `Jupiter Swap transaction failed. Error: ${swapError?.message || swapError}` 
      }, { status: 502 });
    }

    return NextResponse.json({
      success: true,
      swapTransaction: swapData.swapTransaction,
      lastValidBlockHeight: swapData.lastValidBlockHeight
    });

  } catch (e: any) {
    console.error("Jupiter swap proxy error:", e);
    return NextResponse.json({ success: false, error: e.message || e }, { status: 500 });
  }
}
