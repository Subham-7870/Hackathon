import React from 'react';
import { Radio, AlertTriangle, CheckCircle2, Shield, Zap, PauseCircle } from 'lucide-react';
import { LiveTelemetryStream } from '../services/api';

interface LiveTelemetryTickerProps {
  events?: LiveTelemetryStream['events'];
}

const DEFAULT_BROADCAST_EVENTS = [
  {
    event_id: 'feed-1',
    timestamp: 'LIVE',
    department: 'CRIS-COA',
    severity: 'INFO',
    message: 'NCR Prayagraj Division: Ghaziabad–Aligarh (106.1 RKM) · 10 Active Consists Tracked on RTIS NavIC Satellite Telemetry'
  },
  {
    event_id: 'feed-2',
    timestamp: '01:14',
    department: 'TMS',
    severity: 'WARNING',
    message: 'Point #12A REVERSE (R) locked: Down Main trains diverged to 3rd Line to circumvent Somna–Aligarh P-Way Mega-Block'
  },
  {
    event_id: 'feed-3',
    timestamp: '01:10',
    department: 'KAVACH',
    severity: 'INFO',
    message: 'Kavach SIL-4 UHF TDMA locked · Headway protection active with dynamic Braking Distance (EBD/SBD) profiles'
  },
  {
    event_id: 'feed-4',
    timestamp: '01:05',
    department: 'P-WAY',
    severity: 'CRITICAL',
    message: 'Form T/351 Sanctioned: Somna–Aligarh DN Main (KM 104.5–124.8) · 09-3X Dynamic Tamping Express occupying track'
  },
  {
    event_id: 'feed-5',
    timestamp: '00:58',
    department: 'SMMS',
    severity: 'INFO',
    message: 'Electronic Block Register: Private Number #4892 exchanged between Section Controller NCR and SM/Somna'
  },
  {
    event_id: 'feed-6',
    timestamp: '00:45',
    department: 'OHE',
    severity: 'INFO',
    message: 'Traction SCADA: 25.2 kV · 50.1 Hz · Feeding Post CB-101 closed and verified normal'
  }
];

export const LiveTelemetryTicker: React.FC<LiveTelemetryTickerProps> = ({ events }) => {
  const displayEvents = (events && events.length > 0) ? events : DEFAULT_BROADCAST_EVENTS;

  // Duplicate items for seamless 100% -> 50% infinite CSS marquee loop
  const marqueeItems = [...displayEvents, ...displayEvents];

  return (
    <div className="bg-[#070B14] rounded-2xl border border-slate-800/90 p-2.5 sm:p-3 flex items-center gap-3 sm:gap-4 overflow-hidden shadow-xl relative group">
      {/* Ticker Lead Tag (Isolated Solid Badge) */}
      <div className="relative z-20 flex items-center gap-2 bg-gradient-to-r from-blue-700 via-indigo-600 to-sky-600 text-white px-3 py-1.5 rounded-xl font-extrabold text-xs shrink-0 shadow-lg shadow-blue-950/60 ring-1 ring-white/20">
        <Radio className="w-3.5 h-3.5 animate-pulse text-sky-200" />
        <span className="tracking-wide uppercase font-sans">CRIS COA LIVE DISPATCH FEED</span>
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping ml-0.5" />
      </div>

      {/* Continuous Marquee Ticker Container with its own local fade masks */}
      <div className="flex-1 overflow-hidden relative cursor-default min-w-0">
        {/* Local Left & Right Subtle Fade Edges */}
        <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-[#070B14] to-transparent z-10" />
        <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-[#070B14] to-transparent z-10" />

        <div className="animate-marquee-scroll flex items-center gap-8 text-xs py-0.5">
          {marqueeItems.map((ev, idx) => {
            const isCritical = ev.severity === 'CRITICAL';
            const isWarning = ev.severity === 'WARNING';

            return (
              <div
                key={`${ev.event_id || 'ev'}-${idx}`}
                className="inline-flex items-center gap-2 text-slate-300 transition-colors hover:text-white shrink-0"
              >
                {/* Timestamp Pill */}
                <span className="font-mono text-[13px] text-slate-400 font-bold bg-slate-900/90 px-1.5 py-0.5 rounded border border-slate-800">
                  {ev.timestamp}
                </span>

                {/* Department Tag */}
                <span
                  className={`text-[11px] font-black tracking-wider px-1.5 py-0.5 rounded uppercase ${
                    ev.department === 'P-WAY' || ev.department === 'TMS'
                      ? 'bg-amber-950/80 text-amber-300 border border-amber-800/60'
                      : ev.department === 'SMMS' || ev.department === 'CRIS-COA'
                      ? 'bg-blue-950/80 text-sky-300 border border-blue-800/60'
                      : ev.department === 'KAVACH'
                      ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/60'
                      : ev.department === 'OHE' || ev.department === 'TDMS'
                      ? 'bg-purple-950/80 text-purple-300 border border-purple-800/60'
                      : 'bg-slate-800 text-slate-300 border border-slate-700'
                  }`}
                >
                  {ev.department}
                </span>

                {/* Event Message */}
                <span
                  className={`text-xs font-semibold ${
                    isCritical
                      ? 'text-rose-300 font-bold drop-shadow-[0_0_8px_rgba(244,63,94,0.4)]'
                      : isWarning
                      ? 'text-amber-300 font-bold'
                      : 'text-slate-200'
                  }`}
                >
                  {ev.message}
                </span>

                {/* Separator Diamond */}
                <span className="text-slate-700 font-bold mx-1">◆</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Hover Pause Hint Badge */}
      <div className="hidden lg:flex items-center gap-1 text-[11px] text-slate-500 shrink-0 font-medium px-2 py-0.5 rounded-lg bg-slate-900/60 border border-slate-800 z-10 opacity-60 group-hover:opacity-100 transition-opacity">
        <PauseCircle className="w-3 h-3 text-slate-400" />
        <span>Hover to freeze</span>
      </div>
    </div>
  );
};
