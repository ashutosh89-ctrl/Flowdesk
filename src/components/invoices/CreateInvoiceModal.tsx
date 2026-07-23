"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { useApp } from '../AppContext';
import { createInvoice } from '../../lib/services/invoiceService';
import { readAll } from '../../lib/services/dataService';
import { Project, InvoiceItem } from '../../lib/types';
import { X, Plus, Trash2, CreditCard, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';

interface AmountInputProps {
  value: number;
  onChange: (val: number) => void;
  placeholder?: string;
  className?: string;
}

function AmountInput({ value, onChange, placeholder = '0', className = '' }: AmountInputProps) {
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
  const [projectId, setProjectId] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [items, setItems] = useState<InvoiceItem[]>([
    { description: '', quantity: 1, rate: 0, amount: 0 }
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Totals
  const [subtotal, setSubtotal] = useState(0);
  const [taxAmount, setTaxAmount] = useState(0);
  const [total, setTotal] = useState(0);

  // Generate invoice number and load projects
  useEffect(() => {
    if (isOpen) {
      const loadProjects = async () => {
        try {
          const projs = await readAll<Project>('projects');
          setProjects(projs);
          
          // Auto-generate invoice number
          const rand = Math.floor(1000 + Math.random() * 9000);
          setInvoiceNumber(`INV-${rand}`);
        } catch (e) {}
      };
      loadProjects();
    }
  }, [isOpen]);

  // Recalculate totals whenever items change
  useEffect(() => {
    let sub = 0;
    items.forEach(item => {
      sub += (item.quantity || 0) * (item.rate || 0);
    });
    
    const tax = Math.round(sub * 0.18); // 18% GST
    setSubtotal(sub);
    setTaxAmount(tax);
    setTotal(sub + tax);
  }, [items]);

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
      setError('Please select a due date');
      return;
    }
    const hasEmptyItem = items.some(item => !item.description.trim() || item.rate <= 0);
    if (hasEmptyItem) {
      setError('Please complete all line items with descriptive content and rates > 0');
      return;
    }

    setLoading(true);
    try {
      await createInvoice({
        projectId,
        invoiceNumber,
        items,
        dueDate
      });
      addToast(`Invoice ${invoiceNumber} created!`, 'success');
      if (onSuccess) onSuccess();
      onClose();
      // Reset form
      setProjectId('');
      setDueDate('');
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/25 backdrop-blur-xs p-4">
      {/* Backdrop */}
      <div className="fixed inset-0" onClick={onClose} />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative z-10 w-full max-w-2xl bg-white border border-black/5 rounded-[24px] shadow-2xl p-6 space-y-6 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between border-b border-black/5 pb-4">
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-gray-900" />
            <h3 className="text-lg font-bold text-gray-900">Create New Invoice</h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1 hover:bg-gray-50 rounded-full text-gray-400 hover:text-gray-950 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Invoice Number (ReadOnly) */}
            <div className="relative">
              <input
                type="text"
                value={invoiceNumber}
                readOnly
                className="w-full h-12 px-4 pt-5 pb-1 bg-gray-50 border border-black/10 rounded-xl text-gray-900 focus:outline-none text-sm font-bold"
              />
              <label className="absolute left-4 top-1 text-[10px] text-gray-400 font-bold uppercase">
                Invoice Number
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
                className="peer w-full h-12 px-4 pt-5 pb-1 bg-white/10 border border-black/10 rounded-xl text-gray-900 focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900/20 transition-all text-sm appearance-none"
                required
              >
                <option value="" disabled hidden>Select Linked Project</option>
                {projects.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
              <label className="absolute left-4 top-1 text-[10px] text-gray-550 transition-all pointer-events-none">
                Linked Project
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Due Date Picker */}
            <div className="relative md:col-span-2">
              <input
                type="date"
                value={dueDate}
                onChange={(e) => {
                  setDueDate(e.target.value);
                  if (error) setError('');
                }}
                className="peer w-full h-12 px-4 pt-5 pb-1 bg-white/10 border border-black/10 rounded-xl text-gray-900 focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900/20 transition-all text-sm"
                required
              />
              <label className="absolute left-4 top-1 text-[10px] text-gray-550 transition-all pointer-events-none">
                Payment Due Date
              </label>
            </div>
          </div>

          {/* Line Items */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <h4 className="text-xs font-bold uppercase text-gray-400 tracking-wider">Line Items</h4>
              <button
                type="button"
                onClick={handleAddItem}
                className="text-xs font-bold text-gray-900 hover:text-black flex items-center gap-1 cursor-pointer"
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
                      placeholder="UI Design Work"
                      className="w-full h-9 px-3 bg-white border border-black/10 rounded-lg text-xs font-medium focus:outline-none focus:border-gray-900"
                      required
                    />
                  </div>

                  {/* Quantity */}
                  <div className="col-span-2 relative">
                    <AmountInput
                      value={item.quantity}
                      onChange={(val) => handleItemChange(index, 'quantity', val)}
                      placeholder="Qty"
                      className="w-full h-9 px-3 bg-white border border-black/10 rounded-lg text-xs font-semibold focus:outline-none focus:border-gray-900 text-center"
                    />
                  </div>

                  {/* Rate */}
                  <div className="col-span-2 relative">
                    <AmountInput
                      value={item.rate}
                      onChange={(val) => handleItemChange(index, 'rate', val)}
                      placeholder="Rate"
                      className="w-full h-9 px-3 bg-white border border-black/10 rounded-lg text-xs font-semibold focus:outline-none focus:border-gray-900 text-right"
                    />
                  </div>

                  {/* Total amount for row */}
                  <div className="col-span-1 text-right text-xs font-bold text-gray-700">
                    ₹{((item.quantity || 0) * (item.rate || 0)).toLocaleString()}
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

          {/* Totals Summary */}
          <div className="border-t border-black/5 pt-4 flex justify-end">
            <div className="w-64 space-y-2 text-xs font-semibold text-gray-500">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span className="text-gray-950 font-bold">₹{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>18% GST:</span>
                <span className="text-gray-950 font-bold">₹{taxAmount.toLocaleString()}</span>
              </div>
              <div className="h-px bg-black/5 my-1" />
              <div className="flex justify-between text-sm">
                <span className="text-gray-900 font-extrabold">Total Amount:</span>
                <span className="text-gray-950 font-black">₹{total.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {error && (
            <p className="text-red-650 text-xs font-bold text-center">{error}</p>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 border border-black/10 hover:bg-gray-50 text-gray-700 font-semibold text-xs rounded-full transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 bg-gray-900 hover:bg-gray-800 text-white font-semibold text-xs rounded-full transition-colors cursor-pointer flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Issue Invoice'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
