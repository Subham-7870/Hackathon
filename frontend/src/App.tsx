import React, { useState, useEffect, useRef } from 'react';
import { 
  MaintenanceRequest, 
  TimetableWindow, 
  TrainSchedule, 
  SolvedBlock, 
  OptimizationMetrics, 
  DisruptionEvent, 
  CautionOrderForm,
  GeoStation,
  GeoSector
} from './types';
import { fetchInitialState, optimizePlan, generateCautionOrder, fetchLiveStream, LiveTelemetryStream } from './services/api';
import { Header } from './components/Header';
import { StatsBar } from './components/StatsBar';
import { TrackGantt } from './components/TrackGantt';
import { CorridorMap } from './components/CorridorMap';
import { SchematicRailMap } from './components/SchematicRailMap';
import { DisruptionSandbox } from './components/DisruptionSandbox';
import { AICopilotDrawer } from './components/AICopilotDrawer';
import { SanctionModal } from './components/SanctionModal';
import { LiveCabDashboard } from './components/LiveCabDashboard';
import { LiveTelemetryTicker } from './components/LiveTelemetryTicker';
import { StringChart } from './components/StringChart';
import { MultiDeptBlockPortal } from './components/MultiDeptBlockPortal';
import { SectionControllerConsole } from './components/SectionControllerConsole';
import { PrivateNumberModal, PNActionDetails } from './components/PrivateNumberModal';
import { CustomTrainModal } from './components/CustomTrainModal';
import { CustomBlockageModal, CustomBlockage } from './components/CustomBlockageModal';
import { Calendar, Navigation, Sparkles, Map, Network, Radio, Database, TrendingUp, Layers, Train, AlertOctagon, Sliders } from 'lucide-react';
import { useLanguage } from './context/LanguageContext';
import { getLocalizedJustification } from './i18n/trainTranslations';

