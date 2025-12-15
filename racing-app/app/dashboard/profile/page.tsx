'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { 
  User, 
  Mail, 
  Calendar, 
  Camera,
  Loader2,
  Check,
  AlertCircle
} from 'lucide-react';

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [profile, setProfile] = useState({
    username: '',
    email: '',
    avatar_url: '',
    role: '',
    created_at: '',
  });
  
  const supabase = createClient();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (data) {
      setProfile({
        username: data.username || '',
        email: data.email || user.email || '',
        avatar_url: data.avatar_url || '',
        role: data.role || 'viewer',
        created_at: data.created_at || '',
      });
    }
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSuccess(false);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error: updateError } = await supabase
      .from('users')
      .update({
        username: profile.username,
        avatar_url: profile.avatar_url,
      })
      .eq('id', user.id);

    if (updateError) {
      setError(updateError.message);
    } else {
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    }
    setSaving(false);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Unknown';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-accent animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-x-white">Profile</h1>
        <p className="text-x-gray mt-1">Manage your account settings</p>
      </div>

      {/* Avatar Section */}
      <div className="glass rounded-xl p-6 mb-6">
        <div className="flex items-center gap-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-accent/20 flex items-center justify-center text-accent text-3xl font-bold">
              {profile.avatar_url ? (
                <img 
                  src={profile.avatar_url} 
                  alt={profile.username}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                profile.username?.charAt(0).toUpperCase() || 'U'
              )}
            </div>
            <button className="absolute bottom-0 right-0 p-2 bg-accent rounded-full text-white hover:bg-accent-light transition-colors">
              <Camera className="w-4 h-4" />
            </button>
          </div>
          <div>
            <h2 className="text-xl font-bold text-x-white">{profile.username}</h2>
            <p className="text-x-gray">@{profile.username?.toLowerCase().replace(/\s/g, '')}</p>
            <span className="inline-block mt-2 px-3 py-1 bg-accent/20 text-accent text-sm font-semibold rounded-full capitalize">
              {profile.role}
            </span>
          </div>
        </div>
      </div>

      {/* Profile Form */}
      <div className="glass rounded-xl p-6">
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-xl text-green-400 flex items-center gap-2">
            <Check className="w-5 h-5" />
            Profile updated successfully!
          </div>
        )}

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-x-lightgray mb-2">
              <User className="w-4 h-4 inline mr-2" />
              Username
            </label>
            <input
              type="text"
              value={profile.username}
              onChange={(e) => setProfile({ ...profile, username: e.target.value })}
              className="input-racing"
              placeholder="Your username"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-x-lightgray mb-2">
              <Mail className="w-4 h-4 inline mr-2" />
              Email
            </label>
            <input
              type="email"
              value={profile.email}
              disabled
              className="input-racing opacity-60 cursor-not-allowed"
            />
            <p className="text-xs text-x-gray mt-1">Email cannot be changed</p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-x-lightgray mb-2">
              Avatar URL
            </label>
            <input
              type="url"
              value={profile.avatar_url}
              onChange={(e) => setProfile({ ...profile, avatar_url: e.target.value })}
              className="input-racing"
              placeholder="https://example.com/avatar.jpg"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-x-lightgray mb-2">
              <Calendar className="w-4 h-4 inline mr-2" />
              Member Since
            </label>
            <input
              type="text"
              value={formatDate(profile.created_at)}
              disabled
              className="input-racing opacity-60 cursor-not-allowed"
            />
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-accent w-full flex items-center justify-center gap-2"
          >
            {saving ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Check className="w-5 h-5" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
