import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { Trophy, Timer, Gauge, Medal, TrendingUp, Car, Zap } from 'lucide-react';

export default async function LeaderboardPage() {
  const supabase = createClient();

  // Get 0-60 leaderboard
  const { data: zeroTo60 } = await supabase
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
          car_type,
          horsepower
        ),
        collection:collections (
          channel:channels (
            id,
            name
          )
        )
      )
    `)
    .not('zero_to_60_mph', 'is', null)
    .order('zero_to_60_mph', { ascending: true })
    .limit(10);

  // Get quarter mile leaderboard
  const { data: quarterMile } = await supabase
    .from('performance_stats')
    .select(`
      quarter_mile_time,
      quarter_mile_speed,
      clip:clips (
        id,
        title,
        car_info (
          make,
          model,
          year,
          car_type,
          horsepower
        ),
        collection:collections (
          channel:channels (
            id,
            name
          )
        )
      )
    `)
    .not('quarter_mile_time', 'is', null)
    .order('quarter_mile_time', { ascending: true })
    .limit(10);

  // Get top speed leaderboard
  const { data: topSpeed } = await supabase
    .from('performance_stats')
    .select(`
      top_speed,
      clip:clips (
        id,
        title,
        car_info (
          make,
          model,
          year,
          car_type,
          horsepower
        ),
        collection:collections (
          channel:channels (
            id,
            name
          )
        )
      )
    `)
    .not('top_speed', 'is', null)
    .order('top_speed', { ascending: false })
    .limit(10);

  const getRankStyle = (index: number) => {
    if (index === 0) return 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30';
    if (index === 1) return 'bg-gray-400/20 text-gray-400 border-gray-400/30';
    if (index === 2) return 'bg-orange-500/20 text-orange-500 border-orange-500/30';
    return 'bg-dark-100 text-x-gray border-x-border';
  };

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
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-x-white tracking-wide flex items-center gap-3">
            <Trophy className="w-8 h-8 text-yellow-500" />
            LEADERBOARD
          </h1>
          <p className="text-x-gray mt-1">The fastest times in the community</p>
        </div>
        <Link href="/speedometer" className="btn-accent flex items-center gap-2">
          <Timer className="w-4 h-4" />
          Record a Run
        </Link>
      </div>

      {/* Leaderboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* 0-60 MPH Leaderboard */}
        <div className="glass overflow-hidden">
          <div className="p-4 border-b border-x-border flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
              <Zap className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <h2 className="font-display font-bold text-x-white">0-60 MPH</h2>
              <p className="text-xs text-x-gray">Acceleration</p>
            </div>
          </div>
          
          <div className="divide-y divide-x-border">
            {zeroTo60?.map((entry: any, index: number) => (
              <Link
                key={entry.clip?.id || index}
                href={`/dashboard/channels/${entry.clip?.collection?.channel?.id}/collections/1/clips/${entry.clip?.id}`}
                className="p-4 flex items-center gap-3 hover:bg-white/5 transition-colors"
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-display font-bold text-sm border ${getRankStyle(index)}`}>
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-x-white truncate">
                    {entry.clip?.car_info?.[0] 
                      ? `${entry.clip.car_info[0].year} ${entry.clip.car_info[0].make} ${entry.clip.car_info[0].model}`
                      : entry.clip?.title || 'Unknown'}
                  </div>
                  <div className="text-xs text-x-gray truncate">
                    {entry.clip?.collection?.channel?.name || 'Unknown Channel'}
                    {entry.clip?.car_info?.[0]?.horsepower && ` • ${entry.clip.car_info[0].horsepower}hp`}
                  </div>
                </div>
                <div className="text-xl font-display font-bold text-green-500">
                  {entry.zero_to_60_mph}s
                </div>
              </Link>
            ))}
            
            {(!zeroTo60 || zeroTo60.length === 0) && (
              <div className="p-8 text-center text-x-gray">
                <Timer className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p>No times recorded yet</p>
                <p className="text-sm mt-1">Be the first!</p>
              </div>
            )}
          </div>
        </div>

        {/* Quarter Mile Leaderboard */}
        <div className="glass overflow-hidden">
          <div className="p-4 border-b border-x-border flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-accent" />
            </div>
            <div>
              <h2 className="font-display font-bold text-x-white">1/4 Mile</h2>
              <p className="text-xs text-x-gray">Quarter Mile</p>
            </div>
          </div>
          
          <div className="divide-y divide-x-border">
            {quarterMile?.map((entry: any, index: number) => (
              <Link
                key={entry.clip?.id || index}
                href={`/dashboard/channels/${entry.clip?.collection?.channel?.id}/collections/1/clips/${entry.clip?.id}`}
                className="p-4 flex items-center gap-3 hover:bg-white/5 transition-colors"
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-display font-bold text-sm border ${getRankStyle(index)}`}>
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-x-white truncate">
                    {entry.clip?.car_info?.[0] 
                      ? `${entry.clip.car_info[0].year} ${entry.clip.car_info[0].make} ${entry.clip.car_info[0].model}`
                      : entry.clip?.title || 'Unknown'}
                  </div>
                  <div className="text-xs text-x-gray truncate">
                    {entry.clip?.collection?.channel?.name || 'Unknown Channel'}
                    {entry.quarter_mile_speed && ` • ${entry.quarter_mile_speed} mph trap`}
                  </div>
                </div>
                <div className="text-xl font-display font-bold text-accent">
                  {entry.quarter_mile_time}s
                </div>
              </Link>
            ))}
            
            {(!quarterMile || quarterMile.length === 0) && (
              <div className="p-8 text-center text-x-gray">
                <TrendingUp className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p>No times recorded yet</p>
                <p className="text-sm mt-1">Be the first!</p>
              </div>
            )}
          </div>
        </div>

        {/* Top Speed Leaderboard */}
        <div className="glass overflow-hidden">
          <div className="p-4 border-b border-x-border flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
              <Gauge className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <h2 className="font-display font-bold text-x-white">Top Speed</h2>
              <p className="text-xs text-x-gray">Maximum Velocity</p>
            </div>
          </div>
          
          <div className="divide-y divide-x-border">
            {topSpeed?.map((entry: any, index: number) => (
              <Link
                key={entry.clip?.id || index}
                href={`/dashboard/channels/${entry.clip?.collection?.channel?.id}/collections/1/clips/${entry.clip?.id}`}
                className="p-4 flex items-center gap-3 hover:bg-white/5 transition-colors"
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-display font-bold text-sm border ${getRankStyle(index)}`}>
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-x-white truncate">
                    {entry.clip?.car_info?.[0] 
                      ? `${entry.clip.car_info[0].year} ${entry.clip.car_info[0].make} ${entry.clip.car_info[0].model}`
                      : entry.clip?.title || 'Unknown'}
                  </div>
                  <div className="text-xs text-x-gray truncate">
                    {entry.clip?.collection?.channel?.name || 'Unknown Channel'}
                    {entry.clip?.car_info?.[0]?.horsepower && ` • ${entry.clip.car_info[0].horsepower}hp`}
                  </div>
                </div>
                <div className="text-xl font-display font-bold text-blue-500">
                  {entry.top_speed} <span className="text-sm">mph</span>
                </div>
              </Link>
            ))}
            
            {(!topSpeed || topSpeed.length === 0) && (
              <div className="p-8 text-center text-x-gray">
                <Gauge className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p>No speeds recorded yet</p>
                <p className="text-sm mt-1">Be the first!</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="glass p-6">
        <h3 className="font-display font-bold text-x-white mb-4 flex items-center gap-2">
          <Medal className="w-5 h-5 text-accent" />
          HOW IT WORKS
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-x-gray">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-accent font-bold flex-shrink-0">1</div>
            <div>
              <div className="font-semibold text-x-white">Record Your Run</div>
              <p>Use the GPS Speedometer to track your acceleration and top speed</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-accent font-bold flex-shrink-0">2</div>
            <div>
              <div className="font-semibold text-x-white">Upload Your Clip</div>
              <p>Post your video with performance stats and car details</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-accent font-bold flex-shrink-0">3</div>
            <div>
              <div className="font-semibold text-x-white">Climb the Ranks</div>
              <p>Compete with others and claim your spot on the leaderboard</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
