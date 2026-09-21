import { Product, RetailerConfig } from "../types";

const DEFAULT_RETAILERS: RetailerConfig[] = [
  {
    id: "amazon",
    name: "Amazon",
    logo: "https://images.unsplash.com/photo-1523474253046-8cd2748b5fd2?w=100&auto=format&fit=crop&q=60",
    markupPercentage: 0,
    isActive: true,
    description: "Shop millions of items worldwide with Amazon Digital Gift Cards."
  },
  {
    id: "apple",
    name: "Apple",
    logo: "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=100&auto=format&fit=crop&q=60",
    markupPercentage: 0,
    isActive: true,
    description: "App Store & iTunes credit for apps, games, music, movies, and iCloud storage."
  },
  {
    id: "steam",
    name: "Steam",
    logo: "https://images.unsplash.com/photo-1612287230202-1bf1d85d1bdf?w=100&auto=format&fit=crop&q=60",
    markupPercentage: 0,
    isActive: true,
    description: "Top up Steam Wallets to buy thousands of PC games instantly."
  },
  {
    id: "playstation",
    name: "PlayStation",
    logo: "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=100&auto=format&fit=crop&q=60",
    markupPercentage: 0,
    isActive: true,
    description: "Download the latest PS5 games and add-ons via PlayStation Network store."
  },
  {
    id: "xbox",
    name: "Xbox",
    logo: "https://images.unsplash.com/photo-1605901309584-818e25960a8f?w=100&auto=format&fit=crop&q=60",
    markupPercentage: 0,
    isActive: true,
    description: "Redeem Xbox Game Pass and purchase Microsoft digital store credits."
  },
  {
    id: "spotify",
    name: "Spotify",
    logo: "https://images.unsplash.com/photo-1614680376593-902f74fa0d41?w=100&auto=format&fit=crop&q=60",
    markupPercentage: 0,
    isActive: true,
    description: "Upgrade or renew Spotify Premium for uninterrupted ad-free music."
  },
  {
    id: "netflix",
    name: "Netflix",
    logo: "https://images.unsplash.com/photo-1574375927938-d5a98e8edd85?w=100&auto=format&fit=crop&q=60",
    markupPercentage: 0,
    isActive: true,
    description: "Settle subscription payments for unlimited streaming of movies and TV shows."
  },
  {
    id: "noon",
    name: "Noon",
    logo: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=100&auto=format&fit=crop&q=60",
    markupPercentage: 0,
    isActive: true,
    description: "Shop millions of items on Noon.com in the UAE, Saudi Arabia, and Egypt."
  }
];

