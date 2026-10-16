export type EclipsePhase = 
  | 'c1_partial_start'
  | 'partial_progress'
  | 'bailys_beads'
  | 'diamond_ring'
  | 'totality_c2_c3'
  | 'prominences'
  | 'corona_inner'
  | 'corona_outer'
  | 'c4_partial_end';

export type FilterType = 
  | 'solar_snap_orange' // Solar Snap standard orange ND5.0
  | 'white_light'       // Neutral white solar filter
  | 'h_alpha'           // Hydrogen Alpha red
  | 'no_filter_totality'; // ONLY during totality!

export interface CameraSettings {
  zoom: number;            // 1.0 to 50.0
  exposureEV: number;      // -4.0 to +4.0
  iso: number;             // 50, 100, 200, 400, 800, 1600, 3200
  shutterSpeed: string;    // e.g. "1/4000s", "1/1000s", "1/250s", "1/60s", "1/15s", "1/4s", "1s"
  focusMode: 'auto' | 'infinity' | 'manual';
  manualFocusDistance: number; // 0 to 100
  gridType: 'none' | 'crosshair' | 'thirds' | 'solar_ring';
  filterType: FilterType;
  hdrBracketing: boolean;  // Auto Bracket -2, 0, +2 EV
}

export interface IntervalometerConfig {
  active: boolean;
  intervalSeconds: number; // e.g., 5, 10, 15, 30, 60
  totalPhotos: number;
  photosTaken: number;
  timeRemainingSec: number;
}

export interface CapturedPhoto {
  id: string;
  dataUrl: string;
  timestamp: string;
  phase: EclipsePhase;
  filterUsed: FilterType;
  settings: {
    zoom: number;
    exposureEV: number;
    iso: number;
    shutterSpeed: string;
  };
  locationName: string;
  lat: number;
  lng: number;
  notes?: string;
}

export interface EclipseLocationInfo {
  id: string;
  name: string;
  country: string;
  date: string; // ISO date e.g. "2026-08-12"
  type: 'Total' | 'Annular' | 'Partial';
  totalityDurationSec: number;
  c1Time: string; // HH:MM:SS
  c2Time: string;
  maxEclipseTime: string;
  c3Time: string;
  c4Time: string;
  sunAzimuthDeg: number;
  sunElevationDeg: number;
  lat: number;
  lng: number;
}

export interface ExposurePreset {
  phase: EclipsePhase;
  title: string;
  titleFr: string;
  descriptionFr: string;
  recommendedIso: number;
  recommendedShutter: string;
  recommendedEV: number;
  requiresFilter: boolean;
  filterNoteFr: string;
  iconName: string;
}

export interface AiChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  photoUrl?: string;
  isDiagnostic?: boolean;
}
