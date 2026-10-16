import React, { useState } from 'react';
import { MobileFrame } from './components/MobileFrame';
import { CameraView } from './components/CameraView';
import { EclipseTimerCompass } from './components/EclipseTimerCompass';
import { ExposureGuide } from './components/ExposureGuide';
import { GalleryView } from './components/GalleryView';
import { KitTutorial } from './components/KitTutorial';
import { AiAssistantModal } from './components/AiAssistantModal';
import { GithubApkModal } from './components/GithubApkModal';
import { Navbar, TabType } from './components/Navbar';
import { CapturedPhoto, EclipsePhase, CameraSettings, FilterType } from './types';
import { EXPOSURE_PRESETS } from './data/exposureCalculator';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('camera');
  const [selectedPhase, setSelectedPhase] = useState<EclipsePhase>('c1_partial_start');
  const [photos, setPhotos] = useState<CapturedPhoto[]>([]);
  const [isGithubModalOpen, setIsGithubModalOpen] = useState<boolean>(false);

  // Default camera settings
  const [cameraSettings, setCameraSettings] = useState<CameraSettings>({
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

  // Handle Photo Capture
  const handlePhotoCaptured = (newPhoto: CapturedPhoto) => {
    setPhotos((prev) => [newPhoto, ...prev]);
  };

  // Handle Delete Photo
  const handleDeletePhoto = (id: string) => {
    setPhotos((prev) => prev.filter((p) => p.id !== id));
  };

  // Apply Preset settings to camera
  const handleApplyPresetToCamera = (phase: EclipsePhase) => {
    setSelectedPhase(phase);
    const preset = EXPOSURE_PRESETS.find((p) => p.phase === phase);
    if (preset) {
      setCameraSettings((prev) => ({
        ...prev,
        iso: preset.recommendedIso,
        exposureEV: preset.recommendedEV,
        shutterSpeed: preset.recommendedShutter,
        filterType: preset.requiresFilter ? 'solar_snap_orange' : 'no_filter_totality',
      }));
    }
    setActiveTab('camera');
  };

  return (
    <MobileFrame 
      activeTabTitle={activeTab}
      onOpenGithubApkModal={() => setIsGithubModalOpen(true)}
    >
      <div className="flex-1 flex flex-col h-full bg-slate-950 overflow-hidden">
        {/* Main Active Tab Viewport */}
        {activeTab === 'camera' && (
          <CameraView
            onPhotoCaptured={handlePhotoCaptured}
            selectedPhase={selectedPhase}
            onPhaseChange={setSelectedPhase}
          />
        )}

        {activeTab === 'timer' && (
          <EclipseTimerCompass
            onSelectPhaseForCamera={handleApplyPresetToCamera}
          />
        )}

        {activeTab === 'exposure' && (
          <ExposureGuide
            onApplyPresetToCamera={handleApplyPresetToCamera}
          />
        )}

        {activeTab === 'gallery' && (
          <GalleryView
            photos={photos}
            onDeletePhoto={handleDeletePhoto}
          />
        )}

        {activeTab === 'kit' && <KitTutorial />}

        {activeTab === 'assistant' && (
          <AiAssistantModal
            currentPhase={selectedPhase}
            currentFilter={cameraSettings.filterType}
            cameraSettings={cameraSettings}
          />
        )}

        {activeTab === 'apk' && (
          <GithubApkModal
            isEmbedded
            onClose={() => setActiveTab('camera')}
          />
        )}

        {/* Global Modal when clicked from top buttons */}
        <GithubApkModal
          isOpen={isGithubModalOpen}
          onClose={() => setIsGithubModalOpen(false)}
        />

        {/* Navigation Bar */}
        <Navbar
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          photoCount={photos.length}
        />
      </div>
    </MobileFrame>
  );
}
