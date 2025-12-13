'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { 
  Gauge, 
  Play, 
  Square, 
  RotateCcw, 
  Save, 
  ChevronLeft,
  Wifi,
  WifiOff,
  Timer,
  Zap,
  AlertTriangle,
  CheckCircle,
  X,
  Navigation
} from 'lucide-react';

interface SpeedDataPoint {
  timestamp: number;
  speed_mph: number;
  speed_kmh: number;
  latitude?: number;
  longitude?: number;
  accuracy?: number;
}

interface CalculatedStats {
  zero_to_60_mph?: number;
  zero_to_100_mph?: number;
  zero_to_100_kmh?: number;
  hundred_to_200_kmh?: number;
  max_speed_mph: number;
  max_speed_kmh: number;
}

export default function SpeedometerPage() {
  const [isTracking, setIsTracking] = useState(false);
  const [currentSpeed, setCurrentSpeed] = useState(0);
  const [maxSpeed, setMaxSpeed] = useState(0);
  const [dataPoints, setDataPoints] = useState<SpeedDataPoint[]>([]);
  const [calculatedStats, setCalculatedStats] = useState<CalculatedStats | null>(null);
  const [gpsStatus, setGpsStatus] = useState<'waiting' | 'active' | 'error'>('waiting');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [unit, setUnit] = useState<'mph' | 'kmh'>('mph');
  const [showResults, setShowResults] = useState(false);
  const [gpsAccuracy, setGpsAccuracy] = useState<number | null>(null);
  
  const watchIdRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const dataPointsRef = useRef<SpeedDataPoint[]>([]);

  // Convert m/s to mph and kmh
  const msToMph = (ms: number) => ms * 2.237;
  const msToKmh = (ms: number) => ms * 3.6;

  // Get display speed based on unit
  const getDisplaySpeed = (speedMph: number) => {
    return unit === 'mph' ? speedMph : speedMph * 1.60934;
  };

  // Calculate rotation for speedometer needle
  const getNeedleRotation = () => {
    const maxScale = unit === 'mph' ? 180 : 280;
    const displaySpeed = getDisplaySpeed(currentSpeed);
    const rotation = Math.min((displaySpeed / maxScale) * 270, 270);
    return rotation - 135;
  };

  // Start tracking
  const startTracking = useCallback(() => {
    if (!navigator.geolocation) {
      setGpsStatus('error');
      setErrorMessage('Geolocation is not supported by your browser');
      return;
    }

    setIsTracking(true);
    setGpsStatus('waiting');
    setDataPoints([]);
    dataPointsRef.current = [];
    setMaxSpeed(0);
    setCalculatedStats(null);
    setShowResults(false);
    startTimeRef.current = Date.now();

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        setGpsStatus('active');
        setGpsAccuracy(position.coords.accuracy);
        
        const speedMs = position.coords.speed || 0;
        const speedMph = Math.max(0, msToMph(speedMs));
        const speedKmh = Math.max(0, msToKmh(speedMs));
        
        setCurrentSpeed(speedMph);
        setMaxSpeed(prev => Math.max(prev, speedMph));

        const dataPoint: SpeedDataPoint = {
          timestamp: Date.now() - (startTimeRef.current || Date.now()),
          speed_mph: Math.round(speedMph * 10) / 10,
          speed_kmh: Math.round(speedKmh * 10) / 10,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        };

        dataPointsRef.current.push(dataPoint);
        setDataPoints([...dataPointsRef.current]);
      },
      (error) => {
        setGpsStatus('error');
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setErrorMessage('Location permission denied. Please enable GPS access.');
            break;
          case error.POSITION_UNAVAILABLE:
            setErrorMessage('Location unavailable. Please move to an open area.');
            break;
          case error.TIMEOUT:
            setErrorMessage('Location request timed out. Please try again.');
            break;
          default:
            setErrorMessage('An unknown error occurred.');
        }
      },
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 10000,
      }
    );
  }, []);

  // Stop tracking
  const stopTracking = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setIsTracking(false);
    setCurrentSpeed(0);
    
    // Calculate stats
    if (dataPointsRef.current.length > 0) {
      const stats = calculateStats(dataPointsRef.current);
      setCalculatedStats(stats);
      setShowResults(true);
    }
  }, []);

  // Reset
  const resetTracking = () => {
    stopTracking();
    setDataPoints([]);
    dataPointsRef.current = [];
    setMaxSpeed(0);
    setCalculatedStats(null);
    setShowResults(false);
    setGpsStatus('waiting');
  };

  // Calculate performance stats from data points
  const calculateStats = (points: SpeedDataPoint[]): CalculatedStats => {
    let zero_to_60_mph: number | undefined;
    let zero_to_100_mph: number | undefined;
    let zero_to_100_kmh: number | undefined;
    let hundred_to_200_kmh: number | undefined;
    let max_speed_mph = 0;
    let max_speed_kmh = 0;

    let startFrom0Time: number | null = null;
    let reached60 = false;
    let reached100mph = false;
    let reached100kmh = false;

    let startFrom100kmhTime: number | null = null;
    let reached200kmh = false;

    for (const point of points) {
      if (point.speed_mph > max_speed_mph) {
        max_speed_mph = point.speed_mph;
        max_speed_kmh = point.speed_kmh;
      }

      // Start timing from near 0 mph
      if (point.speed_mph < 3 && startFrom0Time === null) {
        startFrom0Time = point.timestamp;
      }

      // 0-60 mph
      if (startFrom0Time !== null && !reached60 && point.speed_mph >= 60) {
        zero_to_60_mph = Math.round(((point.timestamp - startFrom0Time) / 1000) * 100) / 100;
        reached60 = true;
      }

      // 0-100 mph
      if (startFrom0Time !== null && !reached100mph && point.speed_mph >= 100) {
        zero_to_100_mph = Math.round(((point.timestamp - startFrom0Time) / 1000) * 100) / 100;
        reached100mph = true;
      }

      // 0-100 kmh
      if (startFrom0Time !== null && !reached100kmh && point.speed_kmh >= 100) {
        zero_to_100_kmh = Math.round(((point.timestamp - startFrom0Time) / 1000) * 100) / 100;
        reached100kmh = true;
      }

      // 100-200 kmh
      if (point.speed_kmh >= 100 && startFrom100kmhTime === null) {
        startFrom100kmhTime = point.timestamp;
      }
      if (startFrom100kmhTime !== null && !reached200kmh && point.speed_kmh >= 200) {
        hundred_to_200_kmh = Math.round(((point.timestamp - startFrom100kmhTime) / 1000) * 100) / 100;
        reached200kmh = true;
      }
    }

    return {
      zero_to_60_mph,
      zero_to_100_mph,
      zero_to_100_kmh,
      hundred_to_200_kmh,
      max_speed_mph: Math.round(max_speed_mph * 10) / 10,
      max_speed_kmh: Math.round(max_speed_kmh * 10) / 10,
    };
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  // Generate speedometer marks
  const generateMarks = () => {
    const marks = [];
    const maxValue = unit === 'mph' ? 180 : 280;
    const step = unit === 'mph' ? 20 : 40;
    
    for (let i = 0; i <= maxValue; i += step) {
      const angle = (i / maxValue) * 270 - 135;
      const radian = (angle * Math.PI) / 180;
      const x = 50 + 40 * Math.cos(radian);
      const y = 50 + 40 * Math.sin(radian);
      const labelX = 50 + 32 * Math.cos(radian);
      const labelY = 50 + 32 * Math.sin(radian);
      
      marks.push(
        <g key={i}>
          <line
            x1={50 + 44 * Math.cos(radian)}
            y1={50 + 44 * Math.sin(radian)}
            x2={x}
            y2={y}
            stroke={i >= (unit === 'mph' ? 140 : 220) ? '#ff0044' : '#666'}
            strokeWidth="2"
          />
          <text
            x={labelX}
            y={labelY}
            fill="#888"
            fontSize="6"
            textAnchor="middle"
            dominantBaseline="middle"
            fontFamily="Orbitron"
          >
            {i}
          </text>
        </g>
      );
    }
    return marks;
  };

  return (
    <div className="min-h-screen bg-dark-600 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link 
            href="/dashboard" 
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            <span>Back to Dashboard</span>
          </Link>
          
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-neon-purple to-neon-red rounded-xl">
              <Gauge className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-display font-bold text-white tracking-wider">REDLINE</span>
          </div>
        </div>

        {/* GPS Status */}
        <div className="glass rounded-xl p-4 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {gpsStatus === 'active' ? (
              <>
                <div className="p-2 bg-neon-green/20 rounded-lg">
                  <Wifi className="w-5 h-5 text-neon-green" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-neon-green">GPS Active</div>
                  <div className="text-xs text-gray-500">
                    Accuracy: ±{Math.round(gpsAccuracy || 0)}m
                  </div>
                </div>
              </>
            ) : gpsStatus === 'error' ? (
              <>
                <div className="p-2 bg-neon-red/20 rounded-lg">
                  <WifiOff className="w-5 h-5 text-neon-red" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-neon-red">GPS Error</div>
                  <div className="text-xs text-gray-500">{errorMessage}</div>
                </div>
              </>
            ) : (
              <>
                <div className="p-2 bg-yellow-500/20 rounded-lg">
                  <Navigation className="w-5 h-5 text-yellow-400 animate-pulse" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-yellow-400">Waiting for GPS</div>
                  <div className="text-xs text-gray-500">Move to an open area for best results</div>
                </div>
              </>
            )}
          </div>

          {/* Unit toggle */}
          <div className="flex items-center gap-2 bg-dark-400 rounded-lg p-1">
            <button
              onClick={() => setUnit('mph')}
              className={`px-3 py-1 rounded text-sm font-semibold transition-all ${
                unit === 'mph' 
                  ? 'bg-neon-purple text-white' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              MPH
            </button>
            <button
              onClick={() => setUnit('kmh')}
              className={`px-3 py-1 rounded text-sm font-semibold transition-all ${
                unit === 'kmh' 
                  ? 'bg-neon-cyan text-white' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              KM/H
            </button>
          </div>
        </div>

        {/* Speedometer */}
        <div className="glass rounded-2xl p-8 mb-6">
          <div className="relative w-full max-w-md mx-auto aspect-square">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              {/* Background arc */}
              <path
                d="M 10 70 A 40 40 0 1 1 90 70"
                fill="none"
                stroke="#1a1a2e"
                strokeWidth="8"
                strokeLinecap="round"
              />
              
              {/* Colored arc - green to red */}
              <defs>
                <linearGradient id="speedGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#00ff88" />
                  <stop offset="50%" stopColor="#00f0ff" />
                  <stop offset="75%" stopColor="#bf00ff" />
                  <stop offset="100%" stopColor="#ff0044" />
                </linearGradient>
              </defs>
              <path
                d="M 10 70 A 40 40 0 1 1 90 70"
                fill="none"
                stroke="url(#speedGradient)"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray="188"
                strokeDashoffset={188 - (getDisplaySpeed(currentSpeed) / (unit === 'mph' ? 180 : 280)) * 188}
                style={{ transition: 'stroke-dashoffset 0.3s ease-out' }}
              />
              
              {/* Speed marks */}
              {generateMarks()}
              
              {/* Needle */}
              <g style={{ 
                transform: `rotate(${getNeedleRotation()}deg)`,
                transformOrigin: '50px 50px',
                transition: 'transform 0.3s ease-out'
              }}>
                <polygon
                  points="50,15 48,50 52,50"
                  fill="#ff0044"
                  filter="drop-shadow(0 0 4px rgba(255,0,68,0.8))"
                />
                <circle cx="50" cy="50" r="4" fill="#ff0044" />
              </g>
              
              {/* Center display */}
              <circle cx="50" cy="50" r="18" fill="#0a0a1a" stroke="#333" strokeWidth="1" />
            </svg>
            
            {/* Digital speed display */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-6xl font-display font-bold neon-text-cyan mt-8">
                {Math.round(getDisplaySpeed(currentSpeed))}
              </div>
              <div className="text-sm text-gray-500 uppercase tracking-wider">
                {unit.toUpperCase()}
              </div>
            </div>
          </div>

          {/* Max speed indicator */}
          <div className="flex justify-center mt-4">
            <div className="px-4 py-2 bg-dark-400 rounded-lg">
              <span className="text-gray-500 text-sm">MAX: </span>
              <span className="font-display font-bold text-neon-purple">
                {Math.round(getDisplaySpeed(maxSpeed))} {unit.toUpperCase()}
              </span>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex justify-center gap-4 mb-8">
          {!isTracking ? (
            <button
              onClick={startTracking}
              className="btn-neon flex items-center gap-3 px-8 py-4 text-lg"
            >
              <Play className="w-6 h-6" />
              START RUN
            </button>
          ) : (
            <button
              onClick={stopTracking}
              className="flex items-center gap-3 px-8 py-4 text-lg bg-neon-red hover:bg-neon-red/80 text-white rounded-lg font-display font-semibold tracking-wider uppercase transition-all shadow-neon-red"
            >
              <Square className="w-6 h-6" />
              STOP
            </button>
          )}
          
          <button
            onClick={resetTracking}
            className="btn-outline-neon flex items-center gap-2 px-6 py-4"
          >
            <RotateCcw className="w-5 h-5" />
            RESET
          </button>
        </div>

        {/* Results */}
        {showResults && calculatedStats && (
          <div className="glass rounded-2xl p-6 animate-fade-in">
            <div className="flex items-center gap-2 mb-6">
              <Timer className="w-6 h-6 text-neon-green" />
              <h2 className="text-xl font-display font-bold text-white tracking-wide">
                RUN RESULTS
              </h2>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {calculatedStats.zero_to_60_mph && (
                <div className="stat-box">
                  <div className="stat-value neon-text-green">{calculatedStats.zero_to_60_mph}s</div>
                  <div className="stat-label">0-60 MPH</div>
                </div>
              )}
              
              {calculatedStats.zero_to_100_kmh && (
                <div className="stat-box">
                  <div className="stat-value neon-text-cyan">{calculatedStats.zero_to_100_kmh}s</div>
                  <div className="stat-label">0-100 KM/H</div>
                </div>
              )}
              
              {calculatedStats.zero_to_100_mph && (
                <div className="stat-box">
                  <div className="stat-value neon-text-purple">{calculatedStats.zero_to_100_mph}s</div>
                  <div className="stat-label">0-100 MPH</div>
                </div>
              )}
              
              {calculatedStats.hundred_to_200_kmh && (
                <div className="stat-box">
                  <div className="stat-value neon-text-pink">{calculatedStats.hundred_to_200_kmh}s</div>
                  <div className="stat-label">100-200 KM/H</div>
                </div>
              )}

              <div className="stat-box">
                <div className="stat-value neon-text-red">{calculatedStats.max_speed_mph}</div>
                <div className="stat-label">MAX MPH</div>
              </div>

              <div className="stat-box">
                <div className="stat-value text-neon-orange">{calculatedStats.max_speed_kmh}</div>
                <div className="stat-label">MAX KM/H</div>
              </div>
            </div>

            {/* Data points info */}
            <div className="flex items-center justify-between text-sm text-gray-500 pt-4 border-t border-racing-800">
              <span>{dataPoints.length} data points recorded</span>
              <span>Duration: {((dataPoints[dataPoints.length - 1]?.timestamp || 0) / 1000).toFixed(1)}s</span>
            </div>

            {/* Save button */}
            <div className="mt-6 flex justify-center">
              <button className="btn-neon flex items-center gap-2">
                <Save className="w-5 h-5" />
                SAVE TO CLIP
              </button>
            </div>
          </div>
        )}

        {/* Tips */}
        <div className="mt-8 glass rounded-xl p-6">
          <h3 className="font-display font-semibold text-white mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-400" />
            TIPS FOR ACCURATE RESULTS
          </h3>
          <ul className="space-y-2 text-sm text-gray-400">
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-neon-green mt-0.5" />
              Use in an open area away from tall buildings for best GPS accuracy
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-neon-green mt-0.5" />
              Mount your phone securely - movement affects GPS readings
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-neon-green mt-0.5" />
              Start from a complete stop and wait for GPS lock before accelerating
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-neon-green mt-0.5" />
              GPS accuracy is typically ±2-3 MPH - for precise timing, use dedicated equipment
            </li>
            <li className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-yellow-400 mt-0.5" />
              Always drive safely and legally - use closed courses or private property
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
