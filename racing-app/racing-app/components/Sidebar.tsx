'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Gauge, 
  ChevronDown, 
  ChevronRight, 
  Home,
  Play,
  Trophy,
  Timer,
  Settings,
  Users,
  BarChart3,
  Video,
  Flame,
  Upload
} from 'lucide-react';

interface Channel {
  id: string;
  name: string;
  avatar_url?: string;
  collections?: Collection[];
}

interface Collection {
  id: string;
  title: string;
  order_index: number;
  clips?: Clip[];
}

interface Clip {
  id: string;
  title: string;
  order_index: number;
}

interface SidebarProps {
  channels: Channel[];
  userRole: string;
}

export default function Sidebar({ channels, userRole }: SidebarProps) {
  const pathname = usePathname();
  const [expandedChannels, setExpandedChannels] = useState<string[]>([]);
  const [expandedCollections, setExpandedCollections] = useState<string[]>([]);

  // Extract current IDs from pathname
  const pathParts = pathname.split('/');
  const currentChannelId = pathParts[3];
  const currentCollectionId = pathParts[5];
  const currentClipId = pathParts[7];

  const toggleChannel = (channelId: string) => {
    setExpandedChannels(prev => 
      prev.includes(channelId) 
        ? prev.filter(id => id !== channelId)
        : [...prev, channelId]
    );
  };

  const toggleCollection = (collectionId: string) => {
    setExpandedCollections(prev => 
      prev.includes(collectionId) 
        ? prev.filter(id => id !== collectionId)
        : [...prev, collectionId]
    );
  };

  const navItems = [
    { href: '/dashboard', icon: Home, label: 'Home' },
    { href: '/dashboard/feed', icon: Flame, label: 'Feed' },
    { href: '/dashboard/explore', icon: Flame, label: 'Explore' },
    { href: '/speedometer', icon: Timer, label: 'Speedometer' },
    { href: '/dashboard/leaderboard', icon: Trophy, label: 'Leaderboard' },
  ];

  const creatorItems = [
    { href: '/dashboard/upload', icon: Upload, label: 'Upload Clip' },
    { href: '/dashboard/editor', icon: Video, label: 'Video Editor' },
    { href: '/dashboard/my-channel', icon: Video, label: 'My Channel' },
    { href: '/dashboard/analytics', icon: BarChart3, label: 'Analytics' },
  ];

  const adminItems = [
    { href: '/dashboard/users', icon: Users, label: 'Users' },
    { href: '/dashboard/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-[280px] bg-dark-600 border-r border-racing-900 flex flex-col z-40">
      {/* Logo */}
      <div className="p-6 border-b border-racing-900">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-neon-purple to-neon-red rounded-xl shadow-neon-purple">
            <Gauge className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-display font-bold text-white tracking-wider">REDLINE</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Main nav */}
        <div>
          <div className="text-xs font-semibold text-gray-600 uppercase tracking-wider px-4 mb-3">
            Navigation
          </div>
          <div className="space-y-1">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`nav-item ${isActive ? 'active' : ''}`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-semibold">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Channels */}
        {channels.length > 0 && (
          <div>
            <div className="text-xs font-semibold text-gray-600 uppercase tracking-wider px-4 mb-3">
              Subscribed
            </div>
            <div className="space-y-1">
              {channels.map(channel => {
                const isExpanded = expandedChannels.includes(channel.id) || currentChannelId === channel.id;
                const sortedCollections = channel.collections?.sort((a, b) => a.order_index - b.order_index) || [];
                
                return (
                  <div key={channel.id}>
                    <button
                      onClick={() => toggleChannel(channel.id)}
                      className={`nav-item w-full justify-between ${currentChannelId === channel.id ? 'text-neon-purple' : ''}`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-6 h-6 rounded bg-gradient-to-br from-neon-purple to-neon-cyan flex items-center justify-center text-xs font-bold text-white">
                          {channel.avatar_url ? (
                            <img src={channel.avatar_url} alt="" className="w-full h-full rounded object-cover" />
                          ) : (
                            channel.name.charAt(0).toUpperCase()
                          )}
                        </div>
                        <span className="truncate font-semibold">{channel.name}</span>
                      </div>
                      <ChevronDown 
                        className={`w-4 h-4 flex-shrink-0 transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
                      />
                    </button>

                    {/* Collections dropdown */}
                    {isExpanded && sortedCollections.length > 0 && (
                      <div className="ml-4 mt-1 space-y-1 animate-slide-in-left">
                        {sortedCollections.map(collection => {
                          const isCollectionExpanded = expandedCollections.includes(collection.id) || currentCollectionId === collection.id;
                          const sortedClips = collection.clips?.sort((a, b) => a.order_index - b.order_index) || [];
                          
                          return (
                            <div key={collection.id}>
                              <button
                                onClick={() => toggleCollection(collection.id)}
                                className={`nav-item w-full text-sm py-2 ${currentCollectionId === collection.id ? 'text-neon-cyan' : ''}`}
                              >
                                <ChevronRight 
                                  className={`w-4 h-4 flex-shrink-0 transition-transform ${isCollectionExpanded ? 'rotate-90' : ''}`}
                                />
                                <span className="truncate flex-1 text-left">{collection.title}</span>
                                <span className="text-xs text-gray-600">{sortedClips.length}</span>
                              </button>

                              {/* Clips list */}
                              {isCollectionExpanded && sortedClips.length > 0 && (
                                <div className="ml-4 mt-1 space-y-0.5 border-l border-racing-800 pl-3 animate-slide-in-left">
                                  {sortedClips.map(clip => {
                                    const isClipActive = currentClipId === clip.id;
                                    return (
                                      <Link
                                        key={clip.id}
                                        href={`/dashboard/channels/${channel.id}/collections/${collection.id}/clips/${clip.id}`}
                                        className={`block py-2 px-3 text-sm rounded-lg transition-colors ${
                                          isClipActive 
                                            ? 'bg-neon-purple/20 text-neon-purple border-l-2 border-neon-purple -ml-[13px] pl-[23px]' 
                                            : 'text-gray-400 hover:text-white hover:bg-white/5'
                                        }`}
                                      >
                                        <div className="flex items-center gap-2">
                                          <Play className="w-3 h-3 flex-shrink-0" />
                                          <span className="truncate">{clip.title}</span>
                                        </div>
                                      </Link>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Creator section */}
        {(userRole === 'creator' || userRole === 'admin') && (
          <div>
            <div className="text-xs font-semibold text-gray-600 uppercase tracking-wider px-4 mb-3">
              Creator
            </div>
            <div className="space-y-1">
              {creatorItems.map(item => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`nav-item ${isActive ? 'active' : ''}`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-semibold">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* Admin section */}
        {userRole === 'admin' && (
          <div>
            <div className="text-xs font-semibold text-gray-600 uppercase tracking-wider px-4 mb-3">
              Admin
            </div>
            <div className="space-y-1">
              {adminItems.map(item => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`nav-item ${isActive ? 'active' : ''}`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-semibold">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </nav>

      {/* Speedometer promo */}
      <div className="p-4 border-t border-racing-900">
        <Link 
          href="/speedometer"
          className="block glass rounded-xl p-4 hover:shadow-neon-purple transition-all"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-neon-green/20 rounded-lg">
              <Timer className="w-5 h-5 text-neon-green" />
            </div>
            <div>
              <div className="text-sm font-display font-semibold text-white">GPS TIMER</div>
              <div className="text-xs text-gray-500">Track your runs</div>
            </div>
          </div>
          <div className="text-xs text-gray-400">
            0-60, 0-100, 1/4 mile times
          </div>
        </Link>
      </div>
    </aside>
  );
}
