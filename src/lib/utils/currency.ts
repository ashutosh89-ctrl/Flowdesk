export type CurrencyCode = 'INR' | 'USD' | 'EUR' | 'GBP' | 'AED' | 'CAD' | 'AUD' | 'JPY';

export interface CurrencyConfig {
  code: CurrencyCode;
  symbol: string;
  label: string;
  locale: string;
}

export const CurrencyMap: Record<CurrencyCode, CurrencyConfig> = {
  INR: { code: 'INR', symbol: '₹', label: 'Indian Rupee (₹)', locale: 'en-IN' },
  USD: { code: 'USD', symbol: '$', label: 'US Dollar ($)', locale: 'en-US' },
  EUR: { code: 'EUR', symbol: '€', label: 'Euro (€)', locale: 'de-DE' },
  GBP: { code: 'GBP', symbol: '£', label: 'British Pound (£)', locale: 'en-GB' },
  AED: { code: 'AED', symbol: 'AED', label: 'UAE Dirham (AED)', locale: 'ar-AE' },
  CAD: { code: 'CAD', symbol: 'C$', label: 'Canadian Dollar (C$)', locale: 'en-CA' },
  AUD: { code: 'AUD', symbol: 'A$', label: 'Australian Dollar (A$)', locale: 'en-AU' },
  JPY: { code: 'JPY', symbol: '¥', label: 'Japanese Yen (¥)', locale: 'ja-JP' },
};

export function getCurrencySymbol(code: string | undefined): string {
  if (!code || !(code in CurrencyMap)) return '₹';
  return CurrencyMap[code as CurrencyCode].symbol;
}

export function formatCurrency(amount: number, code: string = 'INR'): string {
  const config = CurrencyMap[code as CurrencyCode] || CurrencyMap.INR;
  try {
    return new Intl.NumberFormat(config.locale, {
      style: 'currency',
      currency: config.code,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch (e) {
    return `${config.symbol}${amount.toLocaleString()}`;
  }
}
