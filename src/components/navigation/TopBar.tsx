"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useApp } from '../AppContext';
import { Bell, Plus, User, CreditCard, LogOut, ChevronDown, Check, FolderHeart } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function TopBar() {
  const pathname = usePathname();
  const router = useRouter();
  const { 
    user, signOut, 
    setCreateClientOpen, setCreateProjectOpen, setCreateInvoiceOpen,
    toasts
  } = useApp();

  const [title, setTitle] = useState('Dashboard');
  const [showQuickCreate, setShowQuickCreate] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [hasNotifications, setHasNotifications] = useState(true);

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
    <header className="h-16 border-b border-black/5 bg-white/40 backdrop-blur-md px-6 flex items-center justify-between relative z-25 shrink-0 select-none">
      {/* Left side: Dynamic Page Title */}
      <div className="flex items-center gap-3">
        <AnimatePresence mode="wait">
          <motion.h1
            key={title}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="text-2xl font-bold text-gray-950 font-sans tracking-tight"
          >
            {title}
          </motion.h1>
        </AnimatePresence>
      </div>

      {/* Right side: Actions & Profile */}
      <div className="flex items-center gap-4">
        {/* Notification Bell */}
        <button 
          onClick={() => setHasNotifications(false)}
          className="relative p-2 text-gray-500 hover:text-gray-900 rounded-full hover:bg-black/5 transition-all focus:outline-none"
        >
          <Bell className="w-5 h-5" />
          {hasNotifications && (
            <motion.span 
              initial={{ scale: 0 }}
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 2, repeatType: 'reverse' }}
              className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"
            />
          )}
        </button>

        {/* Quick Create Dropdown Button (Only for Freelancers) */}
        {user?.role === 'freelancer' && (
          <div className="relative">
            <button
              onClick={() => {
                setShowQuickCreate(!showQuickCreate);
                setShowProfileMenu(false);
              }}
              className="w-10 h-10 rounded-full bg-gray-950 flex items-center justify-center text-white hover:bg-gray-800 transition-colors shadow-sm focus:outline-none cursor-pointer"
            >
              <Plus className="w-5 h-5" />
            </button>

            <AnimatePresence>
              {showQuickCreate && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowQuickCreate(false)} />
                  <motion.div
                    variants={dropdownVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="absolute right-0 mt-2 w-48 bg-white border border-black/5 rounded-2xl shadow-xl p-2 z-20"
                  >
                    <motion.button
                      variants={itemVariants}
                      onClick={() => {
                        setCreateClientOpen(true);
                        setShowQuickCreate(false);
                      }}
                      className="w-full text-left px-4 py-2.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 hover:text-gray-900 rounded-xl transition-colors cursor-pointer"
                    >
                      New Client
                    </motion.button>
                    <motion.button
                      variants={itemVariants}
                      onClick={() => {
                        setCreateProjectOpen(true);
                        setShowQuickCreate(false);
                      }}
                      className="w-full text-left px-4 py-2.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 hover:text-gray-900 rounded-xl transition-colors cursor-pointer"
                    >
                      New Project
                    </motion.button>
                    <motion.button
                      variants={itemVariants}
                      onClick={() => {
                        setCreateInvoiceOpen(true);
                        setShowQuickCreate(false);
                      }}
                      className="w-full text-left px-4 py-2.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 hover:text-gray-900 rounded-xl transition-colors cursor-pointer"
                    >
                      Create Invoice
                    </motion.button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setShowProfileMenu(!showProfileMenu);
              setShowQuickCreate(false);
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
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowProfileMenu(false)} />
                <motion.div
                  variants={dropdownVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="absolute right-0 mt-2 w-52 bg-white border border-black/5 rounded-2xl shadow-xl p-2 z-20"
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
                          href="/freelancer/settings?tab=billing"
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
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
