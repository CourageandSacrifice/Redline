import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
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

  // Get user profile
  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single();

  // Get channels based on role
  const { data: channels } = profile?.role === 'viewer'
    ? await supabase
        .from('subscriptions')
        .select(`
          channel:channels (
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
          )
        `)
        .eq('user_id', user.id)
    : await supabase
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
        .order('created_at', { ascending: false });

  // Transform the data
  const transformedChannels = profile?.role === 'viewer'
    ? channels?.map((s: any) => s.channel).filter(Boolean) || []
    : channels || [];

  return (
    <div className="min-h-screen flex">
      <Sidebar channels={transformedChannels} userRole={profile?.role || 'viewer'} />
      <div className="flex-1 flex flex-col ml-[280px]">
        <Header user={profile || { id: user.id, email: user.email!, username: user.email!.split('@')[0], role: 'viewer' }} />
        <main className="flex-1 p-8 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
