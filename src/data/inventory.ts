import { SupabaseService } from "../services/supabase";
import { RetailerService } from "../services/retailers";

export const GC_INVENTORY = {}; // Reference object to prevent import issues

function resolveBrandKeywords(productId: string): string[] {
  const keywords: string[] = [];
  const rawIdKey = productId.replace("p-", "").split("-")[0].toLowerCase();
  if (rawIdKey) keywords.push(rawIdKey);
  
  const prod = RetailerService.getProductById(productId);
  if (prod?.brand) {
    keywords.push(prod.brand.toLowerCase());
  }
  return keywords;
}

/**
 * Allocates a fresh, unused gift card code from the dynamic inventory pool and marks it as used.
 */
export function allocateGiftCardCode(productId: string, region: string, price: number): string | null {
  const brandKeywords = resolveBrandKeywords(productId);
  const pool = SupabaseService.getGiftCardPool();
  const match = pool.find(c => 
    !c.isUsed && 
    brandKeywords.includes(c.brand.toLowerCase()) && 
    c.region === region && 
    Number(c.price) === Number(price)
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
  const brandKeywords = resolveBrandKeywords(productId);
  const pool = SupabaseService.getGiftCardPool();
  return pool.filter(c => 
    !c.isUsed && 
    brandKeywords.includes(c.brand.toLowerCase()) && 
    c.region === region && 
    Number(c.price) === Number(price)
  ).length;
}

