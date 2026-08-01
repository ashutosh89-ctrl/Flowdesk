'use client';

import React, { useState, useEffect } from 'react';
import { Template } from '@/lib/types';
import { getTemplates } from '@/lib/services/templateService';
import { Sparkles, FileText, ChevronDown } from 'lucide-react';

interface TemplateSelectorProps {
  type: Template['type'];
  onSelect: (content: string, template: Template) => void;
  label?: string;
}

export function TemplateSelector({ type, onSelect, label = 'Use Template' }: TemplateSelectorProps) {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    getTemplates(type).then(setTemplates);
  }, [type]);

  if (templates.length === 0) return null;

  return (
    <div className="relative inline-block text-left font-sans">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="px-3 py-1.5 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 hover:text-gray-950 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border border-black/5"
      >
        <Sparkles className="w-3.5 h-3.5 text-amber-600" />
        {label}
        <ChevronDown className="w-3 h-3 text-gray-400" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1 w-64 bg-white border border-black/10 rounded-2xl shadow-xl z-30 overflow-hidden py-1 divide-y divide-gray-100">
          <div className="px-3 py-1.5 text-[10px] font-extrabold text-gray-400 uppercase tracking-wider bg-gray-50">
            Available Templates
          </div>
          {templates.map((tmpl) => (
            <button
              key={tmpl.id}
              type="button"
              onClick={() => {
                onSelect(tmpl.content, tmpl);
                setIsOpen(false);
              }}
              className="w-full text-left px-3.5 py-2.5 hover:bg-gray-50 transition-colors flex items-center gap-2 cursor-pointer"
            >
              <FileText className="w-4 h-4 text-gray-400 shrink-0" />
              <div className="min-w-0 flex-1">
                <span className="text-xs font-bold text-gray-900 block truncate">{tmpl.name}</span>
                {tmpl.isDefault && (
                  <span className="text-[9px] font-extrabold text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded-full inline-block mt-0.5">
                    Default
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
