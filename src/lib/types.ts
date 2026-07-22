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
  status: 'active' | 'archived' | 'onboarding';
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
  type: 'pdf' | 'png' | 'jpg' | 'docx';
  status: 'pending' | 'uploaded' | 'verified' | 'rejected' | 'signed' | 'reviewed' | 'draft' | 'approved' | 'archived';
  fileUrl?: string; // dummy URL for now
  uploadedAt?: string;
  createdAt: string;
}

export interface Deliverable {
  id: string;
  projectId: string;
  name: string;
  fileUrl?: string; // dummy URL
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

export interface Invoice {
  id: string;
  projectId: string;
  invoiceNumber: string;
  items: InvoiceItem[];
  subtotal: number;
  taxRate: number; // 18% GST or similar
  taxAmount: number;
  total: number;
  status: 'pending' | 'paid' | 'overdue' | 'cancelled';
  dueDate: string;
  razorpayLink?: string; // mock URL
  createdAt: string;
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
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface ActionItem {
  id: string;
  title: string;
  description: string;
  priority: 'critical' | 'urgent' | 'warning' | 'info';
  type: 'invoice' | 'document' | 'deliverable' | 'project';
  targetId: string;
}
