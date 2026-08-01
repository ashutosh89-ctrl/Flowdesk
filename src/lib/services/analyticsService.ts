import { Client, Project, Invoice } from '../types';

export interface AnalyticsMetrics {
  lifetimeRevenue: number;
  monthlyRevenue: number;
  outstandingAmount: number;
  overdueAmount: number;
  activeClientsCount: number;
  activeProjectsCount: number;
  completionRate: number; // 0 - 100 %
  averageProjectValue: number;
  averagePaymentTimeDays: number;
  monthlyData: { month: string; revenue: number; invoiceCount: number }[];
  projectStatusBreakdown: { status: string; count: number; percentage: number }[];
}

export function calculateAnalyticsMetrics(
  clients: Client[],
  projects: Project[],
  invoices: Invoice[],
  dateRange: 'all' | 'this_month' | 'this_year' | 'last_30_days' = 'all'
): AnalyticsMetrics {
  const now = new Date();
  
  // Date filtering logic for metrics where applicable
  let startDate: Date | null = null;
  if (dateRange === 'this_month') {
    startDate = new Date(now.getFullYear(), now.getMonth(), 1);
  } else if (dateRange === 'this_year') {
    startDate = new Date(now.getFullYear(), 0, 1);
  } else if (dateRange === 'last_30_days') {
    startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  }

  const isWithinRange = (dateStr?: string) => {
    if (!startDate || !dateStr) return true;
    return new Date(dateStr).getTime() >= startDate.getTime();
  };

  // 1. Lifetime Revenue (Total of paid invoices in range)
  const paidInvoices = invoices.filter(
    i => (i.paymentStatus === 'paid' || i.status === 'paid') && isWithinRange(i.updatedAt || i.issueDate || i.createdAt)
  );
  const lifetimeRevenue = paidInvoices.reduce((sum, i) => sum + (i.total || 0), 0);

  // 2. Monthly Revenue (Paid in current calendar month)
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  const thisMonthPaid = invoices.filter(i => {
    if (i.paymentStatus !== 'paid' && i.status !== 'paid') return false;
    const date = new Date(i.updatedAt || i.issueDate || i.createdAt);
    return date.getFullYear() === currentYear && date.getMonth() === currentMonth;
  });
  const monthlyRevenue = thisMonthPaid.reduce((sum, i) => sum + (i.total || 0), 0);

  // 3. Outstanding Payments (Sum of pending unpaid invoices)
  const pendingInvoices = invoices.filter(
    i => (i.paymentStatus === 'pending' || i.status === 'pending') && i.paymentStatus !== 'paid' && i.status !== 'paid' && isWithinRange(i.createdAt)
  );
  const outstandingAmount = pendingInvoices.reduce((sum, i) => sum + (i.total || 0), 0);

  // 4. Overdue Amount (Sum of invoices past due date AND unpaid)
  const overdueInvoices = invoices.filter(i => {
    if (i.paymentStatus === 'paid' || i.status === 'paid') return false;
    if (i.status === 'overdue') return true;
    if (!i.dueDate) return false;
    return new Date(i.dueDate).getTime() < now.getTime();
  });
  const overdueAmount = overdueInvoices.reduce((sum, i) => sum + (i.total || 0), 0);

  // 5. Active Clients
  const activeClientsCount = clients.filter(
    c => c.status === 'active' || c.status === 'onboarding'
  ).length;

  // 6. Active Projects
  const activeProjectsCount = projects.filter(
    p => p.status !== 'completed'
  ).length;

  // 7. Completion Rate (% of completed vs total projects)
  const totalProjects = projects.length;
  const completedProjects = projects.filter(p => p.status === 'completed').length;
  const completionRate = totalProjects > 0 ? Math.round((completedProjects / totalProjects) * 100) : 0;

  // 8. Average Project Value (Total invoice value / number of projects)
  const totalInvoiceValue = invoices.reduce((sum, i) => sum + (i.total || 0), 0);
  const averageProjectValue = totalProjects > 0 ? Math.round(totalInvoiceValue / totalProjects) : 0;

  // 9. Average Payment Time (Days from sentAt/issueDate to paidAt/updatedAt for paid invoices)
  let totalPaymentDays = 0;
  let paidCountWithDates = 0;
  paidInvoices.forEach(i => {
    const sentTime = new Date(i.sentAt || i.issueDate || i.createdAt).getTime();
    const paidTime = new Date(i.updatedAt || i.createdAt).getTime();
    if (paidTime >= sentTime) {
      const diffDays = Math.max(1, Math.round((paidTime - sentTime) / (1000 * 3600 * 24)));
      totalPaymentDays += diffDays;
      paidCountWithDates++;
    }
  });
  const averagePaymentTimeDays = paidCountWithDates > 0 ? Math.round(totalPaymentDays / paidCountWithDates) : 4;

  // 10. Monthly Data for Charts (Last 6 Months)
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthlyData: { month: string; revenue: number; invoiceCount: number }[] = [];

  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const mName = monthNames[d.getMonth()];
    const mYear = d.getFullYear();
    
    const monthInvoices = paidInvoices.filter(inv => {
      const date = new Date(inv.updatedAt || inv.issueDate || inv.createdAt);
      return date.getMonth() === d.getMonth() && date.getFullYear() === mYear;
    });

    const rev = monthInvoices.reduce((sum, inv) => sum + (inv.total || 0), 0);
    monthlyData.push({
      month: `${mName} ${mYear.toString().slice(-2)}`,
      revenue: rev,
      invoiceCount: monthInvoices.length
    });
  }

  // 11. Project Status Breakdown
  const statusCounts: Record<string, number> = {
    planning: 0,
    in_progress: 0,
    review: 0,
    completed: 0
  };
  projects.forEach(p => {
    const st = p.status in statusCounts ? p.status : 'planning';
    statusCounts[st] = (statusCounts[st] || 0) + 1;
  });

  const projectStatusBreakdown = Object.entries(statusCounts).map(([status, count]) => ({
    status: status.replace('_', ' '),
    count,
    percentage: totalProjects > 0 ? Math.round((count / totalProjects) * 100) : 0
  }));

  return {
    lifetimeRevenue,
    monthlyRevenue,
    outstandingAmount,
    overdueAmount,
    activeClientsCount,
    activeProjectsCount,
    completionRate,
    averageProjectValue,
    averagePaymentTimeDays,
    monthlyData,
    projectStatusBreakdown
  };
}
