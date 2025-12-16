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
  ChevronDown,
  Car,
  Film,
  Users,
  Loader2,
  X
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

interface SearchResult {
  type: 'clip' | 'channel' | 'car';
  id: string;
  title: string;
  subtitle: string;
  link: string;
  image?: string;
}

export default function Header({ user }: HeaderProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const supabase = createClient();

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Search when query changes
  useEffect(() => {
    const search = async () => {
      if (searchQuery.length < 2) {
        setSearchResults([]);
        return;
      }

      setSearching(true);
      const results: SearchResult[] = [];
      const query = searchQuery.toLowerCase();

      // Search clips
      const { data: clips } = await supabase
        .from('clips')
        .select(`
          id,
          title,
          thumbnail_url,
          collection:collections (
            id,
            channel:channels (
              id,
              name
            )
          )
        `)
        .ilike('title', `%${query}%`)
        .eq('is_published', true)
        .limit(5);

      if (clips) {
        clips.forEach((clip: any) => {
          results.push({
            type: 'clip',
            id: clip.id,
            title: clip.title,
            subtitle: clip.collection?.channel?.name || 'Unknown channel',
            link: `/dashboard/channels/${clip.collection?.channel?.id}/collections/${clip.collection?.id}/clips/${clip.id}`,
            image: clip.thumbnail_url,
          });
        });
      }

      // Search channels
      const { data: channels } = await supabase
        .from('channels')
        .select('id, name, avatar_url, description')
        .ilike('name', `%${query}%`)
        .limit(5);

      if (channels) {
        channels.forEach((channel: any) => {
          results.push({
            type: 'channel',
            id: channel.id,
            title: channel.name,
            subtitle: channel.description || 'Channel',
            link: `/dashboard/channels/${channel.id}`,
            image: channel.avatar_url,
          });
        });
      }

      // Search cars (by make/model)
      const { data: cars } = await supabase
        .from('car_info')
        .select(`
          id,
          make,
          model,
          year,
          car_type,
          clip:clips (
            id,
            title,
            collection:collections (
              id,
              channel:channels (id)
            )
          )
        `)
        .or(`make.ilike.%${query}%,model.ilike.%${query}%`)
        .limit(5);

      if (cars) {
        cars.forEach((car: any) => {
          if (car.clip) {
            results.push({
              type: 'car',
              id: car.id,
              title: `${car.year} ${car.make} ${car.model}`,
              subtitle: car.clip.title || car.car_type,
              link: `/dashboard/channels/${car.clip.collection?.channel?.id}/collections/${car.clip.collection?.id}/clips/${car.clip.id}`,
            });
          }
        });
      }

      setSearchResults(results);
      setSearching(false);
    };

    const debounce = setTimeout(search, 300);
    return () => clearTimeout(debounce);
  }, [searchQuery]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/auth/login');
    router.refresh();
  };

  const closeDropdown = () => setDropdownOpen(false);

  const handleResultClick = (link: string) => {
    setShowResults(false);
    setSearchQuery('');
    router.push(link);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'clip': return <Film className="w-4 h-4" />;
      case 'channel': return <Users className="w-4 h-4" />;
      case 'car': return <Car className="w-4 h-4" />;
      default: return <Search className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'clip': return 'text-accent';
      case 'channel': return 'text-blue-400';
      case 'car': return 'text-green-400';
      default: return 'text-x-gray';
    }
  };

  return (
    <header className="h-14 border-b border-x-border bg-dark-300/80 backdrop-blur-md sticky top-0 z-30">
      <div className="h-full px-6 flex items-center justify-between">
        {/* Search bar */}
        <div className="flex-1 max-w-lg relative" ref={searchRef}>
          <div className={`search-bar ${searchFocused ? 'border-accent' : ''}`}>
            <Search className={`w-5 h-5 ${searchFocused ? 'text-accent' : 'text-x-gray'}`} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowResults(true);
              }}
              onFocus={() => {
                setSearchFocused(true);
                if (searchQuery.length >= 2) setShowResults(true);
              }}
              onBlur={() => setSearchFocused(false)}
              placeholder="Search clips, channels, cars..."
              className="flex-1 bg-transparent text-x-white placeholder-x-gray focus:outline-none font-body"
            />
            {searchQuery && (
              <button 
                onClick={() => {
                  setSearchQuery('');
                  setSearchResults([]);
                }}
                className="p-1 hover:bg-white/10 rounded-full"
              >
                <X className="w-4 h-4 text-x-gray" />
              </button>
            )}
            {searching && <Loader2 className="w-4 h-4 text-accent animate-spin" />}
          </div>

          {/* Search Results Dropdown */}
          {showResults && searchQuery.length >= 2 && (
            <div className="absolute top-full left-0 right-0 mt-2 card shadow-lg overflow-hidden animate-fade-in max-h-96 overflow-y-auto">
              {searchResults.length === 0 && !searching ? (
                <div className="p-4 text-center text-x-gray">
                  <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No results for "{searchQuery}"</p>
                </div>
              ) : (
                <div className="py-2">
                  {searchResults.map((result) => (
                    <button
                      key={`${result.type}-${result.id}`}
                      onClick={() => handleResultClick(result.link)}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors text-left"
                    >
                      {/* Image or Icon */}
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        result.image ? '' : 'bg-dark-100'
                      }`}>
                        {result.image ? (
                          <img 
                            src={result.image} 
                            alt="" 
                            className="w-full h-full rounded-lg object-cover"
                          />
                        ) : (
                          <span className={getTypeColor(result.type)}>
                            {getTypeIcon(result.type)}
                          </span>
                        )}
                      </div>

                      {/* Text */}
                      <div className="flex-1 min-w-0">
                        <div className="text-x-white font-medium truncate">{result.title}</div>
                        <div className="text-sm text-x-gray truncate">{result.subtitle}</div>
                      </div>

                      {/* Type badge */}
                      <span className={`text-xs px-2 py-1 rounded-full bg-dark-100 ${getTypeColor(result.type)}`}>
                        {result.type}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
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
