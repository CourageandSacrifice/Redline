-- =====================================================
-- REDLINE - Street Racing Clips Database Schema
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE user_role AS ENUM ('viewer', 'creator', 'admin');
CREATE TYPE car_type AS ENUM ('jdm', 'euro', 'muscle', 'exotic', 'truck', 'other');
CREATE TYPE transmission_type AS ENUM ('manual', 'automatic', 'dct', 'cvt');
CREATE TYPE drivetrain_type AS ENUM ('fwd', 'rwd', 'awd', '4wd');
CREATE TYPE post_type AS ENUM ('video', 'text');

-- =====================================================
-- USERS TABLE
-- =====================================================
CREATE TABLE public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    username TEXT NOT NULL UNIQUE,
    avatar_url TEXT,
    role user_role NOT NULL DEFAULT 'viewer',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================
-- CHANNELS TABLE
-- =====================================================
CREATE TABLE public.channels (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    avatar_url TEXT,
    banner_url TEXT,
    creator_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    subscriber_count INTEGER NOT NULL DEFAULT 0,
    is_verified BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================
-- COLLECTIONS TABLE (like playlists/sections)
-- =====================================================
CREATE TABLE public.collections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    channel_id UUID NOT NULL REFERENCES public.channels(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    thumbnail_url TEXT,
    order_index INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================
-- CLIPS/POSTS TABLE
-- =====================================================
CREATE TABLE public.clips (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    collection_id UUID NOT NULL REFERENCES public.collections(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    content TEXT,
    post_type post_type NOT NULL DEFAULT 'video',
    video_url TEXT,
    thumbnail_url TEXT,
    order_index INTEGER NOT NULL DEFAULT 0,
    view_count INTEGER NOT NULL DEFAULT 0,
    like_count INTEGER NOT NULL DEFAULT 0,
    comment_count INTEGER NOT NULL DEFAULT 0,
    is_published BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================
-- COMMENTS TABLE
-- =====================================================
CREATE TABLE public.comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clip_id UUID NOT NULL REFERENCES public.clips(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    like_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================
-- CAR INFO TABLE
-- =====================================================
CREATE TABLE public.car_info (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clip_id UUID NOT NULL REFERENCES public.clips(id) ON DELETE CASCADE,
    make TEXT NOT NULL,
    model TEXT NOT NULL,
    year INTEGER NOT NULL,
    car_type car_type NOT NULL DEFAULT 'other',
    color TEXT,
    horsepower INTEGER,
    torque INTEGER,
    engine TEXT,
    transmission transmission_type,
    drivetrain drivetrain_type,
    mods TEXT[],
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================
-- PERFORMANCE STATS TABLE
-- =====================================================
CREATE TABLE public.performance_stats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clip_id UUID NOT NULL REFERENCES public.clips(id) ON DELETE CASCADE,
    zero_to_60_mph DECIMAL(5,2),
    zero_to_100_mph DECIMAL(5,2),
    sixty_to_130_mph DECIMAL(5,2),
    zero_to_100_kmh DECIMAL(5,2),
    hundred_to_200_kmh DECIMAL(5,2),
    quarter_mile_time DECIMAL(5,2),
    quarter_mile_speed DECIMAL(5,1),
    top_speed DECIMAL(5,1),
    recorded_at TIMESTAMPTZ,
    location TEXT,
    weather_conditions TEXT,
    is_verified BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================
-- SPEED RUNS TABLE (GPS tracked runs)
-- =====================================================
CREATE TABLE public.speed_runs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ended_at TIMESTAMPTZ,
    data_points JSONB NOT NULL DEFAULT '[]',
    zero_to_60_mph DECIMAL(5,2),
    zero_to_100_mph DECIMAL(5,2),
    zero_to_100_kmh DECIMAL(5,2),
    hundred_to_200_kmh DECIMAL(5,2),
    max_speed_mph DECIMAL(5,1),
    max_speed_kmh DECIMAL(5,1),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================
-- SUBSCRIPTIONS TABLE
-- =====================================================
CREATE TABLE public.subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    channel_id UUID NOT NULL REFERENCES public.channels(id) ON DELETE CASCADE,
    subscribed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, channel_id)
);

-- =====================================================
-- LIKES TABLE
-- =====================================================
CREATE TABLE public.likes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    clip_id UUID NOT NULL REFERENCES public.clips(id) ON DELETE CASCADE,
    liked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, clip_id)
);

-- =====================================================
-- INDEXES
-- =====================================================
CREATE INDEX idx_channels_creator_id ON public.channels(creator_id);
CREATE INDEX idx_collections_channel_id ON public.collections(channel_id);
CREATE INDEX idx_clips_collection_id ON public.clips(collection_id);
CREATE INDEX idx_car_info_clip_id ON public.car_info(clip_id);
CREATE INDEX idx_performance_stats_clip_id ON public.performance_stats(clip_id);
CREATE INDEX idx_performance_stats_zero_60 ON public.performance_stats(zero_to_60_mph);
CREATE INDEX idx_speed_runs_user_id ON public.speed_runs(user_id);
CREATE INDEX idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX idx_subscriptions_channel_id ON public.subscriptions(channel_id);
CREATE INDEX idx_likes_user_id ON public.likes(user_id);
CREATE INDEX idx_likes_clip_id ON public.likes(clip_id);

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.car_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performance_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.speed_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users are viewable by everyone" ON public.users FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.users FOR INSERT WITH CHECK (auth.uid() = id);

-- Channels policies
CREATE POLICY "Channels are viewable by everyone" ON public.channels FOR SELECT USING (true);
CREATE POLICY "Creators can insert channels" ON public.channels FOR INSERT WITH CHECK (creator_id = auth.uid());
CREATE POLICY "Creators can update own channels" ON public.channels FOR UPDATE USING (creator_id = auth.uid());
CREATE POLICY "Creators can delete own channels" ON public.channels FOR DELETE USING (creator_id = auth.uid());

-- Collections policies
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

-- Clips policies
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

-- Car info policies
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

-- Performance stats policies
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

-- Speed runs policies
CREATE POLICY "Users can view own speed runs" ON public.speed_runs FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert own speed runs" ON public.speed_runs FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own speed runs" ON public.speed_runs FOR UPDATE USING (user_id = auth.uid());

-- Subscriptions policies
CREATE POLICY "Users can view own subscriptions" ON public.subscriptions FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can subscribe" ON public.subscriptions FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can unsubscribe" ON public.subscriptions FOR DELETE USING (user_id = auth.uid());

-- Likes policies
CREATE POLICY "Likes are viewable" ON public.likes FOR SELECT USING (true);
CREATE POLICY "Users can like" ON public.likes FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can unlike" ON public.likes FOR DELETE USING (user_id = auth.uid());

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Auto-create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, username, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
        COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'viewer')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update subscriber count
CREATE OR REPLACE FUNCTION public.update_subscriber_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.channels SET subscriber_count = subscriber_count + 1 WHERE id = NEW.channel_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.channels SET subscriber_count = subscriber_count - 1 WHERE id = OLD.channel_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_subscription_change
    AFTER INSERT OR DELETE ON public.subscriptions
    FOR EACH ROW EXECUTE FUNCTION public.update_subscriber_count();

-- Update like count
CREATE OR REPLACE FUNCTION public.update_like_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.clips SET like_count = like_count + 1 WHERE id = NEW.clip_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.clips SET like_count = like_count - 1 WHERE id = OLD.clip_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_like_change
    AFTER INSERT OR DELETE ON public.likes
    FOR EACH ROW EXECUTE FUNCTION public.update_like_count();

-- Updated at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_channels_updated_at BEFORE UPDATE ON public.channels
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_collections_updated_at BEFORE UPDATE ON public.collections
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_clips_updated_at BEFORE UPDATE ON public.clips
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON public.comments
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Update comment count trigger
CREATE OR REPLACE FUNCTION public.update_comment_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.clips SET comment_count = comment_count + 1 WHERE id = NEW.clip_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.clips SET comment_count = comment_count - 1 WHERE id = OLD.clip_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_comment_change
    AFTER INSERT OR DELETE ON public.comments
    FOR EACH ROW EXECUTE FUNCTION public.update_comment_count();

-- Comments RLS
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Comments are viewable by everyone"
    ON public.comments FOR SELECT
    USING (true);

CREATE POLICY "Users can create comments"
    ON public.comments FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments"
    ON public.comments FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments"
    ON public.comments FOR DELETE
    USING (auth.uid() = user_id);

-- Create indexes for comments
CREATE INDEX idx_comments_clip_id ON public.comments(clip_id);
CREATE INDEX idx_comments_user_id ON public.comments(user_id);
CREATE INDEX idx_comments_parent_id ON public.comments(parent_id);
CREATE TRIGGER update_car_info_updated_at BEFORE UPDATE ON public.car_info
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_performance_stats_updated_at BEFORE UPDATE ON public.performance_stats
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
