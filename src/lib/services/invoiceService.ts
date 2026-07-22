import { Invoice, InvoiceItem, Project } from '../types';
import { create, read, readAll, update } from './dataService';
import { logActivity } from './activityService';

export interface CreateInvoiceInput {
  projectId: string;
  invoiceNumber: string;
  items: InvoiceItem[];
  dueDate: string;
}

export async function createInvoice(data: CreateInvoiceInput): Promise<Invoice> {
  // calculate amounts
  let subtotal = 0;
  const processedItems = data.items.map(item => {
    const amount = item.quantity * item.rate;
    subtotal += amount;
    return { ...item, amount };
  });

  const taxRate = 18; // 18% GST standard
  const taxAmount = (subtotal * taxRate) / 100;
  const total = subtotal + taxAmount;

  const newInvoice: Invoice = {
    id: `inv_${Math.random().toString(36).substring(2, 9)}`,
    projectId: data.projectId,
    invoiceNumber: data.invoiceNumber,
    items: processedItems,
    subtotal,
    taxRate,
    taxAmount,
    total,
    status: 'pending',
    dueDate: data.dueDate,
    razorpayLink: `https://rzp.io/i/mock_pay_${data.invoiceNumber}`,
    createdAt: new Date().toISOString()
  };

  const saved = await create<Invoice>('invoices', newInvoice);

  // Find workspace to log activity
  const projects = await readAll<Project>('projects');
  const proj = projects.find(p => p.id === data.projectId);
  if (proj) {
    const workspaces = await readAll<any>('workspaces');
    const ws = workspaces.find(w => w.clientId === proj.clientId);
    if (ws) {
      await logActivity({
        workspaceId: ws.id,
        type: 'invoice_created',
        description: `Invoice ${data.invoiceNumber} created for $${total.toFixed(2)}`
      });
    }
  }

  return saved;
}

export async function getInvoices(userId: string): Promise<Invoice[]> {
  return await readAll<Invoice>('invoices', userId);
}

export async function markAsPaid(id: string, userId: string): Promise<Invoice> {
  const invoice = await read<Invoice>('invoices', id);
  if (!invoice) throw new Error('Invoice not found');

  const updated = await update<Invoice>('invoices', id, { status: 'paid' });

  // Find workspace to log activity
  const projects = await readAll<Project>('projects');
  const proj = projects.find(p => p.id === invoice.projectId);
  if (proj) {
    const workspaces = await readAll<any>('workspaces');
    const ws = workspaces.find(w => w.clientId === proj.clientId);
    if (ws) {
      await logActivity({
        workspaceId: ws.id,
        type: 'payment_received',
        description: `Payment received for Invoice ${invoice.invoiceNumber}`
      });
    }
  }

  return updated;
}

export async function sendReminder(id: string, userId: string): Promise<void> {
  const invoice = await read<Invoice>('invoices', id);
  if (!invoice) throw new Error('Invoice not found');

  // Logs a mock email dispatch activity
  const projects = await readAll<Project>('projects');
  const proj = projects.find(p => p.id === invoice.projectId);
  if (proj) {
    const workspaces = await readAll<any>('workspaces');
    const ws = workspaces.find(w => w.clientId === proj.clientId);
    if (ws) {
      await logActivity({
        workspaceId: ws.id,
        type: 'status_changed',
        description: `Mock reminder email sent to client for Invoice ${invoice.invoiceNumber}`
      });
    }
  }
}
