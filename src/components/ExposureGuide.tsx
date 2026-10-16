import React from 'react';
import { Camera, Zap, ShieldAlert, Sparkles, Sliders, CheckCircle2 } from 'lucide-react';
import { EXPOSURE_PRESETS } from '../data/exposureCalculator';
import { EclipsePhase } from '../types';

interface ExposureGuideProps {
  onApplyPresetToCamera: (phase: EclipsePhase) => void;
}

export const ExposureGuide: React.FC<ExposureGuideProps> = ({ onApplyPresetToCamera }) => {
  return (
    <div className="flex-1 bg-slate-950 text-slate-100 p-3 overflow-y-auto space-y-3 text-xs">
      {/* Title Header */}
      <div className="bg-gradient-to-r from-amber-950/60 to-slate-900 border border-amber-500/30 p-3 rounded-2xl shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
            <Sliders className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <h2 className="font-bold text-slate-100 text-sm">Calculateur d'Exposition Solaire</h2>
            <p className="text-[10px] text-slate-400">
              Réglages optimaux ISO, Vitesse et EV selon le filtre SolarSnap et la phase.
            </p>
          </div>
        </div>
      </div>

      {/* Preset Cards Grid */}
      <div className="space-y-2.5">
        {EXPOSURE_PRESETS.map((preset) => (
          <div
            key={preset.phase}
            className="bg-slate-900 border border-slate-800 p-3 rounded-2xl space-y-2.5 hover:border-amber-500/40 transition-all shadow-sm"
          >
            {/* Title & Safety Badge */}
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-amber-300 text-xs">{preset.titleFr}</h3>
                <p className="text-[10px] text-slate-400 mt-0.5">{preset.descriptionFr}</p>
              </div>
              <span
                className={`text-[9px] px-2 py-0.5 rounded-full font-mono font-medium shrink-0 ml-2 ${
                  preset.requiresFilter
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                }`}
              >
                {preset.requiresFilter ? 'FILTRE REQUIS' : 'SANS FILTRE'}
              </span>
            </div>

            {/* Recommended Technical Settings Grid */}
            <div className="grid grid-cols-3 gap-2 font-mono text-[11px] bg-slate-950 p-2 rounded-xl border border-slate-800/80">
              <div className="text-center">
                <span className="text-[9px] text-slate-500 block">ISO</span>
                <strong className="text-amber-400">{preset.recommendedIso}</strong>
              </div>
              <div className="text-center">
                <span className="text-[9px] text-slate-500 block">OBTURATEUR</span>
                <strong className="text-amber-400">{preset.recommendedShutter}</strong>
              </div>
              <div className="text-center">
                <span className="text-[9px] text-slate-500 block">CORRECTION EV</span>
                <strong className="text-amber-400">{preset.recommendedEV > 0 ? `+${preset.recommendedEV}` : preset.recommendedEV} EV</strong>
              </div>
            </div>

            {/* Note */}
            <p className="text-[10px] text-slate-400 italic">
              💡 {preset.filterNoteFr}
            </p>

            {/* Apply Button */}
            <button
              onClick={() => onApplyPresetToCamera(preset.phase)}
              className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold py-1.5 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-colors shadow-sm text-xs"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Appliquer ces réglages à l'Appareil Photo</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
