import React, { useState } from 'react';
import { X, Train, Zap, Shield, Navigation, Gauge, Clock, CheckCircle2 } from 'lucide-react';
import { TrainSchedule, TrainType } from '../types';

interface CustomTrainModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTrain: (train: TrainSchedule, initialKm: number, locoType: string) => void;
}

interface TrainPreset {
  train_number: string;
  train_name: string;
  train_type: TrainType;
  assigned_line: string;
  initial_km: number;
  speed: number;
  loco_type: string;
  priority_weight: number;
}

const TRAIN_PRESETS: TrainPreset[] = [
  {
    train_number: '12952',
    train_name: 'New Delhi ➔ Mumbai Tejas Rajdhani',
    train_type: 'Superfast',
    assigned_line: 'DOWN_MAIN',
    initial_km: 22.5,
    speed: 130,
    loco_type: 'WAP-7 (GZB Shed #30215)',
    priority_weight: 10
  },
  {
    train_number: '20901',
    train_name: 'Vande Bharat Express (16-Car T-18)',
    train_type: 'Superfast',
    assigned_line: 'UP_MAIN',
    initial_km: 122.0,
    speed: 160,
    loco_type: 'Train-18 Trainset #04',
    priority_weight: 10
  },
  {
    train_number: '12002',
    train_name: 'New Delhi ➔ Bhopal Shatabdi Superfast',
    train_type: 'Superfast',
    assigned_line: 'DOWN_MAIN',
    initial_km: 25.0,
    speed: 150,
    loco_type: 'WAP-7 (TKD Shed #30450)',
    priority_weight: 9
  },
  {
    train_number: '12554',
    train_name: 'Vaishali Superfast Express',
    train_type: 'Express',
    assigned_line: 'THIRD_LINE',
    initial_km: 45.0,
    speed: 110,
    loco_type: 'WAP-7 (CNB Shed #30188)',
    priority_weight: 7
  },
  {
    train_number: 'BOXN-8904',
    train_name: 'EDFC Heavy Haul Coal Freight (58 BOXN)',
    train_type: 'Freight',
    assigned_line: 'EDFC',
    initial_km: 30.0,
    speed: 75,
    loco_type: 'Twin WAG-9HC (6000 HP)',
    priority_weight: 3
  }
];

