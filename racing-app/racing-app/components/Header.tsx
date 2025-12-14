'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { 
  Search, 
  Bell, 
  ChevronDown, 
  User, 
  Settings, 
  LogOut,
  Video,
  Trophy,
  Timer
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

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin': 
        return 'bg-neon-red/20 text-neon-red border-neon-red/30';
      case 'creator': 
        return 'bg-neon-purple/20 text-neon-purple border-neon-purple/30';
      default: 
        return 'bg-neon-cyan/20 text-neon-cyan border-neon-cyan/30';
    }
  };

  return (
    <header className="h-16 border-b border-racing-900 bg-dark-600/80 backdrop-blur-md sticky top-0 z-30">
      <div className="h-full px-6 flex items-center justify-between">
        {/* Search bar */}
        <div className="flex-1 max-w-xl">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search clips, channels, cars..."
              className="w-full pl-12 pr-4 py-2.5 bg-dark-400 border border-racing-800 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-neon-purple/50 focus:shadow-neon-purple transition-all font-body"
            />
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-4 ml-6">
          {/* Notifications */}
          <button className="relative p-2.5 rounded-xl hover:bg-dark-400 text-gray-400 hover:text-white transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-neon-red rounded-full animate-pulse" />
          </button>

          {/* Profile dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-3 p-2 pr-4 rounded-xl hover:bg-dark-400 transition-colors"
            >
              {/* Avatar */}
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-neon-purple to-neon-cyan flex items-center justify-center text-white font-display font-bold shadow-neon-purple">
                {user.avatar_url ? (
                  <img 
                    src={user.avatar_url} 
                    alt={user.username}
                    className="w-full h-full rounded-xl object-cover"
                  />
                ) : (
                  user.username?.charAt(0).toUpperCase() || 'U'
                )}
              </div>
              
              {/* Name */}
              <div className="hidden md:block text-left">
                <div className="text-sm font-semibold text-white font-display tracking-wide">
                  {user.username?.toUpperCase() || 'USER'}
                </div>
                <div className="text-xs text-gray-500 capitalize">
                  {user.role}
                </div>
              </div>
              
              <ChevronDown 
                className={`w-4 h-4 text-gray-500 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} 
              />
            </button>

            {/* Dropdown menu */}
            {dropdownOpen && (
              <div className="absolute right-0 top-full mt-2 w-72 glass rounded-xl shadow-xl border border-racing-800 overflow-hidden animate-fade-in">
                {/* User info header */}
                <div className="p-4 border-b border-racing-800">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-neon-purple to-neon-cyan flex items-center justify-center text-white font-display font-bold text-lg shadow-neon-purple">
                      {user.username?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-display font-semibold text-white truncate tracking-wide">
                        {user.username?.toUpperCase()}
                      </div>
                      <div className="text-sm text-gray-400 truncate">
                        {user.email}
                      </div>
                    </div>
                  </div>
                  <div className={`inline-flex items-center gap-1.5 mt-3 px-2.5 py-1 rounded-full text-xs font-semibold border ${getRoleBadge(user.role)}`}>
                    <span className="w-1.5 h-1.5 rounded-full bg-current" />
                    <span className="uppercase tracking-wider">{user.role}</span>
                  </div>
                </div>

                {/* Menu items */}
                <div className="p-2">
                  <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-300 hover:text-white hover:bg-white/5 transition-colors">
                    <User className="w-5 h-5 text-gray-500" />
                    <span>Profile</span>
                  </button>
                  <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-300 hover:text-white hover:bg-white/5 transition-colors">
                    <Trophy className="w-5 h-5 text-gray-500" />
                    <span>My Stats</span>
                  </button>
                  <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-300 hover:text-white hover:bg-white/5 transition-colors">
                    <Timer className="w-5 h-5 text-gray-500" />
                    <span>My Runs</span>
                  </button>
                  <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-300 hover:text-white hover:bg-white/5 transition-colors">
                    <Settings className="w-5 h-5 text-gray-500" />
                    <span>Settings</span>
                  </button>
                </div>

                {/* Logout */}
                <div className="p-2 border-t border-racing-800">
                  <button 
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-neon-red hover:bg-neon-red/10 transition-colors"
                  >
                    <LogOut className="w-5 h-5" />
                    <span>Sign Out</span>
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
