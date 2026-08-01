const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

function convertLessThanThousand(num: number): string {
  if (num === 0) return '';
  if (num < 20) return ones[num];
  if (num < 100) return tens[Math.floor(num / 10)] + (num % 10 !== 0 ? ' ' + ones[num % 10] : '');
  return ones[Math.floor(num / 100)] + ' Hundred' + (num % 100 !== 0 ? ' and ' + convertLessThanThousand(num % 100) : '');
}

export function numberToWords(amount: number, currencyCode = 'USD'): string {
  if (isNaN(amount) || amount === 0) return 'Zero Dollars Only';

  const integerPart = Math.floor(amount);
  const decimalPart = Math.round((amount - integerPart) * 100);

  const currencyNames: Record<string, { main: string; sub: string }> = {
    INR: { main: 'Rupees', sub: 'Paise' },
    USD: { main: 'US Dollars', sub: 'Cents' },
    EUR: { main: 'Euros', sub: 'Cents' },
    GBP: { main: 'Pounds Sterling', sub: 'Pence' },
    AED: { main: 'Dirhams', sub: 'Fils' },
    CAD: { main: 'Canadian Dollars', sub: 'Cents' },
    AUD: { main: 'Australian Dollars', sub: 'Cents' },
    JPY: { main: 'Yen', sub: 'Sen' }
  };

  const curr = currencyNames[currencyCode] || { main: 'Units', sub: 'Cents' };

  let words = '';
  if (integerPart === 0) {
    words = 'Zero ' + curr.main;
  } else {
    let num = integerPart;
    const billions = Math.floor(num / 1000000000);
    num %= 1000000000;
    const millions = Math.floor(num / 1000000);
    num %= 1000000;
    const thousands = Math.floor(num / 1000);
    num %= 1000;

    if (billions > 0) words += convertLessThanThousand(billions) + ' Billion ';
    if (millions > 0) words += convertLessThanThousand(millions) + ' Million ';
    if (thousands > 0) words += convertLessThanThousand(thousands) + ' Thousand ';
    if (num > 0) words += convertLessThanThousand(num) + ' ';

    words = words.trim() + ' ' + curr.main;
  }

  if (decimalPart > 0) {
    words += ' and ' + convertLessThanThousand(decimalPart) + ' ' + curr.sub;
  }

  return words.trim() + ' Only';
}
