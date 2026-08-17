import { NextResponse } from "next/server";
import { HeliusService, MERCHANT_WALLET_ADDRESS } from "@/services/helius";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { txHash, merchantWallet, expectedAmountSOL, network } = body;

    if (!txHash) {
      return NextResponse.json(
        { success: false, approved: false, error: "Transaction signature txHash is required" },
        { status: 400 }
      );
    }

    const targetMerchant = merchantWallet || MERCHANT_WALLET_ADDRESS;
    const activeNetwork = network || "Devnet";

    // Perform server-side verification against Solana RPC
    const verification = await HeliusService.verifyPaymentTransfer(
      txHash,
      targetMerchant,
      expectedAmountSOL || 0,
      activeNetwork
    );

    if (verification.verified) {
      return NextResponse.json({
        success: true,
        approved: true,
        txHash,
        merchantWallet: targetMerchant,
        blockSlot: verification.blockSlot || 0,
        message: "Payment transaction verified and approved on-chain by SOLCart Backend.",
        timestamp: new Date().toISOString()
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          approved: false,
          txHash,
          error: verification.error || "Backend verification rejected transaction."
        },
        { status: 400 }
      );
    }
  } catch (e: any) {
    console.error("Backend payment verification error:", e);
    return NextResponse.json(
      { success: false, approved: false, error: e.message || "Internal backend verification error" },
      { status: 500 }
    );
  }
}
