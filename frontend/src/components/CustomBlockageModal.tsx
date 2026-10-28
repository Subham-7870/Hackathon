import React, { useState } from 'react';
import { X, AlertOctagon, ShieldAlert, Wrench, Zap, Clock, CheckCircle2, Shield } from 'lucide-react';
import { Department } from '../types';

export interface CustomBlockage {
  block_id: string;
  department: Department;
  track_line: string;
  start_km: number;
  end_km: number;
  start_station: string;
  end_station: string;
  work_description: string;
  form_type: 'T351' | 'T172' | 'CAUTION_T409';
  duration_minutes: number;
  speed_restriction_kmh: number;
  machine_deployed: string;
  private_number: string;
}

interface CustomBlockageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddBlockage: (blockage: CustomBlockage) => void;
}

interface BlockPreset {
  title: string;
  form_type: 'T351' | 'T172' | 'CAUTION_T409';
  department: Department;
  track_line: string;
  start_km: number;
  end_km: number;
  start_station: string;
  end_station: string;
  work_description: string;
  duration_minutes: number;
  speed_restriction_kmh: number;
  machine_deployed: string;
}

const BLOCK_PRESETS: BlockPreset[] = [
  {
    title: 'Dadri ➔ Dankaur Down Main Mega-Block',
    form_type: 'T351',
    department: 'Track',
    track_line: 'DOWN_MAIN',
    start_km: 37.0,
    end_km: 54.0,
    start_station: 'DER (Dadri)',
    end_station: 'DKDE (Dankaur)',
    work_description: 'BCM Deep Ballast Screening & 09-3X Dynamic Track Tamping',
    duration_minutes: 180,
    speed_restriction_kmh: 0,
    machine_deployed: '09-3X Dynamic Tamping Express'
  },
  {
    title: 'Khurja ➔ Somna Up Main OHE Power Block',
    form_type: 'T172',
    department: 'Traction',
    track_line: 'UP_MAIN',
    start_km: 83.0,
    end_km: 105.0,
    start_station: 'KRJ (Khurja)',
    end_station: 'SOM (Somna)',
    work_description: '25kV Catenary Wire Stringing & Insulator Replacement',
    duration_minutes: 120,
    speed_restriction_kmh: 0,
    machine_deployed: 'DETC-08 OHE Tower Wagon'
  },
  {
    title: 'Somna Point #12A S&T Turnout Overhaul',
    form_type: 'T351',
    department: 'Signal',
    track_line: 'DOWN_MAIN',
    start_km: 100.4,
    end_km: 103.5,
    start_station: 'SOM (Somna Approach)',
    end_station: 'SOM (Somna Yard)',
    work_description: 'Point Machine #12A Motor Replacement & MSDAC Track Sensor Calibration',
    duration_minutes: 90,
    speed_restriction_kmh: 15,
    machine_deployed: 'S&T Relay Diagnostic Van'
  },
  {
    title: 'EDFC Khurja Freight Rail Grinding Block',
    form_type: 'T351',
    department: 'Track',
    track_line: 'EDFC',
    start_km: 80.0,
    end_km: 92.0,
    start_station: 'KRJ (EDFC Yard)',
    end_station: 'KRJ (Danwar Section)',
    work_description: 'Plasser Rail Grinding (72-Stone Heavy Profile Restoration)',
    duration_minutes: 240,
    speed_restriction_kmh: 0,
    machine_deployed: 'Plasser Heavy Rail Grinder'
  }
];

