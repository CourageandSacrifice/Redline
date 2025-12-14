'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { 
  Upload,
  Video,
  Car,
  Gauge,
  Timer,
  Settings,
  ChevronRight,
  ChevronLeft,
  Check,
  X,
  Plus,
  Trash2,
  Link as LinkIcon,
  Image as ImageIcon,
  Loader2,
  Zap
} from 'lucide-react';

type Step = 'video' | 'car' | 'performance' | 'review';

interface FormData {
  // Video info
  title: string;
  description: string;
  video_url: string;
  thumbnail_url: string;
  collection_id: string;
  
  // Car info
  make: string;
  model: string;
  year: string;
  car_type: string;
  color: string;
  horsepower: string;
  torque: string;
  engine: string;
  transmission: string;
  drivetrain: string;
  mods: string[];
  
  // Performance
  zero_to_60_mph: string;
  zero_to_100_mph: string;
  zero_to_100_kmh: string;
  hundred_to_200_kmh: string;
  quarter_mile_time: string;
  quarter_mile_speed: string;
  top_speed: string;
  location: string;
  weather_conditions: string;
}

const initialFormData: FormData = {
  title: '',
  description: '',
  video_url: '',
  thumbnail_url: '',
  collection_id: '',
  make: '',
  model: '',
  year: '',
  car_type: 'other',
  color: '',
  horsepower: '',
  torque: '',
  engine: '',
  transmission: '',
  drivetrain: '',
  mods: [],
  zero_to_60_mph: '',
  zero_to_100_mph: '',
  zero_to_100_kmh: '',
  hundred_to_200_kmh: '',
  quarter_mile_time: '',
  quarter_mile_speed: '',
  top_speed: '',
  location: '',
  weather_conditions: '',
};

const carTypes = [
  { value: 'jdm', label: 'JDM', color: 'text-red-400' },
  { value: 'euro', label: 'Euro', color: 'text-blue-400' },
  { value: 'muscle', label: 'Muscle', color: 'text-orange-400' },
  { value: 'exotic', label: 'Exotic', color: 'text-purple-400' },
  { value: 'truck', label: 'Truck', color: 'text-green-400' },
  { value: 'other', label: 'Other', color: 'text-gray-400' },
];

const transmissionTypes = [
  { value: 'manual', label: 'Manual' },
  { value: 'automatic', label: 'Automatic' },
  { value: 'dct', label: 'DCT' },
  { value: 'cvt', label: 'CVT' },
];

const drivetrainTypes = [
  { value: 'fwd', label: 'FWD' },
  { value: 'rwd', label: 'RWD' },
  { value: 'awd', label: 'AWD' },
  { value: '4wd', label: '4WD' },
];

