/**
 * Operational Editorial style: a light, inputs-to-outcome railway planning
 * workspace. Calm surfaces, precise mono identifiers, and capacity-forward results.
 */
import { Fragment, useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  CalendarRange,
  CheckCircle2,
  Clock3,
  Layers3,
  Play,
  RotateCcw,
  Route,
  UsersRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import BrandMark from "@/components/BrandMark";
import { CircleMarker, MapContainer, Popup, Polyline, TileLayer, Tooltip } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { railRouteCoordinates } from "@/data/railRoutes";

type Department = "Track" | "Signal" | "Traction";
type Priority = "High" | "Medium" | "Low";

type MaintenanceRequest = {
  request_id: string;
  department: Department;
  location_sector: string;
  duration_minutes: number;
  priority: Priority;
  weekly_availability: { day: string; date: string; time: string };
};

type TimeWindow = {
  timetable_id: string;
  location_sector: string;
  start_time: string;
  end_time: string;
  available_duration_minutes: number;
};

type PlanBlock = {
  block_id: string;
  location_sector: string;
  start_time: string;
  end_time: string;
  total_block_duration_minutes: number;
  departments_involved: Department[];
  assigned_request_ids: string[];
};

type MapSector = {
  sector: string;
  corridor: string;
  from: { name: string; code: string; lat: number; lng: number };
  to: { name: string; code: string; lat: number; lng: number };
};

const heroNetworkUrl = "/manus-storage/railblock-hero-network_b95b2e67.png";
const workflowIllustrationUrl = "/manus-storage/railblock-workflow-illustration_9ebba82e.png";
const capacityArtUrl = "/manus-storage/railblock-capacity-art_71ef0f12.png";

const requests: MaintenanceRequest[] = [
  { request_id: "REQ-TRK-001", department: "Track", location_sector: "SEC-NDLS-CNB-01", duration_minutes: 60, priority: "High", weekly_availability: { day: "Monday", date: "17 Aug 2026", time: "00:30–01:30" } },
  { request_id: "REQ-SIG-001", department: "Signal", location_sector: "SEC-NDLS-CNB-01", duration_minutes: 45, priority: "High", weekly_availability: { day: "Wednesday", date: "19 Aug 2026", time: "01:00–01:45" } },
  { request_id: "REQ-TRC-001", department: "Traction", location_sector: "SEC-NDLS-CNB-01", duration_minutes: 60, priority: "Medium", weekly_availability: { day: "Friday", date: "21 Aug 2026", time: "00:45–01:45" } },
  { request_id: "REQ-TRK-002", department: "Track", location_sector: "SEC-HWH-BWN-02", duration_minutes: 90, priority: "High", weekly_availability: { day: "Tuesday", date: "18 Aug 2026", time: "01:00–02:30" } },
  { request_id: "REQ-TRC-002", department: "Traction", location_sector: "SEC-HWH-BWN-02", duration_minutes: 75, priority: "High", weekly_availability: { day: "Thursday", date: "20 Aug 2026", time: "02:00–03:15" } },
  { request_id: "REQ-SIG-002", department: "Signal", location_sector: "SEC-BCT-BRC-03", duration_minutes: 60, priority: "Medium", weekly_availability: { day: "Monday", date: "17 Aug 2026", time: "01:30–02:30" } },
  { request_id: "REQ-TRK-003", department: "Track", location_sector: "SEC-BCT-BRC-03", duration_minutes: 120, priority: "Medium", weekly_availability: { day: "Thursday", date: "20 Aug 2026", time: "02:00–04:00" } },
  { request_id: "REQ-TRC-003", department: "Traction", location_sector: "SEC-MAS-BZA-01", duration_minutes: 45, priority: "Low", weekly_availability: { day: "Tuesday", date: "18 Aug 2026", time: "00:30–01:15" } },
  { request_id: "REQ-SIG-003", department: "Signal", location_sector: "SEC-MAS-BZA-01", duration_minutes: 30, priority: "Low", weekly_availability: { day: "Saturday", date: "22 Aug 2026", time: "01:00–01:30" } },
  { request_id: "REQ-TRK-004", department: "Track", location_sector: "SEC-SBC-MYS-01", duration_minutes: 60, priority: "Low", weekly_availability: { day: "Friday", date: "21 Aug 2026", time: "01:30–02:30" } },
];

const windows: TimeWindow[] = [
  { timetable_id: "TT-001", location_sector: "SEC-NDLS-CNB-01", start_time: "2026-08-23T01:00:00Z", end_time: "2026-08-23T05:00:00Z", available_duration_minutes: 240 },
  { timetable_id: "TT-002", location_sector: "SEC-HWH-BWN-02", start_time: "2026-08-23T00:30:00Z", end_time: "2026-08-23T04:00:00Z", available_duration_minutes: 210 },
  { timetable_id: "TT-003", location_sector: "SEC-BCT-BRC-03", start_time: "2026-08-23T02:00:00Z", end_time: "2026-08-23T05:30:00Z", available_duration_minutes: 210 },
  { timetable_id: "TT-004", location_sector: "SEC-MAS-BZA-01", start_time: "2026-08-23T01:30:00Z", end_time: "2026-08-23T03:30:00Z", available_duration_minutes: 120 },
  { timetable_id: "TT-005", location_sector: "SEC-SBC-MYS-01", start_time: "2026-08-23T02:00:00Z", end_time: "2026-08-23T04:00:00Z", available_duration_minutes: 120 },
];

const generatedBlocks: PlanBlock[] = [
  { block_id: "BLK-20260823-001", location_sector: "SEC-NDLS-CNB-01", start_time: "2026-08-23T01:00:00Z", end_time: "2026-08-23T03:45:00Z", total_block_duration_minutes: 165, departments_involved: ["Track", "Signal", "Traction"], assigned_request_ids: ["REQ-TRK-001", "REQ-SIG-001", "REQ-TRC-001"] },
  { block_id: "BLK-20260823-002", location_sector: "SEC-HWH-BWN-02", start_time: "2026-08-23T00:30:00Z", end_time: "2026-08-23T03:15:00Z", total_block_duration_minutes: 165, departments_involved: ["Track", "Traction"], assigned_request_ids: ["REQ-TRK-002", "REQ-TRC-002"] },
  { block_id: "BLK-20260823-003", location_sector: "SEC-BCT-BRC-03", start_time: "2026-08-23T02:00:00Z", end_time: "2026-08-23T05:00:00Z", total_block_duration_minutes: 180, departments_involved: ["Signal", "Track"], assigned_request_ids: ["REQ-SIG-002", "REQ-TRK-003"] },
  { block_id: "BLK-20260823-004", location_sector: "SEC-MAS-BZA-01", start_time: "2026-08-23T01:30:00Z", end_time: "2026-08-23T02:45:00Z", total_block_duration_minutes: 75, departments_involved: ["Traction", "Signal"], assigned_request_ids: ["REQ-TRC-003", "REQ-SIG-003"] },
  { block_id: "BLK-20260823-005", location_sector: "SEC-SBC-MYS-01", start_time: "2026-08-23T02:00:00Z", end_time: "2026-08-23T03:00:00Z", total_block_duration_minutes: 60, departments_involved: ["Track"], assigned_request_ids: ["REQ-TRK-004"] },
];

const mapSectors: MapSector[] = [
  { sector: "SEC-NDLS-CNB-01", corridor: "New Delhi to Kanpur", from: { name: "New Delhi", code: "NDLS", lat: 28.6438, lng: 77.2197 }, to: { name: "Kanpur Central", code: "CNB", lat: 26.4605, lng: 80.3216 } },
  { sector: "SEC-HWH-BWN-02", corridor: "Howrah to Barddhaman", from: { name: "Howrah", code: "HWH", lat: 22.5839, lng: 88.3433 }, to: { name: "Barddhaman", code: "BWN", lat: 23.2324, lng: 87.8615 } },
  { sector: "SEC-BCT-BRC-03", corridor: "Mumbai Central to Vadodara", from: { name: "Mumbai Central", code: "BCT", lat: 18.9691, lng: 72.8205 }, to: { name: "Vadodara", code: "BRC", lat: 22.3072, lng: 73.1812 } },
  { sector: "SEC-MAS-BZA-01", corridor: "Chennai Central to Vijayawada", from: { name: "Chennai Central", code: "MAS", lat: 13.0827, lng: 80.2707 }, to: { name: "Vijayawada", code: "BZA", lat: 16.5137, lng: 80.6103 } },
  { sector: "SEC-SBC-MYS-01", corridor: "KSR Bengaluru City to Mysuru", from: { name: "KSR Bengaluru City", code: "SBC", lat: 12.9773, lng: 77.5704 }, to: { name: "Mysuru", code: "MYS", lat: 12.3108, lng: 76.6558 } },
];

const departments: Array<"All" | Department> = ["All", "Track", "Signal", "Traction"];

const departmentClass: Record<Department, string> = {
  Track: "tag-track",
  Signal: "tag-signal",
  Traction: "tag-traction",
};

const priorityClass: Record<Priority, string> = {
  High: "priority-high",
  Medium: "priority-medium",
  Low: "priority-low",
};

function formatTime(time: string) {
  return new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "UTC",
  }).format(new Date(time));
}

