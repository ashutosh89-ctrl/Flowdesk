import { Invoice } from '../types';
import { markAsPaid } from './invoiceService';

export async function payInvoice(invoiceId: string, clientUserId: string): Promise<Invoice> {
  // Simulate a payment processing delay
  return new Promise((resolve, reject) => {
    setTimeout(async () => {
      try {
        const updatedInvoice = await markAsPaid(invoiceId, clientUserId);
        resolve(updatedInvoice);
      } catch (e) {
        reject(e);
      }
    }, 1000);
  });
}