export const CustomBlockageModal: React.FC<CustomBlockageModalProps> = ({ isOpen, onClose, onAddBlockage }) => {
  const [formType, setFormType] = useState<'T351' | 'T172' | 'CAUTION_T409'>('T351');
  const [department, setDepartment] = useState<Department>('Track');
  const [trackLine, setTrackLine] = useState('DOWN_MAIN');
  const [startKm, setStartKm] = useState<number>(37.0);
  const [endKm, setEndKm] = useState<number>(54.0);
  const [startStation, setStartStation] = useState('DER (Dadri)');
  const [endStation, setEndStation] = useState('DKDE (Dankaur)');
  const [workDescription, setWorkDescription] = useState('BCM Deep Ballast Screening & Track Tamping');
  const [durationMinutes, setDurationMinutes] = useState<number>(180);
  const [speedRestrictionKmh, setSpeedRestrictionKmh] = useState<number>(0);
  const [machineDeployed, setMachineDeployed] = useState('09-3X Dynamic Tamping Express');

  if (!isOpen) return null;

  const handleApplyPreset = (preset: BlockPreset) => {
    setFormType(preset.form_type);
    setDepartment(preset.department);
    setTrackLine(preset.track_line);
    setStartKm(preset.start_km);
    setEndKm(preset.end_km);
    setStartStation(preset.start_station);
    setEndStation(preset.end_station);
    setWorkDescription(preset.work_description);
    setDurationMinutes(preset.duration_minutes);
    setSpeedRestrictionKmh(preset.speed_restriction_kmh);
    setMachineDeployed(preset.machine_deployed);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Generate compliant 4-digit Indian Railways Private Number (PN)
    const generatedPn = Math.floor(1000 + Math.random() * 9000).toString();

    const newBlockage: CustomBlockage = {
      block_id: `BLK-${Date.now().toString().slice(-4)}`,
      department,
      track_line: trackLine,
      start_km: Math.min(startKm, endKm),
      end_km: Math.max(startKm, endKm),
      start_station: startStation,
      end_station: endStation,
      work_description: workDescription.trim() || 'Track Maintenance Work',
      form_type: formType,
      duration_minutes: durationMinutes,
      speed_restriction_kmh: speedRestrictionKmh,
      machine_deployed: machineDeployed.trim() || 'Track Gang Unit',
      private_number: generatedPn
    };

    onAddBlockage(newBlockage);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="w-full max-w-2xl bg-[#0A0D16] border border-amber-500/40 rounded-3xl shadow-2xl overflow-hidden shadow-amber-950/50 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-800/80 bg-gradient-to-r from-amber-950/70 via-slate-900 to-rose-950/70 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <AlertOctagon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-white font-sans tracking-tight">
                  IMPOSE TRACK BLOCKAGE & DISCONNECTION
                </h3>
                <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-full bg-red-950 text-red-300 border border-red-500/30">
                  STATUTORY BLOCK
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">
                North Central Railway · Prayagraj Division (Section Controller Authorization)
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
          {/* Quick Presets Strip */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-black text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                Select Operating Block Preset
              </label>
              <span className="text-[11px] text-slate-400">Click preset to autofill</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
              {BLOCK_PRESETS.map((preset) => {
                const isSelected = startKm === preset.start_km && trackLine === preset.track_line;
                return (
                  <button
                    key={preset.title}
                    type="button"
                    onClick={() => handleApplyPreset(preset)}
                    className={`p-2 rounded-xl text-left border transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'bg-amber-950/80 border-amber-400 text-white shadow-md shadow-amber-950/40 ring-1 ring-amber-400/40'
                        : 'bg-[#0E1320] border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-[#121A2C]'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="font-black text-[11px] font-mono text-amber-300">
                        {preset.form_type}
                      </span>
                      <span className={`text-[9px] font-extrabold px-1 py-0.2 rounded uppercase ${
                        preset.speed_restriction_kmh === 0
                          ? 'bg-rose-950 text-rose-300 border border-rose-600/40'
                          : 'bg-yellow-950 text-yellow-300 border border-yellow-600/40'
                      }`}>
                        {preset.speed_restriction_kmh === 0 ? 'CLOSURE' : `${preset.speed_restriction_kmh}K`}
                      </span>
                    </div>
                    <div className="font-bold text-[11px] text-slate-100 truncate">
                      {preset.title.split('➔')[0]?.trim() || preset.title}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                      KM {preset.start_km}–{preset.end_km} · {preset.duration_minutes}m
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Form Fields Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Form Authority Type */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Operating Rule / Form Authority
              </label>
              <select
                value={formType}
                onChange={(e) => setFormType(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-900/90 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-amber-400 transition-colors"
              >
                <option value="T351">Form T/351: P-Way Track Possession & S&T Disconnection</option>
                <option value="T172">Form T/172: TRD 25kV Traction Power Block (OHE Shutdown)</option>
                <option value="CAUTION_T409">Form T/409B: TSR Caution Order Restriction</option>
              </select>
            </div>

            {/* Department */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Department Applying for Block
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value as Department)}
                className="w-full px-3 py-2 bg-slate-900/90 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-amber-400 transition-colors"
              >
                <option value="Track">Civil Engineering (P-Way / Track Machine)</option>
                <option value="Traction">Electrical (TRD / 25kV AC Catenary OHE)</option>
                <option value="Signal">Signaling & Telecom (S&T / Point Machine)</option>
              </select>
            </div>

            {/* Assigned Track Line */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Target Track Line to Block
              </label>
              <select
                value={trackLine}
                onChange={(e) => setTrackLine(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900/90 border border-slate-700 rounded-xl text-white text-sm font-mono focus:outline-none focus:border-amber-400 transition-colors"
              >
                <option value="DOWN_MAIN">Line 1: Down Mainline (GZB ➔ ALJN)</option>
                <option value="THIRD_LINE">Line 2: 3rd Line (Bi-directional Center Line)</option>
                <option value="UP_MAIN">Line 3: Up Mainline (ALJN ➔ GZB)</option>
                <option value="EDFC">Line 4: EDFC Freight Bypass (South Alignment)</option>
              </select>
            </div>

            {/* Speed Restriction (TSR) */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Speed Restriction Over Work Zone
              </label>
              <select
                value={speedRestrictionKmh}
                onChange={(e) => setSpeedRestrictionKmh(parseInt(e.target.value))}
                className="w-full px-3 py-2 bg-slate-900/90 border border-slate-700 rounded-xl text-white text-sm font-mono focus:outline-none focus:border-amber-400 transition-colors"
              >
                <option value="0">0 km/h — Total Line Closure (Red Stop Board)</option>
                <option value="15">15 km/h — Strict Caution Order (Point Turnout)</option>
                <option value="30">30 km/h — Moderate Caution Order (Packing)</option>
                <option value="50">50 km/h — High-Speed Turnout Caution (PSR)</option>
              </select>
            </div>

            {/* Start KM */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Start Chainage (KM)
              </label>
              <input
                type="number"
                min="20.0"
                max="126.0"
                step="0.5"
                value={startKm}
                onChange={(e) => setStartKm(parseFloat(e.target.value) || 20.0)}
                className="w-full px-3 py-2 bg-slate-900/90 border border-slate-700 rounded-xl text-amber-300 font-mono font-bold text-sm focus:outline-none focus:border-amber-400 transition-colors"
              />
            </div>

            {/* End KM */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                End Chainage (KM)
              </label>
              <input
                type="number"
                min="20.0"
                max="126.0"
                step="0.5"
                value={endKm}
                onChange={(e) => setEndKm(parseFloat(e.target.value) || 20.0)}
                className="w-full px-3 py-2 bg-slate-900/90 border border-slate-700 rounded-xl text-amber-300 font-mono font-bold text-sm focus:outline-none focus:border-amber-400 transition-colors"
              />
            </div>

            {/* Duration Minutes */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Sanctioned Duration (Minutes)
              </label>
              <input
                type="number"
                min="30"
                max="480"
                step="15"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(parseInt(e.target.value) || 60)}
                className="w-full px-3 py-2 bg-slate-900/90 border border-slate-700 rounded-xl text-white font-mono font-bold text-sm focus:outline-none focus:border-amber-400 transition-colors"
              />
            </div>

            {/* Track Machine Deployed */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Work Machine / Unit Deployed
              </label>
              <input
                type="text"
                value={machineDeployed}
                onChange={(e) => setMachineDeployed(e.target.value)}
                placeholder="e.g. 09-3X Dynamic Tamping Express"
                className="w-full px-3 py-2 bg-slate-900/90 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-amber-400 transition-colors"
              />
            </div>

            {/* Work Description */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Scope & Technical Description of Work
              </label>
              <input
                type="text"
                value={workDescription}
                onChange={(e) => setWorkDescription(e.target.value)}
                placeholder="e.g. BCM Deep Screening & Track Tamping"
                className="w-full px-3 py-2 bg-slate-900/90 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-amber-400 transition-colors"
              />
            </div>
          </div>

          {/* Live Impact Preview */}
          <div className="p-3 bg-amber-950/30 border border-amber-500/30 rounded-2xl flex items-center justify-between text-xs font-mono">
            <span className="text-slate-400">Authority Impact:</span>
            <span className="text-amber-300 font-bold">
              {formType} on {trackLine} (KM {startKm}–{endKm}) · {durationMinutes}m · {speedRestrictionKmh === 0 ? 'Closure' : `${speedRestrictionKmh} km/h PSR`}
            </span>
          </div>

          {/* Sticky Bottom Action Footer */}
          <div className="sticky bottom-0 -mx-5 -mb-5 sm:-mx-6 sm:-mb-6 p-4 bg-[#0A0D16]/95 backdrop-blur-md border-t border-slate-800 flex items-center justify-between gap-3 z-20">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-bold rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 text-slate-950 text-sm font-black rounded-xl transition-all shadow-lg shadow-amber-500/30 flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>IMPOSE BLOCKAGE & ENGAGE PN</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
