import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Camera, Sliders, Zap, Sun, ShieldAlert, 
  Lock, Unlock, Focus, Maximize2, RefreshCw, 
  Play, Pause, Layers, Grid, Info, Sparkles, Check
} from 'lucide-react';
import { CameraSettings, FilterType, CapturedPhoto, EclipsePhase, IntervalometerConfig } from '../types';
import { playShutterSound, playBeepSound, playSafetyAlertSound } from '../utils/audioEffects';

interface CameraViewProps {
  onPhotoCaptured: (photo: CapturedPhoto) => void;
  selectedPhase: EclipsePhase;
  onPhaseChange: (phase: EclipsePhase) => void;
}

export const CameraView: React.FC<CameraViewProps> = ({
  onPhotoCaptured,
  selectedPhase,
  onPhaseChange,
}) => {
  // Camera state
  const [useRealWebcam, setUseRealWebcam] = useState<boolean>(false);
  const [webcamActive, setWebcamActive] = useState<boolean>(false);
  const [webcamError, setWebcamError] = useState<string | null>(null);

  // Settings state
  const [settings, setSettings] = useState<CameraSettings>({
    zoom: 2.5,
    exposureEV: -1.5,
    iso: 100,
    shutterSpeed: '1/1000s',
    focusMode: 'infinity',
    manualFocusDistance: 100,
    gridType: 'solar_ring',
    filterType: 'solar_snap_orange',
    hdrBracketing: false,
  });

  // Simulator Sun progress slider (0% = Full Sun, 50% = Max Eclipse / Totality, 100% = Sun reappears)
  const [eclipseProgress, setEclipseProgress] = useState<number>(35); // Default 35% partial eclipse

  // Intervalometer state
  const [intervalometer, setIntervalometer] = useState<IntervalometerConfig>({
    active: false,
    intervalSeconds: 10,
    totalPhotos: 0,
    photosTaken: 0,
    timeRemainingSec: 10,
  });

  // UI Panels
  const [activeControlTab, setActiveControlTab] = useState<'exposure' | 'zoom' | 'filter' | 'interval' | 'grid'>('exposure');
  const [showSafetyBanner, setShowSafetyBanner] = useState<boolean>(true);
  const [lastCapturedThumb, setLastCapturedThumb] = useState<string | null>(null);
  const [flashEffect, setFlashEffect] = useState<boolean>(false);

  // Refs
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const webcamStreamRef = useRef<MediaStream | null>(null);

  // Start Real Webcam
  const startWebcam = async () => {
    try {
      setWebcamError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' }, // Rear camera
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });
      webcamStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setWebcamActive(true);
      setUseRealWebcam(true);
    } catch (err: any) {
      console.warn('Webcam permission or access failed:', err);
      setWebcamError('Caméra physique non accessible (mode simulateur solaire activé)');
      setUseRealWebcam(false);
      setWebcamActive(false);
    }
  };

  const stopWebcam = () => {
    if (webcamStreamRef.current) {
      webcamStreamRef.current.getTracks().forEach((t) => t.stop());
      webcamStreamRef.current = null;
    }
    setWebcamActive(false);
    setUseRealWebcam(false);
  };

  useEffect(() => {
    return () => {
      stopWebcam();
    };
  }, []);

  // Update Canvas Rendering (Combines webcam or simulated solar graphics + exposure filters)
  const drawCanvasFrame = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Clear canvas
    ctx.fillStyle = '#030712'; // Deep space black
    ctx.fillRect(0, 0, width, height);

    if (useRealWebcam && webcamActive && videoRef.current && videoRef.current.readyState === 4) {
      // Render Webcam feed
      ctx.save();
      // Apply zoom transform
      const zoomFactor = Math.max(1, settings.zoom / 1.5);
      const sw = width / zoomFactor;
      const sh = height / zoomFactor;
      const sx = (width - sw) / 2;
      const sy = (height - sh) / 2;

      ctx.drawImage(videoRef.current, sx, sy, sw, sh, 0, 0, width, height);
      ctx.restore();

      // Apply Filter overlay tint over webcam
      applyFilterAndExposureOverlay(ctx, width, height);
    } else {
      // Render Simulated Solar Eclipse View
      drawSimulatedSolarEclipse(ctx, width, height);
    }

    // Draw Alignment Grid / Reticle
    drawGridOverlay(ctx, width, height);
  }, [useRealWebcam, webcamActive, settings, eclipseProgress]);

  // Apply Filter Tint & Exposure Brightness Adjustments
  const applyFilterAndExposureOverlay = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.save();

    // EV Brightness adjustment (-4.0 to +4.0)
    const evMultiplier = Math.pow(2, settings.exposureEV);
    
    // Filter Tinting
    if (settings.filterType === 'solar_snap_orange') {
      ctx.fillStyle = `rgba(245, 124, 0, ${Math.min(0.85, 0.5 * evMultiplier)})`;
      ctx.globalCompositeOperation = 'multiply';
      ctx.fillRect(0, 0, width, height);
    } else if (settings.filterType === 'white_light') {
      ctx.fillStyle = `rgba(200, 220, 255, ${Math.min(0.4, 0.25 * evMultiplier)})`;
      ctx.globalCompositeOperation = 'multiply';
      ctx.fillRect(0, 0, width, height);
    } else if (settings.filterType === 'h_alpha') {
      ctx.fillStyle = `rgba(220, 20, 60, ${Math.min(0.85, 0.6 * evMultiplier)})`;
      ctx.globalCompositeOperation = 'multiply';
      ctx.fillRect(0, 0, width, height);
    } else if (settings.filterType === 'no_filter_totality') {
      // Glow booster
    }

    ctx.restore();
  };

  // Draw Realistic Simulated Sun & Eclipse Moon on Canvas
  const drawSimulatedSolarEclipse = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const cx = width / 2;
    const cy = height / 2 - 20;

    // Base scale according to zoom setting
    const baseRadius = 55 * Math.min(6, Math.max(0.8, settings.zoom));

    // Exposure multiplier affects sun brightness & corona extension
    const ev = settings.exposureEV; // -4 to +4
    const brightness = Math.max(0.1, Math.min(3, 1 + ev * 0.25));

    // Calculate Moon Offset based on eclipseProgress (0% = full sun on right, 50% = total alignment center, 100% = moon exits left)
    const moonProgressOffset = (50 - eclipseProgress) * (baseRadius * 0.045);
    const moonCx = cx + moonProgressOffset;
    const moonCy = cy;

    const isTotality = Math.abs(eclipseProgress - 50) < 1.5;
    const isDiamondRing = Math.abs(eclipseProgress - 50) >= 1.5 && Math.abs(eclipseProgress - 50) < 4.0;
    const isBailysBeads = Math.abs(eclipseProgress - 50) >= 4.0 && Math.abs(eclipseProgress - 50) < 7.0;

    // Background Sky Tint depending on totality
    let skyColor = '#020617';
    if (!isTotality && settings.filterType === 'no_filter_totality') {
      // Bright glare warning if no filter on non-totality
      skyColor = '#38bdf8';
    } else if (isTotality) {
      skyColor = '#02020a'; // Dark twilight sky during totality
    }
    ctx.fillStyle = skyColor;
    ctx.fillRect(0, 0, width, height);

    // Filter Color Definitions
    let sunColor1 = '#f97316'; // Orange SolarSnap
    let sunColor2 = '#fbbf24';
    let coronaColor = 'rgba(254, 243, 199, 0.4)';

    if (settings.filterType === 'white_light') {
      sunColor1 = '#f8fafc';
      sunColor2 = '#e2e8f0';
      coronaColor = 'rgba(241, 245, 249, 0.3)';
    } else if (settings.filterType === 'h_alpha') {
      sunColor1 = '#dc2626';
      sunColor2 = '#f87171';
      coronaColor = 'rgba(239, 68, 68, 0.4)';
    } else if (settings.filterType === 'no_filter_totality') {
      sunColor1 = '#ffffff';
      sunColor2 = '#fef08a';
      coronaColor = 'rgba(255, 255, 255, 0.8)';
    }

    // 1. CORONA (Only visible during Totality C2-C3 or without filter)
    if (isTotality || isDiamondRing || settings.filterType === 'no_filter_totality') {
      const coronaRadius = baseRadius * (1.8 + (ev > 0 ? ev * 0.4 : 0));
      const coronaGrad = ctx.createRadialGradient(cx, cy, baseRadius * 0.9, cx, cy, coronaRadius);
      coronaGrad.addColorStop(0, coronaColor);
      coronaGrad.addColorStop(0.3, 'rgba(255, 255, 255, 0.2)');
      coronaGrad.addColorStop(0.7, 'rgba(217, 249, 157, 0.08)');
      coronaGrad.addColorStop(1, 'transparent');

      ctx.fillStyle = coronaGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, coronaRadius, 0, Math.PI * 2);
      ctx.fill();

      // Magnetic Rays & Streams
      if (isTotality) {
        ctx.save();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.lineWidth = 1.5;
        for (let a = 0; a < 360; a += 15) {
          const rad = (a * Math.PI) / 180;
          const len = baseRadius * (1.3 + Math.sin(a * 4) * 0.4);
          ctx.beginPath();
          ctx.moveTo(cx + Math.cos(rad) * baseRadius, cy + Math.sin(rad) * baseRadius);
          ctx.lineTo(cx + Math.cos(rad) * len, cy + Math.sin(rad) * len);
          ctx.stroke();
        }
        ctx.restore();
      }
    }

    // 2. SUN DISK
    const sunGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, baseRadius);
    sunGrad.addColorStop(0, '#ffffff');
    sunGrad.addColorStop(0.6, sunColor2);
    sunGrad.addColorStop(1, sunColor1);

    ctx.save();
    ctx.shadowColor = sunColor1;
    ctx.shadowBlur = 15 * brightness;
    ctx.fillStyle = sunGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, baseRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 3. SUNSPOTS (if partial)
    if (!isTotality && settings.filterType !== 'no_filter_totality') {
      ctx.fillStyle = '#451a03';
      // Spot 1
      ctx.beginPath();
      ctx.arc(cx - baseRadius * 0.3, cy + baseRadius * 0.1, baseRadius * 0.05, 0, Math.PI * 2);
      ctx.fill();
      // Spot 2
      ctx.beginPath();
      ctx.arc(cx - baseRadius * 0.22, cy + baseRadius * 0.15, baseRadius * 0.03, 0, Math.PI * 2);
      ctx.fill();
    }

    // 4. MOON DISK (Eclipsing Shadow)
    ctx.fillStyle = isTotality ? '#020208' : '#030712';
    ctx.beginPath();
    ctx.arc(moonCx, moonCy, baseRadius * 1.01, 0, Math.PI * 2);
    ctx.fill();

    // 5. DIAMOND RING & BAILY'S BEADS FLARE EFFECT
    if (isDiamondRing) {
      const flareX = cx + Math.cos(-0.4) * baseRadius;
      const flareY = cy + Math.sin(-0.4) * baseRadius;

      const flareGrad = ctx.createRadialGradient(flareX, flareY, 0, flareX, flareY, baseRadius * 0.8);
      flareGrad.addColorStop(0, '#ffffff');
      flareGrad.addColorStop(0.2, '#fef08a');
      flareGrad.addColorStop(0.5, 'rgba(245, 158, 11, 0.5)');
      flareGrad.addColorStop(1, 'transparent');

      ctx.fillStyle = flareGrad;
      ctx.beginPath();
      ctx.arc(flareX, flareY, baseRadius * 0.8, 0, Math.PI * 2);
      ctx.fill();
    } else if (isBailysBeads) {
      // Draw tiny sparkling beads on edge
      ctx.fillStyle = '#ffffff';
      for (let i = -2; i <= 2; i++) {
        const angle = -0.5 + i * 0.15;
        const bx = cx + Math.cos(angle) * baseRadius;
        const by = cy + Math.sin(angle) * baseRadius;
        ctx.beginPath();
        ctx.arc(bx, by, 3.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  };

  // Draw Camera Reticle & Grid Lines
  const drawGridOverlay = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.lineWidth = 1;

    if (settings.gridType === 'thirds') {
      // 3x3 Grid
      ctx.beginPath();
      ctx.moveTo(width / 3, 0); ctx.lineTo(width / 3, height);
      ctx.moveTo((width * 2) / 3, 0); ctx.lineTo((width * 2) / 3, height);
      ctx.moveTo(0, height / 3); ctx.lineTo(width, height / 3);
      ctx.moveTo(0, (height * 2) / 3); ctx.lineTo(width, (height * 2) / 3);
      ctx.stroke();
    } else if (settings.gridType === 'crosshair') {
      // Center Crosshair
      const cx = width / 2;
      const cy = height / 2 - 20;
      ctx.strokeStyle = '#f59e0b';
      ctx.beginPath();
      ctx.moveTo(cx - 20, cy); ctx.lineTo(cx + 20, cy);
      ctx.moveTo(cx, cy - 20); ctx.lineTo(cx, cy + 20);
      ctx.stroke();
    } else if (settings.gridType === 'solar_ring') {
      // Concentric Solar Target Ring
      const cx = width / 2;
      const cy = height / 2 - 20;
      ctx.strokeStyle = 'rgba(245, 158, 11, 0.4)';
      ctx.beginPath();
      ctx.arc(cx, cy, 70, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.beginPath();
      ctx.arc(cx, cy, 110, 0, Math.PI * 2);
      ctx.stroke();

      // Corner Framing Crosses
      const offset = 20;
      ctx.strokeStyle = 'rgba(245, 158, 11, 0.6)';
      ctx.beginPath();
      // Top Left
      ctx.moveTo(offset, offset + 15); ctx.lineTo(offset, offset); ctx.lineTo(offset + 15, offset);
      // Top Right
      ctx.moveTo(width - offset - 15, offset); ctx.lineTo(width - offset, offset); ctx.lineTo(width - offset, offset + 15);
      // Bottom Left
      ctx.moveTo(offset, height - offset - 15); ctx.lineTo(offset, height - offset); ctx.lineTo(offset + 15, height - offset);
      // Bottom Right
      ctx.moveTo(width - offset - 15, height - offset); ctx.lineTo(width - offset, height - offset); ctx.lineTo(width - offset, height - offset - 15);
      ctx.stroke();
    }
    ctx.restore();
  };

  // Re-draw animation loop
  useEffect(() => {
    let animFrame: number;
    const render = () => {
      drawCanvasFrame();
      animFrame = requestAnimationFrame(render);
    };
    render();
    return () => cancelAnimationFrame(animFrame);
  }, [drawCanvasFrame]);

  // Capture Photo Action
  const handleCapturePhoto = () => {
    playShutterSound();
    setFlashEffect(true);
    setTimeout(() => setFlashEffect(false), 120);

    const canvas = canvasRef.current;
    if (!canvas) return;

    const photoDataUrl = canvas.toDataURL('image/jpeg', 0.92);
    setLastCapturedThumb(photoDataUrl);

    const newPhoto: CapturedPhoto = {
      id: `photo-${Date.now()}`,
      dataUrl: photoDataUrl,
      timestamp: new Date().toLocaleTimeString('fr-FR'),
      phase: selectedPhase,
      filterUsed: settings.filterType,
      settings: {
        zoom: settings.zoom,
        exposureEV: settings.exposureEV,
        iso: settings.iso,
        shutterSpeed: settings.shutterSpeed,
      },
      locationName: 'Éclipse Sol de Valencia',
      lat: 39.4699,
      lng: -0.3763,
    };

    onPhotoCaptured(newPhoto);

    // If HDR Bracketing enabled, trigger automatic 3-shot sequence
    if (settings.hdrBracketing) {
      setTimeout(() => {
        playShutterSound();
        // -2 EV shot
      }, 300);
      setTimeout(() => {
        playShutterSound();
        // +2 EV shot
      }, 600);
    }
  };

  // Intervalometer Effect Timer
  useEffect(() => {
    let intervalTimer: any = null;
    if (intervalometer.active) {
      intervalTimer = setInterval(() => {
        setIntervalometer((prev) => {
          if (prev.timeRemainingSec <= 1) {
            // Trigger capture!
            handleCapturePhoto();
            playBeepSound(1200, 0.1);
            return {
              ...prev,
              photosTaken: prev.photosTaken + 1,
              timeRemainingSec: prev.intervalSeconds,
            };
          }
          return {
            ...prev,
            timeRemainingSec: prev.timeRemainingSec - 1,
          };
        });
      }, 1000);
    }
    return () => clearInterval(intervalTimer);
  }, [intervalometer.active, intervalometer.intervalSeconds]);

  // Safety Filter Alert Check
  const isTotalitySelected = selectedPhase === 'totality_c2_c3' || selectedPhase === 'corona_inner' || selectedPhase === 'corona_outer' || selectedPhase === 'prominences';
  const filterMissingWarning = !isTotalitySelected && settings.filterType === 'no_filter_totality';

  useEffect(() => {
    if (filterMissingWarning) {
      playSafetyAlertSound();
    }
  }, [filterMissingWarning]);

  return (
    <div className="relative flex-1 bg-black flex flex-col justify-between overflow-hidden">
      {/* Hidden Video element for webcam capture */}
      <video ref={videoRef} className="hidden" playsInline muted />

      {/* Main Viewport Canvas */}
      <div className="relative flex-1 bg-neutral-950 flex items-center justify-center overflow-hidden">
        <canvas
          ref={canvasRef}
          width={380}
          height={480}
          className="w-full h-full object-cover"
        />

        {/* Shutter White Flash Effect */}
        {flashEffect && <div className="absolute inset-0 bg-white z-50 animate-out fade-out duration-100" />}

        {/* Top Status Bar Overlays */}
        <div className="absolute top-2 left-2 right-2 flex items-center justify-between z-30 pointer-events-none">
          {/* Active Filter Badge */}
          <div className="flex items-center gap-1.5 bg-black/70 backdrop-blur border border-amber-500/30 px-2.5 py-1 rounded-full text-[11px] font-medium text-amber-300 shadow">
            <Sun className="w-3.5 h-3.5 text-amber-400 animate-spin-slow" />
            <span>
              {settings.filterType === 'solar_snap_orange' && 'Filtre SolarSnap (Orange ND5)'}
              {settings.filterType === 'white_light' && 'Filtre Lumière Blanche'}
              {settings.filterType === 'h_alpha' && 'Filtre Hydrogène Alpha (H-α)'}
              {settings.filterType === 'no_filter_totality' && 'SANS FILTRE (Totalité)'}
            </span>
          </div>

          {/* Real Camera vs Simulator Toggle */}
          <button
            onClick={useRealWebcam ? stopWebcam : startWebcam}
            className="pointer-events-auto bg-black/80 hover:bg-black border border-neutral-700 px-2.5 py-1 rounded-full text-[10px] text-neutral-300 flex items-center gap-1.5 transition-colors shadow"
          >
            <RefreshCw className="w-3 h-3 text-amber-400" />
            <span>{useRealWebcam ? 'Caméra Physique' : 'Simulateur Éclipse'}</span>
          </button>
        </div>

        {/* Safety Warning Badge Banner */}
        {filterMissingWarning && (
          <div className="absolute top-11 left-2 right-2 bg-rose-600/90 text-white p-2 rounded-xl text-[11px] font-bold flex items-center gap-2 border border-rose-400 shadow-lg z-40 animate-bounce">
            <ShieldAlert className="w-5 h-5 shrink-0 text-amber-200" />
            <div className="leading-tight">
              <span>ATTENTION DANGER OCULAIRE !</span>
              <p className="text-[10px] font-normal text-rose-100">
                Installez votre filtre SolarSnap certifié ISO 12312-2 avant d'orienter le téléphone vers le soleil!
              </p>
            </div>
          </div>
        )}

        {/* Quick Exposure & Zoom HUD Values */}
        <div className="absolute bottom-2 left-2 flex items-center gap-2 z-30 text-[10px] font-mono text-neutral-300">
          <span className="bg-black/70 px-2 py-0.5 rounded border border-neutral-800 backdrop-blur">
            ZOOM <strong className="text-amber-400">{settings.zoom.toFixed(1)}x</strong>
          </span>
          <span className="bg-black/70 px-2 py-0.5 rounded border border-neutral-800 backdrop-blur">
            EXPO <strong className="text-amber-400">{settings.exposureEV > 0 ? `+${settings.exposureEV}` : settings.exposureEV} EV</strong>
          </span>
          <span className="bg-black/70 px-2 py-0.5 rounded border border-neutral-800 backdrop-blur">
            ISO <strong className="text-amber-400">{settings.iso}</strong>
          </span>
          <span className="bg-black/70 px-2 py-0.5 rounded border border-neutral-800 backdrop-blur">
            {settings.shutterSpeed}
          </span>
        </div>

        {/* Focus Lock Icon */}
        <div className="absolute bottom-2 right-2 z-30">
          <button
            onClick={() => {
              playBeepSound(1000, 0.05);
              setSettings((s) => ({ ...s, focusMode: s.focusMode === 'infinity' ? 'auto' : 'infinity' }));
            }}
            className={`p-1.5 rounded-full border backdrop-blur text-[10px] font-medium flex items-center gap-1 transition-colors ${
              settings.focusMode === 'infinity'
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                : 'bg-black/70 text-neutral-400 border-neutral-800'
            }`}
          >
            {settings.focusMode === 'infinity' ? <Lock className="w-3 h-3 text-amber-400" /> : <Unlock className="w-3 h-3" />}
            <span>{settings.focusMode === 'infinity' ? 'Mise au point Infini (Verrouillée)' : 'Focus Auto'}</span>
          </button>
        </div>

        {/* Simulator Solar Eclipse Slider Control overlay if in Simulator Mode */}
        {!useRealWebcam && (
          <div className="absolute top-12 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur border border-amber-500/30 px-3 py-1.5 rounded-full z-30 flex items-center gap-2 max-w-[92%] shadow-lg">
            <span className="text-[10px] font-medium text-amber-400 whitespace-nowrap">Phase Solaire:</span>
            <input
              type="range"
              min="0"
              max="100"
              value={eclipseProgress}
              onChange={(e) => setEclipseProgress(Number(e.target.value))}
              className="w-28 sm:w-36 accent-amber-500 h-1.5 rounded-lg bg-neutral-800 cursor-pointer"
            />
            <span className="text-[10px] font-mono text-neutral-300 w-8 text-right">
              {Math.round(eclipseProgress)}%
            </span>
          </div>
        )}
      </div>

      {/* Control Adjustment Panel (Exposure / Zoom / Filter / Intervalometer / Grid) */}
      <div className="bg-neutral-900 border-t border-neutral-800 p-2 text-slate-200 z-30">
        {/* Navigation Tabs for Controls */}
        <div className="flex items-center justify-around border-b border-neutral-800 pb-1.5 mb-2 text-[11px] font-medium">
          <button
            onClick={() => setActiveControlTab('exposure')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-colors ${
              activeControlTab === 'exposure' ? 'bg-amber-500/20 text-amber-400 font-semibold' : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Exposition</span>
          </button>
          <button
            onClick={() => setActiveControlTab('zoom')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-colors ${
              activeControlTab === 'zoom' ? 'bg-amber-500/20 text-amber-400 font-semibold' : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span>Zoom</span>
          </button>
          <button
            onClick={() => setActiveControlTab('filter')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-colors ${
              activeControlTab === 'filter' ? 'bg-amber-500/20 text-amber-400 font-semibold' : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Sun className="w-3.5 h-3.5" />
            <span>Filtre Solaire</span>
          </button>
          <button
            onClick={() => setActiveControlTab('interval')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-colors ${
              activeControlTab === 'interval' ? 'bg-amber-500/20 text-amber-400 font-semibold' : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Intervalle</span>
          </button>
          <button
            onClick={() => setActiveControlTab('grid')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-colors ${
              activeControlTab === 'grid' ? 'bg-amber-500/20 text-amber-400 font-semibold' : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Grid className="w-3.5 h-3.5" />
            <span>Réticule</span>
          </button>
        </div>

        {/* Tab Content 1: Exposure Controls */}
        {activeControlTab === 'exposure' && (
          <div className="space-y-2 py-1 px-1">
            {/* EV Exposure Compensation Slider */}
            <div className="flex items-center justify-between text-xs">
              <span className="text-neutral-400 font-medium flex items-center gap-1">
                Correction d'Exposition (EV):
              </span>
              <span className="font-mono text-amber-400 font-bold">
                {settings.exposureEV > 0 ? `+${settings.exposureEV}` : settings.exposureEV} EV
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-neutral-500 font-mono">-4.0</span>
              <input
                type="range"
                min="-4.0"
                max="4.0"
                step="0.5"
                value={settings.exposureEV}
                onChange={(e) => setSettings((s) => ({ ...s, exposureEV: parseFloat(e.target.value) }))}
                className="w-full accent-amber-500 h-2 rounded-lg bg-neutral-800 cursor-pointer"
              />
              <span className="text-[10px] text-neutral-500 font-mono">+4.0</span>
            </div>

            {/* Quick ISO Buttons */}
            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] text-neutral-400">Sensibilité ISO:</span>
              <div className="flex items-center gap-1">
                {[50, 100, 200, 400, 800].map((isoVal) => (
                  <button
                    key={isoVal}
                    onClick={() => setSettings((s) => ({ ...s, iso: isoVal }))}
                    className={`px-2 py-0.5 text-[10px] font-mono rounded border transition-colors ${
                      settings.iso === isoVal
                        ? 'bg-amber-500 text-slate-950 font-bold border-amber-400'
                        : 'bg-neutral-800 text-neutral-300 border-neutral-700 hover:bg-neutral-700'
                    }`}
                  >
                    {isoVal}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab Content 2: Zoom Controls */}
        {activeControlTab === 'zoom' && (
          <div className="space-y-2 py-1 px-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-neutral-400 font-medium">Facteur de Zoom Numérique/Optique:</span>
              <span className="font-mono text-amber-400 font-bold">{settings.zoom.toFixed(1)}x</span>
            </div>
            <input
              type="range"
              min="1.0"
              max="20.0"
              step="0.5"
              value={settings.zoom}
              onChange={(e) => setSettings((s) => ({ ...s, zoom: parseFloat(e.target.value) }))}
              className="w-full accent-amber-500 h-2 rounded-lg bg-neutral-800 cursor-pointer"
            />
            {/* Presets */}
            <div className="flex items-center justify-around text-[10px] font-mono">
              {[1.0, 2.5, 5.0, 10.0, 15.0, 20.0].map((preset) => (
                <button
                  key={preset}
                  onClick={() => setSettings((s) => ({ ...s, zoom: preset }))}
                  className={`px-2 py-0.5 rounded border transition-colors ${
                    settings.zoom === preset
                      ? 'bg-amber-500 text-slate-950 font-bold border-amber-400'
                      : 'bg-neutral-800 text-neutral-300 border-neutral-700'
                  }`}
                >
                  {preset}x
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Tab Content 3: Solar Filter Selector */}
        {activeControlTab === 'filter' && (
          <div className="grid grid-cols-2 gap-1.5 py-1 text-[11px]">
            <button
              onClick={() => setSettings((s) => ({ ...s, filterType: 'solar_snap_orange' }))}
              className={`p-2 rounded-lg border text-left flex items-start gap-2 transition-colors ${
                settings.filterType === 'solar_snap_orange'
                  ? 'bg-amber-500/20 border-amber-500 text-amber-200'
                  : 'bg-neutral-800 border-neutral-700 text-neutral-300 hover:bg-neutral-750'
              }`}
            >
              <div className="w-3.5 h-3.5 rounded-full bg-amber-500 shrink-0 mt-0.5"></div>
              <div>
                <div className="font-semibold text-neutral-100">SolarSnap (Orange ND5.0)</div>
                <div className="text-[9px] text-neutral-400">Rendu orange chaleureux classique. Sécurité 100%.</div>
              </div>
            </button>

            <button
              onClick={() => setSettings((s) => ({ ...s, filterType: 'white_light' }))}
              className={`p-2 rounded-lg border text-left flex items-start gap-2 transition-colors ${
                settings.filterType === 'white_light'
                  ? 'bg-amber-500/20 border-amber-500 text-amber-200'
                  : 'bg-neutral-800 border-neutral-700 text-neutral-300 hover:bg-neutral-750'
              }`}
            >
              <div className="w-3.5 h-3.5 rounded-full bg-slate-200 shrink-0 mt-0.5"></div>
              <div>
                <div className="font-semibold text-neutral-100">Lumière Blanche</div>
                <div className="text-[9px] text-neutral-400">Soleil neutre blanc naturel sur fond sombre.</div>
              </div>
            </button>

            <button
              onClick={() => setSettings((s) => ({ ...s, filterType: 'h_alpha' }))}
              className={`p-2 rounded-lg border text-left flex items-start gap-2 transition-colors ${
                settings.filterType === 'h_alpha'
                  ? 'bg-amber-500/20 border-amber-500 text-amber-200'
                  : 'bg-neutral-800 border-neutral-700 text-neutral-300 hover:bg-neutral-750'
              }`}
            >
              <div className="w-3.5 h-3.5 rounded-full bg-rose-600 shrink-0 mt-0.5"></div>
              <div>
                <div className="font-semibold text-neutral-100">Hydrogène Alpha (H-α)</div>
                <div className="text-[9px] text-neutral-400">Révèle les protubérances et la chromosphère.</div>
              </div>
            </button>

            <button
              onClick={() => setSettings((s) => ({ ...s, filterType: 'no_filter_totality' }))}
              className={`p-2 rounded-lg border text-left flex items-start gap-2 transition-colors ${
                settings.filterType === 'no_filter_totality'
                  ? 'bg-emerald-500/20 border-emerald-500 text-emerald-200'
                  : 'bg-neutral-800 border-neutral-700 text-neutral-300 hover:bg-neutral-750'
              }`}
            >
              <div className="w-3.5 h-3.5 rounded-full bg-gradient-to-r from-purple-400 to-indigo-500 shrink-0 mt-0.5"></div>
              <div>
                <div className="font-semibold text-emerald-300">Sans Filtre (Totalité C2-C3)</div>
                <div className="text-[9px] text-emerald-400">SEULEMENT quand le soleil est 100% masqué!</div>
              </div>
            </button>
          </div>
        )}

        {/* Tab Content 4: Intervalometer */}
        {activeControlTab === 'interval' && (
          <div className="space-y-2 py-1 text-[11px]">
            <div className="flex items-center justify-between">
              <span className="text-neutral-300 font-medium">Séquenceur Automatique Timelapse:</span>
              <button
                onClick={() =>
                  setIntervalometer((prev) => ({ ...prev, active: !prev.active, timeRemainingSec: prev.intervalSeconds }))
                }
                className={`px-3 py-1 rounded-full font-bold flex items-center gap-1 transition-colors ${
                  intervalometer.active ? 'bg-rose-600 text-white' : 'bg-emerald-600 text-white hover:bg-emerald-500'
                }`}
              >
                {intervalometer.active ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                <span>{intervalometer.active ? 'Pause Timelapse' : 'Lancer Timelapse'}</span>
              </button>
            </div>

            <div className="flex items-center justify-between gap-2">
              <span className="text-neutral-400">Intervalle entre clichés:</span>
              <div className="flex items-center gap-1 font-mono">
                {[5, 10, 15, 30, 60].map((sec) => (
                  <button
                    key={sec}
                    onClick={() => setIntervalometer((prev) => ({ ...prev, intervalSeconds: sec, timeRemainingSec: sec }))}
                    className={`px-2 py-0.5 rounded border ${
                      intervalometer.intervalSeconds === sec
                        ? 'bg-amber-500 text-slate-950 font-bold border-amber-400'
                        : 'bg-neutral-800 text-neutral-300 border-neutral-700'
                    }`}
                  >
                    {sec}s
                  </button>
                ))}
              </div>
            </div>

            {intervalometer.active && (
              <div className="bg-amber-500/10 border border-amber-500/30 p-2 rounded-lg flex items-center justify-between font-mono text-amber-300">
                <span>Prochain cliché dans: <strong>{intervalometer.timeRemainingSec}s</strong></span>
                <span>Captures: <strong>{intervalometer.photosTaken}</strong></span>
              </div>
            )}
          </div>
        )}

        {/* Tab Content 5: Reticle & Grid Options */}
        {activeControlTab === 'grid' && (
          <div className="flex items-center justify-around py-2 text-[11px]">
            {[
              { id: 'solar_ring', label: 'Réticule Solaire' },
              { id: 'crosshair', label: 'Viseur Croix' },
              { id: 'thirds', label: 'Grille Règle des 3' },
              { id: 'none', label: 'Aucune Grille' },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setSettings((s) => ({ ...s, gridType: item.id as any }))}
                className={`px-2.5 py-1 rounded-md border transition-colors ${
                  settings.gridType === item.id
                    ? 'bg-amber-500 text-slate-950 font-bold border-amber-400'
                    : 'bg-neutral-800 text-neutral-300 border-neutral-700'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Main Shutter & Capture Bar at Bottom */}
      <div className="bg-black border-t border-neutral-900 p-3 flex items-center justify-between text-slate-200 z-30">
        {/* Gallery Thumbnail Preview */}
        <div className="w-11 h-11 rounded-lg bg-neutral-900 border border-neutral-800 overflow-hidden flex items-center justify-center shrink-0">
          {lastCapturedThumb ? (
            <img src={lastCapturedThumb} alt="Miniature" className="w-full h-full object-cover" />
          ) : (
            <Camera className="w-5 h-5 text-neutral-600" />
          )}
        </div>

        {/* Big Shutter Button */}
        <button
          onClick={handleCapturePhoto}
          className="relative w-16 h-16 rounded-full border-4 border-amber-500/80 bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center shadow-lg shadow-amber-500/20 active:scale-95 transition-transform"
          title="Prendre une photo de l'éclipse"
        >
          <div className="w-12 h-12 rounded-full border-2 border-slate-950 bg-white/90 shadow-inner flex items-center justify-center">
            <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-500/40" />
          </div>
        </button>

        {/* HDR Bracketing Toggle */}
        <button
          onClick={() => {
            playBeepSound(900, 0.05);
            setSettings((s) => ({ ...s, hdrBracketing: !s.hdrBracketing }));
          }}
          className={`flex flex-col items-center gap-0.5 p-1.5 rounded-lg border transition-colors text-[10px] ${
            settings.hdrBracketing
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 font-bold'
              : 'bg-neutral-900 text-neutral-400 border-neutral-800'
          }`}
          title="Mode Rafale HDR (3 expositions -2EV, 0EV, +2EV)"
        >
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>Rafale HDR</span>
        </button>
      </div>
    </div>
  );
};
