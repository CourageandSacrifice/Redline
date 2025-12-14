-- =====================================================
-- REDLINE - Seed Data
-- =====================================================
-- Run AFTER creating users in Supabase Auth:
-- - admin@redline.com (password: password123)
-- - creator@redline.com (password: password123)
-- - viewer@redline.com (password: password123)
-- =====================================================

DO $$
DECLARE
    v_admin_id UUID;
    v_creator_id UUID;
    v_viewer_id UUID;
    v_channel1_id UUID;
    v_channel2_id UUID;
    v_collection1_id UUID;
    v_collection2_id UUID;
    v_collection3_id UUID;
    v_collection4_id UUID;
    v_clip1_id UUID;
    v_clip2_id UUID;
    v_clip3_id UUID;
    v_clip4_id UUID;
    v_clip5_id UUID;
    v_clip6_id UUID;
BEGIN
    -- Get user IDs
    SELECT id INTO v_admin_id FROM public.users WHERE email = 'admin@redline.com';
    SELECT id INTO v_creator_id FROM public.users WHERE email = 'creator@redline.com';
    SELECT id INTO v_viewer_id FROM public.users WHERE email = 'viewer@redline.com';
    
    -- Update roles
    IF v_admin_id IS NOT NULL THEN
        UPDATE public.users SET role = 'admin', username = 'RedlineAdmin' WHERE id = v_admin_id;
    END IF;
    
    IF v_creator_id IS NOT NULL THEN
        UPDATE public.users SET role = 'creator', username = 'SpeedDemon' WHERE id = v_creator_id;
    END IF;
    
    IF v_viewer_id IS NOT NULL THEN
        UPDATE public.users SET role = 'viewer', username = 'RaceFan99' WHERE id = v_viewer_id;
    END IF;
    
    IF v_creator_id IS NULL THEN
        RAISE NOTICE 'Creator user not found. Create users in Supabase Auth first.';
        RETURN;
    END IF;
    
    -- =====================================================
    -- CHANNEL 1: JDM Legends
    -- =====================================================
    INSERT INTO public.channels (id, name, description, creator_id, subscriber_count, is_verified)
    VALUES (
        uuid_generate_v4(),
        'JDM Legends',
        'The best JDM builds and pulls. GTRs, Supras, RX7s and more. Street racing content from the underground scene.',
        v_creator_id,
        12500,
        true
    ) RETURNING id INTO v_channel1_id;
    
    -- Collection 1: GTR Pulls
    INSERT INTO public.collections (id, channel_id, title, description, order_index)
    VALUES (
        uuid_generate_v4(),
        v_channel1_id,
        'GTR Highway Pulls',
        'R35 and R34 GTR pulls on empty highways',
        0
    ) RETURNING id INTO v_collection1_id;
    
    -- Clip 1: R35 GTR 800hp Pull
    INSERT INTO public.clips (id, collection_id, title, description, video_url, order_index, view_count, like_count)
    VALUES (
        uuid_generate_v4(),
        v_collection1_id,
        'R35 GTR 800HP Highway Pull - 0-180mph',
        'Full bolt-on R35 with E85 tune making 800whp. Clean highway pull showing the power of the VR38.',
        'https://www.youtube.com/embed/dQw4w9WgXcQ',
        0,
        245000,
        18500
    ) RETURNING id INTO v_clip1_id;
    
    INSERT INTO public.car_info (clip_id, make, model, year, car_type, horsepower, torque, engine, transmission, drivetrain, mods)
    VALUES (
        v_clip1_id,
        'Nissan',
        'GT-R',
        2017,
        'jdm',
        800,
        720,
        'VR38DETT 3.8L Twin Turbo V6',
        'dct',
        'awd',
        ARRAY['AMS Alpha 9 Turbos', 'ID1050x Injectors', 'E85 Flex Fuel', 'Cobb Accessport', 'HKS Exhaust', 'Dodson Transmission Build']
    );
    
    INSERT INTO public.performance_stats (clip_id, zero_to_60_mph, zero_to_100_mph, zero_to_100_kmh, quarter_mile_time, quarter_mile_speed, top_speed, location, is_verified)
    VALUES (
        v_clip1_id,
        2.7,
        5.9,
        2.5,
        9.8,
        145,
        198,
        'Texas Highway',
        true
    );
    
    -- Clip 2: R34 GTR Street Race
    INSERT INTO public.clips (id, collection_id, title, description, video_url, order_index, view_count, like_count)
    VALUES (
        uuid_generate_v4(),
        v_collection1_id,
        'R34 GTR vs Supra - Midnight Street Race',
        'Legendary matchup between a built R34 and single turbo Supra. Both cars making over 700whp.',
        'https://www.youtube.com/embed/dQw4w9WgXcQ',
        1,
        189000,
        15200
    ) RETURNING id INTO v_clip2_id;
    
    INSERT INTO public.car_info (clip_id, make, model, year, car_type, horsepower, torque, engine, transmission, drivetrain, mods)
    VALUES (
        v_clip2_id,
        'Nissan',
        'Skyline GT-R V-Spec',
        1999,
        'jdm',
        720,
        650,
        'RB26DETT 2.8L Stroker',
        'manual',
        'awd',
        ARRAY['HKS GT-SS Turbos', 'Nismo 740cc Injectors', 'HKS V-Cam', 'Getrag 6-Speed', 'HKS Intercooler']
    );
    
    INSERT INTO public.performance_stats (clip_id, zero_to_60_mph, zero_to_100_mph, zero_to_100_kmh, quarter_mile_time, quarter_mile_speed, location)
    VALUES (
        v_clip2_id,
        3.2,
        7.1,
        3.0,
        10.4,
        138,
        'Tokyo Wangan'
    );
    
    -- Collection 2: Supra Builds
    INSERT INTO public.collections (id, channel_id, title, description, order_index)
    VALUES (
        uuid_generate_v4(),
        v_channel1_id,
        'Supra Builds',
        'A80 and A90 Supra builds and racing',
        1
    ) RETURNING id INTO v_collection2_id;
    
    -- Clip 3: MK4 Supra 1000hp
    INSERT INTO public.clips (id, collection_id, title, description, video_url, order_index, view_count, like_count)
    VALUES (
        uuid_generate_v4(),
        v_collection2_id,
        'MK4 Supra 1000HP - The Legend Lives',
        '2JZ powered MK4 Supra making 1000whp on pump gas. Single turbo setup with built motor.',
        'https://www.youtube.com/embed/dQw4w9WgXcQ',
        0,
        320000,
        28000
    ) RETURNING id INTO v_clip3_id;
    
    INSERT INTO public.car_info (clip_id, make, model, year, car_type, horsepower, torque, engine, transmission, drivetrain, mods)
    VALUES (
        v_clip3_id,
        'Toyota',
        'Supra RZ',
        1994,
        'jdm',
        1000,
        850,
        '2JZ-GTE 3.0L Single Turbo',
        'manual',
        'rwd',
        ARRAY['Precision 6766 Turbo', 'BC Brian Crower Stroker Kit', '2000cc Injectors', 'Haltech Elite 2500', 'CD009 6-Speed Swap', 'OS Giken Diff']
    );
    
    INSERT INTO public.performance_stats (clip_id, zero_to_60_mph, zero_to_100_mph, zero_to_100_kmh, hundred_to_200_kmh, quarter_mile_time, quarter_mile_speed, top_speed, is_verified)
    VALUES (
        v_clip3_id,
        2.9,
        6.2,
        2.7,
        8.5,
        9.2,
        152,
        205,
        true
    );
    
    -- =====================================================
    -- CHANNEL 2: American Muscle
    -- =====================================================
    INSERT INTO public.channels (id, name, description, creator_id, subscriber_count, is_verified)
    VALUES (
        uuid_generate_v4(),
        'American Muscle',
        'Mustangs, Camaros, Challengers and more. Big power, big burnouts, and drag racing action.',
        v_creator_id,
        8700,
        false
    ) RETURNING id INTO v_channel2_id;
    
    -- Collection 3: Hellcat Content
    INSERT INTO public.collections (id, channel_id, title, description, order_index)
    VALUES (
        uuid_generate_v4(),
        v_channel2_id,
        'Hellcat Madness',
        'Supercharged Mopar madness',
        0
    ) RETURNING id INTO v_collection3_id;
    
    -- Clip 4: Hellcat Redeye
    INSERT INTO public.clips (id, collection_id, title, description, video_url, order_index, view_count, like_count)
    VALUES (
        uuid_generate_v4(),
        v_collection3_id,
        'Challenger Redeye 900HP - Demon Killer',
        'Pulley and tune Redeye making serious power. E85 and headers pushing this thing into the 9s.',
        'https://www.youtube.com/embed/dQw4w9WgXcQ',
        0,
        156000,
        12300
    ) RETURNING id INTO v_clip4_id;
    
    INSERT INTO public.car_info (clip_id, make, model, year, car_type, horsepower, torque, engine, transmission, drivetrain, mods)
    VALUES (
        v_clip4_id,
        'Dodge',
        'Challenger SRT Hellcat Redeye',
        2022,
        'muscle',
        900,
        920,
        '6.2L Supercharged HEMI V8',
        'automatic',
        'rwd',
        ARRAY['2.65 Pulley', 'Fore Innovations Fuel System', 'American Racing Headers', 'E85 Tune', 'HP Tuners', 'Drag Radials']
    );
    
    INSERT INTO public.performance_stats (clip_id, zero_to_60_mph, zero_to_100_mph, quarter_mile_time, quarter_mile_speed, location, weather_conditions)
    VALUES (
        v_clip4_id,
        3.1,
        6.8,
        9.9,
        140,
        'Houston Street',
        'Clear, 75°F'
    );
    
    -- Collection 4: Mustang Pulls
    INSERT INTO public.collections (id, channel_id, title, description, order_index)
    VALUES (
        uuid_generate_v4(),
        v_channel2_id,
        'Mustang Mayhem',
        'GT500s, GT350s, and built GTs',
        1
    ) RETURNING id INTO v_collection4_id;
    
    -- Clip 5: GT500
    INSERT INTO public.clips (id, collection_id, title, description, video_url, order_index, view_count, like_count)
    VALUES (
        uuid_generate_v4(),
        v_collection4_id,
        'GT500 1000HP Roll Racing',
        'Whipple swapped GT500 making 1000+ to the wheels. 60-130 in under 4 seconds.',
        'https://www.youtube.com/embed/dQw4w9WgXcQ',
        0,
        98000,
        8900
    ) RETURNING id INTO v_clip5_id;
    
    INSERT INTO public.car_info (clip_id, make, model, year, car_type, horsepower, torque, engine, transmission, drivetrain, mods)
    VALUES (
        v_clip5_id,
        'Ford',
        'Mustang Shelby GT500',
        2021,
        'muscle',
        1050,
        980,
        '5.2L Supercharged V8',
        'dct',
        'rwd',
        ARRAY['Whipple W185RF Upgrade', 'Lethal Performance Tune', 'Long Tube Headers', 'E85', 'Carbon Fiber Driveshaft', 'BMR Suspension']
    );
    
    INSERT INTO public.performance_stats (clip_id, zero_to_60_mph, sixty_to_130_mph, zero_to_100_mph, quarter_mile_time, quarter_mile_speed, is_verified)
    VALUES (
        v_clip5_id,
        2.8,
        3.8,
        5.4,
        9.5,
        148,
        true
    );
    
    -- Clip 6: Coyote Mustang
    INSERT INTO public.clips (id, collection_id, title, description, video_url, order_index, view_count, like_count)
    VALUES (
        uuid_generate_v4(),
        v_collection4_id,
        'Twin Turbo Coyote - 1200HP Street Build',
        'Gen 3 Coyote with twin Precision turbos. Full build breakdown and testing.',
        'https://www.youtube.com/embed/dQw4w9WgXcQ',
        1,
        210000,
        19500
    ) RETURNING id INTO v_clip6_id;
    
    INSERT INTO public.car_info (clip_id, make, model, year, car_type, horsepower, torque, engine, transmission, drivetrain, mods)
    VALUES (
        v_clip6_id,
        'Ford',
        'Mustang GT',
        2020,
        'muscle',
        1200,
        1050,
        '5.0L Coyote V8 Twin Turbo',
        'manual',
        'rwd',
        ARRAY['Precision 6266 Twin Turbos', 'MMR Built Short Block', 'Tremec T56 Magnum', 'Holley Terminator X', 'Aeromotive Fuel System', 'BMR K-Member']
    );
    
    INSERT INTO public.performance_stats (clip_id, zero_to_60_mph, zero_to_100_mph, quarter_mile_time, quarter_mile_speed, top_speed, location, is_verified)
    VALUES (
        v_clip6_id,
        2.5,
        5.1,
        8.9,
        158,
        210,
        'Private Airstrip',
        true
    );
    
    -- =====================================================
    -- SUBSCRIPTIONS
    -- =====================================================
    IF v_viewer_id IS NOT NULL THEN
        INSERT INTO public.subscriptions (user_id, channel_id) VALUES (v_viewer_id, v_channel1_id);
        INSERT INTO public.subscriptions (user_id, channel_id) VALUES (v_viewer_id, v_channel2_id);
    END IF;
    
    IF v_admin_id IS NOT NULL THEN
        INSERT INTO public.subscriptions (user_id, channel_id) VALUES (v_admin_id, v_channel1_id);
    END IF;
    
    RAISE NOTICE 'Seed data created successfully!';
END $$;
