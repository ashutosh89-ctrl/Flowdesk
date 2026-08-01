import { Client, Project, Invoice, Deliverable, Document } from '../types';

export type HealthStatus = 'on-track' | 'waiting-on-client' | 'payment-pending' | 'at-risk';

export interface HealthInfo {
  status: HealthStatus;
  label: string;
  badgeClass: string;
  reason: string;
}

export function calculateClientHealth(
  client: Client,
  projects: Project[] = [],
  invoices: Invoice[] = [],
  deliverables: Deliverable[] = [],
  documents: Document[] = []
): HealthInfo {
  const now = new Date();

  // Filter linked data for this client
  const clientProjects = projects.filter(p => p.clientId === client.id);
  const clientInvoices = invoices.filter(i => i.clientId === client.id);

  // 1. Check At-Risk conditions
  const hasOverdueInvoice = clientInvoices.some(i => {
    if (i.paymentStatus === 'paid' || i.status === 'paid') return false;
    if (i.status === 'overdue') return true;
    if (!i.dueDate) return false;
    return new Date(i.dueDate).getTime() < now.getTime();
  });

  const hasOverdueProject = clientProjects.some(p => {
    if (p.status === 'completed') return false;
    if (!p.dueDate) return false;
    return new Date(p.dueDate).getTime() < now.getTime();
  });

  if (hasOverdueInvoice || hasOverdueProject) {
    return {
      status: 'at-risk',
      label: 'At Risk',
      badgeClass: 'bg-red-50 text-red-700 border-red-200',
      reason: hasOverdueInvoice ? 'Overdue invoice payment' : 'Project past due date'
    };
  }

  // 2. Check Waiting-on-Client conditions
  const hasPendingReviewDeliverables = deliverables.some(
    d => d.status === 'pending_review' || d.status === 'revision_requested'
  );
  const hasPendingDocs = documents.some(
    d => d.status === 'pending' || d.status === 'uploaded'
  );

  if (hasPendingReviewDeliverables || hasPendingDocs) {
    return {
      status: 'waiting-on-client',
      label: 'Waiting on Client',
      badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
      reason: hasPendingReviewDeliverables ? 'Deliverable awaiting review' : 'Documents pending verification'
    };
  }

  // 3. Check Payment Pending conditions
  const hasUnpaidInvoice = clientInvoices.some(
    i => (i.paymentStatus === 'pending' || i.status === 'sent' || i.status === 'viewed') && i.paymentStatus !== 'paid'
  );

  if (hasUnpaidInvoice) {
    return {
      status: 'payment-pending',
      label: 'Payment Pending',
      badgeClass: 'bg-orange-50 text-orange-700 border-orange-200',
      reason: 'Invoice sent, awaiting payment'
    };
  }

  // 4. Default: On Track
  return {
    status: 'on-track',
    label: 'On Track',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    reason: 'Projects progressing normally'
  };
}
