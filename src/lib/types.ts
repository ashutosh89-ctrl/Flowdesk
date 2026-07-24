export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: 'freelancer' | 'client';
  plan: 'free' | 'pro' | 'studio';
  onboarded?: boolean;
  createdAt: string;
}

export interface Client {
  id: string;
  userId: string; // freelancer who owns this client
  name: string;
  company: string;
  email: string;
  phone?: string;
  status: 'active' | 'archived' | 'onboarding' | 'lead' | 'waiting' | 'completed' | string;
  avatar?: string;
  createdAt: string;
}

export interface ClientWorkspace {
  id: string;
  clientId: string;
  status: 'planning' | 'in_progress' | 'review' | 'completed';
  progress: number; // 0-100
  createdAt: string;
}

export interface Project {
  id: string;
  clientId: string;
  name: string;
  description?: string;
  status: 'planning' | 'in_progress' | 'review' | 'completed';
  dueDate?: string;
  progress: number;
  createdAt: string;
}

export interface Document {
  id: string;
  workspaceId: string;
  name: string;
  title?: string;
  type: 'pdf' | 'png' | 'jpg' | 'docx' | string;
  fileType?: string;
  fileSize?: string;
  status: 'pending' | 'uploaded' | 'verified' | 'rejected' | 'signed' | 'reviewed' | 'draft' | 'approved' | 'archived';
  fileUrl?: string;
  uploadedAt?: string;
  createdAt: string;
}

export interface Deliverable {
  id: string;
  projectId: string;
  name: string;
  title?: string;
  description?: string;
  fileUrl?: string;
  version: string;
  status: 'pending' | 'approved' | 'revision_requested' | 'pending_approval';
  revisionComment?: string;
  createdAt: string;
}

export interface InvoiceItem {
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

export type CurrencyCode = 'INR' | 'USD' | 'EUR' | 'GBP' | 'AED' | 'CAD' | 'AUD' | 'JPY';
export type InvoiceWorkflowStatus = 'draft' | 'sent' | 'delivered' | 'viewed' | 'cancelled';
export type InvoicePaymentStatus = 'pending' | 'paid' | 'refunded' | 'failed';

export interface Invoice {
  id: string;
  projectId: string;
  clientId?: string;
  clientEmailSnapshot?: string;
  invoiceNumber: string; // INV-2026-0001
  title?: string;
  items: InvoiceItem[];
  subtotal: number;
  discount?: number;
  taxName?: string; // "GST", "VAT", "Sales Tax", "No Tax"
  taxRate: number;
  taxAmount: number;
  total: number;
  currency: CurrencyCode;
  workflowStatus: InvoiceWorkflowStatus;
  paymentStatus: InvoicePaymentStatus;
  paymentMethodType?: 'razorpay' | 'bank_transfer' | 'cash' | 'cheque' | 'other';
  notes?: string;
  issueDate: string;
  dueDate: string;
  sentAt?: string | null;
  viewedAt?: string | null;
  createdAt: string;
  updatedAt?: string;

  // Legacy fallback fields for backward compatibility
  status?: string;
  number?: string;
  razorpayLink?: string;
}

export interface InvoiceActivity {
  id: string;
  invoiceId: string;
  activityType: 'created' | 'edited' | 'sent' | 'viewed' | 'reminder_sent' | 'payment_completed' | 'receipt_generated';
  description: string;
  actor: string;
  fieldChanges?: { field: string; prev: any; next: any }[];
  timestamp: string;
}

export interface InvoiceReminder {
  id: string;
  invoiceId: string;
  reminderNumber: number; // 1 to 5
  sentAt: string;
  method: 'email';
  status: 'delivered' | 'failed';
}

export interface InvoiceReceipt {
  id: string;
  receiptNumber: string; // REC-2026-0001
  invoiceId: string;
  paymentId: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  paymentMethod: string;
  amountPaid: number;
  currency: CurrencyCode;
  paidAt: string;
}

export interface Comment {
  id: string;
  projectId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  createdAt: string;
}

export interface Activity {
  id: string;
  workspaceId: string;
  type: 'document_uploaded' | 'deliverable_approved' | 'invoice_created' | 'payment_received' | 'comment_added' | 'status_changed' | 'client_created' | 'client_archived';
  description: string;
  metadata?: any;
  createdAt: string;
}
