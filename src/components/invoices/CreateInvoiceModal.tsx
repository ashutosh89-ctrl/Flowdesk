"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { useApp } from '../AppContext';
import { createInvoice, generateNextInvoiceNumber } from '../../lib/services/invoiceService';
import { readAll } from '../../lib/services/dataService';
import { Project, Client, InvoiceItem, CurrencyCode } from '../../lib/types';
import { CurrencyMap, getCurrencySymbol } from '../../lib/utils/currency';
import { X, Plus, Trash2, CreditCard, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';

interface AmountInputProps {
  value: number;
  onChange: (val: number) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

function AmountInput({ value, onChange, placeholder = '0', className = '', disabled = false }: AmountInputProps) {
  const [displayValue, setDisplayValue] = useState(value ? value.toString() : '');

  useEffect(() => {
    setDisplayValue(value ? value.toString() : '');
  }, [value]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    if (raw === '' || /^\d*\.?\d{0,2}$/.test(raw)) {
      setDisplayValue(raw);
      const num = raw === '' ? 0 : parseFloat(raw);
      onChange(isNaN(num) ? 0 : num);
    }
  }, [onChange]);

  const handleBlur = useCallback(() => {
    if (displayValue === '' || displayValue === '.') {
      setDisplayValue('0');
      onChange(0);
    } else {
      const num = parseFloat(displayValue);
      setDisplayValue(isNaN(num) ? '0' : num.toString());
    }
  }, [displayValue, onChange]);

  return (
    <input
      type="text"
      inputMode="decimal"
      value={displayValue}
      onChange={handleChange}
      onBlur={handleBlur}
      placeholder={placeholder}
      className={className}
      disabled={disabled}
      required
    />
  );
}

interface CreateInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function CreateInvoiceModal({ isOpen, onClose, onSuccess }: CreateInvoiceModalProps) {
  const { addToast } = useApp();
  
  const [projects, setProjects] = useState<Project[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [projectId, setProjectId] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [currency, setCurrency] = useState<CurrencyCode>('INR');
  
  const [taxName, setTaxName] = useState('GST');
  const [taxRate, setTaxRate] = useState(18);
  const [discount, setDiscount] = useState(0);
  const [notes, setNotes] = useState('Thank you for your business! Please process payment by the due date.');

  const [items, setItems] = useState<InvoiceItem[]>([
    { description: '', quantity: 1, rate: 0, amount: 0 }
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Summary Totals
  const [subtotal, setSubtotal] = useState(0);
  const [taxAmount, setTaxAmount] = useState(0);
  const [total, setTotal] = useState(0);

  const currencySymbol = getCurrencySymbol(currency);

  useEffect(() => {
    if (isOpen) {
      const loadInitialData = async () => {
        try {
          const [projs, cls, num] = await Promise.all([
            readAll<Project>('projects'),
            readAll<Client>('clients'),
            generateNextInvoiceNumber()
          ]);
          setProjects(projs);
          setClients(cls);
          setInvoiceNumber(num);

          // Default due date: 14 days from today
          const d = new Date();
          d.setDate(d.getDate() + 14);
          setDueDate(d.toISOString().split('T')[0]);
        } catch (e) {}
      };
      loadInitialData();
    }
  }, [isOpen]);

  useEffect(() => {
    let sub = 0;
    items.forEach(item => {
      sub += (item.quantity || 0) * (item.rate || 0);
    });
    
    const disc = Math.max(0, discount || 0);
    const taxable = Math.max(0, sub - disc);
    const tax = Math.round(((taxable * (taxRate || 0)) / 100) * 100) / 100;
    
    setSubtotal(sub);
    setTaxAmount(tax);
    setTotal(Math.round((taxable + tax) * 100) / 100);
  }, [items, discount, taxRate]);

  const handleAddItem = () => {
    setItems([...items, { description: '', quantity: 1, rate: 0, amount: 0 }]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length === 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: keyof InvoiceItem, value: any) => {
    const newItems = [...items];
    if (field === 'quantity') {
      newItems[index].quantity = Math.max(0, parseFloat(value) || 0);
    } else if (field === 'rate') {
      newItems[index].rate = Math.max(0, parseFloat(value) || 0);
    } else {
      newItems[index].description = value;
    }
    setItems(newItems);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectId) {
      setError('Please select a project');
      return;
    }
    if (!dueDate) {
      setError('Please select a payment due date');
      return;
    }
    const hasEmptyItem = items.some(item => !item.description.trim() || item.rate <= 0);
    if (hasEmptyItem) {
      setError('Please complete all line items with descriptive text and rate > 0');
      return;
    }

    setLoading(true);
    try {
      await createInvoice({
        projectId,
        invoiceNumber,
        title,
        items,
        currency,
        taxName,
        taxRate,
        discount,
        notes,
        dueDate
      });
      addToast(`Invoice ${invoiceNumber} created as Draft!`, 'success');
      if (onSuccess) onSuccess();
      onClose();
      // Reset form
      setProjectId('');
      setTitle('');
      setDiscount(0);
      setItems([{ description: '', quantity: 1, rate: 0, amount: 0 }]);
      setError('');
    } catch (err: any) {
      addToast(err.message || 'Failed to create invoice', 'warning');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="fixed inset-0" onClick={onClose} />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative z-10 w-full max-w-3xl bg-white border border-black/10 rounded-[28px] shadow-2xl p-6 space-y-6 max-h-[92vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between border-b border-black/5 pb-4">
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-gray-950" />
            <h3 className="text-lg font-extrabold text-gray-950">Create New Invoice</h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-950 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Invoice Number */}
            <div className="relative md:col-span-1">
              <input
                type="text"
                value={invoiceNumber}
                readOnly
                className="w-full h-12 px-4 pt-5 pb-1 bg-gray-50 border border-black/10 rounded-xl text-gray-900 focus:outline-none text-xs font-mono font-bold"
              />
              <label className="absolute left-4 top-1 text-[10px] text-gray-400 font-bold uppercase">
                Invoice Number
              </label>
            </div>

            {/* Currency Selector */}
            <div className="relative md:col-span-1">
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
                className="peer w-full h-12 px-4 pt-5 pb-1 bg-white border border-black/10 rounded-xl text-gray-950 font-bold focus:outline-none focus:border-gray-950 text-xs appearance-none cursor-pointer"
              >
                {Object.values(CurrencyMap).map(c => (
                  <option key={c.code} value={c.code}>{c.label}</option>
                ))}
              </select>
              <label className="absolute left-4 top-1 text-[10px] text-gray-400 font-bold uppercase pointer-events-none">
                Currency
              </label>
            </div>

            {/* Project Selector */}
            <div className="relative md:col-span-2">
              <select
                value={projectId}
                onChange={(e) => {
                  setProjectId(e.target.value);
                  if (error) setError('');
                }}
                className="peer w-full h-12 px-4 pt-5 pb-1 bg-white border border-black/10 rounded-xl text-gray-950 font-bold focus:outline-none focus:border-gray-950 text-xs appearance-none cursor-pointer"
                required
              >
                <option value="" disabled hidden>Select Linked Project</option>
                {projects.map(p => {
                  const client = clients.find(c => c.id === p.clientId);
                  return (
                    <option key={p.id} value={p.id}>{p.name} ({client?.name || 'Client'})</option>
                  );
                })}
              </select>
              <label className="absolute left-4 top-1 text-[10px] text-gray-400 font-bold uppercase pointer-events-none">
                Linked Project
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Invoice Title */}
            <div className="relative md:col-span-2">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Website Redesign & Brand Assets Phase 1"
                className="peer w-full h-12 px-4 pt-5 pb-1 bg-white border border-black/10 rounded-xl text-gray-950 focus:outline-none focus:border-gray-950 text-xs font-semibold"
              />
              <label className="absolute left-4 top-1 text-[10px] text-gray-400 font-bold uppercase">
                Invoice Subject / Title
              </label>
            </div>

            {/* Due Date */}
            <div className="relative md:col-span-1">
              <input
                type="date"
                value={dueDate}
                onChange={(e) => {
                  setDueDate(e.target.value);
                  if (error) setError('');
                }}
                className="peer w-full h-12 px-4 pt-5 pb-1 bg-white border border-black/10 rounded-xl text-gray-950 focus:outline-none focus:border-gray-950 text-xs font-semibold"
                required
              />
              <label className="absolute left-4 top-1 text-[10px] text-gray-400 font-bold uppercase pointer-events-none">
                Payment Due Date
              </label>
            </div>
          </div>

          {/* Line Items */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <h4 className="text-xs font-extrabold uppercase text-gray-400 tracking-wider">Line Items</h4>
              <button
                type="button"
                onClick={handleAddItem}
                className="text-xs font-extrabold text-gray-950 hover:text-black flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Item
              </button>
            </div>

            <div className="space-y-3">
              {items.map((item, index) => (
                <div key={index} className="grid grid-cols-12 gap-3 items-center bg-gray-50 border border-black/5 p-3 rounded-2xl relative">
                  {/* Description */}
                  <div className="col-span-6 relative">
                    <input
                      type="text"
                      value={item.description}
                      onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                      placeholder="Item description (e.g. Design Systems Implementation)"
                      className="w-full h-9 px-3 bg-white border border-black/10 rounded-lg text-xs font-medium focus:outline-none focus:border-gray-950"
                      required
                    />
                  </div>

                  {/* Quantity */}
                  <div className="col-span-2 relative">
                    <AmountInput
                      value={item.quantity}
                      onChange={(val) => handleItemChange(index, 'quantity', val)}
                      placeholder="Qty"
                      className="w-full h-9 px-3 bg-white border border-black/10 rounded-lg text-xs font-semibold focus:outline-none focus:border-gray-950 text-center font-mono"
                    />
                  </div>

                  {/* Unit Rate */}
                  <div className="col-span-2 relative">
                    <AmountInput
                      value={item.rate}
                      onChange={(val) => handleItemChange(index, 'rate', val)}
                      placeholder="Rate"
                      className="w-full h-9 px-3 bg-white border border-black/10 rounded-lg text-xs font-semibold focus:outline-none focus:border-gray-950 text-right font-mono"
                    />
                  </div>

                  {/* Total amount for row */}
                  <div className="col-span-1 text-right text-xs font-bold font-mono text-gray-950">
                    {currencySymbol}{((item.quantity || 0) * (item.rate || 0)).toLocaleString()}
                  </div>

                  {/* Remove Button */}
                  <div className="col-span-1 text-center">
                    <button
                      type="button"
                      disabled={items.length === 1}
                      onClick={() => handleRemoveItem(index)}
                      className="p-1 hover:bg-red-50 text-gray-400 hover:text-red-600 rounded transition-colors disabled:opacity-30 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tax, Discount & Summary Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-black/5 pt-4">
            
            {/* Custom Tax Config & Discount */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="relative">
                  <input
                    type="text"
                    value={taxName}
                    onChange={(e) => setTaxName(e.target.value)}
                    placeholder="GST, VAT, Sales Tax"
                    className="w-full h-10 px-3 pt-4 pb-1 bg-white border border-black/10 rounded-xl text-xs font-bold focus:outline-none"
                  />
                  <label className="absolute left-3 top-1 text-[9px] text-gray-400 font-bold uppercase">Tax Name</label>
                </div>
                <div className="relative">
                  <AmountInput
                    value={taxRate}
                    onChange={(val) => setTaxRate(val)}
                    placeholder="18"
                    className="w-full h-10 px-3 pt-4 pb-1 bg-white border border-black/10 rounded-xl text-xs font-mono font-bold focus:outline-none"
                  />
                  <label className="absolute left-3 top-1 text-[9px] text-gray-400 font-bold uppercase">Tax Rate (%)</label>
                </div>
              </div>

              <div className="relative">
                <AmountInput
                  value={discount}
                  onChange={(val) => setDiscount(val)}
                  placeholder="0"
                  className="w-full h-10 px-3 pt-4 pb-1 bg-white border border-black/10 rounded-xl text-xs font-mono font-bold focus:outline-none"
                />
                <label className="absolute left-3 top-1 text-[9px] text-gray-400 font-bold uppercase">Discount ({currencySymbol})</label>
              </div>

              <div className="relative">
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 pt-4 pb-1 bg-white border border-black/10 rounded-xl text-xs font-medium focus:outline-none resize-none"
                />
                <label className="absolute left-3 top-1 text-[9px] text-gray-400 font-bold uppercase">Payment Instructions / Notes</label>
              </div>
            </div>

            {/* Calculations Summary */}
            <div className="space-y-2 text-xs font-semibold text-gray-500 self-end p-4 bg-gray-50 border border-black/5 rounded-2xl">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span className="text-gray-950 font-bold font-mono">{currencySymbol}{subtotal.toLocaleString()}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-emerald-700">
                  <span>Discount:</span>
                  <span className="font-bold font-mono">-{currencySymbol}{discount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>{taxName || 'GST'} ({taxRate}%):</span>
                <span className="text-gray-950 font-bold font-mono">{currencySymbol}{taxAmount.toLocaleString()}</span>
              </div>
              <div className="h-px bg-black/10 my-1" />
              <div className="flex justify-between text-sm">
                <span className="text-gray-950 font-extrabold">Grand Total:</span>
                <span className="text-gray-950 font-black font-mono text-base">{currencySymbol}{total.toLocaleString()}</span>
              </div>
            </div>

          </div>

          {error && (
            <p className="text-rose-600 text-xs font-bold text-center">{error}</p>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 border border-black/10 hover:bg-gray-50 text-gray-700 font-bold text-xs rounded-full transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 bg-gray-950 hover:bg-gray-800 text-white font-bold text-xs rounded-full transition-colors cursor-pointer flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save as Draft'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
