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
  Video,
  Flame,
  Upload,
  Scissors,
  MoreHorizontal
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

  const mainNavItems = [
    { href: '/dashboard', icon: Home, label: 'Home' },
    { href: '/dashboard/feed', icon: Flame, label: 'Feed' },
    { href: '/speedometer', icon: Timer, label: 'Speedometer' },
    { href: '/dashboard/leaderboard', icon: Trophy, label: 'Leaderboard' },
  ];

  const creatorItems = [
    { href: '/dashboard/upload', icon: Upload, label: 'Upload' },
    { href: '/dashboard/editor', icon: Scissors, label: 'Editor' },
    { href: '/dashboard/my-channel', icon: Video, label: 'My Channel' },
  ];

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-[275px] bg-black border-r border-x-border flex flex-col z-40">
      {/* Logo */}
      <div className="p-4">
        <Link href="/dashboard" className="inline-flex p-3 rounded-full hover:bg-x-hover transition-colors">
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
            <Gauge className="w-5 h-5 text-black" />
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-2">
        {/* Main nav */}
        <div className="space-y-1">
          {mainNavItems.map(item => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`nav-item ${isActive ? 'active' : ''}`}
              >
                <Icon className="w-7 h-7" strokeWidth={isActive ? 2.5 : 2} />
                <span className={`text-xl ${isActive ? 'font-bold' : ''}`}>{item.label}</span>
              </Link>
            );
          })}
        </div>

        {/* Creator section */}
        {(userRole === 'creator' || userRole === 'admin') && (
          <div className="mt-2 pt-2 border-t border-x-border">
            {creatorItems.map(item => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`nav-item ${isActive ? 'active' : ''}`}
                >
                  <Icon className="w-7 h-7" strokeWidth={isActive ? 2.5 : 2} />
                  <span className={`text-xl ${isActive ? 'font-bold' : ''}`}>{item.label}</span>
                </Link>
              );
            })}
          </div>
        )}

        {/* Post button */}
        <div className="mt-4 px-2">
          <Link
            href="/dashboard/upload"
            className="w-full py-3.5 bg-neon-red text-white rounded-full font-display font-bold text-lg tracking-wide flex items-center justify-center hover:bg-red-600 transition-colors shadow-neon-red"
          >
            Post
          </Link>
        </div>

        {/* Subscribed channels */}
        {channels.length > 0 && (
          <div className="mt-6 pt-4 border-t border-x-border">
            <div className="px-4 mb-2">
              <span className="text-x-gray text-sm font-semibold">Subscribed</span>
            </div>
            <div className="space-y-1">
              {channels.map(channel => {
                const isExpanded = expandedChannels.includes(channel.id) || currentChannelId === channel.id;
                const sortedCollections = channel.collections?.sort((a, b) => a.order_index - b.order_index) || [];
                
                return (
                  <div key={channel.id}>
                    <button
                      onClick={() => toggleChannel(channel.id)}
                      className={`w-full flex items-center gap-3 px-4 py-2 rounded-full hover:bg-x-hover transition-colors ${
                        currentChannelId === channel.id ? 'bg-x-hover' : ''
                      }`}
                    >
                      <div className="w-8 h-8 rounded-full bg-x-darkgray flex items-center justify-center text-sm font-bold text-white overflow-hidden">
                        {channel.avatar_url ? (
                          <img src={channel.avatar_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          channel.name.charAt(0).toUpperCase()
                        )}
                      </div>
                      <span className="flex-1 text-left text-white truncate">{channel.name}</span>
                      <ChevronDown 
                        className={`w-4 h-4 text-x-gray transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
                      />
                    </button>

                    {isExpanded && sortedCollections.length > 0 && (
                      <div className="ml-6 mt-1 space-y-0.5 animate-fade-in">
                        {sortedCollections.map(collection => {
                          const isCollectionExpanded = expandedCollections.includes(collection.id) || currentCollectionId === collection.id;
                          const sortedClips = collection.clips?.sort((a, b) => a.order_index - b.order_index) || [];
                          
                          return (
                            <div key={collection.id}>
                              <button
                                onClick={() => toggleCollection(collection.id)}
                                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:bg-x-hover transition-colors ${
                                  currentCollectionId === collection.id ? 'text-neon-red' : 'text-x-gray'
                                }`}
                              >
                                <ChevronRight 
                                  className={`w-4 h-4 transition-transform ${isCollectionExpanded ? 'rotate-90' : ''}`}
                                />
                                <span className="truncate">{collection.title}</span>
                              </button>

                              {isCollectionExpanded && sortedClips.length > 0 && (
                                <div className="ml-4 border-l border-x-border pl-2 animate-fade-in">
                                  {sortedClips.map(clip => (
                                    <Link
                                      key={clip.id}
                                      href={`/dashboard/channels/${channel.id}/collections/${collection.id}/clips/${clip.id}`}
                                      className={`flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg transition-colors ${
                                        currentClipId === clip.id 
                                          ? 'text-neon-red bg-neon-red/10' 
                                          : 'text-x-gray hover:text-white hover:bg-x-hover'
                                      }`}
                                    >
                                      <Play className="w-3 h-3" />
                                      <span className="truncate">{clip.title}</span>
                                    </Link>
                                  ))}
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
      </nav>

      {/* Bottom section */}
      <div className="p-4 border-t border-x-border">
        <button className="w-full flex items-center gap-3 p-3 rounded-full hover:bg-x-hover transition-colors">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-neon-red to-red-800 flex items-center justify-center text-white font-bold">
            R
          </div>
          <div className="flex-1 text-left">
            <div className="text-white font-semibold text-sm">Redline User</div>
            <div className="text-x-gray text-sm">@{userRole}</div>
          </div>
          <MoreHorizontal className="w-5 h-5 text-x-gray" />
        </button>
      </div>
    </aside>
  );
}
