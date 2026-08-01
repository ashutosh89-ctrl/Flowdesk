import { 
  UserProfile, BusinessSettings, NotificationSettings, 
  BillingSettings, WorkspacePreferences, SecuritySettings 
} from '../types';

export interface FullUserSettings {
  profile: UserProfile;
  business: BusinessSettings;
  notifications: NotificationSettings;
  billing: BillingSettings;
  preferences: WorkspacePreferences;
  security: SecuritySettings;
}

export const DEFAULT_USER_PROFILE: UserProfile = {
  id: 'usr_ann',
  avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=Ann',
  fullName: 'Alex Chen',
  businessName: 'FlowDesk Studio',
  profession: 'Senior Product Designer & Systems Architect',
  email: 'alex.chen@flowdesk.io',
  personalPhone: '+1 (555) 234-5678',
  country: 'United States',
  timeZone: 'America/New_York (UTC-05:00)',
  language: 'English (US)'
};

export const DEFAULT_BUSINESS_SETTINGS: BusinessSettings = {
  logo: 'https://api.dicebear.com/7.x/identicon/svg?seed=FlowDeskStudio',
  businessName: 'FlowDesk Studio',
  tagline: 'Crafting High-Fidelity Product Workflows & Digital Systems',
  businessEmail: 'billing@flowdesk.io',
  businessPhone: '+1 (555) 987-6543',
  portfolioUrl: 'https://dribbble.com/alexchen_design',
  address: '742 Evergreen Terrace, Suite 400, San Francisco, CA 94107',
  defaultCurrency: 'INR',
  taxName: 'GST',
  defaultTaxRate: 18,
  invoicePrefix: 'INV-',
  defaultDueDateDays: 14 as any,
  defaultReminderSchedule: '3_days_before',
  emailSignature: 'Thanks,\nAlex Chen\nPrincipal Architect, FlowDesk Studio',
  bankName: 'First National Bank',
  accountNumber: '123456789012',
  bankCode: 'FNBIUS33',
  branch: 'San Francisco Main Branch',
  upiId: 'flowdesk@upi',
  termsAndConditions: '1. Payment is due by the date specified above.\n2. Please mention Invoice Number on all payment transfers.\n3. Late payments may incur additional charges.'
};

export const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  email: {
    clientAcceptedInvitation: true,
    clientUploadedDocuments: true,
    deliverableApproved: true,
    revisionRequested: true,
    newClientComment: true,
    invoiceViewed: true,
    invoicePaid: true,
    reminderFailed: true
  },
  inApp: {
    enabled: true
  }
};

export const DEFAULT_BILLING_SETTINGS: BillingSettings = {
  plan: 'pro',
  priceMonthly: 29,
  renewalDate: '2026-08-15',
  status: 'active',
  paymentMethod: {
    cardBrand: 'Visa',
    last4: '4242',
    expiry: '08/28'
  },
  history: [
    { id: 'bill_001', invoiceId: 'INV-2026-0001', date: '2026-07-15', amount: 29, currency: 'USD' },
    { id: 'bill_002', invoiceId: 'INV-2026-0000', date: '2026-06-15', amount: 29, currency: 'USD' }
  ]
};

export const DEFAULT_WORKSPACE_PREFERENCES: WorkspacePreferences = {
  defaultLandingPage: 'dashboard',
  clientListView: 'table',
  dateFormat: 'YYYY-MM-DD',
  timeFormat: '12h',
  weekStartsOn: 'Monday'
};

export const DEFAULT_SECURITY_SETTINGS: SecuritySettings = {
  activeSessions: [
    {
      id: 'sess_curr',
      device: 'Windows PC',
      userAgent: 'Chrome 126.0 (Windows 11)',
      ip: '192.168.1.6',
      lastActive: 'Just now',
      isCurrent: true
    },
    {
      id: 'sess_mbp',
      device: 'MacBook Pro 16"',
      userAgent: 'Safari 17.4 (macOS Sonoma)',
      ip: '68.12.94.110',
      lastActive: '2 days ago',
      isCurrent: false
    }
  ],
  recentActivity: [
    { id: 'sec_1', type: 'LOGIN', ip: '192.168.1.6', timestamp: new Date().toISOString() },
    { id: 'sec_2', type: 'PROFILE_UPDATED', ip: '192.168.1.6', timestamp: new Date(Date.now() - 86400000).toISOString() }
  ],
  twoFactorEnabled: false
};

// Default/fallback settings for first-time users
function getDefaults(): FullUserSettings {
  return {
    profile: DEFAULT_USER_PROFILE,
    business: DEFAULT_BUSINESS_SETTINGS,
    notifications: DEFAULT_NOTIFICATION_SETTINGS,
    billing: DEFAULT_BILLING_SETTINGS,
    preferences: DEFAULT_WORKSPACE_PREFERENCES,
    security: DEFAULT_SECURITY_SETTINGS
  };
}

// Load settings from localStorage cache
function loadFromCache(): FullUserSettings | null {
  try {
    const stored = localStorage.getItem('flowdesk_full_settings');
    if (stored) return JSON.parse(stored);
  } catch (e) {}
  return null;
}

// Save settings to localStorage cache
function saveToCache(settings: FullUserSettings): void {
  try {
    localStorage.setItem('flowdesk_full_settings', JSON.stringify(settings));
  } catch (e) {}
}

export async function getFullSettings(): Promise<FullUserSettings> {
  // Try API first (source of truth)
  try {
    const res = await fetch('/api/settings');
    if (res.ok) {
      const data = await res.json();
      // If API returns settings, use them and cache locally
      if (data.settings) {
        saveToCache(data.settings);
        return data.settings;
      }
    }
  } catch (e) {
    console.warn('Failed to fetch settings from API, using local cache:', e);
  }

  // Fallback: try localStorage cache
  const cached = loadFromCache();
  if (cached) return cached;

  // Last resort: return defaults
  return getDefaults();
}

export async function saveFullSettings(settings: FullUserSettings): Promise<FullUserSettings> {
  // Save to API (source of truth)
  let apiSuccess = false;
  try {
    const res = await fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings)
    });
    apiSuccess = res.ok;
  } catch (e) {
    console.warn('Failed to save settings to API:', e);
  }

  // Always save to localStorage as cache/fallback
  saveToCache(settings);

  if (!apiSuccess) {
    console.warn('Settings saved locally only (API unavailable)');
  }

  return settings;
}

export function exportUserData(settings: FullUserSettings) {
  const exportPayload = {
    exportedAt: new Date().toISOString(),
    user: settings.profile,
    business: settings.business,
    preferences: settings.preferences,
    notifications: settings.notifications,
    billing: settings.billing,
    securitySummary: {
      sessionCount: settings.security.activeSessions.length,
      recentActivityCount: settings.security.recentActivity.length
    }
  };

  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportPayload, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute("href", dataStr);
  downloadAnchor.setAttribute("download", `FlowDesk_AccountData_${new Date().toISOString().split('T')[0]}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}
