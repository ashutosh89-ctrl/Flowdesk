import { 
  Invoice, InvoiceItem, Project, Client, 
  CurrencyCode, InvoiceActivity, InvoiceReminder, InvoiceReceipt 
} from '../types';
import { create, read, readAll, update } from './dataService';
import { logActivity } from './activityService';

export interface CreateInvoiceInput {
  projectId: string;
  invoiceNumber?: string;
  title?: string;
  items: InvoiceItem[];
  currency?: CurrencyCode;
  taxName?: string;
  taxRate?: number;
  discount?: number;
  notes?: string;
  dueDate: string;
}

export async function generateNextInvoiceNumber(): Promise<string> {
  const invoices = await readAll<Invoice>('invoices');
  const year = new Date().getFullYear();
  const nextNum = invoices.length + 1;
  const padded = String(nextNum).padStart(4, '0');
  return `INV-${year}-${padded}`;
}

export async function createInvoice(data: CreateInvoiceInput): Promise<Invoice> {
  let subtotal = 0;
  const processedItems = data.items.map(item => {
    const amount = (item.quantity || 0) * (item.rate || 0);
    subtotal += amount;
    return { ...item, amount };
  });

  const discount = Math.max(0, data.discount || 0);
  const taxableAmount = Math.max(0, subtotal - discount);
  const taxRate = Math.max(0, data.taxRate ?? 18);
  const taxName = data.taxName || 'GST';
  const taxAmount = (taxableAmount * taxRate) / 100;
  const total = Math.round((taxableAmount + taxAmount) * 100) / 100;
  const currency: CurrencyCode = data.currency || 'INR';
  const invoiceNumber = data.invoiceNumber || await generateNextInvoiceNumber();

  // Find project and client
  const projects = await readAll<Project>('projects');
  const proj = projects.find(p => p.id === data.projectId);
  let clientId = '';
  let clientEmail = '';
  if (proj) {
    clientId = proj.clientId;
    const clients = await readAll<Client>('clients');
    const client = clients.find(c => c.id === proj.clientId);
    if (client) clientEmail = client.email;
  }

  const now = new Date().toISOString();
  const newInvoice: Invoice = {
    id: `inv_${Math.random().toString(36).substring(2, 9)}`,
    projectId: data.projectId,
    clientId,
    clientEmailSnapshot: clientEmail,
    invoiceNumber,
    title: data.title || `Invoice for ${proj?.name || 'Project'}`,
    items: processedItems,
    subtotal,
    discount,
    taxName,
    taxRate,
    taxAmount,
    total,
    currency,
    workflowStatus: 'draft',
    paymentStatus: 'pending',
    notes: data.notes || 'Thank you for your business! Please pay by the due date.',
    issueDate: now.split('T')[0],
    dueDate: data.dueDate,
    createdAt: now,
    updatedAt: now,
    status: 'draft',
    number: invoiceNumber,
    razorpayLink: `https://rzp.io/i/mock_pay_${invoiceNumber}`
  };

  const saved = await create<Invoice>('invoices', newInvoice);

  // Log activity in normalized collection
  await logInvoiceActivity({
    invoiceId: saved.id,
    activityType: 'created',
    description: `Invoice ${saved.invoiceNumber} created as Draft for ${currency} ${total.toLocaleString()}`,
    actor: 'Freelancer'
  });

  return saved;
}

export async function sendInvoice(id: string): Promise<Invoice> {
  const invoice = await read<Invoice>('invoices', id);
  if (!invoice) throw new Error('Invoice not found');

  // Freeze currency & snapshot client email if not present
  const projects = await readAll<Project>('projects');
  const proj = projects.find(p => p.id === invoice.projectId);
  let clientEmail = invoice.clientEmailSnapshot || '';
  if (proj && !clientEmail) {
    const clients = await readAll<Client>('clients');
    const client = clients.find(c => c.id === proj.clientId);
    if (client) clientEmail = client.email;
  }

  const now = new Date().toISOString();
  const updated = await update<Invoice>('invoices', id, {
    workflowStatus: 'sent',
    sentAt: now,
    clientEmailSnapshot: clientEmail,
    status: 'sent',
    updatedAt: now
  });

  await logInvoiceActivity({
    invoiceId: id,
    activityType: 'sent',
    description: `Invoice ${invoice.invoiceNumber} sent to client (${clientEmail || 'client email'})`,
    actor: 'Freelancer'
  });

  return updated;
}