export function App() {
  const { t, language } = useLanguage();
  const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
  const [timetables, setTimetables] = useState<TimetableWindow[]>([]);
  const [trains, setTrains] = useState<TrainSchedule[]>([]);
  const [corridors, setCorridors] = useState<{ stations: GeoStation[]; sectors: GeoSector[] }>({
    stations: [],
    sectors: [],
  });

  const [solvedBlocks, setSolvedBlocks] = useState<SolvedBlock[]>([]);
  const [metrics, setMetrics] = useState<OptimizationMetrics | undefined>(undefined);
  const [justification, setJustification] = useState<string>('');

  const [activeTab, setActiveTab] = useState<'schematic' | 'stringchart' | 'multidept' | 'geomap' | 'gantt'>('schematic');
  const [selectedSector, setSelectedSector] = useState<string>('SEC-NDLS-CNB-01');
  const [selectedTrain, setSelectedTrain] = useState<TrainSchedule | null>(null);

  // Time scrubber and playback state
  const [currentTimeMinutes, setCurrentTimeMinutes] = useState<number>(75); // 01:15 UTC default
  const [isPlaying, setIsPlaying] = useState<boolean>(true); // Auto-playing active trains
  const [simulationSpeed, setSimulationSpeed] = useState<number>(8); // Fast & fluid 8x simulation speed
  const timerRef = useRef<number | null>(null);

  const [isOptimizing, setIsOptimizing] = useState(false);
  const [hasOptimized, setHasOptimized] = useState(false);
  const [solverLatency, setSolverLatency] = useState<number | undefined>(undefined);

  const [isCopilotOpen, setIsCopilotOpen] = useState(false);
  const [isDisruptionOpen, setIsDisruptionOpen] = useState(false);
  const [sanctionForm, setSanctionForm] = useState<CautionOrderForm | null>(null);

  // Live Database Stream State
  const [liveStreamData, setLiveStreamData] = useState<LiveTelemetryStream | null>(null);
  const [isLiveStreamActive, setIsLiveStreamActive] = useState<boolean>(true);

  // Section Controller & Private Number (PN) Interlocking State
  const [isBlockActive, setIsBlockActive] = useState<boolean>(true);
  const [pnAction, setPnAction] = useState<PNActionDetails | null>(null);
  const [isPnModalOpen, setIsPnModalOpen] = useState<boolean>(false);

  // Custom Train & Dynamic Track Blockage States
  const [isAddTrainOpen, setIsAddTrainOpen] = useState<boolean>(false);
  const [isAddBlockageOpen, setIsAddBlockageOpen] = useState<boolean>(false);
  const [customBlockages, setCustomBlockages] = useState<CustomBlockage[]>([]);
  const [customTrains, setCustomTrains] = useState<TrainSchedule[]>([]);

  const handleRequestPN = (action: PNActionDetails) => {
    setPnAction(action);
    setIsPnModalOpen(true);
  };

  const handleToggleBlock = (pn?: string) => {
    setIsBlockActive(prev => !prev);
  };

  const handleInjectCustomTrain = (newTrain: TrainSchedule, initialKm: number, locoType: string) => {
    const customTrain: TrainSchedule = {
      ...newTrain,
      initial_km: initialKm,
      current_km: initialKm,
      loco_type: locoType,
      status: `INJECTED (KM ${initialKm.toFixed(1)}) · RUNNING`,
    };
    setTrains(prev => [customTrain, ...prev]);
    setCustomTrains(prev => [customTrain, ...prev]);
    setSelectedTrain(customTrain);
  };

  const handleRemoveCustomTrain = (trainNumber: string) => {
    setTrains(prev => prev.filter(t => t.train_number !== trainNumber));
    setCustomTrains(prev => prev.filter(t => t.train_number !== trainNumber));
    if (selectedTrain?.train_number === trainNumber) {
      setSelectedTrain(null);
    }
  };

  const handleRemoveCustomBlockage = (blockId: string) => {
    setCustomBlockages(prev => prev.filter(b => b.block_id !== blockId));
    setRequests(prev => prev.filter(r => r.request_id !== blockId));
    setSolvedBlocks(prev => prev.filter(b => b.block_id !== blockId));
  };

  const handleClearAllInjections = () => {
    customTrains.forEach(t => handleRemoveCustomTrain(t.train_number));
    customBlockages.forEach(b => handleRemoveCustomBlockage(b.block_id));
  };

  const handleInjectCustomBlockage = (blockage: CustomBlockage) => {
    setCustomBlockages(prev => [blockage, ...prev]);

    // Automatically register MaintenanceRequest for optimization engine
    const newReq: MaintenanceRequest = {
      request_id: blockage.block_id,
      department: blockage.department,
      location_sector: selectedSector,
      track_line: blockage.track_line,
      start_km: blockage.start_km,
      end_km: blockage.end_km,
      duration_minutes: blockage.duration_minutes,
      priority: blockage.form_type === 'CAUTION_T409' ? 'Medium' : 'Critical',
      work_description: `${blockage.work_description} (PN #${blockage.private_number})`,
      machine_required: blockage.machine_deployed,
      status: 'Approved',
    };
    setRequests(prev => [newReq, ...prev]);

    // If it's a full track maintenance block, also add a SolvedBlock entry
    if (blockage.form_type !== 'CAUTION_T409') {
      const newBlock: SolvedBlock = {
        block_id: blockage.block_id,
        location_sector: selectedSector,
        track_line: blockage.track_line,
        start_time_offset_minutes: currentTimeMinutes,
        end_time_offset_minutes: currentTimeMinutes + blockage.duration_minutes,
        start_time_iso: new Date().toISOString(),
        end_time_iso: new Date(Date.now() + blockage.duration_minutes * 60000).toISOString(),
        total_block_duration_minutes: blockage.duration_minutes,
        effective_work_duration_minutes: Math.max(30, blockage.duration_minutes - 20),
        available_window_duration_minutes: blockage.duration_minutes,
        capacity_utilized_percent: 92,
        departments_involved: [blockage.department],
        assigned_requests: [
          {
            request_id: blockage.block_id,
            department: blockage.department,
            work_description: blockage.work_description,
            duration_minutes: blockage.duration_minutes,
            machine_required: blockage.machine_deployed,
          }
        ],
        is_shadow_block: false,
        ohe_power_isolated: blockage.department === 'Traction',
        elementary_section: 'SEC-TD-OHE-22',
        post_block_speed_restriction_kmh: blockage.speed_restriction_kmh || 30,
        controller_approved: true,
      };
      setSolvedBlocks(prev => [newBlock, ...prev]);
    }
  };

  // Load initial dataset on mount
  useEffect(() => {
    loadInitialData();
  }, []);

  // Live Telemetry Database Polling Stream (1.2 Hz)
  useEffect(() => {
    let isMounted = true;
    const pollDatabase = async () => {
      try {
        const stream = await fetchLiveStream();
        if (isMounted) {
          setLiveStreamData(stream);
        }
      } catch (err) {
        // Backend live polling fallback
      }
    };

    pollDatabase();
    const interval = setInterval(pollDatabase, 400);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // Smooth 60 FPS playback timer loop with dynamic speed multiplier
  useEffect(() => {
    if (!isPlaying) {
      if (timerRef.current) cancelAnimationFrame(timerRef.current);
      return;
    }

    let lastTime = performance.now();
    const loop = (now: number) => {
      const deltaSeconds = (now - lastTime) / 1000;
      lastTime = now;
      // Base: 2.5 min/s * speed multiplier (e.g. 4x => 10 min/s, fast & fluid)
      const baseMinutesPerSecond = 2.5;
      const speedMinutesPerSecond = baseMinutesPerSecond * simulationSpeed;
      setCurrentTimeMinutes((prev) => {
        const next = prev + deltaSeconds * speedMinutesPerSecond;
        return next >= 360 ? 0 : next;
      });
      timerRef.current = requestAnimationFrame(loop);
    };

    timerRef.current = requestAnimationFrame(loop);
    return () => {
      if (timerRef.current) cancelAnimationFrame(timerRef.current);
    };
  }, [isPlaying, simulationSpeed]);

  const loadInitialData = async () => {
    try {
      const data = await fetchInitialState();
      setRequests(data.requests);
      setTimetables(data.timetables);
      setTrains(data.trains);
      setCorridors(data.corridors);
    } catch (err) {
      console.error('Failed to load initial state:', err);
    }
  };

  // Run Optimization Engine
  const handleOptimize = async (disruption?: DisruptionEvent) => {
    setIsOptimizing(true);
    try {
      const res = await optimizePlan({
        requests,
        timetables,
        trains,
        disruption,
      });

      setSolvedBlocks(res.solved_blocks);
      setTrains(res.updated_trains);
      setMetrics(res.metrics);
      setJustification(res.operational_justification);
      setSolverLatency(res.metrics.solver_execution_time_seconds);
      setHasOptimized(true);

      const allocatedIds = new Set(res.solved_blocks.flatMap((b) => b.assigned_requests.map((r) => r.request_id)));
      setRequests((prev) =>
        prev.map((r) => ({
          ...r,
          status: allocatedIds.has(r.request_id) ? 'Allocated' : 'Deferred / Next Cycle',
        }))
      );
    } catch (err) {
      console.error('Optimization failed:', err);
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleReset = async () => {
    setHasOptimized(false);
    setSolvedBlocks([]);
    setMetrics(undefined);
    setJustification('');
    setSolverLatency(undefined);
    setSelectedTrain(null);
    setCurrentTimeMinutes(75);
    setIsPlaying(false);
    await loadInitialData();
  };

  const handleAddParsedRequest = (newReq: MaintenanceRequest) => {
    setRequests((prev) => [newReq, ...prev]);
    setTimeout(() => {
      handleOptimize();
    }, 200);
  };

  const handleOpenSanctionModal = async (block: SolvedBlock) => {
    try {
      const form = await generateCautionOrder(block, 'Chief Controller / Dy. CHC (Northern Railway)');
      setSanctionForm(form);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSanctionApproved = (formId: string) => {
    setSolvedBlocks((prev) =>
      prev.map((b) => (b.block_id === formId.replace('T409-', '') ? { ...b, controller_approved: true } : b))
    );
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] flex flex-col font-sans text-slate-100 selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Header */}
      <Header
        onOptimize={() => handleOptimize()}
        onReset={handleReset}
        onOpenCopilot={() => setIsCopilotOpen(true)}
        onOpenDisruption={() => setIsDisruptionOpen(true)}
        onOpenAddTrain={() => setIsAddTrainOpen(true)}
        onOpenAddBlockage={() => setIsAddBlockageOpen(true)}
        customTrainsCount={customTrains.length}
        customBlockagesCount={customBlockages.length}
        isOptimizing={isOptimizing}
        hasOptimized={hasOptimized}
        solverLatency={solverLatency}
      />

      <main className="flex-1 max-w-[1750px] w-full mx-auto px-6 lg:px-8 py-6 space-y-6">
        {/* Real-Time COA & BDMS Departmental Ticker */}
        <LiveTelemetryTicker events={liveStreamData?.events || []} />

        {/* KPI Stats Bar */}
        <StatsBar
          metrics={metrics}
          totalRequests={requests.length}
          totalWindows={timetables.length}
        />

        {/* Authentic Indian Railways Section Controller Action Console */}
        <SectionControllerConsole
          isBlockActive={isBlockActive}
          onToggleBlock={handleToggleBlock}
          onRequestPN={handleRequestPN}
        />

        {/* Operational AI Justification Banner */}
        {hasOptimized && justification && (
          <div className="p-6 bg-gradient-to-r from-blue-950/90 via-indigo-950/80 to-purple-950/90 rounded-3xl border border-sky-500/40 shadow-2xl flex items-start gap-4 animate-in fade-in">
            <div className="p-3 bg-sky-500 text-slate-950 rounded-2xl shadow-lg shadow-sky-500/40 mt-0.5">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="flex-1 text-xs leading-relaxed text-slate-200">
              <span className="font-extrabold text-sm text-sky-400 block mb-1">
                {t.aiJustificationTitle}
              </span>
              {getLocalizedJustification(justification, metrics, language)}
            </div>
          </div>
        )}

        {/* Active Operational Injections & Blockages Control Strip */}
        {(customBlockages.length > 0 || customTrains.length > 0) && (
          <div className="p-4 bg-gradient-to-r from-[#121B2E] via-[#10192A] to-[#151728] rounded-2xl border border-sky-500/40 shadow-xl space-y-3 animate-in fade-in">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                <h3 className="text-xs font-black uppercase tracking-wider text-sky-300 font-sans flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5" />
                  Active Custom Injections & Possessions ({customTrains.length + customBlockages.length} Active)
                </h3>
              </div>
              <button
                onClick={handleClearAllInjections}
                className="text-xs text-rose-400 hover:text-rose-300 font-bold px-2.5 py-1 rounded-lg bg-rose-950/60 hover:bg-rose-900 border border-rose-800/60 transition-all flex items-center gap-1"
              >
                <span>Clear All Injections</span>
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Custom Trains Chips */}
              {customTrains.map((ct) => (
                <div
                  key={ct.train_number}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-sky-950/80 border border-sky-500/50 text-xs font-mono shadow-md"
                >
                  <Train className="w-3.5 h-3.5 text-sky-400" />
                  <span className="font-black text-sky-200">#{ct.train_number}</span>
                  <span className="text-slate-300 truncate max-w-[140px]">{ct.train_name}</span>
                  <span className="text-sky-300 text-[11px] bg-sky-900/60 px-1.5 py-0.5 rounded">
                    KM {ct.initial_km?.toFixed(1) || '20.0'}
                  </span>
                  <button
                    onClick={() => handleRemoveCustomTrain(ct.train_number)}
                    title="Remove custom train from simulation"
                    className="p-0.5 text-slate-400 hover:text-rose-300 hover:bg-rose-950/80 rounded transition-colors ml-1"
                  >
                    ✕
                  </button>
                </div>
              ))}

              {/* Custom Blockages Chips */}
              {customBlockages.map((cb) => (
                <div
                  key={cb.block_id}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-rose-950/80 border border-rose-500/50 text-xs font-mono shadow-md"
                >
                  <AlertOctagon className="w-3.5 h-3.5 text-rose-400" />
                  <span className="font-black text-rose-200">{cb.form_type}</span>
                  <span className="text-amber-300 font-bold">{cb.track_line}</span>
                  <span className="text-slate-300">KM {cb.start_km}–{cb.end_km}</span>
                  <span className="text-[11px] bg-rose-900/60 text-rose-200 px-1.5 py-0.5 rounded">
                    PN #{cb.private_number}
                  </span>
                  <button
                    onClick={() => handleRemoveCustomBlockage(cb.block_id)}
                    title="Lift blockage and restore normal track speed"
                    className="px-2 py-0.5 bg-rose-900/90 hover:bg-rose-700 text-white font-bold rounded text-[11px] transition-colors ml-1"
                  >
                    Lift Block
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* View Switcher Tabs */}
        <div className="flex flex-wrap items-center justify-between border-b border-slate-800 pb-4 gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setActiveTab('schematic')}
              className={`flex items-center gap-2.5 px-5 py-2.5 rounded-2xl text-sm font-extrabold transition-all ${
                activeTab === 'schematic'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 shadow-lg shadow-cyan-500/30 ring-1 ring-white/20'
                  : 'text-slate-400 hover:bg-slate-900 hover:text-white'
              }`}
            >
              <Network className="w-4 h-4" />
              <span>{t.tabSchematic}</span>
            </button>

            <button
              onClick={() => setActiveTab('stringchart')}
              className={`flex items-center gap-2.5 px-5 py-2.5 rounded-2xl text-sm font-extrabold transition-all ${
                activeTab === 'stringchart'
                  ? 'bg-gradient-to-r from-sky-500 to-indigo-600 text-slate-950 shadow-lg shadow-sky-500/30 ring-1 ring-white/20'
                  : 'text-slate-400 hover:bg-slate-900 hover:text-white'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              <span>{t.tabStringChart}</span>
            </button>

            <button
              onClick={() => setActiveTab('multidept')}
              className={`flex items-center gap-2.5 px-5 py-2.5 rounded-2xl text-sm font-extrabold transition-all ${
                activeTab === 'multidept'
                  ? 'bg-gradient-to-r from-purple-500 to-blue-600 text-white shadow-lg shadow-purple-500/30 ring-1 ring-white/20'
                  : 'text-slate-400 hover:bg-slate-900 hover:text-white'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>{t.tabMultiDept}</span>
            </button>

            <button
              onClick={() => setActiveTab('geomap')}
              className={`flex items-center gap-2.5 px-5 py-2.5 rounded-2xl text-sm font-extrabold transition-all ${
                activeTab === 'geomap'
                  ? 'bg-gradient-to-r from-blue-600 to-sky-500 text-white shadow-lg shadow-blue-500/30 ring-1 ring-white/20'
                  : 'text-slate-400 hover:bg-slate-900 hover:text-white'
              }`}
            >
              <Map className="w-4 h-4" />
              <span>{t.tabGeomap}</span>
            </button>

            <button
              onClick={() => setActiveTab('gantt')}
              className={`flex items-center gap-2.5 px-5 py-2.5 rounded-2xl text-sm font-extrabold transition-all ${
                activeTab === 'gantt'
                  ? 'bg-gradient-to-r from-blue-600 to-sky-500 text-white shadow-lg shadow-blue-500/30 ring-1 ring-white/20'
                  : 'text-slate-400 hover:bg-slate-900 hover:text-white'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>{t.tabGantt}</span>
            </button>
          </div>

          <div className="text-sm text-slate-400 font-medium">
            {t.activeCorridorLabel}: <strong className="text-cyan-400 font-mono">{selectedSector}</strong> (New Delhi - Kanpur High Density Trunk)
          </div>
        </div>

        {/* Tab Content Panels */}
        {activeTab === 'schematic' && (
          <div className="space-y-8">
            <SchematicRailMap
              trains={trains}
              blocks={solvedBlocks}
              selectedSector={selectedSector}
              selectedTrainNumber={selectedTrain?.train_number}
              onSelectTrain={setSelectedTrain}
              currentTimeMinutes={currentTimeMinutes}
              onTimeChange={setCurrentTimeMinutes}
              isPlaying={isPlaying}
              onTogglePlay={() => setIsPlaying(!isPlaying)}
              simulationSpeed={simulationSpeed}
              onSpeedChange={setSimulationSpeed}
              liveStreamData={liveStreamData}
              isLiveMode={isLiveStreamActive}
              onToggleLiveMode={() => setIsLiveStreamActive(!isLiveStreamActive)}
              isBlockActive={isBlockActive}
              onToggleBlock={handleToggleBlock}
              onRequestPN={handleRequestPN}
              customBlockages={customBlockages}
              onRemoveCustomBlockage={handleRemoveCustomBlockage}
            />
            {/* Real-time Driver Cab & Kavach 4.0 Telemetry Stream HUD */}
            <div id="cab-dashboard">
              <LiveCabDashboard
                liveData={liveStreamData}
                selectedTrainNumber={selectedTrain?.train_number || '22436'}
                onSelectTrain={(num) => {
                  const tr = trains.find(t => t.train_number === num);
                  if (tr) setSelectedTrain(tr);
                }}
                isLiveMode={isLiveStreamActive}
                onToggleLiveMode={() => setIsLiveStreamActive(!isLiveStreamActive)}
              />
            </div>
          </div>
        )}

        {activeTab === 'stringchart' && (
          <div className="space-y-8">
            <StringChart
              trains={trains}
              blocks={solvedBlocks}
              currentTimeMinutes={currentTimeMinutes}
              onTimeChange={setCurrentTimeMinutes}
              selectedTrainNumber={selectedTrain?.train_number}
              onSelectTrain={(num) => {
                const tr = trains.find(t => t.train_number === num);
                if (tr) setSelectedTrain(tr);
              }}
              isBlockActive={isBlockActive}
              customBlockages={customBlockages}
              customTrains={customTrains}
            />
          </div>
        )}

        {activeTab === 'multidept' && (
          <div className="space-y-8">
            <MultiDeptBlockPortal
              isBundled={hasOptimized}
              onApplyMegaBlock={() => handleOptimize()}
            />
          </div>
        )}

        {activeTab === 'geomap' && (
          <div className="space-y-8">
            <CorridorMap
              corridors={corridors}
              trains={trains}
              blocks={solvedBlocks}
              selectedSector={selectedSector}
              selectedTrainNumber={selectedTrain?.train_number}
              onSelectSector={setSelectedSector}
              onSelectTrain={setSelectedTrain}
              currentTimeMinutes={currentTimeMinutes}
              onTimeChange={setCurrentTimeMinutes}
              isPlaying={isPlaying}
              onTogglePlay={() => setIsPlaying(!isPlaying)}
            />
          </div>
        )}

        {activeTab === 'gantt' && (
          <TrackGantt
            requests={requests}
            timetables={timetables}
            blocks={solvedBlocks}
            hasOptimized={hasOptimized}
            onGenerateSanction={handleOpenSanctionModal}
          />
        )}
      </main>

      {/* AI Co-Pilot Drawer */}
      <AICopilotDrawer
        isOpen={isCopilotOpen}
        onClose={() => setIsCopilotOpen(false)}
        onAddParsedRequest={handleAddParsedRequest}
      />

      {/* Disruption "What-If" Sandbox Modal */}
      <DisruptionSandbox
        isOpen={isDisruptionOpen}
        onClose={() => setIsDisruptionOpen(false)}
        onInjectDisruption={(event) => handleOptimize(event)}
        isSimulating={isOptimizing}
      />

      {/* Form T/409 Sanction Modal */}
      <SanctionModal
        form={sanctionForm}
        onClose={() => setSanctionForm(null)}
        onApprove={handleSanctionApproved}
      />

      {/* Indian Railways Electronic Block Register (EBR) Private Number (PN) Modal */}
      <PrivateNumberModal
        isOpen={isPnModalOpen}
        actionDetails={pnAction}
        onClose={() => setIsPnModalOpen(false)}
      />

      {/* Dynamic Custom Train Consist Injection Modal */}
      <CustomTrainModal
        isOpen={isAddTrainOpen}
        onClose={() => setIsAddTrainOpen(false)}
        onAddTrain={handleInjectCustomTrain}
      />

      {/* Dynamic Maintenance Blockage & Hazard Zone Modal */}
      <CustomBlockageModal
        isOpen={isAddBlockageOpen}
        onClose={() => setIsAddBlockageOpen(false)}
        onAddBlockage={handleInjectCustomBlockage}
      />
    </div>
  );
}

