import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useApp } from './AppContext';
import { update } from '../lib/services/dataService';
import { User } from '../lib/types';
import { 
  User as UserIcon, Shield, Sliders, Bell, Sparkles, 
  Palette, Smartphone, Heart, HelpCircle, Save, Check 
} from 'lucide-react';

export default function SettingsScreen() {
  const { user, setUser, addToast } = useApp();
  const [subTab, setSubTab] = useState<'profile' | 'security' | 'appearance' | 'notifications'>('profile');
  const [name, setName] = useState(user?.name || '');
  const [bio, setBio] = useState('Premium digital designer crafting high-fidelity product workflows.');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [accent, setAccent] = useState<'slate' | 'indigo' | 'emerald'>('slate');
  const [emailDigests, setEmailDigests] = useState(true);
  const [pushNotes, setPushNotes] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const updatedUser = await update<User>('users', user.id, {
        name
      });
      setUser(updatedUser);
      addToast('Settings saved successfully!', 'success');
    } catch (e) {
      console.error(e);
      addToast('Failed to save settings', 'warning');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'profile', name: 'Personal Info', icon: UserIcon },
    { id: 'security', name: 'Account Security', icon: Shield },
    { id: 'appearance', name: 'Appearance', icon: Palette },
    { id: 'notifications', name: 'Notifications', icon: Bell },
  ] as const;

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-white/10">
      
      {/* Header Bar */}
      <header className="h-16 border-b border-gray-200/50 px-8 flex items-center justify-between bg-white/40 backdrop-blur-md shrink-0">
        <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <Sliders className="w-5 h-5 text-gray-700" />
          Settings
        </h1>

        <button
          onClick={handleSave}
          disabled={loading}
          className="px-4 py-2 bg-gray-900 hover:bg-gray-800 disabled:bg-gray-700 text-white font-semibold text-xs rounded-full flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          {loading ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Save Settings
            </>
          )}
        </button>
      </header>

      {/* Viewport Split: Sidebar & content */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Settings sub-nav */}
        <div className="w-64 border-r border-gray-200/50 bg-white/20 p-6 space-y-1 shrink-0">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = subTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setSubTab(tab.id as any)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  isActive 
                    ? 'bg-gray-900 text-white' 
                    : 'text-gray-500 hover:bg-black/5 hover:text-gray-950'
                }`}
              >
                <Icon className="w-4.5 h-4.5" />
                {tab.name}
              </button>
            );
          })}
        </div>

        {/* Content sheet */}
        <div className="flex-1 overflow-y-auto p-8 max-w-2xl">
          <form onSubmit={handleSave} className="space-y-8">
            
            {subTab === 'profile' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-gray-900">Personal Info</h3>
                  <p className="text-xs text-gray-500 font-semibold mt-1">Configure your workspace identities and profile details.</p>
                </div>

                {/* Avatar change block */}
                <div className="flex items-center gap-4 pt-2">
                  <img
                    src={user?.avatar || 'https://api.dicebear.com/7.x/initials/svg?seed=Ann'}
                    alt="Ann"
                    className="w-16 h-16 rounded-full border border-gray-200 object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <button
                      type="button"
                      onClick={() => addToast('Mock picture uploader opened...', 'info')}
                      className="px-3 py-1.5 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 font-bold text-xs rounded-lg transition-all cursor-pointer"
                    >
                      Upload New Picture
                    </button>
                    <p className="text-[10px] text-gray-400 mt-1 font-semibold uppercase">JPG, PNG or GIF (Max 1MB)</p>
                  </div>
                </div>

                <div className="space-y-4 pt-2">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-600 uppercase tracking-wider mb-2">Full Display Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3 py-2.5 bg-white/60 hover:bg-white/80 focus:bg-white border border-gray-200 outline-none text-xs font-bold rounded-lg transition-all"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-600 uppercase tracking-wider mb-2">Short Professional Bio</label>
                    <textarea
                      rows={3}
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      className="w-full px-3 py-2.5 bg-white/60 hover:bg-white/80 focus:bg-white border border-gray-200 outline-none text-xs font-bold rounded-lg transition-all"
                    />
                  </div>
                </div>
              </div>
            )}

            {subTab === 'security' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-gray-900">Account Security</h3>
                  <p className="text-xs text-gray-500 font-semibold mt-1">Manage and lock credentials, OAuth links and security rules.</p>
                </div>

                <div className="p-4 border border-emerald-100 bg-emerald-50 text-emerald-800 rounded-xl flex gap-3 text-xs leading-relaxed">
                  <Shield className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-extrabold uppercase">SECURED BY FLOWDESK MIDDLEWARE:</span> Your workspace session is securely cryptographically locked with HMAC sign-offs.
                  </div>
                </div>
              </div>
            )}

            {subTab === 'appearance' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-gray-900">Workspace Brand Identity</h3>
                  <p className="text-xs text-gray-500 font-semibold mt-1">Customize the display accent brand color for your FlowDesk dashboard.</p>
                </div>

                <div className="space-y-4">
                  <h4 className="text-[10px] font-bold text-gray-600 uppercase tracking-wider">Accent Brand Identity</h4>
                  <div className="flex gap-3">
                    {[
                      { id: 'slate', color: 'bg-gray-900', name: 'Slate Gray' },
                      { id: 'indigo', color: 'bg-indigo-600', name: 'Electric Indigo' },
                      { id: 'emerald', color: 'bg-emerald-600', name: 'Emerald Wave' },
                    ].map((col) => (
                      <button
                        key={col.id}
                        type="button"
                        onClick={() => {
                          setAccent(col.id as any);
                          addToast(`Brand accent swapped to ${col.name}!`, 'success');
                        }}
                        className={`w-10 h-10 rounded-full cursor-pointer flex items-center justify-center relative ${col.color}`}
                      >
                        {accent === col.id && (
                          <Check className="w-5 h-5 text-white" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {subTab === 'notifications' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-gray-900">Notifications</h3>
                  <p className="text-xs text-gray-500 font-semibold mt-1">Control email alerts, reminder triggers, and mobile push feeds.</p>
                </div>

                <div className="space-y-4 pt-2">
                  <div className="flex items-center justify-between p-3.5 border border-gray-100 rounded-xl bg-white/40">
                    <div>
                      <h4 className="text-xs font-bold text-gray-900">Weekly Summary Email Digests</h4>
                      <p className="text-[10px] text-gray-400 font-semibold mt-1">Receive automatic payment reminders and client feedback digests.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setEmailDigests(!emailDigests)}
                      className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                        emailDigests ? 'bg-gray-900' : 'bg-gray-200'
                      }`}
                    >
                      <div className={`w-4.5 h-4.5 bg-white rounded-full absolute top-0.75 transition-all ${
                        emailDigests ? 'right-0.75' : 'left-0.75'
                      }`}></div>
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-3.5 border border-gray-100 rounded-xl bg-white/40">
                    <div>
                      <h4 className="text-xs font-bold text-gray-900">Realtime Push Notifications</h4>
                      <p className="text-[10px] text-gray-400 font-semibold mt-1">Direct chrome visual banners on client uploads and deliverables reviews.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setPushNotes(!pushNotes)}
                      className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                        pushNotes ? 'bg-gray-900' : 'bg-gray-200'
                      }`}
                    >
                      <div className={`w-4.5 h-4.5 bg-white rounded-full absolute top-0.75 transition-all ${
                        pushNotes ? 'right-0.75' : 'left-0.75'
                      }`}></div>
                    </button>
                  </div>
                </div>
              </div>
            )}

          </form>
        </div>

      </div>

    </div>
  );
}