export default function UploadPage() {
  const [currentStep, setCurrentStep] = useState<Step>('video');
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [collections, setCollections] = useState<any[]>([]);
  const [channels, setChannels] = useState<any[]>([]);
  const [newMod, setNewMod] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const supabase = createClient();

  const steps: { key: Step; label: string; icon: any }[] = [
    { key: 'video', label: 'Video', icon: Video },
    { key: 'car', label: 'Car Info', icon: Car },
    { key: 'performance', label: 'Performance', icon: Timer },
    { key: 'review', label: 'Review', icon: Check },
  ];

  // Fetch user's channels and collections
  useEffect(() => {
    async function fetchData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: channelsData } = await supabase
        .from('channels')
        .select(`
          id,
          name,
          collections (
            id,
            title
          )
        `)
        .eq('creator_id', user.id);

      if (channelsData) {
        setChannels(channelsData);
        // Flatten collections
        const allCollections = channelsData.flatMap((ch: any) => 
          ch.collections?.map((col: any) => ({
            ...col,
            channelName: ch.name,
            channelId: ch.id,
          })) || []
        );
        setCollections(allCollections);
      }
    }

    fetchData();
  }, []);

  const updateForm = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addMod = () => {
    if (newMod.trim() && !formData.mods.includes(newMod.trim())) {
      updateForm('mods', [...formData.mods, newMod.trim()]);
      setNewMod('');
    }
  };

  const removeMod = (mod: string) => {
    updateForm('mods', formData.mods.filter(m => m !== mod));
  };

  const goToStep = (step: Step) => {
    setCurrentStep(step);
  };

  const nextStep = () => {
    const stepOrder: Step[] = ['video', 'car', 'performance', 'review'];
    const currentIndex = stepOrder.indexOf(currentStep);
    if (currentIndex < stepOrder.length - 1) {
      setCurrentStep(stepOrder[currentIndex + 1]);
    }
  };

  const prevStep = () => {
    const stepOrder: Step[] = ['video', 'car', 'performance', 'review'];
    const currentIndex = stepOrder.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(stepOrder[currentIndex - 1]);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');

    try {
      // Get highest order_index for the collection
      const { data: existingClips } = await supabase
        .from('clips')
        .select('order_index')
        .eq('collection_id', formData.collection_id)
        .order('order_index', { ascending: false })
        .limit(1);

      const nextOrderIndex = (existingClips?.[0]?.order_index || 0) + 1;

      // Create clip
      const { data: clip, error: clipError } = await supabase
        .from('clips')
        .insert({
          collection_id: formData.collection_id,
          title: formData.title,
          description: formData.description,
          video_url: formData.video_url,
          thumbnail_url: formData.thumbnail_url,
          order_index: nextOrderIndex,
          is_published: true,
        })
        .select()
        .single();

      if (clipError) throw clipError;

      // Create car info if provided
      if (formData.make && formData.model && formData.year) {
        const { error: carError } = await supabase
          .from('car_info')
          .insert({
            clip_id: clip.id,
            make: formData.make,
            model: formData.model,
            year: parseInt(formData.year),
            car_type: formData.car_type,
            color: formData.color || null,
            horsepower: formData.horsepower ? parseInt(formData.horsepower) : null,
            torque: formData.torque ? parseInt(formData.torque) : null,
            engine: formData.engine || null,
            transmission: formData.transmission || null,
            drivetrain: formData.drivetrain || null,
            mods: formData.mods.length > 0 ? formData.mods : null,
          });

        if (carError) console.error('Car info error:', carError);
      }

      // Create performance stats if provided
      if (formData.zero_to_60_mph || formData.quarter_mile_time || formData.top_speed) {
        const { error: perfError } = await supabase
          .from('performance_stats')
          .insert({
            clip_id: clip.id,
            zero_to_60_mph: formData.zero_to_60_mph ? parseFloat(formData.zero_to_60_mph) : null,
            zero_to_100_mph: formData.zero_to_100_mph ? parseFloat(formData.zero_to_100_mph) : null,
            zero_to_100_kmh: formData.zero_to_100_kmh ? parseFloat(formData.zero_to_100_kmh) : null,
            hundred_to_200_kmh: formData.hundred_to_200_kmh ? parseFloat(formData.hundred_to_200_kmh) : null,
            quarter_mile_time: formData.quarter_mile_time ? parseFloat(formData.quarter_mile_time) : null,
            quarter_mile_speed: formData.quarter_mile_speed ? parseFloat(formData.quarter_mile_speed) : null,
            top_speed: formData.top_speed ? parseFloat(formData.top_speed) : null,
            location: formData.location || null,
            weather_conditions: formData.weather_conditions || null,
          });

        if (perfError) console.error('Performance stats error:', perfError);
      }

      router.push('/dashboard/feed');
    } catch (err: any) {
      setError(err.message || 'Failed to create clip');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-white tracking-wide mb-2">
          UPLOAD CLIP
        </h1>
        <p className="text-gray-400">Share your racing content with the community</p>
      </div>

      {/* Progress steps */}
      <div className="glass rounded-xl p-4 mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = currentStep === step.key;
            const isPast = steps.findIndex(s => s.key === currentStep) > index;
            
            return (
              <button
                key={step.key}
                onClick={() => goToStep(step.key)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                  isActive 
                    ? 'bg-neon-purple text-white' 
                    : isPast 
                    ? 'bg-neon-green/20 text-neon-green' 
                    : 'text-gray-500 hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-semibold hidden sm:inline">{step.label}</span>
                {isPast && <Check className="w-4 h-4" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Form content */}
      <div className="glass rounded-xl p-6 mb-6">
        {/* Step 1: Video Info */}
        {currentStep === 'video' && (
          <div className="space-y-6 animate-fade-in">
            <h2 className="text-xl font-display font-semibold text-white flex items-center gap-2">
              <Video className="w-5 h-5 text-neon-purple" />
              Video Information
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => updateForm('title', e.target.value)}
                  placeholder="e.g., R35 GTR 800HP Highway Pull"
                  className="input-racing"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => updateForm('description', e.target.value)}
                  placeholder="Describe your clip..."
                  rows={3}
                  className="input-racing"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  <div className="flex items-center gap-2">
                    <LinkIcon className="w-4 h-4" />
                    Video URL *
                  </div>
                </label>
                <input
                  type="url"
                  value={formData.video_url}
                  onChange={(e) => updateForm('video_url', e.target.value)}
                  placeholder="https://youtube.com/embed/... or direct video URL"
                  className="input-racing"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Paste a YouTube embed URL or direct video link
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="w-4 h-4" />
                    Thumbnail URL
                  </div>
                </label>
                <input
                  type="url"
                  value={formData.thumbnail_url}
                  onChange={(e) => updateForm('thumbnail_url', e.target.value)}
                  placeholder="https://example.com/thumbnail.jpg"
                  className="input-racing"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Collection *
                </label>
                {collections.length > 0 ? (
                  <select
                    value={formData.collection_id}
                    onChange={(e) => updateForm('collection_id', e.target.value)}
                    className="input-racing"
                  >
                    <option value="">Select a collection</option>
                    {collections.map((col) => (
                      <option key={col.id} value={col.id}>
                        {col.channelName} → {col.title}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="p-4 bg-dark-400 rounded-lg text-center">
                    <p className="text-gray-400 mb-2">You need to create a channel first</p>
                    <button className="btn-outline-neon text-sm">
                      Create Channel
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Car Info */}
        {currentStep === 'car' && (
          <div className="space-y-6 animate-fade-in">
            <h2 className="text-xl font-display font-semibold text-white flex items-center gap-2">
              <Car className="w-5 h-5 text-neon-cyan" />
              Car Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Make *</label>
                <input
                  type="text"
                  value={formData.make}
                  onChange={(e) => updateForm('make', e.target.value)}
                  placeholder="e.g., Nissan"
                  className="input-racing"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Model *</label>
                <input
                  type="text"
                  value={formData.model}
                  onChange={(e) => updateForm('model', e.target.value)}
                  placeholder="e.g., GT-R"
                  className="input-racing"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Year *</label>
                <input
                  type="number"
                  value={formData.year}
                  onChange={(e) => updateForm('year', e.target.value)}
                  placeholder="e.g., 2017"
                  className="input-racing"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">Car Type</label>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                {carTypes.map((type) => (
                  <button
                    key={type.value}
                    onClick={() => updateForm('car_type', type.value)}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      formData.car_type === type.value
                        ? 'border-neon-purple bg-neon-purple/20'
                        : 'border-racing-700 hover:border-racing-600'
                    }`}
                  >
                    <span className={`font-semibold ${type.color}`}>{type.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Horsepower</label>
                <input
                  type="number"
                  value={formData.horsepower}
                  onChange={(e) => updateForm('horsepower', e.target.value)}
                  placeholder="e.g., 800"
                  className="input-racing"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Torque (lb-ft)</label>
                <input
                  type="number"
                  value={formData.torque}
                  onChange={(e) => updateForm('torque', e.target.value)}
                  placeholder="e.g., 720"
                  className="input-racing"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">Engine</label>
              <input
                type="text"
                value={formData.engine}
                onChange={(e) => updateForm('engine', e.target.value)}
                placeholder="e.g., VR38DETT 3.8L Twin Turbo V6"
                className="input-racing"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Transmission</label>
                <select
                  value={formData.transmission}
                  onChange={(e) => updateForm('transmission', e.target.value)}
                  className="input-racing"
                >
                  <option value="">Select transmission</option>
                  {transmissionTypes.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Drivetrain</label>
                <select
                  value={formData.drivetrain}
                  onChange={(e) => updateForm('drivetrain', e.target.value)}
                  className="input-racing"
                >
                  <option value="">Select drivetrain</option>
                  {drivetrainTypes.map((d) => (
                    <option key={d.value} value={d.value}>{d.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">Modifications</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={newMod}
                  onChange={(e) => setNewMod(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addMod())}
                  placeholder="Add a mod (e.g., Big Turbo)"
                  className="input-racing flex-1"
                />
                <button onClick={addMod} className="btn-outline-neon px-4">
                  <Plus className="w-5 h-5" />
                </button>
              </div>
              {formData.mods.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.mods.map((mod) => (
                    <span 
                      key={mod}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-dark-400 text-gray-300 rounded-full text-sm"
                    >
                      {mod}
                      <button onClick={() => removeMod(mod)} className="hover:text-neon-red">
                        <X className="w-4 h-4" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 3: Performance Stats */}
        {currentStep === 'performance' && (
          <div className="space-y-6 animate-fade-in">
            <h2 className="text-xl font-display font-semibold text-white flex items-center gap-2">
              <Timer className="w-5 h-5 text-neon-green" />
              Performance Stats
            </h2>

            <p className="text-gray-400 text-sm">
              Add your acceleration times and speed data. All fields are optional.
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">0-60 MPH (s)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.zero_to_60_mph}
                  onChange={(e) => updateForm('zero_to_60_mph', e.target.value)}
                  placeholder="e.g., 2.7"
                  className="input-racing"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">0-100 MPH (s)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.zero_to_100_mph}
                  onChange={(e) => updateForm('zero_to_100_mph', e.target.value)}
                  placeholder="e.g., 5.9"
                  className="input-racing"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">0-100 KM/H (s)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.zero_to_100_kmh}
                  onChange={(e) => updateForm('zero_to_100_kmh', e.target.value)}
                  placeholder="e.g., 2.5"
                  className="input-racing"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">100-200 KM/H (s)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.hundred_to_200_kmh}
                  onChange={(e) => updateForm('hundred_to_200_kmh', e.target.value)}
                  placeholder="e.g., 5.2"
                  className="input-racing"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">1/4 Mile Time (s)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.quarter_mile_time}
                  onChange={(e) => updateForm('quarter_mile_time', e.target.value)}
                  placeholder="e.g., 9.8"
                  className="input-racing"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">1/4 Mile Speed (MPH)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.quarter_mile_speed}
                  onChange={(e) => updateForm('quarter_mile_speed', e.target.value)}
                  placeholder="e.g., 145"
                  className="input-racing"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Top Speed (MPH)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.top_speed}
                  onChange={(e) => updateForm('top_speed', e.target.value)}
                  placeholder="e.g., 198"
                  className="input-racing"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Location</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => updateForm('location', e.target.value)}
                  placeholder="e.g., Texas Highway"
                  className="input-racing"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Weather Conditions</label>
                <input
                  type="text"
                  value={formData.weather_conditions}
                  onChange={(e) => updateForm('weather_conditions', e.target.value)}
                  placeholder="e.g., Clear, 75°F"
                  className="input-racing"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Review */}
        {currentStep === 'review' && (
          <div className="space-y-6 animate-fade-in">
            <h2 className="text-xl font-display font-semibold text-white flex items-center gap-2">
              <Check className="w-5 h-5 text-neon-green" />
              Review Your Clip
            </h2>

            {error && (
              <div className="p-4 bg-neon-red/10 border border-neon-red/30 rounded-lg text-neon-red">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Preview */}
              <div className="space-y-4">
                <h3 className="font-semibold text-white">Preview</h3>
                <div className="aspect-video bg-dark-400 rounded-lg overflow-hidden">
                  {formData.thumbnail_url ? (
                    <img src={formData.thumbnail_url} alt="Thumbnail" className="w-full h-full object-cover" />
                  ) : formData.video_url ? (
                    <iframe src={formData.video_url} className="w-full h-full" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Video className="w-12 h-12 text-gray-600" />
                    </div>
                  )}
                </div>
                <h4 className="font-display font-bold text-white text-lg">{formData.title || 'Untitled'}</h4>
                <p className="text-gray-400 text-sm">{formData.description || 'No description'}</p>
              </div>

              {/* Summary */}
              <div className="space-y-4">
                <h3 className="font-semibold text-white">Summary</h3>
                
                {formData.make && (
                  <div className="p-4 bg-dark-400 rounded-lg">
                    <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Vehicle</div>
                    <div className="text-white font-semibold">
                      {formData.year} {formData.make} {formData.model}
                    </div>
                    {formData.horsepower && (
                      <div className="text-neon-purple">{formData.horsepower} HP</div>
                    )}
                  </div>
                )}

                {(formData.zero_to_60_mph || formData.quarter_mile_time) && (
                  <div className="p-4 bg-dark-400 rounded-lg">
                    <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">Performance</div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      {formData.zero_to_60_mph && (
                        <div>
                          <span className="text-gray-400">0-60:</span>{' '}
                          <span className="text-neon-green font-semibold">{formData.zero_to_60_mph}s</span>
                        </div>
                      )}
                      {formData.quarter_mile_time && (
                        <div>
                          <span className="text-gray-400">1/4 mi:</span>{' '}
                          <span className="text-neon-cyan font-semibold">{formData.quarter_mile_time}s</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {formData.mods.length > 0 && (
                  <div className="p-4 bg-dark-400 rounded-lg">
                    <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">Mods ({formData.mods.length})</div>
                    <div className="flex flex-wrap gap-1">
                      {formData.mods.slice(0, 5).map((mod) => (
                        <span key={mod} className="px-2 py-1 bg-dark-300 text-gray-400 rounded text-xs">
                          {mod}
                        </span>
                      ))}
                      {formData.mods.length > 5 && (
                        <span className="text-gray-500 text-xs">+{formData.mods.length - 5} more</span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation buttons */}
      <div className="flex items-center justify-between">
        <button
          onClick={prevStep}
          disabled={currentStep === 'video'}
          className="btn-outline-neon flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-5 h-5" />
          Back
        </button>

        {currentStep === 'review' ? (
          <button
            onClick={handleSubmit}
            disabled={loading || !formData.title || !formData.collection_id}
            className="btn-neon flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Posting...
              </>
            ) : (
              <>
                <Zap className="w-5 h-5" />
                Post Clip
              </>
            )}
          </button>
        ) : (
          <button
            onClick={nextStep}
            className="btn-neon flex items-center gap-2"
          >
            Next
            <ChevronRight className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
}
