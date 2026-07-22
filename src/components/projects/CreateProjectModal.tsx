"use client";
import React, { useState } from 'react';
import { useApp } from '../AppContext';
import { createProject } from '../../lib/services/projectService';
import { X, FolderPlus, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function CreateProjectModal({ isOpen, onClose, onSuccess }: CreateProjectModalProps) {
  const { clients, addToast } = useApp();
  
  const [name, setName] = useState('');
  const [clientId, setClientId] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Project name is required');
      return;
    }
    if (!clientId) {
      setError('Please select a client');
      return;
    }

    setLoading(true);
    try {
      await createProject({
        clientId,
        name,
        description,
        dueDate: dueDate || undefined
      });
      addToast(`Project "${name}" created successfully!`, 'success');
      if (onSuccess) onSuccess();
      onClose();
      // Reset form
      setName('');
      setClientId('');
      setDueDate('');
      setDescription('');
      setError('');
    } catch (err: any) {
      addToast(err.message || 'Failed to create project', 'warning');
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
            <FolderPlus className="w-5 h-5 text-gray-900" />
            <h3 className="text-lg font-bold text-gray-900">Create New Project</h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1 hover:bg-gray-50 rounded-full text-gray-400 hover:text-gray-950 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Project Name Input */}
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
              Project Name
            </label>
          </div>

          {/* Client Selection Dropdown */}
          <div className="relative">
            <select
              value={clientId}
              onChange={(e) => {
                setClientId(e.target.value);
                if (error) setError('');
              }}
              className="peer w-full h-12 px-4 pt-5 pb-1 bg-white/10 border border-black/10 rounded-xl text-gray-900 focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900/20 transition-all text-sm appearance-none"
              required
            >
              <option value="" disabled hidden>Select Client</option>
              {clients.filter(c => c.status !== 'archived').map(c => (
                <option key={c.id} value={c.id}>{c.name} ({c.company})</option>
              ))}
            </select>
            <label className="absolute left-4 top-1 text-[10px] text-gray-500 transition-all pointer-events-none">
              Client
            </label>
          </div>

          {/* Due Date Picker */}
          <div className="relative">
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="peer w-full h-12 px-4 pt-5 pb-1 bg-white/10 border border-black/10 rounded-xl text-gray-900 focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900/20 transition-all text-sm"
            />
            <label className="absolute left-4 top-1 text-[10px] text-gray-500 transition-all pointer-events-none">
              Due Date
            </label>
          </div>

          {/* Description Textarea */}
          <div className="relative">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="peer w-full px-4 pt-5 pb-2 bg-white/10 border border-black/10 rounded-xl text-gray-900 placeholder-transparent focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900/20 transition-all text-sm resize-none"
              placeholder=" "
            />
            <label className="absolute left-4 top-3 text-gray-500 text-sm transition-all pointer-events-none peer-focus:top-1 peer-focus:text-xs peer-focus:text-gray-950 peer-[:not(:placeholder-shown)]:top-1 peer-[:not(:placeholder-shown)]:text-xs">
              Project Description (Optional)
            </label>
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
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create Project'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
