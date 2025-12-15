'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { 
  Timer, 
  Gauge,
  MapPin,
  Calendar,
  Trash2,
  Loader2,
  Zap,
  ChevronRight
} from 'lucide-react';
import Link from 'next/link';

interface SpeedRun {
  id: string;
  zero_to_60_mph: number | null;
  zero_to_100_mph: number | null;
  quarter_mile_time: number | null;
  top_speed: number | null;
  location: string | null;
  created_at: string;
}

export default function RunsPage() {
  const [loading, setLoading] = useState(true);
  const [runs, setRuns] = useState<SpeedRun[]>([]);
  const [deleting, setDeleting] = useState<string | null>(null);
  
  const supabase = createClient();

  useEffect(() => {
    fetchRuns();
  }, []);

  const fetchRuns = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('speed_runs')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (data) {
      setRuns(data);
    }
    setLoading(false);
  };

  const deleteRun = async (id: string) => {
    setDeleting(id);
    
    const { error } = await supabase
      .from('speed_runs')
      .delete()
      .eq('id', id);

    if (!error) {
      setRuns(runs.filter(r => r.id !== id));
    }
    setDeleting(null);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
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
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-x-white">My Runs</h1>
          <p className="text-x-gray mt-1">Your recorded speed runs</p>
        </div>
        <Link href="/speedometer" className="btn-accent flex items-center gap-2">
          <Gauge className="w-5 h-5" />
          New Run
        </Link>
      </div>

      {runs.length === 0 ? (
        <div className="glass rounded-xl p-12 text-center">
          <Gauge className="w-20 h-20 text-x-gray/30 mx-auto mb-4" />
          <h2 className="text-xl font-display font-bold text-x-white mb-2">No Runs Yet</h2>
          <p className="text-x-gray mb-6">Use the speedometer to record your acceleration times!</p>
          <Link href="/speedometer" className="btn-accent">
            Open Speedometer
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {runs.map((run) => (
            <div key={run.id} className="glass rounded-xl p-5 hover:border-x-gray transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-accent/20 rounded-xl flex items-center justify-center">
                    <Zap className="w-7 h-7 text-accent" />
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <Calendar className="w-4 h-4 text-x-gray" />
                      <span className="text-sm text-x-gray">{formatDate(run.created_at)}</span>
                    </div>
                    {run.location && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-x-gray" />
                        <span className="text-sm text-x-lightgray">{run.location}</span>
                      </div>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => deleteRun(run.id)}
                  disabled={deleting === run.id}
                  className="p-2 text-x-gray hover:text-accent hover:bg-accent/10 rounded-lg transition-colors"
                >
                  {deleting === run.id ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Trash2 className="w-5 h-5" />
                  )}
                </button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 pt-4 border-t border-x-border">
                <div>
                  <div className="text-xs text-x-gray mb-1">0-60 MPH</div>
                  <div className="text-xl font-display font-bold text-green-400">
                    {run.zero_to_60_mph ? `${run.zero_to_60_mph}s` : '—'}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-x-gray mb-1">0-100 MPH</div>
                  <div className="text-xl font-display font-bold text-blue-400">
                    {run.zero_to_100_mph ? `${run.zero_to_100_mph}s` : '—'}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-x-gray mb-1">1/4 Mile</div>
                  <div className="text-xl font-display font-bold text-accent">
                    {run.quarter_mile_time ? `${run.quarter_mile_time}s` : '—'}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-x-gray mb-1">Top Speed</div>
                  <div className="text-xl font-display font-bold text-purple-400">
                    {run.top_speed ? `${run.top_speed} mph` : '—'}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
