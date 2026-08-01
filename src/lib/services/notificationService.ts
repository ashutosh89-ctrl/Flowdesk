export interface AppNotification {
  id: string;
  userId: string;
  type: 'client_accepted' | 'document_uploaded' | 'deliverable_approved' | 'invoice_viewed' | 'invoice_paid' | 'revision_requested';
  title: string;
  message: string;
  link?: string;
  read: boolean;
  createdAt: string;
}

const STORAGE_KEY = 'flowdesk_inapp_notifications';

const DEFAULT_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif_1',
    userId: 'usr_ann',
    type: 'invoice_paid',
    title: 'Payment Received',
    message: 'David Stern (Axiom Global) paid Invoice #INV-2026-0001 ($5,310.00).',
    link: '/freelancer/invoices',
    read: false,
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString()
  },
  {
    id: 'notif_2',
    userId: 'usr_ann',
    type: 'deliverable_approved',
    title: 'Deliverable Approved',
    message: 'Marta Adams approved "Homepage Wireframe & Design Specs v2.0".',
    link: '/freelancer/workspace/cl_marta',
    read: false,
    createdAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString()
  },
  {
    id: 'notif_3',
    userId: 'usr_ann',
    type: 'document_uploaded',
    title: 'Document Uploaded',
    message: 'Elena Rodriguez uploaded "Brand Guidelines PDF" for verification.',
    link: '/freelancer/workspace/cl_elena',
    read: true,
    createdAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString()
  }
];

export async function getNotifications(userId = 'usr_ann'): Promise<AppNotification[]> {
  try {
    const res = await fetch('/api/notifications');
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.notifications)) return data.notifications;
    }
  } catch (e) {}

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch (e) {}

  return DEFAULT_NOTIFICATIONS;
}

export async function saveNotifications(notifications: AppNotification[]): Promise<void> {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
  } catch (e) {}

  try {
    await fetch('/api/notifications', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notifications })
    });
  } catch (e) {}
}

export async function createNotification(notif: Omit<AppNotification, 'id' | 'createdAt' | 'read'>): Promise<AppNotification> {
  const newNotif: AppNotification = {
    ...notif,
    id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    read: false,
    createdAt: new Date().toISOString()
  };

  const current = await getNotifications(notif.userId);
  const updated = [newNotif, ...current];
  await saveNotifications(updated);
  return newNotif;
}

export async function markNotificationAsRead(id: string): Promise<AppNotification[]> {
  const current = await getNotifications();
  const updated = current.map(n => n.id === id ? { ...n, read: true } : n);
  await saveNotifications(updated);
  return updated;
}

export async function markAllNotificationsAsRead(): Promise<AppNotification[]> {
  const current = await getNotifications();
  const updated = current.map(n => ({ ...n, read: true }));
  await saveNotifications(updated);
  return updated;
}
