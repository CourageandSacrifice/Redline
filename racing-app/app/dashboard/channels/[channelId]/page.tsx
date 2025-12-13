import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Play, Users, Eye, Calendar, ChevronRight } from 'lucide-react';

interface ChannelPageProps {
  params: { channelId: string };
}

export default async function ChannelPage({ params }: ChannelPageProps) {
  const supabase = createClient();
  
  const { data: channel } = await supabase
    .from('channels')
    .select(`
      *,
      creator:users!channels_creator_id_fkey (
        id,
        username,
        avatar_url
      ),
      collections (
        id,
        title,
        description,
        thumbnail_url,
        order_index,
        clips (
          id,
          title,
          order_index,
          thumbnail_url,
          view_count
        )
      )
    `)
    .eq('id', params.channelId)
    .single();

  if (!channel) {
    notFound();
  }

  const sortedCollections = channel.collections
    ?.sort((a: any, b: any) => a.order_index - b.order_index)
    .map((collection: any) => ({
      ...collection,
      clips: collection.clips?.sort((a: any, b: any) => a.order_index - b.order_index)
    }));

  const totalViews = sortedCollections?.reduce((acc: number, col: any) => 
    acc + (col.clips?.reduce((clipAcc: number, clip: any) => clipAcc + (clip.view_count || 0), 0) || 0), 0
  );

  const totalClips = sortedCollections?.reduce((acc: number, col: any) => acc + (col.clips?.length || 0), 0);

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
      {/* Channel header */}
      <div className="glass rounded-2xl overflow-hidden">
        <div className="h-48 bg-gradient-to-br from-neon-purple/30 via-dark-300 to-neon-cyan/20 relative">
          {channel.banner_url && (
            <img 
              src={channel.banner_url} 
              alt={channel.name}
              className="w-full h-full object-cover opacity-50"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-dark-500 to-transparent" />
        </div>

        <div className="p-6 -mt-16 relative">
          <div className="flex items-end gap-6">
            <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-neon-purple to-neon-cyan flex items-center justify-center text-4xl font-display font-bold text-white shadow-neon-purple">
              {channel.avatar_url ? (
                <img src={channel.avatar_url} alt={channel.name} className="w-full h-full rounded-2xl object-cover" />
              ) : (
                channel.name.charAt(0).toUpperCase()
              )}
            </div>
            
            <div className="flex-1 pb-2">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-display font-bold text-white tracking-wide">
                  {channel.name.toUpperCase()}
                </h1>
                {channel.is_verified && (
                  <span className="px-2 py-1 bg-neon-cyan/20 text-neon-cyan text-xs font-semibold rounded-full">
                    VERIFIED
                  </span>
                )}
              </div>
              <p className="text-gray-400 max-w-2xl">{channel.description}</p>
            </div>

            <button className="btn-neon">
              SUBSCRIBE
            </button>
          </div>

          <div className="flex items-center gap-8 mt-6 pt-6 border-t border-racing-800">
            <div className="flex items-center gap-2 text-gray-400">
              <Users className="w-5 h-5 text-neon-purple" />
              <span className="font-semibold text-white">{channel.subscriber_count?.toLocaleString() || 0}</span>
              <span>subscribers</span>
            </div>
            <div className="flex items-center gap-2 text-gray-400">
              <Play className="w-5 h-5 text-neon-cyan" />
              <span className="font-semibold text-white">{totalClips}</span>
              <span>clips</span>
            </div>
            <div className="flex items-center gap-2 text-gray-400">
              <Eye className="w-5 h-5 text-neon-green" />
              <span className="font-semibold text-white">{totalViews?.toLocaleString()}</span>
              <span>views</span>
            </div>
          </div>
        </div>
      </div>

      {/* Collections */}
      <div>
        <h2 className="text-xl font-display font-semibold text-white tracking-wide mb-6">
          COLLECTIONS
        </h2>
        
        <div className="space-y-6">
          {sortedCollections?.map((collection: any, index: number) => (
            <div 
              key={collection.id} 
              className="glass rounded-xl overflow-hidden animate-slide-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="p-4 border-b border-racing-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-neon-purple/20 flex items-center justify-center text-neon-purple font-display font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{collection.title}</h3>
                    {collection.description && (
                      <p className="text-sm text-gray-400">{collection.description}</p>
                    )}
                  </div>
                </div>
                <span className="text-sm text-gray-500">
                  {collection.clips?.length || 0} clips
                </span>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4">
                {collection.clips?.slice(0, 4).map((clip: any) => (
                  <Link
                    key={clip.id}
                    href={`/dashboard/channels/${channel.id}/collections/${collection.id}/clips/${clip.id}`}
                    className="group"
                  >
                    <div className="aspect-video bg-dark-400 rounded-lg overflow-hidden relative">
                      {clip.thumbnail_url ? (
                        <img 
                          src={clip.thumbnail_url} 
                          alt={clip.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Play className="w-8 h-8 text-gray-600" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-dark-500/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                        <span className="text-xs text-white truncate">{clip.title}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              {collection.clips?.length > 4 && (
                <Link 
                  href={`/dashboard/channels/${channel.id}/collections/${collection.id}`}
                  className="flex items-center justify-center gap-2 p-3 text-neon-cyan hover:bg-neon-cyan/10 transition-colors text-sm"
                >
                  View all {collection.clips.length} clips
                  <ChevronRight className="w-4 h-4" />
                </Link>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
