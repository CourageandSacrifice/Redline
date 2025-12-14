import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { 
  ChevronLeft, 
  ChevronRight, 
  Play, 
  Heart, 
  Share2, 
  Eye,
  Gauge,
  Timer,
  Zap,
  Settings,
  Calendar,
  MapPin,
  Cloud,
  MessageCircle
} from 'lucide-react';
import Comments from '@/components/Comments';

interface ClipPageProps {
  params: {
    channelId: string;
    collectionId: string;
    clipId: string;
  };
}

export default async function ClipPage({ params }: ClipPageProps) {
  const supabase = createClient();

  // Get current clip with all details
  const { data: clip } = await supabase
    .from('clips')
    .select(`
      *,
      car_info (*),
      performance_stats (*),
      collection:collections (
        id,
        title,
        channel:channels (
          id,
          name,
          avatar_url,
          subscriber_count
        )
      )
    `)
    .eq('id', params.clipId)
    .single();

  if (!clip) {
    notFound();
  }

  // Get all clips in the collection for navigation
  const { data: allClips } = await supabase
    .from('clips')
    .select('id, title, order_index, thumbnail_url')
    .eq('collection_id', params.collectionId)
    .order('order_index', { ascending: true });

  // Find current clip index and determine prev/next
  const currentIndex = allClips?.findIndex((c) => c.id === params.clipId) || 0;
  const prevClip = currentIndex > 0 ? allClips?.[currentIndex - 1] : null;
  const nextClip = currentIndex < (allClips?.length || 0) - 1 ? allClips?.[currentIndex + 1] : null;

  const carInfo = clip.car_info?.[0];
  const perfStats = clip.performance_stats?.[0];

  const getCarBadgeClass = (carType: string) => {
    const badges: Record<string, string> = {
      jdm: 'car-badge-jdm',
      euro: 'car-badge-euro',
      muscle: 'car-badge-muscle',
      exotic: 'car-badge-exotic',
    };
    return badges[carType] || 'bg-gray-500/20 text-gray-400 border-gray-500/30';
  };

  return (
    <div className="max-w-6xl mx-auto animate-fade-in">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
        <Link href="/dashboard" className="hover:text-white transition-colors">
          Home
        </Link>
        <ChevronRight className="w-4 h-4" />
        <Link 
          href={`/dashboard/channels/${params.channelId}`} 
          className="hover:text-white transition-colors"
        >
          {clip.collection?.channel?.name}
        </Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-gray-500">{clip.collection?.title}</span>
      </div>

      {/* Navigation header */}
      <div className="glass rounded-xl p-4 mb-6">
        <div className="flex items-center justify-between">
          {/* Previous */}
          {prevClip ? (
            <Link
              href={`/dashboard/channels/${params.channelId}/collections/${params.collectionId}/clips/${prevClip.id}`}
              className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-all group"
            >
              <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              <div className="text-left hidden sm:block">
                <div className="text-xs text-gray-500 uppercase tracking-wider">Previous</div>
                <div className="text-sm line-clamp-1">{prevClip.title}</div>
              </div>
            </Link>
          ) : (
            <div className="w-32" />
          )}

          {/* Title */}
          <div className="text-center flex-1 px-4">
            <div className="text-xs text-neon-purple uppercase tracking-wider mb-1">
              {clip.collection?.title}
            </div>
            <h1 className="text-xl font-display font-bold text-white tracking-wide">
              {clip.title.toUpperCase()}
            </h1>
            <div className="text-sm text-gray-500 mt-1">
              Clip {currentIndex + 1} of {allClips?.length}
            </div>
          </div>

          {/* Next */}
          {nextClip ? (
            <Link
              href={`/dashboard/channels/${params.channelId}/collections/${params.collectionId}/clips/${nextClip.id}`}
              className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-all group"
            >
              <div className="text-right hidden sm:block">
                <div className="text-xs text-gray-500 uppercase tracking-wider">Next</div>
                <div className="text-sm line-clamp-1">{nextClip.title}</div>
              </div>
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          ) : (
            <div className="w-32" />
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Video section */}
        <div className="lg:col-span-2 space-y-6">
          {/* Video player */}
          <div className="glass rounded-xl overflow-hidden">
            <div className="aspect-video bg-dark-400 relative">
              {clip.video_url ? (
                <iframe
                  src={clip.video_url}
                  className="w-full h-full"
                  allowFullScreen
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-neon-purple/20 to-neon-cyan/20">
                  <div className="p-6 rounded-full bg-dark-500/80 cursor-pointer hover:scale-110 transition-transform">
                    <Play className="w-12 h-12 text-white" />
                  </div>
                </div>
              )}
            </div>

            {/* Video actions */}
            <div className="p-4 flex items-center justify-between border-t border-racing-800">
              <div className="flex items-center gap-4">
                <button className="flex items-center gap-2 text-gray-400 hover:text-neon-pink transition-colors">
                  <Heart className="w-5 h-5" />
                  <span>{clip.like_count?.toLocaleString() || 0}</span>
                </button>
                <div className="flex items-center gap-2 text-gray-400">
                  <Eye className="w-5 h-5" />
                  <span>{clip.view_count?.toLocaleString() || 0} views</span>
                </div>
              </div>
              <button className="flex items-center gap-2 text-gray-400 hover:text-neon-cyan transition-colors">
                <Share2 className="w-5 h-5" />
                <span>Share</span>
              </button>
            </div>
          </div>

          {/* Description */}
          {clip.description && (
            <div className="glass rounded-xl p-6">
              <h3 className="font-display font-semibold text-white mb-3 uppercase tracking-wider">Description</h3>
              <p className="text-gray-400 whitespace-pre-wrap">{clip.description}</p>
            </div>
          )}

          {/* Channel info */}
          <div className="glass rounded-xl p-6">
            <div className="flex items-center justify-between">
              <Link 
                href={`/dashboard/channels/${params.channelId}`}
                className="flex items-center gap-4 group"
              >
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-neon-purple to-neon-cyan flex items-center justify-center text-xl font-display font-bold text-white">
                  {clip.collection?.channel?.avatar_url ? (
                    <img 
                      src={clip.collection.channel.avatar_url} 
                      alt={clip.collection.channel.name}
                      className="w-full h-full rounded-xl object-cover"
                    />
                  ) : (
                    clip.collection?.channel?.name?.charAt(0).toUpperCase()
                  )}
                </div>
                <div>
                  <div className="font-display font-semibold text-white group-hover:text-neon-purple transition-colors">
                    {clip.collection?.channel?.name?.toUpperCase()}
                  </div>
                  <div className="text-sm text-gray-500">
                    {clip.collection?.channel?.subscriber_count?.toLocaleString() || 0} subscribers
                  </div>
                </div>
              </Link>
              <button className="btn-outline-neon">
                SUBSCRIBE
              </button>
            </div>
          </div>
        </div>

        {/* Stats sidebar */}
        <div className="space-y-6">
          {/* Performance Stats */}
          {perfStats && (
            <div className="glass rounded-xl p-6 animate-slide-up">
              <h3 className="font-display font-semibold text-white mb-4 uppercase tracking-wider flex items-center gap-2">
                <Timer className="w-5 h-5 text-neon-green" />
                Performance
              </h3>
              
              <div className="space-y-4">
                {perfStats.zero_to_60_mph && (
                  <div className="stat-box">
                    <div className="stat-value neon-text-green">{perfStats.zero_to_60_mph}s</div>
                    <div className="stat-label">0-60 MPH</div>
                  </div>
                )}
                
                {perfStats.zero_to_100_mph && (
                  <div className="stat-box">
                    <div className="stat-value neon-text-cyan">{perfStats.zero_to_100_mph}s</div>
                    <div className="stat-label">0-100 MPH</div>
                  </div>
                )}

                {perfStats.zero_to_100_kmh && (
                  <div className="stat-box">
                    <div className="stat-value neon-text-purple">{perfStats.zero_to_100_kmh}s</div>
                    <div className="stat-label">0-100 KM/H</div>
                  </div>
                )}

                {perfStats.hundred_to_200_kmh && (
                  <div className="stat-box">
                    <div className="stat-value neon-text-pink">{perfStats.hundred_to_200_kmh}s</div>
                    <div className="stat-label">100-200 KM/H</div>
                  </div>
                )}
                
                {perfStats.quarter_mile_time && (
                  <div className="stat-box">
                    <div className="stat-value text-neon-orange">{perfStats.quarter_mile_time}s</div>
                    <div className="stat-label">1/4 Mile @ {perfStats.quarter_mile_speed || '???'} MPH</div>
                  </div>
                )}

                {perfStats.top_speed && (
                  <div className="stat-box">
                    <div className="stat-value neon-text-red">{perfStats.top_speed}</div>
                    <div className="stat-label">Top Speed (MPH)</div>
                  </div>
                )}

                {/* Run details */}
                <div className="pt-4 border-t border-racing-800 space-y-2 text-sm">
                  {perfStats.location && (
                    <div className="flex items-center gap-2 text-gray-400">
                      <MapPin className="w-4 h-4" />
                      <span>{perfStats.location}</span>
                    </div>
                  )}
                  {perfStats.weather_conditions && (
                    <div className="flex items-center gap-2 text-gray-400">
                      <Cloud className="w-4 h-4" />
                      <span>{perfStats.weather_conditions}</span>
                    </div>
                  )}
                  {perfStats.recorded_at && (
                    <div className="flex items-center gap-2 text-gray-400">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(perfStats.recorded_at).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>

                {perfStats.is_verified && (
                  <div className="mt-4 px-3 py-2 bg-neon-green/10 border border-neon-green/30 rounded-lg text-center">
                    <span className="text-neon-green text-sm font-semibold">✓ VERIFIED RUN</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Car Info */}
          {carInfo && (
            <div className="glass rounded-xl p-6 animate-slide-up stagger-2">
              <h3 className="font-display font-semibold text-white mb-4 uppercase tracking-wider flex items-center gap-2">
                <Gauge className="w-5 h-5 text-neon-purple" />
                Vehicle
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-display font-bold text-white">
                    {carInfo.year} {carInfo.make}
                  </span>
                  {carInfo.car_type && (
                    <span className={`badge ${getCarBadgeClass(carInfo.car_type)}`}>
                      {carInfo.car_type.toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="text-xl text-gray-400">{carInfo.model}</div>
                
                <div className="grid grid-cols-2 gap-3 pt-4 border-t border-racing-800">
                  {carInfo.horsepower && (
                    <div className="stat-box">
                      <div className="stat-value text-lg neon-text-purple">{carInfo.horsepower}</div>
                      <div className="stat-label text-xs">HP</div>
                    </div>
                  )}
                  {carInfo.torque && (
                    <div className="stat-box">
                      <div className="stat-value text-lg neon-text-cyan">{carInfo.torque}</div>
                      <div className="stat-label text-xs">LB-FT</div>
                    </div>
                  )}
                </div>

                <div className="space-y-2 text-sm">
                  {carInfo.engine && (
                    <div className="flex items-center gap-2 text-gray-400">
                      <Zap className="w-4 h-4 text-neon-purple" />
                      <span>{carInfo.engine}</span>
                    </div>
                  )}
                  {carInfo.transmission && (
                    <div className="flex items-center gap-2 text-gray-400">
                      <Settings className="w-4 h-4 text-neon-cyan" />
                      <span className="capitalize">{carInfo.transmission}</span>
                    </div>
                  )}
                  {carInfo.drivetrain && (
                    <div className="flex items-center gap-2 text-gray-400">
                      <Gauge className="w-4 h-4 text-neon-green" />
                      <span className="uppercase">{carInfo.drivetrain}</span>
                    </div>
                  )}
                </div>

                {carInfo.mods && carInfo.mods.length > 0 && (
                  <div className="pt-4 border-t border-racing-800">
                    <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">Modifications</div>
                    <div className="flex flex-wrap gap-2">
                      {carInfo.mods.map((mod: string, index: number) => (
                        <span 
                          key={index}
                          className="px-2 py-1 bg-dark-300 text-gray-400 text-xs rounded"
                        >
                          {mod}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Comments Section */}
      <div className="mt-8">
        <Comments clipId={params.clipId} commentCount={clip.comment_count || 0} />
      </div>

      {/* Bottom navigation */}
      <div className="mt-8 pt-6 border-t border-x-border flex items-center justify-between">
        {prevClip ? (
          <Link
            href={`/dashboard/channels/${params.channelId}/collections/${params.collectionId}/clips/${prevClip.id}`}
            className="btn-outline flex items-center gap-2"
          >
            <ChevronLeft className="w-5 h-5" />
            PREVIOUS
          </Link>
        ) : (
          <div />
        )}

        {nextClip ? (
          <Link
            href={`/dashboard/channels/${params.channelId}/collections/${params.collectionId}/clips/${nextClip.id}`}
            className="btn-accent flex items-center gap-2"
          >
            NEXT
            <ChevronRight className="w-5 h-5" />
          </Link>
        ) : (
          <Link
            href={`/dashboard/channels/${params.channelId}`}
            className="btn-accent flex items-center gap-2"
          >
            BACK TO CHANNEL
          </Link>
        )}
      </div>
    </div>
  );
}
