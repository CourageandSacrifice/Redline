'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Gauge, Mail, Lock, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push('/dashboard');
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen flex" style={{ background: '#15202b' }}>
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden items-center justify-center" style={{ background: '#192734' }}>
        {/* Background glow */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-accent/5 rounded-full blur-3xl" />
        </div>
        
        <div className="relative z-10 text-center px-16">
          {/* Logo */}
          <div className="mb-8 inline-flex">
            <div className="w-28 h-28 bg-accent rounded-3xl flex items-center justify-center shadow-accent-lg">
              <Gauge className="w-16 h-16 text-white" />
            </div>
          </div>
          
          <h1 className="text-6xl font-display font-bold text-white mb-4 tracking-tight">
            REDLINE
          </h1>
          
          <p className="text-xl text-x-lightgray">
            The underground racing community
          </p>
        </div>
      </div>

      {/* Right side - Login form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md animate-fade-in">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-10 justify-center">
            <div className="w-12 h-12 bg-accent rounded-xl flex items-center justify-center">
              <Gauge className="w-7 h-7 text-white" />
            </div>
            <span className="text-2xl font-display font-bold text-white tracking-wider">REDLINE</span>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-display font-bold text-white mb-2">
              Sign in
            </h2>
            <p className="text-x-gray">Welcome back to Redline</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            {error && (
              <div className="p-4 bg-accent/10 border border-accent/30 rounded-xl text-accent text-sm animate-fade-in">
                {error}
              </div>
            )}

            <div>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-x-gray" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field pl-12 py-4"
                  placeholder="Email"
                  required
                />
              </div>
            </div>

            <div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-x-gray" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field pl-12 py-4"
                  placeholder="Password"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-accent text-white rounded-full font-display font-bold text-lg tracking-wider hover:bg-accent-light transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Signing in...
                </span>
              ) : (
                'Sign in'
              )}
            </button>
          </form>

          <div className="mt-10">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-x-border"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 text-x-gray" style={{ background: '#15202b' }}>Demo accounts</span>
              </div>
            </div>
            
            <div className="mt-6 space-y-2">
              {[
                { label: 'Admin', email: 'admin@redline.com' },
                { label: 'Creator', email: 'creator@redline.com' },
                { label: 'Viewer', email: 'viewer@redline.com' },
              ].map((account) => (
                <button
                  key={account.email}
                  onClick={() => { setEmail(account.email); setPassword('password123'); }}
                  className="w-full p-3 rounded-xl text-left hover:bg-white/5 transition-colors group border border-x-border"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-white font-semibold">{account.label}</span>
                      <span className="text-x-gray ml-2 text-sm">{account.email}</span>
                    </div>
                    <span className="text-accent opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                  </div>
                </button>
              ))}
            </div>
            
            <p className="text-center text-x-gray text-sm mt-4">
              Password: <span className="text-x-white font-mono">password123</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
