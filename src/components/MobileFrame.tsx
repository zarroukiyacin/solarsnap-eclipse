import React, { useState, useEffect } from 'react';
import { Smartphone, Monitor, BatteryCharging, Wifi, Signal, Github, Download } from 'lucide-react';

interface MobileFrameProps {
  children: React.ReactNode;
  activeTabTitle?: string;
  onOpenGithubApkModal?: () => void;
}

export const MobileFrame: React.FC<MobileFrameProps> = ({ children, activeTabTitle, onOpenGithubApkModal }) => {
  const [isMobileDeviceMode, setIsMobileDeviceMode] = useState<boolean>(true);
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }));
    };
    updateClock();
    const timer = setInterval(updateClock, 10000);
    return () => clearInterval(timer);
  }, []);

  if (!isMobileDeviceMode) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500/30">
        {/* Floating Top Mode Switcher Bar */}
        <header className="bg-slate-900/90 border-b border-slate-800 px-4 py-2 flex items-center justify-between text-xs text-slate-400 backdrop-blur sticky top-0 z-50">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
            <span className="font-semibold text-slate-200">SolarSnap APK Web Edition</span>
            <span className="bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded border border-amber-500/20 font-mono text-[10px]">
              ECLIPSE KIT 2026
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenGithubApkModal}
              className="flex items-center gap-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-medium px-3 py-1 rounded-full transition-all shadow-sm"
            >
              <Github className="w-3.5 h-3.5" />
              <span>Export GitHub & APK</span>
            </button>
            <button
              onClick={() => setIsMobileDeviceMode(true)}
              className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-medium px-3 py-1 rounded-full transition-colors shadow-sm"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Mode Smartphone</span>
            </button>
          </div>
        </header>
        <div className="flex-1 flex flex-col">{children}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-slate-100 flex flex-col items-center justify-center p-2 sm:p-6 font-sans select-none">
      {/* Outer Controls & Info */}
      <div className="w-full max-w-sm sm:max-w-md flex items-center justify-between mb-3 text-xs text-neutral-400">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></div>
          <span className="font-mono text-neutral-300">Simulateur APK Android v2.6</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenGithubApkModal}
            className="flex items-center gap-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold px-2.5 py-1 rounded-md transition-all shadow-sm"
            title="Ouvrir l'assistant d'export GitHub et compilation APK"
          >
            <Github className="w-3.5 h-3.5" />
            <span>Générer .APK</span>
          </button>
          <button
            onClick={() => setIsMobileDeviceMode(false)}
            className="flex items-center gap-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 px-2.5 py-1 rounded-md border border-neutral-700 transition-colors"
            title="Basculer en mode Plein Écran Web"
          >
            <Monitor className="w-3.5 h-3.5 text-amber-400" />
            <span>Plein Écran</span>
          </button>
        </div>
      </div>

      {/* Android Device Shell */}
      <div className="relative w-full max-w-[390px] h-[812px] bg-black rounded-[48px] p-3 shadow-2xl border-[6px] border-neutral-800 shadow-amber-500/5 ring-1 ring-neutral-700 flex flex-col overflow-hidden">
        {/* Hardware Camera Punch Hole & Earpiece */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 flex items-center justify-center gap-2">
          <div className="w-3.5 h-3.5 bg-neutral-900 rounded-full border border-neutral-800 ring-2 ring-neutral-950 flex items-center justify-center">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-950/80"></div>
          </div>
        </div>

        {/* Android Status Bar */}
        <div className="w-full h-8 pt-1.5 px-6 flex items-center justify-between text-[11px] font-medium text-neutral-300 z-40 bg-neutral-950/60 backdrop-blur-md shrink-0">
          <span className="font-mono text-neutral-200">{currentTime || '15:52'}</span>
          <div className="flex items-center gap-1.5 text-neutral-300">
            <Signal className="w-3 h-3" />
            <Wifi className="w-3 h-3 text-neutral-200" />
            <span className="text-[10px] font-mono text-amber-400 font-bold">5G</span>
            <BatteryCharging className="w-3.5 h-3.5 text-emerald-400 ml-0.5" />
          </div>
        </div>

        {/* Smartphone Screen Viewport */}
        <div className="relative flex-1 bg-slate-950 rounded-[36px] overflow-hidden flex flex-col border border-neutral-800/80">
          {children}
        </div>

        {/* Android Gesture Navigation Bar at Bottom */}
        <div className="w-full h-5 flex items-center justify-center bg-black/80 shrink-0 pt-1">
          <div className="w-32 h-1 bg-neutral-500 rounded-full"></div>
        </div>
      </div>
      
      {/* Subtitle / Tip */}
      <p className="text-[11px] text-neutral-500 mt-2.5 text-center">
        💡 Astuce: Montez votre filtre <span className="text-amber-400 font-semibold">SolarSnap velcro</span> devant l'objectif de votre smartphone.
      </p>
    </div>
  );
};