export async function markAsViewed(id: string): Promise<Invoice> {
  const invoice = await read<Invoice>('invoices', id);
  if (!invoice) throw new Error('Invoice not found');
  if (invoice.workflowStatus === 'viewed' || invoice.workflowStatus === 'cancelled') return invoice;

  const now = new Date().toISOString();
  const updated = await update<Invoice>('invoices', id, {
    workflowStatus: 'viewed',
    viewedAt: now,
    status: 'viewed',
    updatedAt: now
  });

  await logInvoiceActivity({
    invoiceId: id,
    activityType: 'viewed',
    description: `Invoice ${invoice.invoiceNumber} viewed by client`,
    actor: 'Client'
  });

  return updated;
}

export async function sendInvoiceReminder(id: string): Promise<InvoiceReminder> {
  const invoice = await read<Invoice>('invoices', id);
  if (!invoice) throw new Error('Invoice not found');

  const existingReminders = await getInvoiceReminders(id);
  if (existingReminders.length >= 5) {
    throw new Error('Reminder Limit Reached (Maximum 5 reminders allowed per invoice)');
  }

  const reminderCount = existingReminders.length + 1;
  const now = new Date().toISOString();

  const reminder: InvoiceReminder = {
    id: `rem_${Math.random().toString(36).substring(2, 9)}`,
    invoiceId: id,
    reminderNumber: reminderCount,
    sentAt: now,
    method: 'email',
    status: 'delivered'
  };

  await create<InvoiceReminder>('invoice_reminders', reminder);

  await logInvoiceActivity({
    invoiceId: id,
    activityType: 'reminder_sent',
    description: `Reminder #${reminderCount} sent to client`,
    actor: 'Freelancer'
  });

  return reminder;
}

export async function markPaidOffline(
  id: string, 
  paymentMethod: 'bank_transfer' | 'cash' | 'cheque' | 'other' = 'bank_transfer',
  notes: string = ''
): Promise<{ invoice: Invoice; receipt: InvoiceReceipt }> {
  const invoice = await read<Invoice>('invoices', id);
  if (!invoice) throw new Error('Invoice not found');

  const now = new Date().toISOString();
  const updatedInvoice = await update<Invoice>('invoices', id, {
    paymentStatus: 'paid',
    paymentMethodType: paymentMethod,
    status: 'paid',
    updatedAt: now
  });

  // Generate normalized receipt
  const receipts = await readAll<InvoiceReceipt>('invoice_receipts');
  const year = new Date().getFullYear();
  const receiptNum = `REC-${year}-${String(receipts.length + 1).padStart(4, '0')}`;

  const receipt: InvoiceReceipt = {
    id: `rec_${Math.random().toString(36).substring(2, 9)}`,
    receiptNumber: receiptNum,
    invoiceId: id,
    paymentId: `pay_off_${Math.random().toString(36).substring(2, 8)}`,
    paymentMethod: paymentMethod.replace('_', ' ').toUpperCase(),
    amountPaid: invoice.total,
    currency: invoice.currency,
    paidAt: now
  };

  await create<InvoiceReceipt>('invoice_receipts', receipt);

  await logInvoiceActivity({
    invoiceId: id,
    activityType: 'payment_completed',
    description: `Payment of ${invoice.currency} ${invoice.total.toLocaleString()} recorded via ${receipt.paymentMethod}`,
    actor: 'Freelancer'
  });

  await logInvoiceActivity({
    invoiceId: id,
    activityType: 'receipt_generated',
    description: `Receipt ${receipt.receiptNumber} generated for Invoice ${invoice.invoiceNumber}`,
    actor: 'System'
  });

  return { invoice: updatedInvoice, receipt };
}

