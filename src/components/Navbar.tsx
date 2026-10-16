import React from 'react';
import { Camera, Compass, Sliders, Image as ImageIcon, BookOpen, Bot, DownloadCloud } from 'lucide-react';

export type TabType = 'camera' | 'timer' | 'exposure' | 'gallery' | 'kit' | 'assistant' | 'apk';

interface NavbarProps {
  activeTab: TabType;
  onSelectTab: (tab: TabType) => void;
  photoCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, onSelectTab, photoCount }) => {
  const tabs = [
    { id: 'camera', label: 'Caméra', icon: Camera },
    { id: 'timer', label: 'Chrono', icon: Compass },
    { id: 'exposure', label: 'Réglages', icon: Sliders },
    { id: 'gallery', label: 'Galerie', icon: ImageIcon, badge: photoCount > 0 ? photoCount : undefined },
    { id: 'kit', label: 'Guide Kit', icon: BookOpen },
    { id: 'assistant', label: 'Coach IA', icon: Bot },
    { id: 'apk', label: 'Build APK', icon: DownloadCloud, highlight: true },
  ];

  return (
    <nav className="bg-slate-950 border-t border-slate-800 px-1 py-1 flex items-center justify-around z-40 shrink-0">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onSelectTab(tab.id as TabType)}
            className={`relative flex flex-col items-center justify-center py-1.5 px-2 rounded-xl transition-all ${
              isActive
                ? 'text-amber-400 font-semibold bg-amber-500/10 border border-amber-500/30'
                : tab.highlight
                ? 'text-emerald-400 hover:text-emerald-300'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : tab.highlight ? 'text-emerald-400 animate-pulse' : 'text-slate-400'}`} />
            <span className="text-[9px] mt-0.5">{tab.label}</span>

            {tab.highlight && !isActive && (
              <span className="absolute -top-1 right-0 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-slate-950"></span>
            )}

            {tab.badge !== undefined && (
              <span className="absolute -top-1 -right-1 bg-amber-500 text-slate-950 text-[8px] font-bold px-1 rounded-full border border-slate-950">
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );
};
