"use client";
import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/components/AppContext';
import { UserPlus, FolderPlus, Receipt, FileUp, FileText, Plus } from 'lucide-react';
import { motion } from 'motion/react';

interface QuickActionsMenuProps {
  onClose: () => void;
}

export function QuickActionsMenu({ onClose }: QuickActionsMenuProps) {
  const router = useRouter();
  const { setCreateClientOpen, setCreateProjectOpen, setCreateInvoiceOpen } = useApp();
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const menuRef = useRef<HTMLDivElement>(null);

  const menuItems = [
    {
      id: 'new-client',
      label: 'New Client',
      icon: UserPlus,
      action: () => {
        setCreateClientOpen(true);
        router.push('/freelancer/clients');
        onClose();
      },
    },
    {
      id: 'new-project',
      label: 'New Project',
      icon: FolderPlus,
      action: () => {
        setCreateProjectOpen(true);
        router.push('/freelancer/projects');
        onClose();
      },
    },
    {
      id: 'create-invoice',
      label: 'Create Invoice',
      icon: Receipt,
      action: () => {
        setCreateInvoiceOpen(true);
        router.push('/freelancer/invoices');
        onClose();
      },
    },
    {
      id: 'upload-deliverable',
      label: 'Upload Deliverable',
      icon: FileUp,
      action: () => {
        router.push('/freelancer/clients');
        onClose();
      },
    },
    {
      id: 'request-documents',
      label: 'Request Documents',
      icon: FileText,
      action: () => {
        router.push('/freelancer/clients');
        onClose();
      },
    },
    {
      id: 'divider',
      isDivider: true,
    },
    {
      id: 'add-note',
      label: 'Add Note (Future)',
      icon: Plus,
      disabled: true,
      action: () => {},
    },
  ];

  const clickableItems = menuItems.filter(item => !item.isDivider && !item.disabled);

  // Keyboard navigation: Arrow keys navigate, Enter selects, Escape closes
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % clickableItems.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + clickableItems.length) % clickableItems.length);
      } else if (e.key === 'Enter' && selectedIndex >= 0 && selectedIndex < clickableItems.length) {
        e.preventDefault();
        const target = clickableItems[selectedIndex];
        if (target && target.action) {
          target.action();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIndex, clickableItems, onClose]);

  return (
    <motion.div
      ref={menuRef}
      initial={{ opacity: 0, y: -4, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -4, scale: 0.96 }}
      transition={{ duration: 0.15, ease: 'easeOut' }}
      className="bg-white rounded-xl shadow-lg border border-gray-100 py-1.5 w-56 select-none overflow-hidden"
    >
      {menuItems.map((item, idx) => {
        if (item.isDivider) {
          return <div key="divider" className="h-px bg-gray-100 my-1" />;
        }

        const Icon = item.icon!;
        const clickableIndex = clickableItems.findIndex(ci => ci.id === item.id);
        const isHighlighted = selectedIndex === clickableIndex && !item.disabled;

        if (item.disabled) {
          return (
            <div
              key={item.id}
              className="px-4 py-2 text-sm text-gray-350 flex items-center cursor-not-allowed opacity-60"
            >
              <Icon size={16} className="text-gray-300 mr-3 shrink-0" />
              <span>{item.label}</span>
            </div>
          );
        }

        return (
          <button
            key={item.id}
            type="button"
            onClick={item.action}
            onMouseEnter={() => setSelectedIndex(clickableIndex)}
            className={`w-full text-left px-4 py-2 text-sm text-gray-700 flex items-center transition-colors cursor-pointer ${
              isHighlighted ? 'bg-gray-100 text-gray-900 font-medium' : 'hover:bg-gray-50'
            }`}
          >
            <Icon size={16} className="text-gray-400 mr-3 shrink-0" />
            <span>{item.label}</span>
          </button>
        );
      })}
    </motion.div>
  );
}
