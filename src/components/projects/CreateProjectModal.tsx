"use client";
import React, { useState } from 'react';
import { useApp } from '../AppContext';
import { createProject } from '../../lib/services/projectService';
import { X, FolderPlus, Loader2, Plus, Trash2, CheckSquare } from 'lucide-react';
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
  const [status, setStatus] = useState('planning');
  const [milestoneInput, setMilestoneInput] = useState('');
  const [milestones, setMilestones] = useState<{ id: string; name: string; completed: boolean }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAddMilestone = () => {
    if (!milestoneInput.trim()) return;
    setMilestones(prev => [...prev, { id: `ms_${Date.now()}_${Math.random()}`, name: milestoneInput.trim(), completed: false }]);
    setMilestoneInput('');
  };

  const handleRemoveMilestone = (id: string) => {
    setMilestones(prev => prev.filter(m => m.id !== id));
  };

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
        status,
        dueDate: dueDate || undefined,
        milestones: milestones.map(m => ({ id: m.id, projectId: '', name: m.name, completed: m.completed, createdAt: new Date().toISOString() }))
      });
      addToast(`Project "${name}" created successfully!`, 'success');
      if (onSuccess) onSuccess();
      onClose();
      // Reset form
      setName('');
      setClientId('');
      setDueDate('');
      setDescription('');
      setStatus('planning');
      setMilestones([]);
      setMilestoneInput('');
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
        className="relative z-10 w-full max-w-lg bg-white border border-black/5 rounded-[24px] shadow-2xl p-6 space-y-5 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between border-b border-black/5 pb-4">
          <div className="flex items-center gap-2">
            <FolderPlus className="w-5 h-5 text-gray-900" />
            <h3 className="text-lg font-bold text-gray-900">Create New Project</h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1 hover:bg-gray-50 rounded-full text-gray-400 hover:text-gray-950 transition-colors cursor-pointer"
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
              className="peer w-full h-12 px-4 pt-5 pb-1 bg-white/10 border border-black/10 rounded-xl text-gray-900 placeholder-transparent focus:outline-none focus:border-gray-900 transition-all text-sm font-medium"
              placeholder=" "
              required
            />
            <label className="absolute left-4 top-3.5 text-gray-500 text-sm transition-all pointer-events-none peer-focus:top-1 peer-focus:text-xs peer-focus:text-gray-950 peer-[:not(:placeholder-shown)]:top-1 peer-[:not(:placeholder-shown)]:text-xs">
              Project Name *
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
              className="peer w-full h-12 px-4 pt-5 pb-1 bg-white/10 border border-black/10 rounded-xl text-gray-900 focus:outline-none focus:border-gray-900 transition-all text-sm font-medium cursor-pointer"
              required
            >
              <option value="" disabled hidden>Select Client</option>
              {clients.filter(c => c.status !== 'archived').map(c => (
                <option key={c.id} value={c.id}>{c.name} ({c.company})</option>
              ))}
            </select>
            <label className="absolute left-4 top-1 text-[10px] text-gray-500 transition-all pointer-events-none">
              Assigned Client *
            </label>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Status Selector */}
            <div className="relative">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full h-11 px-3 bg-white/10 border border-black/10 rounded-xl text-gray-900 text-xs font-semibold focus:outline-none focus:border-gray-900 cursor-pointer"
              >
                <option value="planning">Planning</option>
                <option value="in_progress">In Progress</option>
                <option value="review">Review</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            {/* Due Date Picker */}
            <div className="relative">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1">Due Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full h-11 px-3 bg-white/10 border border-black/10 rounded-xl text-gray-900 text-xs font-semibold focus:outline-none focus:border-gray-900"
              />
            </div>
          </div>

          {/* Description Textarea */}
          <div className="relative">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="peer w-full px-4 pt-5 pb-2 bg-white/10 border border-black/10 rounded-xl text-gray-900 placeholder-transparent focus:outline-none focus:border-gray-900 transition-all text-xs font-medium resize-none"
              placeholder=" "
            />
            <label className="absolute left-4 top-3 text-gray-500 text-xs transition-all pointer-events-none peer-focus:top-1 peer-focus:text-[10px] peer-focus:text-gray-950 peer-[:not(:placeholder-shown)]:top-1 peer-[:not(:placeholder-shown)]:text-[10px]">
              Project Scope / Description (Optional)
            </label>
          </div>

          {/* Milestones / Sub-tasks (3.2.8) */}
          <div className="space-y-2 border-t border-black/5 pt-3">
            <label className="text-xs font-bold text-gray-800 flex items-center justify-between">
              <span>Project Milestones / Sub-tasks</span>
              <span className="text-[10px] font-semibold text-gray-400">{milestones.length} added</span>
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={milestoneInput}
                onChange={(e) => setMilestoneInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddMilestone(); } }}
                placeholder="Add milestone item (e.g. Wireframes, Frontend Setup)..."
                className="flex-1 px-3.5 py-2 bg-gray-50 border border-black/10 rounded-xl text-xs font-medium focus:outline-none focus:border-gray-950"
              />
              <button
                type="button"
                onClick={handleAddMilestone}
                className="px-3.5 py-2 bg-gray-950 text-white rounded-xl text-xs font-bold hover:bg-gray-800 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Add
              </button>
            </div>

            {milestones.length > 0 && (
              <div className="space-y-1.5 max-h-36 overflow-y-auto pt-1">
                {milestones.map((ms) => (
                  <div key={ms.id} className="flex items-center justify-between p-2.5 bg-gray-50 border border-black/5 rounded-xl text-xs font-semibold text-gray-800">
                    <span className="flex items-center gap-2">
                      <CheckSquare className="w-3.5 h-3.5 text-gray-400" />
                      {ms.name}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveMilestone(ms.id)}
                      className="text-gray-400 hover:text-red-600 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {error && (
            <p className="text-red-600 text-xs font-bold text-center">{error}</p>
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
              className="flex-1 py-3 bg-gray-950 hover:bg-gray-800 text-white font-semibold text-xs rounded-full transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-2xs"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create Project'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
