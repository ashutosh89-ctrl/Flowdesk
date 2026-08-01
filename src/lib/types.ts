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
  status: 'lead' | 'invited' | 'active' | 'waiting' | 'completed' | 'archived' | string;
  isPinned?: boolean;
  notes?: string;
  tags?: string[];
  avatar?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface ClientWorkspace {
  id: string;
  clientId: string;
  status: 'planning' | 'in_progress' | 'review' | 'completed';
  progress: number; // 0-100
  createdAt: string;
}

export interface Milestone {
  id: string;
  projectId: string;
  name: string;
  completed: boolean;
  dueDate?: string;
  createdAt: string;
}

export interface Project {
  id: string;
  clientId: string;
  name: string;
  description?: string;
  status: 'planning' | 'in_progress' | 'review' | 'completed' | string;
  dueDate?: string;
  progress: number;
  isPinned?: boolean;
  milestones?: Milestone[];
  createdAt: string;
  updatedAt?: string;
}

export interface Template {
  id: string;
  userId: string;
  type: 'document_request' | 'invoice_note' | 'email_signature' | 'project_description';
  name: string;
  content: string;
  isDefault?: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface Document {
  id: string;
  workspaceId: string;
  clientId?: string;
  projectId?: string;
  name: string;
  title?: string;
  type: 'pdf' | 'png' | 'jpg' | 'docx' | 'logo' | 'contract' | 'reference' | string;
  fileType?: string;
  fileName?: string;
  fileSize?: string;
  status: 'pending' | 'uploaded' | 'verified' | 'rejected' | 'signed' | 'reviewed' | 'draft' | 'approved' | 'archived' | string;
  rejectReason?: string;
  uploadedBy?: 'freelancer' | 'client' | string;
  fileUrl?: string;
  uploadedAt?: string;
  createdAt: string;
}

export interface Deliverable {
  id: string;
  projectId: string;
  clientId?: string;
  name: string;
  title?: string;
  description?: string;
  fileUrl?: string;
  fileName?: string;
  version: number | string;
  status: 'pending' | 'pending_review' | 'approved' | 'revision_requested' | 'pending_approval' | string;
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
  paidAt?: string | null;
  reminderCount?: number;
  lineItems?: InvoiceItem[];
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

export interface UserProfile {
  id: string;
  avatar?: string;
  fullName: string;
  businessName: string;
  profession: string;
  email: string;
  personalPhone: string;
  country: string;
  timeZone: string;
  language: string;
}

export interface BusinessSettings {
  logo?: string;
  businessName: string;
  tagline?: string;
  businessEmail: string;
  businessPhone: string;
  portfolioUrl: string;
  address: string;
  defaultCurrency: CurrencyCode;
  taxName: string;
  defaultTaxRate: number;
  invoicePrefix: string;
  defaultDueDateDays: 7 | 15 | 30;
  defaultReminderSchedule: 'manual_only' | 'on_due_date' | '3_days_before' | '3_days_after';
  emailSignature?: string;
  // Bank & Payment Details (for invoice print)
  bankName?: string;
  accountNumber?: string;
  bankCode?: string;        // IFSC, SWIFT, Sort Code, etc.
  branch?: string;
  upiId?: string;
  termsAndConditions?: string;
}

export interface NotificationSettings {
  email: {
    clientAcceptedInvitation: boolean;
    clientUploadedDocuments: boolean;
    deliverableApproved: boolean;
    revisionRequested: boolean;
    newClientComment: boolean;
    invoiceViewed: boolean;
    invoicePaid: boolean;
    reminderFailed: boolean;
  };
  inApp: {
    enabled: boolean;
  };
}

export interface BillingSettings {
  plan: 'free' | 'pro' | 'studio';
  priceMonthly: number;
  renewalDate: string;
  status: 'active' | 'cancelling' | 'past_due';
  paymentMethod: {
    cardBrand: string;
    last4: string;
    expiry: string;
  };
  history: {
    id: string;
    invoiceId: string;
    date: string;
    amount: number;
    currency: CurrencyCode;
  }[];
}

export interface WorkspacePreferences {
  defaultLandingPage: 'dashboard' | 'clients' | 'projects' | 'invoices';
  clientListView: 'table' | 'grid';
  dateFormat: 'YYYY-MM-DD' | 'DD/MM/YYYY' | 'MM/DD/YYYY';
  timeFormat: '12h' | '24h';
  weekStartsOn: 'Monday' | 'Sunday';
}

export type SecurityActivityType = 
  | 'LOGIN' 
  | 'PASSWORD_CHANGED' 
  | 'PROFILE_UPDATED' 
  | 'EMAIL_CHANGED' 
  | 'SUBSCRIPTION_UPDATED' 
  | 'LOGOUT' 
  | 'DEVICE_REMOVED';

export interface SecuritySettings {
  activeSessions: {
    id: string;
    device: string;
    userAgent: string;
    ip: string;
    lastActive: string;
    isCurrent: boolean;
  }[];
  recentActivity: {
    id: string;
    type: SecurityActivityType;
    ip: string;
    timestamp: string;
  }[];
  twoFactorEnabled: boolean;
}

export interface Comment {
  id: string;
  clientId?: string;
  workspaceId?: string;
  projectId?: string;
  deliverableId?: string;
  authorId?: string;
  authorRole?: 'freelancer' | 'client' | string;
  userId?: string;
  userName?: string;
  userAvatar?: string;
  content: string;
  parentId?: string;
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
