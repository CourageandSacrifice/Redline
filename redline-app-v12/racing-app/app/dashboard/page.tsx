import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { Gauge, Play, Trophy, Timer, Eye, Heart, Flame, TrendingUp } from 'lucide-react';

export default async function DashboardPage() {
  const supabase = createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user?.id)
    .single();

  // Get stats
  const { count: clipCount } = await supabase
    .from('clips')
    .select('*', { count: 'exact', head: true });

  const { count: channelCount } = await supabase
    .from('channels')
    .select('*', { count: 'exact', head: true });

  // Get featured clips with performance stats
  const { data: featuredClips } = await supabase
    .from('clips')
    .select(`
      id,
      title,
      thumbnail_url,
      view_count,
      like_count,
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
        quarter_mile_speed
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
    .order('view_count', { ascending: false })
    .limit(4);

  // Get leaderboard (fastest 0-60 times)
  const { data: leaderboard } = await supabase
    .from('performance_stats')
    .select(`
      zero_to_60_mph,
      clip:clips (
        id,
        title,
        car_info (
          make,
          model,
          year,
          car_type
        ),
        collection:collections (
          channel:channels (
            name
          )
        )
      )
    `)
    .not('zero_to_60_mph', 'is', null)
    .order('zero_to_60_mph', { ascending: true })
    .limit(5);

  const stats = [
    { label: 'Total Clips', value: clipCount || 0, icon: Play },
    { label: 'Channels', value: channelCount || 0, icon: Gauge },
    { label: 'Fastest 0-60', value: '2.1s', icon: Timer },
    { label: 'Record 1/4 Mile', value: '8.9s', icon: Trophy },
  ];

  const getCarBadgeClass = (carType: string) => {
    const badges: Record<string, string> = {
      jdm: 'badge-jdm',
      euro: 'badge-euro',
      muscle: 'badge-muscle',
      exotic: 'badge-exotic',
    };
    return badges[carType] || 'bg-dark-100 text-x-gray';
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome section */}
      <div className="glass p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-accent/5 rounded-full blur-3xl" />
        
        <div className="relative flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-display font-bold text-x-white mb-1 tracking-wide">
              Welcome back, <span className="text-accent">{profile?.username || 'Racer'}</span>
            </h1>
            <p className="text-x-gray">
              {profile?.role === 'admin' 
                ? 'Manage the platform and monitor activity.'
                : profile?.role === 'creator'
                ? 'Share your latest pulls and track your times.'
                : 'Watch the latest clips and track your favorites.'}
            </p>
          </div>
          <Link 
            href="/speedometer"
            className="btn-accent flex items-center gap-2 text-sm"
          >
            <Timer className="w-4 h-4" />
            Speedometer
          </Link>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div 
              key={stat.label} 
              className="stat-card animate-fade-in"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-dark-100 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-x-gray" />
                </div>
              </div>
              <div className="stat-value">{stat.value}</div>
              <div className="stat-label mt-1">{stat.label}</div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Featured clips */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-display font-bold text-x-white tracking-wide flex items-center gap-2">
              <Flame className="w-5 h-5 text-accent" />
              Trending
            </h2>
            <Link href="/dashboard/feed" className="text-accent hover:text-accent-light text-sm font-semibold transition-colors">
              View all →
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {featuredClips?.map((clip: any, index: number) => (
              <Link
                key={clip.id}
                href={`/dashboard/channels/${clip.collection?.channel?.id}/collections/${clip.collection?.id}/clips/${clip.id}`}
                className="card overflow-hidden hover-card animate-fade-in"
                style={{ animationDelay: `${(index + 4) * 0.05}s` }}
              >
                <div className="aspect-video bg-dark-400 relative overflow-hidden">
                  {clip.thumbnail_url ? (
                    <img 
                      src={clip.thumbnail_url} 
                      alt={clip.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Play className="w-12 h-12 text-dark-100" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  
                  {/* Performance overlay */}
                  {clip.performance_stats?.[0]?.zero_to_60_mph && (
                    <div className="absolute top-3 right-3 px-2.5 py-1 bg-black/70 rounded-lg text-xs font-display font-bold text-green-400">
                      {clip.performance_stats[0].zero_to_60_mph}s
                    </div>
                  )}
                </div>
                
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-semibold text-x-white line-clamp-1 text-sm">
                      {clip.title}
                    </h3>
                    {clip.car_info?.[0]?.car_type && (
                      <span className={getCarBadgeClass(clip.car_info[0].car_type)}>
                        {clip.car_info[0].car_type.toUpperCase()}
                      </span>
                    )}
                  </div>
                  
                  {clip.car_info?.[0] && (
                    <p className="text-xs text-x-gray mb-3">
                      {clip.car_info[0].year} {clip.car_info[0].make} {clip.car_info[0].model}
                      {clip.car_info[0].horsepower && ` • ${clip.car_info[0].horsepower}hp`}
                    </p>
                  )}
                  
                  <div className="flex items-center gap-4 text-xs text-x-gray">
                    <span className="flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5" />
                      {clip.view_count?.toLocaleString() || 0}
                    </span>
                    <span className="flex items-center gap-1">
                      <Heart className="w-3.5 h-3.5" />
                      {clip.like_count?.toLocaleString() || 0}
                    </span>
                    <span className="ml-auto text-x-lightgray">{clip.collection?.channel?.name}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Leaderboard */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Trophy className="w-5 h-5 text-yellow-500" />
            <h2 className="text-lg font-display font-bold text-x-white tracking-wide">
              0-60 Leaderboard
            </h2>
          </div>
          
          <div className="card overflow-hidden">
            <div className="divide-y divide-x-border">
              {leaderboard?.map((entry: any, index: number) => (
                <div 
                  key={entry.clip?.id || index}
                  className="p-4 hover:bg-white/5 transition-colors animate-fade-in"
                  style={{ animationDelay: `${(index + 8) * 0.05}s` }}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-display font-bold text-sm ${
                      index === 0 ? 'bg-yellow-500/20 rank-1' :
                      index === 1 ? 'bg-gray-400/20 rank-2' :
                      index === 2 ? 'bg-orange-500/20 rank-3' :
                      'bg-dark-100 text-x-gray'
                    }`}>
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-x-white truncate">
                        {entry.clip?.car_info?.[0] ? 
                          `${entry.clip.car_info[0].year} ${entry.clip.car_info[0].make} ${entry.clip.car_info[0].model}` :
                          entry.clip?.title
                        }
                      </div>
                      <div className="text-xs text-x-gray">
                        {entry.clip?.collection?.channel?.name || 'Unknown'}
                      </div>
                    </div>
                    <div className="text-lg font-display font-bold perf-stat">
                      {entry.zero_to_60_mph}s
                    </div>
                  </div>
                </div>
              ))}
              
              {(!leaderboard || leaderboard.length === 0) && (
                <div className="p-8 text-center text-x-gray">
                  <Timer className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No times recorded yet</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