const DEFAULT_PRODUCTS: Product[] = [
  {
    "id": "p-amazon-200-cad",
    "name": "Amazon $200 Gift Card (CAD)",
    "description": "Send or redeem $200 on Amazon.ca with this Digital Amazon Gift Card. Delivered instantly to your email — no shipping, no waiting. Pay with Solana and receive your redeemable code the moment your transaction confirms.",
    "brand": "Amazon",
    "image": "https://m.media-amazon.com/images/I/31I63XNcY._AC_.jpg",
    "category": "Retail",
    "rating": 5,
    "reviewsCount": 0,
    "retailPrice": 200,
    "marketplacePrice": 200,
    "estimatedDelivery": "Instant Digital Delivery",
    "specs": {
      "Format": "Digital Code",
      "Region": "Canada",
      "Currency": "CAD",
      "Retailer Sourced": "amazon"
    },
    "retailerId": "amazon",
    "stockCount": 50,
    "isFeatured": false,
    "reviews": [],
    "pricePoints": [
      200
    ],
    "currency": "CAD",
    "region": "Canada",
    "regions": [
      "Canada"
    ]
  },
  {
    "id": "p-amazon-150-cad",
    "name": "Amazon $150 Gift Card (CAD)",
    "description": "Send or redeem $150 on Amazon.ca with this Digital Amazon Gift Card. Delivered instantly to your email — no shipping, no waiting. Pay with Solana and receive your redeemable code the moment your transaction confirms.",
    "brand": "Amazon",
    "image": "https://m.media-amazon.com/images/I/31I63XNcY._AC_.jpg",
    "category": "Retail",
    "rating": 5,
    "reviewsCount": 0,
    "retailPrice": 150,
    "marketplacePrice": 150,
    "estimatedDelivery": "Instant Digital Delivery",
    "specs": {
      "Format": "Digital Code",
      "Region": "Canada",
      "Currency": "CAD",
      "Retailer Sourced": "amazon"
    },
    "retailerId": "amazon",
    "stockCount": 50,
    "isFeatured": false,
    "reviews": [],
    "pricePoints": [
      150
    ],
    "currency": "CAD",
    "region": "Canada",
    "regions": [
      "Canada"
    ]
  },
  {
    "id": "p-amazon-100-cad",
    "name": "Amazon $100 Gift Card (CAD)",
    "description": "Send or redeem $100 on Amazon.ca with this Digital Amazon Gift Card. Delivered instantly to your email — no shipping, no waiting. Pay with Solana and receive your redeemable code the moment your transaction confirms.",
    "brand": "Amazon",
    "image": "https://m.media-amazon.com/images/I/31I63XNcY._AC_.jpg",
    "category": "Retail",
    "rating": 5,
    "reviewsCount": 0,
    "retailPrice": 100,
    "marketplacePrice": 100,
    "estimatedDelivery": "Instant Digital Delivery",
    "specs": {
      "Format": "Digital Code",
      "Region": "Canada",
      "Currency": "CAD",
      "Retailer Sourced": "amazon"
    },
    "retailerId": "amazon",
    "stockCount": 50,
    "isFeatured": false,
    "reviews": [],
    "pricePoints": [
      100
    ],
    "currency": "CAD",
    "region": "Canada",
    "regions": [
      "Canada"
    ]
  },
  {
    "id": "p-amazon-75-cad",
    "name": "Amazon $75 Gift Card (CAD)",
    "description": "Send or redeem $75 on Amazon.ca with this Digital Amazon Gift Card. Delivered instantly to your email — no shipping, no waiting. Pay with Solana and receive your redeemable code the moment your transaction confirms.",
    "brand": "Amazon",
    "image": "https://m.media-amazon.com/images/I/31I63XNcY._AC_.jpg",
    "category": "Retail",
    "rating": 5,
    "reviewsCount": 0,
    "retailPrice": 75,
    "marketplacePrice": 75,
    "estimatedDelivery": "Instant Digital Delivery",
    "specs": {
      "Format": "Digital Code",
      "Region": "Canada",
      "Currency": "CAD",
      "Retailer Sourced": "amazon"
    },
    "retailerId": "amazon",
    "stockCount": 50,
    "isFeatured": false,
    "reviews": [],
    "pricePoints": [
      75
    ],
    "currency": "CAD",
    "region": "Canada",
    "regions": [
      "Canada"
    ]
  },
  {
    "id": "p-amazon-50-cad",
    "name": "Amazon $50 Gift Card (CAD)",
    "description": "Send or redeem $50 on Amazon.ca with this Digital Amazon Gift Card. Delivered instantly to your email — no shipping, no waiting. Pay with Solana and receive your redeemable code the moment your transaction confirms.",
    "brand": "Amazon",
    "image": "https://m.media-amazon.com/images/I/31I63XNcY._AC_.jpg",
    "category": "Retail",
    "rating": 5,
    "reviewsCount": 0,
    "retailPrice": 50,
    "marketplacePrice": 50,
    "estimatedDelivery": "Instant Digital Delivery",
    "specs": {
      "Format": "Digital Code",
      "Region": "Canada",
      "Currency": "CAD",
      "Retailer Sourced": "amazon"
    },
    "retailerId": "amazon",
    "stockCount": 50,
    "isFeatured": false,
    "reviews": [],
    "pricePoints": [
      50
    ],
    "currency": "CAD",
    "region": "Canada",
    "regions": [
      "Canada"
    ]
  },
  {
    "id": "p-amazon-25-cad",
    "name": "Amazon $25 Gift Card (CAD)",
    "description": "Send or redeem $25 on Amazon.ca with this Digital Amazon Gift Card. Delivered instantly to your email — no shipping, no waiting. Pay with Solana and receive your redeemable code the moment your transaction confirms.",
    "brand": "Amazon",
    "image": "https://m.media-amazon.com/images/I/31I63XNcY._AC_.jpg",
    "category": "Retail",
    "rating": 5,
    "reviewsCount": 0,
    "retailPrice": 25,
    "marketplacePrice": 25,
    "estimatedDelivery": "Instant Digital Delivery",
    "specs": {
      "Format": "Digital Code",
      "Region": "Canada",
      "Currency": "CAD",
      "Retailer Sourced": "amazon"
    },
    "retailerId": "amazon",
    "stockCount": 50,
    "isFeatured": false,
    "reviews": [],
    "pricePoints": [
      25
    ],
    "currency": "CAD",
    "region": "Canada",
    "regions": [
      "Canada"
    ]
  },
  {
    "id": "p-grab-100-sgd",
    "name": "GrabGift S$100 Voucher",
    "description": "Redeem S$100 for Grab Rides, GrabFood, GrabMart, and express deliveries in Singapore. Instant digital voucher code issued upon Solana settlement.",
    "brand": "Grab",
    "image": "https://images.unsplash.com/photo-1526367790999-0150786686a2?w=500&auto=format&fit=crop",
    "category": "Food & Drink",
    "rating": 5,
    "reviewsCount": 0,
    "retailPrice": 100,
    "marketplacePrice": 100,
    "estimatedDelivery": "Instant Digital Delivery",
    "specs": {
      "Format": "Digital Code",
      "Region": "Singapore",
      "Currency": "SGD",
      "Retailer Sourced": "grab"
    },
    "retailerId": "amazon",
    "stockCount": 50,
    "isFeatured": false,
    "reviews": [],
    "pricePoints": [
      100
    ],
    "currency": "SGD",
    "region": "Singapore",
    "regions": [
      "Singapore"
    ]
  },
  {
    "id": "p-grab-80-sgd",
    "name": "GrabGift S$80 Voucher",
    "description": "Redeem S$80 for Grab Rides, GrabFood, GrabMart, and express deliveries in Singapore. Instant digital voucher code issued upon Solana settlement.",
    "brand": "Grab",
    "image": "https://images.unsplash.com/photo-1526367790999-0150786686a2?w=500&auto=format&fit=crop",
    "category": "Food & Drink",
    "rating": 5,
    "reviewsCount": 0,
    "retailPrice": 80,
    "marketplacePrice": 80,
    "estimatedDelivery": "Instant Digital Delivery",
    "specs": {
      "Format": "Digital Code",
      "Region": "Singapore",
      "Currency": "SGD",
      "Retailer Sourced": "grab"
    },
    "retailerId": "amazon",
    "stockCount": 50,
    "isFeatured": false,
    "reviews": [],
    "pricePoints": [
      80
    ],
    "currency": "SGD",
    "region": "Singapore",
    "regions": [
      "Singapore"
    ]
  },
  {
    "id": "p-grab-50-sgd",
    "name": "GrabGift S$50 Voucher",
    "description": "Redeem S$50 for Grab Rides, GrabFood, GrabMart, and express deliveries in Singapore. Instant digital voucher code issued upon Solana settlement.",
    "brand": "Grab",
    "image": "https://images.unsplash.com/photo-1526367790999-0150786686a2?w=500&auto=format&fit=crop",
    "category": "Food & Drink",
    "rating": 5,
    "reviewsCount": 0,
    "retailPrice": 50,
    "marketplacePrice": 50,
    "estimatedDelivery": "Instant Digital Delivery",
    "specs": {
      "Format": "Digital Code",
      "Region": "Singapore",
      "Currency": "SGD",
      "Retailer Sourced": "grab"
    },
    "retailerId": "amazon",
    "stockCount": 50,
    "isFeatured": false,
    "reviews": [],
    "pricePoints": [
      50
    ],
    "currency": "SGD",
    "region": "Singapore",
    "regions": [
      "Singapore"
    ]
  },
  {
    "id": "p-grab-30-sgd",
    "name": "GrabGift S$30 Voucher",
    "description": "Redeem S$30 for Grab Rides, GrabFood, GrabMart, and express deliveries in Singapore. Instant digital voucher code issued upon Solana settlement.",
    "brand": "Grab",
    "image": "https://images.unsplash.com/photo-1526367790999-0150786686a2?w=500&auto=format&fit=crop",
    "category": "Food & Drink",
    "rating": 5,
    "reviewsCount": 0,
    "retailPrice": 30,
    "marketplacePrice": 30,
    "estimatedDelivery": "Instant Digital Delivery",
    "specs": {
      "Format": "Digital Code",
      "Region": "Singapore",
      "Currency": "SGD",
      "Retailer Sourced": "grab"
    },
    "retailerId": "amazon",
    "stockCount": 50,
    "isFeatured": false,
    "reviews": [],
    "pricePoints": [
      30
    ],
    "currency": "SGD",
    "region": "Singapore",
    "regions": [
      "Singapore"
    ]
  },
  {
    "id": "p-grab-20-sgd",
    "name": "GrabGift S$20 Voucher",
    "description": "Redeem S$20 for Grab Rides, GrabFood, GrabMart, and express deliveries in Singapore. Instant digital voucher code issued upon Solana settlement.",
    "brand": "Grab",
    "image": "https://images.unsplash.com/photo-1526367790999-0150786686a2?w=500&auto=format&fit=crop",
    "category": "Food & Drink",
    "rating": 5,
    "reviewsCount": 0,
    "retailPrice": 20,
    "marketplacePrice": 20,
    "estimatedDelivery": "Instant Digital Delivery",
    "specs": {
      "Format": "Digital Code",
      "Region": "Singapore",
      "Currency": "SGD",
      "Retailer Sourced": "grab"
    },
    "retailerId": "amazon",
    "stockCount": 50,
    "isFeatured": false,
    "reviews": [],
    "pricePoints": [
      20
    ],
    "currency": "SGD",
    "region": "Singapore",
    "regions": [
      "Singapore"
    ]
  },
  {
    "id": "p-grab-10-sgd",
    "name": "GrabGift S$10 Voucher",
    "description": "Redeem S$10 for Grab Rides, GrabFood, GrabMart, and express deliveries in Singapore. Instant digital voucher code issued upon Solana settlement.",
    "brand": "Grab",
    "image": "https://images.unsplash.com/photo-1526367790999-0150786686a2?w=500&auto=format&fit=crop",
    "category": "Food & Drink",
    "rating": 5,
    "reviewsCount": 0,
    "retailPrice": 10,
    "marketplacePrice": 10,
    "estimatedDelivery": "Instant Digital Delivery",
    "specs": {
      "Format": "Digital Code",
      "Region": "Singapore",
      "Currency": "SGD",
      "Retailer Sourced": "grab"
    },
    "retailerId": "amazon",
    "stockCount": 50,
    "isFeatured": false,
    "reviews": [],
    "pricePoints": [
      10
    ],
    "currency": "SGD",
    "region": "Singapore",
    "regions": [
      "Singapore"
    ]
  },
  {
    "id": "p-amazon-150-gbp",
    "name": "Amazon £150 Gift Card (GBP)",
    "description": "Shop millions of items on Amazon.co.uk. Redeemable on UK Amazon accounts. Instant code delivery.",
    "brand": "Amazon",
    "image": "https://m.media-amazon.com/images/I/31I63XNcY._AC_.jpg",
    "category": "Retail",
    "rating": 5,
    "reviewsCount": 0,
    "retailPrice": 150,
    "marketplacePrice": 150,
    "estimatedDelivery": "Instant Digital Delivery",
    "specs": {
      "Format": "Digital Code",
      "Region": "United Kingdom",
      "Currency": "GBP",
      "Retailer Sourced": "amazon"
    },
    "retailerId": "amazon",
    "stockCount": 50,
    "isFeatured": false,
    "reviews": [],
    "pricePoints": [
      150
    ],
    "currency": "GBP",
    "region": "United Kingdom",
    "regions": [
      "United Kingdom"
    ]
  },
  {
    "id": "p-amazon-100-gbp",
    "name": "Amazon £100 Gift Card (GBP)",
    "description": "Shop millions of items on Amazon.co.uk. Redeemable on UK Amazon accounts. Instant code delivery.",
    "brand": "Amazon",
    "image": "https://m.media-amazon.com/images/I/31I63XNcY._AC_.jpg",
    "category": "Retail",
    "rating": 5,
    "reviewsCount": 0,
    "retailPrice": 100,
    "marketplacePrice": 100,
    "estimatedDelivery": "Instant Digital Delivery",
    "specs": {
      "Format": "Digital Code",
      "Region": "United Kingdom",
      "Currency": "GBP",
      "Retailer Sourced": "amazon"
    },
    "retailerId": "amazon",
    "stockCount": 50,
    "isFeatured": false,
    "reviews": [],
    "pricePoints": [
      100
    ],
    "currency": "GBP",
    "region": "United Kingdom",
    "regions": [
      "United Kingdom"
    ]
  },
  {
    "id": "p-amazon-75-gbp",
    "name": "Amazon £75 Gift Card (GBP)",
    "description": "Shop millions of items on Amazon.co.uk. Redeemable on UK Amazon accounts. Instant code delivery.",
    "brand": "Amazon",
    "image": "https://m.media-amazon.com/images/I/31I63XNcY._AC_.jpg",
    "category": "Retail",
    "rating": 5,
    "reviewsCount": 0,
    "retailPrice": 75,
    "marketplacePrice": 75,
    "estimatedDelivery": "Instant Digital Delivery",
    "specs": {
      "Format": "Digital Code",
      "Region": "United Kingdom",
      "Currency": "GBP",
      "Retailer Sourced": "amazon"
    },
    "retailerId": "amazon",
    "stockCount": 50,
    "isFeatured": false,
    "reviews": [],
    "pricePoints": [
      75
    ],
    "currency": "GBP",
    "region": "United Kingdom",
    "regions": [
      "United Kingdom"
    ]
  },
  {
    "id": "p-amazon-50-gbp",
    "name": "Amazon £50 Gift Card (GBP)",
    "description": "Shop millions of items on Amazon.co.uk. Redeemable on UK Amazon accounts. Instant code delivery.",
    "brand": "Amazon",
    "image": "https://m.media-amazon.com/images/I/31I63XNcY._AC_.jpg",
    "category": "Retail",
    "rating": 5,
    "reviewsCount": 0,
    "retailPrice": 50,
    "marketplacePrice": 50,
    "estimatedDelivery": "Instant Digital Delivery",
    "specs": {
      "Format": "Digital Code",
      "Region": "United Kingdom",
      "Currency": "GBP",
      "Retailer Sourced": "amazon"
    },
    "retailerId": "amazon",
    "stockCount": 50,
    "isFeatured": false,
    "reviews": [],
    "pricePoints": [
      50
    ],
    "currency": "GBP",
    "region": "United Kingdom",
    "regions": [
      "United Kingdom"
    ]
  },
  {
    "id": "p-amazon-30-gbp",
    "name": "Amazon £30 Gift Card (GBP)",
    "description": "Shop millions of items on Amazon.co.uk. Redeemable on UK Amazon accounts. Instant code delivery.",
    "brand": "Amazon",
    "image": "https://m.media-amazon.com/images/I/31I63XNcY._AC_.jpg",
    "category": "Retail",
    "rating": 5,
    "reviewsCount": 0,
    "retailPrice": 30,
    "marketplacePrice": 30,
    "estimatedDelivery": "Instant Digital Delivery",
    "specs": {
      "Format": "Digital Code",
      "Region": "United Kingdom",
      "Currency": "GBP",
      "Retailer Sourced": "amazon"
    },
    "retailerId": "amazon",
    "stockCount": 50,
    "isFeatured": false,
    "reviews": [],
    "pricePoints": [
      30
    ],
    "currency": "GBP",
    "region": "United Kingdom",
    "regions": [
      "United Kingdom"
    ]
  },
  {
    "id": "p-amazon-20-gbp",
    "name": "Amazon £20 Gift Card (GBP)",
    "description": "Shop millions of items on Amazon.co.uk. Redeemable on UK Amazon accounts. Instant code delivery.",
    "brand": "Amazon",
    "image": "https://m.media-amazon.com/images/I/31I63XNcY._AC_.jpg",
    "category": "Retail",
    "rating": 5,
    "reviewsCount": 0,
    "retailPrice": 20,
    "marketplacePrice": 20,
    "estimatedDelivery": "Instant Digital Delivery",
    "specs": {
      "Format": "Digital Code",
      "Region": "United Kingdom",
      "Currency": "GBP",
      "Retailer Sourced": "amazon"
    },
    "retailerId": "amazon",
    "stockCount": 50,
    "isFeatured": false,
    "reviews": [],
    "pricePoints": [
      20
    ],
    "currency": "GBP",
    "region": "United Kingdom",
    "regions": [
      "United Kingdom"
    ]
  },
  {
    "id": "p-amazon-200-usd",
    "name": "Amazon $200 Gift Card (USD)",
    "description": "Shop millions of products on Amazon.com. Valid for United States Amazon accounts. Instant digital code delivery.",
    "brand": "Amazon",
    "image": "https://m.media-amazon.com/images/I/31I63XNcY._AC_.jpg",
    "category": "Retail",
    "rating": 5,
    "reviewsCount": 0,
    "retailPrice": 200,
    "marketplacePrice": 200,
    "estimatedDelivery": "Instant Digital Delivery",
    "specs": {
      "Format": "Digital Code",
      "Region": "United States",
      "Currency": "USD",
      "Retailer Sourced": "amazon"
    },
    "retailerId": "amazon",
    "stockCount": 50,
    "isFeatured": false,
    "reviews": [],
    "pricePoints": [
      200
    ],
    "currency": "USD",
    "region": "United States",
    "regions": [
      "United States"
    ]
  },
  {
    "id": "p-amazon-150-usd",
    "name": "Amazon $150 Gift Card (USD)",
    "description": "Shop millions of products on Amazon.com. Valid for United States Amazon accounts. Instant digital code delivery.",
    "brand": "Amazon",
    "image": "https://m.media-amazon.com/images/I/31I63XNcY._AC_.jpg",
    "category": "Retail",
    "rating": 5,
    "reviewsCount": 0,
    "retailPrice": 150,
    "marketplacePrice": 150,
    "estimatedDelivery": "Instant Digital Delivery",
    "specs": {
      "Format": "Digital Code",
      "Region": "United States",
      "Currency": "USD",
      "Retailer Sourced": "amazon"
    },
    "retailerId": "amazon",
    "stockCount": 50,
    "isFeatured": false,
    "reviews": [],
    "pricePoints": [
      150
    ],
    "currency": "USD",
    "region": "United States",
    "regions": [
      "United States"
    ]
  },
  {
    "id": "p-amazon-100-usd",
    "name": "Amazon $100 Gift Card (USD)",
    "description": "Shop millions of products on Amazon.com. Valid for United States Amazon accounts. Instant digital code delivery.",
    "brand": "Amazon",
    "image": "https://m.media-amazon.com/images/I/31I63XNcY._AC_.jpg",
    "category": "Retail",
    "rating": 5,
    "reviewsCount": 0,
    "retailPrice": 100,
    "marketplacePrice": 100,
    "estimatedDelivery": "Instant Digital Delivery",
    "specs": {
      "Format": "Digital Code",
      "Region": "United States",
      "Currency": "USD",
      "Retailer Sourced": "amazon"
    },
    "retailerId": "amazon",
    "stockCount": 50,
    "isFeatured": false,
    "reviews": [],
    "pricePoints": [
      100
    ],
    "currency": "USD",
    "region": "United States",
    "regions": [
      "United States"
    ]
  },
  {
    "id": "p-amazon-75-usd",
    "name": "Amazon $75 Gift Card (USD)",
    "description": "Shop millions of products on Amazon.com. Valid for United States Amazon accounts. Instant digital code delivery.",
    "brand": "Amazon",
    "image": "https://m.media-amazon.com/images/I/31I63XNcY._AC_.jpg",
    "category": "Retail",
    "rating": 5,
    "reviewsCount": 0,
    "retailPrice": 75,
    "marketplacePrice": 75,
    "estimatedDelivery": "Instant Digital Delivery",
    "specs": {
      "Format": "Digital Code",
      "Region": "United States",
      "Currency": "USD",
      "Retailer Sourced": "amazon"
    },
    "retailerId": "amazon",
    "stockCount": 50,
    "isFeatured": false,
    "reviews": [],
    "pricePoints": [
      75
    ],
    "currency": "USD",
    "region": "United States",
    "regions": [
      "United States"
    ]
  },
  {
    "id": "p-amazon-50-usd",
    "name": "Amazon $50 Gift Card (USD)",
    "description": "Shop millions of products on Amazon.com. Valid for United States Amazon accounts. Instant digital code delivery.",
    "brand": "Amazon",
    "image": "https://m.media-amazon.com/images/I/31I63XNcY._AC_.jpg",
    "category": "Retail",
    "rating": 5,
    "reviewsCount": 0,
    "retailPrice": 50,
    "marketplacePrice": 50,
    "estimatedDelivery": "Instant Digital Delivery",
    "specs": {
      "Format": "Digital Code",
      "Region": "United States",
      "Currency": "USD",
      "Retailer Sourced": "amazon"
    },
    "retailerId": "amazon",
    "stockCount": 50,
    "isFeatured": false,
    "reviews": [],
    "pricePoints": [
      50
    ],
    "currency": "USD",
    "region": "United States",
    "regions": [
      "United States"
    ]
  },
  {
    "id": "p-amazon-25-usd",
    "name": "Amazon $25 Gift Card (USD)",
    "description": "Shop millions of products on Amazon.com. Valid for United States Amazon accounts. Instant digital code delivery.",
    "brand": "Amazon",
    "image": "https://m.media-amazon.com/images/I/31I63XNcY._AC_.jpg",
    "category": "Retail",
    "rating": 5,
    "reviewsCount": 0,
    "retailPrice": 25,
    "marketplacePrice": 25,
    "estimatedDelivery": "Instant Digital Delivery",
    "specs": {
      "Format": "Digital Code",
      "Region": "United States",
      "Currency": "USD",
      "Retailer Sourced": "amazon"
    },
    "retailerId": "amazon",
    "stockCount": 50,
    "isFeatured": false,
    "reviews": [],
    "pricePoints": [
      25
    ],
    "currency": "USD",
    "region": "United States",
    "regions": [
      "United States"
    ]
  },
  {
    "id": "p-amazon-200-aed",
    "name": "Amazon AED200 Gift Card",
    "description": "Shop millions of items on Amazon.ae in the United Arab Emirates. Instant digital gift card code.",
    "brand": "Amazon",
    "image": "https://m.media-amazon.com/images/I/31I63XNcY._AC_.jpg",
    "category": "Retail",
    "rating": 5,
    "reviewsCount": 0,
    "retailPrice": 200,
    "marketplacePrice": 200,
    "estimatedDelivery": "Instant Digital Delivery",
    "specs": {
      "Format": "Digital Code",
      "Region": "United Arab Emirates",
      "Currency": "AED",
      "Retailer Sourced": "amazon"
    },
    "retailerId": "amazon",
    "stockCount": 50,
    "isFeatured": false,
    "reviews": [],
    "pricePoints": [
      200
    ],
    "currency": "AED",
    "region": "United Arab Emirates",
    "regions": [
      "United Arab Emirates"
    ]
  },
  {
    "id": "p-amazon-150-aed",
    "name": "Amazon AED150 Gift Card",
    "description": "Shop millions of items on Amazon.ae in the United Arab Emirates. Instant digital gift card code.",
    "brand": "Amazon",
    "image": "https://m.media-amazon.com/images/I/31I63XNcY._AC_.jpg",
    "category": "Retail",
    "rating": 5,
    "reviewsCount": 0,
    "retailPrice": 150,
    "marketplacePrice": 150,
    "estimatedDelivery": "Instant Digital Delivery",
    "specs": {
      "Format": "Digital Code",
      "Region": "United Arab Emirates",
      "Currency": "AED",
      "Retailer Sourced": "amazon"
    },
    "retailerId": "amazon",
    "stockCount": 50,
    "isFeatured": false,
    "reviews": [],
    "pricePoints": [
      150
    ],
    "currency": "AED",
    "region": "United Arab Emirates",
    "regions": [
      "United Arab Emirates"
    ]
  },
  {
    "id": "p-amazon-100-aed",
    "name": "Amazon AED100 Gift Card",
    "description": "Shop millions of items on Amazon.ae in the United Arab Emirates. Instant digital gift card code.",
    "brand": "Amazon",
    "image": "https://m.media-amazon.com/images/I/31I63XNcY._AC_.jpg",
    "category": "Retail",
    "rating": 5,
    "reviewsCount": 0,
    "retailPrice": 100,
    "marketplacePrice": 100,
    "estimatedDelivery": "Instant Digital Delivery",
    "specs": {
      "Format": "Digital Code",
      "Region": "United Arab Emirates",
      "Currency": "AED",
      "Retailer Sourced": "amazon"
    },
    "retailerId": "amazon",
    "stockCount": 50,
    "isFeatured": false,
    "reviews": [],
    "pricePoints": [
      100
    ],
    "currency": "AED",
    "region": "United Arab Emirates",
    "regions": [
      "United Arab Emirates"
    ]
  },
  {
    "id": "p-amazon-75-aed",
    "name": "Amazon AED75 Gift Card",
    "description": "Shop millions of items on Amazon.ae in the United Arab Emirates. Instant digital gift card code.",
    "brand": "Amazon",
    "image": "https://m.media-amazon.com/images/I/31I63XNcY._AC_.jpg",
    "category": "Retail",
    "rating": 5,
    "reviewsCount": 0,
    "retailPrice": 75,
    "marketplacePrice": 75,
    "estimatedDelivery": "Instant Digital Delivery",
    "specs": {
      "Format": "Digital Code",
      "Region": "United Arab Emirates",
      "Currency": "AED",
      "Retailer Sourced": "amazon"
    },
    "retailerId": "amazon",
    "stockCount": 50,
    "isFeatured": false,
    "reviews": [],
    "pricePoints": [
      75
    ],
    "currency": "AED",
    "region": "United Arab Emirates",
    "regions": [
      "United Arab Emirates"
    ]
  },
  {
    "id": "p-amazon-50-aed",
    "name": "Amazon AED50 Gift Card",
    "description": "Shop millions of items on Amazon.ae in the United Arab Emirates. Instant digital gift card code.",
    "brand": "Amazon",
    "image": "https://m.media-amazon.com/images/I/31I63XNcY._AC_.jpg",
    "category": "Retail",
    "rating": 5,
    "reviewsCount": 0,
    "retailPrice": 50,
    "marketplacePrice": 50,
    "estimatedDelivery": "Instant Digital Delivery",
    "specs": {
      "Format": "Digital Code",
      "Region": "United Arab Emirates",
      "Currency": "AED",
      "Retailer Sourced": "amazon"
    },
    "retailerId": "amazon",
    "stockCount": 50,
    "isFeatured": false,
    "reviews": [],
    "pricePoints": [
      50
    ],
    "currency": "AED",
    "region": "United Arab Emirates",
    "regions": [
      "United Arab Emirates"
    ]
  },
  {
    "id": "p-amazon-25-aed",
    "name": "Amazon AED25 Gift Card",
    "description": "Shop millions of items on Amazon.ae in the United Arab Emirates. Instant digital gift card code.",
    "brand": "Amazon",
    "image": "https://m.media-amazon.com/images/I/31I63XNcY._AC_.jpg",
    "category": "Retail",
    "rating": 5,
    "reviewsCount": 0,
    "retailPrice": 25,
    "marketplacePrice": 25,
    "estimatedDelivery": "Instant Digital Delivery",
    "specs": {
      "Format": "Digital Code",
      "Region": "United Arab Emirates",
      "Currency": "AED",
      "Retailer Sourced": "amazon"
    },
    "retailerId": "amazon",
    "stockCount": 50,
    "isFeatured": false,
    "reviews": [],
    "pricePoints": [
      25
    ],
    "currency": "AED",
    "region": "United Arab Emirates",
    "regions": [
      "United Arab Emirates"
    ]
  }
];

