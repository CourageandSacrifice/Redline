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
  AlertTriangle,
  CheckCircle,
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

  const msToMph = (ms: number) => ms * 2.237;
  const msToKmh = (ms: number) => ms * 3.6;

  const getDisplaySpeed = (speedMph: number) => {
    return unit === 'mph' ? speedMph : speedMph * 1.60934;
  };

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
            setErrorMessage('Location permission denied');
            break;
          case error.POSITION_UNAVAILABLE:
            setErrorMessage('Location unavailable');
            break;
          case error.TIMEOUT:
            setErrorMessage('Location request timed out');
            break;
          default:
            setErrorMessage('An unknown error occurred');
        }
      },
      { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 }
    );
  }, []);

  const stopTracking = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setIsTracking(false);
    setCurrentSpeed(0);
    
    if (dataPointsRef.current.length > 0) {
      const stats = calculateStats(dataPointsRef.current);
      setCalculatedStats(stats);
      setShowResults(true);
    }
  }, []);

  const resetTracking = () => {
    stopTracking();
    setDataPoints([]);
    dataPointsRef.current = [];
    setMaxSpeed(0);
    setCalculatedStats(null);
    setShowResults(false);
    setGpsStatus('waiting');
  };

  const calculateStats = (points: SpeedDataPoint[]): CalculatedStats => {
    let zero_to_60_mph: number | undefined;
    let zero_to_100_mph: number | undefined;
    let zero_to_100_kmh: number | undefined;
    let max_speed_mph = 0;
    let max_speed_kmh = 0;

    let startFrom0Time: number | null = null;
    let reached60 = false;
    let reached100mph = false;
    let reached100kmh = false;

    for (const point of points) {
      if (point.speed_mph > max_speed_mph) {
        max_speed_mph = point.speed_mph;
        max_speed_kmh = point.speed_kmh;
      }

      if (point.speed_mph < 3 && startFrom0Time === null) {
        startFrom0Time = point.timestamp;
      }

      if (startFrom0Time !== null && !reached60 && point.speed_mph >= 60) {
        zero_to_60_mph = Math.round(((point.timestamp - startFrom0Time) / 1000) * 100) / 100;
        reached60 = true;
      }

      if (startFrom0Time !== null && !reached100mph && point.speed_mph >= 100) {
        zero_to_100_mph = Math.round(((point.timestamp - startFrom0Time) / 1000) * 100) / 100;
        reached100mph = true;
      }

      if (startFrom0Time !== null && !reached100kmh && point.speed_kmh >= 100) {
        zero_to_100_kmh = Math.round(((point.timestamp - startFrom0Time) / 1000) * 100) / 100;
        reached100kmh = true;
      }
    }

    return {
      zero_to_60_mph,
      zero_to_100_mph,
      zero_to_100_kmh,
      max_speed_mph: Math.round(max_speed_mph * 10) / 10,
      max_speed_kmh: Math.round(max_speed_kmh * 10) / 10,
    };
  };

  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  const displaySpeed = Math.round(getDisplaySpeed(currentSpeed));
  const maxDisplaySpeed = Math.round(getDisplaySpeed(maxSpeed));
  const maxScale = unit === 'mph' ? 180 : 300;
  const speedPercentage = Math.min(displaySpeed / maxScale, 1);
  const needleRotation = -120 + (speedPercentage * 240);

  return (
    <div className="min-h-screen p-4 md:p-8" style={{ background: '#15202b' }}>
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link href="/dashboard" className="flex items-center gap-2 text-x-gray hover:text-x-white transition-colors">
            <ChevronLeft className="w-5 h-5" />
            <span>Back</span>
          </Link>
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center">
              <Gauge className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-display font-bold text-white tracking-wider">REDLINE</span>
          </div>
        </div>

        {/* GPS Status */}
        <div className="glass p-4 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {gpsStatus === 'active' ? (
              <>
                <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                  <Wifi className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-green-500">GPS Active</div>
                  <div className="text-xs text-x-gray">±{Math.round(gpsAccuracy || 0)}m accuracy</div>
                </div>
              </>
            ) : gpsStatus === 'error' ? (
              <>
                <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
                  <WifiOff className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-accent">GPS Error</div>
                  <div className="text-xs text-x-gray">{errorMessage}</div>
                </div>
              </>
            ) : (
              <>
                <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center">
                  <Navigation className="w-5 h-5 text-yellow-500 animate-pulse" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-yellow-500">Waiting for GPS</div>
                  <div className="text-xs text-x-gray">Move to an open area</div>
                </div>
              </>
            )}
          </div>

          {/* Unit toggle */}
          <div className="flex items-center bg-dark-400 rounded-full p-1">
            <button
              onClick={() => setUnit('mph')}
              className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
                unit === 'mph' ? 'bg-accent text-white' : 'text-x-gray hover:text-x-white'
              }`}
            >
              MPH
            </button>
            <button
              onClick={() => setUnit('kmh')}
              className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
                unit === 'kmh' ? 'bg-accent text-white' : 'text-x-gray hover:text-x-white'
              }`}
            >
              KM/H
            </button>
          </div>
        </div>

        {/* Speedometer */}
        <div className="glass p-8 mb-6">
          <div className="relative w-full max-w-sm mx-auto aspect-square">
            <svg viewBox="0 0 200 200" className="w-full h-full">
              {/* Background arc */}
              <path
                d="M 30 140 A 80 80 0 1 1 170 140"
                fill="none"
                stroke="#38444d"
                strokeWidth="10"
                strokeLinecap="round"
              />
              
              {/* Active arc */}
              <path
                d="M 30 140 A 80 80 0 1 1 170 140"
                fill="none"
                stroke="url(#speedGradient)"
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray="377"
                strokeDashoffset={377 - (speedPercentage * 377)}
                style={{ transition: 'stroke-dashoffset 0.3s ease-out' }}
              />
              
              <defs>
                <linearGradient id="speedGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#dc2626" />
                  <stop offset="100%" stopColor="#991b1b" />
                </linearGradient>
              </defs>
              
              {/* Speed markers */}
              {[0, 30, 60, 90, 120, 150, 180].map((speed) => {
                const angle = -120 + (speed / 180) * 240;
                const radian = (angle * Math.PI) / 180;
                const x1 = 100 + 68 * Math.sin(radian);
                const y1 = 100 - 68 * Math.cos(radian);
                const x2 = 100 + 78 * Math.sin(radian);
                const y2 = 100 - 78 * Math.cos(radian);
                const textX = 100 + 55 * Math.sin(radian);
                const textY = 100 - 55 * Math.cos(radian);
                
                return (
                  <g key={speed}>
                    <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={speed >= 120 ? '#dc2626' : '#8b98a5'} strokeWidth="2" />
                    <text
                      x={textX} y={textY}
                      fill={speed >= 120 ? '#dc2626' : '#8b98a5'}
                      fontSize="11" fontFamily="Orbitron" fontWeight="bold"
                      textAnchor="middle" dominantBaseline="middle"
                    >
                      {unit === 'mph' ? speed : Math.round(speed * 1.6)}
                    </text>
                  </g>
                );
              })}
              
              {/* Center */}
              <circle cx="100" cy="100" r="40" fill="#192734" stroke="#38444d" strokeWidth="2" />
              
              {/* Needle */}
              <g style={{ transform: `rotate(${needleRotation}deg)`, transformOrigin: '100px 100px', transition: 'transform 0.3s ease-out' }}>
                <polygon points="100,35 96,100 104,100" fill="#dc2626" className="speedometer-glow" />
                <circle cx="100" cy="100" r="8" fill="#dc2626" />
                <circle cx="100" cy="100" r="4" fill="#15202b" />
              </g>
            </svg>
            
            {/* Digital display */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <div className="text-6xl font-display font-bold text-x-white">{displaySpeed}</div>
              <div className="text-lg text-x-gray font-semibold uppercase">{unit}</div>
            </div>
          </div>

          {/* Max speed */}
          <div className="flex justify-center mt-6">
            <div className="px-5 py-2 bg-dark-400 border border-x-border rounded-full">
              <span className="text-x-gray text-sm font-semibold">MAX: </span>
              <span className="font-display font-bold text-accent text-lg">{maxDisplaySpeed} {unit.toUpperCase()}</span>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex justify-center gap-4 mb-8">
          {!isTracking ? (
            <button onClick={startTracking} className="btn-accent flex items-center gap-3 px-8 py-4 text-lg">
              <Play className="w-6 h-6" fill="white" />
              START
            </button>
          ) : (
            <button onClick={stopTracking} className="btn-outline flex items-center gap-3 px-8 py-4 text-lg border-accent text-accent hover:bg-accent/10">
              <Square className="w-6 h-6" fill="currentColor" />
              STOP
            </button>
          )}
          
          <button onClick={resetTracking} className="btn-outline flex items-center gap-2 px-6 py-4">
            <RotateCcw className="w-5 h-5" />
            RESET
          </button>
        </div>

        {/* Results */}
        {showResults && calculatedStats && (
          <div className="glass p-6 animate-fade-in mb-8">
            <div className="flex items-center gap-2 mb-6">
              <Timer className="w-6 h-6 text-accent" />
              <h2 className="text-xl font-display font-bold text-x-white tracking-wide">RUN RESULTS</h2>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
              {calculatedStats.zero_to_60_mph && (
                <div className="stat-card text-center">
                  <div className="text-3xl font-display font-bold text-green-500">{calculatedStats.zero_to_60_mph}s</div>
                  <div className="text-xs text-x-gray uppercase mt-1">0-60 MPH</div>
                </div>
              )}
              {calculatedStats.zero_to_100_kmh && (
                <div className="stat-card text-center">
                  <div className="text-3xl font-display font-bold text-blue-400">{calculatedStats.zero_to_100_kmh}s</div>
                  <div className="text-xs text-x-gray uppercase mt-1">0-100 KM/H</div>
                </div>
              )}
              <div className="stat-card text-center">
                <div className="text-3xl font-display font-bold text-x-white">{calculatedStats.max_speed_mph}</div>
                <div className="text-xs text-x-gray uppercase mt-1">MAX MPH</div>
              </div>
            </div>

            <div className="flex justify-center">
              <button className="btn-accent flex items-center gap-2">
                <Save className="w-5 h-5" />
                SAVE RUN
              </button>
            </div>
          </div>
        )}

        {/* Tips */}
        <div className="glass p-6">
          <h3 className="font-display font-bold text-x-white mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-500" />
            TIPS
          </h3>
          <ul className="space-y-2 text-sm text-x-gray">
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span>Use in open areas for best GPS accuracy</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span>Wait for GPS lock before starting</span>
            </li>
            <li className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
              <span>Drive safely on closed courses only</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