export const CustomTrainModal: React.FC<CustomTrainModalProps> = ({ isOpen, onClose, onAddTrain }) => {
  const [trainNumber, setTrainNumber] = useState('12952');
  const [trainName, setTrainName] = useState('New Delhi ➔ Mumbai Tejas Rajdhani');
  const [trainType, setTrainType] = useState<TrainType>('Superfast');
  const [assignedLine, setAssignedLine] = useState('DOWN_MAIN');
  const [initialKm, setInitialKm] = useState<number>(25.0);
  const [speed, setSpeed] = useState<number>(130);
  const [locoType, setLocoType] = useState('WAP-7 (GZB Shed #30215)');
  const [priorityWeight, setPriorityWeight] = useState<number>(10);

  if (!isOpen) return null;

  const handleApplyPreset = (preset: TrainPreset) => {
    setTrainNumber(preset.train_number);
    setTrainName(preset.train_name);
    setTrainType(preset.train_type);
    setAssignedLine(preset.assigned_line);
    setInitialKm(preset.initial_km);
    setSpeed(preset.speed);
    setLocoType(preset.loco_type);
    setPriorityWeight(preset.priority_weight);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newTrain: TrainSchedule = {
      train_number: trainNumber.trim() || `TRN-${Date.now().toString().slice(-4)}`,
      train_name: trainName.trim() || 'Custom Injected Train',
      train_type: trainType,
      priority_weight: priorityWeight,
      origin: assignedLine === 'UP_MAIN' ? 'ALJN' : 'GZB',
      destination: assignedLine === 'UP_MAIN' ? 'NDLS' : 'CNB',
      route_sectors: ['SEC-NDLS-CNB-01'],
      entry_time_minutes: 0,
      normal_transit_minutes: 48,
      delay_minutes: 0,
      assigned_line: assignedLine,
      status: 'ON_TIME',
      speed_kmh: speed,
    };

    onAddTrain(newTrain, initialKm, locoType);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="w-full max-w-2xl bg-[#090E1A] border border-sky-500/40 rounded-3xl shadow-2xl overflow-hidden shadow-sky-950/50 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-800/80 bg-gradient-to-r from-blue-950/70 via-slate-900 to-indigo-950/70 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <Train className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-white font-sans tracking-tight">
                  INJECT CUSTOM TRAIN CONSIST
                </h3>
                <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-500/30">
                  RTIS NAVIC FEED
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">
                NCR Prayagraj Division · Dynamic Dispatch Corridor (KM 20.0 to 126.0)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          {/* Quick Presets Horizontal Strip */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-black text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-cyan-400" />
                Select Indian Railways Fleet Preset
              </label>
              <span className="text-[11px] text-slate-400">Click preset to autofill</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
              {TRAIN_PRESETS.map((preset) => {
                const isSelected = trainNumber === preset.train_number;
                return (
                  <button
                    key={preset.train_number}
                    type="button"
                    onClick={() => handleApplyPreset(preset)}
                    className={`p-2 rounded-xl text-left border transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'bg-cyan-950/80 border-cyan-400 text-white shadow-md shadow-cyan-950/40 ring-1 ring-cyan-400/40'
                        : 'bg-[#0B1222] border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-[#0F182E]'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="font-black text-[11px] font-mono text-cyan-300">
                        #{preset.train_number}
                      </span>
                      <span className={`text-[9px] font-extrabold px-1 py-0.2 rounded uppercase ${
                        preset.train_type === 'Superfast' ? 'bg-sky-950 text-sky-300 border border-sky-600/40' :
                        preset.train_type === 'Freight' ? 'bg-amber-950 text-amber-300 border border-amber-600/40' :
                        'bg-emerald-950 text-emerald-300 border border-emerald-600/40'
                      }`}>
                        {preset.train_type.slice(0, 3)}
                      </span>
                    </div>
                    <div className="font-bold text-[11px] text-slate-100 truncate">
                      {preset.train_name.split('➔')[1]?.trim() || preset.train_name}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                      {preset.speed} km/h
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Form Fields Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Train Number */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Train Number <span className="text-cyan-400">*</span>
              </label>
              <input
                type="text"
                value={trainNumber}
                onChange={(e) => setTrainNumber(e.target.value)}
                placeholder="e.g. 12952"
                required
                className="w-full px-3 py-2 bg-slate-900/90 border border-slate-700 rounded-xl text-white font-mono text-sm focus:outline-none focus:border-cyan-400 transition-colors"
              />
            </div>

            {/* Train Name */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Train Name <span className="text-cyan-400">*</span>
              </label>
              <input
                type="text"
                value={trainName}
                onChange={(e) => setTrainName(e.target.value)}
                placeholder="e.g. Mumbai Tejas Rajdhani"
                required
                className="w-full px-3 py-2 bg-slate-900/90 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-cyan-400 transition-colors"
              />
            </div>

            {/* Train Type */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Classification & Priority
              </label>
              <select
                value={trainType}
                onChange={(e) => setTrainType(e.target.value as TrainType)}
                className="w-full px-3 py-2 bg-slate-900/90 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-cyan-400 transition-colors"
              >
                <option value="Superfast">Superfast (Vande Bharat / Rajdhani / Shatabdi)</option>
                <option value="Express">Express / Mail (Passenger Service)</option>
                <option value="Freight">Freight (BOXN / BCNHL / EDFC Heavy-Haul)</option>
              </select>
            </div>

            {/* Assigned Running Line */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Assigned Track Corridor
              </label>
              <select
                value={assignedLine}
                onChange={(e) => setAssignedLine(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900/90 border border-slate-700 rounded-xl text-white text-sm font-mono focus:outline-none focus:border-cyan-400 transition-colors"
              >
                <option value="DOWN_MAIN">Line 1: Down Mainline (160 km/h GZB ➔ ALJN)</option>
                <option value="THIRD_LINE">Line 2: 3rd Line Bi-directional (130 km/h Overtake)</option>
                <option value="UP_MAIN">Line 3: Up Mainline (160 km/h ALJN ➔ GZB)</option>
                <option value="EDFC">Line 4: EDFC Freight Corridor (25T Axle Load)</option>
              </select>
            </div>

            {/* Initial KM Location */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Initial Kilometer (KM 20.0 to 126.0)
              </label>
              <input
                type="number"
                min="20.0"
                max="126.0"
                step="0.5"
                value={initialKm}
                onChange={(e) => setInitialKm(parseFloat(e.target.value) || 20.0)}
                className="w-full px-3 py-2 bg-slate-900/90 border border-slate-700 rounded-xl text-cyan-300 font-mono font-bold text-sm focus:outline-none focus:border-cyan-400 transition-colors"
              />
            </div>

            {/* Speed / MPS */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Speed / Max Permitted Speed (km/h)
              </label>
              <input
                type="number"
                min="30"
                max="160"
                step="5"
                value={speed}
                onChange={(e) => setSpeed(parseInt(e.target.value) || 130)}
                className="w-full px-3 py-2 bg-slate-900/90 border border-slate-700 rounded-xl text-emerald-300 font-mono font-bold text-sm focus:outline-none focus:border-cyan-400 transition-colors"
              />
            </div>

            {/* Locomotive Shed & Number */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Locomotive Class & Shed Attribution
              </label>
              <input
                type="text"
                value={locoType}
                onChange={(e) => setLocoType(e.target.value)}
                placeholder="e.g. WAP-7 (GZB Shed #30215)"
                className="w-full px-3 py-2 bg-slate-900/90 border border-slate-700 rounded-xl text-white font-mono text-sm focus:outline-none focus:border-cyan-400 transition-colors"
              />
            </div>
          </div>

          {/* Live Parameter Inspection Summary */}
          <div className="p-3 bg-cyan-950/30 border border-cyan-500/30 rounded-2xl flex items-center justify-between text-xs font-mono">
            <span className="text-slate-400">Simulation Target:</span>
            <span className="text-cyan-300 font-bold">
              #{trainNumber} · {assignedLine} @ KM {initialKm.toFixed(1)} · {speed} km/h
            </span>
          </div>

          {/* Sticky Bottom Action Footer */}
          <div className="sticky bottom-0 -mx-5 -mb-5 sm:-mx-6 sm:-mb-6 p-4 bg-[#090E1A]/95 backdrop-blur-md border-t border-slate-800 flex items-center justify-between gap-3 z-20">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-bold rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 text-sm font-black rounded-xl transition-all shadow-lg shadow-cyan-500/30 flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>INJECT INTO LIVE SIMULATION</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
