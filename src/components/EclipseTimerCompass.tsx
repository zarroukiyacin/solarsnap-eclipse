import React, { useState, useEffect } from 'react';
import { Compass, Clock, MapPin, Calendar, Sun, AlertTriangle, ShieldCheck, ChevronRight, Navigation } from 'lucide-react';
import { ECLIPSE_EVENTS, ECLIPSE_PHASE_INFOS } from '../data/eclipseData';
import { EclipseLocationInfo, EclipsePhase } from '../types';

interface EclipseTimerCompassProps {
  onSelectPhaseForCamera: (phase: EclipsePhase) => void;
}

export const EclipseTimerCompass: React.FC<EclipseTimerCompassProps> = ({
  onSelectPhaseForCamera,
}) => {
  const [selectedLocation, setSelectedLocation] = useState<EclipseLocationInfo>(ECLIPSE_EVENTS[0]);
  const [deviceAzimuth, setDeviceAzimuth] = useState<number>(275); // Mocked or live device compass angle
  const [deviceElevation, setDeviceElevation] = useState<number>(14);

  // Countdown timer calculation to Max Eclipse time
  const [timeRemaining, setTimeRemaining] = useState<{ days: number; hours: number; minutes: number; seconds: number }>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date().getTime();
      const targetDate = new Date(`${selectedLocation.date}T18:32:00Z`).getTime();
      const diff = Math.max(0, targetDate - now);

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeRemaining({ days, hours, minutes, seconds });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [selectedLocation]);

  // Request Device Compass Orientation if available
  useEffect(() => {
    const handleOrientation = (e: DeviceOrientationEvent) => {
      if (e.alpha !== null) setDeviceAzimuth(Math.round(360 - e.alpha));
      if (e.beta !== null) setDeviceElevation(Math.round(Math.abs(e.beta)));
    };

    if (window.DeviceOrientationEvent) {
      window.addEventListener('deviceorientation', handleOrientation);
    }
    return () => {
      if (window.DeviceOrientationEvent) {
        window.removeEventListener('deviceorientation', handleOrientation);
      }
    };
  }, []);

  const azimuthDiff = Math.abs(deviceAzimuth - selectedLocation.sunAzimuthDeg);
  const isSolarAligned = azimuthDiff < 10;

  return (
    <div className="flex-1 bg-slate-950 text-slate-100 p-3 overflow-y-auto space-y-4 text-xs">
      {/* Location Selector Dropdown */}
      <div className="bg-slate-900 border border-slate-800 p-3 rounded-2xl shadow-sm space-y-2">
        <div className="flex items-center justify-between text-slate-400 font-medium">
          <span className="flex items-center gap-1.5 text-amber-400 font-semibold">
            <MapPin className="w-4 h-4" />
            <span>Site d'Éclipse Sélectionné:</span>
          </span>
          <span className="bg-amber-500/10 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-full text-[10px] font-mono">
            {selectedLocation.type} 100%
          </span>
        </div>

        <select
          value={selectedLocation.id}
          onChange={(e) => {
            const found = ECLIPSE_EVENTS.find((loc) => loc.id === e.target.value);
            if (found) setSelectedLocation(found);
          }}
          className="w-full bg-slate-950 border border-slate-700 text-slate-200 text-xs p-2.5 rounded-xl focus:ring-1 focus:ring-amber-500 outline-none"
        >
          {ECLIPSE_EVENTS.map((loc) => (
            <option key={loc.id} value={loc.id}>
              {loc.name} - {loc.date}
            </option>
          ))}
        </select>

        <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1 font-mono">
          <span>Durée Totalité: <strong className="text-amber-300">{selectedLocation.totalityDurationSec}s</strong></span>
          <span>Coordonnées: {selectedLocation.lat.toFixed(2)}°, {selectedLocation.lng.toFixed(2)}°</span>
        </div>
      </div>

      {/* Countdown Card */}
      <div className="bg-gradient-to-br from-amber-950/40 via-slate-900 to-slate-950 border border-amber-500/30 p-4 rounded-2xl shadow-lg relative overflow-hidden">
        <div className="flex items-center justify-between mb-2">
          <span className="text-amber-400 font-semibold flex items-center gap-1.5">
            <Clock className="w-4 h-4" />
            <span>Compte à Rebours Maximale:</span>
          </span>
          <span className="text-[10px] text-slate-400 font-mono">{selectedLocation.date}</span>
        </div>

        {/* Big Timer Grid */}
        <div className="grid grid-cols-4 gap-2 text-center my-3 font-mono">
          <div className="bg-slate-950/80 border border-amber-500/20 p-2 rounded-xl">
            <div className="text-xl font-bold text-amber-400">{timeRemaining.days}</div>
            <div className="text-[9px] text-slate-400 uppercase">Jours</div>
          </div>
          <div className="bg-slate-950/80 border border-amber-500/20 p-2 rounded-xl">
            <div className="text-xl font-bold text-amber-400">{String(timeRemaining.hours).padStart(2, '0')}</div>
            <div className="text-[9px] text-slate-400 uppercase">Heures</div>
          </div>
          <div className="bg-slate-950/80 border border-amber-500/20 p-2 rounded-xl">
            <div className="text-xl font-bold text-amber-400">{String(timeRemaining.minutes).padStart(2, '0')}</div>
            <div className="text-[9px] text-slate-400 uppercase">Min</div>
          </div>
          <div className="bg-slate-950/80 border border-amber-500/20 p-2 rounded-xl">
            <div className="text-xl font-bold text-amber-400">{String(timeRemaining.seconds).padStart(2, '0')}</div>
            <div className="text-[9px] text-slate-400 uppercase">Sec</div>
          </div>
        </div>
      </div>

      {/* Solar Alignment Compass Widget */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-3">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-slate-200 flex items-center gap-1.5">
            <Compass className="w-4 h-4 text-amber-400" />
            <span>Boussole d'Alignement Solaire</span>
          </span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
            isSolarAligned ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-slate-800 text-slate-400'
          }`}>
            {isSolarAligned ? '✓ Alignement Solaire Ok' : 'Ajuster l\'oriention'}
          </span>
        </div>

        {/* Compass Graphic */}
        <div className="flex items-center justify-center py-2">
          <div className="relative w-36 h-36 rounded-full border-2 border-slate-800 bg-slate-950 flex items-center justify-center shadow-inner">
            {/* Target Sun Indicator */}
            <div
              className="absolute w-6 h-6 rounded-full bg-amber-500/30 border border-amber-400 flex items-center justify-center shadow-md transition-all duration-300"
              style={{
                transform: `rotate(${selectedLocation.sunAzimuthDeg - deviceAzimuth}deg) translateY(-54px)`,
              }}
            >
              <Sun className="w-4 h-4 text-amber-400 animate-spin-slow" />
            </div>

            {/* Phone Heading Needle */}
            <div className="w-1 h-20 bg-amber-500/80 rounded-full shadow" />
            <div className="absolute w-3 h-3 bg-white rounded-full border-2 border-amber-500" />

            {/* Cardinal points */}
            <span className="absolute top-1 text-[9px] font-mono text-slate-500">N</span>
            <span className="absolute bottom-1 text-[9px] font-mono text-slate-500">S</span>
            <span className="absolute right-2 text-[9px] font-mono text-slate-500">E</span>
            <span className="absolute left-2 text-[9px] font-mono text-slate-500">O</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 text-center font-mono text-[11px] bg-slate-950/60 p-2 rounded-xl border border-slate-800">
          <div>
            <span className="text-slate-400 block text-[9px]">AZIMUTH CIBLE</span>
            <strong className="text-amber-400">{selectedLocation.sunAzimuthDeg}° WNW</strong>
          </div>
          <div>
            <span className="text-slate-400 block text-[9px]">ÉLÉVATION SOLEIL</span>
            <strong className="text-amber-400">{selectedLocation.sunElevationDeg}° Sur l'horizon</strong>
          </div>
        </div>
      </div>

      {/* Contact Timings & Phases List */}
      <div className="bg-slate-900 border border-slate-800 p-3 rounded-2xl space-y-2">
        <span className="font-semibold text-slate-200 block mb-1">
          Contacts & Chronologie des Phases:
        </span>

        <div className="space-y-1.5">
          {ECLIPSE_PHASE_INFOS.map((info) => (
            <div
              key={info.phase}
              onClick={() => onSelectPhaseForCamera(info.phase as EclipsePhase)}
              className="bg-slate-950 hover:bg-slate-800/80 border border-slate-800 p-2.5 rounded-xl cursor-pointer transition-colors flex items-center justify-between group"
            >
              <div className="space-y-1 pr-2">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-amber-300 text-[11px]">{info.titleFr}</span>
                  <span className={`text-[9px] px-2 py-0.5 rounded border font-mono ${info.safetyBadgeColor}`}>
                    {info.safetyBadge}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 leading-tight">{info.descriptionFr}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-neutral-500 group-hover:text-amber-400 shrink-0" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
