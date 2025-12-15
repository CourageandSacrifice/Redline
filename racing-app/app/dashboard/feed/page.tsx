'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  Repeat2,
  MoreHorizontal,
  Play,
  Gauge,
  Timer,
  Flame,
  Loader2,
  Bookmark
} from 'lucide-react';
import Link from 'next/link';
import Comments from '@/components/Comments';

interface FeedPost {
  id: string;
  title: string;
  description: string;
  video_url: string | null;
  thumbnail_url: string | null;
  view_count: number;
  like_count: number;
  comment_count: number;
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
    top_speed: number;
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
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());
  const supabase = createClient();

  useEffect(() => {
    async function fetchPosts() {
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
          comment_count,
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
            quarter_mile_time,
            top_speed
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
        .limit(50);

      if (data) {
        setPosts(data as unknown as FeedPost[]);
      }
      setLoading(false);
    }

    fetchPosts();
  }, []);

  const toggleLike = async (postId: string) => {
    const newLiked = new Set(likedPosts);
    if (newLiked.has(postId)) {
      newLiked.delete(postId);
    } else {
      newLiked.add(postId);
    }
    setLikedPosts(newLiked);
  };

  const toggleComments = (postId: string) => {
    const newExpanded = new Set(expandedComments);
    if (newExpanded.has(postId)) {
      newExpanded.delete(postId);
    } else {
      newExpanded.add(postId);
    }
    setExpandedComments(newExpanded);
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'now';
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    if (days < 7) return `${days}d`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getCarBadgeClass = (carType: string) => {
    const badges: Record<string, string> = {
      jdm: 'bg-red-500/20 text-red-400 border-red-500/30',
      euro: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      muscle: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
      exotic: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      truck: 'bg-green-500/20 text-green-400 border-green-500/30',
    };
    return badges[carType] || 'bg-gray-500/20 text-gray-400 border-gray-500/30';
  };

  const isTextPost = (post: FeedPost) => {
    return !post.video_url && !post.thumbnail_url && !post.car_info?.[0];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-accent animate-spin" />
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Flame className="w-16 h-16 text-x-gray mx-auto mb-4 opacity-30" />
          <h2 className="text-xl font-display font-bold text-x-white mb-2">No Posts Yet</h2>
          <p className="text-x-gray mb-6">Be the first to post something!</p>
          <Link href="/dashboard/upload" className="btn-accent">
            Create Post
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="divide-y divide-x-border">
        {posts.map((post) => (
          <article key={post.id} className="py-4 hover:bg-white/[0.02] transition-colors">
            {isTextPost(post) ? (
              /* ==================== TEXT POST (Tweet Style) ==================== */
              <div className="px-4">
                <div className="flex gap-3">
                  {/* Avatar */}
                  <Link href={`/dashboard/channels/${post.collection?.channel?.id}`} className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center text-accent font-bold">
                      {post.collection?.channel?.avatar_url ? (
                        <img 
                          src={post.collection.channel.avatar_url} 
                          alt="" 
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        post.collection?.channel?.name?.charAt(0).toUpperCase() || 'R'
                      )}
                    </div>
                  </Link>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    {/* Header */}
                    <div className="flex items-center gap-2 mb-1">
                      <Link 
                        href={`/dashboard/channels/${post.collection?.channel?.id}`}
                        className="font-bold text-x-white hover:underline truncate"
                      >
                        {post.collection?.channel?.name || 'Unknown'}
                      </Link>
                      <span className="text-x-gray">·</span>
                      <span className="text-x-gray text-sm">{formatTime(post.created_at)}</span>
                      <button className="ml-auto text-x-gray hover:text-accent p-1 rounded-full hover:bg-accent/10">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Title as main content for text posts */}
                    <p className="text-x-white text-[15px] leading-relaxed whitespace-pre-wrap mb-1">
                      {post.title}
                    </p>

                    {/* Description if any */}
                    {post.description && (
                      <p className="text-x-lightgray text-[15px] leading-relaxed whitespace-pre-wrap">
                        {post.description}
                      </p>
                    )}

                    {/* Actions */}
                    <div className="flex items-center justify-between mt-3 max-w-md">
                      <button 
                        onClick={() => toggleComments(post.id)}
                        className="flex items-center gap-2 text-x-gray hover:text-accent group"
                      >
                        <div className="p-2 rounded-full group-hover:bg-accent/10 transition-colors">
                          <MessageCircle className="w-[18px] h-[18px]" />
                        </div>
                        <span className="text-sm">{post.comment_count || 0}</span>
                      </button>

                      <button className="flex items-center gap-2 text-x-gray hover:text-green-500 group">
                        <div className="p-2 rounded-full group-hover:bg-green-500/10 transition-colors">
                          <Repeat2 className="w-[18px] h-[18px]" />
                        </div>
                        <span className="text-sm">0</span>
                      </button>

                      <button 
                        onClick={() => toggleLike(post.id)}
                        className={`flex items-center gap-2 group ${likedPosts.has(post.id) ? 'text-pink-500' : 'text-x-gray hover:text-pink-500'}`}
                      >
                        <div className="p-2 rounded-full group-hover:bg-pink-500/10 transition-colors">
                          <Heart className={`w-[18px] h-[18px] ${likedPosts.has(post.id) ? 'fill-current' : ''}`} />
                        </div>
                        <span className="text-sm">{post.like_count + (likedPosts.has(post.id) ? 1 : 0)}</span>
                      </button>

                      <button className="flex items-center gap-2 text-x-gray hover:text-accent group">
                        <div className="p-2 rounded-full group-hover:bg-accent/10 transition-colors">
                          <Bookmark className="w-[18px] h-[18px]" />
                        </div>
                      </button>

                      <button className="flex items-center gap-2 text-x-gray hover:text-accent group">
                        <div className="p-2 rounded-full group-hover:bg-accent/10 transition-colors">
                          <Share2 className="w-[18px] h-[18px]" />
                        </div>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Comments Section */}
                {expandedComments.has(post.id) && (
                  <div className="mt-4 ml-13 pl-10 border-l border-x-border">
                    <Comments clipId={post.id} commentCount={post.comment_count || 0} />
                  </div>
                )}
              </div>
            ) : (
              /* ==================== VIDEO POST (Card Style) ==================== */
              <div className="px-4">
                <div className="flex gap-3">
                  {/* Avatar */}
                  <Link href={`/dashboard/channels/${post.collection?.channel?.id}`} className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center text-accent font-bold">
                      {post.collection?.channel?.avatar_url ? (
                        <img 
                          src={post.collection.channel.avatar_url} 
                          alt="" 
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        post.collection?.channel?.name?.charAt(0).toUpperCase() || 'R'
                      )}
                    </div>
                  </Link>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    {/* Header */}
                    <div className="flex items-center gap-2 mb-1">
                      <Link 
                        href={`/dashboard/channels/${post.collection?.channel?.id}`}
                        className="font-bold text-x-white hover:underline truncate"
                      >
                        {post.collection?.channel?.name || 'Unknown'}
                      </Link>
                      <span className="text-x-gray">·</span>
                      <span className="text-x-gray text-sm">{formatTime(post.created_at)}</span>
                      <button className="ml-auto text-x-gray hover:text-accent p-1 rounded-full hover:bg-accent/10">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Title */}
                    <h3 className="text-x-white font-semibold mb-2">{post.title}</h3>

                    {/* Description */}
                    {post.description && (
                      <p className="text-x-lightgray text-sm mb-3 line-clamp-2">{post.description}</p>
                    )}

                    {/* Video/Thumbnail Card */}
                    <Link 
                      href={`/dashboard/channels/${post.collection?.channel?.id}/collections/${post.collection?.id}/clips/${post.id}`}
                      className="block rounded-2xl overflow-hidden border border-x-border hover:border-x-gray transition-colors"
                    >
                      {/* Video/Image */}
                      <div className="relative aspect-video bg-dark-400">
                        {post.thumbnail_url ? (
                          <img 
                            src={post.thumbnail_url} 
                            alt={post.title}
                            className="w-full h-full object-cover"
                          />
                        ) : post.video_url ? (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-accent/20 to-accent/5">
                            <Play className="w-16 h-16 text-white/50" />
                          </div>
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-dark-300">
                            <Gauge className="w-12 h-12 text-x-gray/30" />
                          </div>
                        )}

                        {/* Play button overlay */}
                        {(post.video_url || post.thumbnail_url) && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 hover:opacity-100 transition-opacity">
                            <div className="w-16 h-16 rounded-full bg-accent/90 flex items-center justify-center">
                              <Play className="w-8 h-8 text-white ml-1" />
                            </div>
                          </div>
                        )}

                        {/* Performance overlay */}
                        {post.performance_stats?.[0] && (
                          <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
                            <div className="flex items-center gap-4">
                              {post.performance_stats[0].zero_to_60_mph && (
                                <div className="flex items-center gap-1">
                                  <Timer className="w-4 h-4 text-green-400" />
                                  <span className="text-green-400 text-sm font-bold">
                                    {post.performance_stats[0].zero_to_60_mph}s
                                  </span>
                                  <span className="text-white/60 text-xs">0-60</span>
                                </div>
                              )}
                              {post.performance_stats[0].quarter_mile_time && (
                                <div className="flex items-center gap-1">
                                  <Gauge className="w-4 h-4 text-accent" />
                                  <span className="text-accent text-sm font-bold">
                                    {post.performance_stats[0].quarter_mile_time}s
                                  </span>
                                  <span className="text-white/60 text-xs">1/4 mi</span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Car Info Bar */}
                      {post.car_info?.[0] && (
                        <div className="p-3 bg-dark-300 flex items-center gap-3">
                          <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase border ${getCarBadgeClass(post.car_info[0].car_type)}`}>
                            {post.car_info[0].car_type}
                          </span>
                          <span className="text-x-white text-sm font-medium">
                            {post.car_info[0].year} {post.car_info[0].make} {post.car_info[0].model}
                          </span>
                          {post.car_info[0].horsepower && (
                            <span className="text-accent text-sm font-bold ml-auto">
                              {post.car_info[0].horsepower}hp
                            </span>
                          )}
                        </div>
                      )}
                    </Link>

                    {/* Actions */}
                    <div className="flex items-center justify-between mt-3 max-w-md">
                      <button 
                        onClick={() => toggleComments(post.id)}
                        className="flex items-center gap-2 text-x-gray hover:text-accent group"
                      >
                        <div className="p-2 rounded-full group-hover:bg-accent/10 transition-colors">
                          <MessageCircle className="w-[18px] h-[18px]" />
                        </div>
                        <span className="text-sm">{post.comment_count || 0}</span>
                      </button>

                      <button className="flex items-center gap-2 text-x-gray hover:text-green-500 group">
                        <div className="p-2 rounded-full group-hover:bg-green-500/10 transition-colors">
                          <Repeat2 className="w-[18px] h-[18px]" />
                        </div>
                        <span className="text-sm">0</span>
                      </button>

                      <button 
                        onClick={() => toggleLike(post.id)}
                        className={`flex items-center gap-2 group ${likedPosts.has(post.id) ? 'text-pink-500' : 'text-x-gray hover:text-pink-500'}`}
                      >
                        <div className="p-2 rounded-full group-hover:bg-pink-500/10 transition-colors">
                          <Heart className={`w-[18px] h-[18px] ${likedPosts.has(post.id) ? 'fill-current' : ''}`} />
                        </div>
                        <span className="text-sm">{post.like_count + (likedPosts.has(post.id) ? 1 : 0)}</span>
                      </button>

                      <button className="flex items-center gap-2 text-x-gray hover:text-accent group">
                        <div className="p-2 rounded-full group-hover:bg-accent/10 transition-colors">
                          <Bookmark className="w-[18px] h-[18px]" />
                        </div>
                      </button>

                      <button className="flex items-center gap-2 text-x-gray hover:text-accent group">
                        <div className="p-2 rounded-full group-hover:bg-accent/10 transition-colors">
                          <Share2 className="w-[18px] h-[18px]" />
                        </div>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Comments Section */}
                {expandedComments.has(post.id) && (
                  <div className="mt-4 ml-13 pl-10 border-l border-x-border">
                    <Comments clipId={post.id} commentCount={post.comment_count || 0} />
                  </div>
                )}
              </div>
            )}
          </article>
        ))}
      </div>
    </div>
  );
}