export class RetailerService {
  private static isSyncing = false;

  /**
   * Guards against the server sync overwriting local product edits before the
   * POST write to the central DB has landed. Once a local product mutation has
   * happened, the local copy wins until the server write confirms.
   */
  private static markProductsDirty(): void {
    if (typeof window === "undefined") return;
    localStorage.setItem("solcart_products_dirty", String(Date.now()));
  }

  private static clearProductsDirty(): void {
    if (typeof window === "undefined") return;
    localStorage.removeItem("solcart_products_dirty");
  }

  private static hasPendingProductWrites(): boolean {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("solcart_products_dirty") !== null;
  }

  private static getStoredRetailers(): RetailerConfig[] {
    if (typeof window === "undefined") return DEFAULT_RETAILERS;
    const stored = localStorage.getItem("solcart_retailers");
    if (!stored) {
      localStorage.setItem("solcart_retailers", JSON.stringify(DEFAULT_RETAILERS));
      return DEFAULT_RETAILERS;
    }
    try {
      return JSON.parse(stored);
    } catch {
      return DEFAULT_RETAILERS;
    }
  }

  private static getStoredProducts(): Product[] {
    if (typeof window === "undefined") return DEFAULT_PRODUCTS;
    const stored = localStorage.getItem("solcart_products");
    if (!stored) {
      localStorage.setItem("solcart_products", JSON.stringify(DEFAULT_PRODUCTS));
      return DEFAULT_PRODUCTS;
    }
    try {
      return JSON.parse(stored);
    } catch {
      return DEFAULT_PRODUCTS;
    }
  }

