import { SupabaseService } from "../services/supabase";

export const GC_INVENTORY = {}; // Reference object to prevent import issues

/**
 * Allocates a fresh, unused gift card code from the dynamic inventory pool and marks it as used.
 */
export function allocateGiftCardCode(productId: string, region: string, price: number): string | null {
  const brandKey = productId.replace("p-", "").split("-")[0].toLowerCase();
  const pool = SupabaseService.getGiftCardPool();
  const match = pool.find(c => 
    !c.isUsed && 
    c.brand.toLowerCase() === brandKey && 
    c.region === region && 
    c.price === price
  );
  if (match) {
    match.isUsed = true;
    match.usedByOrderId = "checkout";
    SupabaseService.saveGiftCardPool(pool);
    return match.code;
  }
  return null;
}

/**
 * Checks how many unused pre-saved codes remain in the dynamic pool.
 */
export function getRemainingCodeCount(productId: string, region: string, price: number): number {
  const brandKey = productId.replace("p-", "").split("-")[0].toLowerCase();
  const pool = SupabaseService.getGiftCardPool();
  return pool.filter(c => 
    !c.isUsed && 
    c.brand.toLowerCase() === brandKey && 
    c.region === region && 
    c.price === price
  ).length;
}
