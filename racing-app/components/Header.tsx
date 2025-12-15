'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { 
  Search, 
  User, 
  Settings, 
  LogOut,
  Trophy,
  Timer,
  ChevronDown
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

  const closeDropdown = () => setDropdownOpen(false);

  return (
    <header className="h-14 border-b border-x-border bg-dark-300/80 backdrop-blur-md sticky top-0 z-30">
      <div className="h-full px-6 flex items-center justify-between">
        {/* Search bar */}
        <div className="flex-1 max-w-lg">
          <div className={`search-bar ${searchFocused ? 'border-accent' : ''}`}>
            <Search className={`w-5 h-5 ${searchFocused ? 'text-accent' : 'text-x-gray'}`} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              placeholder="Search clips, channels, cars..."
              className="flex-1 bg-transparent text-x-white placeholder-x-gray focus:outline-none font-body"
            />
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-4 ml-6">
          {/* Profile dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 p-1.5 rounded-full hover:bg-white/5 transition-colors"
            >
              <div className="w-9 h-9 rounded-full bg-accent flex items-center justify-center text-white font-bold text-sm">
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
              <ChevronDown className={`w-4 h-4 text-x-gray transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown menu */}
            {dropdownOpen && (
              <div className="absolute right-0 top-full mt-2 w-64 card shadow-lg overflow-hidden animate-fade-in">
                {/* User info header */}
                <div className="p-4 border-b border-x-border">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full bg-accent flex items-center justify-center text-white font-bold">
                      {user.username?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-x-white truncate">
                        {user.username}
                      </div>
                      <div className="text-sm text-x-gray truncate">
                        @{user.username?.toLowerCase().replace(/\s/g, '')}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Menu items */}
                <div className="py-2">
                  <Link 
                    href="/dashboard/profile"
                    onClick={closeDropdown}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-x-white hover:bg-white/5 transition-colors"
                  >
                    <User className="w-5 h-5 text-x-gray" />
                    <span>Profile</span>
                  </Link>
                  <Link 
                    href="/dashboard/stats"
                    onClick={closeDropdown}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-x-white hover:bg-white/5 transition-colors"
                  >
                    <Trophy className="w-5 h-5 text-x-gray" />
                    <span>My Stats</span>
                  </Link>
                  <Link 
                    href="/dashboard/runs"
                    onClick={closeDropdown}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-x-white hover:bg-white/5 transition-colors"
                  >
                    <Timer className="w-5 h-5 text-x-gray" />
                    <span>My Runs</span>
                  </Link>
                  <Link 
                    href="/dashboard/settings"
                    onClick={closeDropdown}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-x-white hover:bg-white/5 transition-colors"
                  >
                    <Settings className="w-5 h-5 text-x-gray" />
                    <span>Settings</span>
                  </Link>
                </div>

                <div className="border-t border-x-border py-2">
                  <button 
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-accent hover:bg-accent/10 transition-colors text-left"
                  >
                    <LogOut className="w-5 h-5" />
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
