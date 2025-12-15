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

  // Try to get existing profile
  let { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .maybeSingle();

  // If no profile exists (new OAuth user), create one
  if (!profile) {
    const username = user.user_metadata?.username || 
                    user.user_metadata?.full_name || 
                    user.user_metadata?.name ||
                    user.email?.split('@')[0] || 
                    'user';
    
    const { data: newProfile } = await supabase
      .from('users')
      .insert({
        id: user.id,
        email: user.email!,
        username: username,
        role: 'creator',
      })
      .select()
      .single();
    
    profile = newProfile;
  }

  // Get all channels with collections and clips
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

  // Fallback user object if profile creation also failed
  const userForHeader = profile || { 
    id: user.id, 
    email: user.email!, 
    username: user.email!.split('@')[0], 
    role: 'creator' 
  };

  return (
    <div className="min-h-screen flex" style={{ background: '#15202b' }}>
      <Sidebar channels={transformedChannels} userRole={userForHeader.role || 'creator'} />
      <div className="flex-1 flex flex-col ml-[275px]">
        <Header user={userForHeader} />
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
