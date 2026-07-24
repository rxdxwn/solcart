import { NextResponse } from "next/server";

export async function GET() {
  const mintAddress = "So11111111111111111111111111111111111111112";

  // Attempt 1: Jupiter Price V4 API (highly reliable, returns token symbol key)
  try {
    const res = await fetch("https://price.jup.ag/v4/price?ids=SOL", {
      next: { revalidate: 10 }
    });
    if (res.ok) {
      const data = await res.json();
      const priceVal = data?.data?.SOL?.price;
      if (priceVal) {
        const price = parseFloat(priceVal);
        if (!isNaN(price) && price > 0) {
          return NextResponse.json({ price });
        }
      }
    }
  } catch (e) {
    console.warn("API Price V4 resolution failed, trying V3...", e);
  }

  // Attempt 2: Jupiter Lite Price V3 API (mint address lookup)
  try {
    const res = await fetch(`https://lite-api.jup.ag/price/v3?ids=${mintAddress}`, {
      next: { revalidate: 10 }
    });
    if (res.ok) {
      const data = await res.json();
      // Price V3 returns keyed by mint address
      const tokenObj = data?.[mintAddress] || data?.data?.[mintAddress];
      const priceVal = tokenObj?.price || tokenObj?.usdPrice;
      if (priceVal) {
        const price = parseFloat(priceVal);
        if (!isNaN(price) && price > 0) {
          return NextResponse.json({ price });
        }
      }
    }
  } catch (e) {
    console.warn("API Price V3 resolution failed, trying CoinGecko...", e);
  }

  // Attempt 3: CoinGecko simple price (standard backup)
  try {
    const res = await fetch("https://api.coingecko.com/v3/simple/price?ids=solana&vs_currencies=usd");
    if (res.ok) {
      const data = await res.json();
      const priceVal = data?.solana?.usd;
      if (priceVal) {
        const price = parseFloat(priceVal);
        if (!isNaN(price) && price > 0) {
          return NextResponse.json({ price });
        }
      }
    }
  } catch (e) {
    console.warn("CoinGecko price resolution failed", e);
  }

  // Attempt 4: Safe static fallback price to keep checkout functional
  return NextResponse.json({ price: 185.50, isFallback: true });
}
