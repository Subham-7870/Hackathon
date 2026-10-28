import React from 'react';
import { Play, RotateCcw, Bot, AlertTriangle, Zap, Train, AlertOctagon } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { LanguageSelector } from './LanguageSelector';

interface HeaderProps {
  onOptimize: () => void;
  onReset: () => void;
  onOpenCopilot: () => void;
  onOpenDisruption: () => void;
  onOpenAddTrain?: () => void;
  onOpenAddBlockage?: () => void;
  customTrainsCount?: number;
  customBlockagesCount?: number;
  isOptimizing: boolean;
  hasOptimized: boolean;
  solverLatency?: number;
}

export const Header: React.FC<HeaderProps> = ({
  onOptimize,
  onReset,
  onOpenCopilot,
  onOpenDisruption,
  onOpenAddTrain,
  onOpenAddBlockage,
  customTrainsCount = 0,
  customBlockagesCount = 0,
  isOptimizing,
  hasOptimized,
  solverLatency,
}) => {
  const { t } = useLanguage();

  return (
    <header className="bg-[#0B0F19]/95 backdrop-blur-md border-b border-[#1E293B] sticky top-0 z-50 shadow-2xl">
      <div className="max-w-[1850px] mx-auto px-3 sm:px-4 py-2 sm:py-2.5 flex items-center justify-between gap-2 sm:gap-3">
        {/* Brand & Emblem (Protected against shrinking) */}
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 shrink-0 bg-gradient-to-br from-blue-600 via-indigo-600 to-sky-500 rounded-xl flex items-center justify-center text-white font-black text-sm sm:text-base shadow-lg shadow-blue-500/25 ring-1 ring-white/20">
            IR
          </div>
          <div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <h1 className="text-xs sm:text-sm md:text-base font-black tracking-tight text-white font-sans whitespace-nowrap">
                {t.appTitle}
              </h1>
              <span className="bg-gradient-to-r from-blue-900/70 to-indigo-900/70 text-sky-300 text-[10px] sm:text-xs font-mono font-bold px-1.5 sm:px-2 py-0.5 rounded-full border border-sky-400/30 shadow-sm shrink-0">
                v1.4
              </span>
              <span className="hidden md:inline-block bg-blue-950/80 text-sky-400 text-xs font-bold px-2 py-0.5 rounded-full border border-sky-500/30 shrink-0">
                {t.ministryBadge}
              </span>
              <span className="hidden 2xl:inline-flex bg-emerald-950/80 text-emerald-400 text-xs font-bold px-2 py-0.5 rounded-full border border-emerald-500/30 items-center gap-1.5 shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                {t.rbpCompliant}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium font-sans truncate max-w-[200px] md:max-w-[380px] hidden sm:block">
              {t.appSubtitle}
            </p>
          </div>
        </div>

        {/* Real-time Status, Language Selector & Action Buttons */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 ml-auto flex-wrap justify-end">
          {/* Quick Solver Badge */}
          {hasOptimized && solverLatency !== undefined && (
            <div className="hidden 2xl:flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-900 border border-slate-700/80 rounded-xl text-sm font-mono text-slate-300 shrink-0">
              <Zap className="w-3 h-3 text-amber-400" />
              <span>{t.solverExecution}: <strong className="text-amber-300">{(solverLatency * 1000).toFixed(1)}ms</strong></span>
            </div>
          )}

          {/* Regional Languages Dropdown Selector */}
          <LanguageSelector />

          {/* Add Custom Train Button */}
          {onOpenAddTrain && (
            <button
              onClick={onOpenAddTrain}
              title="Add Custom Train Consist (RTIS / NavIC Feed)"
              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-sky-950/80 hover:bg-sky-900 text-sky-200 border border-sky-500/50 text-xs sm:text-sm font-bold rounded-xl transition-all shadow-md shadow-sky-950/40 whitespace-nowrap shrink-0 relative"
            >
              <Train className="w-3.5 h-3.5 text-sky-400" />
              <span className="hidden sm:inline">+ Train</span>
              {customTrainsCount > 0 && (
                <span className="w-4 h-4 bg-sky-500 text-slate-950 rounded-full text-[10px] font-black flex items-center justify-center">
                  {customTrainsCount}
                </span>
              )}
            </button>
          )}

          {/* Add Custom Blockage Button */}
          {onOpenAddBlockage && (
            <button
              onClick={onOpenAddBlockage}
              title="Add Custom Track Blockage / Caution Order"
              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-rose-950/80 hover:bg-rose-900 text-rose-200 border border-rose-500/50 text-xs sm:text-sm font-bold rounded-xl transition-all shadow-md shadow-rose-950/40 whitespace-nowrap shrink-0 relative"
            >
              <AlertOctagon className="w-3.5 h-3.5 text-rose-400" />
              <span className="hidden sm:inline">+ Block</span>
              {customBlockagesCount > 0 && (
                <span className="w-4 h-4 bg-rose-500 text-white rounded-full text-[10px] font-black flex items-center justify-center">
                  {customBlockagesCount}
                </span>
              )}
            </button>
          )}

          {/* AI Co-Pilot Button */}
          <button
            onClick={onOpenCopilot}
            title={t.aiCopilot}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-indigo-950/70 hover:bg-indigo-900 text-indigo-200 border border-indigo-500/40 text-xs sm:text-sm font-bold rounded-xl transition-all shadow-md shadow-indigo-950/40 whitespace-nowrap shrink-0"
          >
            <Bot className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden lg:inline">{t.aiCopilot}</span>
            <span className="hidden md:inline lg:hidden">Co-Pilot</span>
          </button>

          {/* What-If Disruption Sandbox Button */}
          <button
            onClick={onOpenDisruption}
            title={t.whatIfSandbox}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-amber-950/60 hover:bg-amber-900 text-amber-200 border border-amber-500/40 text-xs sm:text-sm font-bold rounded-xl transition-all shadow-md shadow-amber-950/40 whitespace-nowrap shrink-0"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden xl:inline">{t.whatIfSandbox}</span>
            <span className="hidden md:inline xl:hidden">Sandbox</span>
          </button>

          {/* Reset Plan */}
          <button
            onClick={onReset}
            disabled={isOptimizing}
            title={t.reset}
            className="flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-2 bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-700 text-sm font-bold rounded-xl transition-all shadow-sm disabled:opacity-50 whitespace-nowrap shrink-0"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden lg:inline">{t.reset}</span>
          </button>

          {/* Build Optimized Plan */}
          <button
            onClick={onOptimize}
            disabled={isOptimizing}
            className="flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-500 hover:to-sky-400 text-white text-sm font-extrabold rounded-xl transition-all shadow-lg shadow-blue-500/30 disabled:opacity-60 whitespace-nowrap shrink-0"
          >
            {isOptimizing ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>{t.optimizing}</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>{hasOptimized ? t.reSolveBlockPlan : t.buildOptimizedPlan}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
