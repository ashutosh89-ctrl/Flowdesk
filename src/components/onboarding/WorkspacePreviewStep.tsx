"use client";
import React from 'react';
import { Briefcase, FolderKanban, Users } from 'lucide-react';

interface WorkspacePreviewStepProps {
  clientName: string;
  clientCompany: string;
  onFinish: () => void;
  onBack: () => void;
}

export default function WorkspacePreviewStep({
  clientName,
  clientCompany,
  onFinish,
  onBack
}: WorkspacePreviewStepProps) {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-1">
        <h3 className="text-xl font-bold text-gray-900">Your Workspace is Ready!</h3>
        <p className="text-sm text-gray-500">We've created a custom glass portal for you and your client.</p>
      </div>

      {/* Workspace Glass Card Preview */}
      <div className="bg-white/40 border border-white/50 backdrop-blur-md rounded-2xl p-6 shadow-lg space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gray-900 flex items-center justify-center text-white text-sm font-bold">
            {clientCompany.substring(0, 1).toUpperCase()}
          </div>
          <div>
            <h4 className="font-semibold text-gray-900">{clientCompany}</h4>
            <p className="text-xs text-gray-500">Primary Contact: {clientName}</p>
          </div>
          <span className="ml-auto text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-blue-50 text-blue-600 border border-blue-100 rounded-full">
            Onboarding
          </span>
        </div>

        <div className="h-px bg-black/5" />

        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="p-2 bg-white/30 rounded-xl border border-black/5">
            <Users className="w-4 h-4 mx-auto text-gray-600 mb-1" />
            <span className="block text-[10px] font-medium text-gray-400">Team Size</span>
            <span className="text-xs font-bold text-gray-800">2 Members</span>
          </div>
          <div className="p-2 bg-white/30 rounded-xl border border-black/5">
            <FolderKanban className="w-4 h-4 mx-auto text-gray-600 mb-1" />
            <span className="block text-[10px] font-medium text-gray-400">Projects</span>
            <span className="text-xs font-bold text-gray-800">0 Active</span>
          </div>
          <div className="p-2 bg-white/30 rounded-xl border border-black/5">
            <Briefcase className="w-4 h-4 mx-auto text-gray-600 mb-1" />
            <span className="block text-[10px] font-medium text-gray-400">Status</span>
            <span className="text-xs font-bold text-gray-800">Ready</span>
          </div>
        </div>

        {/* Progress Stepper Bar Placeholder */}
        <div className="space-y-1">
          <div className="flex justify-between text-[10px] font-semibold text-gray-500">
            <span>Setup Progress</span>
            <span>25%</span>
          </div>
          <div className="w-full h-1.5 bg-black/5 rounded-full overflow-hidden">
            <div className="w-[25%] h-full bg-gray-900 rounded-full" />
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 bg-white border border-black/10 hover:bg-gray-50 text-gray-800 rounded-full h-12 font-medium transition-colors cursor-pointer"
        >
          Back
        </button>
        <button
          type="button"
          onClick={onFinish}
          className="flex-1 bg-gray-900 hover:bg-gray-800 text-white rounded-full h-12 font-medium transition-colors cursor-pointer"
        >
          Get Started
        </button>
      </div>
    </div>
  );
}
