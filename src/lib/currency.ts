export const CURRENCIES = [
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "UZS", symbol: "soʻm", name: "Uzbek Sum" },
  { code: "RUB", symbol: "₽", name: "Russian Ruble" },
  { code: "GBP", symbol: "£", name: "British Pound" },
  { code: "KZT", symbol: "₸", name: "Kazakh Tenge" },
] as const;

export type CurrencyCode = typeof CURRENCIES[number]["code"];

export function getCurrencySymbol(code: string): string {
  return CURRENCIES.find(c => c.code === code)?.symbol ?? code;
}

export function formatMoney(amount: number, currency: string, options: { compact?: boolean; sign?: boolean } = {}): string {
  const { compact, sign } = options;
  const abs = Math.abs(amount);
  let str: string;
  if (compact && abs >= 1000) {
    if (abs >= 1_000_000) str = (abs / 1_000_000).toFixed(1) + "M";
    else str = (abs / 1000).toFixed(abs >= 10000 ? 0 : 1) + "K";
  } else {
    str = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(abs);
  }
  const symbol = getCurrencySymbol(currency);
  const prefix = sign ? (amount < 0 ? "−" : "+") : "";
  // Place symbol after for non-Latin currencies
  if (["UZS", "KZT"].includes(currency)) return `${prefix}${str} ${symbol}`;
  return `${prefix}${symbol}${str}`;
}
