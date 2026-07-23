"use client";
import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { User, Client, Invoice } from '../lib/types';
import { getClients } from '../lib/services/clientService';
import { ToastMessage } from './Toast';

interface AppContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  activeClientId: string | null;
  setActiveClientId: (id: string | null) => void;
  activeInvoiceId: string | null;
  setActiveInvoiceId: (id: string | null) => void;
  clients: Client[];
  refreshClients: () => Promise<void>;
  toasts: ToastMessage[];
  addToast: (message: string, type?: 'success' | 'warning' | 'info') => void;
  removeToast: (id: string) => void;
  signOut: () => Promise<void>;
  themeAccent: string;
  setThemeAccent: (color: string) => void;
  
  // Drawer/Modal States
  isCreateClientOpen: boolean;
  setCreateClientOpen: (val: boolean) => void;
  isCreateProjectOpen: boolean;
  setCreateProjectOpen: (val: boolean) => void;
  isCreateInvoiceOpen: boolean;
  setCreateInvoiceOpen: (val: boolean) => void;
  isInviteClientOpen: boolean;
  setInviteClientOpen: (val: boolean) => void;
  inviteClientId: string | null;
  setInviteClientId: (id: string | null) => void;
  setScreen?: (screen: string) => void;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUserState] = useState<User | null>(null);
  const [activeClientId, setActiveClientId] = useState<string | null>(null);
  const [activeInvoiceId, setActiveInvoiceId] = useState<string | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [themeAccent, setThemeAccent] = useState<string>('#1a1a19');
  
  // Drawer/Modal States
  const [isCreateClientOpen, setCreateClientOpen] = useState(false);
  const [isCreateProjectOpen, setCreateProjectOpen] = useState(false);
  const [isCreateInvoiceOpen, setCreateInvoiceOpen] = useState(false);
  const [isInviteClientOpen, setInviteClientOpen] = useState(false);
  const [inviteClientId, setInviteClientId] = useState<string | null>(null);

  const addToast = (message: string, type: 'success' | 'warning' | 'info' = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => removeToast(id), 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const setUser = (newUser: User | null) => {
    setUserState(newUser);
  };

  const refreshClients = async () => {
    if (user && user.role === 'freelancer') {
      try {
        const list = await getClients(user.id);
        setClients(list);
      } catch (e) {
        console.error('Error fetching clients:', e);
      }
    }
  };

  const signOut = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    setActiveClientId(null);
    setActiveInvoiceId(null);
    addToast('Logged out successfully', 'info');
    router.push('/login');
  };

  // Load user from server-side session cookie via API
  useEffect(() => {
    async function initAuth() {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          setUserState(data.user);
        }
      } catch {
        setUserState(null);
      }
    }
    initAuth();
  }, []);

  // Update client list when user changes
  useEffect(() => {
    if (user && user.role === 'freelancer') {
      refreshClients();
    }
  }, [user]);

  const value = useMemo(() => ({
    user,
    setUser,
    activeClientId,
    setActiveClientId,
    activeInvoiceId,
    setActiveInvoiceId,
    clients,
    refreshClients,
    toasts,
    addToast,
    removeToast,
    signOut,
    themeAccent,
    setThemeAccent,
    isCreateClientOpen,
    setCreateClientOpen,
    isCreateProjectOpen,
    setCreateProjectOpen,
    isCreateInvoiceOpen,
    setCreateInvoiceOpen,
    isInviteClientOpen,
    setInviteClientOpen,
    inviteClientId,
    setInviteClientId,
    setScreen: () => {}
  }), [
    user,
    activeClientId,
    activeInvoiceId,
    clients,
    toasts,
    themeAccent,
    isCreateClientOpen,
    isCreateProjectOpen,
    isCreateInvoiceOpen,
    isInviteClientOpen,
    inviteClientId
  ]);

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used inside AppProvider');
  return context;
}
