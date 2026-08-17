export interface Product {
  id: string;
  name: string;
  description: string;
  brand: string;
  image: string;
  category: string;
  rating: number;
  reviewsCount: number;
  retailPrice: number;       // Original price on retailer site
  marketplacePrice: number;  // Price on SOLCart (includes markup)
  estimatedDelivery: string; // e.g. "2-3 days", "Tomorrow"
  specs: Record<string, string>;
  retailerId: string;        // e.g. "amazon", "nike"
  stockCount: number;
  isFeatured: boolean;
}

export interface RetailerConfig {
  id: string;
  name: string;
  logo: string;
  markupPercentage: number;  // e.g. 10 for 10%
  isActive: boolean;
  description: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface ShippingAddress {
  id: string;
  name: string;
  streetAddress: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
}

export type OrderStatus = 
  | 'pending' 
  | 'paid' 
  | 'swapping' 
  | 'purchased' 
  | 'shipped' 
  | 'delivered' 
  | 'refunded';

export interface CustomerDetails {
  name: string;
  email: string;
  phone: string;
}

export interface Order {
  id: string;
  walletAddress: string;
  customerDetails: CustomerDetails;
  shippingAddress: ShippingAddress;
  items: {
    productId: string;
    productName: string;
    brand: string;
    retailerId: string;
    quantity: number;
    retailPriceUSD: number;
    marketplacePriceUSD: number;
    image: string;
  }[];
  retailerId: string; // Sourced from item's retailer
  retailPriceUSD: number;
  paidSOL: number;
  receivedUSDC: number;
  txHash: string;
  swapTxHash?: string;
  status: OrderStatus;
  timestamp: string;
  trackingNumber?: string;
  carrier?: string;
}

export interface Transaction {
  id: string;
  orderId?: string;
  walletAddress: string;
  type: 'payment' | 'swap' | 'refund';
  amount: number;
  token: 'SOL' | 'USDC';
  status: 'pending' | 'success' | 'failed';
  txHash: string;
  timestamp: string;
}

export interface RefundRequest {
  id: string;
  orderId: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  paidSOL: number;
  refundAmountUSD: number;
  refundTxHash?: string;
  timestamp: string;
}

export interface PriceCache {
  symbol: string;
  priceUSD: number;
  lastUpdated: string;
}

export interface ActivityLog {
  id: string;
  action: string;
  details: string;
  timestamp: string;
  type: 'info' | 'warning' | 'security';
}