function formatPlanDate(time: string) {
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(time));
}

function StatCard({ icon: Icon, label, value, helper, tone = "" }: { icon: LucideIcon; label: string; value: string | number; helper: string; tone?: string }) {
  return (
    <article className={`stat-card ${tone}`}>
      <div className="stat-icon"><Icon size={16} strokeWidth={2.2} /></div>
      <p>{label}</p>
      <strong>{value}</strong>
      <span>{helper}</span>
    </article>
  );
}

function MaintenanceMap() {
  return (
    <MapContainer center={[21.8, 79.8]} zoom={4} scrollWheelZoom={false} className="maintenance-map">
      <TileLayer
        attribution="&copy; OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {mapSectors.map((sector) => {
        const relatedRequests = requests.filter((request) => request.location_sector === sector.sector);
        const relatedMinutes = relatedRequests.reduce((total, request) => total + request.duration_minutes, 0);
        const clearWindow = windows.find((window) => window.location_sector === sector.sector)!;
        const corridor = railRouteCoordinates[sector.sector] ?? [[sector.from.lat, sector.from.lng], [sector.to.lat, sector.to.lng]];
        return (
          <Fragment key={sector.sector}>
            <Polyline key={`route-base-${sector.sector}`} positions={corridor} pathOptions={{ color: "#f8fbff", weight: 8, opacity: 0.9 }} />
            <Polyline key={`route-path-${sector.sector}`} positions={corridor} pathOptions={{ color: "#1468D4", weight: 4.5, opacity: 0.92 }}>
              <Popup>
                <div className="leaflet-popup-copy">
                  <code>{sector.sector}</code>
                  <strong>{sector.corridor}</strong>
                  <span>{relatedRequests.length} maintenance requests · {relatedMinutes} min of work</span>
                  <b>Clear closure capacity: {clearWindow.available_duration_minutes} min</b>
                </div>
              </Popup>
            </Polyline>
          </Fragment>
        );
      })}
      {mapSectors.flatMap((sector) => [sector.from, sector.to].map((station) => (
        <CircleMarker key={`${sector.sector}-${station.code}`} center={[station.lat, station.lng]} radius={7} pathOptions={{ color: "#0D4FAD", fillColor: "#1468D4", fillOpacity: 1, weight: 2 }}>
          <Tooltip direction="top" offset={[0, -8]} opacity={0.95}>{station.code}</Tooltip>
          <Popup>
            <div className="leaflet-popup-copy">
              <code>{station.code}</code>
              <strong>{station.name}</strong>
              <span>Named endpoint for {sector.corridor}</span>
              <small>Representative corridor location; the sample data has no exact maintenance chainage.</small>
            </div>
          </Popup>
        </CircleMarker>
      )))}
    </MapContainer>
  );
}

