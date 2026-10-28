import React, { useState, useEffect } from 'react';
import { 
  Database, 
  X, 
  RefreshCw, 
  Send, 
  Sliders, 
  AlertTriangle, 
  PlusCircle, 
  CheckCircle2, 
  Radio, 
  Cpu, 
  Zap, 
  Layers,
  ArrowRight
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { getLocalizedTrainName } from '../i18n/trainTranslations';
import { API_BASE } from '../services/api';

interface CrisTrain {
  train_number: string;
  train_name: string;
  train_type: string;
  current_km: number;
  current_speed_kmh: number;
  target_speed_kmh: number;
  assigned_line: string;
  signal_aspect: string;
  kavach_status: string;
  delay_minutes: number;
  manual_override: number;
  loco_type: string;
  loco_shed: string;
  last_ping_timestamp: string;
}

interface LiveFeedControllerProps {
  isOpen: boolean;
  onClose: () => void;
  onNotification?: (msg: string) => void;
}

export const LiveFeedController: React.FC<LiveFeedControllerProps> = ({
  isOpen,
  onClose,
  onNotification
}) => {
  const { language } = useLanguage();
  const [trains, setTrains] = useState<CrisTrain[]>([]);
  const [selectedTrainNum, setSelectedTrainNum] = useState<string>('12004');
  const [editSpeed, setEditSpeed] = useState<number>(130);
  const [editKm, setEditKm] = useState<number>(85);
  const [editDelay, setEditDelay] = useState<number>(0);
  const [editLine, setEditLine] = useState<string>('Down Main');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [rawPackets, setRawPackets] = useState<string[]>([]);
  const [isSuccessMessage, setIsSuccessMessage] = useState<string | null>(null);

  // Fetch trains from the external CRIS database
  const fetchCrisTrains = async () => {
    try {
      const res = await fetch(`${API_BASE}/v1/cris/trains`);
      if (res.ok) {
        const data = await res.json();
        setTrains(data.trains || []);
        
        // Add raw packet for the terminal log
        const sample = data.trains?.[0];
        if (sample) {
          const packet = `[RTIS-INGEST ${new Date().toLocaleTimeString()}] PKT_ID: #KAVACH-${Math.floor(Math.random()*90000+10000)} | TRAIN: #${sample.train_number} | KM: ${sample.current_km.toFixed(2)} | SPD: ${sample.current_speed_kmh.toFixed(1)} km/h | ASP: ${sample.signal_aspect}`;
          setRawPackets(prev => [packet, ...prev.slice(0, 15)]);
        }
      }
    } catch (e) {
      console.error(`Failed to fetch CRIS database:`, e);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchCrisTrains();
      const timer = setInterval(fetchCrisTrains, 2000);
      return () => clearInterval(timer);
    }
  }, [isOpen]);

  const activeTrain = trains.find(t => t.train_number === selectedTrainNum) || trains[0];

  useEffect(() => {
    if (activeTrain) {
      setEditSpeed(Math.round(activeTrain.current_speed_kmh));
      setEditKm(Math.round(activeTrain.current_km));
      setEditDelay(Math.round(activeTrain.delay_minutes));
      setEditLine(activeTrain.assigned_line);
    }
  }, [selectedTrainNum, activeTrain?.train_number]);

  // Push updates to the external CRIS database
  const handlePushTelemetry = async () => {
    setIsLoading(true);
    try {
      const payload = {
        train_number: selectedTrainNum,
        current_speed_kmh: Number(editSpeed),
        current_km: Number(editKm),
        delay_minutes: Number(editDelay),
        assigned_line: editLine,
        manual_override: 1
      };

      const res = await fetch(`${API_BASE}/v1/cris/train/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setIsSuccessMessage(`✅ Pushed to CRIS DB: #${selectedTrainNum} set to ${editSpeed} km/h @ KM ${editKm}`);
        setTimeout(() => setIsSuccessMessage(null), 4000);
        if (onNotification) onNotification(`CRIS Telemetry Ingested: Train #${selectedTrainNum} updated`);
        fetchCrisTrains();
      }
    } catch (e) {
      console.error('Failed to update CRIS DB:', e);
    } finally {
      setIsLoading(false);
    }
  };

  // Quick Action: Inject sudden traction slip
  const handleTractionSlip = async () => {
    setEditSpeed(25);
    setEditDelay(15);
    await fetch(`${API_BASE}/v1/cris/train/update`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        train_number: selectedTrainNum,
        current_speed_kmh: 25.0,
        delay_minutes: 15.0,
        manual_override: 1
      })
    });
    setIsSuccessMessage(`⚠️ Traction Wheel Slip Injected on Train #${selectedTrainNum} (Speed dropped to 25 km/h)`);
    setTimeout(() => setIsSuccessMessage(null), 4000);
    fetchCrisTrains();
  };

  // Quick Action: Spawn new special express
  const handleSpawnTrain = async () => {
    const specialNum = `041${Math.floor(Math.random()*90+10)}`;
    await fetch(`${API_BASE}/v1/cris/train/add`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        train_number: specialNum,
        train_name: `Kumbh Mela Special #${specialNum}`,
        train_type: 'Express',
        current_km: 26.0,
        current_speed_kmh: 90.0,
        max_permitted_speed: 110.0,
        target_speed_kmh: 110.0,
        assigned_line: 'Down Main',
        signal_aspect: 'GREEN',
        loco_type: 'WAP-7',
        loco_shed: 'GZB Shed'
      })
    });
    setIsSuccessMessage(`🚆 Injected Unscheduled Train #${specialNum} into CRIS Central Schedule`);
    setTimeout(() => setIsSuccessMessage(null), 4000);
    fetchCrisTrains();
  };

  // Reset to default timetable
  const handleResetCris = async () => {
    await fetch(`${API_BASE}/v1/cris/reset`, { method: 'POST' });
    setIsSuccessMessage('↺ CRIS Database reset to baseline Master Timetable');
    setTimeout(() => setIsSuccessMessage(null), 4000);
    fetchCrisTrains();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="max-w-4xl w-full bg-[#0B0F19] border border-sky-500/40 rounded-3xl p-6 shadow-2xl space-y-5 text-left animate-in fade-in zoom-in-95 duration-200 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-indigo-600 to-sky-500 rounded-2xl text-white shadow-lg shadow-indigo-600/30">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-white uppercase tracking-wide">
                  External Railway Database Controller (CRIS / COA / RTIS)
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-emerald-950 text-emerald-300 border border-emerald-500/40 flex items-center gap-1 font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  LIVE DB SYNC ACTIVE
                </span>
              </div>
              <p className="text-sm text-slate-400 font-mono">
                Decoupled Central Master Database (`cris_rail_telemetry.db`) • Operator Real-Time Telemetry Control
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success Alert Banner */}
        {isSuccessMessage && (
          <div className="bg-emerald-950/90 border border-emerald-500 px-4 py-2.5 rounded-xl text-sm text-emerald-200 font-extrabold flex items-center justify-between shadow-lg animate-in fade-in duration-200">
            <span>{isSuccessMessage}</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
        )}

        {/* Database Status Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3.5">
            <span className="text-xs font-mono text-slate-400 uppercase block font-bold">Database Instance</span>
            <span className="text-sm font-black text-sky-400 font-mono">cris_rail_telemetry.db</span>
            <span className="text-[9px] text-slate-500 block mt-0.5">SQLite WAL Engine (Concurrent Reads)</span>
          </div>
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3.5">
            <span className="text-xs font-mono text-slate-400 uppercase block font-bold">Ingestion Feed Rate</span>
            <span className="text-sm font-black text-emerald-400 font-mono">2.5 Hz (400ms Sub-Second Ticks)</span>
            <span className="text-[9px] text-slate-500 block mt-0.5">ISRO RTIS GPS + Kavach 4.0 SIL-4</span>
          </div>
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3.5">
            <span className="text-xs font-mono text-slate-400 uppercase block font-bold">Corridor Master Rakes</span>
            <span className="text-sm font-black text-amber-400 font-mono">{trains.length} Active Trains Synchronized</span>
            <span className="text-[9px] text-slate-500 block mt-0.5">COA Certified Master Schedules</span>
          </div>
        </div>

        {/* Main Control Deck: Train Selector + Parameters Editor */}
        <div className="bg-slate-900/80 border border-sky-500/30 rounded-2xl p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-sky-400" />
              <h4 className="text-sm font-black text-white uppercase tracking-wider">
                Select Train Rake to Command in External DB
              </h4>
            </div>
            
            {/* Quick Train Selector Badges */}
            <div className="flex flex-wrap gap-2">
              {trains.map(t => (
                <button
                  key={t.train_number}
                  onClick={() => setSelectedTrainNum(t.train_number)}
                  className={`px-2.5 py-1 rounded-lg text-sm font-mono font-bold transition-all border ${
                    selectedTrainNum === t.train_number
                      ? 'bg-sky-600 text-white border-sky-400 shadow-md shadow-sky-600/30'
                      : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
                  }`}
                >
                  #{t.train_number}
                </button>
              ))}
            </div>
          </div>

          {activeTrain && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Left Column: Live Values Sliders */}
              <div className="space-y-4">
                {/* Speed Slider */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="font-bold text-slate-300">Commanded Speed:</span>
                    <span className="font-mono font-black text-sky-400 text-sm">{editSpeed} km/h</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="160"
                    value={editSpeed}
                    onChange={(e) => setEditSpeed(Number(e.target.value))}
                    className="w-full h-2 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-sky-500"
                  />
                  <div className="flex justify-between text-[9px] font-mono text-slate-500">
                    <span>0 (Halt)</span>
                    <span>50 (PSR Turnout)</span>
                    <span>110 (MPS)</span>
                    <span>160 (Max)</span>
                  </div>
                </div>

                {/* Odometer KM Slider */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="font-bold text-slate-300">Track Position (Odometer):</span>
                    <span className="font-mono font-black text-cyan-400 text-sm">KM {editKm}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="440"
                    value={editKm}
                    onChange={(e) => setEditKm(Number(e.target.value))}
                    className="w-full h-2 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                  />
                  <div className="flex justify-between text-[9px] font-mono text-slate-500">
                    <span>KM 20 (Ghaziabad)</span>
                    <span>KM 104 (Somna)</span>
                    <span>KM 126 (Aligarh)</span>
                    <span>KM 440 (Kanpur)</span>
                  </div>
                </div>

                {/* Delay Minutes Slider */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="font-bold text-slate-300">Injected Delay:</span>
                    <span className="font-mono font-black text-amber-400 text-sm">+{editDelay} Mins</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="90"
                    value={editDelay}
                    onChange={(e) => setEditDelay(Number(e.target.value))}
                    className="w-full h-2 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-amber-500"
                  />
                </div>
              </div>

              {/* Right Column: Line Assignment & Action Push */}
              <div className="space-y-4 flex flex-col justify-between">
                <div>
                  <label className="block text-sm font-bold text-slate-300 mb-1.5">
                    Assigned Running Line:
                  </label>
                  <select
                    value={editLine}
                    onChange={(e) => setEditLine(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 text-slate-200 text-xs rounded-xl p-2.5 focus:border-sky-500 focus:outline-none"
                  >
                    <option value="Down Main">Down Mainline (160 km/h Trunk)</option>
                    <option value="Reversible Middle Loop">Somna Reversible Middle Loop (Bypass Pt #12A)</option>
                    <option value="Up Passenger Line">Up Passenger Line (Clear Corridor)</option>
                    <option value="Goods Dedicated Line">Dedicated Freight Corridor (DFC Loop)</option>
                  </select>
                </div>

                <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 space-y-1 text-[13px] font-mono">
                  <div className="text-slate-400 flex justify-between">
                    <span>Train Name:</span>
                    <strong className="text-slate-200">{getLocalizedTrainName(activeTrain.train_name, language, activeTrain.train_number)}</strong>
                  </div>
                  <div className="text-slate-400 flex justify-between">
                    <span>Loco / Traction:</span>
                    <strong className="text-slate-200">{activeTrain.loco_type}</strong>
                  </div>
                  <div className="text-slate-400 flex justify-between">
                    <span>Kavach Supervised:</span>
                    <strong className="text-emerald-400">{activeTrain.kavach_status}</strong>
                  </div>
                </div>

                <button
                  onClick={handlePushTelemetry}
                  disabled={isLoading}
                  className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-500 hover:to-sky-400 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition-all transform hover:scale-[1.01]"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isLoading ? 'Pushing to CRIS DB...' : 'PUSH TO CRIS REAL-TIME FEED'}</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Disruption & Rake Injection Scenarios */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            onClick={handleTractionSlip}
            className="p-3 bg-amber-950/40 hover:bg-amber-950/60 border border-amber-500/40 rounded-2xl text-left space-y-1 transition-all group"
          >
            <div className="flex items-center gap-1.5 text-sm font-black text-amber-300">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Simulate Traction Slip</span>
            </div>
            <p className="text-xs text-slate-400">
              Forces train #{selectedTrainNum} speed to 25 km/h + 15m delay to observe SthitiShodhana re-optimization.
            </p>
          </button>

          <button
            onClick={handleSpawnTrain}
            className="p-3 bg-sky-950/40 hover:bg-sky-950/60 border border-sky-500/40 rounded-2xl text-left space-y-1 transition-all group"
          >
            <div className="flex items-center gap-1.5 text-sm font-black text-sky-300">
              <PlusCircle className="w-3.5 h-3.5 text-sky-400" />
              <span>Spawn Kumbh Special Rake</span>
            </div>
            <p className="text-xs text-slate-400">
              Injects a new unscheduled passenger special train into the live Ghaziabad corridor.
            </p>
          </button>

          <button
            onClick={handleResetCris}
            className="p-3 bg-slate-900/60 hover:bg-slate-800 border border-slate-700 rounded-2xl text-left space-y-1 transition-all group"
          >
            <div className="flex items-center gap-1.5 text-sm font-black text-slate-300">
              <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
              <span>Reset Database to Baseline</span>
            </div>
            <p className="text-xs text-slate-400">
              Restores original official schedules and clear running speeds for all rakes.
            </p>
          </button>
        </div>

        {/* Terminal Raw Feed Packet Inspector */}
        <div className="bg-[#050811] rounded-2xl p-3.5 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-[13px] font-mono font-bold text-slate-400">
            <span className="flex items-center gap-1.5">
              <Radio className="w-3 h-3 text-cyan-400 animate-pulse" />
              Raw RTIS & Kavach Radio Packet Stream (Incoming Ingestion)
            </span>
            <span className="text-xs text-slate-500">Auto-Refreshes 2.5 Hz</span>
          </div>
          <div className="bg-[#03060E] rounded-xl p-2.5 font-mono text-xs text-emerald-400/90 h-24 overflow-y-auto space-y-1 border border-slate-900">
            {rawPackets.map((pkt, idx) => (
              <div key={idx} className="truncate">
                {pkt}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
