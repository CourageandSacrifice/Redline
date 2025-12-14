'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { 
  Plus, 
  Settings, 
  Trash2, 
  Edit2, 
  X, 
  Video,
  Users,
  Folder,
  ChevronRight,
  Loader2,
  Check
} from 'lucide-react';
import Link from 'next/link';

interface Channel {
  id: string;
  name: string;
  description: string;
  avatar_url: string;
  banner_url: string;
  subscriber_count: number;
  is_verified: boolean;
  collections: Collection[];
}

interface Collection {
  id: string;
  title: string;
  description: string;
  order_index: number;
  clips: { id: string }[];
}

export default function MyChannelPage() {
  const [channel, setChannel] = useState<Channel | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showCreateCollection, setShowCreateCollection] = useState(false);
  
  const [channelForm, setChannelForm] = useState({ name: '', description: '' });
  const [collectionForm, setCollectionForm] = useState({ title: '', description: '' });

  const supabase = createClient();

  useEffect(() => {
    async function fetchChannel() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('channels')
        .select(`*, collections (id, title, description, order_index, clips (id))`)
        .eq('creator_id', user.id)
        .single();

      if (data) setChannel(data as Channel);
      setLoading(false);
    }
    fetchChannel();
  }, []);

  const createChannel = async () => {
    if (!channelForm.name.trim()) return;
    setCreating(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('channels')
      .insert({ name: channelForm.name, description: channelForm.description, creator_id: user.id })
      .select()
      .single();

    if (data) {
      setChannel({ ...data, collections: [] } as Channel);
      setChannelForm({ name: '', description: '' });
    }
    setCreating(false);
  };

  const createCollection = async () => {
    if (!collectionForm.title.trim() || !channel) return;
    setCreating(true);

    const { data } = await supabase
      .from('collections')
      .insert({
        channel_id: channel.id,
        title: collectionForm.title,
        description: collectionForm.description,
        order_index: channel.collections?.length || 0,
      })
      .select()
      .single();

    if (data) {
      setChannel({ ...channel, collections: [...(channel.collections || []), { ...data, clips: [] }] });
      setShowCreateCollection(false);
      setCollectionForm({ title: '', description: '' });
    }
    setCreating(false);
  };

  const deleteCollection = async (collectionId: string) => {
    if (!confirm('Delete this collection and all its clips?')) return;
    await supabase.from('collections').delete().eq('id', collectionId);
    if (channel) {
      setChannel({ ...channel, collections: channel.collections.filter(c => c.id !== collectionId) });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 text-neon-purple animate-spin" />
      </div>
    );
  }

  if (!channel) {
    return (
      <div className="max-w-2xl mx-auto animate-fade-in">
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-neon-purple to-neon-cyan flex items-center justify-center">
            <Video className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-display font-bold text-white tracking-wide mb-2">CREATE YOUR CHANNEL</h1>
          <p className="text-gray-400">Start sharing your racing content</p>
        </div>

        <div className="glass rounded-xl p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">Channel Name *</label>
            <input
              type="text"
              value={channelForm.name}
              onChange={(e) => setChannelForm({ ...channelForm, name: e.target.value })}
              placeholder="e.g., JDM Legends"
              className="input-racing"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">Description</label>
            <textarea
              value={channelForm.description}
              onChange={(e) => setChannelForm({ ...channelForm, description: e.target.value })}
              placeholder="What's your channel about?"
              rows={3}
              className="input-racing"
            />
          </div>
          <button
            onClick={createChannel}
            disabled={creating || !channelForm.name.trim()}
            className="w-full btn-neon flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {creating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
            Create Channel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      {/* Channel header */}
      <div className="glass rounded-xl p-6 mb-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-neon-purple to-neon-cyan flex items-center justify-center text-3xl font-display font-bold text-white">
              {channel.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-display font-bold text-white tracking-wide">{channel.name.toUpperCase()}</h1>
                {channel.is_verified && (
                  <span className="px-2 py-0.5 bg-neon-cyan/20 text-neon-cyan text-xs font-semibold rounded-full">VERIFIED</span>
                )}
              </div>
              <p className="text-gray-400 mt-1">{channel.description || 'No description'}</p>
              <div className="flex items-center gap-4 mt-2 text-sm">
                <span className="flex items-center gap-1 text-gray-500">
                  <Users className="w-4 h-4" /> {channel.subscriber_count} subscribers
                </span>
                <span className="flex items-center gap-1 text-gray-500">
                  <Folder className="w-4 h-4" /> {channel.collections?.length || 0} collections
                </span>
              </div>
            </div>
          </div>
          <button className="btn-outline-neon flex items-center gap-2 text-sm">
            <Settings className="w-4 h-4" /> Settings
          </button>
        </div>
      </div>

      {/* Collections */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-display font-semibold text-white tracking-wide">COLLECTIONS</h2>
        <button onClick={() => setShowCreateCollection(true)} className="btn-neon flex items-center gap-2 text-sm">
          <Plus className="w-4 h-4" /> New Collection
        </button>
      </div>

      {showCreateCollection && (
        <div className="glass rounded-xl p-4 mb-4 animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-white">New Collection</h3>
            <button onClick={() => setShowCreateCollection(false)} className="text-gray-500 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="space-y-3">
            <input
              type="text"
              value={collectionForm.title}
              onChange={(e) => setCollectionForm({ ...collectionForm, title: e.target.value })}
              placeholder="Collection title (e.g., Highway Pulls)"
              className="input-racing"
            />
            <input
              type="text"
              value={collectionForm.description}
              onChange={(e) => setCollectionForm({ ...collectionForm, description: e.target.value })}
              placeholder="Description (optional)"
              className="input-racing"
            />
            <button
              onClick={createCollection}
              disabled={creating || !collectionForm.title.trim()}
              className="btn-neon w-full flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              Create
            </button>
          </div>
        </div>
      )}

      {channel.collections?.length > 0 ? (
        <div className="space-y-3">
          {channel.collections.sort((a, b) => a.order_index - b.order_index).map((collection) => (
            <div key={collection.id} className="glass rounded-xl p-4 flex items-center justify-between hover:border-neon-purple/50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-dark-400 flex items-center justify-center">
                  <Folder className="w-6 h-6 text-neon-purple" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">{collection.title}</h3>
                  <p className="text-sm text-gray-500">{collection.clips?.length || 0} clips</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Link href={`/dashboard/upload?collection=${collection.id}`} className="p-2 text-gray-400 hover:text-neon-green" title="Add clip">
                  <Plus className="w-5 h-5" />
                </Link>
                <button onClick={() => deleteCollection(collection.id)} className="p-2 text-gray-400 hover:text-neon-red" title="Delete">
                  <Trash2 className="w-5 h-5" />
                </button>
                <ChevronRight className="w-5 h-5 text-gray-600" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="glass rounded-xl p-8 text-center">
          <Folder className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-white mb-1">No Collections Yet</h3>
          <p className="text-gray-400 mb-4">Create a collection to organize your clips</p>
          <button onClick={() => setShowCreateCollection(true)} className="btn-outline-neon">
            Create Your First Collection
          </button>
        </div>
      )}

      {/* Quick actions */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link href="/dashboard/upload" className="glass rounded-xl p-6 hover:border-neon-purple/50 transition-colors group">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-neon-purple/20 rounded-xl group-hover:bg-neon-purple/30 transition-colors">
              <Video className="w-6 h-6 text-neon-purple" />
            </div>
            <div>
              <h3 className="font-display font-semibold text-white">Upload Clip</h3>
              <p className="text-sm text-gray-500">Share a new racing video</p>
            </div>
          </div>
        </Link>
        <Link href="/dashboard/editor" className="glass rounded-xl p-6 hover:border-neon-cyan/50 transition-colors group">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-neon-cyan/20 rounded-xl group-hover:bg-neon-cyan/30 transition-colors">
              <Edit2 className="w-6 h-6 text-neon-cyan" />
            </div>
            <div>
              <h3 className="font-display font-semibold text-white">Video Editor</h3>
              <p className="text-sm text-gray-500">Edit and enhance your clips</p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
