"use client";
import React, { useState, useEffect } from 'react';
import { useApp } from '../AppContext';
import { 
  FullUserSettings, getFullSettings, saveFullSettings, exportUserData 
} from '../../lib/services/settingsService';
import { CurrencyMap, CurrencyCode } from '../../lib/utils/currency';
import { 
  User as UserIcon, Building2, Bell, CreditCard, Sliders, Shield, 
  Save, Check, Lock, AlertTriangle, Download, Trash2, Globe, ExternalLink, 
  Mail, Phone, FileText, CheckCircle2, ShieldAlert, Sparkles, RefreshCw 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export function FreelancerSettingsClient() {
  const { user, setUser, addToast } = useApp();

  const [activeTab, setActiveTab] = useState<'profile' | 'business' | 'notifications' | 'billing' | 'preferences' | 'security'>('profile');
  const [settings, setSettings] = useState<FullUserSettings | null>(null);
  const [initialSettingsJSON, setInitialSettingsJSON] = useState<string>('');
  
  const [isDirty, setIsDirty] = useState(false);
  const [saving, setSaving] = useState(false);

  // Security modals & forms
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  useEffect(() => {
    loadSettingsData();
  }, []);

  const loadSettingsData = async () => {
    const data = await getFullSettings();
    setSettings(data);
    setInitialSettingsJSON(JSON.stringify(data));
  };

  const checkDirty = (current: FullUserSettings) => {
    if (!initialSettingsJSON) return false;
    return JSON.stringify(current) !== initialSettingsJSON;
  };

  const updateProfile = (field: string, value: any) => {
    if (!settings) return;
    const next = {
      ...settings,
      profile: { ...settings.profile, [field]: value }
    };
    setSettings(next);
    setIsDirty(checkDirty(next));
  };

  const updateBusiness = (field: string, value: any) => {
    if (!settings) return;
    const next = {
      ...settings,
      business: { ...settings.business, [field]: value }
    };
    setSettings(next);
    setIsDirty(checkDirty(next));
  };

  const updateNotificationEmail = (field: string, value: boolean) => {
    if (!settings) return;
    const next = {
      ...settings,
      notifications: {
        ...settings.notifications,
        email: { ...settings.notifications.email, [field]: value }
      }
    };
    setSettings(next);
    setIsDirty(checkDirty(next));
  };

  const updatePreferences = (field: string, value: any) => {
    if (!settings) return;
    const next = {
      ...settings,
      preferences: { ...settings.preferences, [field]: value }
    };
    setSettings(next);
    setIsDirty(checkDirty(next));
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!settings) return;

    setSaving(true);
    try {
      const saved = await saveFullSettings(settings);
      setSettings(saved);
      setInitialSettingsJSON(JSON.stringify(saved));
      setIsDirty(false);

      if (user) {
        setUser({ ...user, name: saved.profile.fullName });
      }
      addToast('Settings updated successfully!', 'success');
    } catch (err) {
      addToast('Failed to save settings', 'warning');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      addToast('Password must be at least 8 characters long', 'warning');
      return;
    }
    if (newPassword !== confirmPassword) {
      addToast('Passwords do not match', 'warning');
      return;
    }

    setPasswordSuccess(true);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    addToast('Password changed successfully!', 'success');
    setTimeout(() => setPasswordSuccess(false), 3000);
  };

  const handleLogoutOtherDevices = () => {
    if (!settings) return;
    const currentOnly = settings.security.activeSessions.filter(s => s.isCurrent);
    const next = {
      ...settings,
      security: { ...settings.security, activeSessions: currentOnly }
    };
    setSettings(next);
    saveFullSettings(next);
    addToast('Logged out from all other active sessions', 'success');
  };

  if (!settings) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 bg-[#F5F5F3]">
        <div className="w-6 h-6 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const navTabs = [
    { id: 'profile', name: 'Profile', icon: UserIcon },
    { id: 'business', name: 'Business', icon: Building2 },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'billing', name: 'Billing', icon: CreditCard },
    { id: 'preferences', name: 'Workspace Preferences', icon: Sliders },
    { id: 'security', name: 'Security', icon: Shield },
  ] as const;

  return (
    <div className="flex-1 flex flex-col font-sans h-full min-h-0 bg-[#F5F5F3] overflow-hidden select-none relative">
      
      {/* Top Header */}
      <div className="h-16 border-b border-black/5 px-6 flex items-center justify-between bg-white/40 shrink-0">
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400">Freelancer Operating System</span>
          <h2 className="text-base font-extrabold text-gray-950 mt-0.5">Workspace Settings</h2>
        </div>

        <button
          onClick={() => handleSave()}
          disabled={saving}
          className="px-4 py-2 bg-gray-950 hover:bg-gray-800 disabled:bg-gray-700 text-white font-bold text-xs rounded-full flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
        >
          {saving ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <Save className="w-4 h-4" />
              Save Settings
            </>
          )}
        </button>
      </div>

      {/* Main Viewport Split */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-0">
        
        {/* Left Navigation Sidebar */}
        <div className="w-full md:w-56 border-b md:border-b-0 md:border-r border-black/5 bg-white/20 p-3 md:p-4 flex md:flex-col gap-1 shrink-0 overflow-x-auto md:overflow-y-auto">
          {navTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 md:flex-none flex items-center justify-center md:justify-start gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  isActive 
                    ? 'bg-gray-950 text-white shadow-xs' 
                    : 'text-gray-500 hover:bg-black/5 hover:text-gray-950'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{tab.name}</span>
              </button>
            );
          })}
        </div>

        {/* Right Content Sheet */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 max-w-4xl min-h-0 space-y-8">
          
          {/* 1. PROFILE SECTION */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-extrabold text-gray-950">Personal Profile</h3>
                <p className="text-xs text-gray-400 font-semibold mt-1">Manage your freelancer identity and personal details.</p>
              </div>

              {/* Profile Photo */}
              <div className="flex items-center gap-4 p-4 bg-white border border-black/5 rounded-2xl">
                <img
                  src={settings.profile.avatar || 'https://api.dicebear.com/7.x/initials/svg?seed=Ann'}
                  alt="Avatar"
                  className="w-16 h-16 rounded-full border border-black/10 object-cover"
                />
                <div>
                  <h4 className="text-xs font-extrabold text-gray-950">{settings.profile.fullName}</h4>
                  <p className="text-[11px] text-gray-400 font-medium">{settings.profile.profession}</p>
                </div>
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                  <input
                    type="text"
                    value={settings.profile.fullName}
                    onChange={(e) => updateProfile('fullName', e.target.value)}
                    className="peer w-full h-11 px-4 pt-4 pb-1 bg-white border border-black/10 rounded-xl text-xs font-bold text-gray-950 focus:outline-none focus:border-gray-950"
                  />
                  <label className="absolute left-4 top-1 text-[9px] text-gray-400 font-bold uppercase">Full Name</label>
                </div>

                <div className="relative">
                  <input
                    type="text"
                    value={settings.profile.profession}
                    onChange={(e) => updateProfile('profession', e.target.value)}
                    className="peer w-full h-11 px-4 pt-4 pb-1 bg-white border border-black/10 rounded-xl text-xs font-bold text-gray-950 focus:outline-none focus:border-gray-950"
                  />
                  <label className="absolute left-4 top-1 text-[9px] text-gray-400 font-bold uppercase">Profession / Specialty</label>
                </div>

                <div className="relative">
                  <input
                    type="email"
                    value={settings.profile.email}
                    readOnly
                    className="w-full h-11 px-4 pt-4 pb-1 bg-gray-100 border border-black/10 rounded-xl text-xs font-bold text-gray-500 cursor-not-allowed"
                  />
                  <label className="absolute left-4 top-1 text-[9px] text-gray-400 font-bold uppercase">Email Address (Managed by Auth)</label>
                </div>

                <div className="relative">
                  <input
                    type="text"
                    value={settings.profile.personalPhone}
                    onChange={(e) => updateProfile('personalPhone', e.target.value)}
                    className="peer w-full h-11 px-4 pt-4 pb-1 bg-white border border-black/10 rounded-xl text-xs font-bold text-gray-950 focus:outline-none focus:border-gray-950"
                  />
                  <label className="absolute left-4 top-1 text-[9px] text-gray-400 font-bold uppercase">Personal Phone</label>
                </div>

                <div className="relative">
                  <input
                    type="text"
                    value={settings.profile.country}
                    onChange={(e) => updateProfile('country', e.target.value)}
                    className="peer w-full h-11 px-4 pt-4 pb-1 bg-white border border-black/10 rounded-xl text-xs font-bold text-gray-950 focus:outline-none focus:border-gray-950"
                  />
                  <label className="absolute left-4 top-1 text-[9px] text-gray-400 font-bold uppercase">Country</label>
                </div>

                <div className="relative">
                  <input
                    type="text"
                    value={settings.profile.timeZone}
                    onChange={(e) => updateProfile('timeZone', e.target.value)}
                    className="peer w-full h-11 px-4 pt-4 pb-1 bg-white border border-black/10 rounded-xl text-xs font-bold text-gray-950 focus:outline-none focus:border-gray-950"
                  />
                  <label className="absolute left-4 top-1 text-[9px] text-gray-400 font-bold uppercase">Time Zone</label>
                </div>
              </div>
            </div>
          )}

          {/* 2. BUSINESS SECTION */}
          {activeTab === 'business' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-extrabold text-gray-950">Business & Branding</h3>
                <p className="text-xs text-gray-400 font-semibold mt-1">Configure your agency identity, invoice defaults, and email signatures.</p>
              </div>

              {/* Live Invoice Branding Preview Card */}
              <div className="p-4 bg-white border border-black/10 rounded-2xl space-y-3 shadow-xs">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-600 block">Live Invoice Branding Preview</span>
                <div className="p-4 bg-gray-50 border border-black/5 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img src={settings.business.logo} alt="Logo" className="w-10 h-10 rounded-lg object-cover border border-black/10" />
                    <div>
                      <h4 className="text-xs font-black text-gray-950">{settings.business.businessName || 'Business Name'}</h4>
                      <p className="text-[10px] text-gray-500 font-medium">{settings.business.tagline || 'Tagline'}</p>
                    </div>
                  </div>
                  <div className="text-right text-[10px] font-mono font-bold text-gray-500">
                    <div>{settings.business.invoicePrefix}2026-0001</div>
                    <div className="text-gray-900 font-bold">{settings.business.defaultCurrency} ({settings.business.taxName} {settings.business.defaultTaxRate}%)</div>
                  </div>
                </div>
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                  <input
                    type="text"
                    value={settings.business.businessName}
                    onChange={(e) => updateBusiness('businessName', e.target.value)}
                    className="peer w-full h-11 px-4 pt-4 pb-1 bg-white border border-black/10 rounded-xl text-xs font-bold text-gray-950 focus:outline-none"
                  />
                  <label className="absolute left-4 top-1 text-[9px] text-gray-400 font-bold uppercase">Business Name</label>
                </div>

                <div className="relative">
                  <input
                    type="text"
                    value={settings.business.tagline || ''}
                    onChange={(e) => updateBusiness('tagline', e.target.value)}
                    placeholder="Crafting Digital Experiences"
                    className="peer w-full h-11 px-4 pt-4 pb-1 bg-white border border-black/10 rounded-xl text-xs font-bold text-gray-950 focus:outline-none"
                  />
                  <label className="absolute left-4 top-1 text-[9px] text-gray-400 font-bold uppercase">Business Tagline</label>
                </div>

                <div className="relative">
                  <input
                    type="email"
                    value={settings.business.businessEmail}
                    onChange={(e) => updateBusiness('businessEmail', e.target.value)}
                    className="peer w-full h-11 px-4 pt-4 pb-1 bg-white border border-black/10 rounded-xl text-xs font-bold text-gray-950 focus:outline-none"
                  />
                  <label className="absolute left-4 top-1 text-[9px] text-gray-400 font-bold uppercase">Business Email</label>
                </div>

                <div className="relative">
                  <input
                    type="text"
                    value={settings.business.portfolioUrl}
                    onChange={(e) => updateBusiness('portfolioUrl', e.target.value)}
                    placeholder="https://dribbble.com/portfolio"
                    className="peer w-full h-11 px-4 pt-4 pb-1 bg-white border border-black/10 rounded-xl text-xs font-bold text-gray-950 focus:outline-none"
                  />
                  <label className="absolute left-4 top-1 text-[9px] text-gray-400 font-bold uppercase">Portfolio URL</label>
                </div>

                <div className="relative md:col-span-2">
                  <input
                    type="text"
                    value={settings.business.address}
                    onChange={(e) => updateBusiness('address', e.target.value)}
                    className="peer w-full h-11 px-4 pt-4 pb-1 bg-white border border-black/10 rounded-xl text-xs font-bold text-gray-950 focus:outline-none"
                  />
                  <label className="absolute left-4 top-1 text-[9px] text-gray-400 font-bold uppercase">Business Address</label>
                </div>
              </div>

              {/* Invoice & Client Defaults */}
              <div className="p-4 bg-gray-50 border border-black/5 rounded-2xl space-y-4">
                <h4 className="text-xs font-extrabold text-gray-950 uppercase tracking-wider">Invoice & Client Defaults</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  
                  <div className="relative">
                    <select
                      value={settings.business.defaultCurrency}
                      onChange={(e) => updateBusiness('defaultCurrency', e.target.value)}
                      className="w-full h-11 px-3 pt-4 pb-1 bg-white border border-black/10 rounded-xl text-xs font-bold text-gray-950 focus:outline-none cursor-pointer"
                    >
                      {Object.keys(CurrencyMap).map(code => (
                        <option key={code} value={code}>{code} ({CurrencyMap[code as CurrencyCode].symbol})</option>
                      ))}
                    </select>
                    <label className="absolute left-3 top-1 text-[9px] text-gray-400 font-bold uppercase">Default Currency</label>
                  </div>

                  <div className="relative">
                    <input
                      type="text"
                      value={settings.business.invoicePrefix}
                      onChange={(e) => updateBusiness('invoicePrefix', e.target.value)}
                      className="w-full h-11 px-3 pt-4 pb-1 bg-white border border-black/10 rounded-xl text-xs font-bold text-gray-950 focus:outline-none font-mono"
                    />
                    <label className="absolute left-3 top-1 text-[9px] text-gray-400 font-bold uppercase">Invoice Prefix</label>
                  </div>

                  <div className="relative">
                    <select
                      value={settings.business.defaultDueDateDays}
                      onChange={(e) => updateBusiness('defaultDueDateDays', parseInt(e.target.value))}
                      className="w-full h-11 px-3 pt-4 pb-1 bg-white border border-black/10 rounded-xl text-xs font-bold text-gray-950 focus:outline-none cursor-pointer"
                    >
                      <option value={7}>7 Days</option>
                      <option value={15}>15 Days</option>
                      <option value={30}>30 Days</option>
                    </select>
                    <label className="absolute left-3 top-1 text-[9px] text-gray-400 font-bold uppercase">Default Due Date</label>
                  </div>

                </div>
              </div>

              {/* Email Signature */}
              <div className="relative">
                <textarea
                  rows={3}
                  value={settings.business.emailSignature || ''}
                  onChange={(e) => updateBusiness('emailSignature', e.target.value)}
                  className="w-full px-4 pt-5 pb-2 bg-white border border-black/10 rounded-xl text-xs font-medium focus:outline-none resize-none"
                />
                <label className="absolute left-4 top-1 text-[9px] text-gray-400 font-bold uppercase">Reusable Email Signature</label>
              </div>
            </div>
          )}

          {/* 3. NOTIFICATIONS SECTION */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-extrabold text-gray-950">Notification Preferences</h3>
                <p className="text-xs text-gray-400 font-semibold mt-1">Select which workspace actions send real-time email alerts.</p>
              </div>

              <div className="space-y-3">
                {[
                  { key: 'clientAcceptedInvitation', title: 'Client Accepted Invitation', desc: 'Notify when a new client accepts workspace access.' },
                  { key: 'clientUploadedDocuments', title: 'Client Uploaded Documents', desc: 'Notify when required client documents are uploaded.' },
                  { key: 'deliverableApproved', title: 'Deliverable Approved', desc: 'Notify when a client approves a project deliverable.' },
                  { key: 'revisionRequested', title: 'Revision Requested', desc: 'Notify when a client submits revision feedback.' },
                  { key: 'newClientComment', title: 'New Client Comment', desc: 'Notify when client posts a comment in workspace chat.' },
                  { key: 'invoiceViewed', title: 'Invoice Viewed', desc: 'Notify when a client opens an issued invoice.' },
                  { key: 'invoicePaid', title: 'Invoice Paid', desc: 'Notify immediately when an invoice payment is settled.' },
                  { key: 'reminderFailed', title: 'Reminder Delivery Failure', desc: 'Alert if an automated reminder email fails to dispatch.' },
                ].map(item => (
                  <div key={item.key} className="flex items-center justify-between p-4 bg-white border border-black/5 rounded-2xl shadow-xs">
                    <div>
                      <h4 className="text-xs font-bold text-gray-950">{item.title}</h4>
                      <p className="text-[10px] text-gray-400 font-medium mt-0.5">{item.desc}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => updateNotificationEmail(item.key, !(settings.notifications.email as any)[item.key])}
                      className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                        (settings.notifications.email as any)[item.key] ? 'bg-gray-950' : 'bg-gray-200'
                      }`}
                    >
                      <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${
                        (settings.notifications.email as any)[item.key] ? 'right-1' : 'left-1'
                      }`} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 4. BILLING SECTION */}
          {activeTab === 'billing' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-extrabold text-gray-950">Subscription & Billing</h3>
                <p className="text-xs text-gray-400 font-semibold mt-1">Manage your FlowDesk plan and billing history.</p>
              </div>

              {/* Plan Card */}
              <div className="p-6 bg-gray-950 text-white rounded-2xl space-y-4 shadow-sm">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400">Current Plan</span>
                    <h4 className="text-xl font-black uppercase tracking-tight text-white mt-0.5">FlowDesk {settings.billing.plan}</h4>
                  </div>
                  <span className="text-xs font-bold px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded-full border border-emerald-500/30">
                    Active
                  </span>
                </div>
                <div className="flex justify-between items-end pt-2 border-t border-white/10">
                  <div>
                    <span className="text-2xl font-black font-mono">${settings.billing.priceMonthly}</span>
                    <span className="text-xs text-gray-400 font-medium"> / month</span>
                  </div>
                  <span className="text-xs text-gray-400 font-semibold">Renews on {settings.billing.renewalDate}</span>
                </div>
              </div>

              {/* Saved Card */}
              <div className="p-4 bg-white border border-black/5 rounded-2xl flex items-center justify-between shadow-xs">
                <div className="flex items-center gap-3">
                  <CreditCard className="w-5 h-5 text-gray-700" />
                  <div>
                    <h4 className="text-xs font-bold text-gray-950">{settings.billing.paymentMethod.cardBrand} ending in {settings.billing.paymentMethod.last4}</h4>
                    <p className="text-[10px] text-gray-400 font-medium">Expires {settings.billing.paymentMethod.expiry}</p>
                  </div>
                </div>
                <button onClick={() => addToast('Payment gateway portal active', 'success')} className="text-xs font-bold text-indigo-600 hover:text-indigo-800 cursor-pointer">
                  Update Card
                </button>
              </div>

              {/* Billing History */}
              <div className="space-y-3">
                <h4 className="text-xs font-extrabold text-gray-950 uppercase tracking-wider">Billing History</h4>
                <div className="bg-white border border-black/5 rounded-2xl overflow-hidden shadow-xs">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-gray-50 border-b border-black/5 text-[10px] uppercase font-bold text-gray-400">
                      <tr>
                        <th className="py-3 px-4">Invoice #</th>
                        <th className="py-3 px-4">Date</th>
                        <th className="py-3 px-4">Amount</th>
                        <th className="py-3 px-4 text-right">Receipt</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-black/5 font-semibold text-gray-800">
                      {settings.billing.history.map(item => (
                        <tr key={item.id}>
                          <td className="py-3 px-4 font-mono font-bold text-gray-950">{item.invoiceId}</td>
                          <td className="py-3 px-4 text-gray-500">{item.date}</td>
                          <td className="py-3 px-4 font-mono font-bold">${item.amount}</td>
                          <td className="py-3 px-4 text-right">
                            <button onClick={() => addToast(`Downloaded receipt for ${item.invoiceId}`, 'success')} className="text-xs text-gray-950 font-bold hover:underline flex items-center gap-1 ml-auto cursor-pointer">
                              <Download className="w-3.5 h-3.5" />
                              PDF
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* 5. WORKSPACE PREFERENCES */}
          {activeTab === 'preferences' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-extrabold text-gray-950">Workspace Preferences</h3>
                <p className="text-xs text-gray-400 font-semibold mt-1">Configure layout views, date formats, and landing pages.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                  <select
                    value={settings.preferences.defaultLandingPage}
                    onChange={(e) => updatePreferences('defaultLandingPage', e.target.value)}
                    className="w-full h-11 px-3 pt-4 pb-1 bg-white border border-black/10 rounded-xl text-xs font-bold text-gray-950 focus:outline-none cursor-pointer"
                  >
                    <option value="dashboard">Dashboard</option>
                    <option value="clients">Clients List</option>
                    <option value="projects">Projects Overview</option>
                    <option value="invoices">Invoices & Billing</option>
                  </select>
                  <label className="absolute left-3 top-1 text-[9px] text-gray-400 font-bold uppercase">Default Landing Page</label>
                </div>

                <div className="relative">
                  <select
                    value={settings.preferences.clientListView}
                    onChange={(e) => updatePreferences('clientListView', e.target.value)}
                    className="w-full h-11 px-3 pt-4 pb-1 bg-white border border-black/10 rounded-xl text-xs font-bold text-gray-950 focus:outline-none cursor-pointer"
                  >
                    <option value="table">Table View</option>
                    <option value="grid">Grid View</option>
                  </select>
                  <label className="absolute left-3 top-1 text-[9px] text-gray-400 font-bold uppercase">Client List Default View</label>
                </div>

                <div className="relative">
                  <select
                    value={settings.preferences.dateFormat}
                    onChange={(e) => updatePreferences('dateFormat', e.target.value)}
                    className="w-full h-11 px-3 pt-4 pb-1 bg-white border border-black/10 rounded-xl text-xs font-bold text-gray-950 focus:outline-none cursor-pointer"
                  >
                    <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                    <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                    <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                  </select>
                  <label className="absolute left-3 top-1 text-[9px] text-gray-400 font-bold uppercase">Date Format</label>
                </div>

                <div className="relative">
                  <select
                    value={settings.preferences.timeFormat}
                    onChange={(e) => updatePreferences('timeFormat', e.target.value)}
                    className="w-full h-11 px-3 pt-4 pb-1 bg-white border border-black/10 rounded-xl text-xs font-bold text-gray-950 focus:outline-none cursor-pointer"
                  >
                    <option value="12h">12 Hour (AM/PM)</option>
                    <option value="24h">24 Hour (00:00 - 23:59)</option>
                  </select>
                  <label className="absolute left-3 top-1 text-[9px] text-gray-400 font-bold uppercase">Time Format</label>
                </div>
              </div>
            </div>
          )}

          {/* 6. SECURITY SECTION & DANGER ZONE */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-extrabold text-gray-950">Security & Credentials</h3>
                <p className="text-xs text-gray-400 font-semibold mt-1">Manage active sessions, credentials, and data exports.</p>
              </div>

              {/* Password Change Form */}
              <form onSubmit={handlePasswordChange} className="p-4 bg-white border border-black/5 rounded-2xl space-y-3 shadow-xs">
                <h4 className="text-xs font-extrabold text-gray-950 uppercase tracking-wider">Change Password</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <input
                    type="password"
                    placeholder="Current Password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="h-10 px-3 bg-gray-50 border border-black/10 rounded-xl text-xs font-medium focus:outline-none"
                    required
                  />
                  <input
                    type="password"
                    placeholder="New Password (8+ chars)"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="h-10 px-3 bg-gray-50 border border-black/10 rounded-xl text-xs font-medium focus:outline-none"
                    required
                  />
                  <input
                    type="password"
                    placeholder="Confirm New Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="h-10 px-3 bg-gray-50 border border-black/10 rounded-xl text-xs font-medium focus:outline-none"
                    required
                  />
                </div>
                <button type="submit" className="px-4 py-2 bg-gray-950 hover:bg-gray-800 text-white font-bold text-xs rounded-full cursor-pointer">
                  Update Password
                </button>
              </form>

              {/* Active Sessions */}
              <div className="p-4 bg-white border border-black/5 rounded-2xl space-y-3 shadow-xs">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-extrabold text-gray-950 uppercase tracking-wider">Active Device Sessions</h4>
                  <button onClick={handleLogoutOtherDevices} className="text-xs text-rose-600 font-bold hover:underline cursor-pointer">
                    Logout Other Devices
                  </button>
                </div>
                <div className="space-y-2">
                  {settings.security.activeSessions.map(sess => (
                    <div key={sess.id} className="p-3 bg-gray-50 rounded-xl border border-black/5 flex justify-between items-center text-xs">
                      <div>
                        <span className="font-bold text-gray-950">{sess.device}</span>
                        {sess.isCurrent && <span className="ml-2 text-[9px] font-extrabold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">Current Session</span>}
                        <p className="text-[10px] text-gray-400 font-mono mt-0.5">{sess.userAgent} • {sess.ip}</p>
                      </div>
                      <span className="text-[10px] text-gray-400 font-semibold">{sess.lastActive}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Export Data & 2FA Badge */}
              <div className="p-4 bg-white border border-black/5 rounded-2xl flex items-center justify-between shadow-xs">
                <div>
                  <h4 className="text-xs font-bold text-gray-950">Export Workspace Account Data</h4>
                  <p className="text-[10px] text-gray-400 font-medium">Download a complete JSON export of your profile, settings, and business preferences.</p>
                </div>
                <button onClick={() => exportUserData(settings)} className="px-4 py-2 border border-black/10 hover:bg-gray-50 text-gray-950 font-bold text-xs rounded-full flex items-center gap-1.5 cursor-pointer">
                  <Download className="w-3.5 h-3.5" />
                  Export Data
                </button>
              </div>

              {/* Danger Zone */}
              <div className="p-4 border border-rose-200 bg-rose-50/40 rounded-2xl space-y-3">
                <h4 className="text-xs font-extrabold text-rose-950 uppercase tracking-wider flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  Danger Zone
                </h4>
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="text-xs font-bold text-rose-900">Delete Account & Data</h5>
                    <p className="text-[10px] text-rose-700 font-medium">Permanently delete your freelancer account and all associated workspace records.</p>
                  </div>
                  <button onClick={() => setShowDeleteModal(true)} className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-full cursor-pointer">
                    Delete Account
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Sticky Save Bar */}
      <AnimatePresence>
        {isDirty && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 inset-x-6 max-w-xl mx-auto z-40 bg-gray-950 text-white p-3 px-5 rounded-full shadow-2xl flex items-center justify-between border border-white/10"
          >
            <span className="text-xs font-bold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              Unsaved changes detected in Settings
            </span>
            <button
              onClick={() => handleSave()}
              disabled={saving}
              className="px-4 py-1.5 bg-white hover:bg-gray-100 text-gray-950 font-extrabold text-xs rounded-full cursor-pointer transition-all"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Account Deletion Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="relative z-10 w-full max-w-sm bg-white border border-rose-200 rounded-[28px] p-6 space-y-4 text-center">
            <Trash2 className="w-10 h-10 text-rose-600 mx-auto" />
            <div>
              <h3 className="text-base font-extrabold text-gray-950">Delete Account Permanently?</h3>
              <p className="text-xs text-gray-500 mt-1">This action cannot be undone. All workspace projects, invoices, and deliverables will be removed.</p>
            </div>
            <div className="flex gap-2 pt-2">
              <button onClick={() => setShowDeleteModal(false)} className="flex-1 py-2.5 border border-black/10 font-bold text-xs rounded-full">
                Cancel
              </button>
              <button onClick={() => { addToast('Account deletion request initiated', 'warning'); setShowDeleteModal(false); }} className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-full">
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
