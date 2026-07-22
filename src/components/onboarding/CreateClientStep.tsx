"use client";
import React, { useState } from 'react';
import { AlertCircle, HelpCircle } from 'lucide-react';

interface CreateClientStepProps {
  clientName: string;
  onChangeClientName: (val: string) => void;
  clientCompany: string;
  onChangeClientCompany: (val: string) => void;
  clientEmail: string;
  onChangeClientEmail: (val: string) => void;
  clientPhone: string;
  onChangeClientPhone: (val: string) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function CreateClientStep({
  clientName,
  onChangeClientName,
  clientCompany,
  onChangeClientCompany,
  clientEmail,
  onChangeClientEmail,
  clientPhone,
  onChangeClientPhone,
  onNext,
  onBack
}: CreateClientStepProps) {
  const [error, setError] = useState('');

  const validate = () => {
    if (!clientName.trim()) {
      setError('Client name is required');
      return false;
    }
    if (!clientCompany.trim()) {
      setError('Company name is required');
      return false;
    }
    if (!clientEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clientEmail)) {
      setError('Please enter a valid client email');
      return false;
    }
    setError('');
    return true;
  };

  const handleContinue = () => {
    if (validate()) {
      onNext();
    }
  };

  return (
    <div className="space-y-5">
      <div className="text-center space-y-1">
        <h3 className="text-xl font-bold text-gray-900">Add Your First Client</h3>
        <p className="text-sm text-gray-500">Every project starts with a client. Create one now.</p>
      </div>

      {/* Inline Tip */}
      <div className="flex gap-3 bg-gray-55/40 border border-black/5 rounded-2xl p-4 text-xs text-gray-600 font-medium">
        <HelpCircle className="w-4 h-4 shrink-0 text-gray-800" />
        <p>This is your first client workspace. You can invite additional clients and create extra workspaces once onboarded.</p>
      </div>

      {/* Client Name Input */}
      <div className="relative">
        <input
          type="text"
          value={clientName}
          onChange={(e) => {
            onChangeClientName(e.target.value);
            if (error) setError('');
          }}
          className="peer w-full h-12 px-4 pt-5 pb-1 bg-white/30 border border-black/10 rounded-xl text-gray-900 placeholder-transparent focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900/20 transition-all text-sm"
          placeholder=" "
        />
        <label className="absolute left-4 top-3.5 text-gray-500 text-sm transition-all pointer-events-none peer-focus:top-1 peer-focus:text-xs peer-focus:text-gray-950 peer-[:not(:placeholder-shown)]:top-1 peer-[:not(:placeholder-shown)]:text-xs">
          Client Full Name
        </label>
      </div>

      {/* Company Name Input */}
      <div className="relative">
        <input
          type="text"
          value={clientCompany}
          onChange={(e) => {
            onChangeClientCompany(e.target.value);
            if (error) setError('');
          }}
          className="peer w-full h-12 px-4 pt-5 pb-1 bg-white/30 border border-black/10 rounded-xl text-gray-900 placeholder-transparent focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900/20 transition-all text-sm"
          placeholder=" "
        />
        <label className="absolute left-4 top-3.5 text-gray-500 text-sm transition-all pointer-events-none peer-focus:top-1 peer-focus:text-xs peer-focus:text-gray-950 peer-[:not(:placeholder-shown)]:top-1 peer-[:not(:placeholder-shown)]:text-xs">
          Company Name
        </label>
      </div>

      {/* Client Email Input */}
      <div className="relative">
        <input
          type="text"
          value={clientEmail}
          onChange={(e) => {
            onChangeClientEmail(e.target.value);
            if (error) setError('');
          }}
          className="peer w-full h-12 px-4 pt-5 pb-1 bg-white/30 border border-black/10 rounded-xl text-gray-900 placeholder-transparent focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900/20 transition-all text-sm"
          placeholder=" "
        />
        <label className="absolute left-4 top-3.5 text-gray-500 text-sm transition-all pointer-events-none peer-focus:top-1 peer-focus:text-xs peer-focus:text-gray-950 peer-[:not(:placeholder-shown)]:top-1 peer-[:not(:placeholder-shown)]:text-xs">
          Client Email Address
        </label>
      </div>

      {/* Client Phone Input */}
      <div className="relative">
        <input
          type="text"
          value={clientPhone}
          onChange={(e) => {
            onChangeClientPhone(e.target.value);
            if (error) setError('');
          }}
          className="peer w-full h-12 px-4 pt-5 pb-1 bg-white/30 border border-black/10 rounded-xl text-gray-900 placeholder-transparent focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900/20 transition-all text-sm"
          placeholder=" "
        />
        <label className="absolute left-4 top-3.5 text-gray-500 text-sm transition-all pointer-events-none peer-focus:top-1 peer-focus:text-xs peer-focus:text-gray-950 peer-[:not(:placeholder-shown)]:top-1 peer-[:not(:placeholder-shown)]:text-xs">
          Client Phone (Optional)
        </label>
      </div>

      {error && (
        <p className="text-red-650 text-xs flex items-center gap-1 font-semibold justify-center">
          <AlertCircle className="w-3.5 h-3.5" />
          {error}
        </p>
      )}

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
          onClick={handleContinue}
          className="flex-1 bg-gray-900 hover:bg-gray-800 text-white rounded-full h-12 font-medium transition-colors cursor-pointer"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
