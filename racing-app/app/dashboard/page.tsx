import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { Gauge, Play, Trophy, Timer, Zap, TrendingUp, Eye, Heart } from 'lucide-react';

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
    { 
      label: 'Total Clips', 
      value: clipCount || 0, 
      icon: Play, 
      color: 'purple',
    },
    { 
      label: 'Channels', 
      value: channelCount || 0, 
      icon: Gauge, 
      color: 'cyan',
    },
    { 
      label: 'Fastest 0-60', 
      value: '2.1s', 
      icon: Timer, 
      color: 'green',
    },
    { 
      label: 'Record 1/4 Mile', 
      value: '8.9s', 
      icon: Trophy, 
      color: 'pink',
    },
  ];

  const getColorClasses = (color: string) => {
    const colors: Record<string, string> = {
      purple: 'bg-neon-purple/10 text-neon-purple border-neon-purple/30',
      cyan: 'bg-neon-cyan/10 text-neon-cyan border-neon-cyan/30',
      green: 'bg-neon-green/10 text-neon-green border-neon-green/30',
      pink: 'bg-neon-pink/10 text-neon-pink border-neon-pink/30',
    };
    return colors[color] || colors.purple;
  };

  const getCarBadgeClass = (carType: string) => {
    const badges: Record<string, string> = {
      jdm: 'car-badge-jdm',
      euro: 'car-badge-euro',
      muscle: 'car-badge-muscle',
      exotic: 'car-badge-exotic',
    };
    return badges[carType] || 'bg-gray-500/20 text-gray-400';
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome section */}
      <div className="glass rounded-2xl p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-neon-purple/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-neon-cyan/10 rounded-full blur-3xl" />
        
        <div className="relative flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold text-white mb-2 tracking-wide">
              WELCOME BACK, <span className="neon-text-purple">{profile?.username?.toUpperCase() || 'RACER'}</span>
            </h1>
            <p className="text-gray-400 text-lg">
              {profile?.role === 'admin' 
                ? 'Manage the platform and monitor activity.'
                : profile?.role === 'creator'
                ? 'Share your latest pulls and track your times.'
                : 'Watch the latest clips and track your favorites.'}
            </p>
          </div>
          <Link 
            href="/speedometer"
            className="btn-neon flex items-center gap-2"
          >
            <Gauge className="w-5 h-5" />
            GPS SPEEDOMETER
          </Link>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div 
              key={stat.label} 
              className="glass rounded-xl p-6 animate-slide-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-xl border ${getColorClasses(stat.color)}`}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>
              <div className="text-3xl font-display font-bold text-white mb-1">{stat.value}</div>
              <div className="text-sm text-gray-400 uppercase tracking-wider">{stat.label}</div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Featured clips */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-display font-semibold text-white tracking-wide flex items-center gap-2">
              <Zap className="w-5 h-5 text-neon-purple" />
              TRENDING CLIPS
            </h2>
            <Link href="/dashboard/explore" className="text-neon-cyan hover:text-neon-cyan/80 text-sm uppercase tracking-wider">
              View all →
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {featuredClips?.map((clip: any, index: number) => (
              <Link
                key={clip.id}
                href={`/dashboard/channels/${clip.collection?.channel?.id}/collections/${clip.collection?.id}/clips/${clip.id}`}
                className="glass rounded-xl overflow-hidden hover:shadow-neon-purple transition-all duration-300 group animate-slide-up"
                style={{ animationDelay: `${(index + 4) * 0.1}s` }}
              >
                <div className="aspect-video bg-dark-400 relative overflow-hidden">
                  {clip.thumbnail_url ? (
                    <img 
                      src={clip.thumbnail_url} 
                      alt={clip.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-neon-purple/20 to-neon-cyan/20">
                      <Play className="w-12 h-12 text-white/50" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-dark-500 via-transparent to-transparent" />
                  
                  {/* Performance overlay */}
                  {clip.performance_stats?.[0]?.zero_to_60_mph && (
                    <div className="absolute top-3 right-3 px-2 py-1 bg-dark-500/80 backdrop-blur rounded-lg">
                      <span className="text-xs font-display text-neon-green">
                        0-60: {clip.performance_stats[0].zero_to_60_mph}s
                      </span>
                    </div>
                  )}
                </div>
                
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-white group-hover:text-neon-purple transition-colors line-clamp-1">
                      {clip.title}
                    </h3>
                    {clip.car_info?.[0]?.car_type && (
                      <span className={`badge text-xs ${getCarBadgeClass(clip.car_info[0].car_type)}`}>
                        {clip.car_info[0].car_type.toUpperCase()}
                      </span>
                    )}
                  </div>
                  
                  {clip.car_info?.[0] && (
                    <p className="text-sm text-gray-400 mb-3">
                      {clip.car_info[0].year} {clip.car_info[0].make} {clip.car_info[0].model}
                      {clip.car_info[0].horsepower && ` • ${clip.car_info[0].horsepower}hp`}
                    </p>
                  )}
                  
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        {clip.view_count?.toLocaleString() || 0}
                      </span>
                      <span className="flex items-center gap-1">
                        <Heart className="w-4 h-4" />
                        {clip.like_count?.toLocaleString() || 0}
                      </span>
                    </div>
                    <span>{clip.collection?.channel?.name}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Leaderboard */}
        <div>
          <div className="flex items-center gap-2 mb-6">
            <Trophy className="w-5 h-5 text-neon-cyan" />
            <h2 className="text-xl font-display font-semibold text-white tracking-wide">
              0-60 LEADERBOARD
            </h2>
          </div>
          
          <div className="glass rounded-xl overflow-hidden">
            <div className="divide-y divide-racing-800">
              {leaderboard?.map((entry: any, index: number) => (
                <div 
                  key={entry.clip?.id || index}
                  className="p-4 hover:bg-white/5 transition-colors animate-slide-up"
                  style={{ animationDelay: `${(index + 8) * 0.1}s` }}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-display font-bold text-sm ${
                      index === 0 ? 'bg-yellow-500/20 text-yellow-400' :
                      index === 1 ? 'bg-gray-400/20 text-gray-300' :
                      index === 2 ? 'bg-orange-600/20 text-orange-400' :
                      'bg-dark-300 text-gray-500'
                    }`}>
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-white truncate">
                        {entry.clip?.car_info?.[0] ? 
                          `${entry.clip.car_info[0].year} ${entry.clip.car_info[0].make} ${entry.clip.car_info[0].model}` :
                          entry.clip?.title
                        }
                      </div>
                      <div className="text-xs text-gray-500">
                        {entry.clip?.collection?.channel?.name || 'Unknown'}
                      </div>
                    </div>
                    <div className="text-lg font-display font-bold neon-text-green">
                      {entry.zero_to_60_mph}s
                    </div>
                  </div>
                </div>
              ))}
              
              {(!leaderboard || leaderboard.length === 0) && (
                <div className="p-8 text-center text-gray-500">
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
