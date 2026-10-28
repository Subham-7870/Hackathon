import React, { useState, useMemo, useEffect } from 'react';
import { TrainSchedule, SolvedBlock, DefectItem, RecommendedRoute } from '../types';
import { initialDefects, initialRecommendedRoutes } from '../data/defectsAndRoutes';
import { LiveTelemetryStream } from '../services/api';
import { 
  Radio, 
  ShieldAlert, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Database, 
  FileText, 
  Sparkles, 
  ArrowRight, 
  Zap, 
  Activity, 
  Sliders, 
  Eye, 
  Maximize2, 
  RefreshCw,
  Gauge,
  Layers,
  MapPin,
  ChevronRight,
  TrendingUp,
  Flame,
  AlertCircle,
  Play,
  Pause,
  FastForward,
  ZoomIn,
  ZoomOut
} from 'lucide-react';
import { LiveFeedController } from './LiveFeedController';
import { CautionOrderModal } from './CautionOrderModal';
import { CustomBlockage } from './CustomBlockageModal';
import { useLanguage } from '../context/LanguageContext';
import { getLocalizedTrainName } from '../i18n/trainTranslations';

interface SchematicRailMapProps {
  trains: TrainSchedule[];
  blocks: SolvedBlock[];
  selectedSector: string;
  selectedTrainNumber?: string;
  onSelectTrain: (train: TrainSchedule | null) => void;
  currentTimeMinutes: number;
  onTimeChange: (minutes: number) => void;
  isPlaying: boolean;
  onTogglePlay: () => void;
  simulationSpeed?: number;
  onSpeedChange?: (speed: number) => void;
  liveStreamData?: LiveTelemetryStream | null;
  isLiveMode?: boolean;
  onToggleLiveMode?: () => void;
  isBlockActive?: boolean;
  onToggleBlock?: (pn?: string) => void;
  onRequestPN?: (action: any) => void;
  customBlockages?: CustomBlockage[];
  onRemoveCustomBlockage?: (blockId: string) => void;
}

interface LinearStation {
  code: string;
  name: string;
  km: number;
  x: number;
  isBlockZone?: boolean;
  classification: string;
  mainLines: number;
  loopLines: number;
  remarks: string;
}

// Authentic Engineering Scale Plan (ESP) Stations for Ghaziabad – Aligarh Section (106.1 RKM)
// Spacious 2100px canvas coordinates: 380px distance between Somna and Aligarh for zero congestion!
const STATIONS: LinearStation[] = [
  { code: 'GZB', name: 'Ghaziabad Jn', km: 20.0, x: 140, classification: 'Major Junction', mainLines: 4, loopLines: 6, remarks: 'Alignments to Delhi, Meerut & Moradabad; E-Loco Shed' },
  { code: 'MIU', name: 'Maripat', km: 30.0, x: 380, classification: 'Block Station', mainLines: 3, loopLines: 2, remarks: '4-Aspect ABS Territory; Common Loop' },
  { code: 'DER', name: 'Dadri (EDFC Hub)', km: 37.0, x: 680, isBlockZone: true, classification: 'Freight Hub / Node', mainLines: 3, loopLines: 4, remarks: 'Point #4B Crossover; Primary EDFC Interchange & TRD Work' },
  { code: 'DKDE', name: 'Dankaur', km: 54.0, x: 1000, isBlockZone: true, classification: 'Block Station', mainLines: 3, loopLines: 2, remarks: 'Point #6A Universal Turnout; Active TRD 25kV OHE Block Zone' },
  { code: 'KRJ', name: 'Khurja Jn', km: 83.0, x: 1360, isBlockZone: true, classification: 'Major Junction', mainLines: 3, loopLines: 5, remarks: 'Hapur/Meerut Branch; Active EDFC Rail Grinding & USFD Block' },
  { code: 'SOM', name: 'Somna', km: 105.0, x: 1680, isBlockZone: true, classification: 'Block Station', mainLines: 3, loopLines: 2, remarks: 'Point #12A Universal Crossover; Active P-Way Block Zone' },
  { code: 'ALJN', name: 'Aligarh Jn', km: 126.0, x: 2040, classification: 'Major Junction / Terminal', mainLines: 3, loopLines: 6, remarks: 'Point #14B Re-entry; Chandausi & Bareilly Branch' },
];

