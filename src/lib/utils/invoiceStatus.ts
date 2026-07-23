export function isOverdue(invoice: any): boolean {
  if (invoice.status === 'paid' || invoice.status === 'cancelled') {
    return false;
  }
  if (!invoice.dueDate) return false;

  const dueDate = new Date(invoice.dueDate);
  dueDate.setHours(23, 59, 59, 999);
  return new Date() > dueDate;
}

export function getDaysOverdue(invoice: any): number {
  if (!invoice.dueDate) return 0;
  const diffTime = new Date().getTime() - new Date(invoice.dueDate).getTime();
  const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, days);
}

export function getOverdueLabel(invoice: any): string | null {
  if (invoice.status === 'paid') return null;
  const days = getDaysOverdue(invoice);
  if (days <= 0) return null;
  if (days === 1) return 'Due today';
  if (days <= 7) return `${days} days overdue`;
  if (days <= 30) return `${Math.floor(days / 7)} weeks overdue`;
  return `${Math.floor(days / 30)} months overdue`;
}
