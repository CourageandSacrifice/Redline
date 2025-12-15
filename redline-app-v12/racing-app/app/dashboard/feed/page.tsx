'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  Volume2, 
  VolumeX,
  Play,
  Pause,
  ChevronUp,
  ChevronDown,
  Gauge,
  Timer,
  User,
  Flame
} from 'lucide-react';
import Link from 'next/link';

interface FeedClip {
  id: string;
  title: string;
  description: string;
  video_url: string;
  thumbnail_url: string;
  view_count: number;
  like_count: number;
  created_at: string;
  car_info: {
    make: string;
    model: string;
    year: number;
    car_type: string;
    horsepower: number;
  }[];
  performance_stats: {
    zero_to_60_mph: number;
    quarter_mile_time: number;
  }[];
  collection: {
    id: string;
    channel: {
      id: string;
      name: string;
      avatar_url: string;
    };
  };
}

export default function FeedPage() {
  const [clips, setClips] = useState<FeedClip[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [muted, setMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const [likedClips, setLikedClips] = useState<Set<string>>(new Set());
  const containerRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  // Fetch clips
  useEffect(() => {
    async function fetchClips() {
      const { data, error } = await supabase
        .from('clips')
        .select(`
          id,
          title,
          description,
          video_url,
          thumbnail_url,
          view_count,
          like_count,
          created_at,
          car_info (
            make,
            model,
            year,
            car_type,
            horsepower
          ),
          performance_stats (
            zero_to_60_mph,
            quarter_mile_time
          ),
          collection:collections (
            id,
            channel:channels (
              id,
              name,
              avatar_url
            )
          )
        `)
        .eq('is_published', true)
        .order('created_at', { ascending: false })
        .limit(20);

      if (data) {
        setClips(data as unknown as FeedClip[]);
      }
      setLoading(false);
    }

    fetchClips();
  }, []);

  // Handle scroll/swipe
  const goToClip = useCallback((index: number) => {
    if (index >= 0 && index < clips.length) {
      setCurrentIndex(index);
    }
  }, [clips.length]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp') {
        goToClip(currentIndex - 1);
      } else if (e.key === 'ArrowDown') {
        goToClip(currentIndex + 1);
      } else if (e.key === ' ') {
        e.preventDefault();
        setIsPlaying(prev => !prev);
      } else if (e.key === 'm') {
        setMuted(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, goToClip]);

  // Touch/scroll handling
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let startY = 0;
    let isDragging = false;

    const handleTouchStart = (e: TouchEvent) => {
      startY = e.touches[0].clientY;
      isDragging = true;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!isDragging) return;
      const endY = e.changedTouches[0].clientY;
      const diff = startY - endY;

      if (Math.abs(diff) > 50) {
        if (diff > 0) {
          goToClip(currentIndex + 1);
        } else {
          goToClip(currentIndex - 1);
        }
      }
      isDragging = false;
    };

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (e.deltaY > 0) {
        goToClip(currentIndex + 1);
      } else {
        goToClip(currentIndex - 1);
      }
    };

    container.addEventListener('touchstart', handleTouchStart);
    container.addEventListener('touchend', handleTouchEnd);
    container.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchend', handleTouchEnd);
      container.removeEventListener('wheel', handleWheel);
    };
  }, [currentIndex, goToClip]);

  // Toggle like
  const toggleLike = async (clipId: string) => {
    const newLiked = new Set(likedClips);
    if (newLiked.has(clipId)) {
      newLiked.delete(clipId);
    } else {
      newLiked.add(clipId);
    }
    setLikedClips(newLiked);
  };

  // Get car badge class
  const getCarBadgeClass = (carType: string) => {
    const badges: Record<string, string> = {
      jdm: 'bg-red-500/20 text-red-400',
      euro: 'bg-blue-500/20 text-blue-400',
      muscle: 'bg-orange-500/20 text-orange-400',
      exotic: 'bg-purple-500/20 text-purple-400',
    };
    return badges[carType] || 'bg-gray-500/20 text-gray-400';
  };

  if (loading) {
    return (
      <div className="h-[calc(100vh-64px)] flex items-center justify-center">
        <div className="text-center">
          <Gauge className="w-12 h-12 text-neon-purple animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading feed...</p>
        </div>
      </div>
    );
  }

  if (clips.length === 0) {
    return (
      <div className="h-[calc(100vh-64px)] flex items-center justify-center">
        <div className="text-center">
          <Flame className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h2 className="text-xl font-display font-bold text-white mb-2">No Clips Yet</h2>
          <p className="text-gray-400 mb-6">Be the first to post a clip!</p>
          <Link href="/dashboard/upload" className="btn-neon">
            Upload Clip
          </Link>
        </div>
      </div>
    );
  }

  const currentClip = clips[currentIndex];

  return (
    <div 
      ref={containerRef}
      className="h-[calc(100vh-64px)] -m-8 overflow-hidden relative bg-black"
    >
      {/* Navigation hints */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 px-4 py-2 bg-black/50 backdrop-blur rounded-full">
        <span className="text-xs text-gray-400">
          {currentIndex + 1} / {clips.length}
        </span>
      </div>

      {/* Up arrow */}
      {currentIndex > 0 && (
        <button
          onClick={() => goToClip(currentIndex - 1)}
          className="absolute top-20 left-1/2 -translate-x-1/2 z-20 p-2 bg-black/30 rounded-full text-white/70 hover:text-white hover:bg-black/50 transition-all"
        >
          <ChevronUp className="w-6 h-6" />
        </button>
      )}

      {/* Down arrow */}
      {currentIndex < clips.length - 1 && (
        <button
          onClick={() => goToClip(currentIndex + 1)}
          className="absolute bottom-20 left-1/2 -translate-x-1/2 z-20 p-2 bg-black/30 rounded-full text-white/70 hover:text-white hover:bg-black/50 transition-all"
        >
          <ChevronDown className="w-6 h-6" />
        </button>
      )}

      {/* Video container */}
      <div className="h-full flex items-center justify-center">
        <div className="relative w-full max-w-lg h-full">
          {/* Video/Thumbnail */}
          <div className="absolute inset-0 bg-dark-500">
            {currentClip.video_url ? (
              <iframe
                src={`${currentClip.video_url}${currentClip.video_url.includes('?') ? '&' : '?'}autoplay=1&mute=${muted ? 1 : 0}`}
                className="w-full h-full object-cover"
                allow="autoplay; fullscreen"
              />
            ) : currentClip.thumbnail_url ? (
              <img 
                src={currentClip.thumbnail_url} 
                alt={currentClip.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-neon-purple/20 to-neon-cyan/20">
                <Play className="w-20 h-20 text-white/30" />
              </div>
            )}
          </div>

          {/* Gradient overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none" />

          {/* Right side actions */}
          <div className="absolute right-4 bottom-32 flex flex-col items-center gap-6 z-10">
            {/* Like */}
            <button 
              onClick={() => toggleLike(currentClip.id)}
              className="flex flex-col items-center gap-1"
            >
              <div className={`p-3 rounded-full ${likedClips.has(currentClip.id) ? 'bg-neon-pink text-white' : 'bg-black/50 text-white'} transition-all`}>
                <Heart className={`w-7 h-7 ${likedClips.has(currentClip.id) ? 'fill-current' : ''}`} />
              </div>
              <span className="text-xs text-white font-semibold">
                {(currentClip.like_count + (likedClips.has(currentClip.id) ? 1 : 0)).toLocaleString()}
              </span>
            </button>

            {/* Comments */}
            <button className="flex flex-col items-center gap-1">
              <div className="p-3 rounded-full bg-black/50 text-white">
                <MessageCircle className="w-7 h-7" />
              </div>
              <span className="text-xs text-white font-semibold">0</span>
            </button>

            {/* Share */}
            <button className="flex flex-col items-center gap-1">
              <div className="p-3 rounded-full bg-black/50 text-white">
                <Share2 className="w-7 h-7" />
              </div>
              <span className="text-xs text-white font-semibold">Share</span>
            </button>

            {/* Mute toggle */}
            <button 
              onClick={() => setMuted(!muted)}
              className="p-3 rounded-full bg-black/50 text-white"
            >
              {muted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
            </button>
          </div>

          {/* Bottom info */}
          <div className="absolute bottom-0 left-0 right-16 p-4 z-10">
            {/* Channel info */}
            <Link 
              href={`/dashboard/channels/${currentClip.collection?.channel?.id}`}
              className="flex items-center gap-3 mb-3"
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-neon-purple to-neon-cyan flex items-center justify-center text-white font-bold">
                {currentClip.collection?.channel?.avatar_url ? (
                  <img 
                    src={currentClip.collection.channel.avatar_url} 
                    alt="" 
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  currentClip.collection?.channel?.name?.charAt(0) || 'R'
                )}
              </div>
              <span className="font-display font-semibold text-white">
                @{currentClip.collection?.channel?.name?.toLowerCase().replace(/\s/g, '')}
              </span>
            </Link>

            {/* Title */}
            <h2 className="font-display font-bold text-white text-lg mb-2">
              {currentClip.title}
            </h2>

            {/* Car info */}
            {currentClip.car_info?.[0] && (
              <div className="flex items-center gap-2 mb-2">
                <span className={`px-2 py-1 rounded text-xs font-semibold uppercase ${getCarBadgeClass(currentClip.car_info[0].car_type)}`}>
                  {currentClip.car_info[0].car_type}
                </span>
                <span className="text-white text-sm">
                  {currentClip.car_info[0].year} {currentClip.car_info[0].make} {currentClip.car_info[0].model}
                </span>
                {currentClip.car_info[0].horsepower && (
                  <span className="text-neon-purple text-sm font-semibold">
                    {currentClip.car_info[0].horsepower}hp
                  </span>
                )}
              </div>
            )}

            {/* Performance stats */}
            {currentClip.performance_stats?.[0] && (
              <div className="flex items-center gap-4">
                {currentClip.performance_stats[0].zero_to_60_mph && (
                  <div className="flex items-center gap-1">
                    <Timer className="w-4 h-4 text-neon-green" />
                    <span className="text-neon-green text-sm font-display font-bold">
                      {currentClip.performance_stats[0].zero_to_60_mph}s
                    </span>
                    <span className="text-gray-400 text-xs">0-60</span>
                  </div>
                )}
                {currentClip.performance_stats[0].quarter_mile_time && (
                  <div className="flex items-center gap-1">
                    <Gauge className="w-4 h-4 text-neon-cyan" />
                    <span className="text-neon-cyan text-sm font-display font-bold">
                      {currentClip.performance_stats[0].quarter_mile_time}s
                    </span>
                    <span className="text-gray-400 text-xs">1/4 mi</span>
                  </div>
                )}
              </div>
            )}

            {/* Description */}
            {currentClip.description && (
              <p className="text-gray-300 text-sm mt-2 line-clamp-2">
                {currentClip.description}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Keyboard hints */}
      <div className="absolute bottom-4 left-4 text-xs text-gray-500 hidden md:block">
        <span className="mr-4">↑↓ Navigate</span>
        <span className="mr-4">Space: Play/Pause</span>
        <span>M: Mute</span>
      </div>
    </div>
  );
}
