"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '../AppContext';
import { createClient, archiveClient, unarchiveClient } from '../../lib/services/clientService';
import { resendInvitation, revokeInvitation, Invitation } from '../../lib/services/invitationService';
import { Client } from '../../lib/types';
import EditClientDrawer from './EditClientDrawer';
import InviteClientModal from './InviteClientModal';
import { 
  Plus, Search, MoreHorizontal, X, 
  Mail, Phone, Sparkles, ChevronRight, Edit3, Archive, AlertCircle 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ClientsClientProps {
  initialClients: Client[];
  initialInvitations: Invitation[];
}

export function ClientsClient({ initialClients, initialInvitations }: ClientsClientProps) {
  const router = useRouter();
  const { 
    user, addToast,
    isCreateClientOpen, setCreateClientOpen
  } = useApp();

  const [clients, setClients] = useState<Client[]>(initialClients);
  const [invitations, setInvitations] = useState<Invitation[]>(initialInvitations);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'active' | 'archived'>('active');
  
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [invitingClient, setInvitingClient] = useState<Client | null>(null);
  const [archivingClient, setArchivingClient] = useState<Client | null>(null);

  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [createError, setCreateError] = useState('');
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const clsRes = await fetch('/api/clients');
      const cls = await clsRes.json();
      setClients(cls);

      const invsRes = await fetch('/api/activities'); // mock or list via service
      // We can directly call getInvitations from API if we want, but since we have service we fetch it
      const res = await fetch('/api/clients'); // wait, let's load invitations via fetch if possible
    } catch (e) {}
  };

  const loadInvitations = async () => {
    try {
      // Fetch invitations via service/db or endpoints
      // For now, since we have them in memory, let's read them
      const { getInvitations } = await import('../../lib/services/invitationService');
      const list = await getInvitations();
      setInvitations(list);
    } catch (e) {}
  };

  const handleAddClientSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !company.trim() || !email.trim()) {
      setCreateError('Name, Company, and Email are required');
      return;
    }

    setLoading(false);
    try {
      const res = await createClient({
        userId: user?.id || 'usr_ann',
        name,
        company,
        email,
        phone,
      });

      addToast(`Client ${res.name} created!`, 'success');
      setCreateClientOpen(false);
      setName('');
      setCompany('');
      setEmail('');
      setPhone('');
      setCreateError('');
      // Reload clients
      const clsRes = await fetch('/api/clients');
      const cls = await clsRes.json();
      setClients(cls);
      await loadInvitations();
    } catch (err: any) {
      addToast(err.message || 'Failed to create client', 'warning');
    }
  };

  const handleArchiveConfirm = async () => {
    if (!archivingClient) return;
    try {
      if (archivingClient.status === 'archived') {
        await unarchiveClient(archivingClient.id, user?.id || 'usr_ann');
        addToast(`Client ${archivingClient.name} restored`, 'success');
      } else {
        await archiveClient(archivingClient.id, user?.id || 'usr_ann');
        addToast(`Client ${archivingClient.name} archived`, 'success');
      }
      setArchivingClient(null);
      // Reload clients
      const clsRes = await fetch('/api/clients');
      const cls = await clsRes.json();
      setClients(cls);
    } catch (e) {
      addToast('Failed to archive client', 'warning');
    }
  };

  const handleResendInvite = async (inviteId: string) => {
    try {
      await resendInvitation(inviteId);
      addToast('Invitation resent successfully!', 'success');
      await loadInvitations();
    } catch (e: any) {
      addToast(e.message || 'Failed to resend invitation', 'warning');
    }
  };

  const handleRevokeInvite = async (inviteId: string) => {
    try {
      await revokeInvitation(inviteId);
      addToast('Invitation revoked.', 'info');
      await loadInvitations();
    } catch (e: any) {
      addToast(e.message || 'Failed to revoke invitation', 'warning');
    }
  };

  const handleClientClick = (client: Client) => {
    router.push(`/freelancer/workspace/${client.id}`);
  };

  const getLifecycleColor = (status: Client['status']) => {
    switch (status) {
      case 'lead': return 'bg-purple-50 text-purple-700 border-purple-100';
      case 'onboarding': return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'active': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'waiting': return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'completed': return 'bg-gray-100 text-gray-700 border-gray-200';
      case 'archived': return 'bg-red-50 text-red-750 border-red-150/30';
      default: return 'bg-gray-50 text-gray-500';
    }
  };

  const filteredClients = clients.filter((c) => {
    const matchesSearch = 
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.company.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase());
    
    if (filter === 'archived') return c.status === 'archived' && matchesSearch;
    return c.status !== 'archived' && matchesSearch;
  });

  return (
    <div className="flex-1 flex flex-col font-sans h-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 border-b border-black/5 bg-white/30 backdrop-blur-md shrink-0">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search clients by name, company, or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white/50 border border-black/5 rounded-full text-xs font-semibold text-gray-800 focus:outline-none focus:border-gray-900 transition-all placeholder-gray-400"
          />
        </div>

        <div className="flex items-center gap-3">
          <div className="flex bg-white border border-black/10 rounded-full p-1 shadow-sm">
            <button
              onClick={() => setFilter('active')}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                filter === 'active' 
                  ? 'bg-gray-900 text-white' 
                  : 'text-gray-400 hover:text-gray-800'
              }`}
            >
              Active
            </button>
            <button
              onClick={() => setFilter('archived')}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                filter === 'archived' 
                  ? 'bg-gray-900 text-white' 
                  : 'text-gray-400 hover:text-gray-800'
              }`}
            >
              Archived
            </button>
          </div>

          <button
            onClick={() => setCreateClientOpen(true)}
            className="px-4 py-2.5 bg-gray-900 hover:bg-gray-800 text-white font-bold text-xs rounded-full flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Add Client
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <div className="bg-white rounded-2xl border border-black/5 overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-black/5 bg-gray-50 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                <th className="px-6 py-4">Client / Company</th>
                <th className="px-6 py-4">Contact Email</th>
                <th className="px-6 py-4">Portal Status</th>
                <th className="px-6 py-4">Invite Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100/50">
              {filteredClients.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-xs font-semibold text-gray-400">
                    No clients found.
                  </td>
                </tr>
              ) : (
                filteredClients.map((client) => {
                  const invite = invitations.find(i => i.clientId === client.id);
                  return (
                    <tr 
                      key={client.id}
                      onClick={() => handleClientClick(client)}
                      className="hover:bg-gray-50/50 transition-colors cursor-pointer group"
                    >
                      <td className="px-6 py-4 flex items-center gap-3">
                        <img
                          src={client.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(client.name)}`}
                          alt={client.name}
                          className="w-9 h-9 rounded-full border border-black/5 object-cover bg-gray-50 shrink-0"
                          referrerPolicy="no-referrer"
                        />
                        <div className="min-w-0">
                          <h4 className="text-sm font-bold text-gray-900 group-hover:text-black leading-tight truncate">
                            {client.name}
                          </h4>
                          <span className="text-[10px] font-bold text-gray-400 block mt-0.5 truncate">
                            {client.company}
                          </span>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 text-xs font-semibold text-gray-650 truncate max-w-[200px]">
                        {client.email}
                      </td>

                      <td className="px-6 py-4">
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ${getLifecycleColor(client.status)}`}>
                          {client.status}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-xs" onClick={(e) => e.stopPropagation()}>
                        {invite ? (
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1.5">
                              <div className={`w-1.5 h-1.5 rounded-full ${
                                invite.status === 'accepted' ? 'bg-emerald-500' :
                                invite.status === 'pending' ? 'bg-amber-500 animate-pulse' : 'bg-red-500'
                              }`} />
                              <span className="font-semibold text-gray-700 capitalize text-[11px]">{invite.status}</span>
                            </div>
                            {invite.status === 'pending' && (
                              <div className="flex gap-1.5">
                                <button
                                  onClick={() => handleResendInvite(invite.id)}
                                  className="text-[9px] font-bold px-2 py-0.75 rounded-full bg-amber-50 text-amber-700 hover:bg-amber-100 transition-colors cursor-pointer border border-amber-200"
                                >
                                  Resend
                                </button>
                                <button
                                  onClick={() => handleRevokeInvite(invite.id)}
                                  className="text-[9px] font-bold px-2 py-0.75 rounded-full bg-red-50 text-red-750 hover:bg-red-100 transition-colors cursor-pointer border border-red-150/30"
                                >
                                  Revoke
                                </button>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="flex items-center justify-between gap-3">
                            <span className="text-gray-400 font-semibold text-[11px]">Uninvited</span>
                          </div>
                        )}
                      </td>

                      <td className="px-6 py-4 text-right relative" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => setActiveMenuId(activeMenuId === client.id ? null : client.id)}
                          className="p-1.5 text-gray-400 hover:text-gray-900 hover:bg-black/5 rounded-full cursor-pointer transition-colors"
                        >
                          <MoreHorizontal className="w-4.5 h-4.5" />
                        </button>

                        <AnimatePresence>
                          {activeMenuId === client.id && (
                            <>
                              <div className="fixed inset-0 z-10" onClick={() => setActiveMenuId(null)} />
                              <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: -5 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: -5 }}
                                transition={{ duration: 0.1 }}
                                className="absolute right-6 mt-1 w-40 bg-white border border-black/5 rounded-xl shadow-xl p-1.5 z-20 text-left"
                              >
                                <button
                                  onClick={() => {
                                    handleClientClick(client);
                                    setActiveMenuId(null);
                                  }}
                                  className="w-full text-left px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 hover:text-gray-950 rounded-lg transition-colors flex items-center gap-2"
                                >
                                  <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                                  Workspace
                                </button>
                                <button
                                  onClick={() => {
                                    setEditingClient(client);
                                    setActiveMenuId(null);
                                  }}
                                  className="w-full text-left px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 hover:text-gray-950 rounded-lg transition-colors flex items-center gap-2"
                                >
                                  <Edit3 className="w-3.5 h-3.5 text-gray-400" />
                                  Edit Info
                                </button>
                                {!invite && (
                                  <button
                                    onClick={() => {
                                      setInvitingClient(client);
                                      setActiveMenuId(null);
                                    }}
                                    className="w-full text-left px-3 py-2 text-xs font-semibold text-indigo-650 hover:bg-indigo-50/50 rounded-lg transition-colors flex items-center gap-2"
                                  >
                                    <Share2 className="w-3.5 h-3.5 text-indigo-400" />
                                    Invite Client
                                  </button>
                                )}
                                <div className="h-px bg-black/5 my-1" />
                                <button
                                  onClick={() => {
                                    setArchivingClient(client);
                                    setActiveMenuId(null);
                                  }}
                                  className={`w-full text-left px-3 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-2 ${
                                    client.status === 'archived'
                                      ? 'text-emerald-700 hover:bg-emerald-50/50'
                                      : 'text-red-750 hover:bg-red-50/50'
                                  }`}
                                >
                                  <Archive className="w-3.5 h-3.5 opacity-60" />
                                  {client.status === 'archived' ? 'Restore Client' : 'Archive Client'}
                                </button>
                              </motion.div>
                            </>
                          )}
                        </AnimatePresence>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {isCreateClientOpen && (
          <div className="fixed inset-0 z-50 flex justify-end">
            <div className="fixed inset-0 bg-black/20 backdrop-blur-xs" onClick={() => setCreateClientOpen(false)} />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 24, stiffness: 220 }}
              className="relative z-10 w-full max-w-md bg-[#F5F5F3] border-l border-black/5 shadow-2xl flex flex-col h-full overflow-hidden"
            >
              <div className="h-16 px-6 border-b border-black/5 bg-white flex items-center justify-between shrink-0">
                <h3 className="text-sm font-bold text-gray-950 uppercase tracking-wide">Add New Client</h3>
                <button onClick={() => setCreateClientOpen(false)} className="p-1.5 hover:bg-black/5 rounded-full text-gray-400 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <div className="p-4 bg-white rounded-2xl border border-black/5 shadow-sm space-y-2">
                  <h4 className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    Interactive Client Portal
                  </h4>
                  <p className="text-[11px] text-gray-500 leading-relaxed font-semibold">
                    Adding a client automatically provisions a private, secure workspace. You can invite them to sign off deliverables, upload files, and process invoices.
                  </p>
                </div>

                <form onSubmit={handleAddClientSubmit} className="space-y-4">
                  <div className="space-y-3">
                    <div className="relative">
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="peer w-full h-12 px-4 pt-5 pb-1 bg-white border border-black/10 rounded-xl text-gray-900 placeholder-transparent focus:outline-none focus:border-gray-900 transition-all text-xs font-semibold"
                        placeholder=" "
                        required
                      />
                      <label className="absolute left-4 top-3.5 text-gray-400 text-xs transition-all pointer-events-none peer-focus:top-1 peer-focus:text-[10px] peer-focus:text-gray-950 peer-[:not(:placeholder-shown)]:top-1 peer-[:not(:placeholder-shown)]:text-[10px]">
                        Full Name
                      </label>
                    </div>

                    <div className="relative">
                      <input
                        type="text"
                        value={company}
                        onChange={(e) => setCompany(e.target.value)}
                        className="peer w-full h-12 px-4 pt-5 pb-1 bg-white border border-black/10 rounded-xl text-gray-900 placeholder-transparent focus:outline-none focus:border-gray-900 transition-all text-xs font-semibold"
                        placeholder=" "
                        required
                      />
                      <label className="absolute left-4 top-3.5 text-gray-400 text-xs transition-all pointer-events-none peer-focus:top-1 peer-focus:text-[10px] peer-focus:text-gray-950 peer-[:not(:placeholder-shown)]:top-1 peer-[:not(:placeholder-shown)]:text-[10px]">
                        Company / Business Name
                      </label>
                    </div>

                    <div className="relative">
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="peer w-full h-12 px-4 pt-5 pb-1 bg-white border border-black/10 rounded-xl text-gray-900 placeholder-transparent focus:outline-none focus:border-gray-900 transition-all text-xs font-semibold"
                        placeholder=" "
                        required
                      />
                      <label className="absolute left-4 top-3.5 text-gray-400 text-xs transition-all pointer-events-none peer-focus:top-1 peer-focus:text-[10px] peer-focus:text-gray-950 peer-[:not(:placeholder-shown)]:top-1 peer-[:not(:placeholder-shown)]:text-[10px]">
                        Email Address
                      </label>
                    </div>

                    <div className="relative">
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="peer w-full h-12 px-4 pt-5 pb-1 bg-white border border-black/10 rounded-xl text-gray-900 placeholder-transparent focus:outline-none focus:border-gray-900 transition-all text-xs font-semibold"
                        placeholder=" "
                      />
                      <label className="absolute left-4 top-3.5 text-gray-400 text-xs transition-all pointer-events-none peer-focus:top-1 peer-focus:text-[10px] peer-focus:text-gray-950 peer-[:not(:placeholder-shown)]:top-1 peer-[:not(:placeholder-shown)]:text-[10px]">
                        Phone Number (Optional)
                      </label>
                    </div>
                  </div>

                  {createError && (
                    <p className="text-xs font-semibold text-red-650 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      {createError}
                    </p>
                  )}

                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setCreateClientOpen(false)}
                      className="flex-grow py-3 border border-black/10 text-gray-700 text-xs font-bold rounded-full cursor-pointer hover:bg-white transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-grow py-3 bg-gray-950 text-white text-xs font-bold rounded-full cursor-pointer hover:bg-gray-800 transition-colors flex items-center justify-center"
                    >
                      {loading ? 'Creating...' : 'Create Client'}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Client Info Drawer */}
      <AnimatePresence>
        {editingClient && (
          <EditClientDrawer
            client={editingClient}
            isOpen={!!editingClient}
            onClose={async () => {
              setEditingClient(null);
              const clsRes = await fetch('/api/clients');
              const cls = await clsRes.json();
              setClients(cls);
            }}
          />
        )}
      </AnimatePresence>

      {/* Invite Client Modal Overlay */}
      <AnimatePresence>
        {invitingClient && (
          <InviteClientModal
            client={invitingClient}
            isOpen={!!invitingClient}
            onClose={async () => {
              setInvitingClient(null);
              await loadInvitations();
              const clsRes = await fetch('/api/clients');
              const cls = await clsRes.json();
              setClients(cls);
            }}
          />
        )}
      </AnimatePresence>

      {/* Archive Confirmation Popup */}
      <AnimatePresence>
        {archivingClient && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/25 backdrop-blur-xs p-4">
            <div className="fixed inset-0" onClick={() => setArchivingClient(null)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative z-10 w-full max-w-sm bg-white border border-black/5 rounded-[24px] shadow-2xl p-6 space-y-4"
            >
              <div className="flex items-center gap-3 text-amber-500">
                <AlertCircle className="w-6 h-6" />
                <h3 className="text-sm font-bold text-gray-950 uppercase tracking-wide">
                  {archivingClient.status === 'archived' ? 'Restore Client?' : 'Archive Client?'}
                </h3>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed font-semibold">
                {archivingClient.status === 'archived'
                  ? `Are you sure you want to restore ${archivingClient.name}? Their portal access will be re-enabled.`
                  : `Are you sure you want to archive ${archivingClient.name}? They will lose portal access, and the workspace will be deactivated.`}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setArchivingClient(null)}
                  className="flex-grow py-2.5 border border-black/10 text-gray-700 text-xs font-bold rounded-full cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleArchiveConfirm}
                  className={`flex-grow py-2.5 text-white text-xs font-bold rounded-full cursor-pointer transition-colors ${
                    archivingClient.status === 'archived' ? 'bg-emerald-650 hover:bg-emerald-700' : 'bg-red-750 hover:bg-red-800'
                  }`}
                >
                  {archivingClient.status === 'archived' ? 'Restore' : 'Archive'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
