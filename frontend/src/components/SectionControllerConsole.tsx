import React, { useState } from 'react';
import { 
  Radio, 
  GitBranch, 
  AlertOctagon, 
  Key, 
  FileText, 
  Gauge, 
  CheckCircle2, 
  Clock, 
  ShieldAlert,
  SlidersHorizontal,
  RotateCcw
} from 'lucide-react';
import { PNActionDetails } from './PrivateNumberModal';

interface LogEntry {
  id: string;
  time: string;
  action: string;
  pn: string;
  user: string;
  status: 'EXECUTED' | 'ACTIVE' | 'SUPERSEDED';
}

interface SectionControllerConsoleProps {
  isBlockActive: boolean;
  onToggleBlock: (pn?: string) => void;
  onRequestPN: (action: PNActionDetails) => void;
}

export const SectionControllerConsole: React.FC<SectionControllerConsoleProps> = ({
  isBlockActive,
  onToggleBlock,
  onRequestPN
}) => {
  const [point12AState, setPoint12AState] = useState<'NORMAL' | 'REVERSE' | 'THROWING'>(isBlockActive ? 'REVERSE' : 'NORMAL');
  const [point14BState, setPoint14BState] = useState<'NORMAL' | 'REVERSE' | 'THROWING'>(isBlockActive ? 'REVERSE' : 'NORMAL');
  const [isRouteSetting, setIsRouteSetting] = useState<boolean>(false);
  const [recentLogs, setRecentLogs] = useState<LogEntry[]>([
    {
      id: 'LOG-101',
      time: '14:02:18',
      action: 'Form T/351 S&T Disconnection Granted (Somna Pt #12A)',
      pn: '7412',
      user: 'SCOR/NCR-ALJN',
      status: 'ACTIVE'
    },
    {
      id: 'LOG-100',
      time: '13:45:00',
      action: 'Route Precedence Locked: #22436 Vande Bharat',
      pn: '6821',
      user: 'SCOR/NCR-ALJN',
      status: 'EXECUTED'
    }
  ]);

  const addLog = (action: string, pn: string) => {
    const newLog: LogEntry = {
      id: `LOG-${Date.now().toString().slice(-4)}`,
      time: new Date().toTimeString().split(' ')[0],
      action,
      pn,
      user: 'SCOR/NCR-ALJN',
      status: 'ACTIVE'
    };
    setRecentLogs(prev => [newLog, ...prev.slice(0, 4)]);
  };

  // 1. SET ROUTE (CR/NR)
  const handleSetRoute = () => {
    onRequestPN({
      actionType: 'SET_ROUTE',
      title: 'COMMAND ROUTE CLEARANCE (CR/NR)',
      station: 'SOMNA (SOM)',
      assetId: 'DOWN MAIN ➔ 3RD LINE (PT #12A)',
      description: 'Authorize Electronic Interlocking (EI) route setting from Home Signal S-1012 via Point #12A Turnout to Starter S-14.',
      onConfirm: (pn) => {
        setIsRouteSetting(true);
        setTimeout(() => {
          setIsRouteSetting(false);
          addLog('Route Cleared & Locked: Home S-1012 ➔ 3rd Line', pn);
        }, 1200);
      }
    });
  };

  // 2. EMERGENCY ROUTE CANCEL (EUUYN - 120s TIMER)
  const handleRouteCancel = () => {
    onRequestPN({
      actionType: 'ROUTE_CANCEL_EUUYN',
      title: 'EMERGENCY ROUTE CANCELLATION (EUUYN)',
      station: 'SOMNA (SOM)',
      assetId: 'ROUTE #12A-DWN',
      description: 'G&SR Rule 3.38: Initiate emergency route cancellation with mandatory 120-second safety timer countdown.',
      onConfirm: (pn) => {
        addLog('Emergency Route Cancelled (EUUYN 120s Timer Completed)', pn);
      }
    });
  };

  // 3. THROW POINT MACHINE #12A
  const handleThrowPoint12A = () => {
    const nextState = point12AState === 'NORMAL' ? 'REVERSE' : 'NORMAL';
    onRequestPN({
      actionType: 'POINT_THROW',
      title: `POINT MACHINE #12A MOTOR THROW (${nextState})`,
      station: 'SOMNA (SOM)',
      assetId: 'POINT #12A (1:12 TWS)',
      description: `Transmit electrical throw command to Point Machine #12A motor to switch correspondence from ${point12AState} to ${nextState}.`,
      onConfirm: (pn) => {
        setPoint12AState('THROWING');
        setTimeout(() => {
          setPoint12AState(nextState);
          addLog(`Point Machine #12A Thrown to ${nextState}`, pn);
        }, 3000);
      }
    });
  };

  // 4. CRANK HANDLE (CH) RELEASE
  const handleCrankHandleRelease = () => {
    onRequestPN({
      actionType: 'CRANK_HANDLE',
      title: 'EMERGENCY CRANK HANDLE (CH) KEY TRANSMISSION',
      station: 'SOMNA (SOM)',
      assetId: 'CH KEY-BOX #02',
      description: 'Release physical mechanical crank handle key from Station Master electric key transmitter (EKT) for manual point operation.',
      onConfirm: (pn) => {
        addLog('Crank Handle Key #02 Released for Ground Staff', pn);
      }
    });
  };

  // 5. DISCONNECTION MEMO (FORM T/351)
  const handleFormT351 = () => {
    const willActivate = !isBlockActive;
    onRequestPN({
      actionType: willActivate ? 'T351_DISCONNECTION' : 'T351_RECONNECTION',
      title: willActivate ? 'FORM T/351 S&T DISCONNECTION NOTICE' : 'FORM T/352 RECONNECTION & TRACK CERTIFICATE',
      station: 'SOMNA (SOM) TO ALIGARH (ALJN)',
      assetId: 'DOWN MAINLINE (KM 104.5 ➔ KM 124.8)',
      description: willActivate
        ? 'Impose statutory S&T Disconnection on Down Mainline for 09-3X Dynamic Tamping Express P-Way track maintenance block.'
        : 'Re-connect Down Mainline track circuits & point machines; lift Form T/351 block and restore normal running line.',
      onConfirm: (pn) => {
        onToggleBlock(pn);
        addLog(willActivate ? 'Form T/351 P-Way Disconnection Imposed' : 'Form T/352 Reconnection Approved & Block Lifted', pn);
      }
    });
  };

  // 6. CAUTION ORDER (FORM T/409B TSR)
  const handleCautionOrder = () => {
    onRequestPN({
      actionType: 'T409B_TSR',
      title: 'FORM T/409B TEMPORARY SPEED RESTRICTION (TSR)',
      station: 'SOMNA (SOM)',
      assetId: 'TSR-DOWN-KM118',
      description: 'Issue statutory Caution Order imposing PSR 50 km/h over turnout Point #12A and TSR 30 km/h caution band.',
      onConfirm: (pn) => {
        addLog('T/409B Caution Order TSR 50 km/h Broadcast to Kavach OBUs', pn);
      }
    });
  };

  return (
    <div className="bg-[#080D18] border border-[#1E293B] rounded-lg p-3 font-mono shadow-2xl space-y-3">
      {/* Top Banner: Section Controller Identification & Live Subsystem Health */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#1E293B] pb-2.5 text-xs">
        <div className="flex items-center gap-3">
          <div className="px-2 py-1 bg-cyan-950/80 border border-cyan-500/40 rounded text-cyan-400 font-bold flex items-center gap-1.5 text-[13px]">
            <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            SECTION CONTROLLER BOARD (SCOR · DESK 04)
          </div>
          <span className="text-slate-400 font-bold text-[13px]">
            JURISDICTION: GHAZIABAD (KM 20.0) ➔ ALIGARH JN (KM 126.0) · TRIPLE LINE
          </span>
        </div>

        {/* Live Relay & Point Correspondence State Indicators */}
        <div className="flex items-center gap-4 text-[13px]">
          {/* Point #12A Correspondence */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500">PT #12A:</span>
            <span className={`px-1.5 py-0.5 rounded font-bold text-xs ${
              point12AState === 'NORMAL'
                ? 'bg-green-950 text-green-400 border border-green-600'
                : point12AState === 'REVERSE'
                ? 'bg-cyan-950 text-cyan-300 border border-cyan-500'
                : 'bg-amber-950 text-amber-300 border border-amber-500 animate-pulse'
            }`}>
              {point12AState === 'THROWING' ? 'THROWING (OOC)' : `${point12AState} (${point12AState[0]})`}
            </span>
          </div>

          {/* Point #14B Correspondence */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500">PT #14B:</span>
            <span className={`px-1.5 py-0.5 rounded font-bold text-xs ${
              isBlockActive
                ? 'bg-cyan-950 text-cyan-300 border border-cyan-500'
                : 'bg-green-950 text-green-400 border border-green-600'
            }`}>
              {isBlockActive ? 'REVERSE (R)' : 'NORMAL (N)'}
            </span>
          </div>

          {/* EI SIL-4 Status */}
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-green-400 font-bold text-xs">EI SIL-4 ONLINE</span>
          </div>

          {/* 25 kV AC SCADA Feeder */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500">25kV OHE:</span>
            <span className="text-cyan-400 font-bold text-xs">25.2 kV · ENERGIZED</span>
          </div>
        </div>
      </div>

      {/* Safety-Critical Push-Button Actions Bar */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
        {/* Button 1: SET ROUTE (CR/NR) */}
        <button
          onClick={handleSetRoute}
          disabled={isRouteSetting}
          className="px-3 py-2.5 bg-[#0B1528] hover:bg-[#122342] border border-cyan-500/40 hover:border-cyan-400 rounded flex flex-col items-center justify-center gap-1 transition-all group active:scale-[0.98]"
        >
          <div className="flex items-center gap-1.5 text-cyan-400 font-black text-[13px] group-hover:text-cyan-300">
            <GitBranch className="w-3.5 h-3.5" />
            SET ROUTE (CR)
          </div>
          <span className="text-[9.5px] text-slate-400">Clear Signal S-1012</span>
        </button>

        {/* Button 2: EMERGENCY ROUTE CANCEL (EUUYN) */}
        <button
          onClick={handleRouteCancel}
          className="px-3 py-2.5 bg-[#1C0F14] hover:bg-[#2C151F] border border-red-500/40 hover:border-red-400 rounded flex flex-col items-center justify-center gap-1 transition-all group active:scale-[0.98]"
        >
          <div className="flex items-center gap-1.5 text-red-400 font-black text-[13px] group-hover:text-red-300">
            <AlertOctagon className="w-3.5 h-3.5 text-red-500 animate-pulse" />
            ROUTE CANCEL (EUUYN)
          </div>
          <span className="text-[9.5px] text-slate-400">Engage 120s Timer</span>
        </button>

        {/* Button 3: THROW POINT #12A */}
        <button
          onClick={handleThrowPoint12A}
          className="px-3 py-2.5 bg-[#121A2D] hover:bg-[#1B2845] border border-blue-500/40 hover:border-blue-400 rounded flex flex-col items-center justify-center gap-1 transition-all group active:scale-[0.98]"
        >
          <div className="flex items-center gap-1.5 text-blue-400 font-black text-[13px] group-hover:text-blue-300">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            THROW PT #12A (N/R)
          </div>
          <span className="text-[9.5px] text-slate-400">Current: {point12AState}</span>
        </button>

        {/* Button 4: CRANK HANDLE RELEASE */}
        <button
          onClick={handleCrankHandleRelease}
          className="px-3 py-2.5 bg-[#1C1608] hover:bg-[#2E220D] border border-amber-500/40 hover:border-amber-400 rounded flex flex-col items-center justify-center gap-1 transition-all group active:scale-[0.98]"
        >
          <div className="flex items-center gap-1.5 text-amber-400 font-black text-[13px] group-hover:text-amber-300">
            <Key className="w-3.5 h-3.5" />
            CRANK HANDLE (CH)
          </div>
          <span className="text-[9.5px] text-slate-400">EKT Key Release</span>
        </button>

        {/* Button 5: FORM T/351 DISCONNECTION MEMO */}
        <button
          onClick={handleFormT351}
          className={`px-3 py-2.5 rounded flex flex-col items-center justify-center gap-1 transition-all border group active:scale-[0.98] ${
            isBlockActive
              ? 'bg-red-950/60 hover:bg-red-900/60 border-red-500 text-red-300 shadow-[0_0_15px_rgba(239,68,68,0.2)]'
              : 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-slate-300'
          }`}
        >
          <div className="flex items-center gap-1.5 font-black text-[13px]">
            <FileText className="w-3.5 h-3.5" />
            {isBlockActive ? 'LIFT T/351 (T/352)' : 'GRANT T/351 BLOCK'}
          </div>
          <span className="text-[9.5px] opacity-80">
            {isBlockActive ? 'DOWN MAIN BLOCKED' : 'NORMAL CLEAR'}
          </span>
        </button>

        {/* Button 6: CAUTION ORDER T/409B */}
        <button
          onClick={handleCautionOrder}
          className="px-3 py-2.5 bg-[#0F1E19] hover:bg-[#162D26] border border-emerald-500/40 hover:border-emerald-400 rounded flex flex-col items-center justify-center gap-1 transition-all group active:scale-[0.98]"
        >
          <div className="flex items-center gap-1.5 text-emerald-400 font-black text-[13px] group-hover:text-emerald-300">
            <Gauge className="w-3.5 h-3.5" />
            CAUTION ORDER (T/409B)
          </div>
          <span className="text-[9.5px] text-slate-400">Issue / Broadcast TSR</span>
        </button>
      </div>

      {/* Electronic Block Register (EBR) Live Log Strip */}
      <div className="bg-[#03060E] border border-slate-800/80 rounded px-3 py-2 flex items-center justify-between text-[10.5px]">
        <div className="flex items-center gap-2 text-slate-400 font-bold shrink-0">
          <Clock className="w-3 h-3 text-cyan-400" />
          <span>EBR DISPATCH LOG:</span>
        </div>
        <div className="flex items-center gap-4 overflow-x-auto text-slate-300 whitespace-nowrap pl-3">
          {recentLogs.map(log => (
            <div key={log.id} className="flex items-center gap-1.5">
              <span className="text-slate-500">[{log.time}]</span>
              <span className="text-slate-300">{log.action}</span>
              <span className="px-1.5 py-0.2 bg-cyan-950 border border-cyan-600 rounded text-cyan-400 font-bold">
                PN: {log.pn}
              </span>
              <span className="text-slate-600">·</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
