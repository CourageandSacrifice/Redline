'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { 
  Video,
  FileText,
  Car,
  Timer,
  ChevronRight,
  ChevronLeft,
  Check,
  X,
  Plus,
  Trash2,
  Upload,
  Image as ImageIcon,
  Loader2,
  Zap,
  Film,
  Type
} from 'lucide-react';

type PostType = 'video' | 'text';
type Step = 'type' | 'content' | 'car' | 'performance' | 'review';

interface FormData {
  post_type: PostType;
  title: string;
  content: string;
  description: string;
  video_url: string;
  video_file: File | null;
  thumbnail_url: string;
  thumbnail_file: File | null;
  collection_id: string;
  make: string;
  model: string;
  year: string;
  car_type: string;
  horsepower: string;
  torque: string;
  engine: string;
  transmission: string;
  drivetrain: string;
  mods: string[];
  zero_to_60_mph: string;
  zero_to_100_mph: string;
  quarter_mile_time: string;
  quarter_mile_speed: string;
  top_speed: string;
  location: string;
}

const initialFormData: FormData = {
  post_type: 'video',
  title: '',
  content: '',
  description: '',
  video_url: '',
  video_file: null,
  thumbnail_url: '',
  thumbnail_file: null,
  collection_id: '',
  make: '',
  model: '',
  year: '',
  car_type: 'other',
  horsepower: '',
  torque: '',
  engine: '',
  transmission: '',
  drivetrain: '',
  mods: [],
  zero_to_60_mph: '',
  zero_to_100_mph: '',
  quarter_mile_time: '',
  quarter_mile_speed: '',
  top_speed: '',
  location: '',
};

const carTypes = [
  { value: 'jdm', label: 'JDM', color: 'text-red-400' },
  { value: 'euro', label: 'Euro', color: 'text-blue-400' },
  { value: 'muscle', label: 'Muscle', color: 'text-orange-400' },
  { value: 'exotic', label: 'Exotic', color: 'text-purple-400' },
  { value: 'truck', label: 'Truck', color: 'text-green-400' },
  { value: 'other', label: 'Other', color: 'text-gray-400' },
];

