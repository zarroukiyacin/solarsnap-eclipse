import React from 'react';
import { ShieldCheck, Sun, CheckCircle, AlertTriangle, Smartphone, Sparkles, HelpCircle } from 'lucide-react';

export const KitTutorial: React.FC = () => {
  return (
    <div className="flex-1 bg-slate-950 text-slate-100 p-3 overflow-y-auto space-y-3 text-xs">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-950/60 to-slate-900 border border-amber-500/30 p-3 rounded-2xl shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
            <Smartphone className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <h2 className="font-bold text-slate-100 text-sm">Guide du Kit Filtre SolarSnap</h2>
            <p className="text-[10px] text-slate-400">
              Installation du filtre velcro et consignes de sécurité ISO 12312-2.
            </p>
          </div>
        </div>
      </div>

      {/* Step 1: Velcro Mount */}
      <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-2xl space-y-2">
        <div className="flex items-center gap-2 text-amber-300 font-semibold text-xs">
          <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 font-bold flex items-center justify-center text-[10px]">
            1
          </span>
          <span>Fixation du Velcro sur le Téléphone</span>
        </div>
        <p className="text-[11px] text-slate-300 leading-relaxed">
          Collez le disque velcro adhésif fourni autour des objectifs photo arrière de votre smartphone. Assurez-vous que la lentille principale est bien centrée.
        </p>
        <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-[10px] text-amber-400/90 font-mono">
          ✓ Compatible avec les smartphones multi-objectifs (iPhone, Samsung Galaxy, Pixel, Xiaomi).
        </div>
      </div>

      {/* Step 2: Filter Placement */}
      <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-2xl space-y-2">
        <div className="flex items-center gap-2 text-amber-300 font-semibold text-xs">
          <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 font-bold flex items-center justify-center text-[10px]">
            2
          </span>
          <span>Mise en place du Filtre Solaire SolarSnap</span>
        </div>
        <p className="text-[11px] text-slate-300 leading-relaxed">
          Pressez fermement le filtre SolarSnap contre le disque velcro. Le filtre doit recouvrir intégralement les capteurs photos.
        </p>
        <div className="bg-rose-500/10 border border-rose-500/30 p-2.5 rounded-xl text-[10px] text-rose-300 font-semibold">
          ⚠️ Vérifiez qu'aucune fuite de lumière directe ne passe sur le côté de l'objectif.
        </div>
      </div>

      {/* Step 3: Safety Directives */}
      <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-2xl space-y-2">
        <div className="flex items-center gap-2 text-amber-300 font-semibold text-xs">
          <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 font-bold flex items-center justify-center text-[10px]">
            3
          </span>
          <span>Règles d'Or de Sécurité Oculaire</span>
        </div>

        <ul className="space-y-1.5 text-[11px] text-slate-300">
          <li className="flex items-start gap-1.5">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
            <span>Ne regardez JAMAIS le Soleil directement sans lunettes certifiées ISO 12312-2.</span>
          </li>
          <li className="flex items-start gap-1.5">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
            <span>Gardez le filtre SolarSnap sur le téléphone pendant TOUTES les phases partielles (C1, C4).</span>
          </li>
          <li className="flex items-start gap-1.5">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
            <span>Retirez le filtre UNIQUEMENT pendant la totalité exacte (C2 à C3). Remettez-le dès le premier rayon!</span>
          </li>
        </ul>
      </div>

      {/* Certification Badge */}
      <div className="bg-emerald-950/40 border border-emerald-500/40 p-3 rounded-2xl flex items-center gap-3">
        <ShieldCheck className="w-8 h-8 text-emerald-400 shrink-0" />
        <div>
          <div className="font-bold text-emerald-200 text-xs">Certification Internationale ISO 12312-2</div>
          <div className="text-[10px] text-emerald-300/80 mt-0.5">
            Filtre solaire certifié conforme pour l'observation et la photographie directe du soleil.
          </div>
        </div>
      </div>
    </div>
  );
};
