'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Gauge, Mail, Lock, ArrowRight, Loader2, Zap } from 'lucide-react';

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
    <div className="min-h-screen flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-dark-500 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-72 h-72 bg-neon-purple/20 rounded-full blur-3xl animate-pulse-neon" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-neon-cyan/10 rounded-full blur-3xl animate-pulse-neon" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] border border-neon-purple/20 rounded-full" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-neon-cyan/10 rounded-full" />
          
          {/* Racing stripes */}
          <div className="absolute top-0 left-1/4 w-1 h-full bg-gradient-to-b from-transparent via-neon-purple/30 to-transparent" />
          <div className="absolute top-0 left-1/3 w-0.5 h-full bg-gradient-to-b from-transparent via-neon-cyan/20 to-transparent" />
        </div>
        
        <div className="relative z-10 flex flex-col justify-center px-16">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-gradient-to-br from-neon-purple to-neon-cyan rounded-xl shadow-neon-purple">
              <Gauge className="w-8 h-8 text-white" />
            </div>
            <span className="text-3xl font-display font-bold text-white tracking-wider">REDLINE</span>
          </div>
          
          <h1 className="text-5xl font-display font-bold text-white mb-6 leading-tight tracking-wide">
            PUSH THE
            <br />
            <span className="neon-text-purple">LIMITS</span>
          </h1>
          
          <p className="text-xl text-gray-400 max-w-md leading-relaxed">
            Share your racing clips, track your 0-60 and quarter mile times, and compete on the leaderboards.
          </p>
          
          <div className="mt-12 flex items-center gap-8">
            <div className="text-center">
              <div className="text-3xl font-display font-bold neon-text-cyan">10K+</div>
              <div className="text-sm text-gray-500 uppercase tracking-wider">Clips</div>
            </div>
            <div className="w-px h-12 bg-racing-700" />
            <div className="text-center">
              <div className="text-3xl font-display font-bold neon-text-purple">5K+</div>
              <div className="text-sm text-gray-500 uppercase tracking-wider">Racers</div>
            </div>
            <div className="w-px h-12 bg-racing-700" />
            <div className="text-center">
              <div className="text-3xl font-display font-bold neon-text-green">2.1s</div>
              <div className="text-sm text-gray-500 uppercase tracking-wider">Record 0-60</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Login form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-dark-600">
        <div className="w-full max-w-md animate-fade-in">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
            <div className="p-3 bg-gradient-to-br from-neon-purple to-neon-cyan rounded-xl shadow-neon-purple">
              <Gauge className="w-8 h-8 text-white" />
            </div>
            <span className="text-2xl font-display font-bold text-white tracking-wider">REDLINE</span>
          </div>

          <div className="glass rounded-2xl p-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-display font-bold text-white mb-2 tracking-wide">
                WELCOME BACK
              </h2>
              <p className="text-gray-400">
                Sign in to access your garage
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              {error && (
                <div className="p-4 bg-neon-red/10 border border-neon-red/30 rounded-lg text-neon-red text-sm animate-fade-in">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-300 uppercase tracking-wider">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input-racing pl-12"
                    placeholder="racer@streetpulse.com"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-300 uppercase tracking-wider">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input-racing pl-12"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-neon w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    LAUNCHING...
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5" />
                    SIGN IN
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-racing-700">
              <p className="text-center text-sm text-gray-500 mb-3">
                Demo accounts:
              </p>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between p-2 bg-dark-400 rounded-lg">
                  <span className="text-gray-400">Admin:</span>
                  <span className="text-neon-cyan font-mono">admin@redline.com</span>
                </div>
                <div className="flex justify-between p-2 bg-dark-400 rounded-lg">
                  <span className="text-gray-400">Creator:</span>
                  <span className="text-neon-cyan font-mono">creator@redline.com</span>
                </div>
                <div className="flex justify-between p-2 bg-dark-400 rounded-lg">
                  <span className="text-gray-400">Viewer:</span>
                  <span className="text-neon-cyan font-mono">viewer@redline.com</span>
                </div>
                <p className="text-center text-gray-500 mt-2">
                  Password: <span className="text-neon-purple font-mono">password123</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