export async function processRazorpayPayment(
  id: string, 
  razorpayPaymentId: string, 
  razorpayOrderId: string, 
  paymentMethod: string = 'UPI / Cards'
): Promise<{ invoice: Invoice; receipt: InvoiceReceipt }> {
  const invoice = await read<Invoice>('invoices', id);
  if (!invoice) throw new Error('Invoice not found');

  // Idempotency: if this payment already produced a receipt (e.g. the webhook
  // processed it first), return the existing state instead of duplicating it.
  const allReceipts = await readAll<InvoiceReceipt>('invoice_receipts');
  const existingReceipt = allReceipts.find(r => r.paymentId === razorpayPaymentId);
  if (existingReceipt) {
    // A receipt existing implies the payment was already processed (either here
    // or by the webhook) — return the current state instead of duplicating.
    const currentInvoice = await read<Invoice>('invoices', id);
    return { invoice: currentInvoice ?? invoice, receipt: existingReceipt };
  }

  const now = new Date().toISOString();
  const updatedInvoice = await update<Invoice>('invoices', id, {
    paymentStatus: 'paid',
    paymentMethodType: 'razorpay',
    status: 'paid',
    updatedAt: now
  });

  const year = new Date().getFullYear();
  const receiptNum = `REC-${year}-${String(allReceipts.length + 1).padStart(4, '0')}`;

  const receipt: InvoiceReceipt = {
    id: `rec_${Math.random().toString(36).substring(2, 9)}`,
    receiptNumber: receiptNum,
    invoiceId: id,
    paymentId: razorpayPaymentId,
    razorpayOrderId,
    razorpayPaymentId,
    paymentMethod: `Razorpay (${paymentMethod})`,
    amountPaid: invoice.total,
    currency: invoice.currency,
    paidAt: now
  };

  await create<InvoiceReceipt>('invoice_receipts', receipt);

  await logInvoiceActivity({
    invoiceId: id,
    activityType: 'payment_completed',
    description: `Payment of ${invoice.currency} ${invoice.total.toLocaleString()} verified via Razorpay (${razorpayPaymentId})`,
    actor: 'Client'
  });

  await logInvoiceActivity({
    invoiceId: id,
    activityType: 'receipt_generated',
    description: `Receipt ${receipt.receiptNumber} generated for Invoice ${invoice.invoiceNumber}`,
    actor: 'System'
  });

  return { invoice: updatedInvoice, receipt };
}

export async function duplicateInvoice(id: string): Promise<Invoice> {
  const source = await read<Invoice>('invoices', id);
  if (!source) throw new Error('Invoice not found');

  const newNum = await generateNextInvoiceNumber();
  return createInvoice({
    projectId: source.projectId,
    invoiceNumber: newNum,
    title: `${source.title || 'Invoice'} (Copy)`,
    items: source.items,
    currency: source.currency,
    taxName: source.taxName,
    taxRate: source.taxRate,
    discount: source.discount,
    notes: source.notes,
    dueDate: source.dueDate
  });
}

// Normalized queries for activities, reminders, and receipts
export async function logInvoiceActivity(activity: Omit<InvoiceActivity, 'id' | 'timestamp'>): Promise<InvoiceActivity> {
  const entry: InvoiceActivity = {
    ...activity,
    id: `act_${Math.random().toString(36).substring(2, 9)}`,
    timestamp: new Date().toISOString()
  };
  return await create<InvoiceActivity>('invoice_activities', entry);
}

export async function getInvoiceActivities(invoiceId: string): Promise<InvoiceActivity[]> {
  const all = await readAll<InvoiceActivity>('invoice_activities');
  return all.filter(a => a.invoiceId === invoiceId).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

export async function getInvoiceReminders(invoiceId: string): Promise<InvoiceReminder[]> {
  const all = await readAll<InvoiceReminder>('invoice_reminders');
  return all.filter(r => r.invoiceId === invoiceId).sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime());
}

export async function getInvoiceReceipt(invoiceId: string): Promise<InvoiceReceipt | null> {
  const all = await readAll<InvoiceReceipt>('invoice_receipts');
  return all.find(r => r.invoiceId === invoiceId) || null;
}

export async function getInvoices(userId?: string): Promise<Invoice[]> {
  return await readAll<Invoice>('invoices');
}

export async function markAsPaid(id: string, userId?: string): Promise<Invoice> {
  const result = await markPaidOffline(id, 'bank_transfer');
  return result.invoice;
}

export async function sendReminder(id: string, userId?: string): Promise<void> {
  await sendInvoiceReminder(id);
}

