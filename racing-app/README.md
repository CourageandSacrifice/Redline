# 🏎️ REDLINE - Street Racing Clips & Performance Tracking

A modern street racing clips platform with GPS-based performance tracking. Built with Next.js 14, Supabase, and Tailwind CSS.

## ✨ Features

### Core Features
- 🔐 **Supabase Authentication** - Email/password login with role-based access
- 👥 **User Roles** - Viewers, Creators, and Admins
- 📺 **Channel System** - Create channels with collections and clips
- 🎬 **Video Clips** - Embed videos with full car specs and performance data

### Performance Tracking
- ⏱️ **GPS Speedometer** - Track 0-60, 0-100, and top speed using phone GPS
- 📊 **Performance Stats** - 0-60 mph, 0-100 mph, 0-100 km/h, 100-200 km/h, quarter mile times
- 🏆 **Leaderboards** - Compare times with other users
- 🚗 **Car Database** - Track make, model, mods, and specs

### UI/UX
- 🌙 **Dark Neon Theme** - Purple/cyan racing aesthetic
- 📱 **Responsive Design** - Works on mobile and desktop
- ⬅️➡️ **Clip Navigation** - Browse clips with prev/next arrows
- 🎨 **Beautiful Animations** - Smooth transitions and effects

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Fonts**: Orbitron, Rajdhani
- **Deployment**: Vercel

## 📁 Project Structure

```
redline/
├── app/
│   ├── auth/login/           # Login page
│   ├── dashboard/            # Main dashboard
│   │   ├── channels/         # Channel views
│   │   │   └── [channelId]/
│   │   │       └── collections/
│   │   │           └── [collectionId]/
│   │   │               └── clips/
│   │   │                   └── [clipId]/  # Clip viewer
│   │   └── page.tsx          # Dashboard home
│   ├── speedometer/          # GPS Speedometer
│   ├── globals.css           # Global styles
│   └── layout.tsx
├── components/
│   ├── Header.tsx            # Top header with profile
│   └── Sidebar.tsx           # Navigation sidebar
├── lib/supabase/             # Supabase clients
├── supabase/
│   ├── migrations/           # Database schema
│   └── seed.sql              # Test data
└── types/                    # TypeScript types
```

## 🚀 Quick Start

### 1. Clone & Install

```bash
git clone <your-repo>
cd redline
npm install
```

### 2. Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Wait for it to initialize

### 3. Set Up Environment

```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your Supabase credentials:
- `NEXT_PUBLIC_SUPABASE_URL` - From Project Settings > API
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - From Project Settings > API

### 4. Set Up Database

1. Go to Supabase SQL Editor
2. Run `supabase/migrations/001_initial_schema.sql`
3. Create test users in Authentication > Users:
   - `admin@redline.com` (password: password123)
   - `creator@redline.com` (password: password123)
   - `viewer@redline.com` (password: password123)
4. Run `supabase/seed.sql` to add sample data

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 📱 GPS Speedometer

The GPS Speedometer uses your phone's location services to track speed and calculate acceleration times.

### How It Works
1. Open the Speedometer page
2. Grant location permissions
3. Press "START RUN"
4. Accelerate - the app tracks your speed via GPS
5. Press "STOP" to see your results

### Tracked Metrics
- **0-60 MPH** - Time to reach 60 mph from standstill
- **0-100 MPH** - Time to reach 100 mph
- **0-100 KM/H** - Time to reach 100 km/h
- **100-200 KM/H** - Time from 100 to 200 km/h
- **Max Speed** - Highest speed recorded

### Tips for Accuracy
- Use in open areas (highways, airstrips)
- Mount phone securely
- Start from a complete stop
- Wait for GPS lock before accelerating
- GPS accuracy is typically ±2-3 MPH

⚠️ **Safety Warning**: Always drive legally and safely. Use closed courses or private property for performance testing.

## 🎨 Theme Customization

Edit `tailwind.config.js` to customize colors:

```js
colors: {
  'neon': {
    purple: '#bf00ff',
    cyan: '#00f0ff',
    pink: '#ff00aa',
    green: '#00ff88',
    red: '#ff0044',
  }
}
```

## 🚗 Database Structure

### Tables
- **users** - User profiles and roles
- **channels** - Creator channels
- **collections** - Video collections/playlists
- **clips** - Individual video clips
- **car_info** - Vehicle specifications
- **performance_stats** - Acceleration/speed data
- **speed_runs** - GPS-tracked runs
- **subscriptions** - Channel subscriptions
- **likes** - Clip likes

### User Roles
- **viewer** - Watch clips, track own runs
- **creator** - Create channels and upload clips
- **admin** - Full platform access

## 🚀 Deploy to Vercel

1. Push code to GitHub
2. Import to [Vercel](https://vercel.com)
3. Add environment variables
4. Deploy!

```bash
# Or use CLI
npm i -g vercel
vercel
```

## 📄 License

MIT License - feel free to use for your own projects!

---

Built with 🏁 by racing enthusiasts
