'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { 
  Settings,
  Bell,
  Eye,
  Gauge,
  Trash2,
  AlertTriangle,
  Loader2,
  Check,
  Moon,
  Globe
} from 'lucide-react';

export default function SettingsPage() {
  const [loading, setLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [settings, setSettings] = useState({
    notifications: true,
    publicProfile: true,
    metricUnits: false,
    darkMode: true,
  });
  
  const router = useRouter();
  const supabase = createClient();

  const handleDeleteAccount = async () => {
    setDeleting(true);
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Delete user data (cascade should handle related data)
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', user.id);

    if (!error) {
      await supabase.auth.signOut();
      router.push('/auth/login');
    }
    
    setDeleting(false);
  };

  const SettingToggle = ({ 
    enabled, 
    onChange, 
    label, 
    description, 
    icon: Icon 
  }: { 
    enabled: boolean; 
    onChange: () => void; 
    label: string; 
    description: string;
    icon: any;
  }) => (
    <div className="flex items-center justify-between py-4 border-b border-x-border last:border-0">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
          <Icon className="w-5 h-5 text-accent" />
        </div>
        <div>
          <div className="font-semibold text-x-white">{label}</div>
          <div className="text-sm text-x-gray">{description}</div>
        </div>
      </div>
      <button
        onClick={onChange}
        className={`relative w-12 h-7 rounded-full transition-colors ${
          enabled ? 'bg-accent' : 'bg-x-border'
        }`}
      >
        <div
          className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform ${
            enabled ? 'left-6' : 'left-1'
          }`}
        />
      </button>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-x-white">Settings</h1>
        <p className="text-x-gray mt-1">Customize your experience</p>
      </div>

      {/* Preferences */}
      <div className="glass rounded-xl p-6 mb-6">
        <h2 className="text-lg font-display font-bold text-x-white mb-4">Preferences</h2>
        
        <SettingToggle
          enabled={settings.notifications}
          onChange={() => setSettings({ ...settings, notifications: !settings.notifications })}
          label="Push Notifications"
          description="Get notified about likes, comments, and new followers"
          icon={Bell}
        />

        <SettingToggle
          enabled={settings.publicProfile}
          onChange={() => setSettings({ ...settings, publicProfile: !settings.publicProfile })}
          label="Public Profile"
          description="Allow others to see your profile and stats"
          icon={Eye}
        />

        <SettingToggle
          enabled={settings.metricUnits}
          onChange={() => setSettings({ ...settings, metricUnits: !settings.metricUnits })}
          label="Metric Units"
          description="Use km/h instead of mph"
          icon={Gauge}
        />

        <SettingToggle
          enabled={settings.darkMode}
          onChange={() => setSettings({ ...settings, darkMode: !settings.darkMode })}
          label="Dark Mode"
          description="Use dark theme (recommended)"
          icon={Moon}
        />
      </div>

      {/* App Info */}
      <div className="glass rounded-xl p-6 mb-6">
        <h2 className="text-lg font-display font-bold text-x-white mb-4">About</h2>
        
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-x-gray">Version</span>
            <span className="text-x-white">1.0.0</span>
          </div>
          <div className="flex justify-between">
            <span className="text-x-gray">Build</span>
            <span className="text-x-white">2024.12.15</span>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-x-border">
          <div className="flex gap-4 text-sm">
            <a href="#" className="text-accent hover:underline">Privacy Policy</a>
            <a href="#" className="text-accent hover:underline">Terms of Service</a>
            <a href="#" className="text-accent hover:underline">Contact Support</a>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="glass rounded-xl p-6 border-red-500/30">
        <h2 className="text-lg font-display font-bold text-red-400 mb-4 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" />
          Danger Zone
        </h2>
        
        <p className="text-x-gray text-sm mb-4">
          Once you delete your account, there is no going back. All your data, posts, and stats will be permanently removed.
        </p>

        {!showDeleteConfirm ? (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="px-4 py-2 border border-red-500/50 text-red-400 rounded-lg hover:bg-red-500/10 transition-colors"
          >
            Delete Account
          </button>
        ) : (
          <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
            <p className="text-red-400 font-semibold mb-4">Are you absolutely sure?</p>
            <div className="flex gap-3">
              <button
                onClick={handleDeleteAccount}
                disabled={deleting}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2"
              >
                {deleting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Yes, Delete My Account
                  </>
                )}
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 border border-x-border text-x-white rounded-lg hover:bg-white/5 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
