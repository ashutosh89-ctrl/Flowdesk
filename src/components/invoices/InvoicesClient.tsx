"use client";
import React, { useState, useMemo } from 'react';
import { useApp } from '../AppContext';
import { Project, Client, Invoice } from '../../lib/types';
import { getCurrencySymbol, formatCurrency } from '../../lib/utils/currency';
import CreateInvoiceModal from './CreateInvoiceModal';
import InvoiceDetailModal from './InvoiceDetailModal';
import { 
  Plus, Search, Calendar, AlertTriangle, FileText, 
  DollarSign, Clock, CheckCircle2, Eye, ShieldAlert, ArrowUpDown, Filter, ChevronLeft, ChevronRight, X 
} from 'lucide-react';

interface InvoicesClientProps {
  initialInvoices: Invoice[];
  initialProjects: Project[];
  initialClients: Client[];
}

export function InvoicesClient({ initialInvoices, initialProjects, initialClients }: InvoicesClientProps) {
  const { isCreateInvoiceOpen, setCreateInvoiceOpen } = useApp();

  const [invoices, setInvoices] = useState<Invoice[]>(Array.isArray(initialInvoices) ? initialInvoices : []);
  const [projects, setProjects] = useState<Project[]>(Array.isArray(initialProjects) ? initialProjects : []);
  const [clients, setClients] = useState<Client[]>(Array.isArray(initialClients) ? initialClients : []);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'dueDate' | 'issueDate' | 'total' | 'status'>('dueDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 9;

  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const loadData = async () => {
    try {
      const invsRes = await fetch('/api/invoices');
      const invsData = await invsRes.json();
      setInvoices(Array.isArray(invsData) ? invsData : (invsData?.invoices ?? []));

      const projsRes = await fetch('/api/projects');
      const projsData = await projsRes.json();
      setProjects(Array.isArray(projsData) ? projsData : (projsData?.projects ?? []));

      const clsRes = await fetch('/api/clients');
      const clsData = await clsRes.json();
      setClients(Array.isArray(clsData) ? clsData : (clsData?.clients ?? []));
    } catch (e) {
      setInvoices([]);
    }
  };

  const getProjectName = (projId: string) => {
    const p = (projects || []).find(pr => pr?.id === projId);
    return p ? p.name : 'Unknown Project';
  };

  const getClientName = (projId: string, clientId?: string) => {
    const cid = clientId || (projects || []).find(pr => pr?.id === projId)?.clientId;
    const c = (clients || []).find(cl => cl?.id === cid);
    return c ? `${c.name} (${c.company})` : 'Unknown Client';
  };

  // Metrics Calculations
  const metrics = useMemo(() => {
    let lifetimeRevenue = 0;
    let outstandingAmount = 0;
    let paidThisMonth = 0;
    let overdueCount = 0;
    let draftCount = 0;

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    (invoices || []).forEach(inv => {
      const isPaid = inv.paymentStatus === 'paid';
      const isDraft = inv.workflowStatus === 'draft';
      const isOverdue = !isPaid && new Date(inv.dueDate) < now;

      if (isPaid) {
        lifetimeRevenue += inv.total || 0;
        const paidDate = new Date(inv.updatedAt || inv.createdAt);
        if (paidDate.getMonth() === currentMonth && paidDate.getFullYear() === currentYear) {
          paidThisMonth += inv.total || 0;
        }
      } else if (!isDraft && inv.workflowStatus !== 'cancelled') {
        outstandingAmount += inv.total || 0;
      }

      if (isOverdue) overdueCount++;
      if (isDraft) draftCount++;
    });

    return { lifetimeRevenue, outstandingAmount, paidThisMonth, overdueCount, draftCount };
  }, [invoices]);

  // Aging calculation for unpaid invoices
  const getAgingBadge = (inv: Invoice) => {
    if (inv.paymentStatus === 'paid' || inv.workflowStatus === 'draft') return null;
    const due = new Date(inv.dueDate);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - due.getTime()) / (1000 * 3600 * 24));

    if (diffDays <= 0) return { label: 'Due Soon', color: 'bg-blue-50 text-blue-700 border-blue-200' };
    if (diffDays <= 7) return { label: '0-7 Days Overdue', color: 'bg-amber-50 text-amber-800 border-amber-200' };
    if (diffDays <= 15) return { label: '8-15 Days Overdue', color: 'bg-orange-50 text-orange-800 border-orange-200' };
    if (diffDays <= 30) return { label: '16-30 Days Overdue', color: 'bg-rose-50 text-rose-800 border-rose-200' };
    return { label: '30+ Days Overdue', color: 'bg-red-100 text-red-900 border-red-300 font-extrabold' };
  };

  // Filter & Search & Sort Logic
  const filteredInvoices = useMemo(() => {
    const safeInvoices = Array.isArray(invoices) ? invoices : [];

    return safeInvoices.filter(inv => {
      if (!inv) return false;

      // Status filter tab
      if (statusFilter === 'draft' && inv.workflowStatus !== 'draft') return false;
      if (statusFilter === 'sent' && inv.workflowStatus !== 'sent') return false;
      if (statusFilter === 'viewed' && inv.workflowStatus !== 'viewed') return false;
      if (statusFilter === 'paid' && inv.paymentStatus !== 'paid') return false;
      if (statusFilter === 'overdue' && (inv.paymentStatus === 'paid' || new Date(inv.dueDate) >= new Date())) return false;
      if (statusFilter === 'cancelled' && inv.workflowStatus !== 'cancelled') return false;

      // Search query
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      const projName = (getProjectName(inv.projectId) || '').toLowerCase();
      const clientName = (getClientName(inv.projectId, inv.clientId) || '').toLowerCase();
      const invNum = (inv.invoiceNumber || inv.number || inv.id || '').toLowerCase();
      const totalStr = (inv.total || 0).toString();

      return invNum.includes(q) || projName.includes(q) || clientName.includes(q) || totalStr.includes(q);
    }).sort((a, b) => {
      let valA: any = a[sortBy] || '';
      let valB: any = b[sortBy] || '';

      if (sortBy === 'total') {
        valA = a.total || 0;
        valB = b.total || 0;
      }

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [invoices, search, statusFilter, sortBy, sortOrder, projects, clients]);

  // Pagination
  const totalPages = Math.ceil(filteredInvoices.length / pageSize) || 1;
  const paginatedInvoices = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredInvoices.slice(start, start + pageSize);
  }, [filteredInvoices, currentPage]);

  return (
    <div className="flex-1 flex flex-col font-sans h-full overflow-hidden bg-[#F5F5F3] select-none">
      
      {/* 1. Dashboard Metrics Bar */}
      <div className="p-6 border-b border-black/5 bg-white/40 shrink-0">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <div className="p-4 bg-white border border-black/5 rounded-2xl shadow-xs">                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-500 block">Lifetime Revenue</span>
            <span className="text-xl font-black text-gray-950 mt-1 block">
              ₹{metrics.lifetimeRevenue.toLocaleString()}
            </span>
          </div>

          <div className="p-4 bg-white border border-black/5 rounded-2xl shadow-xs">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-700 block">Outstanding Owed</span>
            <span className="text-xl font-black text-amber-950 mt-1 block">
              ₹{metrics.outstandingAmount.toLocaleString()}
            </span>
          </div>

          <div className="p-4 bg-white border border-black/5 rounded-2xl shadow-xs">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 block">Paid This Month</span>
            <span className="text-xl font-black text-emerald-950 mt-1 block">
              ₹{metrics.paidThisMonth.toLocaleString()}
            </span>
          </div>

          <div className="p-4 bg-white border border-black/5 rounded-2xl shadow-xs">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-rose-700 block">Overdue Invoices</span>
            <span className="text-xl font-black text-rose-950 mt-1 block">
              {metrics.overdueCount}
            </span>
          </div>

          <div className="p-4 bg-white border border-black/5 rounded-2xl shadow-xs">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400 block">Draft Invoices</span>
            <span className="text-xl font-black text-gray-800 mt-1 block">
              {metrics.draftCount}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Controls Header: Search, Filters & Create Button */}
      <div className="px-6 py-4 border-b border-black/5 bg-white/20 flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
        
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by Invoice #, client, project, amount..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            className="w-full pl-10 pr-10 py-2 bg-white border border-black/10 rounded-full text-xs font-semibold text-gray-900 focus:outline-none focus:border-gray-950 transition-all placeholder-gray-400"
          />
          {search && (
            <button
              onClick={() => { setSearch(''); setCurrentPage(1); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter Tabs & Sorting */}
        <div className="flex flex-wrap items-center gap-2">
          {['all', 'draft', 'sent', 'viewed', 'paid', 'overdue'].map(tab => (
            <button
              key={tab}
              onClick={() => { setStatusFilter(tab); setCurrentPage(1); }}
              className={`px-3 py-1.5 rounded-full text-xs font-bold capitalize transition-all cursor-pointer ${
                statusFilter === tab
                  ? 'bg-gray-950 text-white shadow-xs'
                  : 'bg-white/60 text-gray-600 border border-black/5 hover:bg-white hover:text-gray-950'
              }`}
            >
              {tab}
            </button>
          ))}

          <div className="h-6 w-px bg-black/10 mx-1 hidden sm:block" />

          {/* Sort Dropdown */}
          <select
            value={sortBy}
            onChange={(e: any) => setSortBy(e.target.value)}
            className="px-3 py-1.5 bg-white border border-black/10 rounded-full text-xs font-bold text-gray-800 focus:outline-none cursor-pointer"
          >
            <option value="dueDate">Due Date</option>
            <option value="issueDate">Issue Date</option>
            <option value="total">Amount</option>
          </select>

          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="p-2 bg-white border border-black/10 rounded-full hover:bg-gray-50 transition-colors text-gray-700 cursor-pointer"
            title="Toggle sort direction"
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setCreateInvoiceOpen(true)}
            className="px-4 py-2 bg-gray-950 hover:bg-gray-800 text-white font-bold text-xs rounded-full flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs ml-auto"
          >
            <Plus className="w-4 h-4" />
            Create Invoice
          </button>
        </div>
      </div>

      {/* 3. Invoices Cards Grid View */}
      <div className="flex-1 overflow-y-auto p-6">
        {paginatedInvoices.length === 0 ? (
          <div className="py-20 text-center">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-sm font-extrabold text-gray-950">No Invoices Found</h3>
            <p className="text-xs text-gray-500 font-semibold mt-1">Create your first invoice or try adjusting your search filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {paginatedInvoices.map((inv) => {
              const isPaid = inv.paymentStatus === 'paid';
              const isDraft = inv.workflowStatus === 'draft';
              const aging = getAgingBadge(inv);
              const symbol = getCurrencySymbol(inv.currency);

              return (
                <div 
                  key={inv.id}
                  onClick={() => { setSelectedInvoice(inv); setIsDetailOpen(true); }}
                  className="glass-card p-5 rounded-2xl border border-black/5 hover:border-black/20 bg-white/80 hover:bg-white transition-all flex flex-col justify-between cursor-pointer shadow-xs hover:shadow-md group"
                >
                  <div>
                    {/* Top Row: Invoice Number & Badges */}
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-mono font-bold text-gray-950 bg-gray-100 px-2.5 py-1 rounded-md">
                        #{inv.invoiceNumber || inv.number || inv.id}
                      </span>

                      <div className="flex items-center gap-1.5">
                        {aging && (
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${aging.color}`}>
                            {aging.label}
                          </span>
                        )}
                        <span className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full ${
                          isPaid ? 'bg-emerald-100 text-emerald-800' :
                          inv.workflowStatus === 'viewed' ? 'bg-indigo-100 text-indigo-800' :
                          inv.workflowStatus === 'sent' ? 'bg-blue-100 text-blue-800' : 'bg-gray-200 text-gray-800'
                        }`}>
                          {isPaid ? 'Paid' : inv.workflowStatus}
                        </span>
                      </div>
                    </div>

                    {/* Title & Project */}
                    <h3 className="text-sm font-extrabold text-gray-950 group-hover:text-black line-clamp-1 mb-0.5">
                      {inv.title || getProjectName(inv.projectId)}
                    </h3>
                    <p                    className="text-xs text-gray-500 font-semibold mb-4 truncate">
                      {getClientName(inv.projectId, inv.clientId)}
                    </p>

                    {/* Amount & Currency */}
                    <div className="text-2xl font-black text-gray-950 flex items-center gap-0.5 mb-4 font-mono">
                      <span>{symbol}</span>
                      <span>{(inv.total || 0).toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Footer Meta */}
                  <div className="flex items-center justify-between pt-3 border-t border-black/5 text-[11px] font-semibold text-gray-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-gray-400" />
                      Due {inv.dueDate}
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye className="w-3 h-3 text-gray-400" />
                      {inv.viewedAt ? 'Viewed' : 'Not Viewed'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 4. Pagination Footer */}
      {totalPages > 1 && (
        <div className="h-14 px-6 border-t border-black/5 bg-white/40 flex items-center justify-between text-xs font-bold text-gray-600 shrink-0">
          <span>Showing page {currentPage} of {totalPages}</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="p-2 border border-black/10 rounded-full hover:bg-white disabled:opacity-30 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="p-2 border border-black/10 rounded-full hover:bg-white disabled:opacity-30 cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Create Modal */}
      <CreateInvoiceModal 
        isOpen={isCreateInvoiceOpen}
        onClose={() => setCreateInvoiceOpen(false)}
        onSuccess={loadData}
      />

      {/* Detail & Activity Timeline Modal */}
      <InvoiceDetailModal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        invoice={selectedInvoice}
        projects={projects}
        clients={clients}
        onRefresh={loadData}
      />
    </div>
  );
}
