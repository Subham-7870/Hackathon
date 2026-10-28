import React from 'react';
import { 
  Gauge, 
  ShieldAlert, 
  Radio, 
  Zap, 
  Navigation, 
  Layers, 
  AlertTriangle,
  ArrowUpRight,
  Clock,
  CheckCircle2
} from 'lucide-react';
import { LiveTelemetryStream } from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import { getLocalizedTrainName } from '../i18n/trainTranslations';

interface LiveCabDashboardProps {
  liveData: LiveTelemetryStream | null;
  selectedTrainNumber?: string;
  onSelectTrain: (trainNum: string) => void;
  isLiveMode: boolean;
  onToggleLiveMode: () => void;
}

export const LiveCabDashboard: React.FC<LiveCabDashboardProps> = ({
  liveData,
  selectedTrainNumber = '22436',
  onSelectTrain,
  isLiveMode,
  onToggleLiveMode
}) => {
  const { language } = useLanguage();
  if (!liveData || !liveData.trains.length) return null;

  const currentTrain = liveData.trains.find(t => t.train_number === selectedTrainNumber) || liveData.trains[0];
  const speedPercentage = Math.min(100, Math.round((currentTrain.current_speed_kmh / currentTrain.max_permitted_speed) * 100));

  // Dynamic signal context based on train position, corridor section, and block state
  const getSignalContext = () => {
    const km = currentTrain.current_km;
    const isDownMain = currentTrain.assigned_line.includes('Down');
    const isDiverted = Boolean(currentTrain.is_diverted) || currentTrain.assigned_line.includes('Bypass');

    if (km < 35) {
      return {
        id: 'Signal S-18 Ghaziabad Starter',
        location: 'Ghaziabad Jn (KM 26)',
        explanation: 'Section clear toward Khurja'
      };
    } else if (km < 95) {
      return {
        id: 'Signal S-54 Khurja Automatic Block',
        location: 'Khurja Section (KM 83)',
        explanation: 'Normal line clear toward Aligarh'
      };
    } else if (km >= 95 && km < 118) {
      return {
        id: 'Signal S-1012 Aligarh Distant (Approach)',
        location: 'Aligarh Outer (KM 104)',
        explanation: isDownMain 
          ? '⚠️ DOWN MAINLINE BLOCKED AT KM 120-132 — Attention: Diverting Route Set via Pt #12A' 
          : 'Running line unblocked & clear'
      };
    } else if (km >= 118 && km <= 134) {
      if (isDiverted) {
        return {
          id: 'Signal S-1014 Aligarh Home (Pt #12A Divergence)',
          location: 'Aligarh Jn Interlocking (KM 126)',
          explanation: '🟡 Caution: 50 km/h PSR over turnout (Bypassing Active Maintenance Block via SLW Chord)'
        };
      } else if (isDownMain) {
        return {
          id: 'Signal S-1016 Down Mainline Starter',
          location: 'Aligarh Block Boundary (KM 120)',
          explanation: '🔴 DANGER: 3-Department Maintenance Block Active (Track Occupied / Disconnected)'
        };
      } else {
        return {
          id: 'Signal S-1015 Up Passenger Running Signal',
          location: 'Aligarh Jn Up Corridor (KM 126)',
          explanation: '🟢 Up Passenger Line is completely unblocked and clear'
        };
      }
    } else if (km > 134 && km < 220) {
      return {
        id: 'Signal S-1024 Tundla Section Automatic Block',
        location: 'Tundla Jn Approach (KM 204)',
        explanation: 'Re-entered clear Down Mainline past Pt #14B'
      };
    } else if (km >= 220 && km < 360) {
      return {
        id: 'Signal S-1052 Etawah Automatic Block',
        location: 'Etawah Section (KM 296)',
        explanation: 'Clear trunk corridor to Kanpur'
      };
    } else {
      return {
        id: 'Signal S-1084 Kanpur Central Reception',
        location: 'Kanpur Central (KM 440)',
        explanation: 'Approaching terminal yard'
      };
    }
  };

  const signalCtx = getSignalContext();

  return (
    <div className="bg-[#0B0F19] rounded-3xl border border-slate-800 shadow-2xl p-6 space-y-6">
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-br from-indigo-600 to-sky-500 rounded-xl text-white shadow-md">
            <Gauge className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-extrabold text-white">
                Kavach 4.0 Driver Cab Signalling & Live Telemetry HUD
              </h3>
              <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-purple-950/80 text-purple-300 border border-purple-500/40">
                RDSO / SPN / 196 / 2020
              </span>
            </div>
            <p className="text-sm text-slate-400">
              Live telemetry streamed directly from <strong className="text-sky-400 font-mono">rail_telemetry.db</strong> (1 Hz real-time tick).
            </p>
          </div>
        </div>

        {/* Live / Simulated Stream Status Indicator */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleLiveMode}
            className={`px-3.5 py-1.5 rounded-xl text-sm font-extrabold flex items-center gap-2 transition-all border ${
              isLiveMode
                ? 'bg-rose-950/90 text-rose-300 border-rose-500 shadow-lg shadow-rose-950/60 animate-pulse'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
            }`}
          >
            <span className={`w-2.5 h-2.5 rounded-full ${isLiveMode ? 'bg-rose-500 animate-ping' : 'bg-slate-600'}`}></span>
            <span>{isLiveMode ? '🔴 LIVE DB STREAM ACTIVE' : '⏸️ MANUAL SCRUBBER MODE'}</span>
          </button>

          <div className="bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl text-sm font-mono text-slate-300 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-sky-400" />
            <span>DB Server: <strong className="text-white">{liveData.server_time}</strong></span>
          </div>
        </div>
      </div>

      {/* Train Selector Chips */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-slate-400 font-bold mr-2">Monitored Train:</span>
        {liveData.trains.map(t => {
          const isSelected = t.train_number === currentTrain.train_number;
          return (
            <button
              key={t.train_number}
              onClick={() => onSelectTrain(t.train_number)}
              className={`px-3 py-1.5 rounded-xl text-sm font-extrabold transition-all border flex items-center gap-2 ${
                isSelected
                  ? 'bg-sky-600 text-white border-sky-400 shadow-md shadow-sky-600/30 ring-1 ring-white/20'
                  : 'bg-slate-900/90 text-slate-400 border-slate-800 hover:text-white hover:bg-slate-800'
              }`}
            >
              <span>#{t.train_number}</span>
              <span className="text-xs opacity-80">{getLocalizedTrainName(t.train_name, language, t.train_number).slice(0, 16)}</span>
              <span className="font-mono text-sky-300">{t.current_speed_kmh.toFixed(1)} km/h</span>
            </button>
          );
        })}
      </div>

      {/* Cab Signalling Instrument Cluster */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Speedometer Instrument (4 Cols) */}
        <div className="lg:col-span-4 bg-[#070B14] rounded-2xl border border-slate-800/90 p-5 flex flex-col justify-between shadow-xl">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800/60">
            <span className="text-sm font-bold text-slate-400 flex items-center gap-1.5">
              <Gauge className="w-4 h-4 text-sky-400" />
              Digital Cab Speedometer
            </span>
            <span className="text-xs font-mono text-slate-400 font-bold bg-slate-900 px-2 py-0.5 rounded-md border border-slate-800">
              {currentTrain.loco_type}
            </span>
          </div>

          <div className="py-6 flex flex-col items-center justify-center">
            <div className="relative flex items-center justify-center">
              {/* Outer gauge ring */}
              <div className="w-40 h-40 rounded-full border-4 border-slate-800 flex items-center justify-center relative shadow-2xl">
                <div 
                  className="w-36 h-36 rounded-full border-4 border-sky-500/20 border-t-sky-400 flex flex-col items-center justify-center transition-all duration-300"
                  style={{ transform: `rotate(${speedPercentage * 1.8 - 90}deg)` }}
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-4xl font-black text-white font-mono tracking-tight">
                    {currentTrain.current_speed_kmh.toFixed(1)}
                  </span>
                  <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
                    KM / H (LIVE)
                  </span>
                </div>
              </div>
            </div>

            {/* Target Ceiling & Turnout Limits */}
            <div className="mt-4 flex items-center justify-between w-full px-4 text-sm font-mono">
              <div className="text-left">
                <span className="text-xs text-slate-500 block">Target PSR</span>
                <strong className={`text-sm ${currentTrain.target_speed_kmh < 100 ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {currentTrain.target_speed_kmh} km/h
                </strong>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-500 block">Max Permitted</span>
                <strong className="text-sm text-sky-400">
                  {currentTrain.max_permitted_speed} km/h
                </strong>
              </div>
            </div>
          </div>
        </div>

        {/* 4-Aspect Colour Light Signal Lamp (3 Cols) */}
        <div className="lg:col-span-3 bg-[#070B14] rounded-2xl border border-slate-800/90 p-5 flex flex-col justify-between shadow-xl">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800/60">
            <span className="text-sm font-bold text-slate-400 flex items-center gap-1.5">
              <Radio className="w-4 h-4 text-emerald-400" />
              Automatic Block Signal
            </span>
            <span className="text-xs font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-md border border-emerald-700/60">
              NEXT ASPECT
            </span>
          </div>

          <div className="py-4 flex flex-col items-center justify-center space-y-3">
            {/* Visual 4-Aspect Lamp Housing */}
            <div className="bg-slate-950 p-3 rounded-2xl border-2 border-slate-800 flex flex-col gap-2.5 shadow-2xl">
              {/* Green */}
              <div className={`w-8 h-8 rounded-full border-2 transition-all ${
                currentTrain.signal_aspect === 'GREEN'
                  ? 'bg-emerald-500 border-emerald-300 shadow-lg shadow-emerald-500/80 ring-2 ring-emerald-400 animate-pulse'
                  : 'bg-emerald-950/40 border-slate-800 opacity-40'
              }`} />
              {/* Yellow 1 */}
              <div className={`w-8 h-8 rounded-full border-2 transition-all ${
                currentTrain.signal_aspect === 'DOUBLE_YELLOW' || currentTrain.signal_aspect === 'YELLOW'
                  ? 'bg-amber-400 border-amber-200 shadow-lg shadow-amber-400/80 ring-2 ring-amber-300'
                  : 'bg-amber-950/40 border-slate-800 opacity-40'
              }`} />
              {/* Yellow 2 */}
              <div className={`w-8 h-8 rounded-full border-2 transition-all ${
                currentTrain.signal_aspect === 'DOUBLE_YELLOW'
                  ? 'bg-amber-400 border-amber-200 shadow-lg shadow-amber-400/80 ring-2 ring-amber-300'
                  : 'bg-amber-950/40 border-slate-800 opacity-40'
              }`} />
              {/* Red */}
              <div className={`w-8 h-8 rounded-full border-2 transition-all ${
                currentTrain.signal_aspect === 'RED'
                  ? 'bg-rose-600 border-rose-300 shadow-lg shadow-rose-600/80 ring-2 ring-rose-500 animate-ping'
                  : 'bg-rose-950/40 border-slate-800 opacity-40'
              }`} />
            </div>

            <div className="text-center space-y-1">
              <span className="text-sm font-extrabold text-white block">
                {currentTrain.signal_aspect === 'GREEN' ? '🟢 PROCEED (CLEAR RUN)' :
                 currentTrain.signal_aspect === 'DOUBLE_YELLOW' ? '🟡 ATTENTION (DIVERGENCE AHEAD)' :
                 currentTrain.signal_aspect === 'YELLOW' ? '🟡 CAUTION (PSR 50 KM/H TURNOUT)' : '🔴 DANGER (TRACK BLOCKED)'}
              </span>
              <span className="text-[13px] font-mono font-bold text-sky-400 block">
                {signalCtx.id}
              </span>
              <span className="text-xs text-slate-400 block">
                {signalCtx.location}
              </span>
              <div className="text-[9.5px] font-mono px-2.5 py-1.5 rounded-lg bg-slate-900/90 border border-slate-800 text-slate-300 mt-1 max-w-[260px] mx-auto leading-relaxed">
                {signalCtx.explanation}
              </div>
            </div>
          </div>
        </div>

        {/* Kavach 4.0 ATP Telemetry Diagnostics (5 Cols) */}
        <div className="lg:col-span-5 bg-[#070B14] rounded-2xl border border-slate-800/90 p-5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800/60">
            <span className="text-sm font-bold text-slate-400 flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-purple-400" />
              Kavach 4.0 Trackside Handshake
            </span>
            <span className="text-xs font-mono text-purple-300 bg-purple-950/80 px-2.5 py-0.5 rounded-full border border-purple-600/50">
              RDSO SIL-4 CERTIFIED
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
              <span className="text-xs text-slate-500 block">Current KM Position</span>
              <strong className="text-sm font-mono text-white">KM {currentTrain.current_km.toFixed(1)}</strong>
              <span className="text-xs text-slate-400 block mt-0.5">{currentTrain.assigned_line}</span>
            </div>

            <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
              <span className="text-xs text-slate-500 block">Distance to Next Target</span>
              <strong className="text-sm font-mono text-sky-400">
                {(currentTrain.kavach_target_distance_m / 1000).toFixed(2)} KM
              </strong>
              <span className="text-xs text-emerald-400 block mt-0.5">Braking Curve Safe</span>
            </div>

            <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
              <span className="text-xs text-slate-500 block">SPAD Protection</span>
              <strong className="text-sm text-emerald-400 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                ACTIVE ARMED
              </strong>
              <span className="text-xs text-slate-400 block mt-0.5">Auto Service Brake Ready</span>
            </div>

            <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
              <span className="text-xs text-slate-500 block">Track Routing Status</span>
              <strong className={`text-sm ${currentTrain.is_diverted ? 'text-amber-400' : 'text-emerald-400'}`}>
                {currentTrain.is_diverted ? 'Bypass Diverted' : 'Down Mainline'}
              </strong>
              <span className="text-xs text-slate-400 block mt-0.5">{currentTrain.status}</span>
            </div>
          </div>

          <div className="p-3 bg-purple-950/20 border border-purple-800/40 rounded-xl text-[13px] text-purple-200 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Radio className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
              Radio Frequency Packet ID: <code className="text-white font-mono">#KAV-1014-TSR</code>
            </span>
            <span className="font-mono text-xs text-slate-400">
              Updated: {new Date(currentTrain.last_updated_timestamp).toLocaleTimeString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
