/**
 * Generate sequential invoice numbers
 * Format: INV-YYYY-XXXXX (e.g., INV-2026-00001)
 */
export function generateInvoiceNumber(existingNumbers: string[]): string {
  const year = new Date().getFullYear();
  const prefix = `INV-${year}-`;

  const yearNumbers = existingNumbers
    .filter(n => typeof n === 'string' && n.startsWith(prefix))
    .map(n => parseInt(n.replace(prefix, ''), 10))
    .filter(n => !isNaN(n));

  const nextNumber = yearNumbers.length > 0 ? Math.max(...yearNumbers) + 1 : 1;

  return `${prefix}${String(nextNumber).padStart(5, '0')}`;
}

export function isValidInvoiceNumber(number: string): boolean {
  return /^INV-\d{4}-\d{5}$/.test(number);
}
