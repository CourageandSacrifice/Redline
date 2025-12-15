'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { 
  Gauge, 
  Mail, 
  Lock, 
  User,
  Loader2,
  Chrome,
  Apple,
  Tv,
  MessageCircle
} from 'lucide-react';

// Discord icon component
const DiscordIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
  </svg>
);

// Twitch icon component
const TwitchIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714z"/>
  </svg>
);

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: username,
          role: 'creator', // Default new users to creator
        },
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else if (data.user) {
      // Check if email confirmation is required
      if (data.session) {
        router.push('/dashboard');
        router.refresh();
      } else {
        setError('Check your email for a confirmation link!');
        setLoading(false);
      }
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'apple' | 'discord' | 'twitch') => {
    setSocialLoading(provider);
    setError('');

    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError(error.message);
      setSocialLoading(null);
    }
  };

  const socialProviders = [
    { id: 'google', name: 'Google', icon: Chrome, color: 'hover:bg-white/10' },
    { id: 'apple', name: 'Apple', icon: Apple, color: 'hover:bg-white/10' },
    { id: 'discord', name: 'Discord', icon: DiscordIcon, color: 'hover:bg-[#5865F2]/20' },
    { id: 'twitch', name: 'Twitch', icon: TwitchIcon, color: 'hover:bg-[#9146FF]/20' },
  ];

  return (
    <div className="min-h-screen flex" style={{ background: '#15202b' }}>
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden items-center justify-center" style={{ background: '#192734' }}>
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-accent/5 rounded-full blur-3xl" />
        </div>
        
        <div className="relative z-10 text-center px-16">
          <div className="mb-8 inline-flex">
            <div className="w-28 h-28 bg-accent rounded-3xl flex items-center justify-center shadow-accent-lg">
              <Gauge className="w-16 h-16 text-white" />
            </div>
          </div>
          
          <h1 className="text-6xl font-display font-bold text-white mb-4 tracking-tight">
            REDLINE
          </h1>
          
          <p className="text-xl text-x-lightgray">
            Join the underground racing community
          </p>
        </div>
      </div>

      {/* Right side - Signup form */}
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
              Create account
            </h2>
            <p className="text-x-gray">Join the community today</p>
          </div>

          {/* Social login buttons */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {socialProviders.map((provider) => {
              const Icon = provider.icon;
              return (
                <button
                  key={provider.id}
                  onClick={() => handleSocialLogin(provider.id as any)}
                  disabled={socialLoading !== null}
                  className={`flex items-center justify-center gap-2 p-3 rounded-xl border border-x-border ${provider.color} transition-all disabled:opacity-50`}
                >
                  {socialLoading === provider.id ? (
                    <Loader2 className="w-5 h-5 animate-spin text-white" />
                  ) : (
                    <>
                      <Icon className="w-5 h-5 text-white" />
                      <span className="text-white font-medium text-sm">{provider.name}</span>
                    </>
                  )}
                </button>
              );
            })}
          </div>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-x-border"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 text-x-gray" style={{ background: '#15202b' }}>or continue with email</span>
            </div>
          </div>

          <form onSubmit={handleSignup} className="space-y-4">
            {error && (
              <div className={`p-4 rounded-xl text-sm animate-fade-in ${
                error.includes('Check your email') 
                  ? 'bg-green-500/10 border border-green-500/30 text-green-400'
                  : 'bg-accent/10 border border-accent/30 text-accent'
              }`}>
                {error}
              </div>
            )}

            <div>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-x-gray" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="input-field pl-12 py-4"
                  placeholder="Username"
                  required
                />
              </div>
            </div>

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
                  placeholder="Password (min 6 characters)"
                  required
                  minLength={6}
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
                  Creating account...
                </span>
              ) : (
                'Create account'
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-x-gray">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-accent hover:underline font-semibold">
              Sign in
            </Link>
          </p>

          <p className="mt-6 text-center text-x-gray text-xs">
            By creating an account, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
}