export default function UploadPage() {
  const [currentStep, setCurrentStep] = useState<Step>('type');
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [collections, setCollections] = useState<any[]>([]);
  const [channels, setChannels] = useState<any[]>([]);
  const [newMod, setNewMod] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  
  const videoInputRef = useRef<HTMLInputElement>(null);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function fetchData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: channelsData } = await supabase
        .from('channels')
        .select(`id, name, collections (id, title)`)
        .eq('creator_id', user.id);

      if (channelsData) {
        setChannels(channelsData);
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

  const handleVideoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      updateForm('video_file', file);
      updateForm('video_url', '');
      const url = URL.createObjectURL(file);
      setVideoPreview(url);
    }
  };

  const handleThumbnailFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      updateForm('thumbnail_file', file);
      updateForm('thumbnail_url', '');
      const url = URL.createObjectURL(file);
      setThumbnailPreview(url);
    }
  };

  const clearVideoFile = () => {
    updateForm('video_file', null);
    setVideoPreview(null);
    if (videoInputRef.current) videoInputRef.current.value = '';
  };

  const clearThumbnailFile = () => {
    updateForm('thumbnail_file', null);
    setThumbnailPreview(null);
    if (thumbnailInputRef.current) thumbnailInputRef.current.value = '';
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

  const getSteps = (): Step[] => {
    if (formData.post_type === 'text') {
      return ['type', 'content', 'review'];
    }
    return ['type', 'content', 'car', 'performance', 'review'];
  };

  const nextStep = () => {
    const steps = getSteps();
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1]);
    }
  };

  const prevStep = () => {
    const steps = getSteps();
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1]);
    }
  };

  const uploadFile = async (file: File, bucket: string, path: string) => {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file);
    
    if (error) throw error;
    
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(path);
    
    return urlData.publicUrl;
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      let videoUrl = formData.video_url;
      let thumbnailUrl = formData.thumbnail_url;

      // Upload video file if provided
      if (formData.video_file) {
        setUploading(true);
        const fileName = `${user.id}/${Date.now()}-${formData.video_file.name}`;
        videoUrl = await uploadFile(formData.video_file, 'videos', fileName);
      }

      // Upload thumbnail file if provided
      if (formData.thumbnail_file) {
        const fileName = `${user.id}/${Date.now()}-${formData.thumbnail_file.name}`;
        thumbnailUrl = await uploadFile(formData.thumbnail_file, 'thumbnails', fileName);
      }

      setUploading(false);

      // Get highest order_index
      const { data: existingClips } = await supabase
        .from('clips')
        .select('order_index')
        .eq('collection_id', formData.collection_id)
        .order('order_index', { ascending: false })
        .limit(1);

      const nextOrderIndex = (existingClips?.[0]?.order_index || 0) + 1;

      // Create clip/post
      const { data: clip, error: clipError } = await supabase
        .from('clips')
        .insert({
          collection_id: formData.collection_id,
          title: formData.title,
          description: formData.description,
          content: formData.content,
          post_type: formData.post_type,
          video_url: videoUrl,
          thumbnail_url: thumbnailUrl,
          order_index: nextOrderIndex,
          is_published: true,
        })
        .select()
        .single();

      if (clipError) throw clipError;

      // Create car info if provided (video posts only)
      if (formData.post_type === 'video' && formData.make && formData.model && formData.year) {
        await supabase.from('car_info').insert({
          clip_id: clip.id,
          make: formData.make,
          model: formData.model,
          year: parseInt(formData.year),
          car_type: formData.car_type,
          horsepower: formData.horsepower ? parseInt(formData.horsepower) : null,
          torque: formData.torque ? parseInt(formData.torque) : null,
          engine: formData.engine || null,
          transmission: formData.transmission || null,
          drivetrain: formData.drivetrain || null,
          mods: formData.mods.length > 0 ? formData.mods : null,
        });
      }

      // Create performance stats if provided
      if (formData.post_type === 'video' && (formData.zero_to_60_mph || formData.quarter_mile_time || formData.top_speed)) {
        await supabase.from('performance_stats').insert({
          clip_id: clip.id,
          zero_to_60_mph: formData.zero_to_60_mph ? parseFloat(formData.zero_to_60_mph) : null,
          zero_to_100_mph: formData.zero_to_100_mph ? parseFloat(formData.zero_to_100_mph) : null,
          quarter_mile_time: formData.quarter_mile_time ? parseFloat(formData.quarter_mile_time) : null,
          quarter_mile_speed: formData.quarter_mile_speed ? parseFloat(formData.quarter_mile_speed) : null,
          top_speed: formData.top_speed ? parseFloat(formData.top_speed) : null,
          location: formData.location || null,
        });
      }

      router.push('/dashboard/feed');
    } catch (err: any) {
      setError(err.message || 'Failed to create post');
    } finally {
      setLoading(false);
      setUploading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-x-white tracking-wide mb-2">
          CREATE POST
        </h1>
        <p className="text-x-gray">Share with the community</p>
      </div>

      {/* Progress */}
      <div className="glass rounded-xl p-4 mb-6">
        <div className="flex items-center justify-between">
          {getSteps().map((step, index) => {
            const steps = getSteps();
            const isActive = currentStep === step;
            const isPast = steps.indexOf(currentStep) > index;
            const labels: Record<Step, string> = {
              type: 'Type',
              content: 'Content',
              car: 'Car',
              performance: 'Stats',
              review: 'Post'
            };
            
            return (
              <div key={step} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  isActive ? 'bg-accent text-white' : isPast ? 'bg-green-500 text-white' : 'bg-dark-100 text-x-gray'
                }`}>
                  {isPast ? <Check className="w-4 h-4" /> : index + 1}
                </div>
                <span className={`ml-2 text-sm font-semibold ${isActive ? 'text-x-white' : 'text-x-gray'}`}>
                  {labels[step]}
                </span>
                {index < steps.length - 1 && (
                  <ChevronRight className="w-5 h-5 text-x-gray mx-4" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Form */}
      <div className="glass rounded-xl p-6 mb-6">
        {/* Step 1: Post Type */}
        {currentStep === 'type' && (
          <div className="space-y-6 animate-fade-in">
            <h2 className="text-xl font-display font-semibold text-x-white">
              What do you want to post?
            </h2>
            
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => updateForm('post_type', 'video')}
                className={`p-6 rounded-xl border-2 transition-all text-left ${
                  formData.post_type === 'video' 
                    ? 'border-accent bg-accent/10' 
                    : 'border-x-border hover:border-x-gray'
                }`}
              >
                <Film className={`w-10 h-10 mb-3 ${formData.post_type === 'video' ? 'text-accent' : 'text-x-gray'}`} />
                <div className="font-display font-bold text-x-white text-lg">Video Post</div>
                <p className="text-sm text-x-gray mt-1">Share a clip with car specs and performance data</p>
              </button>
              
              <button
                onClick={() => updateForm('post_type', 'text')}
                className={`p-6 rounded-xl border-2 transition-all text-left ${
                  formData.post_type === 'text' 
                    ? 'border-accent bg-accent/10' 
                    : 'border-x-border hover:border-x-gray'
                }`}
              >
                <Type className={`w-10 h-10 mb-3 ${formData.post_type === 'text' ? 'text-accent' : 'text-x-gray'}`} />
                <div className="font-display font-bold text-x-white text-lg">Text Post</div>
                <p className="text-sm text-x-gray mt-1">Share thoughts, questions, or updates</p>
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Content */}
        {currentStep === 'content' && (
          <div className="space-y-6 animate-fade-in">
            <h2 className="text-xl font-display font-semibold text-x-white flex items-center gap-2">
              {formData.post_type === 'video' ? <Video className="w-5 h-5 text-accent" /> : <FileText className="w-5 h-5 text-accent" />}
              {formData.post_type === 'video' ? 'Video Details' : 'Text Post'}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-x-lightgray mb-2">Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => updateForm('title', e.target.value)}
                  placeholder={formData.post_type === 'video' ? 'e.g., R35 GTR 800HP Highway Pull' : 'e.g., Just picked up my new build!'}
                  className="input-racing"
                />
              </div>

              {formData.post_type === 'text' ? (
                <div>
                  <label className="block text-sm font-semibold text-x-lightgray mb-2">Content *</label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => updateForm('content', e.target.value)}
                    placeholder="What's on your mind?"
                    rows={6}
                    className="input-racing"
                  />
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-semibold text-x-lightgray mb-2">Description</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => updateForm('description', e.target.value)}
                      placeholder="Describe your clip..."
                      rows={3}
                      className="input-racing"
                    />
                  </div>

                  {/* Video Upload */}
                  <div>
                    <label className="block text-sm font-semibold text-x-lightgray mb-2">Video</label>
                    
                    {videoPreview ? (
                      <div className="relative rounded-xl overflow-hidden bg-dark-400">
                        <video src={videoPreview} controls className="w-full max-h-64" />
                        <button
                          onClick={clearVideoFile}
                          className="absolute top-2 right-2 p-2 bg-black/70 rounded-full hover:bg-black"
                        >
                          <X className="w-4 h-4 text-white" />
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <button
                          onClick={() => videoInputRef.current?.click()}
                          className="w-full p-8 border-2 border-dashed border-x-border rounded-xl hover:border-accent transition-colors text-center"
                        >
                          <Upload className="w-10 h-10 text-x-gray mx-auto mb-2" />
                          <div className="text-x-white font-semibold">Upload from device</div>
                          <p className="text-sm text-x-gray">MP4, MOV, or WebM</p>
                        </button>
                        <input
                          ref={videoInputRef}
                          type="file"
                          accept="video/*"
                          onChange={handleVideoFileChange}
                          className="hidden"
                        />
                        
                        <div className="text-center text-x-gray text-sm">or</div>
                        
                        <input
                          type="url"
                          value={formData.video_url}
                          onChange={(e) => updateForm('video_url', e.target.value)}
                          placeholder="Paste video URL (YouTube, Vimeo, etc.)"
                          className="input-racing"
                        />
                      </div>
                    )}
                  </div>

                  {/* Thumbnail Upload */}
                  <div>
                    <label className="block text-sm font-semibold text-x-lightgray mb-2">Thumbnail (optional)</label>
                    
                    {thumbnailPreview ? (
                      <div className="relative rounded-xl overflow-hidden bg-dark-400 w-48">
                        <img src={thumbnailPreview} alt="Thumbnail" className="w-full aspect-video object-cover" />
                        <button
                          onClick={clearThumbnailFile}
                          className="absolute top-2 right-2 p-1 bg-black/70 rounded-full hover:bg-black"
                        >
                          <X className="w-3 h-3 text-white" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex gap-3">
                        <button
                          onClick={() => thumbnailInputRef.current?.click()}
                          className="px-4 py-3 border border-x-border rounded-xl hover:border-accent transition-colors flex items-center gap-2"
                        >
                          <ImageIcon className="w-5 h-5 text-x-gray" />
                          <span className="text-x-white">Upload image</span>
                        </button>
                        <input
                          ref={thumbnailInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleThumbnailFileChange}
                          className="hidden"
                        />
                        <input
                          type="url"
                          value={formData.thumbnail_url}
                          onChange={(e) => updateForm('thumbnail_url', e.target.value)}
                          placeholder="Or paste image URL"
                          className="input-racing flex-1"
                        />
                      </div>
                    )}
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm font-semibold text-x-lightgray mb-2">Collection *</label>
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
                  <div className="p-4 bg-dark-400 rounded-xl text-center">
                    <p className="text-x-gray mb-2">You need to create a channel first</p>
                    <a href="/dashboard/my-channel" className="text-accent hover:underline">
                      Create Channel →
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Car Info (Video only) */}
        {currentStep === 'car' && (
          <div className="space-y-6 animate-fade-in">
            <h2 className="text-xl font-display font-semibold text-x-white flex items-center gap-2">
              <Car className="w-5 h-5 text-accent" />
              Car Information
            </h2>
            <p className="text-x-gray text-sm">Optional - add details about the car</p>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-x-lightgray mb-2">Make</label>
                <input type="text" value={formData.make} onChange={(e) => updateForm('make', e.target.value)} placeholder="Nissan" className="input-racing" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-x-lightgray mb-2">Model</label>
                <input type="text" value={formData.model} onChange={(e) => updateForm('model', e.target.value)} placeholder="GT-R" className="input-racing" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-x-lightgray mb-2">Year</label>
                <input type="number" value={formData.year} onChange={(e) => updateForm('year', e.target.value)} placeholder="2017" className="input-racing" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-x-lightgray mb-2">Type</label>
              <div className="grid grid-cols-6 gap-2">
                {carTypes.map((type) => (
                  <button
                    key={type.value}
                    onClick={() => updateForm('car_type', type.value)}
                    className={`p-3 rounded-lg border transition-all ${
                      formData.car_type === type.value ? 'border-accent bg-accent/10' : 'border-x-border hover:border-x-gray'
                    }`}
                  >
                    <span className={`font-semibold ${type.color}`}>{type.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-x-lightgray mb-2">Horsepower</label>
                <input type="number" value={formData.horsepower} onChange={(e) => updateForm('horsepower', e.target.value)} placeholder="800" className="input-racing" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-x-lightgray mb-2">Torque (lb-ft)</label>
                <input type="number" value={formData.torque} onChange={(e) => updateForm('torque', e.target.value)} placeholder="720" className="input-racing" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-x-lightgray mb-2">Engine</label>
              <input type="text" value={formData.engine} onChange={(e) => updateForm('engine', e.target.value)} placeholder="VR38DETT 3.8L Twin Turbo V6" className="input-racing" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-x-lightgray mb-2">Mods</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={newMod}
                  onChange={(e) => setNewMod(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addMod())}
                  placeholder="Add a mod"
                  className="input-racing flex-1"
                />
                <button onClick={addMod} className="btn-outline px-4">
                  <Plus className="w-5 h-5" />
                </button>
              </div>
              {formData.mods.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.mods.map((mod) => (
                    <span key={mod} className="inline-flex items-center gap-1 px-3 py-1 bg-dark-100 rounded-full text-sm text-x-lightgray">
                      {mod}
                      <button onClick={() => removeMod(mod)} className="hover:text-accent"><X className="w-4 h-4" /></button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 4: Performance (Video only) */}
        {currentStep === 'performance' && (
          <div className="space-y-6 animate-fade-in">
            <h2 className="text-xl font-display font-semibold text-x-white flex items-center gap-2">
              <Timer className="w-5 h-5 text-accent" />
              Performance Stats
            </h2>
            <p className="text-x-gray text-sm">Optional - add your times</p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-semibold text-x-lightgray mb-2">0-60 MPH (s)</label>
                <input type="number" step="0.01" value={formData.zero_to_60_mph} onChange={(e) => updateForm('zero_to_60_mph', e.target.value)} placeholder="2.7" className="input-racing" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-x-lightgray mb-2">0-100 MPH (s)</label>
                <input type="number" step="0.01" value={formData.zero_to_100_mph} onChange={(e) => updateForm('zero_to_100_mph', e.target.value)} placeholder="5.9" className="input-racing" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-x-lightgray mb-2">1/4 Mile (s)</label>
                <input type="number" step="0.01" value={formData.quarter_mile_time} onChange={(e) => updateForm('quarter_mile_time', e.target.value)} placeholder="9.8" className="input-racing" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-x-lightgray mb-2">Top Speed (mph)</label>
                <input type="number" step="0.1" value={formData.top_speed} onChange={(e) => updateForm('top_speed', e.target.value)} placeholder="198" className="input-racing" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-x-lightgray mb-2">Location</label>
              <input type="text" value={formData.location} onChange={(e) => updateForm('location', e.target.value)} placeholder="Texas Highway" className="input-racing" />
            </div>
          </div>
        )}

        {/* Step 5: Review */}
        {currentStep === 'review' && (
          <div className="space-y-6 animate-fade-in">
            <h2 className="text-xl font-display font-semibold text-x-white flex items-center gap-2">
              <Check className="w-5 h-5 text-green-500" />
              Review Your Post
            </h2>

            {error && (
              <div className="p-4 bg-accent/10 border border-accent/30 rounded-xl text-accent text-sm">
                {error}
              </div>
            )}

            <div className="bg-dark-100 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                {formData.post_type === 'video' ? <Film className="w-5 h-5 text-accent" /> : <FileText className="w-5 h-5 text-accent" />}
                <span className="text-x-gray text-sm uppercase">{formData.post_type} Post</span>
              </div>
              <h3 className="text-lg font-bold text-x-white">{formData.title || 'Untitled'}</h3>
              {formData.post_type === 'text' ? (
                <p className="text-x-gray mt-2 whitespace-pre-wrap">{formData.content || 'No content'}</p>
              ) : (
                <>
                  <p className="text-x-gray mt-1">{formData.description || 'No description'}</p>
                  {formData.make && (
                    <p className="text-accent mt-2">
                      {formData.year} {formData.make} {formData.model} {formData.horsepower && `• ${formData.horsepower}hp`}
                    </p>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={prevStep}
          disabled={currentStep === 'type'}
          className="btn-outline flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-5 h-5" />
          Back
        </button>

        {currentStep === 'review' ? (
          <button
            onClick={handleSubmit}
            disabled={loading || !formData.title || !formData.collection_id}
            className="btn-accent flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                {uploading ? 'Uploading...' : 'Posting...'}
              </>
            ) : (
              <>
                <Zap className="w-5 h-5" />
                Post
              </>
            )}
          </button>
        ) : (
          <button onClick={nextStep} className="btn-accent flex items-center gap-2">
            Next
            <ChevronRight className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
}
