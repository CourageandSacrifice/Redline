import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/auth/login');
  }

  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single();

  // Get user's subscribed channels with collections and clips
  const { data: channels } = await supabase
    .from('channels')
    .select(`
      id,
      name,
      avatar_url,
      collections (
        id,
        title,
        order_index,
        clips (
          id,
          title,
          order_index
        )
      )
    `)
    .order('name');

  const transformedChannels = channels?.map(channel => ({
    ...channel,
    collections: channel.collections?.map(collection => ({
      ...collection,
      clips: collection.clips || [],
    })) || [],
  })) || [];

  return (
    <div className="min-h-screen flex" style={{ background: '#15202b' }}>
      <Sidebar channels={transformedChannels} userRole={profile?.role || 'viewer'} />
      <div className="flex-1 flex flex-col ml-[275px]">
        <Header user={profile || { id: user.id, email: user.email!, username: user.email!.split('@')[0], role: 'viewer' }} />
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