export default function Home() {
  const [blocks, setBlocks] = useState<PlanBlock[]>([]);
  const [activeDepartment, setActiveDepartment] = useState<"All" | Department>("All");
  const [isPlanning, setIsPlanning] = useState(false);
  const hasPlan = blocks.length > 0;
  const shownRequests = activeDepartment === "All" ? requests : requests.filter((request) => request.department === activeDepartment);

  const buildPlan = () => {
    if (hasPlan || isPlanning) return;
    setIsPlanning(true);
    window.setTimeout(() => {
      setBlocks(generatedBlocks);
      setIsPlanning(false);
    }, 850);
  };

  const resetPlan = () => {
    setBlocks([]);
    setIsPlanning(false);
  };

  return (
    <main className="site-shell">
      <header className="topbar">
        <span className="brand-track-rule" aria-hidden="true" />
        <div className="brand-lockup">
          <BrandMark />
          <div>
            <p className="brand-kicker">Indian Railways · integrated maintenance</p>
            <p className="brand-name">RailBlock Planner</p>
          </div>
        </div>
        <div className="topbar-actions">
          <div className="planning-date">
            <span>Planning date</span>
            <strong>23 Aug 2026 · UTC</strong>
          </div>
          <Button onClick={resetPlan} variant="outline" className="reset-button"> <RotateCcw size={14} /> Reset plan </Button>
          <Button onClick={buildPlan} disabled={isPlanning || hasPlan} className="build-button">
            {isPlanning ? <span className="button-spinner" aria-hidden="true" /> : hasPlan ? <CheckCircle2 size={15} /> : <Play size={15} fill="currentColor" />}
            {isPlanning ? "Building your plan…" : hasPlan ? "Plan created" : "Build optimized plan"}
          </Button>
        </div>
      </header>

      <section className="hero-frame" aria-labelledby="hero-title">
        <img className="hero-art" src={heroNetworkUrl} alt="" />
        <div className="hero-content">
          <p className="section-kicker blue">Planning workspace</p>
          <h1 id="hero-title">Bring maintenance work together, without disrupting train operations.</h1>
          <p>Review outstanding work, confirm safe timetable windows, then create coordinated blocks that make the best use of each closure.</p>
        </div>
        <div className={`plan-state ${isPlanning ? "working" : ""}`} role="status" aria-live="polite">
          <span className="state-dot" />
          {isPlanning ? "Checking inputs and clear windows" : hasPlan ? `Plan ready · ${blocks.length} coordinated blocks` : "Ready to plan"}
        </div>
      </section>

      <section className="stats-grid" aria-label="Planning summary">
        <StatCard icon={Layers3} label="Maintenance requests" value={hasPlan ? 0 : requests.length} helper={hasPlan ? "10 requests assigned to a block" : "Awaiting coordination"} />
        <StatCard icon={CalendarRange} label="Clear timetable windows" value={windows.length} helper="Across 5 active sectors" tone="blue-tone" />
        <StatCard icon={UsersRound} label="Departments involved" value="3" helper="Track, Signal & Traction" tone="violet-tone" />
        <StatCard icon={Route} label="Optimized plan" value={hasPlan ? "5 blocks" : "Not built"} helper={hasPlan ? "10 requests coordinated" : "Build a plan to see the outcome"} tone="green-tone" />
      </section>

      <section className="workflow-card" aria-labelledby="workflow-title">
        <img className="workflow-art" src={workflowIllustrationUrl} alt="" />
        <div className="workflow-heading">
          <p className="section-kicker">What the planner checks</p>
          <h2 id="workflow-title">A simple path from source data to a workable block plan.</h2>
        </div>
        <ol className="workflow-list">
          <li><span>01</span><div><h3>Match the location</h3><p>Requests are grouped only when they belong to the same rail sector.</p></div></li>
          <li><span>02</span><div><h3>Protect the timetable</h3><p>Each group is placed inside its corresponding clear operating window.</p></div></li>
          <li><span>03</span><div><h3>Coordinate departments</h3><p>Track, Signal and Traction work are combined wherever capacity allows.</p></div></li>
        </ol>
      </section>

      <section className="section-intro" aria-labelledby="inputs-title">
        <div>
          <p className="section-kicker">Source data</p>
          <h2 id="inputs-title">Planning inputs</h2>
          <p>These are the records the planner uses to build each recommended block.</p>
        </div>
        <div className="data-key"><span className="amber-dot" /> Pending work <span className="blue-dot" /> Clear operating window</div>
      </section>

      <section className="inputs-layout" aria-label="Planning source data">
        <article className="data-panel requests-panel">
          <div className="panel-heading request-heading">
            <div>
              <div className="heading-line"><h3>Maintenance requests</h3><span className="count-pill">{shownRequests.length} {activeDepartment === "All" ? "records" : activeDepartment.toLowerCase()}</span></div>
              <p>Outstanding work that needs a safe maintenance block.</p>
            </div>
            <div className="filter-row" aria-label="Filter maintenance requests by department">
              {departments.map((department) => <button key={department} type="button" aria-pressed={activeDepartment === department} className={`filter-chip ${activeDepartment === department ? "active" : ""}`} onClick={() => setActiveDepartment(department)}>{department}</button>)}
            </div>
          </div>
          <div className="table-scroll">
            <table className="requests-table">
              <thead><tr><th>Request</th><th>Department</th><th>Sector</th><th>Work</th><th>Weekly preference</th><th>Priority</th><th>Status</th></tr></thead>
              <tbody>
                {shownRequests.map((request) => (
                  <tr key={request.request_id}>
                    <td><code>{request.request_id}</code></td>
                    <td><span className={`department-tag ${departmentClass[request.department]}`}>{request.department}</span></td>
                    <td><code className="sector-code">{request.location_sector}</code></td>
                    <td>{request.duration_minutes} min</td>
                    <td><span className="weekly-preference"><b>{request.weekly_availability.day} · {request.weekly_availability.date}</b><span>{request.weekly_availability.time} UTC</span></span></td>
                    <td><span className={`priority-tag ${priorityClass[request.priority]}`}>{request.priority}</span></td>
                    <td><span className={`status-tag ${hasPlan ? "scheduled" : "pending"}`}>{hasPlan ? "Scheduled" : "Pending"}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>

        <article className="data-panel timetable-panel">
          <div className="panel-heading">
            <div className="heading-line"><h3>Clear timetable windows</h3><span className="count-pill blue">5 windows</span></div>
            <p>Available closures that define safe scheduling capacity.</p>
          </div>
          <div className="window-list">
            {windows.map((window) => {
              const relatedRequests = requests.filter((request) => request.location_sector === window.location_sector);
              const planned = blocks.find((block) => block.location_sector === window.location_sector);
              const relatedMinutes = relatedRequests.reduce((sum, request) => sum + request.duration_minutes, 0);
              const occupiedMinutes = planned ? planned.total_block_duration_minutes : relatedMinutes;
              const capacityUsage = Math.min(100, Math.round((occupiedMinutes / window.available_duration_minutes) * 100));
              return (
                <article className="window-item" key={window.timetable_id}>
                  <div className="window-title"><code>{window.location_sector}</code><span>{window.timetable_id}</span></div>
                  <p className="window-time"><Clock3 size={12} /> {formatTime(window.start_time)} – {formatTime(window.end_time)} UTC <i /> Clear window</p>
                  <div className="window-capacity"><span>Available closure capacity</span><strong>{window.available_duration_minutes} min</strong></div>
                  <div className="window-ratio" aria-label={`${capacityUsage}% of available closure capacity is currently represented by work`}><i style={{ width: `${capacityUsage}%` }} /></div>
                  <p className="window-detail">{planned ? `Plan uses ${planned.total_block_duration_minutes} min · ${window.available_duration_minutes - planned.total_block_duration_minutes} min remaining` : `${relatedRequests.length} related requests · ${relatedMinutes} min of work`}</p>
                </article>
              );
            })}
          </div>
        </article>
      </section>

      <section className="map-section" aria-labelledby="map-title">
        <div className="map-heading">
          <div>
            <p className="section-kicker blue">Real-world context</p>
            <h2 id="map-title">Maintenance corridor map</h2>
            <p>Each cobalt route follows mapped railway alignment between the named station endpoints behind a maintenance sector. Select a pin or corridor to inspect its work and closure capacity.</p>
          </div>
          <div className="map-key"><span className="map-route-key" /> Rail-aligned corridor <span className="map-pin-key" /> Station endpoint</div>
        </div>
        <div className="map-shell">
          <MaintenanceMap />
          <p className="map-disclaimer"><strong>Route basis:</strong> the cobalt lines use mapped OpenStreetMap railway alignment, simplified for browser performance. The sample data still has no precise track kilometre or work-site coordinates, so connect confirmed maintenance coordinates for exact field positioning.</p>
        </div>
        <div className="map-sector-grid">
          {mapSectors.map((sector) => {
            const related = requests.filter((request) => request.location_sector === sector.sector);
            const totalMinutes = related.reduce((total, request) => total + request.duration_minutes, 0);
            const clearWindow = windows.find((item) => item.location_sector === sector.sector)!;
            return <article className="map-sector-card" key={sector.sector}><code>{sector.sector}</code><h3>{sector.corridor}</h3><p>{related.length} requests · {totalMinutes} min work · {clearWindow.available_duration_minutes} min clear capacity</p></article>;
          })}
        </div>
      </section>

      <section className="results-panel" aria-labelledby="results-title">
        <img className="capacity-art" src={capacityArtUrl} alt="" />
        <div className="results-heading">
          <div>
            <p className="section-kicker blue">Recommended outcome</p>
            <h2 id="results-title">Optimized work blocks</h2>
            <p>{hasPlan ? "4 blocks combine work across departments while remaining inside the available timetable capacity." : "Build the plan to see how work can be combined within each clear timetable window."}</p>
          </div>
          <span className={`result-state ${hasPlan ? "ready" : ""}`}>{hasPlan ? "5 blocks ready" : "Awaiting plan"}</span>
        </div>
        <div className="result-content">
          {!hasPlan ? (
            <div className="empty-plan">
              <span>01</span>
              <h3>Your recommended blocks will appear here.</h3>
              <p>The plan will show the sector, chosen time window, available capacity and coordinated teams for every block.</p>
              <div className="empty-capacity-example" aria-hidden="true"><span>Requested work</span><div><i /></div><b>Available closure capacity</b></div>
              <Button onClick={buildPlan} disabled={isPlanning} className="empty-action"><Play size={14} fill="currentColor" /> {isPlanning ? "Building your plan…" : "Build optimized plan"} <ArrowRight size={14} /></Button>
            </div>
          ) : (
            <div className="block-grid">
              {blocks.map((block, index) => {
                const window = windows.find((item) => item.location_sector === block.location_sector)!;
                const usage = Math.round((block.total_block_duration_minutes / window.available_duration_minutes) * 100);
                return (
                  <article className="block-card" key={block.block_id} style={{ animationDelay: `${index * 55}ms` }}>
                    <div className="block-topline"><div><code>{block.block_id}</code><h3>{block.location_sector}</h3></div><strong>{block.total_block_duration_minutes} min block</strong></div>
                    <div className="block-common-slot"><span>Common work day</span><strong>{formatPlanDate(block.start_time)}</strong></div>
                    <p className="block-schedule"><span>Shared time</span>{formatTime(block.start_time)} – {formatTime(block.end_time)} UTC</p>
                    <div className="capacity-wrap"><div><span>Closure capacity used</span><strong>{block.total_block_duration_minutes} / {window.available_duration_minutes} min · {window.available_duration_minutes - block.total_block_duration_minutes} min free</strong></div><div className="capacity-track"><i style={{ width: `${usage}%` }} /></div></div>
                    <div className="block-footer"><div><span>Coordinated teams</span><p>{block.departments_involved.map((department) => <b className={`department-tag ${departmentClass[department]}`} key={department}>{department}</b>)}</p></div><div><span>Included requests</span><p>{block.assigned_request_ids.map((id) => <code key={id}>{id}</code>)}</p></div></div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <footer className="site-footer"><strong>RailBlock Planner</strong><span>Uses maintenance requests and clear timetable windows to create coordinated block recommendations.</span></footer>
    </main>
  );
}
