"use client";
import React, { useState } from 'react';
import { useApp } from '../AppContext';
import { createInvitation } from '../../lib/services/invitationService';
import { Client } from '../../lib/types';
import { X, Mail, Sparkles, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';

interface InviteClientModalProps {
  client: Client;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function InviteClientModal({ client, isOpen, onClose, onSuccess }: InviteClientModalProps) {
  const { addToast } = useApp();
  const [email, setEmail] = useState(client.email);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      addToast('Please enter a valid email address', 'warning');
      return;
    }

    setLoading(true);
    try {
      await createInvitation(client.id, email);
      addToast(`Invitation sent to ${email}`, 'success');
      onSuccess?.();
      onClose();
    } catch (err: any) {
      addToast(err.message || 'Failed to send invitation', 'warning');
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
        className="relative z-10 w-full max-w-md bg-white border border-black/5 rounded-[24px] shadow-2xl p-6 space-y-6"
      >
        <div className="flex items-center justify-between border-b border-black/5 pb-4">
          <div className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-gray-900" />
            <h3 className="text-lg font-bold text-gray-900">Invite Client</h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1 hover:bg-gray-50 rounded-full text-gray-400 hover:text-gray-900 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email Input */}
          <div className="relative">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="peer w-full h-12 px-4 pt-5 pb-1 bg-white/10 border border-black/10 rounded-xl text-gray-900 placeholder-transparent focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900/20 transition-all text-sm"
              placeholder=" "
              required
            />
            <label className="absolute left-4 top-3.5 text-gray-500 text-sm transition-all pointer-events-none peer-focus:top-1 peer-focus:text-xs peer-focus:text-gray-950 peer-[:not(:placeholder-shown)]:top-1 peer-[:not(:placeholder-shown)]:text-xs">
              Client Email Address
            </label>
          </div>

          {/* Custom Message */}
          <div className="relative">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              className="peer w-full px-4 pt-5 pb-2 bg-white/10 border border-black/10 rounded-xl text-gray-900 placeholder-transparent focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900/20 transition-all text-sm resize-none"
              placeholder=" "
            />
            <label className="absolute left-4 top-3 text-gray-500 text-sm transition-all pointer-events-none peer-focus:top-1 peer-focus:text-xs peer-focus:text-gray-950 peer-[:not(:placeholder-shown)]:top-1 peer-[:not(:placeholder-shown)]:text-xs">
              Personal Message (Optional)
            </label>
          </div>

          <div className="bg-gray-50 border border-black/5 rounded-xl p-3 text-[11px] text-gray-500 leading-normal">
            💡 This will generate a unique client portal onboarding invitation link and update their workspace status.
          </div>

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
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Send Invitation'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
