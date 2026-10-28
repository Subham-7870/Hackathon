import React from 'react';
import { Clock, TrendingUp, ShieldCheck, Layers, Train, CheckCircle2 } from 'lucide-react';
import { OptimizationMetrics } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface StatsBarProps {
  metrics?: OptimizationMetrics;
  totalRequests: number;
  totalWindows: number;
}

export const StatsBar: React.FC<StatsBarProps> = ({ metrics, totalRequests, totalWindows }) => {
  const { t } = useLanguage();

  return (
    <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4" aria-label="Key Performance Indicators">
      {/* 1. Saved Line Closure Hours */}
      <div className="bg-[#111827] p-4 rounded-2xl border border-slate-800 shadow-md flex flex-col justify-between hover:border-slate-700 transition-colors">
        <div className="flex items-center justify-between text-slate-400 mb-2">
          <span className="text-sm font-bold uppercase tracking-wider">{t.corridorHoursSaved}</span>
          <div className="p-1.5 bg-blue-950/80 rounded-lg text-sky-400">
            <Clock className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-extrabold text-white font-mono">
            {metrics ? `${metrics.corridor_closure_hours_saved.toFixed(1)}h` : '0.0h'}
          </span>
          <span className="text-sm text-emerald-400 font-semibold">{t.viaShadowing}</span>
        </div>
      </div>

      {/* 2. Track Capacity Gain */}
      <div className="bg-[#111827] p-4 rounded-2xl border border-slate-800 shadow-md flex flex-col justify-between hover:border-slate-700 transition-colors">
        <div className="flex items-center justify-between text-slate-400 mb-2">
          <span className="text-sm font-bold uppercase tracking-wider">{t.trackCapacityGain}</span>
          <div className="p-1.5 bg-emerald-950/80 rounded-lg text-emerald-400">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-extrabold text-emerald-400 font-mono">
            {metrics ? `+${metrics.track_capacity_gain_percent.toFixed(1)}%` : '+0.0%'}
          </span>
          <span className="text-sm text-slate-400">{t.throughputLabel}</span>
        </div>
      </div>

      {/* 3. Superfast Punctuality */}
      <div className="bg-[#111827] p-4 rounded-2xl border border-slate-800 shadow-md flex flex-col justify-between hover:border-slate-700 transition-colors">
        <div className="flex items-center justify-between text-slate-400 mb-2">
          <span className="text-sm font-bold uppercase tracking-wider">{t.superfastDelay}</span>
          <div className="p-1.5 bg-indigo-950/80 rounded-lg text-indigo-400">
            <ShieldCheck className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-extrabold font-mono text-emerald-400">
            {metrics ? `${metrics.superfast_train_delay_minutes}m` : '0m'}
          </span>
          <span className="text-[13px] text-emerald-300 bg-emerald-950 px-2 py-0.5 rounded font-bold border border-emerald-800/50">
            {t.protected100}
          </span>
        </div>
      </div>

      {/* 4. Multi-Department Shadow Blocks */}
      <div className="bg-[#111827] p-4 rounded-2xl border border-slate-800 shadow-md flex flex-col justify-between hover:border-slate-700 transition-colors">
        <div className="flex items-center justify-between text-slate-400 mb-2">
          <span className="text-sm font-bold uppercase tracking-wider">{t.shadowBlocks}</span>
          <div className="p-1.5 bg-purple-950/80 rounded-lg text-purple-400">
            <Layers className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-extrabold text-purple-300 font-mono">
            {metrics ? metrics.shadow_blocks_created : 0}
          </span>
          <span className="text-[13px] text-purple-300 bg-purple-950 px-2 py-0.5 rounded font-semibold border border-purple-800/50">
            P-Way+S&T+OHE
          </span>
        </div>
      </div>

      {/* 5. Request Allocation Efficiency */}
      <div className="bg-[#111827] p-4 rounded-2xl border border-slate-800 shadow-md flex flex-col justify-between hover:border-slate-700 transition-colors">
        <div className="flex items-center justify-between text-slate-400 mb-2">
          <span className="text-sm font-bold uppercase tracking-wider">{t.demandsAllocated}</span>
          <div className="p-1.5 bg-sky-950/80 rounded-lg text-sky-400">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-extrabold text-white font-mono">
            {metrics ? `${metrics.requests_allocated}/${metrics.total_requests_processed}` : `0/${totalRequests}`}
          </span>
          <span className="text-sm text-slate-400">{t.satisfied}</span>
        </div>
      </div>

      {/* 6. Freight Stabled in Loops */}
      <div className="bg-[#111827] p-4 rounded-2xl border border-slate-800 shadow-md flex flex-col justify-between hover:border-slate-700 transition-colors">
        <div className="flex items-center justify-between text-slate-400 mb-2">
          <span className="text-sm font-bold uppercase tracking-wider">{t.freightLoops}</span>
          <div className="p-1.5 bg-amber-950/80 rounded-lg text-amber-400">
            <Train className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-extrabold text-amber-400 font-mono">
            {metrics ? metrics.freight_trains_looped : 0}
          </span>
          <span className="text-[13px] text-amber-300 bg-amber-950 px-2 py-0.5 rounded font-semibold border border-amber-800/50">
            {t.sidingStabled}
          </span>
        </div>
      </div>
    </section>
  );
};
