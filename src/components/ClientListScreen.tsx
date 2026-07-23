import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from './AppContext';
import { createClient } from '../lib/services/clientService';
import { 
  Plus, Search, MoreHorizontal, MessageSquare, 
  Trash2, X, Briefcase, Mail, Phone, Building, 
  Sparkles, Check, ChevronRight 
} from 'lucide-react';

export default function ClientListScreen() {
  const { clients, refreshClients, setActiveClientId, setScreen, addToast } = useApp();
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAddClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !company || !email) {
      addToast('Please fill in Name, Company, and Email', 'warning');
      return;
    }

    setLoading(true);
    try {
      const res = await createClient({
        userId: 'usr_ann', // default logged in freelancer
        name,
        company,
        email,
        phone,
      });

      addToast(`Client ${res.name} created successfully!`, 'success');
      setShowAddModal(false);
      setName('');
      setCompany('');
      setEmail('');
      setPhone('');
      await refreshClients();
    } catch (err: any) {
      addToast(err.message || 'Failed to create client', 'warning');
    } finally {
      setLoading(false);
    }
  };

  const handleClientClick = (clientId: string) => {
    setActiveClientId(clientId);
    setScreen?.('workspace');
    addToast('Opening Workspace Overview', 'info');
  };

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.company.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-white/10">
      {/* Header Bar */}
      <header className="h-16 border-b border-gray-200/50 px-8 flex items-center justify-between bg-white/40 backdrop-blur-md">
        <div className="flex items-center gap-4 w-96">
          <Search className="w-4.5 h-4.5 text-gray-400 shrink-0" />
          <input
            type="text"
            placeholder="Search clients..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-sm font-medium text-gray-800 bg-transparent outline-none placeholder-gray-400"
          />
        </div>

        <div className="flex items-center gap-4">
          <div className="text-xs font-semibold text-gray-400">
            23° 14:20
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white font-semibold text-xs rounded-full flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
          >
            <Plus className="w-4 h-4" />
            New Client
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-8 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">Clients</h1>
            <p className="text-sm text-gray-500 font-medium">Manage and explore active client portal lifecycles.</p>
          </div>
        </div>

        {/* Clients Table Card */}
        <div className="glass-card rounded-xl overflow-hidden border border-white/60">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 bg-white/40 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                <th className="px-6 py-4">Client / Company</th>
                <th className="px-6 py-4">Contact Email</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Projects</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100/50">
              {filteredClients.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-sm font-medium text-gray-400">
                    No clients found. Click "New Client" to create one.
                  </td>
                </tr>
              ) : (
                filteredClients.map((client, idx) => (
                  <tr 
                    key={client.id}
                    onClick={() => handleClientClick(client.id)}
                    className="hover:bg-white/40 transition-colors cursor-pointer group"
                  >
                    <td className="px-6 py-4.5 flex items-center gap-3">
                      <img
                        src={client.avatar}
                        alt={client.name}
                        className="w-10 h-10 rounded-full border border-gray-100 object-cover bg-gray-100"
                        referrerPolicy="no-referrer"
                      />
                      <div>
                        <h4 className="text-sm font-bold text-gray-900 group-hover:text-black leading-tight">
                          {client.name}
                        </h4>
                        <span className="text-[11px] font-semibold text-gray-400">
                          {client.company}
                        </span>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4.5 text-sm font-medium text-gray-600">
                      {client.email}
                    </td>

                    <td className="px-6 py-4.5">
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                        client.status === 'active' 
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/50' 
                          : client.status === 'onboarding'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200/50'
                          : 'bg-gray-100 text-gray-600 border border-gray-200'
                      }`}>
                        {client.status}
                      </span>
                    </td>

                    <td className="px-6 py-4.5 text-sm font-medium text-gray-500">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-gray-800">
                          {client.id === 'cl_david' ? '1' : client.id === 'cl_marta' ? '1' : '0'}
                        </span>
                        Active
                      </div>
                    </td>

                    <td className="px-6 py-4.5 text-right">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleClientClick(client.id);
                        }}
                        className="p-1.5 text-gray-400 hover:text-gray-900 hover:bg-black/5 rounded-full cursor-pointer"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Slide-over Drawer / Modal for adding client */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/20 backdrop-blur-xs">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="w-full max-w-md h-full bg-white shadow-2xl p-8 flex flex-col justify-between border-l border-gray-200"
            >
              <div>
                <div className="flex items-center justify-between pb-6 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-gray-900 animate-spin" />
                    <h2 className="text-lg font-bold text-gray-900">Add New Client</h2>
                  </div>
                  <button 
                    onClick={() => setShowAddModal(false)}
                    className="p-1.5 hover:bg-gray-100 rounded-full cursor-pointer text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleAddClient} className="space-y-4 mt-6">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-600 uppercase tracking-wider mb-2">Client Name</label>
                    <div className="relative">
                      <Plus className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Elena Rodriguez"
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 hover:bg-gray-100/70 focus:bg-white rounded-lg border border-gray-200 outline-none text-sm font-medium transition-all"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-600 uppercase tracking-wider mb-2">Company / Corporate Identity</label>
                    <div className="relative">
                      <Building className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        value={company}
                        onChange={(e) => setCompany(e.target.value)}
                        placeholder="Lumina Creative"
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 hover:bg-gray-100/70 focus:bg-white rounded-lg border border-gray-200 outline-none text-sm font-medium transition-all"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-600 uppercase tracking-wider mb-2">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="elena@lumina.design"
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 hover:bg-gray-100/70 focus:bg-white rounded-lg border border-gray-200 outline-none text-sm font-medium transition-all"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-600 uppercase tracking-wider mb-2">Phone (Optional)</label>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+1 (555) 019-2831"
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 hover:bg-gray-100/70 focus:bg-white rounded-lg border border-gray-200 outline-none text-sm font-medium transition-all"
                      />
                    </div>
                  </div>
                </form>
              </div>

              <div className="border-t border-gray-100 pt-6 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-3 border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold text-xs rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddClient}
                  disabled={loading}
                  className="flex-1 py-3 bg-gray-900 hover:bg-gray-800 text-white font-semibold text-xs rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    'Create Client'
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
