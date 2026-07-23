import React, { useState } from 'react';
import { useApp } from './AppContext';
import { update } from '../lib/services/dataService';
import { User } from '../lib/types';
import { 
  User as UserIcon, Shield, Sliders, Bell, 
  Save 
} from 'lucide-react';

export default function SettingsScreen() {
  const { user, setUser, addToast } = useApp();
  const [subTab, setSubTab] = useState<'profile' | 'security' | 'notifications'>('profile');
  const [name, setName] = useState(user?.name || '');
  const [bio, setBio] = useState('Premium digital designer crafting high-fidelity product workflows.');
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
          <form onSubmit={handleSave} className="space-y-6">
            
            {subTab === 'profile' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-base font-bold text-gray-900">Personal Info</h3>
                  <p className="text-xs text-gray-500 mt-1">Configure your workspace identities and profile details.</p>
                </div>

                <div className="space-y-4 pt-2">
                  <div className="relative">
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="peer w-full h-12 px-4 pt-5 pb-1 bg-white/50 border border-gray-300 rounded-xl text-gray-900 placeholder-transparent focus:outline-none focus:border-gray-900 transition-all text-sm"
                      placeholder=" "
                      required
                    />
                    <label className="absolute left-4 top-3.5 text-gray-500 text-sm transition-all pointer-events-none peer-focus:top-1 peer-focus:text-xs peer-focus:text-gray-900 peer-[:not(:placeholder-shown)]:top-1 peer-[:not(:placeholder-shown)]:text-xs">
                      Display Name
                    </label>
                  </div>

                  <div className="relative">
                    <textarea
                      rows={3}
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      className="peer w-full px-4 pt-5 pb-2 bg-white/50 border border-gray-300 rounded-xl text-gray-900 placeholder-transparent focus:outline-none focus:border-gray-900 transition-all text-sm resize-none"
                      placeholder=" "
                    />
                    <label className="absolute left-4 top-3 text-gray-500 text-sm transition-all pointer-events-none peer-focus:top-1 peer-focus:text-xs peer-focus:text-gray-900 peer-[:not(:placeholder-shown)]:top-1 peer-[:not(:placeholder-shown)]:text-xs">
                      Short Professional Bio
                    </label>
                  </div>
                </div>
              </div>
            )}

            {subTab === 'security' && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-base font-bold text-gray-900">Account Security</h3>
                  <p className="text-xs text-gray-500 mt-1">Manage credentials and authentication states.</p>
                </div>
                <div className="p-4 border border-emerald-200 bg-emerald-50/50 text-emerald-800 rounded-xl flex gap-3 text-xs leading-normal">
                  <span className="font-semibold shrink-0">Security Middleware active</span>
                  <span>Your dashboard session is securely locked with dual-mode Supabase credentials verification.</span>
                </div>
              </div>
            )}

            {subTab === 'notifications' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-base font-bold text-gray-900">Notifications</h3>
                  <p className="text-xs text-gray-500 mt-1">Control email alerts, billing updates, and real-time feeds.</p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 border border-gray-200/50 rounded-xl bg-white/40">
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900">Email Digests</h4>
                      <p className="text-xs text-gray-500 mt-0.5">Receive summary reports on client activities.</p>
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
                      }`} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 border border-gray-200/50 rounded-xl bg-white/40">
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900">Realtime Banners</h4>
                      <p className="text-xs text-gray-500 mt-0.5">Show notifications when client signs documents.</p>
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
                      }`} />
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
