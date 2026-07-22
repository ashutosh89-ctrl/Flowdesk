"use client";
import React from 'react';
import { useRouter } from 'next/navigation';
import { ActionRecommendation } from '../../lib/services/nextBestActionService';
import { useApp } from '../AppContext';
import { AlertTriangle, Clock, FileText, Upload, Calendar, Plus } from 'lucide-react';

interface NextBestActionCardProps {
  action: ActionRecommendation;
  onRefresh?: () => void;
}

export default function NextBestActionCard({ action, onRefresh }: NextBestActionCardProps) {
  const router = useRouter();
  const { addToast, setCreateProjectOpen } = useApp();

  const handleCtaClick = () => {
    if (action.cta === 'Create Project') {
      setCreateProjectOpen(true);
    } else {
      router.push(action.route);
    }
    addToast(`Navigating to: ${action.title}`, 'info');
  };

  const getPriorityStyles = () => {
    switch (action.priority) {
      case 'critical':
        return {
          border: 'border-l-4 border-l-gray-900 border-y-black/5 border-r-black/5',
          dot: 'bg-red-500 animate-pulse',
        };
      case 'high':
        return {
          border: 'border-l-4 border-l-gray-900 border-y-black/5 border-r-black/5',
          dot: 'bg-amber-500',
        };
      case 'medium':
        return {
          border: 'border border-black/5',
          dot: 'bg-blue-500',
        };
      default:
        return {
          border: 'border border-black/5 bg-gray-50/50',
          dot: 'bg-gray-300',
        };
    }
  };

  const styles = getPriorityStyles();

  const getIcon = () => {
    switch (action.icon) {
      case 'alert':
        return <AlertTriangle className="w-5 h-5 text-gray-700" />;
      case 'file':
        return <FileText className="w-5 h-5 text-gray-700" />;
      case 'clock':
        return <Clock className="w-5 h-5 text-gray-700" />;
      case 'upload':
        return <Upload className="w-5 h-5 text-gray-700" />;
      case 'calendar':
        return <Calendar className="w-5 h-5 text-gray-700" />;
      default:
        return <Plus className="w-5 h-5 text-gray-700" />;
    }
  };

  return (
    <div className={`bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden ${styles.border}`}>
      {/* Gloss Specular Highlight */}
      <div className="absolute inset-x-0 top-0 h-px bg-white/60 pointer-events-none" />
      
      <div className="flex items-start gap-4">
        {/* Priority Status Dot */}
        <div className={`w-3.5 h-3.5 rounded-full mt-1.5 shrink-0 ${styles.dot}`} />
        
        <div className="flex-1 space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
              {action.priority} Action
            </span>
          </div>
          
          <h3 className="text-base font-bold text-gray-900 leading-snug">{action.title}</h3>
          <p className="text-sm text-gray-500 font-medium leading-relaxed">{action.description}</p>
          
          <div className="pt-3 flex items-center gap-3">
            <button
              onClick={handleCtaClick}
              className="px-5 py-2.5 bg-gray-900 text-white font-semibold rounded-full text-xs hover:bg-gray-800 transition-colors shadow-sm cursor-pointer"
            >
              {action.cta}
            </button>
            <div className="p-2 bg-gray-50 rounded-full border border-black/5 shrink-0">
              {getIcon()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
