import React, { useState } from 'react';
import { Camera, Download, Trash2, Share2, Info, Calendar, MapPin, Sliders, Check, Image as ImageIcon } from 'lucide-react';
import { CapturedPhoto } from '../types';

interface GalleryViewProps {
  photos: CapturedPhoto[];
  onDeletePhoto: (id: string) => void;
}

export const GalleryView: React.FC<GalleryViewProps> = ({ photos, onDeletePhoto }) => {
  const [selectedPhoto, setSelectedPhoto] = useState<CapturedPhoto | null>(photos[0] || null);
  const [showWatermark, setShowWatermark] = useState<boolean>(true);
  const [copiedNotification, setCopiedNotification] = useState<boolean>(false);

  if (photos.length === 0) {
    return (
      <div className="flex-1 bg-slate-950 text-slate-100 p-6 flex flex-col items-center justify-center text-center space-y-3">
        <div className="w-16 h-16 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-amber-500">
          <ImageIcon className="w-8 h-8" />
        </div>
        <h3 className="font-bold text-slate-200 text-sm">Aucune photo capturée</h3>
        <p className="text-xs text-slate-400 max-w-xs">
          Prenez vos premières photos d'éclipse depuis l'onglet Appareil Photo SolarSnap.
        </p>
      </div>
    );
  }

  const activePhoto = selectedPhoto || photos[0];

  // Export / Download Photo with Watermark Overlay
  const handleDownloadPhoto = () => {
    const link = document.createElement('a');
    link.download = `SolarSnap_Eclipse_${activePhoto.timestamp.replace(/:/g, '-')}.jpg`;
    link.href = activePhoto.dataUrl;
    link.click();
  };

  return (
    <div className="flex-1 bg-slate-950 text-slate-100 p-3 overflow-y-auto space-y-3 text-xs flex flex-col">
      {/* Photo Inspector Stage */}
      {activePhoto && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg flex flex-col">
          {/* Main Photo Canvas View with Optional Watermark Overlay */}
          <div className="relative w-full h-64 bg-black flex items-center justify-center overflow-hidden">
            <img
              src={activePhoto.dataUrl}
              alt="Cliché Éclipse"
              className="w-full h-full object-contain"
            />

            {/* Custom SolarSnap Watermark Overlay */}
            {showWatermark && (
              <div className="absolute bottom-2 left-2 right-2 bg-black/75 backdrop-blur border border-amber-500/30 p-2 rounded-xl text-[10px] font-mono text-amber-300 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-100">SOLARSNAP ECLIPSE APP KIT</div>
                  <div className="text-[9px] text-amber-400">{activePhoto.locationName} • {activePhoto.timestamp}</div>
                </div>
                <div className="text-right text-[9px] text-slate-300">
                  ISO {activePhoto.settings.iso} • {activePhoto.settings.zoom}x • {activePhoto.settings.shutterSpeed}
                </div>
              </div>
            )}
          </div>

          {/* EXIF Metadata Bar */}
          <div className="p-3 space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-100 text-xs block">
                  Éclipse Solaire - Phase {activePhoto.phase}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  Capturée le {activePhoto.timestamp}
                </span>
              </div>
              <button
                onClick={() => setShowWatermark(!showWatermark)}
                className={`px-2.5 py-1 rounded-lg border text-[10px] font-medium transition-colors ${
                  showWatermark ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}
              >
                Filigrane SolarSnap
              </button>
            </div>

            {/* Detailed EXIF stats */}
            <div className="grid grid-cols-4 gap-1.5 font-mono text-[10px] bg-slate-950 p-2 rounded-xl border border-slate-800">
              <div>
                <span className="text-slate-500 block text-[8px]">ZOOM</span>
                <strong className="text-amber-400">{activePhoto.settings.zoom}x</strong>
              </div>
              <div>
                <span className="text-slate-500 block text-[8px]">EXPOSITION</span>
                <strong className="text-amber-400">{activePhoto.settings.exposureEV} EV</strong>
              </div>
              <div>
                <span className="text-slate-500 block text-[8px]">ISO</span>
                <strong className="text-amber-400">{activePhoto.settings.iso}</strong>
              </div>
              <div>
                <span className="text-slate-500 block text-[8px]">FILTRE</span>
                <strong className="text-amber-400 font-sans text-[9px] truncate block">
                  {activePhoto.filterUsed.replace('_', ' ')}
                </strong>
              </div>
            </div>

            {/* Download & Delete Actions */}
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={handleDownloadPhoto}
                className="flex-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold py-1.5 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-colors shadow-sm"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Télécharger la Photo</span>
              </button>

              <button
                onClick={() => onDeletePhoto(activePhoto.id)}
                className="bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 p-2 rounded-xl transition-colors"
                title="Supprimer cette photo"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Thumbnails Grid */}
      <div className="space-y-1.5">
        <span className="font-semibold text-slate-300 text-[11px] block">
          Toutes les Captures ({photos.length}):
        </span>

        <div className="grid grid-cols-3 gap-2">
          {photos.map((item) => (
            <button
              key={item.id}
              onClick={() => setSelectedPhoto(item)}
              className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-transform active:scale-95 ${
                activePhoto?.id === item.id ? 'border-amber-400 ring-2 ring-amber-500/30' : 'border-slate-800 opacity-70 hover:opacity-100'
              }`}
            >
              <img src={item.dataUrl} alt="Vignette" className="w-full h-full object-cover" />
              <span className="absolute bottom-1 right-1 bg-black/80 font-mono text-[8px] text-amber-300 px-1 rounded">
                {item.settings.zoom}x
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
