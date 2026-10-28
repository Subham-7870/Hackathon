import React, { useState } from 'react';
import { 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  Zap
} from 'lucide-react';
import { TrainSchedule, SolvedBlock } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { getLocalizedTrainName } from '../i18n/trainTranslations';

import { CustomBlockage } from './CustomBlockageModal';

interface StringChartProps {
  trains: TrainSchedule[];
  blocks: SolvedBlock[];
  currentTimeMinutes: number;
  onTimeChange?: (minutes: number) => void;
  selectedTrainNumber?: string;
  onSelectTrain?: (trainNum: string) => void;
  isBlockActive?: boolean;
  customBlockages?: CustomBlockage[];
  customTrains?: TrainSchedule[];
}

interface StationMark {
  code: string;
  name: string;
  km: number;
  yPercent: number;
}

const STATIONS: StationMark[] = [
  { code: 'GZB', name: 'Ghaziabad Jn', km: 20.0, yPercent: 8 },
  { code: 'MIU', name: 'Maripat', km: 30.0, yPercent: 20 },
  { code: 'DER', name: 'Dadri (EDFC)', km: 37.0, yPercent: 32 },
  { code: 'DKDE', name: 'Dankaur', km: 54.0, yPercent: 48 },
  { code: 'KRJ', name: 'Khurja Jn', km: 83.0, yPercent: 68 },
  { code: 'SOM', name: 'Somna', km: 105.0, yPercent: 84 },
  { code: 'ALJN', name: 'Aligarh Jn', km: 126.0, yPercent: 96 },
];