  private static lastSyncTime = 0;
  private static readonly SYNC_COOLDOWN_MS = 30000; // 30s minimum between background syncs

  /**
   * Syncs browser local storage with server DB API endpoint
   */
  static async syncWithServer(force = false): Promise<void> {
    if (typeof window === "undefined" || this.isSyncing) return;
    const now = Date.now();
    if (!force && now - this.lastSyncTime < this.SYNC_COOLDOWN_MS) {
      return;
    }
    this.isSyncing = true;
    this.lastSyncTime = now;
    try {
      const res = await fetch("/api/db");
      if (res.ok) {
        const result = await res.json();
        if (result.success && result.data) {
          if (result.data.retailers) {
            localStorage.setItem("solcart_retailers", JSON.stringify(result.data.retailers));
          }
          if (result.data.products && Array.isArray(result.data.products)) {
            const currentLocal = this.getStoredProducts();
            const serverProducts: Product[] = result.data.products;
            const serverIdSet = new Set(serverProducts.map(sp => sp.id));
            const localOnly = currentLocal.filter(p => !serverIdSet.has(p.id));
            
            if (this.hasPendingProductWrites()) {
              const localMap = new Map(currentLocal.map(p => [p.id, p]));
              const mergedServer = serverProducts.map(sp => localMap.get(sp.id) || sp);
              const finalProducts = [...localOnly, ...mergedServer];
              localStorage.setItem("solcart_products", JSON.stringify(finalProducts));
            } else {
              const finalProducts = [...localOnly, ...serverProducts];
              localStorage.setItem("solcart_products", JSON.stringify(finalProducts));
            }
          }
          window.dispatchEvent(new Event("solcart-db-synced"));
        }
      }
    } catch (e) {
      console.warn("RetailerService background sync skipped", e);
    } finally {
      this.isSyncing = false;
    }
  }

