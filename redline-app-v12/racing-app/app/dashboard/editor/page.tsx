'use client';

import { useState, useRef, useEffect } from 'react';
import { 
  Scissors, 
  Type, 
  Gauge, 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward,
  Volume2,
  VolumeX,
  Download,
  RotateCcw,
  Plus,
  Trash2,
  Move,
  ChevronLeft,
  Save,
  Eye,
  Layers
} from 'lucide-react';
import Link from 'next/link';

interface TextOverlay {
  id: string;
  text: string;
  x: number;
  y: number;
  fontSize: number;
  color: string;
  startTime: number;
  endTime: number;
  fontFamily: string;
}

interface TrimRange {
  start: number;
  end: number;
}

export default function EditorPage() {
  const [videoUrl, setVideoUrl] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [trimRange, setTrimRange] = useState<TrimRange>({ start: 0, end: 100 });
  const [textOverlays, setTextOverlays] = useState<TextOverlay[]>([]);
  const [selectedOverlay, setSelectedOverlay] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'trim' | 'text' | 'speed'>('trim');
  const [showPreview, setShowPreview] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);

  // New text overlay defaults
  const [newOverlayText, setNewOverlayText] = useState('');
  const [newOverlayColor, setNewOverlayColor] = useState('#ffffff');
  const [newOverlaySize, setNewOverlaySize] = useState(24);

  const speedOptions = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 2];
  const fontOptions = ['Orbitron', 'Rajdhani', 'Arial', 'Impact'];
  const colorOptions = ['#ffffff', '#00f0ff', '#bf00ff', '#00ff88', '#ff0044', '#ffd93d'];

  // Handle video time update
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
    };

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
      setTrimRange({ start: 0, end: video.duration });
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
    };
  }, [videoUrl]);

  // Play/Pause
  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
    setIsPlaying(!isPlaying);
  };

  // Seek
  const seek = (time: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = Math.max(0, Math.min(time, duration));
  };

  // Skip forward/back
  const skip = (seconds: number) => {
    seek(currentTime + seconds);
  };

  // Set playback speed
  const setSpeed = (speed: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.playbackRate = speed;
    setPlaybackSpeed(speed);
  };

  // Toggle mute
  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  // Format time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 100);
    return `${mins}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
  };

  // Add text overlay
  const addTextOverlay = () => {
    if (!newOverlayText.trim()) return;

    const newOverlay: TextOverlay = {
      id: Date.now().toString(),
      text: newOverlayText,
      x: 50,
      y: 50,
      fontSize: newOverlaySize,
      color: newOverlayColor,
      startTime: currentTime,
      endTime: Math.min(currentTime + 3, duration),
      fontFamily: 'Orbitron',
    };

    setTextOverlays([...textOverlays, newOverlay]);
    setNewOverlayText('');
    setSelectedOverlay(newOverlay.id);
  };

  // Update overlay
  const updateOverlay = (id: string, updates: Partial<TextOverlay>) => {
    setTextOverlays(overlays =>
      overlays.map(o => (o.id === id ? { ...o, ...updates } : o))
    );
  };

  // Delete overlay
  const deleteOverlay = (id: string) => {
    setTextOverlays(overlays => overlays.filter(o => o.id !== id));
    if (selectedOverlay === id) setSelectedOverlay(null);
  };

  // Get visible overlays at current time
  const visibleOverlays = textOverlays.filter(
    o => currentTime >= o.startTime && currentTime <= o.endTime
  );

  // Timeline click handler
  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    seek(percentage * duration);
  };

  return (
    <div className="min-h-[calc(100vh-64px)] -m-8 bg-dark-600 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-racing-900">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="text-gray-400 hover:text-white transition-colors">
            <ChevronLeft className="w-6 h-6" />
          </Link>
          <h1 className="text-xl font-display font-bold text-white tracking-wide">
            VIDEO EDITOR
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowPreview(!showPreview)}
            className="btn-outline-neon flex items-center gap-2 text-sm"
          >
            <Eye className="w-4 h-4" />
            Preview
          </button>
          <button className="btn-neon flex items-center gap-2 text-sm">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Main editor area */}
        <div className="flex-1 flex flex-col">
          {/* Video preview */}
          <div className="flex-1 flex items-center justify-center bg-black p-4 relative">
            {videoUrl ? (
              <div className="relative max-w-full max-h-full">
                <video
                  ref={videoRef}
                  src={videoUrl}
                  className="max-w-full max-h-[60vh] rounded-lg"
                  onClick={togglePlay}
                />
                
                {/* Text overlays on video */}
                {visibleOverlays.map(overlay => (
                  <div
                    key={overlay.id}
                    className={`absolute cursor-move select-none ${
                      selectedOverlay === overlay.id ? 'ring-2 ring-neon-cyan' : ''
                    }`}
                    style={{
                      left: `${overlay.x}%`,
                      top: `${overlay.y}%`,
                      transform: 'translate(-50%, -50%)',
                      fontSize: `${overlay.fontSize}px`,
                      color: overlay.color,
                      fontFamily: overlay.fontFamily,
                      textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
                    }}
                    onClick={() => setSelectedOverlay(overlay.id)}
                  >
                    {overlay.text}
                  </div>
                ))}

                {/* Play/Pause overlay */}
                {!isPlaying && (
                  <div 
                    className="absolute inset-0 flex items-center justify-center cursor-pointer"
                    onClick={togglePlay}
                  >
                    <div className="p-4 rounded-full bg-black/50">
                      <Play className="w-12 h-12 text-white" />
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center">
                <div className="w-32 h-32 mx-auto mb-4 rounded-xl bg-dark-400 flex items-center justify-center">
                  <Layers className="w-16 h-16 text-gray-600" />
                </div>
                <h3 className="text-xl font-display font-semibold text-white mb-2">
                  No Video Loaded
                </h3>
                <p className="text-gray-400 mb-4">Enter a video URL to start editing</p>
                <input
                  type="url"
                  placeholder="Paste video URL here..."
                  className="input-racing max-w-md"
                  onChange={(e) => setVideoUrl(e.target.value)}
                />
              </div>
            )}
          </div>

          {/* Timeline */}
          {videoUrl && (
            <div className="p-4 bg-dark-500 border-t border-racing-900">
              {/* Playback controls */}
              <div className="flex items-center justify-center gap-4 mb-4">
                <button onClick={() => skip(-5)} className="p-2 text-gray-400 hover:text-white">
                  <SkipBack className="w-5 h-5" />
                </button>
                <button 
                  onClick={togglePlay}
                  className="p-3 rounded-full bg-neon-purple text-white hover:shadow-neon-purple transition-all"
                >
                  {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
                </button>
                <button onClick={() => skip(5)} className="p-2 text-gray-400 hover:text-white">
                  <SkipForward className="w-5 h-5" />
                </button>
                
                <div className="w-px h-6 bg-racing-700 mx-2" />
                
                <button onClick={toggleMute} className="p-2 text-gray-400 hover:text-white">
                  {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </button>
                
                <div className="w-px h-6 bg-racing-700 mx-2" />
                
                <span className="text-sm font-mono text-gray-400">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
              </div>

              {/* Timeline bar */}
              <div 
                ref={timelineRef}
                className="relative h-12 bg-dark-400 rounded-lg cursor-pointer overflow-hidden"
                onClick={handleTimelineClick}
              >
                {/* Trim range */}
                <div
                  className="absolute top-0 bottom-0 bg-neon-purple/20 border-x-2 border-neon-purple"
                  style={{
                    left: `${(trimRange.start / duration) * 100}%`,
                    right: `${100 - (trimRange.end / duration) * 100}%`,
                  }}
                />

                {/* Text overlay markers */}
                {textOverlays.map(overlay => (
                  <div
                    key={overlay.id}
                    className={`absolute top-1 h-3 rounded ${
                      selectedOverlay === overlay.id ? 'bg-neon-cyan' : 'bg-neon-green/50'
                    }`}
                    style={{
                      left: `${(overlay.startTime / duration) * 100}%`,
                      width: `${((overlay.endTime - overlay.startTime) / duration) * 100}%`,
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedOverlay(overlay.id);
                    }}
                  />
                ))}

                {/* Playhead */}
                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-white shadow-lg"
                  style={{ left: `${(currentTime / duration) * 100}%` }}
                >
                  <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-white rounded-full" />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right sidebar - Tools */}
        {videoUrl && (
          <div className="w-80 bg-dark-500 border-l border-racing-900 flex flex-col">
            {/* Tool tabs */}
            <div className="flex border-b border-racing-900">
              <button
                onClick={() => setActiveTab('trim')}
                className={`flex-1 p-3 flex items-center justify-center gap-2 text-sm font-semibold transition-colors ${
                  activeTab === 'trim' 
                    ? 'text-neon-purple border-b-2 border-neon-purple' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Scissors className="w-4 h-4" />
                Trim
              </button>
              <button
                onClick={() => setActiveTab('text')}
                className={`flex-1 p-3 flex items-center justify-center gap-2 text-sm font-semibold transition-colors ${
                  activeTab === 'text' 
                    ? 'text-neon-cyan border-b-2 border-neon-cyan' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Type className="w-4 h-4" />
                Text
              </button>
              <button
                onClick={() => setActiveTab('speed')}
                className={`flex-1 p-3 flex items-center justify-center gap-2 text-sm font-semibold transition-colors ${
                  activeTab === 'speed' 
                    ? 'text-neon-green border-b-2 border-neon-green' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Gauge className="w-4 h-4" />
                Speed
              </button>
            </div>

            {/* Tool content */}
            <div className="flex-1 p-4 overflow-y-auto">
              {/* Trim tool */}
              {activeTab === 'trim' && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-white">Trim Video</h3>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-gray-400 uppercase tracking-wider">Start Time</label>
                      <div className="flex items-center gap-2 mt-1">
                        <input
                          type="range"
                          min={0}
                          max={duration}
                          step={0.01}
                          value={trimRange.start}
                          onChange={(e) => setTrimRange({ ...trimRange, start: parseFloat(e.target.value) })}
                          className="flex-1"
                        />
                        <span className="text-sm font-mono text-neon-purple w-20">
                          {formatTime(trimRange.start)}
                        </span>
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-xs text-gray-400 uppercase tracking-wider">End Time</label>
                      <div className="flex items-center gap-2 mt-1">
                        <input
                          type="range"
                          min={0}
                          max={duration}
                          step={0.01}
                          value={trimRange.end}
                          onChange={(e) => setTrimRange({ ...trimRange, end: parseFloat(e.target.value) })}
                          className="flex-1"
                        />
                        <span className="text-sm font-mono text-neon-purple w-20">
                          {formatTime(trimRange.end)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-dark-400 rounded-lg">
                    <div className="text-xs text-gray-400 mb-1">Selected Duration</div>
                    <div className="text-lg font-display font-bold text-white">
                      {formatTime(trimRange.end - trimRange.start)}
                    </div>
                  </div>

                  <button 
                    onClick={() => seek(trimRange.start)}
                    className="w-full btn-outline-neon text-sm"
                  >
                    Preview Trim
                  </button>
                </div>
              )}

              {/* Text overlay tool */}
              {activeTab === 'text' && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-white">Add Text Overlay</h3>
                  
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={newOverlayText}
                      onChange={(e) => setNewOverlayText(e.target.value)}
                      placeholder="Enter text..."
                      className="input-racing"
                    />
                    
                    <div className="flex gap-2">
                      {colorOptions.map(color => (
                        <button
                          key={color}
                          onClick={() => setNewOverlayColor(color)}
                          className={`w-8 h-8 rounded-full border-2 ${
                            newOverlayColor === color ? 'border-white' : 'border-transparent'
                          }`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>

                    <div>
                      <label className="text-xs text-gray-400 uppercase tracking-wider">Font Size</label>
                      <input
                        type="range"
                        min={12}
                        max={72}
                        value={newOverlaySize}
                        onChange={(e) => setNewOverlaySize(parseInt(e.target.value))}
                        className="w-full mt-1"
                      />
                      <span className="text-sm text-gray-400">{newOverlaySize}px</span>
                    </div>

                    <button
                      onClick={addTextOverlay}
                      disabled={!newOverlayText.trim()}
                      className="w-full btn-neon flex items-center justify-center gap-2 text-sm disabled:opacity-50"
                    >
                      <Plus className="w-4 h-4" />
                      Add Text
                    </button>
                  </div>

                  {/* Existing overlays */}
                  {textOverlays.length > 0 && (
                    <div className="mt-6">
                      <h4 className="text-sm font-semibold text-gray-400 mb-2">Text Layers</h4>
                      <div className="space-y-2">
                        {textOverlays.map(overlay => (
                          <div
                            key={overlay.id}
                            className={`p-3 rounded-lg cursor-pointer transition-colors ${
                              selectedOverlay === overlay.id
                                ? 'bg-neon-cyan/20 border border-neon-cyan'
                                : 'bg-dark-400 hover:bg-dark-300'
                            }`}
                            onClick={() => setSelectedOverlay(overlay.id)}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span 
                                className="font-semibold truncate"
                                style={{ color: overlay.color }}
                              >
                                {overlay.text}
                              </span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteOverlay(overlay.id);
                                }}
                                className="text-gray-500 hover:text-neon-red"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                            <div className="text-xs text-gray-500">
                              {formatTime(overlay.startTime)} - {formatTime(overlay.endTime)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Speed tool */}
              {activeTab === 'speed' && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-white">Playback Speed</h3>
                  
                  <div className="grid grid-cols-4 gap-2">
                    {speedOptions.map(speed => (
                      <button
                        key={speed}
                        onClick={() => setSpeed(speed)}
                        className={`p-2 rounded-lg text-sm font-semibold transition-all ${
                          playbackSpeed === speed
                            ? 'bg-neon-green text-dark-500'
                            : 'bg-dark-400 text-gray-400 hover:text-white'
                        }`}
                      >
                        {speed}x
                      </button>
                    ))}
                  </div>

                  <div className="p-4 bg-dark-400 rounded-lg">
                    <div className="text-xs text-gray-400 uppercase tracking-wider mb-2">Current Speed</div>
                    <div className="text-3xl font-display font-bold neon-text-green">
                      {playbackSpeed}x
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      {playbackSpeed < 1 
                        ? 'Slow motion - great for showing details'
                        : playbackSpeed > 1
                        ? 'Fast forward - skip to the action'
                        : 'Normal playback speed'
                      }
                    </p>
                  </div>

                  <button
                    onClick={() => setSpeed(1)}
                    className="w-full btn-outline-neon flex items-center justify-center gap-2 text-sm"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Reset to 1x
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