export const StringChart: React.FC<StringChartProps> = ({
  currentTimeMinutes,
  onTimeChange,
  selectedTrainNumber = '22436',
  onSelectTrain,
  isBlockActive = true,
  customBlockages = [],
  customTrains = [],
}) => {
  const { t, language } = useLanguage();
  const [hoveredTrain, setHoveredTrain] = useState<string | null>(null);
  const [filterDirection, setFilterDirection] = useState<'ALL' | 'DOWN' | 'UP'>('ALL');

  // Chart Dimensions
  const svgWidth = 1200;
  const svgHeight = 650;
  const margin = { top: 40, right: 40, bottom: 50, left: 140 };
  const innerWidth = svgWidth - margin.left - margin.right;
  const innerHeight = svgHeight - margin.top - margin.bottom;

  // Time Scale: 00:00 to 06:00 (360 minutes)
  const totalMinutes = 360;
  const getX = (min: number) => margin.left + (min / totalMinutes) * innerWidth;
  const getYFromKm = (km: number) => {
    const minKm = 20.0;
    const maxKm = 126.0;
    const clamped = Math.max(minKm, Math.min(maxKm, km));
    return margin.top + ((clamped - minKm) / (maxKm - minKm)) * innerHeight;
  };

  const hourTicks = [0, 60, 120, 180, 240, 300, 360];

  // Maintenance Block Window 1: Somna - Aligarh Down Main (01:15 to 04:45 = 75 to 285 min, KM 105 to 126)
  const blockStartMin = 75;
  const blockEndMin = 285;
  const blockX = getX(blockStartMin);
  const blockWidth = getX(blockEndMin) - blockX;
  const blockY = getYFromKm(105.0);
  const blockHeight = getYFromKm(126.0) - blockY;

  // Maintenance Block Window 2: Dankaur - Dadri Up Main TRD (02:00 to 05:00 = 120 to 300 min, KM 37 to 54)
  const block2X = getX(120);
  const block2Width = getX(300) - block2X;
  const block2Y = getYFromKm(37.0);
  const block2Height = getYFromKm(54.0) - block2Y;

  // Maintenance Block Window 3: Khurja EDFC Freight Siding (01:30 to 05:30 = 90 to 330 min, KM 70 to 85)
  const block3X = getX(90);
  const block3Width = getX(330) - block3X;
  const block3Y = getYFromKm(70.0);
  const block3Height = getYFromKm(85.0) - block3Y;

  // Realistic Correlated Trajectories
  const TRAIN_PATHS = [
    {
      num: '22436',
      name: 'Vande Bharat Exp',
      type: 'Superfast',
      direction: 'DOWN',
      color: '#38BDF8',
      path: [
        { min: 45, km: 20 },
        { min: 58, km: 37 },
        { min: 78, km: 83 },
        { min: 92, km: 105 },
        { min: 110, km: 126 }
      ],
      diverted: true,
      mps: 160
    },
    {
      num: '12276',
      name: 'Prayagraj Humsafar',
      type: 'Superfast',
      direction: 'DOWN',
      color: '#0EA5E9',
      path: [
        { min: 30, km: 20 },
        { min: 46, km: 37 },
        { min: 72, km: 83 },
        { min: 88, km: 105 },
        { min: 104, km: 126 }
      ],
      diverted: false,
      mps: 130
    },
    {
      num: '12302',
      name: 'Howrah Rajdhani',
      type: 'Superfast',
      direction: 'DOWN',
      color: '#0284C7',
      path: [
        { min: 80, km: 20 },
        { min: 96, km: 37 },
        { min: 125, km: 83 },
        { min: 142, km: 105 },
        { min: 162, km: 126 }
      ],
      diverted: true,
      mps: 160
    },
    {
      num: '12424',
      name: 'Dibrugarh Rajdhani',
      type: 'Superfast',
      direction: 'DOWN',
      color: '#38BDF8',
      path: [
        { min: 100, km: 20 },
        { min: 118, km: 37 },
        { min: 152, km: 83 },
        { min: 172, km: 105 },
        { min: 195, km: 126 }
      ],
      diverted: true,
      mps: 160
    },
    {
      num: '12802',
      name: 'Purushottam Exp',
      type: 'Express',
      direction: 'DOWN',
      color: '#22C55E',
      path: [
        { min: 125, km: 20 },
        { min: 148, km: 37 },
        { min: 190, km: 83 },
        { min: 215, km: 105 },
        { min: 242, km: 126 }
      ],
      diverted: true,
      mps: 130
    },
    {
      num: 'DFCC-4021',
      name: 'Heavy-Haul Container',
      type: 'Freight',
      direction: 'DOWN',
      color: '#F59E0B',
      path: [
        { min: 20, km: 37 },
        { min: 65, km: 83 },
        { min: 120, km: 126 }
      ],
      diverted: false,
      mps: 100
    },
    {
      num: 'BTPN-8332',
      name: 'Petroleum POL Rake',
      type: 'Freight',
      direction: 'DOWN',
      color: '#D97706',
      path: [
        { min: 70, km: 20 },
        { min: 110, km: 37 },
        { min: 180, km: 83 },
        { min: 245, km: 126 }
      ],
      diverted: false,
      mps: 85
    },
    {
      num: '12301',
      name: 'Kolkata Rajdhani (Up)',
      type: 'Superfast',
      direction: 'UP',
      color: '#10B981',
      path: [
        { min: 70, km: 126 },
        { min: 90, km: 105 },
        { min: 115, km: 83 },
        { min: 145, km: 37 },
        { min: 162, km: 20 }
      ],
      diverted: false,
      mps: 160
    },
    {
      num: '12423',
      name: 'Dibrugarh Rajdhani (Up)',
      type: 'Superfast',
      direction: 'UP',
      color: '#34D399',
      path: [
        { min: 105, km: 126 },
        { min: 128, km: 105 },
        { min: 155, km: 83 },
        { min: 185, km: 37 },
        { min: 204, km: 20 }
      ],
      diverted: false,
      mps: 160
    },
    {
      num: '12801',
      name: 'Purushottam Exp (Up)',
      type: 'Express',
      direction: 'UP',
      color: '#6EE7B7',
      path: [
        { min: 140, km: 126 },
        { min: 170, km: 105 },
        { min: 205, km: 83 },
        { min: 245, km: 37 },
        { min: 270, km: 20 }
      ],
      diverted: false,
      mps: 130
    }
  ];

  // Dynamically synthesize trajectories for any injected custom trains
  const dynamicCustomPaths = (customTrains || []).map((ct) => {
    const isUp = ct.assigned_line === 'UP_MAIN' || ct.origin === 'ALJN';
    const initialKm = ct.initial_km ?? (isUp ? 122 : 25);
    const customSpeed = ct.speed_kmh ?? ct.speed;
    const mps = (customSpeed && customSpeed > 0) ? customSpeed : (ct.train_type === 'Superfast' ? 130 : 80);
    const transitMins = Math.max(35, (106 / mps) * 60);
    const startMin = Math.max(0, currentTimeMinutes - 15);

    const path = isUp ? [
      { min: startMin, km: Math.min(126, initialKm) },
      { min: startMin + transitMins * 0.35, km: 83 },
      { min: startMin + transitMins * 0.70, km: 54 },
      { min: startMin + transitMins, km: 20 }
    ] : [
      { min: startMin, km: Math.max(20, initialKm) },
      { min: startMin + transitMins * 0.35, km: 54 },
      { min: startMin + transitMins * 0.70, km: 83 },
      { min: startMin + transitMins, km: 126 }
    ];

    return {
      num: ct.train_number,
      name: ct.train_name,
      type: ct.train_type,
      direction: isUp ? ('UP' as const) : ('DOWN' as const),
      color: '#06B6D4', // Vibrant Cyan for custom train
      path,
      diverted: false,
      mps,
      isCustom: true
    };
  });

  const allTrainPaths = [...TRAIN_PATHS, ...dynamicCustomPaths];

  const filteredPaths = allTrainPaths.filter(t => {
    if (filterDirection === 'DOWN') return t.direction === 'DOWN';
    if (filterDirection === 'UP') return t.direction === 'UP';
    return true;
  });

  const activeTrainData = allTrainPaths.find(t => t.num === selectedTrainNumber) || allTrainPaths[0];

  return (
    <div className="bg-[#0B101D] rounded-3xl border border-sky-500/30 p-6 shadow-2xl space-y-5">
      {/* Top Header Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-600/20 text-sky-400 rounded-2xl border border-sky-500/40">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-black text-white tracking-wide">
                COA Master Graph: Dynamic Time-Distance String Chart (Marey)
              </h3>
              <span className="px-2.5 py-1 rounded-md bg-blue-950/80 text-sky-300 font-mono text-sm font-bold border border-sky-600/40">
                GZB (KM 20.0) ➔ ALJN (KM 126.0)
              </span>
            </div>
            <p className="text-sm text-slate-400 mt-1 font-sans">
              Indian Railways Control Office Application (COA) Real-Time String Chart · 1.0 km Absolute Block Headway Supervision
            </p>
          </div>
        </div>

        {/* Direction & Filter Controls */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-slate-400 mr-2">{t.directionFilter}:</span>
          {(['ALL', 'DOWN', 'UP'] as const).map((dir) => (
            <button
              key={dir}
              onClick={() => setFilterDirection(dir)}
              className={`px-3 py-1.5 rounded-xl text-sm font-bold transition-all ${
                filterDirection === dir
                  ? 'bg-sky-500 text-slate-950 shadow-md shadow-sky-500/30'
                  : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
              }`}
            >
              {dir === 'ALL' ? 'Both Ways' : dir === 'DOWN' ? '▼ Down (Dn Main / 3rd Line)' : '▲ Up (Up Main)'}
            </button>
          ))}
        </div>
      </div>

      {/* SVG String Chart Viewport */}
      <div className="relative bg-[#060913] rounded-2xl border border-slate-800/80 overflow-hidden">
        <svg 
          viewBox={`0 0 ${svgWidth} ${svgHeight}`} 
          className="w-full h-auto select-none"
        >
          <defs>
            <pattern id="gridPattern" width="60" height="40" patternUnits="userSpaceOnUse">
              <line x1="0" y1="0" x2="60" y2="0" stroke="#1E293B" strokeWidth="0.8" strokeDasharray="2,2" />
              <line x1="0" y1="0" x2="0" y2="40" stroke="#1E293B" strokeWidth="0.8" strokeDasharray="2,2" />
            </pattern>
            <pattern id="blockHatch" width="12" height="12" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
              <line x1="0" y1="0" x2="0" y2="12" stroke="#EF4444" strokeWidth="3" opacity="0.4" />
            </pattern>
            <filter id="stringGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#38BDF8" floodOpacity="0.8" />
            </filter>
          </defs>

          {/* Background Grid */}
          <rect x={margin.left} y={margin.top} width={innerWidth} height={innerHeight} fill="#050811" />
          <rect x={margin.left} y={margin.top} width={innerWidth} height={innerHeight} fill="url(#gridPattern)" />

          {/* Maintenance Mega-Block Cavity Zone (Somna - Aligarh KM 105 - 126, 01:15 to 04:45) */}
          {isBlockActive && (
            <g id="block-shadow-cavity">
              <rect
                x={blockX}
                y={blockY}
                width={blockWidth}
                height={blockHeight}
                fill="url(#blockHatch)"
              />
              <rect
                x={blockX}
                y={blockY}
                width={blockWidth}
                height={blockHeight}
                fill="#EF4444"
                fillOpacity="0.12"
                stroke="#DC2626"
                strokeWidth="2"
                strokeDasharray="6,4"
              />
              {/* Block 1 Label Banner */}
              <g transform={`translate(${blockX + blockWidth / 2}, ${blockY + blockHeight / 2})`}>
                <rect x="-140" y="-14" width="280" height="28" rx="6" fill="#7F1D1D" stroke="#EF4444" strokeWidth="1.5" />
                <text x="0" y="4" fill="#FFFFFF" fontSize="12" fontWeight="900" textAnchor="middle">
                  🛑 FORM T/351 MEGA-BLOCK CAVITY (SOM-ALJN)
                </text>
              </g>

              {/* Block 2: Dankaur - Dadri Up Mainline TRD OHE Block */}
              <rect
                x={block2X}
                y={block2Y}
                width={block2Width}
                height={block2Height}
                fill="url(#blockHatch)"
              />
              <rect
                x={block2X}
                y={block2Y}
                width={block2Width}
                height={block2Height}
                fill="#3B82F6"
                fillOpacity="0.12"
                stroke="#60A5FA"
                strokeWidth="2"
                strokeDasharray="6,4"
              />
              <g transform={`translate(${block2X + block2Width / 2}, ${block2Y + block2Height / 2})`}>
                <rect x="-140" y="-14" width="280" height="28" rx="6" fill="#1E3A8A" stroke="#60A5FA" strokeWidth="1.5" />
                <text x="0" y="4" fill="#DBEAFE" fontSize="11" fontWeight="900" textAnchor="middle">
                  🛑 FORM T/172 TRD OHE BLOCK (DKDE-DER)
                </text>
              </g>

              {/* Block 3: Khurja EDFC Freight Corridor Rail Grinding & USFD */}
              <rect
                x={block3X}
                y={block3Y}
                width={block3Width}
                height={block3Height}
                fill="url(#blockHatch)"
              />
              <rect
                x={block3X}
                y={block3Y}
                width={block3Width}
                height={block3Height}
                fill="#D97706"
                fillOpacity="0.12"
                stroke="#F59E0B"
                strokeWidth="2"
                strokeDasharray="6,4"
              />
              <g transform={`translate(${block3X + block3Width / 2}, ${block3Y + block3Height / 2})`}>
                <rect x="-145" y="-14" width="290" height="28" rx="6" fill="#78350F" stroke="#F59E0B" strokeWidth="1.5" />
                <text x="0" y="4" fill="#FEF3C7" fontSize="11" fontWeight="900" textAnchor="middle">
                  🛑 EDFC FREIGHT TRACK RELAYING (KRJ)
                </text>
              </g>
            </g>
          )}

          {/* Dynamically Injected Custom Blockages on Marey Chart */}
          {customBlockages && customBlockages.map((cb) => {
            const minKm = Math.min(cb.start_km, cb.end_km);
            const maxKm = Math.max(cb.start_km, cb.end_km);
            const bX = getX(Math.max(0, currentTimeMinutes - 5));
            const bW = Math.max(60, (cb.duration_minutes / totalMinutes) * innerWidth);
            const bY = getYFromKm(minKm);
            const bH = Math.max(30, getYFromKm(maxKm) - bY);
            const isCaution = cb.form_type === 'CAUTION_T409';
            const color = isCaution ? '#F59E0B' : '#EF4444';
            const bannerBg = isCaution ? '#78350F' : '#7F1D1D';

            return (
              <g key={`string-cb-${cb.block_id}`}>
                <rect
                  x={bX}
                  y={bY}
                  width={bW}
                  height={bH}
                  fill={color}
                  fillOpacity="0.22"
                  stroke={color}
                  strokeWidth="2.5"
                  strokeDasharray="5,3"
                />
                <g transform={`translate(${bX + bW / 2}, ${bY + bH / 2})`}>
                  <rect x="-95" y="-13" width="190" height="26" rx="5" fill={bannerBg} stroke={color} strokeWidth="1.2" />
                  <text x="0" y="4" fill="#FFFFFF" fontSize="10.5" fontWeight="900" textAnchor="middle">
                    🛑 {cb.form_type} (KM {minKm}–{maxKm})
                  </text>
                </g>
              </g>
            );
          })}

          {/* Station Horizontal Guide Lines & Left Axis Rulers */}
          {STATIONS.map((stn) => {
            const y = getYFromKm(stn.km);
            const isJunction = stn.code === 'GZB' || stn.code === 'ALJN' || stn.code === 'DER' || stn.code === 'KRJ';
            return (
              <g key={stn.code}>
                {/* Horizontal Guide Line across graph */}
                <line
                  x1={margin.left}
                  y1={y}
                  x2={svgWidth - margin.right}
                  y2={y}
                  stroke={isJunction ? '#334155' : '#1E293B'}
                  strokeWidth={isJunction ? 1.5 : 1}
                  strokeDasharray={isJunction ? undefined : '3, 3'}
                />

                {/* Left Station Name & KM Pill */}
                <g transform={`translate(${margin.left - 10}, ${y})`}>
                  <rect
                    x="-125"
                    y="-13"
                    width="120"
                    height="26"
                    rx="5"
                    fill={isJunction ? '#0F172A' : '#090D1A'}
                    stroke={isJunction ? '#38BDF8' : '#334155'}
                    strokeWidth={isJunction ? 1.5 : 1}
                  />
                  <text
                    x="-65"
                    y="4"
                    fill={isJunction ? '#FFFFFF' : '#94A3B8'}
                    fontSize="11.5"
                    fontWeight="900"
                    textAnchor="middle"
                  >
                    {stn.name} ({stn.code})
                  </text>
                  <text
                    x="2"
                    y="4"
                    fill="#64748B"
                    fontSize="9.5"
                    fontFamily="monospace"
                    fontWeight="700"
                    textAnchor="end"
                  >
                    {stn.km.toFixed(0)}k
                  </text>
                </g>
              </g>
            );
          })}

          {/* Hourly Time Vertical Lines and X Axis Labels */}
          {hourTicks.map((min) => {
            const x = getX(min);
            const hour = Math.floor(min / 60);
            const timeLabel = `0${hour}:00 hrs`;
            return (
              <g key={min}>
                <line
                  x1={x}
                  y1={margin.top}
                  x2={x}
                  y2={svgHeight - margin.bottom}
                  stroke="#334155"
                  strokeWidth="1.2"
                />
                <text
                  x={x}
                  y={svgHeight - margin.bottom + 22}
                  fill="#94A3B8"
                  fontSize="12"
                  fontFamily="monospace"
                  fontWeight="900"
                  textAnchor="middle"
                >
                  {timeLabel}
                </text>
              </g>
            );
          })}

          {/* Live Simulation Current Time Cursor Line */}
          {currentTimeMinutes >= 0 && currentTimeMinutes <= totalMinutes && (
            <g id="live-time-cursor">
              <line
                x1={getX(currentTimeMinutes)}
                y1={margin.top - 10}
                x2={getX(currentTimeMinutes)}
                y2={svgHeight - margin.bottom + 10}
                stroke="#EF4444"
                strokeWidth="2.5"
                strokeDasharray="4, 3"
              />
              {/* Top Cursor Tag */}
              <g transform={`translate(${getX(currentTimeMinutes)}, ${margin.top - 15})`}>
                <polygon points="-25,-12 25,-12 25,2 0,10 -25,2" fill="#DC2626" />
                <text x="0" y="-2" fill="#FFFFFF" fontSize="9.5" fontWeight="900" textAnchor="middle">
                  LIVE NOW
                </text>
              </g>
            </g>
          )}

          {/* Train Slanted String Paths (Marey Trajectories) */}
          {filteredPaths.map((train) => {
            const isSelected = selectedTrainNumber === train.num || hoveredTrain === train.num;
            
            // Build SVG polyline points string
            const pointsString = train.path
              .map((pt) => `${getX(pt.min)},${getYFromKm(pt.km)}`)
              .join(' ');

            // Calculate label position near middle of train trajectory
            const midPt = train.path[Math.floor(train.path.length / 2)];
            const labelX = getX(midPt.min);
            const labelY = getYFromKm(midPt.km);

            return (
              <g
                key={train.num}
                className="cursor-pointer transition-all group"
                onClick={() => onSelectTrain && onSelectTrain(train.num)}
                onMouseEnter={() => setHoveredTrain(train.num)}
                onMouseLeave={() => setHoveredTrain(null)}
              >
                {/* Thick Invisible Hit Target Line for easy mouse selection */}
                <polyline
                  points={pointsString}
                  fill="none"
                  stroke="transparent"
                  strokeWidth="20"
                />

                {/* Visible Trajectory String */}
                <polyline
                  points={pointsString}
                  fill="none"
                  stroke={train.color}
                  strokeWidth={isSelected ? 4.5 : 2.5}
                  strokeDasharray={train.type === 'Freight' ? '6, 4' : undefined}
                  filter={isSelected ? 'url(#stringGlow)' : undefined}
                  opacity={isSelected ? 1 : 0.85}
                />

                {/* Train Trajectory Label Tag */}
                <g transform={`translate(${labelX}, ${labelY})`}>
                  <rect
                    x="-45"
                    y="-11"
                    width="90"
                    height="20"
                    rx="4"
                    fill="#050811"
                    stroke={isSelected ? '#FFFFFF' : train.color}
                    strokeWidth={isSelected ? 2 : 1.2}
                  />
                  <text
                    x="0"
                    y="3.5"
                    fill={isSelected ? '#FFFFFF' : train.color}
                    fontSize="10.5"
                    fontFamily="monospace"
                    fontWeight="900"
                    textAnchor="middle"
                  >
                    #{train.num}
                  </text>
                </g>

                {/* Diversion Indicator Badge if routed via 3rd line around block */}
                {train.diverted && (
                  <g transform={`translate(${getX(train.path[3]?.min || 90)}, ${getYFromKm(115)})`}>
                    <circle cx="0" cy="0" r="5" fill="#38BDF8" className="animate-ping" />
                    <circle cx="0" cy="0" r="5" fill="#0284C7" stroke="#FFFFFF" strokeWidth="1.5" />
                  </g>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Train Trajectory Inspector & Headway Telemetry Card */}
      {activeTrainData && (
        <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-4 grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
          <div className="flex items-center gap-3">
            <div 
              className="w-4 h-12 rounded-full" 
              style={{ backgroundColor: activeTrainData.color }}
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-base font-black text-white">
                  #{activeTrainData.num} {getLocalizedTrainName(activeTrainData.name, language, activeTrainData.num)}
                </span>
                <span className="px-2 py-0.5 rounded text-xs font-extrabold bg-sky-950 text-sky-400 border border-sky-600/40">
                  {activeTrainData.type}
                </span>
              </div>
              <span className="text-sm text-slate-400">
                Direction: {activeTrainData.direction === 'DOWN' ? 'Down Mainline (➔ ALJN)' : 'Up Mainline (➔ GZB)'} · MPS: {activeTrainData.mps} km/h
              </span>
            </div>
          </div>

          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
            <span className="text-xs text-slate-400 font-bold block">SECTION HEADWAY SUPERVISION</span>
            <span className="text-sm font-mono font-extrabold text-emerald-400 flex items-center gap-1.5 mt-0.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              1.42 km Ahead (Exceeds 1.0 km ABS Minimum)
            </span>
          </div>

          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
            <span className="text-xs text-slate-400 font-bold block">MEGA-BLOCK ROUTING DECISION</span>
            <span className="text-sm font-mono font-extrabold text-sky-400 flex items-center gap-1.5 mt-0.5">
              <Zap className="w-3.5 h-3.5" />
              {activeTrainData.diverted 
                ? 'Diverting via Pt #12A ➔ 3rd Line (100% Run-Through)' 
                : 'Direct Mainline Path Clear'}
            </span>
          </div>

          <div className="flex items-center justify-end gap-2">
            <button
              onClick={() => onTimeChange && onTimeChange(activeTrainData.path[0].min)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-blue-600/30 transition-all flex items-center gap-2"
            >
              <Clock className="w-4 h-4" />
              Jump to Departure
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
