import React, { useState } from 'react';
import { MaintenanceRequest, TimetableWindow, SolvedBlock, Department, PlanningHorizon } from '../types';
import { initialDefects, weeklyRollingBlockProgram, monthlyMasterAssetPlan } from '../data/defectsAndRoutes';
import { 
  Filter, 
  FileText, 
  CheckCircle, 
  Zap, 
  Shield, 
  Wrench, 
  Calendar, 
  Layers, 
  AlertTriangle, 
  TrendingUp, 
  Clock, 
  Activity, 
  Cpu, 
  CheckCircle2 
} from 'lucide-react';

interface TrackGanttProps {
  requests: MaintenanceRequest[];
  timetables: TimetableWindow[];
  blocks: SolvedBlock[];
  hasOptimized: boolean;
  onGenerateSanction: (block: SolvedBlock) => void;
}

export const TrackGantt: React.FC<TrackGanttProps> = ({
  requests,
  timetables,
  blocks,
  hasOptimized,
  onGenerateSanction,
}) => {
  const [horizon, setHorizon] = useState<PlanningHorizon | 'defects'>('daily');
  const [activeDept, setActiveDept] = useState<Department | 'All'>('All');
  const [defectSourceFilter, setDefectSourceFilter] = useState<'ALL' | 'TMS' | 'SMMS' | 'TDMS'>('ALL');

  const filteredRequests = requests.filter(
    (req) => activeDept === 'All' || req.department === activeDept
  );

  const filteredDefects = initialDefects.filter(
    (def) => defectSourceFilter === 'ALL' || def.source_system === defectSourceFilter
  );

  const getDeptColor = (dept: Department) => {
    switch (dept) {
      case 'Track': return 'bg-sky-950 text-sky-400 border-sky-800/60';
      case 'Signal': return 'bg-emerald-950 text-emerald-400 border-emerald-800/60';
      case 'Traction': return 'bg-purple-950 text-purple-400 border-purple-800/60';
      default: return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <div className="space-y-8">
      {/* Horizon Selector Header Bar */}
      <div className="bg-[#111827] rounded-3xl border border-slate-800 p-6 shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <h3 className="text-base font-extrabold text-white flex items-center gap-2.5">
              <Layers className="w-5 h-5 text-sky-400" />
              Multi-Horizon Block Planning & Silo Integration Engine
            </h3>
            <p className="text-sm text-slate-400 mt-1">
              Supports tactical daily 24h allocations, Railway Board 7-day Rolling Block Programme (RBP), and 30-day master asset overhaul.
            </p>
          </div>

          {/* Horizon Mode Toggle Tabs */}
          <div className="flex flex-wrap items-center gap-2 bg-slate-900 p-1.5 rounded-2xl border border-slate-800">
            <button
              onClick={() => setHorizon('daily')}
              className={`px-4 py-2 rounded-xl text-sm font-extrabold transition-all flex items-center gap-2 ${
                horizon === 'daily'
                  ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-slate-950 shadow-md shadow-sky-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Clock className="w-4 h-4" />
              Daily 24h Tactical
            </button>

            <button
              onClick={() => setHorizon('weekly')}
              className={`px-4 py-2 rounded-xl text-sm font-extrabold transition-all flex items-center gap-2 ${
                horizon === 'weekly'
                  ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-slate-950 shadow-md shadow-sky-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Calendar className="w-4 h-4" />
              Weekly 7-Day RBP
            </button>

            <button
              onClick={() => setHorizon('monthly')}
              className={`px-4 py-2 rounded-xl text-sm font-extrabold transition-all flex items-center gap-2 ${
                horizon === 'monthly'
                  ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-slate-950 shadow-md shadow-sky-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              Monthly 30-Day Master
            </button>

            <button
              onClick={() => setHorizon('defects')}
              className={`px-4 py-2 rounded-xl text-sm font-extrabold transition-all flex items-center gap-2 ${
                horizon === 'defects'
                  ? 'bg-gradient-to-r from-rose-500 to-amber-600 text-white shadow-md shadow-rose-500/30'
                  : 'text-rose-400/80 hover:text-rose-300'
              }`}
            >
              <AlertTriangle className="w-4 h-4" />
              TMS / SMMS / TDMS Defects
            </button>
          </div>
        </div>

        {/* 1. Daily 24h Tactical Horizon */}
        {horizon === 'daily' && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <span className="text-sm text-slate-400">
                Filter demands by engineering discipline:
              </span>
              <div className="flex items-center gap-2">
                {(['All', 'Track', 'Signal', 'Traction'] as (Department | 'All')[]).map((dept) => (
                  <button
                    key={dept}
                    onClick={() => setActiveDept(dept)}
                    className={`px-3.5 py-1.5 rounded-xl text-sm font-bold transition-all ${
                      activeDept === dept
                        ? 'bg-sky-500 text-slate-950 shadow-md shadow-sky-500/30'
                        : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    {dept}
                  </button>
                ))}
              </div>
            </div>

            {/* Requests Table */}
            <div className="overflow-x-auto rounded-2xl border border-slate-800">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-900/90 text-sm font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800">
                    <th className="py-3 px-5">Demand ID</th>
                    <th className="py-3 px-5">Department</th>
                    <th className="py-3 px-5">Corridor Sector</th>
                    <th className="py-3 px-5">Work Description & Heavy Machinery</th>
                    <th className="py-3 px-5">Duration</th>
                    <th className="py-3 px-5">Priority</th>
                    <th className="py-3 px-5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-xs">
                  {filteredRequests.map((req) => {
                    const isAllocated = hasOptimized && req.status !== 'Deferred / Next Cycle';
                    return (
                      <tr key={req.request_id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-4 px-5 font-mono font-bold text-sky-400">{req.request_id}</td>
                        <td className="py-4 px-5">
                          <span className={`px-2.5 py-1 rounded-lg text-sm font-bold border ${getDeptColor(req.department)}`}>
                            {req.department}
                          </span>
                        </td>
                        <td className="py-4 px-5 font-mono text-slate-300">{req.location_sector}</td>
                        <td className="py-4 px-5 max-w-md">
                          <div className="font-semibold text-slate-200 line-clamp-1">{req.work_description}</div>
                          {req.machine_required && (
                            <span className="inline-block mt-1 text-[13px] text-indigo-300 bg-indigo-950/80 px-2 py-0.5 rounded-md font-medium border border-indigo-800/50">
                              ⚙️ {req.machine_required}
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-5 font-mono font-bold text-slate-200">{req.duration_minutes}m</td>
                        <td className="py-4 px-5">
                          <span
                            className={`text-sm font-extrabold uppercase px-2.5 py-1 rounded-full ${
                              req.priority === 'Critical'
                                ? 'bg-rose-950 text-rose-300 border border-rose-800/60'
                                : req.priority === 'High'
                                ? 'bg-amber-950 text-amber-300 border border-amber-800/60'
                                : 'bg-slate-800 text-slate-300'
                            }`}
                          >
                            {req.priority}
                          </span>
                        </td>
                        <td className="py-4 px-5">
                          {isAllocated ? (
                            <span className="inline-flex items-center gap-1.5 text-sm font-bold text-emerald-400 bg-emerald-950/80 px-2.5 py-1 rounded-lg border border-emerald-800/60">
                              <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                              Allocated
                            </span>
                          ) : (
                            <span className="text-xs font-medium text-amber-400 bg-amber-950/80 px-2.5 py-1 rounded-lg border border-amber-800/60">
                              {req.status}
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 2. Weekly 7-Day Rolling Block Programme (RBP) Horizon */}
        {horizon === 'weekly' && (
          <div className="space-y-4">
            <div className="p-4 bg-sky-950/40 rounded-2xl border border-sky-800/40 text-sm text-sky-200 flex items-center justify-between">
              <span>
                <strong>Rolling Block Programme (RBP - Railway Board Directive):</strong> Multi-departmental 4-hour consolidated mega-blocks scheduled weekly with zero passenger train cancellations.
              </span>
              <span className="font-bold text-sky-400 font-mono">Quota: 28 Hours / Week</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {weeklyRollingBlockProgram.map((item, idx) => (
                <div key={idx} className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-extrabold text-sky-400">{item.day}</span>
                    <span className="text-xs bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded-md font-bold border border-emerald-800/50">
                      {item.status}
                    </span>
                  </div>
                  <div className="text-sm font-bold text-white">{item.corridor}</div>
                  <div className="text-sm text-amber-300 font-mono font-semibold">Slot: {item.slot}</div>
                  <p className="text-[13px] text-slate-300 leading-relaxed">{item.scope}</p>

                  <div className="pt-2 border-t border-slate-800 flex flex-wrap gap-1.5">
                    {item.departments.map((d, i) => (
                      <span key={i} className="text-xs font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                        {d}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 3. Monthly 30-Day Master Asset Overhaul Horizon */}
        {horizon === 'monthly' && (
          <div className="space-y-4">
            <div className="p-4 bg-purple-950/40 rounded-2xl border border-purple-800/40 text-xs text-purple-200 flex items-center justify-between">
              <span>
                <strong>30-Day Master Infrastructure Renewal Plan:</strong> Coordinates heavy specialized on-track machines (TRT, BCM, PQRS) and major substation overhauls.
              </span>
              <span className="font-bold text-purple-400 font-mono">Monthly Budget: 92 Hours</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {monthlyMasterAssetPlan.map((plan, idx) => (
                <div key={idx} className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-extrabold text-purple-400">{plan.month_week}</span>
                    <span className="text-sm font-bold text-white bg-slate-800 px-2.5 py-0.5 rounded-lg">
                      {plan.quota_hours} Hours Allocated
                    </span>
                  </div>
                  <div className="text-sm font-extrabold text-white">{plan.activity}</div>
                  <div className="text-sm text-sky-400 font-mono">Target Corridor: {plan.section}</div>
                  <div className="text-sm text-emerald-400 font-semibold bg-emerald-950/40 p-2.5 rounded-xl border border-emerald-800/40">
                    🎯 Projected Asset Availability Gain: {plan.asset_gain}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4. TMS / SMMS / TDMS Silo Defect Integrator */}
        {horizon === 'defects' && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <span className="text-sm text-slate-300">
                Filter by legacy departmental data silos (unintegrated in existing BDMS):
              </span>
              <div className="flex items-center gap-2">
                {(['ALL', 'TMS', 'SMMS', 'TDMS'] as const).map((source) => (
                  <button
                    key={source}
                    onClick={() => setDefectSourceFilter(source)}
                    className={`px-3.5 py-1.5 rounded-xl text-sm font-bold transition-all ${
                      defectSourceFilter === source
                        ? 'bg-rose-500 text-white shadow-md shadow-rose-500/30'
                        : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    {source === 'ALL' ? 'All Silos' : source === 'TMS' ? 'Track (TMS)' : source === 'SMMS' ? 'Signal (SMMS)' : 'Traction (TDMS)'}
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-800">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-900/90 text-sm font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800">
                    <th className="py-3 px-5">Defect ID</th>
                    <th className="py-3 px-5">Silo Source</th>
                    <th className="py-3 px-5">Defect Classification</th>
                    <th className="py-3 px-5">Diagnostic Description</th>
                    <th className="py-3 px-5">Overdue</th>
                    <th className="py-3 px-5">Unattended Risk</th>
                    <th className="py-3 px-5">Severity</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-xs">
                  {filteredDefects.map((def) => (
                    <tr key={def.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-4 px-5 font-mono font-bold text-rose-400">{def.id}</td>
                      <td className="py-4 px-5">
                        <span className="px-2 py-0.5 rounded text-[13px] font-extrabold bg-slate-800 text-slate-200 border border-slate-700">
                          {def.source_system}
                        </span>
                      </td>
                      <td className="py-4 px-5 font-semibold text-white">{def.defect_type}</td>
                      <td className="py-4 px-5 text-slate-300 max-w-md">{def.description}</td>
                      <td className="py-4 px-5 font-mono text-amber-400 font-bold">{def.days_overdue} days</td>
                      <td className="py-4 px-5 font-mono text-rose-300 font-bold">
                        TSR {def.speed_restriction_if_unattended_kmh} km/h
                      </td>
                      <td className="py-4 px-5">
                        <span className={`px-2.5 py-1 rounded-full text-sm font-extrabold ${
                          def.severity === 'Critical' ? 'bg-rose-950 text-rose-300 border border-rose-800/60' : 'bg-amber-950 text-amber-300 border border-amber-800/60'
                        }`}>
                          {def.severity}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* 2. Coordinated Block Sanction Results */}
      {hasOptimized && blocks.length > 0 && (
        <div className="bg-[#111827] rounded-3xl border border-slate-800 shadow-xl overflow-hidden p-6 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-3">
                <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                  <Zap className="w-5 h-5 text-sky-400" />
                  Solved Coordinated Maintenance Blocks (Rolling Block Schedule)
                </h3>
                <span className="bg-purple-950 text-purple-300 text-sm font-bold px-3 py-1 rounded-full border border-purple-800/60">
                  {blocks.filter(b => b.is_shadow_block).length} Multi-Dept Bundles
                </span>
              </div>
              <p className="text-sm text-slate-400 mt-1">
                Optimized mathematical schedule ready for Section Controller authorization and Form T/409 Caution Order issuance.
              </p>
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {blocks.map((block) => {
              return (
                <div
                  key={block.block_id}
                  className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                    block.is_shadow_block
                      ? 'bg-purple-950/20 border-purple-800/60 shadow-lg'
                      : 'bg-slate-900/60 border-slate-800 shadow-md'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-mono text-sm font-extrabold text-white">{block.block_id}</span>
                      {block.is_shadow_block ? (
                        <span className="text-[13px] font-bold uppercase tracking-wider bg-purple-950 text-purple-300 px-2.5 py-1 rounded-lg border border-purple-700">
                          ⚡ Shadow Block
                        </span>
                      ) : (
                        <span className="text-[13px] font-bold uppercase tracking-wider bg-slate-800 text-slate-300 px-2.5 py-1 rounded-lg">
                          Single Dept Block
                        </span>
                      )}
                    </div>

                    <div className="text-xs font-semibold text-slate-300 mb-3">
                      Sector: <span className="font-mono text-white font-bold">{block.location_sector}</span>
                    </div>

                    {/* Schedule Time & OHE Isolation */}
                    <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800 mb-4 space-y-2 text-xs">
                      <div className="flex justify-between text-slate-400">
                        <span>Planned Window:</span>
                        <strong className="font-mono text-white">{block.start_time_iso.slice(11, 16)} - {block.end_time_iso.slice(11, 16)} UTC</strong>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>Closure Duration:</span>
                        <strong className="font-mono text-sky-400 font-bold">{block.total_block_duration_minutes} mins</strong>
                      </div>
                      {block.ohe_power_isolated && (
                        <div className="flex justify-between text-purple-300 font-medium">
                          <span>25 kV OHE Isolation:</span>
                          <strong className="font-mono">{block.elementary_section || 'ES-201 Active'}</strong>
                        </div>
                      )}
                    </div>

                    {/* Capacity Bar */}
                    <div className="mb-4">
                      <div className="flex justify-between text-sm text-slate-400 mb-1.5">
                        <span>Window Capacity Utilized</span>
                        <span className="font-bold text-white font-mono">{block.capacity_utilized_percent}%</span>
                      </div>
                      <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            block.capacity_utilized_percent > 85 ? 'bg-amber-400' : 'bg-emerald-400'
                          }`}
                          style={{ width: `${block.capacity_utilized_percent}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Assigned Department Work List */}
                    <div className="space-y-2 mb-4">
                      <span className="text-[13px] font-bold uppercase tracking-wider text-slate-500">Coordinated Tasks:</span>
                      {block.assigned_requests.map((req, i) => (
                        <div key={i} className="text-xs bg-slate-900/90 p-2.5 rounded-xl border border-slate-800 flex justify-between items-center text-slate-200">
                          <span className="truncate mr-2">
                            <strong className="text-sky-300">{req.department}:</strong> {req.work_description}
                          </span>
                          <span className="font-mono text-sm font-bold text-slate-400 shrink-0">{req.duration_minutes}m</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Sanction Trigger Button */}
                  <button
                    onClick={() => onGenerateSanction(block)}
                    className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-500 hover:to-sky-400 text-white text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20"
                  >
                    <FileText className="w-4 h-4" />
                    <span>Issue Form T/409 Caution Order</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