export const SchematicRailMap: React.FC<SchematicRailMapProps> = ({
  trains,
  blocks,
  selectedSector,
  selectedTrainNumber,
  onSelectTrain,
  currentTimeMinutes,
  onTimeChange,
  isPlaying,
  onTogglePlay,
  simulationSpeed = 4,
  onSpeedChange,
  liveStreamData,
  isLiveMode = true,
  onToggleLiveMode,
  isBlockActive: propIsBlockActive,
  onToggleBlock: propOnToggleBlock,
  onRequestPN,
  customBlockages = [],
  onRemoveCustomBlockage,
}) => {
  const { t, language } = useLanguage();
  const [recommendedRoutes, setRecommendedRoutes] = useState<RecommendedRoute[]>(initialRecommendedRoutes);
  const [selectedStation, setSelectedStation] = useState<LinearStation | null>(STATIONS[5]); // Somna by default
  const [overrideBlockState, setOverrideBlockState] = useState<boolean>(true);
  const [isFeedControllerOpen, setIsFeedControllerOpen] = useState(false);
  const [isCautionOrderOpen, setIsCautionOrderOpen] = useState(false);
  
  // Tactical Lookahead Mode: 0 (Live), 15 (+15m), 30 (+30m), 60 (+60m)
  const [lookaheadMinutes, setLookaheadMinutes] = useState<number>(0);
  
  // Viewport Focus Mode: 'FULL' | station code
  const [viewFocus, setViewFocus] = useState<string>('FULL');

  // Zoom / Scale Level: 'fit' (1200px) | 'large' (1850px) | 'huge' (2500px)
  const [zoomLevel, setZoomLevel] = useState<'fit' | 'large' | 'huge'>('large');

  // Live ticking master clock
  const [wallClock, setWallClock] = useState<string>('11:54:25');

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setWallClock(now.toTimeString().split(' ')[0]);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleApplyRoute = (routeId: string) => {
    setRecommendedRoutes(prev => prev.map(r => r.id === routeId ? { ...r, applied: true } : r));
  };

  const formatTime = (totalMinutes: number) => {
    const hours = Math.floor(totalMinutes / 60) % 24;
    const mins = Math.floor(totalMinutes % 60);
    return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
  };

  // Block is permanently active by default, or explicitly toggled by the Section Controller
  const isBlockActive = propIsBlockActive !== undefined ? propIsBlockActive : (overrideBlockState !== false);
  const isBlockPast = !isBlockActive;

  const handleToggleBlock = () => {
    if (propOnToggleBlock) {
      propOnToggleBlock();
    } else {
      setOverrideBlockState(prev => !prev);
    }
  };

  // Effective evaluated time (current + lookahead)
  const effectiveTimeMinutes = currentTimeMinutes + lookaheadMinutes;

  // Compute live train position along the 106.1 RKM section
  const trainTrajectories = useMemo(() => {
    const baseTrajectories = trains
      .map(train => {
        const DOWN_TRAIN_NUMS = ['22436', '12004', '12276', '12302'];
        const UP_TRAIN_NUMS = ['12401', '12582', '12560'];
        const FREIGHT_TRAIN_NUMS = ['BOXN-4021', 'BTPN-3312', 'BCN-9104'];

        const isSuperfast = train.train_type === 'Superfast';
        const isExpress = train.train_type === 'Express';
        const isFreight = FREIGHT_TRAIN_NUMS.includes(train.train_number) || train.train_type === 'Freight';
        const isThirdLine = train.assigned_line ? (train.assigned_line.toLowerCase().includes('third') || train.assigned_line.toLowerCase().includes('3rd')) : false;
        const isEDFC = train.assigned_line ? train.assigned_line.toLowerCase().includes('edfc') : false;
        const isDown = DOWN_TRAIN_NUMS.includes(train.train_number) || (train.assigned_line ? train.assigned_line.toLowerCase().includes('down') : false) || (isSuperfast && !isThirdLine && !isEDFC);
        const isUp = UP_TRAIN_NUMS.includes(train.train_number) || (train.assigned_line ? train.assigned_line.toLowerCase().includes('up') : false) || (!isDown && !isFreight && !isThirdLine && !isEDFC);

        const startMin = train.entry_time_minutes;
        const duration = train.normal_transit_minutes + train.delay_minutes;
        
        let progress = (effectiveTimeMinutes - startMin) / duration;
        progress = Math.max(0, Math.min(1, progress));

        const isRouteApplied = recommendedRoutes.find(r => r.train_number === train.train_number)?.applied;
        const isLooped = train.assigned_line?.includes('Loop') || (isFreight && isRouteApplied);

        // Compute real-world X along the 106.1 RKM section (KM 20.0 to KM 126.0)
        const dbTrain = liveStreamData?.trains?.find(t => t.train_number === train.train_number);
        let trainKm: number;
        if (isLiveMode && dbTrain) {
          trainKm = dbTrain.current_km;
        } else if (train.initial_km !== undefined) {
          if (isUp) {
            trainKm = Math.max(20.0, train.initial_km - progress * (train.initial_km - 20.0));
          } else {
            trainKm = Math.min(126.0, train.initial_km + progress * (126.0 - train.initial_km));
          }
        } else {
          trainKm = 20.0 + progress * 106.1;
        }
        
        // Add lookahead progress if lookahead is engaged
        if (lookaheadMinutes > 0 && dbTrain) {
          const projectedKmDelta = (dbTrain.current_speed_kmh / 60) * lookaheadMinutes;
          trainKm += projectedKmDelta;
        }

        const clampedKm = Math.max(20.0, Math.min(126.0, trainKm));
        // Maps 20.0 KM (Ghaziabad, x=140) to 126.0 KM (Aligarh, x=2040) across 2200px canvas
        let x = 140.0 + ((clampedKm - 20.0) / (126.0 - 20.0)) * (2040.0 - 140.0);

        // Generous 200px Vertical Spacing Between Running Lines (Zero Congestion & Total Clarity!):
        // y: 160 = Down Mainline (160 km/h)
        // y: 360 = Bidirectional 3rd Line (130 km/h)
        // y: 560 = Up Mainline (160 km/h)
        // y: 760 = Eastern Dedicated Freight Corridor (EDFC, 75 km/h)
        // y: 830 = Khurja Freight Bypass Siding Loop
        let y = isEDFC ? 760 : isThirdLine ? 360 : isDown ? 160 : 560;
        let speedKmh = train.speed_kmh || (isDown ? 130 : isUp ? 110 : 65);
        let maxPermittedSpeed = train.speed_kmh || (isDown ? 160 : isUp ? 110 : 75);
        let statusText = train.status;

        if (isFreight) {
          if (isBlockActive) {
            // EDFC Freight Maintenance Block near Khurja (x=1200 to x=1420, y=760)
            if (x < 1170) {
              y = 760;
              speedKmh = 65;
              statusText = 'EDFC HEAVY HAUL (25T AXLE) · CLEAR RUN';
            } else if (x >= 1170 && x <= 1230) {
              // Smooth turnout into Khurja Freight Siding Loop (y=830)
              const t = (x - 1170) / (1230 - 1170);
              y = 760 + (830 - 760) * (0.5 - 0.5 * Math.cos(t * Math.PI));
              speedKmh = Math.min(speedKmh, 30);
              statusText = 'DIVERTING TO KHURJA FREIGHT LOOP (PSR 30)';
            } else if (x > 1230 && x < 1430) {
              // Running securely on Khurja Freight Siding Loop (y=830)
              y = 830;
              speedKmh = Math.min(speedKmh, 30);
              statusText = 'KHURJA FREIGHT LOOP · CLEAR OF USFD BLOCK';
            } else if (x >= 1430 && x <= 1490) {
              // Rejoining EDFC Mainline
              const t = (x - 1430) / (1490 - 1430);
              y = 830 - (830 - 760) * (0.5 - 0.5 * Math.cos(t * Math.PI));
              speedKmh = Math.min(speedKmh, 30);
              statusText = 'REJOINING EDFC MAINLINE (KHURJA EAST)';
            } else {
              y = 760;
              speedKmh = 65;
              statusText = 'EDFC HEAVY HAUL (25T AXLE) · CLEAR RUN';
            }
          } else {
            y = 760;
            speedKmh = 65;
            statusText = 'EDFC HEAVY HAUL (25T AXLE) · CLEAR RUN';
          }
        } else if (isUp) {
          if (isBlockActive) {
            // Up Mainline TRD 25kV OHE Block between Dankaur (x=1040) and Dadri (x=680)
            // Trains run Westbound: x decreases from 2040 to 140
            if (x > 1040) {
              y = 560;
              speedKmh = 110;
              statusText = 'UP MAINLINE · RUN-THROUGH CLEAR';
            } else if (x <= 1040 && x >= 960) {
              // Diverting via Point #6A onto Bidirectional 3rd Line (y=360)
              const t = (1040 - x) / (1040 - 960);
              y = 560 - (560 - 360) * (0.5 - 0.5 * Math.cos(t * Math.PI));
              speedKmh = Math.min(speedKmh, 50);
              statusText = 'DIVERTING VIA PT #6A ➔ 3RD LINE (PSR 50 KM/H)';
            } else if (x < 960 && x > 760) {
              // Running securely on 3rd Line bypass (y=360) - clear of TRD Block on Up Main
              y = 360;
              speedKmh = Math.min(speedKmh, 75);
              statusText = '3RD LINE BYPASS · CLEAR OF DANKAUR-DADRI TRD BLOCK';
            } else if (x <= 760 && x >= 680) {
              // Re-entering Up Mainline via Point #4B at Dadri
              const t = (760 - x) / (760 - 680);
              y = 360 + (560 - 360) * (0.5 - 0.5 * Math.cos(t * Math.PI));
              speedKmh = Math.min(speedKmh, 50);
              statusText = 'RE-ENTERING UP MAINLINE (PT #4B DADRI)';
            } else {
              y = 560;
              speedKmh = 110;
              statusText = 'UP MAINLINE · RUNNING TO GHAZIABAD';
            }
          } else {
            y = 560;
            speedKmh = 110;
            statusText = 'UP MAINLINE · RUN-THROUGH CLEAR';
          }
        } else {
          // Eastbound Down Mainline Passenger / Superfast Trains:
          if (isBlockActive) {
            // Block is active on Down Mainline between x=1700 and x=1960.
            // Point #12A begins at x=1620 and reaches 3rd Line (y=360) at x=1720.
            // Point #14B begins at x=1960 and returns to Down Main (y=160) at x=2020.
            if (x < 1620) {
              y = 160;
              if (x > 1480) {
                statusText = 'APPROACHING SOMNA (ATTENTION: ROUTE SET VIA PT #12A)';
              } else {
                statusText = 'DOWN MAINLINE · HIGH-SPEED RUN';
              }
            } else if (x >= 1620 && x <= 1720) {
              // Smooth S-curve divergence via Point #12A onto Bidirectional 3rd Line (y=360)
              const t = (x - 1620) / (1720 - 1620);
              y = 160 + (360 - 160) * (0.5 - 0.5 * Math.cos(t * Math.PI));
              statusText = 'DIVERTING VIA PT #12A ➔ 3RD LINE (PSR 50 KM/H)';
              speedKmh = Math.min(speedKmh, 50);
            } else if (x > 1720 && x < 1960) {
              // Running securely on 3rd Line bypass (y=360) - completely clear of Down Main P-Way block!
              y = 360;
              statusText = '3RD LINE BYPASS · CLEAR OF P-WAY WORK';
              speedKmh = Math.min(speedKmh, 85);
            } else if (x >= 1960 && x <= 2020) {
              // Re-entering Down Mainline at Aligarh platform via Point #14B
              const t = (x - 1960) / (2020 - 1960);
              y = 360 - (360 - 160) * (0.5 - 0.5 * Math.cos(t * Math.PI));
              statusText = 'RE-ENTERING DOWN MAINLINE (PT #14B)';
              speedKmh = Math.min(speedKmh, 50);
            } else {
              y = 160;
              speedKmh = 130;
              statusText = 'DOWN MAINLINE (ALJN CLEAR RUN)';
            }
          } else {
            y = 160;
            speedKmh = 130;
            statusText = isBlockPast ? 'DOWN MAINLINE (TSR 30 KM/H CAUTION)' : 'DOWN MAINLINE · HIGH-SPEED RUN';
          }
        }

        if (isLiveMode && dbTrain && lookaheadMinutes === 0) {
          speedKmh = dbTrain.current_speed_kmh;
          maxPermittedSpeed = dbTrain.max_permitted_speed || maxPermittedSpeed;
          if (dbTrain.is_diverted) {
            statusText = 'DIVERTED ONTO 3RD LINE (KAVACH PSR 50)';
          }
        }

        // Check dynamic custom blockages on current line
        const matchedCustomBlock = customBlockages?.find(cb => {
          const minKm = Math.min(cb.start_km, cb.end_km);
          const maxKm = Math.max(cb.start_km, cb.end_km);
          const onSameLine = (isDown && cb.track_line.toLowerCase().includes('down')) ||
                             (isUp && cb.track_line.toLowerCase().includes('up')) ||
                             (isThirdLine && (cb.track_line.toLowerCase().includes('third') || cb.track_line.toLowerCase().includes('3rd'))) ||
                             (isEDFC && cb.track_line.toLowerCase().includes('edfc'));
          return onSameLine && clampedKm >= (minKm - 1.5) && clampedKm <= (maxKm + 1.5);
        });

        if (matchedCustomBlock) {
          if (matchedCustomBlock.form_type === 'CAUTION_T409') {
            speedKmh = Math.min(speedKmh, matchedCustomBlock.speed_restriction_kmh || 30);
            statusText = `CAUTION T/409 (PSR ${matchedCustomBlock.speed_restriction_kmh} KM/H) · PN #${matchedCustomBlock.private_number}`;
          } else {
            if (!isThirdLine) {
              y = 360; // Divert to 3rd Line bypass
              speedKmh = Math.min(speedKmh, 50);
              statusText = `DIVERTED ➔ 3RD LINE · AVOID ${matchedCustomBlock.form_type} (PN #${matchedCustomBlock.private_number})`;
            } else {
              speedKmh = 0;
              statusText = `HELD AT RED SIGNAL · BLOCK IN SECTION (${matchedCustomBlock.form_type})`;
            }
          }
        }

        return {
          ...train,
          currentX: x,
          currentY: y,
          clampedKm,
          progress,
          speedKmh,
          maxPermittedSpeed,
          statusText,
          isLooped,
          isRouteApplied,
          dbTelemetry: dbTrain,
          tdElevation: 0
        };
      });

    // Anti-Collision & Visual Overlap Prevention
    // Group trains by line elevation and alternate TD card positions if closer than 190px
    const lanes = [160, 360, 560, 760, 830];
    lanes.forEach(laneY => {
      const laneTrains = baseTrajectories
        .filter(t => Math.abs(t.currentY - laneY) < 45)
        .sort((a, b) => a.currentX - b.currentX);
      for (let i = 1; i < laneTrains.length; i++) {
        const prev = laneTrains[i - 1];
        const curr = laneTrains[i];
        if (curr.currentX - prev.currentX < 190) {
          curr.tdElevation = (prev.tdElevation || 0) + 1;
        }
      }
    });

    return baseTrajectories;
  }, [trains, effectiveTimeMinutes, recommendedRoutes, isBlockActive, liveStreamData, isLiveMode, lookaheadMinutes, customBlockages]);

  // Dynamic SVG ViewBox calculation based on viewFocus (Generous 2200 x 900 canvas, 200px lane gaps)
  const svgViewBox = useMemo(() => {
    if (viewFocus === 'GZB') return '0 0 900 900';
    if (viewFocus === 'DER') return '300 0 900 900';
    if (viewFocus === 'DKDE') return '600 0 900 900';
    if (viewFocus === 'KRJ') return '950 0 900 900';
    if (viewFocus === 'SOM') return '1420 0 800 900';
    if (viewFocus === 'ALJN') return '1350 0 850 900';
    return '0 0 2200 900'; // FULL PANORAMA (2200 x 900) - Uncongested 200px track separation!
  }, [viewFocus]);

  return (
    <div className="space-y-4 select-none">
      {/* ========================================================================= */}
      {/* 1. REAL-TIME SECTION CONTROLLER MASTER DESK TOOLBAR                      */}
      {/* ========================================================================= */}
      <div className="bg-[#0A0E1A] rounded-2xl border border-slate-800 p-3.5 shadow-xl flex flex-wrap items-center justify-between gap-4">
        {/* Left: Operational Status & Master Telemetry Clock */}
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-sm font-bold shadow-inner">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-sm shadow-emerald-400"></span>
            <span>{t.liveCtcDispatch}</span>
            <span className="text-xs text-emerald-400/80 font-mono font-normal">| RTIS 400ms</span>
          </div>

          <div className="flex items-center gap-2 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-700/80 text-sm font-mono">
            <Clock className="w-3.5 h-3.5 text-sky-400" />
            <span className="text-white font-extrabold">{wallClock} IST</span>
            <span className="text-slate-500 text-xs">({formatTime(currentTimeMinutes)} SIM)</span>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-sm text-slate-400">
            <span className="text-slate-500">{t.jurisdictionLabel}:</span>
            <span className="font-bold text-slate-200">NCR / Prayagraj Div</span>
            <span className="text-slate-600">•</span>
            <span className="font-mono text-cyan-400">GZB (KM 20) ➔ ALJN (KM 126)</span>
          </div>
        </div>

        {/* Center-Left: Simulation Playback & Speed Accelerator Bar */}
        <div className="flex items-center gap-2 bg-slate-900/90 px-3 py-1.5 rounded-xl border border-slate-700/80 shadow-inner">
          <button
            onClick={onTogglePlay}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-sm font-black transition-all ${
              isPlaying
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/40 ring-1 ring-emerald-300'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
            }`}
            title="Toggle Live Telemetry Simulation Playback"
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
            <span>{isPlaying ? 'RUNNING' : 'PAUSED'}</span>
          </button>

          {/* Speed Multipliers */}
          <div className="flex items-center gap-1 pl-1 border-l border-slate-800">
            <FastForward className="w-3 h-3 text-cyan-400 mr-0.5" />
            {[1, 4, 8, 16, 32].map((spd) => (
              <button
                key={spd}
                onClick={() => onSpeedChange?.(spd)}
                className={`px-2 py-0.5 rounded text-[13px] font-black font-mono transition-all ${
                  simulationSpeed === spd
                    ? 'bg-cyan-500 text-slate-950 shadow-sm shadow-cyan-500/50'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
                title={`Run Simulation at ${spd}x speed`}
              >
                {spd}x
              </button>
            ))}
          </div>
        </div>

        {/* Center: Tactical Lookahead Horizon Switcher */}
        <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
          <span className="text-xs text-slate-400 font-bold px-2">{t.horizonLabel}:</span>
          <button
            onClick={() => setLookaheadMinutes(0)}
            className={`px-3 py-1 rounded-lg text-sm font-extrabold transition-all ${
              lookaheadMinutes === 0
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            ● {t.currentLive}
          </button>
          <button
            onClick={() => setLookaheadMinutes(15)}
            className={`px-2.5 py-1 rounded-lg text-sm font-bold transition-all ${
              lookaheadMinutes === 15
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            {t.lookahead15}
          </button>
          <button
            onClick={() => setLookaheadMinutes(30)}
            className={`px-2.5 py-1 rounded-lg text-sm font-bold transition-all ${
              lookaheadMinutes === 30
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            {t.lookahead30}
          </button>
          <button
            onClick={() => setLookaheadMinutes(60)}
            className={`px-2.5 py-1 rounded-lg text-sm font-bold transition-all ${
              lookaheadMinutes === 60
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            {t.lookahead60}
          </button>
        </div>

        {/* Right: Operational Enterprise Command Triggers */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Statutory Form T/409 Caution Order */}
          <button
            onClick={() => setIsCautionOrderOpen(true)}
            className="px-3 py-1.5 rounded-xl text-sm font-extrabold bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1.5 shadow-sm transition-all"
            title="Open North Central Railway Form T/409 Caution Order Dialog"
          >
            <FileText className="w-3.5 h-3.5 text-amber-400" />
            <span>{t.cautionOrderBtn}</span>
          </button>

          {/* Form T/351 Disconnection Notice Lock */}
          <button
            onClick={() => setOverrideBlockState(prev => !prev)}
            className={`px-3 py-1.5 rounded-xl text-sm font-extrabold flex items-center gap-1.5 transition-all border ${
              overrideBlockState
                ? 'bg-rose-950 text-rose-300 border-rose-600 shadow-md shadow-rose-950/50 animate-pulse'
                : 'bg-emerald-950 text-emerald-300 border-emerald-600'
            }`}
            title="Toggle Form T/351 S&T Disconnection on Somna Point #12A"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>{overrideBlockState ? t.t351Disconnected : t.t351Reconnected}</span>
          </button>

          {/* CRIS Database Console */}
          <button
            onClick={() => setIsFeedControllerOpen(true)}
            className="px-3 py-1.5 rounded-xl text-sm font-extrabold bg-slate-900 hover:bg-slate-800 text-sky-300 border border-sky-500/40 flex items-center gap-1.5 shadow-md shadow-sky-950/40 transition-all"
            title="Open Decoupled CRIS / RTIS / COA Master Telemetry Console"
          >
            <Database className="w-3.5 h-3.5 text-sky-400" />
            <span>{t.crisDbBtn}</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. SECTION TRAIN BERTHING & TELEMETRY ROSTER (COMPACT TACTICAL DESK)      */}
      {/* ========================================================================= */}
      <div className="bg-[#0A0E1A] rounded-2xl border border-slate-800/90 p-3.5 shadow-xl">
        <div className="flex items-center justify-between gap-4 mb-2.5 px-1">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-sky-400" />
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-200">
              {t.fleetTelemetryTitle}
            </h3>
            <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 text-xs font-mono">
              {trainTrajectories.length} {t.trainsInSection}
            </span>
          </div>

          <div className="flex items-center gap-4 text-sm font-mono text-slate-400">
            <span>{t.punctualityScore}: <strong className="text-emerald-400">98.4%</strong></span>
            <span>{t.kavachSupervision}: <strong className="text-sky-400">100%</strong></span>
          </div>
        </div>

        {/* High-density Train Roster Strip */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm font-mono">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-[13px] font-bold">
                <th className="pb-2 pl-2">{t.colTrainName}</th>
                <th className="pb-2">{t.colConsist}</th>
                <th className="pb-2">{t.colLocation}</th>
                <th className="pb-2">{t.colLine}</th>
                <th className="pb-2">{t.colSpeed}</th>
                <th className="pb-2">{t.colAspect}</th>
                <th className="pb-2">{t.colKavach}</th>
                <th className="pb-2">{t.colVariance}</th>
                <th className="pb-2 text-right pr-2">{t.colAction}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850">
              {trainTrajectories.map((train) => {
                const isSelected = selectedTrainNumber === train.train_number;
                const isSuperfast = train.train_type === 'Superfast';
                const isFreight = train.train_type === 'Freight';
                const dbT = train.dbTelemetry;

                const aspectColor = 
                  dbT?.signal_aspect === 'GREEN' ? 'text-emerald-400 bg-emerald-950/60 border-emerald-500/40' :
                  dbT?.signal_aspect === 'DOUBLE_YELLOW' ? 'text-yellow-300 bg-yellow-950/60 border-yellow-500/40' :
                  dbT?.signal_aspect === 'YELLOW' ? 'text-amber-400 bg-amber-950/60 border-amber-500/40' :
                  'text-rose-400 bg-rose-950/60 border-rose-500/40';

                return (
                  <tr
                    key={train.train_number}
                    onClick={() => onSelectTrain(train)}
                    className={`cursor-pointer transition-all ${
                      isSelected 
                        ? 'bg-sky-950/40 text-white font-bold' 
                        : 'hover:bg-slate-900/60 text-slate-300'
                    }`}
                  >
                    <td className="py-2.5 pl-2">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded font-black text-xs shrink-0 ${
                          isSuperfast ? 'bg-sky-950 text-sky-300 border border-sky-500/40' :
                          isFreight ? 'bg-amber-950 text-amber-300 border border-amber-500/40' :
                          'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                        }`}>
                          #{train.train_number}
                        </span>
                        <span className="font-sans font-bold text-slate-200 truncate max-w-[180px]">
                          {getLocalizedTrainName(train.train_name, language, train.train_number)}
                        </span>
                      </div>
                    </td>

                    <td className="py-2.5 text-slate-400 text-xs">
                      {dbT?.loco_type || (isSuperfast ? 'WAP-7 (GZB)' : isFreight ? 'Twin WAG-9HC' : 'WAP-7')}
                    </td>

                    <td className="py-2.5">
                      <span className="text-cyan-300 font-extrabold">KM {train.clampedKm.toFixed(1)}</span>
                      <span className="text-slate-500 text-xs ml-1">
                        ({train.clampedKm < 37 ? 'Near Dadri' : train.clampedKm < 83 ? 'Near Dankaur' : train.clampedKm < 118 ? 'Somna Approach' : 'Aligarh Section'})
                      </span>
                    </td>

                    <td className="py-2.5">
                      {train.statusText.includes('DIVERT') ? (
                        <div className="flex flex-col gap-0.5">
                          <span className="px-2 py-0.5 rounded text-xs font-extrabold bg-amber-950/90 text-amber-300 border border-amber-500/50 w-fit whitespace-nowrap">
                            3rd Line
                          </span>
                          <span className="text-[10px] text-rose-400 font-bold whitespace-nowrap">
                            ↳ Diverted (Pt #12A)
                          </span>
                        </div>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-xs font-bold bg-slate-800 text-slate-300 whitespace-nowrap">
                          {train.assigned_line}
                        </span>
                      )}
                    </td>

                    <td className="py-2.5">
                      <span className="text-white font-bold text-sm">{typeof train.speedKmh === 'number' ? train.speedKmh.toFixed(0) : train.speedKmh}</span>
                      <span className="text-slate-500 text-xs"> / {train.maxPermittedSpeed} km/h</span>
                    </td>

                    <td className="py-2">
                      <span className={`px-2 py-0.5 rounded text-xs font-extrabold border ${aspectColor}`}>
                        {dbT?.signal_aspect || 'GREEN'}
                      </span>
                    </td>

                    <td className="py-2 text-[13px] text-slate-300">
                      <span className="text-sky-400 font-bold">{t.sil4Supervised}</span>
                      <span className="text-slate-500 text-xs block">Target: {dbT?.kavach_target_distance_m || 2400}m</span>
                    </td>

                    <td className="py-2">
                      {train.delay_minutes > 0 ? (
                        <span className="text-amber-400 font-bold">+{train.delay_minutes}m {t.delayText}</span>
                      ) : (
                        <span className="text-emerald-400 font-bold">{t.onTime}</span>
                      )}
                    </td>

                    <td className="py-2 text-right pr-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectTrain(train);
                          // Jump zoom to station near this train
                          if (train.clampedKm < 35) setViewFocus('GZB');
                          else if (train.clampedKm < 50) setViewFocus('DER');
                          else if (train.clampedKm < 75) setViewFocus('DKDE');
                          else if (train.clampedKm < 95) setViewFocus('KRJ');
                          else if (train.clampedKm < 118) setViewFocus('SOM');
                          else setViewFocus('ALJN');
                        }}
                        className="px-2 py-1 rounded bg-slate-800 hover:bg-sky-600 hover:text-white text-slate-300 text-xs font-extrabold transition-all"
                      >
                        {t.focusBtn}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. HIGH-FIDELITY UNCONGESTED PANORAMIC SCHEMATIC DISPLAY (1600 x 600)     */}
      {/* ========================================================================= */}
      <div className="bg-[#070B14] rounded-3xl border border-slate-800/90 p-5 shadow-2xl overflow-hidden select-none space-y-4">
        {/* Top Viewport Navigator & Station Focus Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm text-slate-400 font-bold flex items-center gap-1.5 mr-1">
              <Eye className="w-3.5 h-3.5 text-sky-400" />
              {t.yardFocus}:
            </span>
            <button
              onClick={() => setViewFocus('FULL')}
              className={`px-3 py-1.5 rounded-xl text-sm font-extrabold transition-all ${
                viewFocus === 'FULL'
                  ? 'bg-sky-500 text-slate-950 shadow-md shadow-sky-500/30'
                  : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              🗺️ {t.fullCorridor}
            </button>

            {STATIONS.map(stn => (
              <button
                key={stn.code}
                onClick={() => {
                  setViewFocus(stn.code);
                  setSelectedStation(stn);
                }}
                className={`px-2.5 py-1.5 rounded-xl text-sm font-bold transition-all ${
                  viewFocus === stn.code
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30'
                    : 'bg-slate-900/80 text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {stn.code} {stn.isBlockZone ? '⚠️' : ''}
              </button>
            ))}

            {/* Scale / Zoom Magnifier Switcher */}
            <div className="flex items-center gap-1 bg-slate-900 px-2 py-1 rounded-xl border border-slate-700/80 text-sm font-mono ml-2">
              <ZoomIn className="w-3.5 h-3.5 text-sky-400 mr-0.5" />
              <span className="text-slate-400 text-xs mr-1">ZOOM:</span>
              <button
                onClick={() => setZoomLevel('fit')}
                className={`px-2 py-0.5 rounded text-[13px] font-bold transition-all ${
                  zoomLevel === 'fit'
                    ? 'bg-sky-500 text-slate-950 font-black shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Fit to Screen (Compact)"
              >
                Fit
              </button>
              <button
                onClick={() => setZoomLevel('large')}
                className={`px-2 py-0.5 rounded text-[13px] font-bold transition-all ${
                  zoomLevel === 'large'
                    ? 'bg-sky-500 text-slate-950 font-black shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Standard 150% (Comfortable, large legible text)"
              >
                150%
              </button>
              <button
                onClick={() => setZoomLevel('huge')}
                className={`px-2 py-0.5 rounded text-[13px] font-bold transition-all ${
                  zoomLevel === 'huge'
                    ? 'bg-sky-500 text-slate-950 font-black shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Zoomed 200% (Maximum clarity, large bold fonts)"
              >
                200%
              </button>
            </div>
          </div>

          <div className="flex items-center gap-4 text-sm font-mono">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#0284C7]"></span>
              <span className="text-slate-300">{t.downMain} (160)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#0EA5E9]"></span>
              <span className="text-slate-300">{t.thirdLine} (130)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#16A34A]"></span>
              <span className="text-slate-300">{t.upMain} (160)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#D97706]"></span>
              <span className="text-amber-400">{t.edfcFreight} (25T)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444] animate-pulse"></span>
              <span className="text-rose-400">{t.blockZone}</span>
            </div>
          </div>
        </div>

        {/* 2200 x 900 Canvas: Dynamic Zoom Scaling & Ultra-Legible Large Typography */}
        <div className="w-full bg-[#030712] rounded-2xl border border-slate-800/80 p-3 overflow-x-auto">
          <svg 
            viewBox={svgViewBox} 
            className={`w-full h-auto ${zoomLevel === 'fit' ? 'min-w-[1200px]' : zoomLevel === 'huge' ? 'min-w-[2400px]' : 'min-w-[1850px]'} transition-all duration-300 ease-in-out`}
          >
            <defs>
              {/* Transverse Concrete PSC Railway Sleepers Texture */}
              <pattern id="railSleepersWide" width="10" height="24" patternUnits="userSpaceOnUse">
                <rect x="0" y="0" width="10" height="24" fill="#0C1322" />
                <line x1="5" y1="1" x2="5" y2="23" stroke="#1E293B" strokeWidth="3" strokeLinecap="square" />
                <line x1="5" y1="2" x2="5" y2="22" stroke="#334155" strokeWidth="1.5" />
                <circle cx="5" cy="6" r="1" fill="#64748B" />
                <circle cx="5" cy="18" r="1" fill="#64748B" />
              </pattern>

              {/* Diagonal hazard stripes for the maintenance block */}
              <pattern id="diagonalHazardWide" width="20" height="20" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                <rect width="10" height="20" fill="#DC2626" />
                <rect x="10" width="10" height="20" fill="#FACC15" />
              </pattern>

              {/* Block glow filter */}
              <filter id="blockGlowWide" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="0" stdDeviation="8" floodColor="#EF4444" floodOpacity="0.8" />
              </filter>
            </defs>

            {/* Top Corridor Header Datum */}
            {viewFocus === 'FULL' ? (
              <g>
                <line x1="140" y1="16" x2="2040" y2="16" stroke="#38BDF8" strokeWidth="2.5" strokeDasharray="6,4" />
                <line x1="140" y1="8" x2="140" y2="24" stroke="#38BDF8" strokeWidth="3.5" />
                <line x1="2040" y1="8" x2="2040" y2="24" stroke="#38BDF8" strokeWidth="3.5" />
                <text x="1090" y="14" fill="#38BDF8" fontSize="17" fontWeight="900" textAnchor="middle" letterSpacing="1.5">
                  ◄── NORTH CENTRAL RAILWAY: GHAZIABAD (KM 20.0) TO ALIGARH JN (KM 126.0) • 106.1 RKM ──►
                </text>
              </g>
            ) : (
              <g>
                <text
                  x={Number(svgViewBox.split(' ')[0]) + Number(svgViewBox.split(' ')[2]) / 2}
                  y="15"
                  fill="#38BDF8"
                  fontSize="12.5"
                  fontWeight="900"
                  textAnchor="middle"
                  letterSpacing="1"
                >
                  NCR PRAYAGRAJ DIVISION • YARD INTERLOCKING FOCUS: {STATIONS.find(s => s.code === viewFocus)?.name.toUpperCase()} (KM {STATIONS.find(s => s.code === viewFocus)?.km.toFixed(1)})
                </text>
              </g>
            )}

            {/* ========================================================================= */}
            {/* STATION VERTICAL DATUMS & LABELS (7 ESP STATIONS - HIGH VISIBILITY)       */}
            {/* ========================================================================= */}
            {STATIONS.map((stn) => {
              const isSelected = selectedStation?.code === stn.code;
              return (
                <g 
                  key={stn.code} 
                  className="cursor-pointer group"
                  onClick={() => setSelectedStation(stn)}
                >
                  {/* Vertical Station Guide line across all 4 running tracks */}
                  <line
                    x1={stn.x}
                    y1={28}
                    x2={stn.x}
                    y2={865}
                    stroke={isSelected ? '#38BDF8' : '#1E293B'}
                    strokeWidth={isSelected ? 2.5 : 1}
                    strokeDasharray={isSelected ? undefined : '3, 3'}
                  />

                  {/* Top Station Mast Tag (High-contrast, bold 104x30 pill) */}
                  <g transform={`translate(${stn.x}, 40)`}>
                    <rect
                      x="-52"
                      y="-15"
                      width="104"
                      height="30"
                      rx="7"
                      fill={stn.isBlockZone ? '#450A0A' : isSelected ? '#0369A1' : '#0B132B'}
                      stroke={stn.isBlockZone ? '#DC2626' : isSelected ? '#38BDF8' : '#475569'}
                      strokeWidth={isSelected ? 3 : 1.8}
                      filter="drop-shadow(0 4px 8px rgba(0,0,0,0.7))"
                    />
                    <text
                      x="0"
                      y="6"
                      fill="#FFFFFF"
                      fontSize="16"
                      fontWeight="900"
                      textAnchor="middle"
                    >
                      {stn.name}
                    </text>
                  </g>

                  {/* Bottom Chainage / Kilometre Tag */}
                  <g transform={`translate(${stn.x}, 875)`}>
                    <rect x="-48" y="-13" width="96" height="26" rx="6" fill="#0B132B" stroke="#38BDF8" strokeWidth="1.5" />
                    <text
                      x="0"
                      y="5"
                      fill="#38BDF8"
                      fontSize="14.5"
                      fontFamily="monospace"
                      fontWeight="900"
                      textAnchor="middle"
                    >
                      KM {stn.km.toFixed(1)}
                    </text>
                  </g>
                </g>
              );
            })}

            {/* ========================================================================= */}
            {/* STATION PLATFORM & PRECEDENCE LOOPS (NORTH LOOPS: y = 90)                 */}
            {/* ========================================================================= */}
            {/* Ghaziabad PF 1 & 2 Loop */}
            <g id="gzb-loops">
              <rect x="80" y="82" width="120" height="10" fill="url(#railSleepersWide)" rx="2" />
              <line x1="80" y1="86" x2="200" y2="86" stroke="#475569" strokeWidth="2.5" />
              <line x1="80" y1="94" x2="200" y2="94" stroke="#475569" strokeWidth="2.5" />
              <path d="M 60 160 L 80 90 M 200 90 L 220 160" stroke="#0284C7" strokeWidth="1.8" fill="none" />
              <text x="140" y="78" fill="#94A3B8" fontSize="17" fontWeight="900" textAnchor="middle">GZB PF 1/2 LOOP</text>
            </g>

            {/* Dadri Down Loop (715m CSR) */}
            <g id="dadri-down-loop">
              <rect x="600" y="82" width="160" height="10" fill="url(#railSleepersWide)" rx="2" />
              <line x1="600" y1="86" x2="760" y2="86" stroke="#475569" strokeWidth="2.5" />
              <line x1="600" y1="94" x2="760" y2="94" stroke="#475569" strokeWidth="2.5" />
              <path d="M 575 160 L 600 90 M 760 90 L 785 160" stroke="#0284C7" strokeWidth="1.8" fill="none" />
              <text x="680" y="78" fill="#38BDF8" fontSize="17" fontWeight="900" textAnchor="middle">DADRI DN LOOP (715m · 58 BOXN)</text>
            </g>

            {/* Dankaur Precedence Loop */}
            <g id="dankaur-loop">
              <rect x="920" y="82" width="160" height="10" fill="url(#railSleepersWide)" rx="2" />
              <line x1="920" y1="86" x2="1080" y2="86" stroke="#475569" strokeWidth="2.5" />
              <line x1="920" y1="94" x2="1080" y2="94" stroke="#475569" strokeWidth="2.5" />
              <path d="M 895 160 L 920 90 M 1080 90 L 1105 160" stroke="#0284C7" strokeWidth="1.8" fill="none" />
              <text x="1000" y="78" fill="#94A3B8" fontSize="17" fontWeight="900" textAnchor="middle">DKDE OVERTAKE LOOP</text>
            </g>

            {/* Somna Goods Refuge Siding */}
            <g id="somna-loop">
              <rect x="1520" y="82" width="140" height="10" fill="url(#railSleepersWide)" rx="2" />
              <path d="M 1495 160 L 1520 90 M 1660 90 L 1685 160" stroke="#0284C7" strokeWidth="1.8" fill="none" />
              <text x="1590" y="78" fill="#94A3B8" fontSize="16" fontWeight="900" textAnchor="middle">SOMNA GOODS REFUGE (PT #10A)</text>
            </g>

            {/* Aligarh Down Platforms 1 to 3 */}
            <g id="aljn-down-loops">
              <rect x="1960" y="82" width="150" height="10" fill="url(#railSleepersWide)" rx="2" />
              <path d="M 1935 160 L 1960 90 M 2110 90 L 2135 160" stroke="#0284C7" strokeWidth="1.8" fill="none" />
              <text x="2035" y="78" fill="#94A3B8" fontSize="17" fontWeight="900" textAnchor="middle">ALJN PF 1-3 LOOPS</text>
            </g>

            {/* ========================================================================= */}
            {/* 4 MAIN TRACK RUNNING CORRIDORS (GENEROUS 200px VERTICAL SEPARATION!)       */}
            {/* ========================================================================= */}

            {/* LINE 1: DOWN MAINLINE (y = 160, 160 km/h MPS) */}
            <g id="track-down-main">
              <rect x="40" y="152" width="2120" height="16" fill="url(#railSleepersWide)" />
              <line x1="40" y1="154" x2="2160" y2="154" stroke="#0284C7" strokeWidth="2" />
              <line x1="40" y1="166" x2="2160" y2="166" stroke="#0284C7" strokeWidth="2" />
              
              {/* Prominent Track Label Pill */}
              <g transform="translate(45, 116)">
                <rect x="0" y="0" width="340" height="34" rx="7" fill="#0369A1" stroke="#38BDF8" strokeWidth="1.8" filter="drop-shadow(0 3px 6px rgba(0,0,0,0.6))" />
                <text x="170" y="23" fill="#FFFFFF" fontSize="20" fontWeight="900" textAnchor="middle">
                  {t.downMain} (160 km/h MPS) ►
                </text>
              </g>
            </g>

            {/* LINE 2: BIDIRECTIONAL 3RD LINE (y = 360, 130 km/h MPS) */}
            <g id="track-3rd-line">
              <rect x="40" y="352" width="2120" height="16" fill="url(#railSleepersWide)" />
              <line x1="40" y1="354" x2="2160" y2="354" stroke="#0EA5E9" strokeWidth="2" />
              <line x1="40" y1="366" x2="2160" y2="366" stroke="#0EA5E9" strokeWidth="2" />
              
              <g transform="translate(45, 316)">
                <rect x="0" y="0" width="360" height="34" rx="7" fill="#0284C7" stroke="#38BDF8" strokeWidth="1.8" filter="drop-shadow(0 3px 6px rgba(0,0,0,0.6))" />
                <text x="180" y="23" fill="#FFFFFF" fontSize="20" fontWeight="900" textAnchor="middle">
                  ◄► {t.thirdLine} (130 km/h)
                </text>
              </g>
            </g>

            {/* LINE 3: UP MAINLINE (y = 560, 160 km/h MPS) */}
            <g id="track-up-main">
              <rect x="40" y="552" width="2120" height="16" fill="url(#railSleepersWide)" />
              <line x1="40" y1="554" x2="2160" y2="554" stroke="#16A34A" strokeWidth="2" />
              <line x1="40" y1="566" x2="2160" y2="566" stroke="#16A34A" strokeWidth="2" />
              
              <g transform="translate(45, 516)">
                <rect x="0" y="0" width="340" height="34" rx="7" fill="#15803D" stroke="#4ADE80" strokeWidth="1.8" filter="drop-shadow(0 3px 6px rgba(0,0,0,0.6))" />
                <text x="170" y="23" fill="#FFFFFF" fontSize="20" fontWeight="900" textAnchor="middle">
                  ◄ {t.upMain} (160 km/h MPS)
                </text>
              </g>
            </g>

            {/* SOUTH STATION LOOPS (y = 625: Dadri Up Loop & Aligarh PF 4-6) */}
            <g id="south-loops">
              {/* Dadri Up Loop */}
              <rect x="600" y="617" width="160" height="10" fill="url(#railSleepersWide)" rx="2" />
              <path d="M 575 560 L 600 625 M 760 625 L 785 560" stroke="#16A34A" strokeWidth="1.8" fill="none" />
              <text x="680" y="650" fill="#4ADE80" fontSize="17" fontWeight="900" textAnchor="middle">DADRI UP LOOP (CSR 715m)</text>

              {/* Aligarh Up Platforms 4 to 6 */}
              <rect x="1960" y="617" width="150" height="10" fill="url(#railSleepersWide)" rx="2" />
              <path d="M 1935 560 L 1960 625 M 2110 625 L 2135 560" stroke="#16A34A" strokeWidth="1.8" fill="none" />
              <text x="2035" y="650" fill="#4ADE80" fontSize="17" fontWeight="900" textAnchor="middle">ALJN PF 4-6 LOOPS</text>
            </g>

            {/* LINE 4: EASTERN DEDICATED FREIGHT CORRIDOR (EDFC - y = 760, 25T Axle) */}
            <g id="track-edfc">
              <rect x="40" y="752" width="2120" height="16" fill="url(#railSleepersWide)" />
              <line x1="40" y1="754" x2="2160" y2="754" stroke="#D97706" strokeWidth="2" />
              <line x1="40" y1="766" x2="2160" y2="766" stroke="#D97706" strokeWidth="2" />
              
              <g transform="translate(45, 716)">
                <rect x="0" y="0" width="380" height="34" rx="7" fill="#B45309" stroke="#FBBF24" strokeWidth="1.8" filter="drop-shadow(0 3px 6px rgba(0,0,0,0.6))" />
                <text x="190" y="23" fill="#FFFFFF" fontSize="20" fontWeight="900" textAnchor="middle">
                  {t.edfcFreight} (25T Axle) ►
                </text>
              </g>
            </g>

            {/* ========================================================================= */}
            {/* RDSO CONTINUOUS ROUTE LOCKING INDICATION (ILLUMINATED CENTER STRIPES)     */}
            {/* ========================================================================= */}
            <g id="rdso-route-locking-paths">
              {isBlockActive ? (
                <>
                  {/* Down Main Route locked up to Point #12A */}
                  <line x1="40" y1="160" x2="1620" y2="160" stroke="#F8FAFC" strokeWidth="1.5" opacity="0.7" strokeDasharray="14, 4" />
                  {/* Divergence via Point #12A Turnout to 3rd Line */}
                  <path d="M 1620 160 C 1650 160, 1690 360, 1720 360" stroke="#38BDF8" strokeWidth="2.5" fill="none" opacity="0.95" />
                  {/* 3rd Line Bypass Route Locked */}
                  <line x1="1720" y1="360" x2="1960" y2="360" stroke="#38BDF8" strokeWidth="2" opacity="0.9" strokeDasharray="14, 4" />
                  {/* Re-entry via Point #14B Crossover to Down Main */}
                  <path d="M 1960 360 C 1985 360, 2000 160, 2020 160" stroke="#38BDF8" strokeWidth="2.5" fill="none" opacity="0.95" />
                  {/* Down Main to Aligarh Route Locked */}
                  <line x1="2020" y1="160" x2="2160" y2="160" stroke="#F8FAFC" strokeWidth="1.5" opacity="0.7" strokeDasharray="14, 4" />
                </>
              ) : (
                <line x1="40" y1="160" x2="2160" y2="160" stroke="#F8FAFC" strokeWidth="1.5" opacity="0.7" strokeDasharray="14, 4" />
              )}
              {/* Up Main Continuous Route Locked */}
              <line x1="40" y1="560" x2="2160" y2="560" stroke="#4ADE80" strokeWidth="1.5" opacity="0.75" strokeDasharray="14, 4" />
              {/* EDFC Goods Route Locked */}
              <line x1="40" y1="760" x2="2160" y2="760" stroke="#F59E0B" strokeWidth="1.5" opacity="0.75" strokeDasharray="14, 4" />
            </g>

            {/* ========================================================================= */}
            {/* UNIVERSAL CROSSOVERS, FLYOVERS & BRANCH DIVERGENCES                      */}
            {/* ========================================================================= */}

            {/* A. DADRI EDFC FLYOVER INTERCHANGE */}
            <g id="dadri-edfc-flyover">
              <path 
                d="M 640 360 C 670 360, 710 680, 740 760" 
                fill="none" 
                stroke="#F59E0B" 
                strokeWidth="3.5" 
                strokeDasharray="6,4" 
              />
              <g transform="translate(640, 700)">
                <rect x="-95" y="-15" width="190" height="30" rx="6" fill="#78350F" stroke="#F59E0B" strokeWidth="1.5" />
                <text x="0" y="6" fill="#FDE68A" fontSize="17" fontWeight="900" textAnchor="middle">
                  EDFC FLYOVER RAMP
                </text>
              </g>
            </g>

            {/* B. KHURJA JUNCTION DIVERGENCE (HAPUR / MEERUT BRANCH & NEW KHURJA EDFC) */}
            <g id="khurja-junction">
              {/* Diverging Branch Line to Hapur/Meerut */}
              <path d="M 1310 160 C 1340 160, 1360 80, 1380 50" fill="none" stroke="#38BDF8" strokeWidth="3.5" />
              <g transform="translate(1380, 50)">
                <rect x="-85" y="-13" width="170" height="26" rx="6" fill="#0C4A6E" stroke="#38BDF8" strokeWidth="1.5" />
                <text x="0" y="5" fill="#E0F2FE" fontSize="12.5" fontWeight="900" textAnchor="middle">
                  HAPUR / MEERUT BR. ➔
                </text>
              </g>

              {/* New Khurja EDFC Connector */}
              <path d="M 1330 360 C 1360 360, 1390 680, 1420 760" fill="none" stroke="#F59E0B" strokeWidth="3.5" strokeDasharray="6,4" />
              <g transform="translate(1395, 620)">
                <rect x="-85" y="-15" width="170" height="30" rx="6" fill="#78350F" stroke="#F59E0B" strokeWidth="1.5" />
                <text x="0" y="6" fill="#FBBF24" fontSize="14" fontWeight="900" textAnchor="middle">NEW KHURJA EDFC</text>
              </g>
            </g>

            {/* ========================================================================= */}
            {/* B1 & B2: DANKAUR & DADRI CROSSOVERS & BLOCK 2 (UP MAINLINE TRD BLOCK)      */}
            {/* ========================================================================= */}
            {/* Point #6A: Dankaur Crossover from Up Main (560) to 3rd Line (360) */}
            <g id="dankaur-crossover-pt6a">
              <path 
                d="M 1040 560 C 1010 560, 990 360, 960 360" 
                stroke={isBlockActive ? '#38BDF8' : '#16A34A'} 
                strokeWidth={isBlockActive ? 3 : 2} 
                fill="none" 
              />
              <circle cx="1035" cy="560" r="7" fill={isBlockActive ? '#0284C7' : '#22C55E'} stroke="#FFFFFF" strokeWidth="2.5" />
              <g transform="translate(1020, 435)">
                <rect x="-125" y="-16" width="250" height="32" rx="6" fill="#0C4A6E" stroke="#38BDF8" strokeWidth="1.5" />
                <text x="0" y="6" fill="#38BDF8" fontSize="15" fontWeight="900" textAnchor="middle">
                  POINT #6A · UP ➔ 3RD LINE (50 km/h)
                </text>
              </g>
            </g>

            {/* Point #4B: Dadri Re-entry Crossover from 3rd Line (360) down to Up Main (560) */}
            <g id="dadri-crossover-pt4b">
              <path 
                d="M 760 360 C 730 360, 710 560, 680 560" 
                stroke={isBlockActive ? '#38BDF8' : '#16A34A'} 
                strokeWidth={isBlockActive ? 3 : 2} 
                fill="none" 
              />
              <circle cx="755" cy="360" r="7" fill={isBlockActive ? '#0284C7' : '#22C55E'} stroke="#FFFFFF" strokeWidth="2.5" />
              <g transform="translate(700, 435)">
                <rect x="-120" y="-16" width="240" height="32" rx="6" fill="#0C4A6E" stroke="#38BDF8" strokeWidth="1.5" />
                <text x="0" y="6" fill="#38BDF8" fontSize="15" fontWeight="900" textAnchor="middle">
                  POINT #4B · RE-ENTER UP MAIN
                </text>
              </g>
            </g>

            {/* BLOCK #2: FORM T/172 TRD OHE POWER BLOCK ZONE (DADRI KM 37 - DANKAUR KM 54) */}
            <g id="up-main-block-zone">
              <rect
                x="740"
                y="548"
                width="260"
                height="24"
                fill="url(#diagonalHazardWide)"
                opacity={isBlockActive ? 0.95 : 0.05}
                filter={isBlockActive ? 'url(#blockGlowWide)' : undefined}
              />
              <rect
                x="740"
                y="548"
                width="260"
                height="24"
                fill="none"
                stroke={isBlockActive ? "#DC2626" : "#334155"}
                strokeWidth={isBlockActive ? 3.5 : 1}
                strokeDasharray={isBlockActive ? undefined : '5, 5'}
              />

              {isBlockActive && (
                <g transform="translate(860, 560)">
                  <rect x="-125" y="-13" width="250" height="26" rx="5" fill="#1E3A8A" stroke="#60A5FA" strokeWidth="2" filter="drop-shadow(0 2px 5px rgba(0,0,0,0.8))" />
                  <text x="0" y="5.5" fill="#DBEAFE" fontSize="13.5" fontFamily="monospace" fontWeight="900" textAnchor="middle">
                    DETC-08 OHE TOWER WAGON (TRD T/172)
                  </text>
                  <circle cx="-115" cy="-13" r="3.5" fill="#60A5FA" className="animate-ping" />
                  <circle cx="-115" cy="-13" r="3.5" fill="#60A5FA" />
                  <circle cx="115" cy="-13" r="3.5" fill="#60A5FA" className="animate-ping" />
                  <circle cx="115" cy="-13" r="3.5" fill="#60A5FA" />
                </g>
              )}

              {isBlockActive && (
                <>
                  <g transform="translate(740, 560)">
                    <rect x="-5" y="-14" width="10" height="28" fill="#DC2626" rx="2" />
                    <text x="0" y="-18" fill="#EF4444" fontSize="16" fontWeight="900" textAnchor="middle">STOP</text>
                  </g>
                  <g transform="translate(1000, 560)">
                    <rect x="-5" y="-14" width="10" height="28" fill="#DC2626" rx="2" />
                    <text x="0" y="-18" fill="#EF4444" fontSize="16" fontWeight="900" textAnchor="middle">STOP</text>
                  </g>
                </>
              )}

              {/* Block 2 Banner: Placed in the spacious air gap above Up Mainline at y=485 */}
              <g transform="translate(860, 485)">
                <rect
                  x="-140"
                  y="-14"
                  width="280"
                  height="28"
                  rx="6"
                  fill={isBlockActive ? '#7F1D1D' : '#14532D'}
                  stroke={isBlockActive ? '#EF4444' : '#22C55E'}
                  strokeWidth="2"
                  filter="drop-shadow(0 3px 6px rgba(0,0,0,0.8))"
                />
                <text x="0" y="5" fill="#FFFFFF" fontSize="16" fontWeight="900" textAnchor="middle">
                  {isBlockActive ? '🛑 UP MAIN DISCONNECTED (T/172)' : '✅ UP MAIN BLOCK CLEAR'}
                </text>
              </g>

              {/* Red Signal S-08 at Dankaur Up Entrance */}
              <g transform="translate(1005, 575)">
                <rect x="-8" y="0" width="16" height="34" rx="3" fill="#000000" stroke="#475569" strokeWidth="1.5" />
                <circle cx="0" cy="9" r="4" fill={isBlockActive ? '#EF4444' : '#22C55E'} className={isBlockActive ? 'animate-ping' : ''} />
                <circle cx="0" cy="9" r="4" fill={isBlockActive ? '#EF4444' : '#22C55E'} />
                <circle cx="0" cy="17" r="3" fill="#334155" />
                <circle cx="0" cy="25" r="3" fill="#334155" />
                <text x="14" y="20" fill={isBlockActive ? '#EF4444' : '#22C55E'} fontSize="15" fontWeight="900">
                  {isBlockActive ? 'S-08 (RED)' : 'S-08 (GREEN)'}
                </text>
              </g>
            </g>

            {/* ========================================================================= */}
            {/* B3: KHURJA EDFC FREIGHT BYPASS SIDING & BLOCK 3                           */}
            {/* ========================================================================= */}
            <g id="edfc-freight-block-zone">
              {/* Freight Bypass Siding Track (y=830) */}
              <path 
                d="M 1170 760 C 1200 760, 1220 830, 1250 830 L 1430 830 C 1460 830, 1475 760, 1500 760" 
                fill="none" 
                stroke="#D97706" 
                strokeWidth="3.5" 
              />
              <g transform="translate(1340, 855)">
                <rect x="-120" y="-15" width="240" height="30" rx="6" fill="#78350F" stroke="#F59E0B" strokeWidth="1.5" />
                <text x="0" y="6" fill="#FDE68A" fontSize="17" fontWeight="900" textAnchor="middle">
                  KHURJA DFC SIDING (1500m CSR)
                </text>
              </g>

              {/* Hazard Pattern on EDFC Main between x=1200 and x=1420 */}
              <rect
                x="1200"
                y="748"
                width="230"
                height="24"
                fill="url(#diagonalHazardWide)"
                opacity={isBlockActive ? 0.95 : 0.05}
                filter={isBlockActive ? 'url(#blockGlowWide)' : undefined}
              />
              <rect
                x="1200"
                y="748"
                width="230"
                height="24"
                fill="none"
                stroke={isBlockActive ? "#DC2626" : "#334155"}
                strokeWidth={isBlockActive ? 3.5 : 1}
                strokeDasharray={isBlockActive ? undefined : '5, 5'}
              />

              {isBlockActive && (
                <g transform="translate(1315, 760)">
                  <rect x="-125" y="-13" width="250" height="26" rx="5" fill="#78350F" stroke="#F59E0B" strokeWidth="2" filter="drop-shadow(0 2px 5px rgba(0,0,0,0.8))" />
                  <text x="0" y="5.5" fill="#FEF3C7" fontSize="13.5" fontFamily="monospace" fontWeight="900" textAnchor="middle">
                    SPENO RG-48 RAIL GRINDER (25T)
                  </text>
                  <circle cx="-115" cy="-13" r="3.5" fill="#F59E0B" className="animate-ping" />
                  <circle cx="-115" cy="-13" r="3.5" fill="#F59E0B" />
                  <circle cx="115" cy="-13" r="3.5" fill="#F59E0B" className="animate-ping" />
                  <circle cx="115" cy="-13" r="3.5" fill="#F59E0B" />
                </g>
              )}

              {isBlockActive && (
                <>
                  <g transform="translate(1200, 760)">
                    <rect x="-5" y="-14" width="10" height="28" fill="#DC2626" rx="2" />
                    <text x="0" y="-18" fill="#EF4444" fontSize="16" fontWeight="900" textAnchor="middle">STOP</text>
                  </g>
                  <g transform="translate(1430, 760)">
                    <rect x="-5" y="-14" width="10" height="28" fill="#DC2626" rx="2" />
                    <text x="0" y="-18" fill="#EF4444" fontSize="16" fontWeight="900" textAnchor="middle">STOP</text>
                  </g>
                </>
              )}

              {/* Block 3 Banner: Placed in the air gap above EDFC track at y=695 */}
              <g transform="translate(1315, 695)">
                <rect
                  x="-140"
                  y="-14"
                  width="280"
                  height="28"
                  rx="6"
                  fill={isBlockActive ? '#7F1D1D' : '#14532D'}
                  stroke={isBlockActive ? '#EF4444' : '#22C55E'}
                  strokeWidth="2"
                  filter="drop-shadow(0 3px 6px rgba(0,0,0,0.8))"
                />
                <text x="0" y="5" fill="#FFFFFF" fontSize="16" fontWeight="900" textAnchor="middle">
                  {isBlockActive ? '🛑 EDFC DISCONNECTED (USFD/GRIND)' : '✅ EDFC FREIGHT CORRIDOR CLEAR'}
                </text>
              </g>

              {/* Red Signal S-F4 at Khurja EDFC Entrance */}
              <g transform="translate(1195, 775)">
                <rect x="-8" y="0" width="16" height="34" rx="3" fill="#000000" stroke="#475569" strokeWidth="1.5" />
                <circle cx="0" cy="9" r="4" fill={isBlockActive ? '#EF4444' : '#22C55E'} className={isBlockActive ? 'animate-ping' : ''} />
                <circle cx="0" cy="9" r="4" fill={isBlockActive ? '#EF4444' : '#22C55E'} />
                <circle cx="0" cy="17" r="3" fill="#334155" />
                <circle cx="0" cy="25" r="3" fill="#334155" />
                <text x="14" y="20" fill={isBlockActive ? '#EF4444' : '#22C55E'} fontSize="15" fontWeight="900">
                  {isBlockActive ? 'S-F4 (RED)' : 'S-F4 (GREEN)'}
                </text>
              </g>
            </g>

            {/* ========================================================================= */}
            {/* C. SOMNA TO ALIGARH & BLOCK 1 (DOWN MAINLINE P-WAY MEGA-BLOCK)             */}
            {/* ========================================================================= */}

            {/* 1. SOMNA UNIVERSAL CROSSOVER POINT #12A */}
            <g id="somna-crossover-pt12a" className="cursor-pointer" onClick={() => setOverrideBlockState(prev => !prev)}>
              {/* Turnout from Down Main (160) to 3rd Line (360) */}
              <path 
                d="M 1620 160 C 1650 160, 1690 360, 1720 360" 
                stroke={isBlockActive ? '#38BDF8' : '#0284C7'} 
                strokeWidth={isBlockActive ? 3 : 2} 
                fill="none" 
              />
              <circle cx="1625" cy="160" r="7" fill={isBlockActive ? '#0284C7' : '#22C55E'} stroke="#FFFFFF" strokeWidth="2.5" />
              
              {/* Point #12A Clear Label Pill */}
              <g transform="translate(1670, 265)">
                <rect x="-105" y="-14" width="210" height="28" rx="6" fill="#0C4A6E" stroke="#38BDF8" strokeWidth="1.5" />
                <text x="0" y="5" fill="#38BDF8" fontSize="16" fontWeight="900" textAnchor="middle">
                  POINT #12A · 3RD LINE (50 km/h)
                </text>
              </g>

              {/* Fish-tailed PSR 50 Caution Board */}
              <g transform="translate(1560, 122)">
                <polygon points="0,0 48,0 58,11 48,22 0,22 7,11" fill="#EAB308" stroke="#000000" strokeWidth="1.2" />
                <text x="24" y="16" fill="#000000" fontSize="15" fontWeight="900" textAnchor="middle">PSR 50</text>
              </g>
            </g>

            {/* 2. FORM T/351 MAINTENANCE BLOCK ZONE (SOMNA KM 118 - ALJN KM 126) */}
            <g id="maintenance-block-zone">
              {/* Hazard Pattern on Down Main between x=1700 and x=1960 */}
              <rect
                x="1700"
                y="148"
                width="260"
                height="24"
                fill="url(#diagonalHazardWide)"
                opacity={isBlockActive ? 0.95 : 0.05}
                filter={isBlockActive ? 'url(#blockGlowWide)' : undefined}
              />
              <rect
                x="1700"
                y="148"
                width="260"
                height="24"
                fill="none"
                stroke={isBlockActive ? "#DC2626" : "#334155"}
                strokeWidth={isBlockActive ? 3.5 : 1}
                strokeDasharray={isBlockActive ? undefined : '5, 5'}
              />

              {/* Active P-Way Track Machine Working inside the Blocked Track */}
              {isBlockActive && (
                <g transform="translate(1840, 160)">
                  <rect x="-105" y="-12" width="210" height="24" rx="5" fill="#78350F" stroke="#F59E0B" strokeWidth="2" filter="drop-shadow(0 2px 5px rgba(0,0,0,0.8))" />
                  <text x="0" y="5" fill="#FEF3C7" fontSize="15" fontFamily="monospace" fontWeight="900" textAnchor="middle">
                    09-3X TAMPING EXPRESS (T/351)
                  </text>
                  <circle cx="-95" cy="-12" r="3" fill="#F59E0B" className="animate-ping" />
                  <circle cx="-95" cy="-12" r="3" fill="#F59E0B" />
                  <circle cx="95" cy="-12" r="3" fill="#F59E0B" className="animate-ping" />
                  <circle cx="95" cy="-12" r="3" fill="#F59E0B" />
                </g>
              )}

              {/* Red Stop Boards at Block Boundaries */}
              {isBlockActive && (
                <>
                  <g transform="translate(1700, 160)">
                    <rect x="-5" y="-14" width="10" height="28" fill="#DC2626" rx="2" />
                    <text x="0" y="-18" fill="#EF4444" fontSize="16" fontWeight="900" textAnchor="middle">STOP</text>
                  </g>
                  <g transform="translate(1960, 160)">
                    <rect x="-5" y="-14" width="10" height="28" fill="#DC2626" rx="2" />
                    <text x="0" y="-18" fill="#EF4444" fontSize="16" fontWeight="900" textAnchor="middle">STOP</text>
                  </g>
                </>
              )}

              {/* Block 1 Status Banner: Placed in the clear air gap above Down Mainline at y=105 */}
              <g transform="translate(1840, 105)">
                <rect
                  x="-135"
                  y="-14"
                  width="270"
                  height="28"
                  rx="6"
                  fill={isBlockActive ? '#7F1D1D' : '#14532D'}
                  stroke={isBlockActive ? '#EF4444' : '#22C55E'}
                  strokeWidth="2"
                  filter="drop-shadow(0 3px 6px rgba(0,0,0,0.8))"
                />
                <text
                  x="0"
                  y="5"
                  fill="#FFFFFF"
                  fontSize="13"
                  fontWeight="900"
                  textAnchor="middle"
                >
                  {isBlockActive ? '🛑 DOWN MAIN DISCONNECTED (T/351)' : '✅ DOWN MAIN BLOCK CLEAR'}
                </text>
              </g>

              {/* Red Signal Aspect S-12 at Block Entrance */}
              <g transform="translate(1695, 178)">
                <rect x="-7" y="0" width="14" height="30" rx="3" fill="#000000" stroke="#475569" strokeWidth="1.5" />
                <circle cx="0" cy="8" r="3.5" fill={isBlockActive ? '#EF4444' : '#22C55E'} className={isBlockActive ? 'animate-ping' : ''} />
                <circle cx="0" cy="8" r="3.5" fill={isBlockActive ? '#EF4444' : '#22C55E'} />
                <circle cx="0" cy="15" r="2.5" fill="#334155" />
                <circle cx="0" cy="22" r="2.5" fill="#334155" />
                <text x="12" y="18" fill={isBlockActive ? '#EF4444' : '#22C55E'} fontSize="14" fontWeight="900">
                  {isBlockActive ? 'S-12 (RED)' : 'S-12 (GREEN)'}
                </text>
              </g>
            </g>

            {/* 3. ALIGARH RE-ENTRY CROSSOVER POINT #14B */}
            <g id="aligarh-crossovers">
              {/* Point #14B Crossover connecting 3rd Line back to Down Main */}
              <path 
                d="M 1960 360 C 1985 360, 2000 160, 2020 160" 
                stroke="#0284C7" 
                strokeWidth={isBlockActive ? 3 : 2} 
                fill="none" 
              />
              <circle cx="1965" cy="360" r="7" fill="#0284C7" stroke="#FFFFFF" strokeWidth="2.5" />
              
              <g transform="translate(1990, 240)">
                <rect x="-115" y="-16" width="230" height="32" rx="6" fill="#0C4A6E" stroke="#38BDF8" strokeWidth="1.5" />
                <text x="0" y="6" fill="#38BDF8" fontSize="15" fontWeight="900" textAnchor="middle">
                  POINT #14B · RE-ENTER DN MAIN
                </text>
              </g>

              {/* Circular White T/P Termination Board */}
              <g transform="translate(2035, 130)">
                <circle cx="0" cy="0" r="14" fill="#FFFFFF" stroke="#000000" strokeWidth="2.5" />
                <text x="0" y="5" fill="#000000" fontSize="16" fontWeight="900" textAnchor="middle">T/P</text>
              </g>

              {/* Scissors Crossover between Down Main and 3rd Line */}
              <line x1="2000" y1="160" x2="2050" y2="360" stroke="#0284C7" strokeWidth="3" />
              <line x1="2000" y1="360" x2="2050" y2="160" stroke="#0284C7" strokeWidth="3" />

              {/* Diverging Chandausi Branch */}
              <path d="M 2040 560 C 2070 560, 2095 680, 2125 740" fill="none" stroke="#16A34A" strokeWidth="3.5" />
              <g transform="translate(2090, 720)">
                <rect x="-85" y="-15" width="170" height="30" rx="6" fill="#14532D" stroke="#4ADE80" strokeWidth="1.5" />
                <text x="0" y="6" fill="#86EFAC" fontSize="14" fontWeight="900" textAnchor="middle">CHANDAUSI BR. ➔</text>
              </g>
            </g>

            {/* ========================================================================= */}
            {/* DYNAMIC CUSTOM MAINTENANCE BLOCKAGES & CAUTION ORDER HAZARD ZONES       */}
            {/* ========================================================================= */}
            {customBlockages && customBlockages.map((block) => {
              const minKm = Math.min(block.start_km, block.end_km);
              const maxKm = Math.max(block.start_km, block.end_km);
              const startX = 140.0 + ((Math.max(20.0, Math.min(126.0, minKm)) - 20.0) / 106.0) * 1900.0;
              const endX = 140.0 + ((Math.max(20.0, Math.min(126.0, maxKm)) - 20.0) / 106.0) * 1900.0;
              const width = Math.max(70, endX - startX);
              const centerX = startX + width / 2;

              let trackY = 160;
              let rectY = 148;
              let bannerY = 105;
              const isDown = block.track_line.toLowerCase().includes('down');
              const isThird = block.track_line.toLowerCase().includes('third') || block.track_line.toLowerCase().includes('3rd');
              const isUp = block.track_line.toLowerCase().includes('up');
              const isEdfc = block.track_line.toLowerCase().includes('edfc');

              if (isDown) {
                trackY = 160; rectY = 148; bannerY = 105;
              } else if (isThird) {
                trackY = 360; rectY = 348; bannerY = 305;
              } else if (isUp) {
                trackY = 560; rectY = 548; bannerY = 505;
              } else if (isEdfc) {
                trackY = 760; rectY = 748; bannerY = 705;
              }

              const isCaution = block.form_type === 'CAUTION_T409';
              const borderColor = isCaution ? '#F59E0B' : '#EF4444';
              const bannerBg = isCaution ? '#78350F' : '#7F1D1D';
              const bannerBorder = isCaution ? '#F59E0B' : '#F87171';

              return (
                <g key={block.block_id} id={`custom-block-${block.block_id}`}>
                  {/* Diagonal Hazard Zone */}
                  <rect
                    x={startX}
                    y={rectY}
                    width={width}
                    height="24"
                    fill="url(#diagonalHazardWide)"
                    opacity="0.95"
                    filter="url(#blockGlowWide)"
                  />
                  <rect
                    x={startX}
                    y={rectY}
                    width={width}
                    height="24"
                    fill="none"
                    stroke={borderColor}
                    strokeWidth="3.5"
                  />

                  {/* Stop or Caution Boards at Boundaries */}
                  {isCaution ? (
                    <>
                      <g transform={`translate(${startX}, ${trackY - 22})`}>
                        <polygon points="0,0 48,0 58,11 48,22 0,22 7,11" fill="#EAB308" stroke="#000000" strokeWidth="1.2" />
                        <text x="24" y="16" fill="#000000" fontSize="13" fontWeight="900" textAnchor="middle">
                          PSR {block.speed_restriction_kmh}
                        </text>
                      </g>
                      <g transform={`translate(${endX + 10}, ${trackY - 10})`}>
                        <circle cx="0" cy="0" r="12" fill="#FFFFFF" stroke="#000000" strokeWidth="2" />
                        <text x="0" y="4" fill="#000000" fontSize="13" fontWeight="900" textAnchor="middle">T/P</text>
                      </g>
                    </>
                  ) : (
                    <>
                      <g transform={`translate(${startX}, ${trackY})`}>
                        <rect x="-5" y="-14" width="10" height="28" fill="#DC2626" rx="2" />
                        <text x="0" y="-18" fill="#EF4444" fontSize="15" fontWeight="900" textAnchor="middle">STOP</text>
                      </g>
                      <g transform={`translate(${endX}, ${trackY})`}>
                        <rect x="-5" y="-14" width="10" height="28" fill="#DC2626" rx="2" />
                        <text x="0" y="-18" fill="#EF4444" fontSize="15" fontWeight="900" textAnchor="middle">STOP</text>
                      </g>
                    </>
                  )}

                  {/* Active Machine / Work Pill with Pulsing Beacons */}
                  <g transform={`translate(${centerX}, ${trackY})`}>
                    <rect x="-95" y="-12" width="190" height="24" rx="5" fill={bannerBg} stroke={bannerBorder} strokeWidth="1.8" filter="drop-shadow(0 2px 5px rgba(0,0,0,0.8))" />
                    <text x="0" y="5" fill="#FEF3C7" fontSize="12" fontFamily="monospace" fontWeight="900" textAnchor="middle">
                      {block.machine_deployed || block.department} ({block.form_type})
                    </text>
                    <circle cx="-85" cy="-12" r="3" fill="#F59E0B" className="animate-ping" />
                    <circle cx="-85" cy="-12" r="3" fill="#F59E0B" />
                    <circle cx="85" cy="-12" r="3" fill="#F59E0B" className="animate-ping" />
                    <circle cx="85" cy="-12" r="3" fill="#F59E0B" />
                  </g>

                  {/* Operational Status Banner with Private Number & Lift Button */}
                  <g transform={`translate(${centerX}, ${bannerY})`}>
                    <rect
                      x="-165"
                      y="-15"
                      width="330"
                      height="30"
                      rx="7"
                      fill={bannerBg}
                      stroke={bannerBorder}
                      strokeWidth="1.8"
                      filter="drop-shadow(0 4px 6px rgba(0,0,0,0.8))"
                    />
                    <text x="-35" y="4" fill="#FEF08A" fontSize="11" fontWeight="900" fontFamily="monospace" textAnchor="middle">
                      PN #{block.private_number} · {block.track_line.replace('_', ' ')} · KM {minKm.toFixed(1)}-{maxKm.toFixed(1)}
                    </text>

                    {/* Interactive Direct Lift Button in SVG */}
                    {onRemoveCustomBlockage && (
                      <g
                        transform="translate(115, 0)"
                        onClick={(e) => {
                          e.stopPropagation();
                          onRemoveCustomBlockage(block.block_id);
                        }}
                        className="cursor-pointer"
                        style={{ pointerEvents: 'all' }}
                      >
                        <rect x="-35" y="-10" width="70" height="20" rx="4" fill="#DC2626" stroke="#FEF08A" strokeWidth="1" />
                        <text x="0" y="4" fill="#FFFFFF" fontSize="10" fontWeight="900" textAnchor="middle" letterSpacing="0.5">
                          ✕ LIFT
                        </text>
                      </g>
                    )}
                  </g>
                </g>
              );
            })}

            {/* ========================================================================= */}
            {/* LIVE TRAIN MARKERS & ENLARGED ULTRA-LEGIBLE TRAIN DESCRIPTION (TD) BERTHS */}
            {/* ========================================================================= */}
            {trainTrajectories.map((train) => {
              const isSelected = selectedTrainNumber === train.train_number;
              const isFreight = ['BOXN-4021', 'BTPN-3312', 'BCN-9104'].includes(train.train_number) || train.train_type === 'Freight';
              const isUpDirection = train.assigned_line?.includes('Up') || ['12401', '12582', '12560'].includes(train.train_number);
              const isDown = ['22436', '12004', '12276', '12302'].includes(train.train_number) || (!isFreight && !isUpDirection);

              const themeColor = isDown ? '#38BDF8' : isFreight ? '#F59E0B' : '#22C55E';

              // Anti-Collision Elevation Staggering:
              // For Down Mainline (y <= 220), top area (y < 160) has loops, station masts, caution signs & block banners.
              // We place Down Main berths BELOW the track (into the 200px gap between y=160 and y=360).
              // For 3rd line (y <= 420), berths sit into the 200px gap below y=360.
              // For Up Mainline (y <= 620), berths sit into the 200px gap above y=560.
              // For EDFC (y <= 780), berths sit into the 200px gap above y=760.
              const isStaggered = (train.tdElevation || 0) % 2 === 1;
              let tdY: number;
              if (train.currentY <= 220) {
                tdY = isStaggered ? train.currentY + 66 : train.currentY + 26;
              } else if (train.currentY <= 420) {
                tdY = isStaggered ? train.currentY + 66 : train.currentY + 26;
              } else if (train.currentY <= 620) {
                tdY = isStaggered ? train.currentY - 100 : train.currentY - 60;
              } else if (train.currentY <= 780) {
                tdY = isStaggered ? train.currentY - 100 : train.currentY - 60;
              } else {
                tdY = train.currentY + 24;
              }
              const aspectColor = train.dbTelemetry?.signal_aspect === 'RED' ? '#EF4444' : train.dbTelemetry?.signal_aspect === 'YELLOW' ? '#EAB308' : '#22C55E';
              const berthWidth = 176;
              const berthHeight = 38;
              const isBerthBelow = tdY > train.currentY;

              return (
                <g
                  key={train.train_number}
                  className="cursor-pointer group"
                  onClick={() => onSelectTrain(train)}
                >
                  {/* Dashed Leader Line from Embedded TD Berth down/up to the Rail Position */}
                  <line
                    x1={train.currentX}
                    y1={isBerthBelow ? tdY : tdY + berthHeight}
                    x2={train.currentX}
                    y2={train.currentY}
                    stroke={themeColor}
                    strokeWidth="1.8"
                    strokeDasharray="3, 3"
                    opacity="0.8"
                  />

                  {/* Active Track Circuit Red Occupancy Illumination beneath the Train */}
                  <rect
                    x={train.currentX - 50}
                    y={train.currentY - 7}
                    width="100"
                    height="14"
                    rx="3"
                    fill="#EF4444"
                    opacity="0.85"
                  />

                  {/* Locomotive Consist on the Rail Track */}
                  <g transform={`translate(${train.currentX}, ${train.currentY})`}>
                    {/* Headlight Beam Cone */}
                    <path
                      d={isUpDirection ? "M -24 0 L -50 -16 L -50 16 Z" : "M 24 0 L 50 -16 L 50 16 Z"}
                      fill={themeColor}
                      opacity="0.35"
                    />

                    {/* Locomotive Body */}
                    <rect
                      x="-24"
                      y="-10"
                      width="48"
                      height="20"
                      rx="4"
                      fill="#070B14"
                      stroke={isSelected ? '#FFFFFF' : themeColor}
                      strokeWidth={isSelected ? 3 : 1.8}
                    />

                    {/* Directional Chevron */}
                    <text
                      x="0"
                      y="4"
                      fill="#FFFFFF"
                      fontSize="11"
                      fontWeight="900"
                      textAnchor="middle"
                    >
                      {isUpDirection ? '◄◄' : '►►'}
                    </text>
                  </g>

                  {/* Authentic CRIS COA Train Describer (TD) Berth (176x38, Sharp Fonts) */}
                  <g transform={`translate(${train.currentX - berthWidth / 2}, ${tdY})`}>
                    {/* Berth Background Plate */}
                    <rect
                      x="0"
                      y="0"
                      width={berthWidth}
                      height={berthHeight}
                      rx="6"
                      fill="#040813"
                      stroke={isSelected ? '#FFFFFF' : themeColor}
                      strokeWidth={isSelected ? 2.8 : 1.6}
                      filter="drop-shadow(0 4px 8px rgba(0,0,0,0.9))"
                    />

                    {/* Aspect Indicator Strip on Left Edge */}
                    <rect x="0" y="0" width="5" height={berthHeight} rx="2" fill={aspectColor} />

                    {/* Top Row: Train Number & Speed (Monospace DIN font) */}
                    <text
                      x="12"
                      y="16"
                      fill="#FFFFFF"
                      fontSize="14"
                      fontFamily="monospace"
                      fontWeight="900"
                    >
                      #{train.train_number}
                    </text>
                    <text
                      x="166"
                      y="16"
                      fill={themeColor}
                      fontSize="13"
                      fontFamily="monospace"
                      fontWeight="900"
                      textAnchor="end"
                    >
                      {typeof train.speedKmh === 'number' ? train.speedKmh.toFixed(0) : train.speedKmh} km/h {isUpDirection ? '◄' : '►'}
                    </text>

                    {/* Bottom Row: Localized Name & KAVACH SIL-4 Badge */}
                    <text
                      x="12"
                      y="31"
                      fill="#CBD5E1"
                      fontSize="11"
                      fontFamily="sans-serif"
                      fontWeight="800"
                    >
                      {getLocalizedTrainName(train.train_name, language, train.train_number).slice(0, 14)} {train.statusText.includes('DIVERT') ? '· [DIV]' : ''}
                    </text>
                    <text
                      x="166"
                      y="31"
                      fill="#38BDF8"
                      fontSize="10"
                      fontFamily="monospace"
                      fontWeight="900"
                      textAnchor="end"
                    >
                      KAVACH 4.0
                    </text>

                    {/* Live Telemetry Pulse Dot */}
                    <circle cx="166" cy="5" r="2.5" fill={themeColor} className="animate-ping" />
                    <circle cx="166" cy="5" r="2.5" fill={themeColor} />
                  </g>
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. STATION MASTER ELECTRONIC INTERLOCKING (EI) & TELEMETRY VDU PANEL       */}
      {/* ========================================================================= */}
      {selectedStation && (
        <div className="bg-[#0A0E1A] rounded-2xl border border-sky-500/30 p-5 space-y-4 shadow-2xl animate-in fade-in">
          {/* Station Selector Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-600/20 text-sky-400 rounded-2xl border border-sky-500/40">
                <Radio className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-black text-white uppercase tracking-wider">
                    {selectedStation.name} ({selectedStation.code}) — {t.interlockingTitle}
                  </h4>
                  <span className="px-2 py-0.5 rounded bg-sky-950 text-sky-400 font-mono text-xs font-extrabold border border-sky-500/30">
                    KM {selectedStation.km.toFixed(1)}
                  </span>
                  {selectedStation.isBlockZone && (
                    <span className="px-2 py-0.5 rounded bg-rose-950 text-rose-300 font-bold text-xs border border-rose-500/40 animate-pulse">
                      {t.blockZone}
                    </span>
                  )}
                </div>
                <p className="text-sm text-slate-400 mt-0.5 font-sans">
                  {selectedStation.classification} · {selectedStation.mainLines} Running Mainlines · {selectedStation.loopLines} Berthing Loops · {selectedStation.remarks}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-xl bg-emerald-950 text-emerald-300 font-mono text-sm font-bold border border-emerald-500/40 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                EI SIL-4 ONLINE (HOT STANDBY)
              </span>
            </div>
          </div>

          {/* Electronic Interlocking Relays & Point Machine Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 text-sm font-mono">
            {/* Card 1: Point Machine Status */}
            <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800 space-y-1.5">
              <span className="text-slate-400 text-xs font-bold block">{t.pointStatus}</span>
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-white text-sm">
                  {selectedStation.code === 'SOM' ? 'PT #12A: ' + (isBlockActive ? 'REVERSE (3RD LINE)' : 'NORMAL') : t.allPointsNormal}
                </span>
                <span className={`w-2.5 h-2.5 rounded-full ${isBlockActive && selectedStation.code === 'SOM' ? 'bg-sky-400' : 'bg-emerald-400'}`}></span>
              </div>
              <span className="text-xs text-slate-500 block">1:12 Thick Web Switch (TWS) · 4.2s Throw Latency</span>
            </div>

            {/* Card 2: MSDAC Track Vacancy */}
            <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800 space-y-1.5">
              <span className="text-slate-400 text-xs font-bold block">{t.axleVacancy}</span>
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-white text-sm">
                  {selectedStation.code === 'SOM' && isBlockActive ? 'DOWN MAIN: OCCUPIED (TSR)' : t.allSectionsClear}
                </span>
                <span className={`w-2.5 h-2.5 rounded-full ${isBlockActive && selectedStation.code === 'SOM' ? 'bg-rose-500 animate-ping' : 'bg-emerald-400'}`}></span>
              </div>
              <span className="text-xs text-slate-500 block">Frauscher RSR123 · IN/OUT Axle Delta: 0</span>
            </div>

            {/* Card 3: 25 kV SCADA Traction Feeder */}
            <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800 space-y-1.5">
              <span className="text-slate-400 text-xs font-bold block">{t.scadaVoltage}</span>
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-emerald-400 text-sm">25.2 kV · 50.1 Hz</span>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
              </div>
              <span className="text-xs text-slate-500 block">Traction Feeder: ENERGIZED · CB-101 CLOSED</span>
            </div>

            {/* Card 4: Kavach 4.0 Stationary Unit */}
            <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800 space-y-1.5">
              <span className="text-slate-400 text-xs font-bold block">{t.kavachStatus}</span>
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-sky-400 text-sm">UHF TDMA: LOCKED</span>
                <span className="w-2.5 h-2.5 rounded-full bg-sky-400"></span>
              </div>
              <span className="text-xs text-slate-500 block">AES-128 CBC-MAC · Control Table Validated</span>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. SLIDE-OVER MODALS (CRIS DATABASE CONSOLE & FORM T/409 CAUTION ORDER)    */}
      {/* ========================================================================= */}
      <LiveFeedController
        isOpen={isFeedControllerOpen}
        onClose={() => setIsFeedControllerOpen(false)}
      />

      <CautionOrderModal
        isOpen={isCautionOrderOpen}
        onClose={() => setIsCautionOrderOpen(false)}
      />
    </div>
  );
};
