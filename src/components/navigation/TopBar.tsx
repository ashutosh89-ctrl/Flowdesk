"use client";
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useApp } from '../AppContext';
import { Bell, Plus, User, CreditCard, LogOut, ChevronDown, Users, FolderOpen, Receipt, X, Menu } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import { QuickActionsMenu } from '../dashboard/QuickActionsMenu';
import { CommandPalette } from '@/components/search/CommandPalette';

interface TopBarProps {
  onMenuToggle?: () => void;
  clients?: import('@/lib/types').Client[];
}

export default function TopBar({ onMenuToggle, clients }: TopBarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { 
    user, signOut, 
    setCreateClientOpen, setCreateProjectOpen, setCreateInvoiceOpen
  } = useApp();

  const [title, setTitle] = useState('Dashboard');
  const [showQuickCreate, setShowQuickCreate] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notificationsList, setNotificationsList] = useState<import('@/lib/services/notificationService').AppNotification[]>([]);

  const plusRef = useRef<HTMLDivElement>(null);
  const bellRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadNotifs = async () => {
      try {
        const { getNotifications } = await import('@/lib/services/notificationService');
        const list = await getNotifications();
        setNotificationsList(list);
      } catch (e) {}
    };
    loadNotifs();
  }, []);

  // Click outside handling
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (plusRef.current && !plusRef.current.contains(e.target as Node)) {
        setShowQuickCreate(false);
      }
      if (bellRef.current && !bellRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Resolve dynamic title based on path
  useEffect(() => {
    if (pathname.includes('/freelancer/dashboard')) {
      setTitle('Dashboard');
    } else if (pathname.includes('/freelancer/clients')) {
      setTitle('Clients');
    } else if (pathname.includes('/freelancer/workspace')) {
      setTitle('Client Workspace');
    } else if (pathname.includes('/freelancer/projects')) {
      setTitle('Projects');
    } else if (pathname.includes('/freelancer/invoices')) {
      setTitle('Invoices');
    } else if (pathname.includes('/freelancer/settings')) {
      setTitle('Settings');
    } else if (pathname.includes('/freelancer/activity')) {
      setTitle('Activity Feed');
    } else if (pathname.includes('/client/workspace')) {
      setTitle('Client Dashboard');
    } else if (pathname.includes('/client/documents')) {
      setTitle('Required Documents');
    } else if (pathname.includes('/client/deliverables')) {
      setTitle('Deliverables Review');
    } else if (pathname.includes('/client/invoices')) {
      setTitle('Invoices & Payments');
    } else if (pathname.includes('/client/comments')) {
      setTitle('Workspace Chat');
    } else {
      setTitle('FlowDesk');
    }
  }, [pathname]);

  const handleLogout = () => {
    signOut();
    router.push('/login');
  };

  const dropdownVariants: any = {
    hidden: { opacity: 0, y: -4, scale: 0.95 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { 
        duration: 0.15,
        ease: [0.25, 0.1, 0.25, 1],
        staggerChildren: 0.03
      }
    },
    exit: { opacity: 0, y: -4, scale: 0.95, transition: { duration: 0.1 } }
  };

  const itemVariants: any = {
    hidden: { opacity: 0, y: -2 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <header className="h-16 border-b border-black/5 bg-white/40 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between relative z-25 shrink-0 select-none">
      {/* Left side: Hamburger + Breadcrumbs + Page Title */}
      <div className="flex items-center gap-3 min-w-0">
        {/* Hamburger Menu (Mobile) */}
        <button
          onClick={onMenuToggle}
          className="md:hidden p-2 rounded-xl hover:bg-black/5 text-gray-500 hover:text-gray-900 transition-colors cursor-pointer"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex flex-col min-w-0">
          <Breadcrumbs clients={clients} />
          <AnimatePresence mode="wait">
            <motion.h1
              key={title}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="text-xl sm:text-2xl font-bold text-gray-950 font-sans tracking-tight truncate"
            >
              {title}
            </motion.h1>
          </AnimatePresence>
        </div>
      </div>

      {/* Right side: Actions & Profile */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Global Command Palette (⌘K) */}
        <CommandPalette />

        {/* Notification Bell Dropdown */}
        <div ref={bellRef} className="relative">
          <button 
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowQuickCreate(false);
              setShowProfileMenu(false);
            }}
            className="relative p-2 text-gray-500 hover:text-gray-900 rounded-full hover:bg-black/5 transition-all focus:outline-none cursor-pointer"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
            {notificationsList.filter(n => !n.read).length > 0 && (
              <span className="absolute top-1 right-1 px-1.5 py-0.2 text-[9px] font-black bg-red-600 text-white rounded-full min-w-[16px] text-center shadow-xs">
                {notificationsList.filter(n => !n.read).length}
              </span>
            )}
          </button>

          <AnimatePresence>
            {showNotifications && (
              <motion.div
                variants={dropdownVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-black/10 rounded-2xl shadow-2xl overflow-hidden z-30 font-sans"
              >
                <div className="flex items-center justify-between border-b border-black/5 px-4 py-3 bg-gray-50/50">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-extrabold text-gray-950">Notifications</span>
                    {notificationsList.filter(n => !n.read).length > 0 && (
                      <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                        {notificationsList.filter(n => !n.read).length} Unread
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {notificationsList.some(n => !n.read) && (
                      <button
                        onClick={async () => {
                          const { markAllNotificationsAsRead } = await import('@/lib/services/notificationService');
                          const updated = await markAllNotificationsAsRead();
                          setNotificationsList(updated);
                        }}
                        className="text-[10px] font-bold text-gray-500 hover:text-gray-950 cursor-pointer underline"
                      >
                        Mark all read
                      </button>
                    )}
                    <button onClick={() => setShowNotifications(false)} className="text-gray-400 hover:text-gray-900 cursor-pointer">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-gray-100">
                  {notificationsList.length === 0 ? (
                    <div className="p-8 text-center">
                      <Bell className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                      <p className="text-xs font-bold text-gray-700">No new notifications</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">Activity alerts will appear here when updates occur.</p>
                    </div>
                  ) : (
                    notificationsList.map((notif) => (
                      <div
                        key={notif.id}
                        onClick={async () => {
                          const { markNotificationAsRead } = await import('@/lib/services/notificationService');
                          const updated = await markNotificationAsRead(notif.id);
                          setNotificationsList(updated);
                          setShowNotifications(false);
                          if (notif.link) router.push(notif.link);
                        }}
                        className={`p-3.5 flex items-start gap-3 hover:bg-gray-50 transition-colors cursor-pointer ${!notif.read ? 'bg-amber-50/30' : ''}`}
                      >
                        <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${!notif.read ? 'bg-red-500' : 'bg-transparent'}`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-gray-950 leading-tight">{notif.title}</p>
                          <p className="text-[11px] font-medium text-gray-550 leading-snug mt-0.5 line-clamp-2">{notif.message}</p>
                          <span className="text-[9px] font-bold text-gray-400 mt-1 block">
                            {new Date(notif.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Quick Create Dropdown Button (Only for Freelancers) */}
        {user?.role === 'freelancer' && (
          <div ref={plusRef} className="relative">
            <button
              onClick={() => {
                setShowQuickCreate(!showQuickCreate);
                setShowNotifications(false);
                setShowProfileMenu(false);
              }}
              aria-label="Quick Actions Menu"
              className="w-10 h-10 rounded-full bg-gray-950 flex items-center justify-center text-white hover:bg-gray-800 transition-colors shadow-sm focus:outline-none cursor-pointer"
            >
              <Plus className="w-5 h-5" />
            </button>

            <AnimatePresence>
              {showQuickCreate && (
                <div className="absolute right-0 mt-2 z-30">
                  <QuickActionsMenu onClose={() => setShowQuickCreate(false)} />
                </div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Profile Dropdown */}
        <div ref={profileRef} className="relative">
          <button
            onClick={() => {
              setShowProfileMenu(!showProfileMenu);
              setShowQuickCreate(false);
              setShowNotifications(false);
            }}
            className="flex items-center gap-1 focus:outline-none cursor-pointer"
          >
            <img
              src={user?.avatar || 'https://api.dicebear.com/7.x/initials/svg?seed=Ann'}
              alt="User Profile"
              className="w-8 h-8 rounded-full border border-gray-200 object-cover"
              referrerPolicy="no-referrer"
            />
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </button>

          <AnimatePresence>
            {showProfileMenu && (
              <motion.div
                variants={dropdownVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="absolute right-0 mt-2 w-52 bg-white border border-black/5 rounded-2xl shadow-xl p-2 z-30"
              >
                <motion.div variants={itemVariants} className="px-4 py-2 mb-1">
                  <p className="text-xs font-bold text-gray-900 truncate">{user?.name}</p>
                  <p className="text-[10px] text-gray-400 truncate">{user?.email}</p>
                </motion.div>
                
                <div className="h-px bg-black/5 my-1" />

                {user?.role === 'freelancer' ? (
                  <>
                    <motion.div variants={itemVariants}>
                      <Link
                        href="/freelancer/settings"
                        onClick={() => setShowProfileMenu(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 hover:text-gray-900 rounded-xl transition-colors"
                      >
                        <User className="w-4 h-4 text-gray-400" />
                        Profile
                      </Link>
                    </motion.div>
                    <motion.div variants={itemVariants}>
                      <Link
                        href="/freelancer/settings"
                        onClick={() => setShowProfileMenu(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 hover:text-gray-900 rounded-xl transition-colors"
                      >
                        <CreditCard className="w-4 h-4 text-gray-400" />
                        Billing
                      </Link>
                    </motion.div>
                  </>
                ) : (
                  <motion.div variants={itemVariants}>
                    <Link
                      href="/client/workspace"
                      onClick={() => setShowProfileMenu(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 hover:text-gray-900 rounded-xl transition-colors"
                    >
                      <User className="w-4 h-4 text-gray-400" />
                      Workspace
                    </Link>
                  </motion.div>
                )}

                <div className="h-px bg-black/5 my-1" />

                <motion.button
                  variants={itemVariants}
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-red-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer text-left"
                >
                  <LogOut className="w-4 h-4 text-rose-550" />
                  Log Out
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
