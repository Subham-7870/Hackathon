import React, { useState } from 'react';
import { 
  Wrench, 
  Zap, 
  Radio, 
  Layers, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles, 
  Clock, 
  TrendingUp, 
  FileCheck,
  ShieldCheck,
  Sliders,
  Play,
  CalendarCheck
} from 'lucide-react';
import { SolvedBlock } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface MultiDeptBlockPortalProps {
  onApplyMegaBlock?: () => void;
  isBundled?: boolean;
}

interface DepartmentWorkItem {
  id: string;
  dept: 'P-Way' | 'TRD' | 'S&T';
  title: string;
  location: string;
  line: string;
  machinery: string;
  rawDurationHours: number;
  criticality: 'CRITICAL' | 'MAJOR' | 'STANDARD';
  safetyProtocol: string;
  status: 'PENDING_COORDINATION' | 'BUNDLED_READY' | 'DISPATCHED';
}

export const MultiDeptBlockPortal: React.FC<MultiDeptBlockPortalProps> = ({
  onApplyMegaBlock,
  isBundled = false,
}) => {
  const { t } = useLanguage();
  const [activeDeptTab, setActiveDeptTab] = useState<'ALL' | 'P-Way' | 'TRD' | 'S&T'>('ALL');
  const [bundled, setBundled] = useState<boolean>(isBundled);
  const [selectedWorkId, setSelectedWorkId] = useState<string>('PW-SOM-01');
  const [isSimulatingSolver, setIsSimulatingSolver] = useState<boolean>(false);

  const WORK_ITEMS: DepartmentWorkItem[] = [
    {
      id: 'PW-SOM-01',
      dept: 'P-Way',
      title: 'Deep Ballast Screening & Track Relaying',
      location: 'Somna (SOM) – Aligarh (ALJN) KM 118.0 to 126.0',
      line: 'Down Mainline (Track #1)',
      machinery: 'Plasser BCM-340 + CSM Tamping Machine',
      rawDurationHours: 3.5,
      criticality: 'CRITICAL',
      safetyProtocol: 'Track protection flags at 600m & 1200m; Banner flags hoisted',
      status: bundled ? 'BUNDLED_READY' : 'PENDING_COORDINATION'
    },
    {
      id: 'TRD-SOM-02',
      dept: 'TRD',
      title: '25 kV AC OHE Contact Wire Renewal & Tower Wagon Inspection',
      location: 'Somna Sub-Sector 102/14 to 108/20',
      line: 'Down Mainline OHE Cantilever Mast #412',
      machinery: '8-Wheeler Self-Propelled OHE Tower Car (DETC)',
      rawDurationHours: 2.5,
      criticality: 'MAJOR',
      safetyProtocol: 'Traction Feeder CB-101 Open; Discharge rods earthed on both ends',
      status: bundled ? 'BUNDLED_READY' : 'PENDING_COORDINATION'
    },
    {
      id: 'ST-SOM-03',
      dept: 'S&T',
      title: 'SIL-4 Point Machine #12A Overhaul & Kavach Balise Recalibration',
      location: 'Somna West Yard Throat (KM 118.2)',
      line: 'Universal Crossover Pt #12A & #14B',
      machinery: 'IRS Point Machine Test Jig + Kavach UHF Field Calibrator',
      rawDurationHours: 2.0,
      criticality: 'CRITICAL',
      safetyProtocol: 'Station Master Disconnection Memo S&T(N) Form T/351 served',
      status: bundled ? 'BUNDLED_READY' : 'PENDING_COORDINATION'
    },
    {
      id: 'PW-DKDE-04',
      dept: 'P-Way',
      title: 'Weld Trimming & Turnout Realignment',
      location: 'Dankaur (DKDE) KM 54.2 to 55.6',
      line: '3rd Running Line',
      machinery: 'Abrasive Rail Saw & Hydraulic Weld Trimmer',
      rawDurationHours: 1.5,
      criticality: 'STANDARD',
      safetyProtocol: 'Speed restriction 30 km/h board erected (PSR-30)',
      status: bundled ? 'BUNDLED_READY' : 'PENDING_COORDINATION'
    },
    {
      id: 'TRD-DKDE-05',
      dept: 'TRD',
      title: '25 kV AC OHE Contact Wire Replacement & Cantilever Overhaul',
      location: 'Dankaur (DKDE) – Dadri (DER) KM 64.0 to 50.4',
      line: 'Up Mainline (Track #3)',
      machinery: '8-Wheeler DETC-08 OHE Tower Wagon',
      rawDurationHours: 3.0,
      criticality: 'CRITICAL',
      safetyProtocol: 'Form T/172 Power Block Disconnection; Feeder CB-202 Locked Out & Earthed',
      status: bundled ? 'BUNDLED_READY' : 'PENDING_COORDINATION'
    },
    {
      id: 'PW-KRJ-06',
      dept: 'P-Way',
      title: 'EDFC Heavy-Haul Track Deep Screening & USFD Ultrasonic Testing',
      location: 'Khurja Jn (KRJ) EDFC Siding KM 72.0 to 88.0',
      line: 'Eastern Dedicated Freight Corridor (EDFC)',
      machinery: 'Speno RG-48 Rail Grinder + USFD Testing Trolley (25T Axle)',
      rawDurationHours: 4.0,
      criticality: 'CRITICAL',
      safetyProtocol: 'Form T/409B Caution Order PSR 20 km/h; Banner flags and detonators staged at 1200m',
      status: bundled ? 'BUNDLED_READY' : 'PENDING_COORDINATION'
    }
  ];

  const filteredItems = WORK_ITEMS.filter(item => 
    activeDeptTab === 'ALL' || item.dept === activeDeptTab
  );

  const activeDetail = WORK_ITEMS.find(i => i.id === selectedWorkId) || WORK_ITEMS[0];

  const handleBundleOptimization = () => {
    setIsSimulatingSolver(true);
    setTimeout(() => {
      setBundled(true);
      setIsSimulatingSolver(false);
      if (onApplyMegaBlock) onApplyMegaBlock();
    }, 900);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Multi-Department Integrated Block Engine (SIH26027) */}
      <div className="bg-gradient-to-r from-blue-950/90 via-slate-900 to-indigo-950/90 rounded-3xl border border-sky-500/40 p-6 shadow-2xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3.5 bg-gradient-to-br from-sky-500 to-blue-700 text-slate-950 rounded-2xl shadow-lg shadow-sky-500/30">
              <Layers className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h3 className="text-xl font-black text-white tracking-wide">
                  Autonomous Multi-Department Integrated Mega-Block Portal
                </h3>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-400 font-mono text-[13px] font-black border border-emerald-500/40">
                  SIH26027 CORE COMPLIANT
                </span>
              </div>
              <p className="text-sm text-slate-300 mt-1 font-sans">
                Synchronizes Engineering (P-Way), Electrical (TRD/OHE), and Signal & Telecom (S&T) onto a unified Down Main corridor window.
              </p>
            </div>
          </div>

          {/* 1-Click Autonomous Bundling CTA */}
          <div className="flex items-center gap-3">
            {!bundled ? (
              <button
                onClick={handleBundleOptimization}
                disabled={isSimulatingSolver}
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-slate-950 font-black text-xs shadow-xl shadow-sky-500/30 transition-all flex items-center gap-2.5 disabled:opacity-50"
              >
                <Sparkles className={`w-4 h-4 ${isSimulatingSolver ? 'animate-spin' : ''}`} />
                {isSimulatingSolver ? t.optimizing : t.bundleMegaBlockBtn}
              </button>
            ) : (
              <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-emerald-950 text-emerald-300 border border-emerald-500/50">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span className="text-sm font-black">MEGA-BLOCK INTEGRATED & SANCTIONED</span>
              </div>
            )}
          </div>
        </div>

        {/* Quantified Efficiency Delta Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-800">
          <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
            <span className="text-xs text-slate-400 font-bold block">{t.conventionalDowntime}</span>
            <span className="text-lg font-mono font-black text-rose-400">
              8.0 Hours <span className="text-xs font-normal text-slate-400">(3 separate closures)</span>
            </span>
          </div>

          <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
            <span className="text-xs text-slate-400 font-bold block">{t.integratedDowntime}</span>
            <span className="text-lg font-mono font-black text-emerald-400">
              3.5 Hours <span className="text-xs font-normal text-slate-400">(Single shadow window)</span>
            </span>
          </div>

          <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
            <span className="text-xs text-slate-400 font-bold block">{t.capacitySaved}</span>
            <span className="text-lg font-mono font-black text-sky-400">
              +56.25% <span className="text-xs font-normal text-slate-400">0 Passenger Cancellations</span>
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Department Work Items List & Joint Safety Memo Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Work Items & Department Filter (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Department Filter Tabs */}
          <div className="flex items-center gap-2">
            {[
              { id: 'ALL', label: 'All Disciplines' },
              { id: 'P-Way', label: `🚜 ${t.pwayDept}` },
              { id: 'TRD', label: `⚡ ${t.trdDept}` },
              { id: 'S&T', label: `📡 ${t.stDept}` },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveDeptTab(tab.id as any)}
                className={`px-3.5 py-1.5 rounded-xl text-sm font-bold transition-all ${
                  activeDeptTab === tab.id
                    ? 'bg-sky-500 text-slate-950 shadow-md shadow-sky-500/20'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Work Items Cards */}
          <div className="space-y-3">
            {filteredItems.map(item => {
              const isSelected = selectedWorkId === item.id;
              const isPWay = item.dept === 'P-Way';
              const isTRD = item.dept === 'TRD';
              const themeBorder = isSelected ? 'border-sky-400 ring-2 ring-sky-500/30' : 'border-slate-800 hover:border-slate-700';
              const badgeBg = isPWay ? 'bg-amber-950 text-amber-300' : isTRD ? 'bg-purple-950 text-purple-300' : 'bg-emerald-950 text-emerald-300';

              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedWorkId(item.id)}
                  className={`bg-[#0F1423] p-4 rounded-2xl border ${themeBorder} cursor-pointer transition-all space-y-2.5`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <span className={`px-2.5 py-0.5 rounded-md font-mono text-xs font-black uppercase ${badgeBg}`}>
                        {item.dept}
                      </span>
                      <h4 className="font-bold text-white text-sm">
                        {item.title}
                      </h4>
                    </div>

                    <span className="font-mono text-sm font-black text-sky-400">
                      {item.rawDurationHours} hrs
                    </span>
                  </div>

                  <div className="text-sm text-slate-400 font-sans space-y-1">
                    <p><strong className="text-slate-300">Location:</strong> {item.location}</p>
                    <p><strong className="text-slate-300">Machinery:</strong> {item.machinery}</p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[13px] font-mono">
                    <span className="text-slate-500">Protocol: {item.safetyProtocol.slice(0, 48)}...</span>
                    <span className={`font-black ${item.status === 'BUNDLED_READY' ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {item.status === 'BUNDLED_READY' ? '● BUNDLED WITH DOWN MAIN' : '○ PENDING INTEGRATION'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Joint Safety Protocol & Disconnection Notice (5 Cols) */}
        <div className="lg:col-span-5 bg-[#0D1220] rounded-2xl border border-slate-800 p-5 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <h4 className="font-black text-white text-sm uppercase tracking-wide">
                Joint Integrated Safety Memo
              </h4>
            </div>
            <span className="font-mono text-xs text-slate-400">
              FORM T/351-J (COMBINED)
            </span>
          </div>

          {/* Active Selected Item Deep Dive */}
          <div className="space-y-3 text-xs">
            <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 space-y-1">
              <span className="text-xs text-slate-400 font-bold block">SELECTED DISCIPLINE TASK</span>
              <span className="font-black text-white text-sm block">{activeDetail.title}</span>
              <span className="text-slate-400 block">{activeDetail.location}</span>
            </div>

            <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 space-y-1">
              <span className="text-xs text-slate-400 font-bold block">MANDATORY SAFETY PROTOCOL</span>
              <p className="text-slate-300 leading-relaxed font-sans">{activeDetail.safetyProtocol}</p>
            </div>

            <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 space-y-2">
              <span className="text-xs text-slate-400 font-bold block">DEPARTMENTAL CLEARANCE STATUS</span>
              <div className="space-y-1.5 text-sm font-mono">
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">PWI (Senior Section Engineer/Track):</span>
                  <span className="text-emerald-400 font-bold">READY (CSM-955 Positioned)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">SE/OHE (Traction Distribution):</span>
                  <span className="text-emerald-400 font-bold">PERMIT TO WORK ISSUED</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">SSE/Sig (Signal & Telecom):</span>
                  <span className="text-emerald-400 font-bold">DISCONNECTION MEMO DRAFTED</span>
                </div>
              </div>
            </div>
          </div>

          {/* Automated Interlocking Pre-Check */}
          <div className="p-3.5 bg-sky-950/40 rounded-xl border border-sky-600/30 text-xs space-y-1">
            <span className="font-bold text-sky-300 block flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-sky-400" />
              Dynamic Bi-directional Diversion Enabled
            </span>
            <p className="text-slate-300 text-[13px] font-sans">
              All Down Main express trains (#22436, #12302, #12424) automatically deflected via Somna Point #12A onto the 3rd Line.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
