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
    <div className="min-h-screen flex bg-black">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden items-center justify-center">
        {/* Animated background elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-96 h-96 bg-neon-red/5 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-72 h-72 bg-neon-red/10 rounded-full blur-3xl animate-pulse-red" />
          
          {/* Grid pattern */}
          <div className="absolute inset-0 opacity-5" style={{
            backgroundImage: 'linear-gradient(#ff0033 1px, transparent 1px), linear-gradient(90deg, #ff0033 1px, transparent 1px)',
            backgroundSize: '50px 50px'
          }} />
        </div>
        
        <div className="relative z-10 px-16">
          {/* Large X-style logo */}
          <div className="mb-12">
            <div className="w-24 h-24 bg-white rounded-2xl flex items-center justify-center shadow-neon-red">
              <Gauge className="w-14 h-14 text-black" />
            </div>
          </div>
          
          <h1 className="text-7xl font-display font-bold text-white mb-6 tracking-tight">
            REDLINE
          </h1>
          
          <p className="text-2xl text-x-gray max-w-md">
            The underground racing community.
          </p>
        </div>
      </div>

      {/* Right side - Login form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md animate-fade-in">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-12 justify-center">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center">
              <Gauge className="w-7 h-7 text-black" />
            </div>
            <span className="text-2xl font-display font-bold text-white tracking-wider">REDLINE</span>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-display font-bold text-white mb-2">
              Sign in
            </h2>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            {error && (
              <div className="p-4 bg-neon-red/10 border border-neon-red/30 rounded-xl text-neon-red text-sm animate-fade-in">
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
                  className="input-racing pl-12 py-4 rounded-xl"
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
                  className="input-racing pl-12 py-4 rounded-xl"
                  placeholder="Password"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-white text-black rounded-full font-display font-bold text-lg tracking-wider hover:bg-gray-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
                <span className="px-4 bg-black text-x-gray">Demo accounts</span>
              </div>
            </div>
            
            <div className="mt-6 space-y-3">
              <button
                onClick={() => { setEmail('admin@redline.com'); setPassword('password123'); }}
                className="w-full p-3 border border-x-border rounded-xl text-left hover:bg-x-hover transition-colors group"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-white font-semibold">Admin</span>
                    <span className="text-x-gray ml-2">admin@redline.com</span>
                  </div>
                  <span className="text-neon-red opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                </div>
              </button>
              
              <button
                onClick={() => { setEmail('creator@redline.com'); setPassword('password123'); }}
                className="w-full p-3 border border-x-border rounded-xl text-left hover:bg-x-hover transition-colors group"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-white font-semibold">Creator</span>
                    <span className="text-x-gray ml-2">creator@redline.com</span>
                  </div>
                  <span className="text-neon-red opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                </div>
              </button>
              
              <button
                onClick={() => { setEmail('viewer@redline.com'); setPassword('password123'); }}
                className="w-full p-3 border border-x-border rounded-xl text-left hover:bg-x-hover transition-colors group"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-white font-semibold">Viewer</span>
                    <span className="text-x-gray ml-2">viewer@redline.com</span>
                  </div>
                  <span className="text-neon-red opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                </div>
              </button>
            </div>
            
            <p className="text-center text-x-gray text-sm mt-4">
              Password: <span className="text-white font-mono">password123</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
