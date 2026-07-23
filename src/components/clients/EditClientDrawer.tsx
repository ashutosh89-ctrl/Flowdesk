"use client";
import React, { useState, useEffect } from 'react';
import { useApp } from '../AppContext';
import { updateClient } from '../../lib/services/clientService';
import { Client } from '../../lib/types';
import { X, Sparkles, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';

interface EditClientDrawerProps {
  client: Client;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function EditClientDrawer({ client, isOpen, onClose, onSuccess }: EditClientDrawerProps) {
  const { addToast } = useApp();
  const [name, setName] = useState(client.name);
  const [company, setCompany] = useState(client.company);
  const [email, setEmail] = useState(client.email);
  const [phone, setPhone] = useState(client.phone || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setName(client.name);
    setCompany(client.company);
    setEmail(client.email);
    setPhone(client.phone || '');
  }, [client]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !company.trim() || !email.trim()) {
      setError('Please fill in Name, Company, and Email');
      return;
    }

    setLoading(true);
    try {
      await updateClient(client.id, {
        name,
        company,
        email,
        phone
      });
      addToast('Client updated successfully!', 'success');
      onSuccess?.();
      onClose();
    } catch (err: any) {
      addToast(err.message || 'Failed to update client', 'warning');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/25 backdrop-blur-xs">
      {/* Backdrop Closer */}
      <div className="fixed inset-0 z-45" onClick={onClose} />

      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 220 }}
        className="relative z-50 w-full max-w-md h-full bg-white shadow-2xl p-8 flex flex-col justify-between border-l border-black/5"
      >
        <div>
          <div className="flex items-center justify-between pb-6 border-b border-black/5">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-gray-900" />
              <h2 className="text-lg font-bold text-gray-900">Edit Client</h2>
            </div>
            <button 
              onClick={onClose}
              className="p-1.5 hover:bg-gray-50 rounded-full cursor-pointer text-gray-400 hover:text-gray-900 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 mt-8">
            {/* Name Input with Floating Label */}
            <div className="relative">
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (error) setError('');
                }}
                className="peer w-full h-12 px-4 pt-5 pb-1 bg-white/10 border border-black/10 rounded-xl text-gray-900 placeholder-transparent focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900/20 transition-all text-sm"
                placeholder=" "
                required
              />
              <label className="absolute left-4 top-3.5 text-gray-500 text-sm transition-all pointer-events-none peer-focus:top-1 peer-focus:text-xs peer-focus:text-gray-950 peer-[:not(:placeholder-shown)]:top-1 peer-[:not(:placeholder-shown)]:text-xs">
                Client Full Name
              </label>
            </div>

            {/* Company Input with Floating Label */}
            <div className="relative">
              <input
                type="text"
                value={company}
                onChange={(e) => {
                  setCompany(e.target.value);
                  if (error) setError('');
                }}
                className="peer w-full h-12 px-4 pt-5 pb-1 bg-white/10 border border-black/10 rounded-xl text-gray-900 placeholder-transparent focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900/20 transition-all text-sm"
                placeholder=" "
                required
              />
              <label className="absolute left-4 top-3.5 text-gray-500 text-sm transition-all pointer-events-none peer-focus:top-1 peer-focus:text-xs peer-focus:text-gray-950 peer-[:not(:placeholder-shown)]:top-1 peer-[:not(:placeholder-shown)]:text-xs">
                Company Name
              </label>
            </div>

            {/* Email Input with Floating Label */}
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError('');
                }}
                className="peer w-full h-12 px-4 pt-5 pb-1 bg-white/10 border border-black/10 rounded-xl text-gray-900 placeholder-transparent focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900/20 transition-all text-sm"
                placeholder=" "
                required
              />
              <label className="absolute left-4 top-3.5 text-gray-500 text-sm transition-all pointer-events-none peer-focus:top-1 peer-focus:text-xs peer-focus:text-gray-950 peer-[:not(:placeholder-shown)]:top-1 peer-[:not(:placeholder-shown)]:text-xs">
                Email Address
              </label>
            </div>

            {/* Phone Input with Floating Label */}
            <div className="relative">
              <input
                type="text"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  if (error) setError('');
                }}
                className="peer w-full h-12 px-4 pt-5 pb-1 bg-white/10 border border-black/10 rounded-xl text-gray-900 placeholder-transparent focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900/20 transition-all text-sm"
                placeholder=" "
              />
              <label className="absolute left-4 top-3.5 text-gray-500 text-sm transition-all pointer-events-none peer-focus:top-1 peer-focus:text-xs peer-focus:text-gray-950 peer-[:not(:placeholder-shown)]:top-1 peer-[:not(:placeholder-shown)]:text-xs">
                Phone Number (Optional)
              </label>
            </div>

            {error && (
              <p className="text-red-650 text-xs font-bold text-center">{error}</p>
            )}
          </form>
        </div>

        <div className="border-t border-black/5 pt-6 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 border border-black/10 hover:bg-gray-50 text-gray-700 font-semibold text-xs rounded-full transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 py-3 bg-gray-900 hover:bg-gray-800 text-white font-semibold text-xs rounded-full transition-colors cursor-pointer flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Update Client'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