  static getRetailers(): RetailerConfig[] {
    return this.getStoredRetailers();
  }

  static updateRetailerMarkup(retailerId: string, newMarkup: number): void {
    const retailers = this.getStoredRetailers();
    const index = retailers.findIndex(r => r.id === retailerId);
    if (index !== -1) {
      retailers[index].markupPercentage = newMarkup;
      localStorage.setItem("solcart_retailers", JSON.stringify(retailers));
      
      const products = this.getStoredProducts();
      const updatedProducts = products.map(product => {
        if (product.retailerId === retailerId) {
          return {
            ...product,
            marketplacePrice: product.retailPrice
          };
        }
        return product;
      });
      localStorage.setItem("solcart_products", JSON.stringify(updatedProducts));
      this.markProductsDirty();
      window.dispatchEvent(new Event("solcart-db-synced"));

      // Post to central server DB API
      fetch("/api/db", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "updateRetailerMarkup",
          payload: { retailerId, markupPercentage: newMarkup }
        })
      }).catch(() => {});
    }
  }

  static getProducts(): Product[] {
    return this.getStoredProducts();
  }

  static getProductById(id: string): Product | undefined {
    return this.getProducts().find(p => p.id === id);
  }

  static async addProduct(product: Omit<Product, "marketplacePrice">): Promise<void> {
    const products = this.getStoredProducts();
    const marketplacePrice = product.retailPrice;
    const newProduct: Product = {
      ...product,
      marketplacePrice
    };
    
    // Put at top of list so newest added products are instantly visible
    const updatedProducts = [newProduct, ...products.filter(p => p.id !== newProduct.id)];
    this.markProductsDirty();
    localStorage.setItem("solcart_products", JSON.stringify(updatedProducts));
    window.dispatchEvent(new Event("solcart-db-synced"));

    try {
      await fetch("/api/db", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "addProduct",
          payload: newProduct
        })
      });
    } finally {
      this.clearProductsDirty();
    }
  }

  static deleteProduct(productId: string): void {
    const products = this.getStoredProducts().filter(p => p.id !== productId);
    this.markProductsDirty();
    localStorage.setItem("solcart_products", JSON.stringify(products));
    window.dispatchEvent(new Event("solcart-db-synced"));

    fetch("/api/db", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "deleteProduct",
        payload: { productId }
      })
    }).then(() => this.clearProductsDirty()).catch(() => {});
  }

  static async updateProduct(productId: string, updatedFields: Partial<Omit<Product, "marketplacePrice">>): Promise<void> {
    const products = this.getStoredProducts();
    const index = products.findIndex(p => p.id === productId);
    if (index !== -1) {
      const existing = products[index];
      const merged = { ...existing, ...updatedFields };
      if (merged.retailPrice !== undefined) {
        merged.marketplacePrice = merged.retailPrice;
      }
      
      products[index] = merged as Product;
      this.markProductsDirty();
      localStorage.setItem("solcart_products", JSON.stringify(products));
      window.dispatchEvent(new Event("solcart-db-synced"));

      try {
        await fetch("/api/db", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "updateProduct",
            payload: { productId, updates: updatedFields }
          })
        });
      } finally {
        this.clearProductsDirty();
      }
    }
  }

  static resetDatabase(): void {
    if (typeof window !== "undefined") {
      localStorage.removeItem("solcart_retailers");
      localStorage.removeItem("solcart_products");
      this.clearProductsDirty();
    }
    fetch("/api/db", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "resetToDefault", payload: {} })
    }).catch(() => {});
  }
}

