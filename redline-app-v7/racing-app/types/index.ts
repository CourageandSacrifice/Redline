// User roles
export type UserRole = 'viewer' | 'creator' | 'admin';

// Car types
export type CarType = 'jdm' | 'euro' | 'muscle' | 'exotic' | 'truck' | 'other';

// Database types
export interface User {
  id: string;
  email: string;
  username: string;
  avatar_url?: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface Channel {
  id: string;
  name: string;
  description: string;
  avatar_url?: string;
  banner_url?: string;
  creator_id: string;
  subscriber_count: number;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
  // Joined data
  creator?: User;
  collections?: Collection[];
}

export interface Collection {
  id: string;
  channel_id: string;
  title: string;
  description?: string;
  thumbnail_url?: string;
  order_index: number;
  created_at: string;
  updated_at: string;
  // Joined data
  clips?: Clip[];
}

export interface Clip {
  id: string;
  collection_id: string;
  title: string;
  description?: string;
  video_url: string;
  thumbnail_url?: string;
  order_index: number;
  view_count: number;
  like_count: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
  // Car info
  car_info?: CarInfo;
  // Performance stats
  performance?: PerformanceStats;
  // Joined data
  collection?: Collection;
}

export interface CarInfo {
  id: string;
  clip_id: string;
  make: string;
  model: string;
  year: number;
  car_type: CarType;
  color?: string;
  horsepower?: number;
  torque?: number;
  engine?: string;
  transmission?: 'manual' | 'automatic' | 'dct' | 'cvt';
  drivetrain?: 'fwd' | 'rwd' | 'awd' | '4wd';
  mods?: string[];
}

export interface PerformanceStats {
  id: string;
  clip_id: string;
  zero_to_60_mph?: number;      // seconds
  zero_to_100_mph?: number;     // seconds
  sixty_to_130_mph?: number;    // seconds
  zero_to_100_kmh?: number;     // seconds
  hundred_to_200_kmh?: number;  // seconds
  quarter_mile_time?: number;   // seconds
  quarter_mile_speed?: number;  // mph trap speed
  top_speed?: number;           // mph
  recorded_at?: string;
  location?: string;
  weather_conditions?: string;
  is_verified: boolean;
}

// GPS Tracking
export interface SpeedRun {
  id: string;
  user_id: string;
  started_at: string;
  ended_at?: string;
  data_points: SpeedDataPoint[];
  calculated_stats?: CalculatedStats;
}

export interface SpeedDataPoint {
  timestamp: number;
  speed_mph: number;
  speed_kmh: number;
  latitude?: number;
  longitude?: number;
  accuracy?: number;
}

export interface CalculatedStats {
  zero_to_60_mph?: number;
  zero_to_100_mph?: number;
  zero_to_100_kmh?: number;
  hundred_to_200_kmh?: number;
  max_speed_mph: number;
  max_speed_kmh: number;
}

// Subscriptions
export interface Subscription {
  id: string;
  user_id: string;
  channel_id: string;
  subscribed_at: string;
}

// Likes
export interface Like {
  id: string;
  user_id: string;
  clip_id: string;
  liked_at: string;
}

// API Response types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
}

// Navigation context
export interface NavigationState {
  currentChannel?: Channel;
  currentCollection?: Collection;
  currentClip?: Clip;
  previousClip?: Clip;
  nextClip?: Clip;
}

// Leaderboard entry
export interface LeaderboardEntry {
  rank: number;
  user: User;
  clip: Clip;
  car_info: CarInfo;
  performance: PerformanceStats;
}
