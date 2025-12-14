'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { 
  Search, 
  ChevronDown, 
  User, 
  Settings, 
  LogOut,
  Trophy,
  Timer,
  Sparkles
} from 'lucide-react';

interface HeaderProps {
  user: {
    id: string;
    email: string;
    username: string;
    avatar_url?: string;
    role: string;
  };
}

export default function Header({ user }: HeaderProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/auth/login');
    router.refresh();
  };

  return (
    <header className="h-14 border-b border-x-border bg-black/80 backdrop-blur-md sticky top-0 z-30">
      <div className="h-full px-4 flex items-center justify-between">
        {/* Search bar */}
        <div className="flex-1 max-w-md">
          <div className={`relative rounded-full border ${searchFocused ? 'border-neon-red bg-transparent' : 'border-transparent bg-x-darkgray'} transition-all`}>
            <Search className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${searchFocused ? 'text-neon-red' : 'text-x-gray'}`} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              placeholder="Search"
              className="w-full pl-12 pr-4 py-2.5 bg-transparent text-white placeholder-x-gray focus:outline-none font-body rounded-full"
            />
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2 ml-4">
          {/* Upgrade button (for non-premium) */}
          <button className="hidden md:flex items-center gap-2 px-4 py-2 border border-x-border rounded-full text-white hover:bg-x-hover transition-colors text-sm font-semibold">
            <Sparkles className="w-4 h-4 text-neon-red" />
            Premium
          </button>

          {/* Profile dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 p-1.5 rounded-full hover:bg-x-hover transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-neon-red to-red-800 flex items-center justify-center text-white font-bold text-sm">
                {user.avatar_url ? (
                  <img 
                    src={user.avatar_url} 
                    alt={user.username}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  user.username?.charAt(0).toUpperCase() || 'U'
                )}
              </div>
            </button>

            {/* Dropdown menu */}
            {dropdownOpen && (
              <div className="absolute right-0 top-full mt-2 w-72 bg-black border border-x-border rounded-2xl shadow-xl overflow-hidden animate-fade-in">
                {/* User info header */}
                <div className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-neon-red to-red-800 flex items-center justify-center text-white font-bold text-lg">
                      {user.username?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-white truncate">
                        {user.username}
                      </div>
                      <div className="text-sm text-x-gray truncate">
                        @{user.username?.toLowerCase().replace(/\s/g, '')}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t border-x-border" />

                {/* Menu items */}
                <div className="py-1">
                  <button className="w-full flex items-center gap-3 px-4 py-3 text-white hover:bg-x-hover transition-colors">
                    <User className="w-5 h-5 text-x-gray" />
                    <span>Profile</span>
                  </button>
                  <button className="w-full flex items-center gap-3 px-4 py-3 text-white hover:bg-x-hover transition-colors">
                    <Trophy className="w-5 h-5 text-x-gray" />
                    <span>My Stats</span>
                  </button>
                  <button className="w-full flex items-center gap-3 px-4 py-3 text-white hover:bg-x-hover transition-colors">
                    <Timer className="w-5 h-5 text-x-gray" />
                    <span>My Runs</span>
                  </button>
                  <button className="w-full flex items-center gap-3 px-4 py-3 text-white hover:bg-x-hover transition-colors">
                    <Settings className="w-5 h-5 text-x-gray" />
                    <span>Settings</span>
                  </button>
                </div>

                <div className="border-t border-x-border" />

                {/* Logout */}
                <div className="py-1">
                  <button 
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 text-white hover:bg-x-hover transition-colors"
                  >
                    <LogOut className="w-5 h-5 text-x-gray" />
                    <span>Log out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
