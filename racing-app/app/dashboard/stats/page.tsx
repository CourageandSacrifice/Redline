'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { 
  Trophy, 
  Timer, 
  Gauge,
  TrendingUp,
  Award,
  Target,
  Zap,
  Loader2
} from 'lucide-react';

interface Stats {
  totalPosts: number;
  totalViews: number;
  totalLikes: number;
  bestZeroTo60: number | null;
  bestQuarterMile: number | null;
  bestTopSpeed: number | null;
  totalRuns: number;
}

export default function StatsPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats>({
    totalPosts: 0,
    totalViews: 0,
    totalLikes: 0,
    bestZeroTo60: null,
    bestQuarterMile: null,
    bestTopSpeed: null,
    totalRuns: 0,
  });
  
  const supabase = createClient();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Get user's channel
    const { data: channel } = await supabase
      .from('channels')
      .select('id')
      .eq('creator_id', user.id)
      .single();

    if (channel) {
      // Get clips stats
      const { data: clips } = await supabase
        .from('clips')
        .select(`
          id,
          view_count,
          like_count,
          collection:collections!inner (
            channel_id
          )
        `)
        .eq('collection.channel_id', channel.id);

      if (clips) {
        const totalPosts = clips.length;
        const totalViews = clips.reduce((sum, c) => sum + (c.view_count || 0), 0);
        const totalLikes = clips.reduce((sum, c) => sum + (c.like_count || 0), 0);

        // Get best performance stats
        const clipIds = clips.map(c => c.id);
        
        if (clipIds.length > 0) {
          const { data: perfStats } = await supabase
            .from('performance_stats')
            .select('zero_to_60_mph, quarter_mile_time, top_speed')
            .in('clip_id', clipIds);

          let bestZeroTo60: number | null = null;
          let bestQuarterMile: number | null = null;
          let bestTopSpeed: number | null = null;

          if (perfStats) {
            perfStats.forEach(stat => {
              if (stat.zero_to_60_mph && (!bestZeroTo60 || stat.zero_to_60_mph < bestZeroTo60)) {
                bestZeroTo60 = stat.zero_to_60_mph;
              }
              if (stat.quarter_mile_time && (!bestQuarterMile || stat.quarter_mile_time < bestQuarterMile)) {
                bestQuarterMile = stat.quarter_mile_time;
              }
              if (stat.top_speed && (!bestTopSpeed || stat.top_speed > bestTopSpeed)) {
                bestTopSpeed = stat.top_speed;
              }
            });
          }

          setStats(prev => ({ ...prev, bestZeroTo60, bestQuarterMile, bestTopSpeed }));
        }

        setStats(prev => ({ ...prev, totalPosts, totalViews, totalLikes }));
      }
    }

    // Get speed runs
    const { data: runs } = await supabase
      .from('speed_runs')
      .select('id')
      .eq('user_id', user.id);

    if (runs) {
      setStats(prev => ({ ...prev, totalRuns: runs.length }));
    }

    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-accent animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-x-white">My Stats</h1>
        <p className="text-x-gray mt-1">Your performance overview</p>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="glass rounded-xl p-5 text-center">
          <div className="w-12 h-12 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-3">
            <Zap className="w-6 h-6 text-accent" />
          </div>
          <div className="text-3xl font-display font-bold text-x-white">{stats.totalPosts}</div>
          <div className="text-sm text-x-gray">Total Posts</div>
        </div>

        <div className="glass rounded-xl p-5 text-center">
          <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
            <TrendingUp className="w-6 h-6 text-blue-400" />
          </div>
          <div className="text-3xl font-display font-bold text-x-white">{stats.totalViews.toLocaleString()}</div>
          <div className="text-sm text-x-gray">Total Views</div>
        </div>

        <div className="glass rounded-xl p-5 text-center">
          <div className="w-12 h-12 bg-pink-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
            <Trophy className="w-6 h-6 text-pink-400" />
          </div>
          <div className="text-3xl font-display font-bold text-x-white">{stats.totalLikes.toLocaleString()}</div>
          <div className="text-sm text-x-gray">Total Likes</div>
        </div>

        <div className="glass rounded-xl p-5 text-center">
          <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
            <Target className="w-6 h-6 text-green-400" />
          </div>
          <div className="text-3xl font-display font-bold text-x-white">{stats.totalRuns}</div>
          <div className="text-sm text-x-gray">Speed Runs</div>
        </div>
      </div>

      {/* Best Times */}
      <h2 className="text-xl font-display font-bold text-x-white mb-4">Personal Bests</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
              <Timer className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <div className="text-sm text-x-gray">0-60 MPH</div>
              <div className="text-2xl font-display font-bold text-green-400">
                {stats.bestZeroTo60 ? `${stats.bestZeroTo60}s` : '—'}
              </div>
            </div>
          </div>
          {stats.bestZeroTo60 && (
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-yellow-500" />
              <span className="text-sm text-x-gray">Personal Record</span>
            </div>
          )}
        </div>

        <div className="glass rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-accent/20 rounded-lg flex items-center justify-center">
              <Gauge className="w-5 h-5 text-accent" />
            </div>
            <div>
              <div className="text-sm text-x-gray">1/4 Mile</div>
              <div className="text-2xl font-display font-bold text-accent">
                {stats.bestQuarterMile ? `${stats.bestQuarterMile}s` : '—'}
              </div>
            </div>
          </div>
          {stats.bestQuarterMile && (
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-yellow-500" />
              <span className="text-sm text-x-gray">Personal Record</span>
            </div>
          )}
        </div>

        <div className="glass rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <div className="text-sm text-x-gray">Top Speed</div>
              <div className="text-2xl font-display font-bold text-blue-400">
                {stats.bestTopSpeed ? `${stats.bestTopSpeed} mph` : '—'}
              </div>
            </div>
          </div>
          {stats.bestTopSpeed && (
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-yellow-500" />
              <span className="text-sm text-x-gray">Personal Record</span>
            </div>
          )}
        </div>
      </div>

      {/* Empty state for new users */}
      {stats.totalPosts === 0 && stats.totalRuns === 0 && (
        <div className="mt-8 glass rounded-xl p-8 text-center">
          <Trophy className="w-16 h-16 text-x-gray/30 mx-auto mb-4" />
          <h3 className="text-xl font-display font-bold text-x-white mb-2">Start Building Your Stats</h3>
          <p className="text-x-gray mb-6">Post clips with performance data or use the speedometer to record runs!</p>
          <div className="flex justify-center gap-4">
            <a href="/dashboard/upload" className="btn-accent">Upload Clip</a>
            <a href="/speedometer" className="btn-outline">Speedometer</a>
          </div>
        </div>
      )}
    </div>
  );
}
