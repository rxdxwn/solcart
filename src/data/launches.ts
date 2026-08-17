export interface LaunchCountry {
  country: string;
  code: string; // ISO 2-letter code for flags
  currency: string;
  symbol: string;
  rateToUsd: number; // 1 Unit of local currency = X USD (e.g. 1 GBP = 1.28 USD)
  launchDate: string;
  status: "active" | "upcoming";
  weekOffset: number;
}

export const LAUNCH_SCHEDULE: LaunchCountry[] = [
  {
    country: "United States",
    code: "US",
    currency: "USD",
    symbol: "$",
    rateToUsd: 1.0,
    launchDate: "Active Now",
    status: "active",
    weekOffset: 0
  },
  {
    country: "United Kingdom",
    code: "GB",
    currency: "GBP",
    symbol: "£",
    rateToUsd: 1.28,
    launchDate: "Active Now",
    status: "active",
    weekOffset: 0
  },
  {
    country: "Singapore",
    code: "SG",
    currency: "SGD",
    symbol: "S$",
    rateToUsd: 0.74,
    launchDate: "Active Now",
    status: "active",
    weekOffset: 0
  },
  {
    country: "Canada",
    code: "CA",
    currency: "CAD",
    symbol: "C$",
    rateToUsd: 0.73,
    launchDate: "Active Now",
    status: "active",
    weekOffset: 0
  },
  {
    country: "Germany & Eurozone",
    code: "DE",
    currency: "EUR",
    symbol: "€",
    rateToUsd: 1.09,
    launchDate: "August 20, 2026",
    status: "upcoming",
    weekOffset: 1
  },
  {
    country: "Japan",
    code: "JP",
    currency: "JPY",
    symbol: "¥",
    rateToUsd: 0.0065,
    launchDate: "August 27, 2026",
    status: "upcoming",
    weekOffset: 2
  },
  {
    country: "Australia",
    code: "AU",
    currency: "AUD",
    symbol: "A$",
    rateToUsd: 0.65,
    launchDate: "September 3, 2026",
    status: "upcoming",
    weekOffset: 3
  },
  {
    country: "United Arab Emirates",
    code: "AE",
    currency: "AED",
    symbol: "د.إ",
    rateToUsd: 0.272,
    launchDate: "September 10, 2026",
    status: "upcoming",
    weekOffset: 4
  },
  {
    country: "India",
    code: "IN",
    currency: "INR",
    symbol: "₹",
    rateToUsd: 0.012,
    launchDate: "September 17, 2026",
    status: "upcoming",
    weekOffset: 5
  },
  {
    country: "Brazil",
    code: "BR",
    currency: "BRL",
    symbol: "R$",
    rateToUsd: 0.18,
    launchDate: "September 24, 2026",
    status: "upcoming",
    weekOffset: 6
  },
  {
    country: "Switzerland",
    code: "CH",
    currency: "CHF",
    symbol: "CHF",
    rateToUsd: 1.13,
    launchDate: "October 1, 2026",
    status: "upcoming",
    weekOffset: 7
  },
  {
    country: "South Korea",
    code: "KR",
    currency: "KRW",
    symbol: "₩",
    rateToUsd: 0.00073,
    launchDate: "October 8, 2026",
    status: "upcoming",
    weekOffset: 8
  }
];
