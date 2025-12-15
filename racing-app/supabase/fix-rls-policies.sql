-- =====================================================
-- FIX RLS POLICIES FOR REDLINE
-- Run this in Supabase SQL Editor to fix posting issues
-- =====================================================

-- Drop old policies
DROP POLICY IF EXISTS "Users are viewable by everyone" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;

DROP POLICY IF EXISTS "Channels are viewable by everyone" ON public.channels;
DROP POLICY IF EXISTS "Creators can insert channels" ON public.channels;
DROP POLICY IF EXISTS "Creators can update own channels" ON public.channels;
DROP POLICY IF EXISTS "Creators can delete own channels" ON public.channels;

DROP POLICY IF EXISTS "Collections are viewable" ON public.collections;
DROP POLICY IF EXISTS "Creators can manage collections" ON public.collections;
DROP POLICY IF EXISTS "Creators can insert collections" ON public.collections;
DROP POLICY IF EXISTS "Creators can update collections" ON public.collections;
DROP POLICY IF EXISTS "Creators can delete collections" ON public.collections;

DROP POLICY IF EXISTS "Published clips are viewable" ON public.clips;
DROP POLICY IF EXISTS "Creators can manage clips" ON public.clips;
DROP POLICY IF EXISTS "Creators can insert clips" ON public.clips;
DROP POLICY IF EXISTS "Creators can update clips" ON public.clips;
DROP POLICY IF EXISTS "Creators can delete clips" ON public.clips;

DROP POLICY IF EXISTS "Car info is viewable" ON public.car_info;
DROP POLICY IF EXISTS "Creators can manage car info" ON public.car_info;
DROP POLICY IF EXISTS "Creators can insert car info" ON public.car_info;
DROP POLICY IF EXISTS "Creators can update car info" ON public.car_info;

DROP POLICY IF EXISTS "Performance stats are viewable" ON public.performance_stats;
DROP POLICY IF EXISTS "Creators can manage performance stats" ON public.performance_stats;
DROP POLICY IF EXISTS "Creators can insert performance stats" ON public.performance_stats;
DROP POLICY IF EXISTS "Creators can update performance stats" ON public.performance_stats;

-- =====================================================
-- USERS POLICIES
-- =====================================================
CREATE POLICY "Users are viewable by everyone" ON public.users FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.users FOR INSERT WITH CHECK (auth.uid() = id);

-- =====================================================
-- CHANNELS POLICIES
-- =====================================================
CREATE POLICY "Channels are viewable by everyone" ON public.channels FOR SELECT USING (true);
CREATE POLICY "Creators can insert channels" ON public.channels FOR INSERT WITH CHECK (creator_id = auth.uid());
CREATE POLICY "Creators can update own channels" ON public.channels FOR UPDATE USING (creator_id = auth.uid());
CREATE POLICY "Creators can delete own channels" ON public.channels FOR DELETE USING (creator_id = auth.uid());

-- =====================================================
-- COLLECTIONS POLICIES
-- =====================================================
CREATE POLICY "Collections are viewable" ON public.collections FOR SELECT USING (true);
CREATE POLICY "Creators can insert collections" ON public.collections FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.channels WHERE channels.id = channel_id AND channels.creator_id = auth.uid())
);
CREATE POLICY "Creators can update collections" ON public.collections FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.channels WHERE channels.id = collections.channel_id AND channels.creator_id = auth.uid())
);
CREATE POLICY "Creators can delete collections" ON public.collections FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.channels WHERE channels.id = collections.channel_id AND channels.creator_id = auth.uid())
);

-- =====================================================
-- CLIPS POLICIES
-- =====================================================
CREATE POLICY "Published clips are viewable" ON public.clips FOR SELECT USING (is_published = true);
CREATE POLICY "Creators can insert clips" ON public.clips FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.collections c
        JOIN public.channels ch ON ch.id = c.channel_id
        WHERE c.id = collection_id AND ch.creator_id = auth.uid()
    )
);
CREATE POLICY "Creators can update clips" ON public.clips FOR UPDATE USING (
    EXISTS (
        SELECT 1 FROM public.collections c
        JOIN public.channels ch ON ch.id = c.channel_id
        WHERE c.id = clips.collection_id AND ch.creator_id = auth.uid()
    )
);
CREATE POLICY "Creators can delete clips" ON public.clips FOR DELETE USING (
    EXISTS (
        SELECT 1 FROM public.collections c
        JOIN public.channels ch ON ch.id = c.channel_id
        WHERE c.id = clips.collection_id AND ch.creator_id = auth.uid()
    )
);

-- =====================================================
-- CAR INFO POLICIES
-- =====================================================
CREATE POLICY "Car info is viewable" ON public.car_info FOR SELECT USING (true);
CREATE POLICY "Creators can insert car info" ON public.car_info FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.clips cl
        JOIN public.collections c ON c.id = cl.collection_id
        JOIN public.channels ch ON ch.id = c.channel_id
        WHERE cl.id = clip_id AND ch.creator_id = auth.uid()
    )
);
CREATE POLICY "Creators can update car info" ON public.car_info FOR UPDATE USING (
    EXISTS (
        SELECT 1 FROM public.clips cl
        JOIN public.collections c ON c.id = cl.collection_id
        JOIN public.channels ch ON ch.id = c.channel_id
        WHERE cl.id = car_info.clip_id AND ch.creator_id = auth.uid()
    )
);

-- =====================================================
-- PERFORMANCE STATS POLICIES
-- =====================================================
CREATE POLICY "Performance stats are viewable" ON public.performance_stats FOR SELECT USING (true);
CREATE POLICY "Creators can insert performance stats" ON public.performance_stats FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.clips cl
        JOIN public.collections c ON c.id = cl.collection_id
        JOIN public.channels ch ON ch.id = c.channel_id
        WHERE cl.id = clip_id AND ch.creator_id = auth.uid()
    )
);
CREATE POLICY "Creators can update performance stats" ON public.performance_stats FOR UPDATE USING (
    EXISTS (
        SELECT 1 FROM public.clips cl
        JOIN public.collections c ON c.id = cl.collection_id
        JOIN public.channels ch ON ch.id = c.channel_id
        WHERE cl.id = performance_stats.clip_id AND ch.creator_id = auth.uid()
    )
);

-- =====================================================
-- DONE!
-- =====================================================
SELECT 'RLS policies updated successfully!' as status;
