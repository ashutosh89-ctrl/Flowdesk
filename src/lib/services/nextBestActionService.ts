import { Client, ClientWorkspace, Project, Document, Deliverable, Invoice } from '../types';
import { readAll } from './dataService';

export interface ActionRecommendation {
  id: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  cta: string;
  route: string;
  workspaceId?: string;
  icon: string;
}

function hoursSince(dateString: string): number {
  const diffMs = Date.now() - new Date(dateString).getTime();
  return diffMs / (1000 * 60 * 60);
}

function daysUntil(dateString: string): number {
  const diffMs = new Date(dateString).getTime() - Date.now();
  return diffMs / (1000 * 60 * 60 * 24);
}

export async function getNextBestActions(userId: string): Promise<ActionRecommendation[]> {
  const actions: ActionRecommendation[] = [];

  try {
    // Read all relevant tables
    const clients = await readAll<Client>('clients', userId);
    const activeClients = clients.filter(c => c.status === 'active' || c.status === 'onboarding');
    const clientIds = activeClients.map(c => c.id);

    const workspaces = await readAll<ClientWorkspace>('workspaces');
    const projects = await readAll<Project>('projects');
    const documents = await readAll<Document>('documents');
    const deliverables = await readAll<Deliverable>('deliverables');
    const invoices = await readAll<Invoice>('invoices');

    for (const client of activeClients) {
      const workspace = workspaces.find(w => w.clientId === client.id);
      if (!workspace) continue;

      const clientProjects = projects.filter(p => p.clientId === client.id);
      const clientInvoices = invoices.filter(i => clientProjects.map(p => p.id).includes(i.projectId));

      // Rule 1: Overdue Invoice (Critical)
      const overdueInvoice = clientInvoices.find(i => i.status === 'overdue');
      if (overdueInvoice) {
        actions.push({
          id: `overdue-invoice-${overdueInvoice.id}`,
          priority: 'critical',
          title: 'Payment Overdue',
          description: `Invoice for ${client.name} is overdue. Send reminder.`,
          cta: 'Send Reminder',
          route: `/freelancer/invoices`,
          workspaceId: workspace.id,
          icon: 'alert'
        });
      }

      // Rule 2: Missing Documents > 48h (High)
      const clientDocs = documents.filter(d => d.workspaceId === workspace.id);
      const missingDoc = clientDocs.find(d => d.status === 'pending' && hoursSince(d.createdAt) > 48);
      if (missingDoc) {
        actions.push({
          id: `missing-documents-${missingDoc.id}`,
          priority: 'high',
          title: 'Documents Missing',
          description: `${client.name} hasn't uploaded required documents.`,
          cta: 'Request Again',
          route: `/freelancer/workspace/${client.id}?tab=documents`,
          workspaceId: workspace.id,
          icon: 'file'
        });
      }

      // Rule 3: Deliverable Pending Approval > 72h (High)
      const clientProjIds = clientProjects.map(p => p.id);
      const clientDelivs = deliverables.filter(d => clientProjIds.includes(d.projectId));
      const pendingApprovalDeliv = clientDelivs.find(d => 
        (d.status === 'pending_approval' || d.status === 'pending') && 
        hoursSince(d.createdAt) > 72
      );
      if (pendingApprovalDeliv) {
        actions.push({
          id: `pending-approval-${pendingApprovalDeliv.id}`,
          priority: 'high',
          title: 'Approval Waiting',
          description: `${client.name} hasn't approved deliverables.`,
          cta: 'Follow Up',
          route: `/freelancer/workspace/${client.id}?tab=deliverables`,
          workspaceId: workspace.id,
          icon: 'clock'
        });
      }

      // Rule 4: Revision Requested (High)
      const revisionRequestedDeliv = clientDelivs.find(d => d.status === 'revision_requested');
      if (revisionRequestedDeliv) {
        actions.push({
          id: `revision-requested-${revisionRequestedDeliv.id}`,
          priority: 'high',
          title: 'Revision Requested',
          description: `${client.name} requested changes on deliverables.`,
          cta: 'Upload Revision',
          route: `/freelancer/workspace/${client.id}?tab=deliverables`,
          workspaceId: workspace.id,
          icon: 'upload'
        });
      }

      // Rule 5: Project due < 3 days (Medium)
      const dueSoonProject = clientProjects.find(p => 
        p.dueDate && 
        p.status !== 'completed' && 
        daysUntil(p.dueDate) > 0 && 
        daysUntil(p.dueDate) < 3
      );
      if (dueSoonProject) {
        actions.push({
          id: `project-due-${dueSoonProject.id}`,
          priority: 'medium',
          title: 'Deadline Approaching',
          description: `Project for ${client.name} is due soon.`,
          cta: 'Review Project',
          route: `/freelancer/projects`,
          workspaceId: workspace.id,
          icon: 'calendar'
        });
      }

      // Rule 6: New Client, no projects created (Medium)
      if (clientProjects.length === 0) {
        actions.push({
          id: `no-project-${workspace.id}`,
          priority: 'medium',
          title: 'Create Project',
          description: `${client.name} is ready. Create their first project.`,
          cta: 'Create Project',
          route: `/freelancer/projects`,
          workspaceId: workspace.id,
          icon: 'plus'
        });
      }
    }
  } catch (e) {
    console.error('Error generating Next Best Actions:', e);
  }

  // Sort actions: critical -> high -> medium -> low
  const priorityMap: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 };
  return actions.sort((a, b) => priorityMap[a.priority] - priorityMap[b.priority]);
}
