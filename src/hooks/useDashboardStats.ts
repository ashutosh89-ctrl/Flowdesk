import { useMemo } from 'react';
import { Client, Project, Invoice, ClientWorkspace } from '@/lib/types';
import { ActionRecommendation } from '@/lib/services/nextBestActionService';

export interface DashboardStats {
  activeClientsCount: number;
  activeProjectsCount: number;
  pendingPaymentsCount: number;
  pendingPaymentsAmount: number;
  overdueInvoicesCount: number;
  overdueInvoicesAmount: number;
  dueThisWeekCount: number;
  healthScore: number;
  lifetimeRevenue: number;
  thisMonthRevenue: number;
  urgentFocus: {
    text: string;
    link: string;
    isUrgent: boolean;
  };
}

export function useDashboardStats(
  clients: Client[],
  projects: Project[],
  invoices: Invoice[],
  workspaces: ClientWorkspace[],
  actions: ActionRecommendation[]
): DashboardStats {
  return useMemo(() => {
    // 1. Active Clients
    const activeClientsCount = clients.filter(
      c => c.status === 'active' || c.status === 'onboarding'
    ).length;

    // 2. Active Projects
    const activeProjectsCount = projects.filter(
      p => p.status !== 'completed'
    ).length;

    // 3. Pending Payments (Count & Sum)
    const pendingInvoices = invoices.filter(
      i => (i.paymentStatus === 'pending' || i.status === 'pending') && i.paymentStatus !== 'paid' && i.status !== 'paid'
    );
    const pendingPaymentsCount = pendingInvoices.length;
    const pendingPaymentsAmount = pendingInvoices.reduce((sum, item) => sum + (item.total || 0), 0);

    // 4. Overdue Invoices (Count & Sum)
    const now = new Date();
    const overdueInvoices = invoices.filter(i => {
      if (i.paymentStatus === 'paid' || i.status === 'paid') return false;
      if (i.paymentStatus === 'refunded') return false;
      if (i.status === 'overdue') return true;
      if (!i.dueDate) return false;
      return new Date(i.dueDate).getTime() < now.getTime();
    });
    const overdueInvoicesCount = overdueInvoices.length;
    const overdueInvoicesAmount = overdueInvoices.reduce((sum, item) => sum + (item.total || 0), 0);

    // 5. Due This Week Projects
    const dueThisWeekCount = projects.filter(p => {
      if (!p.dueDate || p.status === 'completed') return false;
      const diffMs = new Date(p.dueDate).getTime() - Date.now();
      const diffDays = diffMs / (1000 * 60 * 60 * 24);
      return diffDays >= -2 && diffDays <= 7;
    }).length;

    // 6. Health Score Calculation
    let score = 100;
    score -= overdueInvoicesCount * 15;
    
    const stalePlanning = projects.filter(p => {
      const days = (Date.now() - new Date(p.createdAt).getTime()) / (1000 * 60 * 60 * 24);
      return p.status === 'planning' && days > 7;
    }).length;
    score -= stalePlanning * 10;

    const missingDocsCount = workspaces.filter(w => w.status === 'planning').length;
    score -= missingDocsCount * 5;

    const healthScore = Math.max(0, Math.min(100, score));

    // 7. Revenue Calculations
    const paidInvoices = invoices.filter(
      i => i.paymentStatus === 'paid' || i.status === 'paid'
    );
    const lifetimeRevenue = paidInvoices.reduce((sum, i) => sum + (i.total || 0), 0);

    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    const thisMonthPaidInvoices = paidInvoices.filter(i => {
      const date = new Date(i.updatedAt || i.issueDate || i.createdAt);
      return date.getFullYear() === currentYear && date.getMonth() === currentMonth;
    });
    const thisMonthRevenue = thisMonthPaidInvoices.reduce((sum, i) => sum + (i.total || 0), 0);

    // 8. Urgent Focus Determination
    let urgentFocus = {
      text: "You're all caught up for today ✨",
      link: '/freelancer/dashboard',
      isUrgent: false,
    };

    if (overdueInvoices.length > 0) {
      const firstOverdue = overdueInvoices[0];
      const clientName = clients.find(c => c.id === firstOverdue.clientId)?.name || 'client';
      urgentFocus = {
        text: `Follow up on overdue invoice ${firstOverdue.invoiceNumber || firstOverdue.number || ''} for ${clientName}`,
        link: '/freelancer/invoices?status=overdue',
        isUrgent: true,
      };
    } else if (actions.length > 0 && actions[0].priority === 'critical') {
      urgentFocus = {
        text: actions[0].description,
        link: actions[0].route,
        isUrgent: true,
      };
    } else if (actions.length > 0) {
      urgentFocus = {
        text: actions[0].description,
        link: actions[0].route,
        isUrgent: true,
      };
    }

    return {
      activeClientsCount,
      activeProjectsCount,
      pendingPaymentsCount,
      pendingPaymentsAmount,
      overdueInvoicesCount,
      overdueInvoicesAmount,
      dueThisWeekCount,
      healthScore,
      lifetimeRevenue,
      thisMonthRevenue,
      urgentFocus,
    };
  }, [clients, projects, invoices, workspaces, actions]);
}
