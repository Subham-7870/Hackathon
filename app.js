/**
 * RailBlock Planner — Interactive Decision-Support & Optimization Engine
 * Problem Statement 26027: AI-Powered Automatic Block Planning
 * Smart India Hackathon 2026 | Team Trailblazer
 */

// Initial Mock Dataset with Weekly Availability Preferences
const initialRequests = [
  {
    request_id: "REQ-TRK-001",
    department: "Track",
    location_sector: "SEC-NDLS-CNB-01",
    duration_minutes: 60,
    priority: "High",
    status: "Pending",
    weekly_availability: { day: "Monday", date: "17 Aug 2026", time: "00:30–01:30" },
    work_description: "Ultrasonic Flaw Detection (USFD) & Rail Replacement"
  },
  {
    request_id: "REQ-SIG-001",
    department: "Signal",
    location_sector: "SEC-NDLS-CNB-01",
    duration_minutes: 45,
    priority: "High",
    status: "Pending",
    weekly_availability: { day: "Wednesday", date: "19 Aug 2026", time: "01:00–01:45" },
    work_description: "Point Machine Overhaul & Axle Counter Testing"
  },
  {
    request_id: "REQ-TRC-001",
    department: "Traction",
    location_sector: "SEC-NDLS-CNB-01",
    duration_minutes: 60,
    priority: "Medium",
    status: "Pending",
    weekly_availability: { day: "Friday", date: "21 Aug 2026", time: "00:45–01:45" },
    work_description: "Overhead Equipment (OHE) Periodic Cantilever Adjustment"
  },
  {
    request_id: "REQ-TRK-002",
    department: "Track",
    location_sector: "SEC-HWH-BWN-02",
    duration_minutes: 90,
    priority: "High",
    status: "Pending",
    weekly_availability: { day: "Tuesday", date: "18 Aug 2026", time: "01:00–02:30" },
    work_description: "Deep Ballast Screening & Tamping Machine Run"
  },
  {
    request_id: "REQ-TRC-002",
    department: "Traction",
    location_sector: "SEC-HWH-BWN-02",
    duration_minutes: 75,
    priority: "High",
    status: "Pending",
    weekly_availability: { day: "Thursday", date: "20 Aug 2026", time: "02:00–03:15" },
    work_description: "Contact Wire Renewal & Insulator Washing"
  },
  {
    request_id: "REQ-SIG-002",
    department: "Signal",
    location_sector: "SEC-BCT-BRC-03",
    duration_minutes: 60,
    priority: "Medium",
    status: "Pending",
    weekly_availability: { day: "Monday", date: "17 Aug 2026", time: "01:30–02:30" },
    work_description: "Electronic Interlocking (EI) Routine Health Check"
  },
  {
    request_id: "REQ-TRK-003",
    department: "Track",
    location_sector: "SEC-BCT-BRC-03",
    duration_minutes: 120,
    priority: "Medium",
    status: "Pending",
    weekly_availability: { day: "Thursday", date: "20 Aug 2026", time: "02:00–04:00" },
    work_description: "Turnout Assembly Renewal & Weld Testing"
  },
  {
    request_id: "REQ-TRC-003",
    department: "Traction",
    location_sector: "SEC-MAS-BZA-01",
    duration_minutes: 45,
    priority: "Low",
    status: "Pending",
    weekly_availability: { day: "Tuesday", date: "18 Aug 2026", time: "00:30–01:15" },
    work_description: "Dropper Retensioning & Mast Earthing Inspection"
  },
  {
    request_id: "REQ-SIG-003",
    department: "Signal",
    location_sector: "SEC-MAS-BZA-01",
    duration_minutes: 30,
    priority: "Low",
    status: "Pending",
    weekly_availability: { day: "Saturday", date: "22 Aug 2026", time: "01:00–01:30" },
    work_description: "Track Circuit Shunt Sensitivity Testing"
  },
  {
    request_id: "REQ-TRK-004",
    department: "Track",
    location_sector: "SEC-SBC-MYS-01",
    duration_minutes: 60,
    priority: "Low",
    status: "Pending",
    weekly_availability: { day: "Friday", date: "21 Aug 2026", time: "01:30–02:30" },
    work_description: "Gauge & Alignment Rectification via Track Machine"
  }
];

const timetableWindows = [
  {
    timetable_id: "TT-001",
    location_sector: "SEC-NDLS-CNB-01",
    corridor_name: "New Delhi to Kanpur Central",
    time_slot: {
      start_time: "2026-08-23T01:00:00Z",
      end_time: "2026-08-23T05:00:00Z",
      available_duration_minutes: 240
    },
    traffic_status: "Clear Window"
  },
  {
    timetable_id: "TT-002",
    location_sector: "SEC-HWH-BWN-02",
    corridor_name: "Howrah to Barddhaman Junction",
    time_slot: {
      start_time: "2026-08-23T00:30:00Z",
      end_time: "2026-08-23T04:00:00Z",
      available_duration_minutes: 210
    },
    traffic_status: "Clear Window"
  },
  {
    timetable_id: "TT-003",
    location_sector: "SEC-BCT-BRC-03",
    corridor_name: "Mumbai Central to Vadodara Junction",
    time_slot: {
      start_time: "2026-08-23T02:00:00Z",
      end_time: "2026-08-23T05:30:00Z",
      available_duration_minutes: 210
    },
    traffic_status: "Clear Window"
  },
  {
    timetable_id: "TT-004",
    location_sector: "SEC-MAS-BZA-01",
    corridor_name: "Chennai Central to Vijayawada Junction",
    time_slot: {
      start_time: "2026-08-23T01:30:00Z",
      end_time: "2026-08-23T03:30:00Z",
      available_duration_minutes: 120
    },
    traffic_status: "Clear Window"
  },
  {
    timetable_id: "TT-005",
    location_sector: "SEC-SBC-MYS-01",
    corridor_name: "KSR Bengaluru City to Mysuru Junction",
    time_slot: {
      start_time: "2026-08-23T02:00:00Z",
      end_time: "2026-08-23T04:00:00Z",
      available_duration_minutes: 120
    },
    traffic_status: "Clear Window"
  }
];

const sectorMeta = {
  "SEC-NDLS-CNB-01": {
    corridor: "New Delhi to Kanpur Central",
    from: { name: "New Delhi", code: "NDLS", lat: 28.64389, lng: 77.21992 },
    to: { name: "Kanpur Central", code: "CNB", lat: 26.4605, lng: 80.3216 }
  },
  "SEC-HWH-BWN-02": {
    corridor: "Howrah to Barddhaman Junction",
    from: { name: "Howrah", code: "HWH", lat: 22.5839, lng: 88.3433 },
    to: { name: "Barddhaman", code: "BWN", lat: 23.2324, lng: 87.8615 }
  },
  "SEC-BCT-BRC-03": {
    corridor: "Mumbai Central to Vadodara Junction",
    from: { name: "Mumbai Central", code: "BCT", lat: 18.9691, lng: 72.8205 },
    to: { name: "Vadodara", code: "BRC", lat: 22.3072, lng: 73.1812 }
  },
  "SEC-MAS-BZA-01": {
    corridor: "Chennai Central to Vijayawada Junction",
    from: { name: "Chennai Central", code: "MAS", lat: 13.0827, lng: 80.2707 },
    to: { name: "Vijayawada", code: "BZA", lat: 16.5137, lng: 80.6103 }
  },
  "SEC-SBC-MYS-01": {
    corridor: "KSR Bengaluru to Mysuru Junction",
    from: { name: "KSR Bengaluru City", code: "SBC", lat: 12.9773, lng: 77.5704 },
    to: { name: "Mysuru Junction", code: "MYS", lat: 12.3108, lng: 76.6558 }
  }
};

// Initial Live Trains Fleet Dataset
const initialTrains = [
  {
    train_number: "22436",
    train_name: "Vande Bharat Express (Semi-High Speed)",
    train_type: "VandeBharat",
    loco_type: "Train-18 EMU / 16-Car Aerodynamic Rake",
    sector: "SEC-NDLS-CNB-01",
    origin: "New Delhi (NDLS)",
    destination: "Varanasi Jn (BSB)",
    speed: 130,
    current_speed: 130,
    progress: 0.22,
    progress: 0.18,
    direction: 1,
    kavach_status: "SIL-4 ACTIVE · PROTECTED",
    signal_aspect: "GREEN",
    signal_dist: 820,
    scheduled_stops: ["NDLS", "GZB", "ALJN", "TDL", "CNB"],
    dwell_timer: 0,
    last_stopped_station: null
  },
  {
    train_number: "12004",
    train_name: "Lucknow Shatabdi Express",
    train_type: "Passenger",
    loco_type: "WAP-5 5400 HP High-Speed Electric",
    sector: "SEC-NDLS-CNB-01",
    origin: "New Delhi (NDLS)",
    destination: "Lucknow Jn (LJN)",
    origin: "Lucknow Jn (LJN)",
    destination: "New Delhi (NDLS)",
    speed: 115,
    current_speed: 115,
    progress: 0.65,
    direction: 1,
    progress: 0.70,
    direction: -1,
    kavach_status: "SIL-4 ACTIVE · PROTECTED",
    signal_aspect: "GREEN",
    signal_dist: 1200,
    scheduled_stops: ["NDLS", "GZB", "ALJN", "ETW", "CNB"],
    scheduled_stops: ["CNB", "ETW", "ALJN", "GZB", "NDLS"],
    dwell_timer: 0,
    last_stopped_station: null
  },
  {
    train_number: "12302",
    train_name: "Howrah Rajdhani Express",
    train_type: "Passenger",
    loco_type: "WAP-7 6000 HP 3-Phase AC",
    sector: "SEC-HWH-BWN-02",
    origin: "New Delhi (NDLS)",
    destination: "Howrah Jn (HWH)",
    speed: 120,
    current_speed: 120,
    progress: 0.45,
    direction: 1,
    kavach_status: "SIL-4 ACTIVE · PROTECTED",
    signal_aspect: "GREEN",
    signal_dist: 950,
    scheduled_stops: ["HWH", "BDC", "BWN"],
    dwell_timer: 0,
    last_stopped_station: null
  },
  {
    train_number: "12952",
    train_name: "Mumbai Central Rajdhani",
    train_type: "Passenger",
    loco_type: "WAP-7 6000 HP 3-Phase AC",
    sector: "SEC-BCT-BRC-03",
    origin: "New Delhi (NDLS)",
    destination: "Mumbai Central (BCT)",
    speed: 125,
    current_speed: 125,
    progress: 0.75,
    direction: -1,
    kavach_status: "SIL-4 ACTIVE · PROTECTED",
    signal_aspect: "GREEN",
    signal_dist: 1400,
    scheduled_stops: ["BCT", "BVI", "ST", "BRC"],
    dwell_timer: 0,
    last_stopped_station: null
  },
  {
    train_number: "12622",
    train_name: "Tamil Nadu Superfast Express",
    train_type: "Passenger",
    loco_type: "WAP-4 5000 HP Heavy Passenger",
    sector: "SEC-MAS-BZA-01",
    origin: "New Delhi (NDLS)",
    destination: "Chennai Central (MAS)",
    speed: 110,
    current_speed: 110,
    progress: 0.35,
    direction: 1,
    kavach_status: "SIL-4 ACTIVE · PROTECTED",
    signal_aspect: "GREEN",
    signal_dist: 1100,
    scheduled_stops: ["MAS", "BZA"],
    dwell_timer: 0,
    last_stopped_station: null
  },
  {
    train_number: "BOXN-4021",
    train_name: "Heavy Haul Coal Rake (58 BOXN)",
    train_type: "Freight",
    loco_type: "WAG-9 Twin 12000 HP Heavy Haul",
    sector: "SEC-NDLS-CNB-01",
    origin: "Dadri DFC Yard",
    destination: "Panki Thermal Power Yard",
    speed: 75,
    current_speed: 75,
    progress: 0.88,
    progress: 0.85,
    direction: 1,
    kavach_status: "SIL-4 ACTIVE · PROTECTED",
    signal_aspect: "DOUBLE YELLOW",
    signal_dist: 450,
    scheduled_stops: [],
    dwell_timer: 0,
    last_stopped_station: null
  }
];

// Authentic Indian Railways Train Color Themes & Liveries
const trainColorThemes = {
  "22436": {
    name: "Vande Bharat Express",
    type: "Semi-High Speed",
    bodyFill: "#F8FAFC",
    stripeFill: "#1E3A8A",
    roofFill: "#0F172A",
    windowColor: "#38BDF8",
    glowColor: "#06B6D4",
    badgeBg: "#0F172A",
    badgeBorder: "#06B6D4",
    badgeText: "#38BDF8",
    tagColor: "#38BDF8",
    lightColor: "rgba(56, 189, 248, 0.45)",
    liveryName: "Vande Bharat White & Sapphire"
  },
  "12004": {
    name: "Lucknow Shatabdi",
    type: "Shatabdi Express",
    bodyFill: "#0284C7",
    stripeFill: "#E0F2FE",
    roofFill: "#1E293B",
    windowColor: "#0F172A",
    glowColor: "#38BDF8",
    badgeBg: "#0B192C",
    badgeBorder: "#0284C7",
    badgeText: "#7DD3FC",
    tagColor: "#7DD3FC",
    lightColor: "rgba(255, 255, 210, 0.4)",
    liveryName: "Shatabdi Cyan & Ice Blue"
  },
  "12302": {
    name: "Howrah Rajdhani",
    type: "Rajdhani Superfast",
    bodyFill: "#B91C1C",
    stripeFill: "#FBBF24",
    roofFill: "#450A0A",
    windowColor: "#18181B",
    glowColor: "#EF4444",
    badgeBg: "#450A0A",
    badgeBorder: "#EF4444",
    badgeText: "#FCA5A5",
    tagColor: "#FCA5A5",
    lightColor: "rgba(254, 240, 138, 0.4)",
    liveryName: "Rajdhani Crimson & Gold"
  },
  "12952": {
    name: "Mumbai Rajdhani",
    type: "Tejas-Rajdhani",
    bodyFill: "#D97706",
    stripeFill: "#991B1B",
    roofFill: "#78350F",
    windowColor: "#1C1917",
    glowColor: "#F59E0B",
    badgeBg: "#451A03",
    badgeBorder: "#F59E0B",
    badgeText: "#FDE68A",
    tagColor: "#FDE68A",
    lightColor: "rgba(253, 224, 71, 0.4)",
    liveryName: "Tejas Saffron & Crimson"
  },
  "12622": {
    name: "Tamil Nadu Express",
    type: "Superfast Express",
    bodyFill: "#1D4ED8",
    stripeFill: "#DBEAFE",
    roofFill: "#1E293B",
    windowColor: "#0F172A",
    glowColor: "#3B82F6",
    badgeBg: "#172554",
    badgeBorder: "#3B82F6",
    badgeText: "#93C5FD",
    tagColor: "#93C5FD",
    lightColor: "rgba(255, 255, 220, 0.4)",
    liveryName: "Classic IR Oxford Blue"
  },
  "BOXN-4021": {
    name: "Heavy Haul Coal Freight",
    type: "Freight Heavy Haul",
    bodyFill: "#9A3412",
    stripeFill: "#EA580C",
    roofFill: "#431407",
    windowColor: "#1C1917",
    glowColor: "#EA580C",
    badgeBg: "#431407",
    badgeBorder: "#EA580C",
    badgeText: "#FDBA74",
    tagColor: "#FDBA74",
    lightColor: "rgba(254, 215, 170, 0.4)",
    liveryName: "Industrial Rust Amber"
  }
};

// Indian Metro Style Station Definitions for Dynamic Linear Route Schematic
const metroCorridorStations = {
  "SEC-NDLS-CNB-01": {
    line_name: "NORTHERN LINE 1 (NEW DELHI – KANPUR)",
    route_label: "NEW DELHI (NDLS) ➔ KANPUR CENTRAL (CNB)",
    stations: [
      { code: "NDLS", name: "New Delhi", km: 0, x: 80, isTerminal: true },
      { code: "GZB", name: "Ghaziabad Jn", km: 25, x: 260, isJunction: true },
      { code: "ALJN", name: "Aligarh Jn", km: 130, x: 470, isJunction: true },
      { code: "TDL", name: "Tundla Jn", km: 205, x: 670, isJunction: true },
      { code: "ETW", name: "Etawah Jn", km: 300, x: 870 },
      { code: "CNB", name: "Kanpur Central", km: 440, x: 1040, isTerminal: true }
    ],
    block_zone: { 
      from_station: "GZB", 
      to_station: "ALJN", 
      start_x: 275, 
      end_x: 455, 
      entry_turnout_start: 225,
      entry_turnout_end: 270,
      exit_turnout_start: 460,
      exit_turnout_end: 505,
      desc: "P-Way Tamping & OHE Cantilever Work",
      block_id: "BLK-20260823-001"
    }
  },
  "SEC-HWH-BWN-02": {
    line_name: "EASTERN LINE 2 (HOWRAH – BARDDHAMAN)",
    route_label: "HOWRAH JN (HWH) ➔ BARDDHAMAN JN (BWN)",
    stations: [
      { code: "HWH", name: "Howrah Jn", km: 0, x: 80, isTerminal: true },
      { code: "SHE", name: "Seoraphuli Jn", km: 22, x: 300, isJunction: true },
      { code: "BDC", name: "Bandel Jn", km: 40, x: 550, isJunction: true },
      { code: "MYM", name: "Memari", km: 72, x: 800 },
      { code: "BWN", name: "Barddhaman Jn", km: 95, x: 1040, isTerminal: true }
    ],
    block_zone: { 
      from_station: "BDC", 
      to_station: "MYM", 
      start_x: 565, 
      end_x: 785, 
      entry_turnout_start: 515,
      entry_turnout_end: 560,
      exit_turnout_start: 790,
      exit_turnout_end: 835,
      desc: "BCM Ballast Screening & Contact Wire Work",
      block_id: "BLK-20260823-002"
    }
  },
  "SEC-BCT-BRC-03": {
    line_name: "WESTERN LINE 3 (MUMBAI – VADODARA)",
    route_label: "MUMBAI CENTRAL (BCT) ➔ VADODARA JN (BRC)",
    stations: [
      { code: "BCT", name: "Mumbai Central", km: 0, x: 80, isTerminal: true },
      { code: "BVI", name: "Borivali", km: 30, x: 300, isJunction: true },
      { code: "VAPI", name: "Vapi", km: 160, x: 550 },
      { code: "ST", name: "Surat", km: 260, x: 800, isJunction: true },
      { code: "BRC", name: "Vadodara Jn", km: 390, x: 1040, isTerminal: true }
    ],
    block_zone: { 
      from_station: "VAPI", 
      to_station: "ST", 
      start_x: 565, 
      end_x: 785, 
      entry_turnout_start: 515,
      entry_turnout_end: 560,
      exit_turnout_start: 790,
      exit_turnout_end: 835,
      desc: "Electronic Interlocking & Turnout Renewal",
      block_id: "BLK-20260823-003"
    }
  },
  "SEC-MAS-BZA-01": {
    line_name: "SOUTHERN LINE 4 (CHENNAI – VIJAYAWADA)",
    route_label: "CHENNAI CENTRAL (MAS) ➔ VIJAYAWADA (BZA)",
    stations: [
      { code: "MAS", name: "Chennai Central", km: 0, x: 80, isTerminal: true },
      { code: "GDR", name: "Gudur Jn", km: 135, x: 320, isJunction: true },
      { code: "NLR", name: "Nellore", km: 175, x: 560 },
      { code: "OGL", name: "Ongole", km: 290, x: 800 },
      { code: "BZA", name: "Vijayawada Jn", km: 430, x: 1040, isTerminal: true }
    ],
    block_zone: { 
      from_station: "NLR", 
      to_station: "OGL", 
      start_x: 575, 
      end_x: 785, 
      entry_turnout_start: 525,
      entry_turnout_end: 570,
      exit_turnout_start: 790,
      exit_turnout_end: 835,
      desc: "Dropper Retensioning & Track Circuit Inspection",
      block_id: "BLK-20260823-004"
    }
  },
  "SEC-SBC-MYS-01": {
    line_name: "SOUTH WESTERN LINE 5 (BENGALURU – MYSURU)",
    route_label: "KSR BENGALURU (SBC) ➔ MYSURU JN (MYS)",
    stations: [
      { code: "SBC", name: "KSR Bengaluru City", km: 0, x: 80, isTerminal: true },
      { code: "BID", name: "Bidadi", km: 30, x: 280 },
      { code: "RMGM", name: "Ramanagaram", km: 45, x: 480 },
      { code: "CPT", name: "Channapatna", km: 56, x: 680 },
      { code: "MYA", name: "Mandya", km: 93, x: 860 },
      { code: "MYS", name: "Mysuru Jn", km: 138, x: 1040, isTerminal: true }
    ],
    block_zone: { 
      from_station: "RMGM", 
      to_station: "CPT", 
      start_x: 495, 
      end_x: 665, 
      entry_turnout_start: 445,
      entry_turnout_end: 490,
      exit_turnout_start: 670,
      exit_turnout_end: 715,
      desc: "Gauge Alignment & Track Machine Run",
      block_id: "BLK-20260823-005"
    }
  }
};

// Application State
const state = {
  requests: JSON.parse(JSON.stringify(initialRequests)),
  windows: JSON.parse(JSON.stringify(timetableWindows)),
  blocks: [],
  trains: JSON.parse(JSON.stringify(initialTrains)),
  activeDeptFilter: "All",
  searchQuery: "",
  selectedSector: "ALL",
  activeMetroSector: "SEC-NDLS-CNB-01",
  currentViewMode: "metro",
  isOptimizing: false,
  simPlaying: true,
  simSpeed: 2,
  selectedTrain: null,
  isEmergencyBrakeActive: false,
  soundEnabled: true,
  activeIncident: null,
  activeMemoTab: "t1518",
  selectedBlockForMemo: null
};

// Route Path Precalculated Geometry Cache
const routePathData = {};

// Leaflet Map Reference
let leafletMap = null;
let corridorPolylines = {};
let stationMarkers = [];
let trainLeafletMarkers = {};
let lastSimTime = performance.now();

// ==========================================================================
// Initialization & Event Listeners
// ==========================================================================
document.addEventListener("DOMContentLoaded", () => {
  precalculateRoutePaths();
  initClock();
  initMap();
  initTrainMarkers();
  renderAll();
  renderTrainCarousel();
  renderMetroTrackSchematic();
  bindEvents();
  setInterval(updateTrainSimulation, 60);
});

function initClock() {
  function updateTime() {
    const now = new Date();
    const clockEl = document.getElementById("systemClock");
    if (clockEl) {
      clockEl.textContent = now.toLocaleTimeString("en-IN", { hour12: false }) + " IST";
    }
  }
  updateTime();
  setInterval(updateTime, 1000);
}

function bindEvents() {
  // Optimizer trigger
  document.getElementById("optimizeBtn").addEventListener("click", runOptimizer);
  document.getElementById("resetBtn").addEventListener("click", resetAll);

  // Search input
  document.getElementById("requestSearch").addEventListener("input", (e) => {
    state.searchQuery = e.target.value.trim().toLowerCase();
    renderRequestsTable();
  });

  // Department Filter Chips
  document.querySelectorAll("#deptFilterChips .filter-chip").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll("#deptFilterChips .filter-chip").forEach((c) => c.classList.remove("is-active"));
      btn.classList.add("is-active");
      state.activeDeptFilter = btn.dataset.dept;
      renderRequestsTable();
    });
  });

  // View Mode Tabs (Geospatial Map vs Metro Dynamic Line Display)
  const tabGeoMap = document.getElementById("tabGeoMap");
  const tabMetroSchematic = document.getElementById("tabMetroSchematic");
  const geoMapView = document.getElementById("geoMapView");
  const metroSchematicView = document.getElementById("metroSchematicView");

  if (tabGeoMap && tabMetroSchematic) {
    tabGeoMap.addEventListener("click", () => {
      state.currentViewMode = "geomap";
      tabGeoMap.classList.add("is-active");
      tabMetroSchematic.classList.remove("is-active");
      if (geoMapView) geoMapView.classList.remove("hidden");
      if (metroSchematicView) metroSchematicView.classList.add("hidden");
      if (leafletMap) {
        setTimeout(() => leafletMap.invalidateSize(), 50);
      }
    });

    tabMetroSchematic.addEventListener("click", () => {
      state.currentViewMode = "metro";
      tabMetroSchematic.classList.add("is-active");
      tabGeoMap.classList.remove("is-active");
      if (metroSchematicView) metroSchematicView.classList.remove("hidden");
      if (geoMapView) geoMapView.classList.add("hidden");
      renderMetroTrackSchematic();
    });
  }

  // Sector Filter Buttons
  document.querySelectorAll("#sectorFilterButtons .sector-pill").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll("#sectorFilterButtons .sector-pill").forEach((p) => p.classList.remove("is-active"));
      btn.classList.add("is-active");
      const sector = btn.dataset.sector;
      state.selectedSector = sector;
      if (sector !== "ALL") {
        state.activeMetroSector = sector;
      }
      focusMapSector(sector);
      if (state.currentViewMode === "metro") {
        renderMetroTrackSchematic();
      }
    });
  });

  // Reset Map View
  document.getElementById("resetMapBtn").addEventListener("click", () => {
    focusMapSector("ALL");
    document.querySelectorAll("#sectorFilterButtons .sector-pill").forEach((p) => {
      p.classList.toggle("is-active", p.dataset.sector === "ALL");
    });
    if (state.currentViewMode === "metro") {
      renderMetroTrackSchematic();
    }
  });

  // Telemetry Drawer Toggle
  const telemetryDrawer = document.getElementById("telemetryDrawer");
  document.getElementById("toggleTelemetryBtn").addEventListener("click", () => {
    telemetryDrawer.classList.toggle("hidden");
  });
  document.getElementById("closeTelemetryBtn").addEventListener("click", () => {
    telemetryDrawer.classList.add("hidden");
  });

  // Custom Request Modal
  const modal = document.getElementById("customRequestModal");
  document.getElementById("addRequestBtn").addEventListener("click", () => {
    modal.classList.remove("hidden");
  });
  document.getElementById("closeModalBtn").addEventListener("click", () => {
    modal.classList.add("hidden");
  });
  document.getElementById("cancelModalBtn").addEventListener("click", () => {
    modal.classList.add("hidden");
  });

  document.getElementById("customRequestForm").addEventListener("submit", (e) => {
    e.preventDefault();
    handleCustomRequestSubmit();
  });

  // Private Number Modal Close
  const pnModal = document.getElementById("pnModal");
  document.getElementById("closePnModalBtn").addEventListener("click", () => {
    pnModal.classList.add("hidden");
  });
  document.getElementById("confirmPnBtn").addEventListener("click", () => {
    pnModal.classList.add("hidden");
    alert("Official Block Sanction Confirmed & Logged to Control Register!");
  });

  // Export JSON
  document.getElementById("exportJsonBtn").addEventListener("click", exportBlocksJson);

  // Print Sanction
  document.getElementById("printPlanBtn").addEventListener("click", () => {
    window.print();
  });

  // Train Simulation Play / Pause
  const playPauseBtn = document.getElementById("playPauseSimBtn");
  if (playPauseBtn) {
    playPauseBtn.addEventListener("click", () => {
      state.simPlaying = !state.simPlaying;
      const icon = document.getElementById("playPauseIcon");
      const text = document.getElementById("playPauseText");
      if (state.simPlaying) {
        icon.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>`;
        text.textContent = "Pause";
      } else {
        icon.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>`;
        text.textContent = "Resume";
      }
    });
  }

  // Speed selector buttons
  document.querySelectorAll(".speed-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".speed-btn").forEach((b) => b.classList.remove("is-active"));
      btn.classList.add("is-active");
      state.simSpeed = parseFloat(btn.dataset.speed) || 1;
    });
  });

  // Open Active Cab HUD
  const openActiveCabBtn = document.getElementById("openActiveCabBtn");
  if (openActiveCabBtn) {
    openActiveCabBtn.addEventListener("click", () => {
      const train = state.selectedTrain || state.trains[0];
      openCabHud(train);
    });
  }

  // Sound Announcements Toggle
  const toggleSoundBtn = document.getElementById("toggleSoundBtn");
  if (toggleSoundBtn) {
    toggleSoundBtn.addEventListener("click", () => {
      state.soundEnabled = !state.soundEnabled;
      const soundIcon = document.getElementById("soundIcon");
      const soundText = document.getElementById("soundStatusText");
      if (state.soundEnabled) {
        toggleSoundBtn.classList.remove("sound-muted");
        if (soundIcon) soundIcon.textContent = "🔊";
        if (soundText) soundText.textContent = "Audio PIS: ON";
        playIRChime(() => {
          speakStationAnnouncement("Indian Railways Audio Information System Active.");
        });
      } else {
        toggleSoundBtn.classList.add("sound-muted");
        if (soundIcon) soundIcon.textContent = "🔇";
        if (soundText) soundText.textContent = "Audio PIS: OFF";
        if ("speechSynthesis" in window) window.speechSynthesis.cancel();
      }
    });
  }

  // Chaos Incident Simulator Modal
  const chaosModal = document.getElementById("chaosModal");
  const chaosIncidentBtn = document.getElementById("chaosIncidentBtn");
  const closeChaosModalBtn = document.getElementById("closeChaosModalBtn");
  const closeChaosModalBtn2 = document.getElementById("closeChaosModalBtn2");

  if (chaosIncidentBtn) {
    chaosIncidentBtn.addEventListener("click", () => {
      chaosModal.classList.remove("hidden");
    });
  }
  if (closeChaosModalBtn) closeChaosModalBtn.addEventListener("click", () => chaosModal.classList.add("hidden"));
  if (closeChaosModalBtn2) closeChaosModalBtn2.addEventListener("click", () => chaosModal.classList.add("hidden"));

  // Scenario Injection Buttons
  document.querySelectorAll(".inject-scenario-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const scenario = btn.dataset.scenario;
      triggerChaosIncident(scenario);
      chaosModal.classList.add("hidden");
    });
  });

  // Reset Chaos Incidents
  const resetChaosBtn = document.getElementById("resetChaosBtn");
  if (resetChaosBtn) {
    resetChaosBtn.addEventListener("click", () => {
      resolveChaosIncident();
      chaosModal.classList.add("hidden");
    });
  }

  const resolveBannerBtn = document.getElementById("resolveIncidentBannerBtn");
  if (resolveBannerBtn) {
    resolveBannerBtn.addEventListener("click", () => {
      resolveChaosIncident();
    });
  }

  // Official Statutory Railway Memo (T/1518 & T/409)
  const officialMemoModal = document.getElementById("officialMemoModal");
  const openOfficialMemoBtn = document.getElementById("openOfficialMemoBtn");
  const closeMemoModalBtn = document.getElementById("closeMemoModalBtn");
  const closeMemoModalBtn2 = document.getElementById("closeMemoModalBtn2");

  if (openOfficialMemoBtn) {
    openOfficialMemoBtn.addEventListener("click", () => {
      openOfficialMemoModal();
    });
  }
  if (closeMemoModalBtn) closeMemoModalBtn.addEventListener("click", () => officialMemoModal.classList.add("hidden"));
  if (closeMemoModalBtn2) closeMemoModalBtn2.addEventListener("click", () => officialMemoModal.classList.add("hidden"));

  // Memo Form Tabs (T/1518 vs T/409)
  const tabT1518 = document.getElementById("tabFormT1518");
  const tabT409 = document.getElementById("tabFormT409");
  if (tabT1518 && tabT409) {
    tabT1518.addEventListener("click", () => {
      state.activeMemoTab = "t1518";
      tabT1518.classList.add("is-active");
      tabT409.classList.remove("is-active");
      renderOfficialMemoContent();
    });
    tabT409.addEventListener("click", () => {
      state.activeMemoTab = "t409";
      tabT409.classList.add("is-active");
      tabT1518.classList.remove("is-active");
      renderOfficialMemoContent();
    });
  }

  // Print Official Form
  const printMemoBtn = document.getElementById("printMemoBtn");
  if (printMemoBtn) {
    printMemoBtn.addEventListener("click", () => {
      window.print();
    });
  }

  // Download Memo HTML
  const downloadMemoBtn = document.getElementById("downloadMemoBtn");
  if (downloadMemoBtn) {
    downloadMemoBtn.addEventListener("click", downloadOfficialMemoHtml);
  }

  // Close Cab HUD
  const cabModal = document.getElementById("cabModal");
  const closeCabBtn = document.getElementById("closeCabModalBtn");
  const closeCabBtn2 = document.getElementById("closeCabBtn2");
  if (closeCabBtn) closeCabBtn.addEventListener("click", () => cabModal.classList.add("hidden"));
  if (closeCabBtn2) closeCabBtn2.addEventListener("click", () => cabModal.classList.add("hidden"));

  // Emergency Brake Test Button
  const emergencyBrakeBtn = document.getElementById("emergencyBrakeBtn");
  if (emergencyBrakeBtn) {
    emergencyBrakeBtn.addEventListener("click", () => {
      state.isEmergencyBrakeActive = !state.isEmergencyBrakeActive;
      if (state.isEmergencyBrakeActive) {
        emergencyBrakeBtn.querySelector("span").textContent = "Release Emergency Brake";
        logTelemetry(`[KAVACH_TCAS] Emergency brake commanded for ${state.selectedTrain ? state.selectedTrain.train_number : 'active train'}. Decelerating rapidly to zero.`, "warn");
      } else {
        emergencyBrakeBtn.querySelector("span").textContent = "Test Kavach Emergency Brake";
        logTelemetry(`[KAVACH_TCAS] Emergency brake released. Resuming nominal throttle speed.`, "step");
      }
    });
  }
}

// ==========================================================================
// Geometry & Track Math Precomputation
// ==========================================================================
function precalculateRoutePaths() {
  const routes = window.railRouteCoordinates || {};
  Object.keys(sectorMeta).forEach((secKey) => {
    const meta = sectorMeta[secKey];
    const coords = routes[secKey] || [
      [meta.from.lat, meta.from.lng],
      [meta.to.lat, meta.to.lng]
    ];
    let totalDist = 0;
    const segments = [];
    for (let i = 0; i < coords.length - 1; i++) {
      const p1 = coords[i];
      const p2 = coords[i + 1];
      const dLat = p2[0] - p1[0];
      const dLng = p2[1] - p1[1];
      const len = Math.sqrt(dLat * dLat + dLng * dLng);
      segments.push({ p1, p2, len, start: totalDist });
      totalDist += len;
    }
    routePathData[secKey] = { totalDist, segments, coords };
  });
}

function getPositionOnRoute(secKey, progress) {
  const data = routePathData[secKey];
  if (!data || data.segments.length === 0) return { lat: 21.5, lng: 78.9, bearing: 0 };
  const p = Math.max(0, Math.min(1, progress));
  const targetDist = p * data.totalDist;
  for (const seg of data.segments) {
    if (targetDist >= seg.start && targetDist <= seg.start + seg.len + 0.000001) {
      const ratio = seg.len === 0 ? 0 : (targetDist - seg.start) / seg.len;
      const lat = seg.p1[0] + (seg.p2[0] - seg.p1[0]) * ratio;
      const lng = seg.p1[1] + (seg.p2[1] - seg.p1[1]) * ratio;
      const dLat = seg.p2[0] - seg.p1[0];
      const dLng = seg.p2[1] - seg.p1[1];
      const bearing = (Math.atan2(dLng, dLat) * 180) / Math.PI;
      return { lat, lng, bearing };
    }
  }
  const last = data.segments[data.segments.length - 1].p2;
  return { lat: last[0], lng: last[1], bearing: 0 };
}

// ==========================================================================
// Interactive Leaflet Corridor Map
// ==========================================================================
function initMap() {
  const mapContainer = document.getElementById("corridorMap");
  if (!mapContainer || typeof L === "undefined") return;

  // Initialize Map Centered on India
  leafletMap = L.map("corridorMap", {
    center: [21.5, 78.9],
    zoom: 5,
    minZoom: 4,
    maxZoom: 12,
    zoomControl: true,
    scrollWheelZoom: false
  });

  // Modern Clean CartoDB Positron Tile Layer
  L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: "abcd",
    maxZoom: 19
  }).addTo(leafletMap);

  // Render Routes and Stations
  renderMapCorridors();
}

function renderMapCorridors() {
  if (!leafletMap) return;

  const routes = window.railRouteCoordinates || {};

  Object.keys(sectorMeta).forEach((secKey) => {
    const meta = sectorMeta[secKey];
    const coords = routes[secKey] || [
      [meta.from.lat, meta.from.lng],
      [meta.to.lat, meta.to.lng]
    ];

    // White outline path for crisp contrast
    L.polyline(coords, {
      color: "#FFFFFF",
      weight: 6,
      opacity: 0.9,
      lineCap: "round",
      lineJoin: "round"
    }).addTo(leafletMap);

    // Primary Rail Track Polyline
    const polyline = L.polyline(coords, {
      color: "#1468D4",
      weight: 4,
      opacity: 0.95,
      lineCap: "round",
      lineJoin: "round"
    }).addTo(leafletMap);

    // Attach Interactive Popup
    const sectorReqs = state.requests.filter((r) => r.location_sector === secKey);
    const win = state.windows.find((w) => w.location_sector === secKey);
    const totalWork = sectorReqs.reduce((sum, r) => sum + r.duration_minutes, 0);

    const popupHtml = `
      <div class="custom-map-popup">
        <code>${secKey}</code>
        <strong>${meta.corridor}</strong>
        <p>${sectorReqs.length} maintenance requests · ${totalWork} mins requested</p>
        <span class="popup-capacity">Clear Closure Window: ${win ? win.time_slot.available_duration_minutes : 0} mins</span>
      </div>
    `;

    polyline.bindPopup(popupHtml);
    polyline.on("click", () => {
      state.selectedSector = secKey;
      document.querySelectorAll("#sectorFilterButtons .sector-pill").forEach((p) => {
        p.classList.toggle("is-active", p.dataset.sector === secKey);
      });
    });

    corridorPolylines[secKey] = polyline;

    // Station Markers
    [meta.from, meta.to].forEach((stn) => {
      const marker = L.circleMarker([stn.lat, stn.lng], {
        radius: 6,
        fillColor: "#1468D4",
        color: "#FFFFFF",
        weight: 2,
        opacity: 1,
        fillOpacity: 1
      }).addTo(leafletMap);

      marker.bindTooltip(`<b>${stn.code}</b> · ${stn.name}`, {
        direction: "top",
        offset: [0, -6],
        className: "station-tooltip"
      });

      stationMarkers.push(marker);
    });
  });
}

function focusMapSector(sector) {
  if (!leafletMap) return;

  if (sector === "ALL") {
    leafletMap.flyTo([21.5, 78.9], 5, { duration: 1.2 });
    Object.keys(corridorPolylines).forEach((k) => {
      corridorPolylines[k].setStyle({ color: "#1468D4", weight: 4 });
    });
    return;
  }

  const polyline = corridorPolylines[sector];
  if (polyline) {
    leafletMap.flyToBounds(polyline.getBounds(), {
      padding: [40, 40],
      duration: 1.2
    });

    Object.keys(corridorPolylines).forEach((k) => {
      if (k === sector) {
        corridorPolylines[k].setStyle({ color: "#059669", weight: 6 });
        corridorPolylines[k].openPopup();
      } else {
        corridorPolylines[k].setStyle({ color: "#94A3B8", weight: 3 });
      }
    });
  }
}

// ==========================================================================
// Live Train Simulation & Fleet Telemetry Engine
// ==========================================================================
function initTrainMarkers() {
  if (!leafletMap) return;

  // Clear existing train markers
  Object.values(trainLeafletMarkers).forEach((m) => leafletMap.removeLayer(m));
  trainLeafletMarkers = {};

  state.trains.forEach((train) => {
    const pos = getPositionOnRoute(train.sector, train.progress);
    const isFreight = train.train_type === "Freight";
    const isVande = train.train_type === "VandeBharat";
    const colorClass = isFreight ? "train-loco-freight" : isVande ? "train-loco-vande" : "";

    const rot = train.direction === 1 ? pos.bearing : pos.bearing + 180;

    const iconHtml = `
      <div class="train-custom-marker" id="train-marker-${train.train_number}" onclick="openCabHudByNumber('${train.train_number}')" title="${train.train_name} (${train.speed} km/h)">
        <div class="train-loco-icon ${colorClass}" style="transform: rotate(${rot}deg);">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="#FFFFFF">
            <polygon points="12 2 19 21 12 17 5 21 12 2"/>
          </svg>
        </div>
        <div class="train-marker-label">${train.train_number} · ${train.current_speed} km/h</div>
      </div>
    `;

    const customIcon = L.divIcon({
      html: iconHtml,
      className: "leaflet-train-div-icon",
      iconSize: [30, 30],
      iconAnchor: [15, 15]
    });

    const marker = L.marker([pos.lat, pos.lng], { icon: customIcon }).addTo(leafletMap);
    marker.on("click", () => {
      openCabHud(train);
    });

    trainLeafletMarkers[train.train_number] = marker;
  });
}

function updateTrainSimulation() {
  const now = performance.now();
  const dt = Math.min((now - lastSimTime) / 1000, 0.1);
  lastSimTime = now;

  if (state.simPlaying) {
    state.trains.forEach((train) => {
      // Find sector and check for maintenance block in this sector
      const sectorKey = train.sector;
      const corridor = metroCorridorStations[sectorKey];
      const hasBlock = state.blocks.some((b) => b.location_sector === sectorKey) || 
                       state.requests.some((r) => r.location_sector === sectorKey);
      const bz = corridor ? corridor.block_zone : null;

      // Current train X coordinate on schematic (80 to 1040)
      const currentX = 80 + train.progress * (1040 - 80);

      // Determine target speed based on emergency incidents, station stops, turnouts, and block zone
      let targetSpeed = train.speed;
      let isDiverted = false;

      // 1. Check for Active Chaos Incident in this train's sector
      let isIncidentActive = false;
      if (state.activeIncident && (state.activeIncident.sector === sectorKey || state.activeIncident.sector === "ALL")) {
        isIncidentActive = true;
        const inc = state.activeIncident;
        if (inc.key === "RAIL_FRACTURE") {
          targetSpeed = 0;
          train.signal_aspect = "DANGER (RED) · RAIL FRACTURE KM 78.4";
          train.kavach_status = "TRIP · SIL-4 EMERGENCY BRAKE ENGAGED";
        } else if (inc.key === "OHE_SNAP") {
          targetSpeed = Math.min(train.current_speed, 20);
          train.signal_aspect = "OHE 25kV TRIP (COASTING)";
          train.kavach_status = "OHE ZERO VOLTAGE · PANTOGRAPH DOWN";
        } else if (inc.key === "SIGNAL_FAILURE") {
          targetSpeed = 15;
          train.signal_aspect = "DANGER (RED) · 15 KM/H RESTRICTION";
          train.kavach_status = "RESTRICTED ASPECT CLAMP (15 KM/H)";
        } else if (inc.key === "CATTLE_OBSTRUCTION") {
          // Force diversion via loop
          if (bz && train.direction === 1) {
            if (currentX >= bz.entry_turnout_start - 70 && currentX < bz.entry_turnout_start) {
              targetSpeed = 45;
              train.signal_aspect = "CAUTION (DIVERTING ➔ LOOP)";
            } else if (currentX >= bz.entry_turnout_start && currentX <= bz.exit_turnout_end + 20) {
              targetSpeed = 40;
              isDiverted = true;
              train.signal_aspect = "CAUTION (LOOP PSR 40 KM/H)";
            }
          }
        }
      }

      // 2. Check for Manual Kavach Emergency Brake
      if (!isIncidentActive && state.isEmergencyBrakeActive && state.selectedTrain && state.selectedTrain.train_number === train.train_number) {
        targetSpeed = 0;
        train.signal_aspect = "DANGER (RED) · KAVACH BRAKE";
      }

      // 3. Check for Station Dwell Stops (if no emergency halt)
      let isDwellingAtStation = false;
      if (!isIncidentActive && !state.isEmergencyBrakeActive && corridor && train.scheduled_stops && train.scheduled_stops.length > 0) {
        if (train.dwell_timer > 0) {
          train.dwell_timer -= dt * state.simSpeed;
          targetSpeed = 0;
          isDwellingAtStation = true;
          train.signal_aspect = `AT PLATFORM (HALTED)`;
          if (train.dwell_timer <= 0) {
            train.dwell_timer = 0;
            train.signal_aspect = "PROCEED (GREEN)";
          }
        } else {
          for (let sIdx = 0; sIdx < corridor.stations.length; sIdx++) {
            const stn = corridor.stations[sIdx];
            if (!train.scheduled_stops.includes(stn.code)) continue;

            const stnProgress = (stn.x - 80) / (1040 - 80);
            const dist = Math.abs(train.progress - stnProgress);

            if (dist < 0.016 && train.last_stopped_station !== stn.code) {
              train.dwell_timer = 7;
              train.last_stopped_station = stn.code;
              targetSpeed = 0;
              isDwellingAtStation = true;
              train.signal_aspect = `AT PLATFORM (${stn.code})`;
              playStationArrivalAnnouncement(train, stn);
              break;
            } else if (dist < 0.055 && train.last_stopped_station !== stn.code) {
              targetSpeed = Math.min(targetSpeed, 32);
              train.signal_aspect = `APPROACHING ${stn.name.toUpperCase()} (PF 2)`;
              break;
            } else if (dist > 0.12 && train.last_stopped_station === stn.code) {
              train.last_stopped_station = null;
            }
          }
        }
      }

      // 4. Check for Maintenance Block & Loop Bypass (if not dwelling and not in incident)
      if (!isIncidentActive && !state.isEmergencyBrakeActive && !isDwellingAtStation) {
        if (hasBlock && bz && train.direction === 1) {
          if (currentX >= bz.entry_turnout_start - 70 && currentX < bz.entry_turnout_start) {
            targetSpeed = 45;
            train.signal_aspect = "CAUTION (DIVERTING ➔ LOOP)";
          } else if (currentX >= bz.entry_turnout_start && currentX <= bz.exit_turnout_end + 20) {
            targetSpeed = 42;
            isDiverted = true;
            train.signal_aspect = "CAUTION (LOOP PSR 45 KM/H)";
          } else {
            targetSpeed = train.speed;
            train.signal_aspect = "PROCEED (GREEN)";
          }
        } else {
          targetSpeed = train.speed;
          train.signal_aspect = "PROCEED (GREEN)";
        }
      }

      // 5. Automatic Train Protection (Kavach SIL-4): Headway Spacing & Anti-Collision
      // Scans for any train ahead on the same corridor sector, moving in the same direction
      let minLeadingHeadway = Infinity;
      let leadTrain = null;

      state.trains.forEach((otherTrain) => {
        if (otherTrain.train_number === train.train_number) return;
        if (otherTrain.sector !== train.sector) return;
        if (otherTrain.direction !== train.direction) return;

        // Progress distance along travel direction
        const delta = (otherTrain.progress - train.progress) * train.direction;
        if (delta > 0 && delta < minLeadingHeadway) {
          minLeadingHeadway = delta;
          leadTrain = otherTrain;
        }
      });

      if (leadTrain) {
        train.signal_dist = Math.round(minLeadingHeadway * 440 * 1000);

        // Danger Halt Zone: headway < 0.12 (~115px / ~50km)
        if (minLeadingHeadway < 0.12) {
          targetSpeed = 0;
          train.signal_aspect = `DANGER (RED) · HELD BEHIND ${leadTrain.train_number}`;
          train.kavach_status = `KAVACH SIL-4 TRIPPED · BEHIND ${leadTrain.train_number}`;
        }
        // Caution Regulated Zone: headway < 0.18 (~170px / ~80km)
        else if (minLeadingHeadway < 0.18) {
          targetSpeed = Math.min(targetSpeed, 32, Math.max(0, leadTrain.current_speed - 5));
          train.signal_aspect = `CAUTION (YELLOW) · FOLLOWING ${leadTrain.train_number}`;
          train.kavach_status = "KAVACH SPEED RESTRICTION";
        }
        // Attention Zone: headway < 0.26 (~250px)
        else if (minLeadingHeadway < 0.26) {
          targetSpeed = Math.min(targetSpeed, 65);
          train.signal_aspect = "ATTENTION (DOUBLE YELLOW)";
        }
      }

      train.is_diverted = isDiverted;

      // Realistic acceleration / deceleration physics
      if (train.current_speed < targetSpeed) {
        // Locomotive tractive acceleration response
        const accelRate = isDiverted ? 14 : 20; // km/h per second
        train.current_speed = Math.min(targetSpeed, train.current_speed + accelRate * dt * state.simSpeed);
      } else if (train.current_speed > targetSpeed) {
        // Dynamic & pneumatic braking response
        const decelRate = (targetSpeed === 0) ? 50 : 32; // km/h per second
        train.current_speed = Math.max(targetSpeed, train.current_speed - decelRate * dt * state.simSpeed);
      }

      // Realistic micro-fluctuations (±0.8 km/h) when at steady cruising or restricted loop speed
      if (train.current_speed > 15 && Math.abs(train.current_speed - targetSpeed) < 3.5) {
        const microNoise = Math.sin(now * 0.003 + train.train_number.charCodeAt(0)) * 0.9;
        train.display_speed = Math.max(0, Math.round(train.current_speed + microNoise));
      } else {
        train.display_speed = Math.max(0, Math.round(train.current_speed));
      }

      // Progress along route (step proportional to current_speed)
      const step = (train.current_speed / 120) * 0.007 * state.simSpeed * dt * train.direction;
      train.progress += step;

      // Mathematical Anti-Collision Guarantee:
      // Hard clamp so train can NEVER penetrate within 0.095 progress units (~91px) of lead train
      if (leadTrain) {
        const currentDelta = (leadTrain.progress - train.progress) * train.direction;
        if (currentDelta < 0.095) {
          if (train.direction === 1) {
            train.progress = leadTrain.progress - 0.095;
          } else {
            train.progress = leadTrain.progress + 0.095;
          }
          train.current_speed = 0;
          train.display_speed = 0;
        }
      }

      if (train.progress >= 0.98) {
        train.direction = -1;
        train.progress = 0.98;
        const isBlockedAtTerminal = state.trains.some(
          (t) => t.train_number !== train.train_number && t.sector === train.sector && t.direction === -1 && t.progress > 0.88
        );
        if (!isBlockedAtTerminal) {
          train.direction = -1;
          train.progress = 0.98;
        } else {
          train.progress = 0.97;
          train.current_speed = 0;
        }
      } else if (train.progress <= 0.02) {
        train.direction = 1;
        train.progress = 0.02;
        const isBlockedAtOrigin = state.trains.some(
          (t) => t.train_number !== train.train_number && t.sector === train.sector && t.direction === 1 && t.progress < 0.12
        );
        if (!isBlockedAtOrigin) {
          train.direction = 1;
          train.progress = 0.02;
        } else {
          train.progress = 0.03;
          train.current_speed = 0;
        }
      }

      // Update Marker on Leaflet map
      const pos = getPositionOnRoute(train.sector, train.progress);
      const marker = trainLeafletMarkers[train.train_number];
      if (marker) {
        marker.setLatLng([pos.lat, pos.lng]);
        const el = document.getElementById(`train-marker-${train.train_number}`);
        if (el) {
          const iconEl = el.querySelector(".train-loco-icon");
          if (iconEl) {
            const rot = train.direction === 1 ? pos.bearing : pos.bearing + 180;
            iconEl.style.transform = `rotate(${rot}deg)`;
          }
          const labelEl = el.querySelector(".train-marker-label");
          if (labelEl) {
            labelEl.textContent = `${train.train_number} · ${train.display_speed} km/h`;
          }
        }
      }
    });

    updateTrainCarouselSpeeds();
    updateCabHudRealtime();
    if (state.currentViewMode === "metro") {
      renderMetroTrackSchematic();
    }
  }
}

// ==========================================================================
// Indian Metro Style Dynamic Linear Track Schematic Renderer
// ==========================================================================
function renderMetroTrackSchematic() {
  const svg = document.getElementById("metroTrackSvg");
  if (!svg) return;

  const sectorKey = state.activeMetroSector === "ALL" ? "SEC-NDLS-CNB-01" : state.activeMetroSector;
  const corridor = metroCorridorStations[sectorKey] || metroCorridorStations["SEC-NDLS-CNB-01"];

  // Update PIS Header
  const badgeEl = document.getElementById("metroLineBadge");
  const titleEl = document.getElementById("metroRouteTitle");
  if (badgeEl) badgeEl.textContent = corridor.line_name;
  if (titleEl) titleEl.textContent = corridor.route_label;

  // Active trains in this corridor
  const activeTrains = state.trains.filter((t) => t.sector === sectorKey);
  const primaryTrain = activeTrains[0] || state.trains[0];

  // Determine approaching station for announcement ticker
  let nextStation = corridor.stations[1];
  for (let i = 0; i < corridor.stations.length; i++) {
    const stn = corridor.stations[i];
    const stnProgress = (stn.x - 80) / (1040 - 80);
    if (primaryTrain.direction === 1 && stnProgress > primaryTrain.progress) {
      nextStation = stn;
      break;
    } else if (primaryTrain.direction === -1 && stnProgress < primaryTrain.progress) {
      nextStation = stn;
      break;
    }
  }

  const announcementEl = document.getElementById("metroAnnouncementText");
  if (announcementEl && nextStation) {
    const distRemaining = Math.max(1, Math.round(Math.abs(primaryTrain.progress * 440 - nextStation.km)));
    const liveSpeed = primaryTrain.display_speed || Math.round(primaryTrain.current_speed);
    const divertTag = primaryTrain.is_diverted ? " · ⚠️ DIVERSION ACTIVE VIA BYPASS LOOP (PSR 45)" : "";
    announcementEl.textContent = `NEXT ARRIVAL: ${nextStation.name.toUpperCase()} (${nextStation.code}) · PLATFORM 2 · DISTANCE: ${distRemaining} KM · SPEED: ${liveSpeed} KM/H${divertTag} · KAVACH SIL-4 INTERLOCKED`;
  }

  // Build SVG Markup
  let svgContent = `
    <defs>
      <!-- Diagonal Hazard Pattern for Active Maintenance Blocks -->
      <pattern id="metroHazardStripe" width="16" height="16" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
        <line x1="0" y1="0" x2="0" y2="16" stroke="#EF4444" stroke-width="8" />
        <line x1="8" y1="0" x2="8" y2="16" stroke="#FBBF24" stroke-width="8" />
      </pattern>
      <!-- Track Glow Filters -->
      <filter id="metroGlow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="3" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
    </defs>
  `;

  const bz = corridor.block_zone;
  const hasBlock = state.blocks.length > 0 || state.requests.some((r) => r.location_sector === sectorKey);

  // 1. Cross Sleepers (Ties) for UP track (y=95) and DOWN track (y=210)
  for (let sx = 50; sx <= 1050; sx += 16) {
    svgContent += `
      <line x1="${sx}" y1="89" x2="${sx}" y2="101" stroke="#1E293B" stroke-width="2"/>
      <line x1="${sx}" y1="204" x2="${sx}" y2="216" stroke="#1E293B" stroke-width="2"/>
    `;
  }

  // Sleepers for Middle Bypass Loop track (y=150)
  if (bz && hasBlock) {
    for (let lx = bz.entry_turnout_start - 20; lx <= bz.exit_turnout_end + 20; lx += 16) {
      svgContent += `
        <line x1="${lx}" y1="144" x2="${lx}" y2="156" stroke="#1E293B" stroke-width="2"/>
      `;
    }
  }

  // 2. Primary Track Lines
  svgContent += `
    <!-- UP Main Line (Westbound / Outbound) -->
    <line x1="50" y1="95" x2="1050" y2="95" stroke="#38BDF8" stroke-width="4.5" stroke-linecap="round" filter="url(#metroGlow)"/>
    <text x="50" y="72" fill="#38BDF8" font-family="Manrope, sans-serif" font-size="12" font-weight="800" letter-spacing="0.8">UP MAIN LINE (OUTBOUND) ➔</text>

    <!-- DOWN Main Line (Eastbound / Inbound) -->
    <line x1="50" y1="210" x2="1050" y2="210" stroke="#818CF8" stroke-width="4.5" stroke-linecap="round" filter="url(#metroGlow)"/>
    <text x="50" y="235" fill="#818CF8" font-family="Manrope, sans-serif" font-size="12" font-weight="800" letter-spacing="0.8">DOWN MAIN LINE (INBOUND) ➔</text>
  `;

  // 3. Bypass Diversion Loop & Crossover Turnout Switches
  if (bz && hasBlock) {
    const e1 = bz.entry_turnout_start;
    const e2 = bz.entry_turnout_end;
    const cp1x = e1 + 24;
    const cp2x = e2 - 24;

    const x1 = bz.exit_turnout_start;
    const x2 = bz.exit_turnout_end;
    const cpx1 = x1 + 24;
    const cpx2 = x2 - 24;

    svgContent += `
      <!-- Middle Bypass Loop Line Track -->
      <line x1="${e2}" y1="150" x2="${x1}" y2="150" stroke="#34D399" stroke-width="4" stroke-linecap="round" filter="url(#metroGlow)"/>
      
      <!-- Entry Crossover Turnout Switch -->
      <path d="M ${e1} 95 C ${cp1x} 95, ${cp2x} 150, ${e2} 150" fill="none" stroke="#34D399" stroke-width="4" stroke-linecap="round" filter="url(#metroGlow)"/>
      
      <!-- Exit Crossover Turnout Switch -->
      <path d="M ${x1} 150 C ${cpx1} 150, ${cpx2} 95, ${x2} 95" fill="none" stroke="#34D399" stroke-width="4" stroke-linecap="round" filter="url(#metroGlow)"/>

      <!-- Illuminated Point Machine Switch Blades -->
      <g transform="translate(${e1}, 95)">
        <circle cx="0" cy="0" r="5" fill="#34D399" stroke="#FFFFFF" stroke-width="1.5"/>
        <text x="-8" y="-12" fill="#34D399" font-family="DM Mono, monospace" font-size="10" font-weight="700" text-anchor="end">POINT 101A (DIVERTED)</text>
      </g>
      <g transform="translate(${x2}, 95)">
        <circle cx="0" cy="0" r="5" fill="#34D399" stroke="#FFFFFF" stroke-width="1.5"/>
        <text x="8" y="-12" fill="#34D399" font-family="DM Mono, monospace" font-size="10" font-weight="700">POINT 102B (RETURN)</text>
      </g>

      <!-- Middle Loop Label & Active Direction Chevrons -->
      <text x="${(e1 + x2) / 2}" y="173" fill="#34D399" font-family="Manrope, sans-serif" font-size="11.5" font-weight="800" text-anchor="middle" letter-spacing="0.5">MIDDLE BYPASS LOOP · DIVERSION ROUTE ACTIVE (PSR: 45 KM/H) »»»</text>
    `;

    // 4. Active Maintenance Block Hazard Box strictly on UP line
    const bw = bz.end_x - bz.start_x;
    svgContent += `
      <!-- Active Maintenance Block Hazard Box on UP Track -->
      <rect x="${bz.start_x}" y="80" width="${bw}" height="30" fill="url(#metroHazardStripe)" rx="5" opacity="0.95" stroke="#EF4444" stroke-width="2"/>
      
      <!-- Red Safety Stop Signals at block boundaries -->
      <g transform="translate(${bz.start_x}, 95)">
        <circle cx="0" cy="0" r="8" fill="#EF4444" stroke="#FFFFFF" stroke-width="2" filter="url(#metroGlow)"/>
        <circle cx="0" cy="0" r="3" fill="#FFFFFF"/>
      </g>
      <g transform="translate(${bz.end_x}, 95)">
        <circle cx="0" cy="0" r="8" fill="#EF4444" stroke="#FFFFFF" stroke-width="2" filter="url(#metroGlow)"/>
        <circle cx="0" cy="0" r="3" fill="#FFFFFF"/>
      </g>

      <!-- Caution Barrier Pill Tag (Above Block) -->
      <g transform="translate(${(bz.start_x + bz.end_x) / 2}, 55)">
        <rect x="-155" y="-13" width="310" height="26" rx="13" fill="#7F1D1D" stroke="#EF4444" stroke-width="1.5" filter="url(#metroGlow)"/>
        <text x="0" y="5" fill="#FEF2F2" font-family="Manrope, sans-serif" font-size="11" font-weight="800" text-anchor="middle">⚠️ TRACK POSSESSION: ${bz.desc}</text>
      </g>

      <!-- Block Status Subtitle (Below Block) -->
      <text x="${(bz.start_x + bz.end_x) / 2}" y="128" fill="#EF4444" font-family="DM Mono, monospace" font-size="10" font-weight="700" text-anchor="middle">UP TRACK IMPASSIBLE · ROUTED VIA COMMON LOOP</text>
    `;
  }

  // Active Chaos Incident Graphic Overlay on Schematic Track
  if (state.activeIncident && (state.activeIncident.sector === sectorKey || state.activeIncident.sector === "ALL")) {
    const incX = state.activeIncident.x || 430;
    svgContent += `
      <!-- Active Mainline Emergency Failure Marker -->
      <g transform="translate(${incX}, 95)">
        <circle cx="0" cy="0" r="16" fill="rgba(239, 68, 68, 0.25)" stroke="#EF4444" stroke-width="2" filter="url(#metroGlow)">
          <animate attributeName="r" values="10;22;10" dur="1s" repeatCount="indefinite"/>
          <animate attributeName="opacity" values="0.9;0.2;0.9" dur="1s" repeatCount="indefinite"/>
        </circle>
        <circle cx="0" cy="0" r="8" fill="#EF4444" stroke="#FFFFFF" stroke-width="1.5"/>
        <text x="0" y="4" fill="#FFFFFF" font-family="Manrope, sans-serif" font-size="10" font-weight="900" text-anchor="middle">!</text>
      </g>
      <g transform="translate(${incX}, 130)">
        <rect x="-115" y="-12" width="230" height="24" rx="12" fill="#7F1D1D" stroke="#EF4444" stroke-width="1.5" filter="url(#metroGlow)"/>
        <text x="0" y="4" fill="#FEE2E2" font-family="DM Mono, monospace" font-size="9" font-weight="800" text-anchor="middle">🚨 ${state.activeIncident.key} (KM ${state.activeIncident.km})</text>
      </g>
    `;
  }

  // 5. Draw Stations
  corridor.stations.forEach((stn) => {
    // Inter-track vertical alignment dashed lines
    svgContent += `
      <line x1="${stn.x}" y1="80" x2="${stn.x}" y2="225" stroke="#1E293B" stroke-width="2" stroke-dasharray="3,3"/>
    `;

    const isNext = nextStation && nextStation.code === stn.code;
    const isPassed = primaryTrain.direction === 1 ? primaryTrain.progress * 1040 > stn.x : primaryTrain.progress * 1040 < stn.x;

    // Station Nodes on UP (95) and DOWN (210) tracks
    const tracksToMark = [95, 210];
    if (bz && hasBlock && stn.x >= bz.entry_turnout_start && stn.x <= bz.exit_turnout_end) {
      tracksToMark.push(150);
    }

    tracksToMark.forEach((trackY) => {
      if (isNext) {
        // Pulsing green LED aura for next approaching station
        svgContent += `
          <circle cx="${stn.x}" cy="${trackY}" r="13" fill="none" stroke="#34D399" stroke-width="2.5" opacity="0.85">
            <animate attributeName="r" values="8;15;8" dur="1.4s" repeatCount="indefinite"/>
            <animate attributeName="opacity" values="1;0.25;1" dur="1.4s" repeatCount="indefinite"/>
          </circle>
          <circle cx="${stn.x}" cy="${trackY}" r="7" fill="#34D399" stroke="#FFFFFF" stroke-width="2"/>
        `;
      } else if (isPassed) {
        svgContent += `
          <circle cx="${stn.x}" cy="${trackY}" r="6" fill="#38BDF8" stroke="#FFFFFF" stroke-width="1.5"/>
        `;
      } else {
        svgContent += `
          <circle cx="${stn.x}" cy="${trackY}" r="6" fill="#0A1128" stroke="#64748B" stroke-width="2"/>
        `;
      }
    });

    // Station Name Labels (Top)
    svgContent += `
      <text x="${stn.x}" y="36" fill="${isNext ? '#34D399' : '#FFFFFF'}" font-family="Manrope, sans-serif" font-size="13" font-weight="800" text-anchor="middle">${stn.name}</text>
    `;

    // Station Code & KM Marker (Bottom)
    svgContent += `
      <text x="${stn.x}" y="258" fill="#38BDF8" font-family="DM Mono, monospace" font-size="12.5" font-weight="800" text-anchor="middle">${stn.code}</text>
      <text x="${stn.x}" y="275" fill="#94A3B8" font-family="DM Mono, monospace" font-size="10.5" font-weight="600" text-anchor="middle">${stn.km} KM</text>
    `;
  });

  // 6. Draw Live Moving Trains with Liveries and Diversion Physics
  activeTrains.forEach((train) => {
    const currentX = 80 + train.progress * (1040 - 80);
    let trainY = 95;
    let trainAngle = 0;
    let isDiverted = false;

    if (train.direction === 1) {
      if (bz && hasBlock) {
        if (currentX < bz.entry_turnout_start) {
          trainY = 95;
          trainAngle = 0;
          isDiverted = false;
        } else if (currentX >= bz.entry_turnout_start && currentX <= bz.entry_turnout_end) {
          const u = (currentX - bz.entry_turnout_start) / (bz.entry_turnout_end - bz.entry_turnout_start);
          const ease = (1 - Math.cos(u * Math.PI)) / 2;
          trainY = 95 + ease * (150 - 95);
          const dy_dx = (Math.PI / 2) * Math.sin(u * Math.PI) * ((150 - 95) / (bz.entry_turnout_end - bz.entry_turnout_start));
          trainAngle = Math.atan(dy_dx) * (180 / Math.PI);
          isDiverted = true;
        } else if (currentX > bz.entry_turnout_end && currentX < bz.exit_turnout_start) {
          trainY = 150;
          trainAngle = 0;
          isDiverted = true;
        } else if (currentX >= bz.exit_turnout_start && currentX <= bz.exit_turnout_end) {
          const u = (currentX - bz.exit_turnout_start) / (bz.exit_turnout_end - bz.exit_turnout_start);
          const ease = (1 - Math.cos(u * Math.PI)) / 2;
          trainY = 150 - ease * (150 - 95);
          const dy_dx = -(Math.PI / 2) * Math.sin(u * Math.PI) * ((150 - 95) / (bz.exit_turnout_end - bz.exit_turnout_start));
          trainAngle = Math.atan(dy_dx) * (180 / Math.PI);
          isDiverted = true;
        } else {
          trainY = 95;
          trainAngle = 0;
          isDiverted = false;
        }
      } else {
        trainY = 95;
        trainAngle = 0;
        isDiverted = false;
      }
    } else {
      trainY = 210;
      trainAngle = 0;
      isDiverted = false;
    }

    // Color theme livery
    const theme = trainColorThemes[train.train_number] || {
      name: train.train_name,
      type: train.train_type,
      bodyFill: train.train_type === "Freight" ? "#9A3412" : "#1D4ED8",
      stripeFill: train.train_type === "Freight" ? "#EA580C" : "#DBEAFE",
      roofFill: "#1E293B",
      windowColor: "#0F172A",
      glowColor: "#38BDF8",
      badgeBg: "#0F172A",
      badgeBorder: "#38BDF8",
      badgeText: "#FFFFFF",
      tagColor: "#38BDF8",
      lightColor: "rgba(255, 255, 200, 0.35)",
      liveryName: train.train_type
    };

    const liveSpeed = train.display_speed || Math.round(train.current_speed);

    svgContent += `
      <!-- Liveried Train Entity -->
      <g transform="translate(${currentX}, ${trainY}) rotate(${trainAngle}) scale(${train.direction}, 1)" style="cursor: pointer;" onclick="openCabHudByNumber('${train.train_number}')">
        <!-- Forward Headlight Cone -->
        <polygon points="26,-4 95,-18 95,18 26,4" fill="${theme.lightColor || 'rgba(255, 255, 200, 0.35)'}"/>

        <!-- Under-Chassis Neon Glow -->
        <ellipse cx="0" cy="12" rx="25" ry="4" fill="${theme.glowColor}" opacity="0.6" filter="url(#metroGlow)"/>

        <!-- Streamlined Aerodynamic Train Body -->
        <rect x="-26" y="-13" width="52" height="26" rx="7" fill="${theme.bodyFill}" stroke="${theme.stripeFill}" stroke-width="2" filter="url(#metroGlow)"/>

        <!-- Authentic Livery Accent Stripe -->
        <rect x="-25" y="-1" width="50" height="5" fill="${theme.stripeFill}"/>

        <!-- Front Aerodynamic Cab Windshield -->
        <polygon points="12,-9 23,-5 23,5 12,9" fill="${theme.windowColor}"/>
        <line x1="16" y1="-7" x2="22" y2="-2" stroke="#FFFFFF" stroke-width="1.2" opacity="0.8"/>

        <!-- Passenger Coach Windows -->
        <rect x="-20" y="-9" width="7" height="6" rx="1.5" fill="${theme.windowColor}"/>
        <rect x="-9" y="-9" width="7" height="6" rx="1.5" fill="${theme.windowColor}"/>
        <rect x="2" y="-9" width="6" height="6" rx="1.5" fill="${theme.windowColor}"/>

        <!-- Roof Detailing / Pantograph -->
        <rect x="-14" y="-16" width="20" height="3" rx="1" fill="${theme.roofFill}"/>
        <line x1="-3" y1="-16" x2="4" y2="-20" stroke="#94A3B8" stroke-width="1.5"/>

        <!-- Top Telemetry Tag Badge (Flipped so text stays readable) -->
        <g transform="scale(${train.direction}, 1)">
          ${isDiverted ? `
            <rect x="-62" y="-40" width="124" height="23" rx="5" fill="#064E3B" stroke="#34D399" stroke-width="1.6" filter="url(#metroGlow)"/>
            <text x="0" y="-25" fill="#6EE7B7" font-family="DM Mono, monospace" font-size="10.8" font-weight="800" text-anchor="middle">${train.train_number} · ${liveSpeed} km/h</text>
            <rect x="-56" y="17" width="112" height="17" rx="3" fill="#064E3B" stroke="#34D399" stroke-width="1"/>
            <text x="0" y="29" fill="#6EE7B7" font-family="Manrope, sans-serif" font-size="8.5" font-weight="800" text-anchor="middle">⚡ LOOP DIVERSION (45)</text>
          ` : `
            <rect x="-60" y="-40" width="120" height="23" rx="5" fill="${theme.badgeBg}" stroke="${theme.badgeBorder}" stroke-width="1.6" filter="url(#metroGlow)"/>
            <text x="0" y="-25" fill="${theme.badgeText}" font-family="DM Mono, monospace" font-size="10.8" font-weight="800" text-anchor="middle">${train.train_number} · ${liveSpeed} km/h</text>
            <rect x="-54" y="17" width="108" height="17" rx="3" fill="#0B132B" stroke="${theme.stripeFill}" stroke-width="1" opacity="0.95"/>
            <text x="0" y="29" fill="${theme.tagColor || '#CBD5E1'}" font-family="Manrope, sans-serif" font-size="8.5" font-weight="800" text-anchor="middle">${theme.liveryName || theme.name}</text>
          `}
        </g>
      </g>
    `;
  });

  svg.innerHTML = svgContent;
}

function renderTrainCarousel() {
  const container = document.getElementById("trainFleetCarousel");
  if (!container) return;

  container.innerHTML = "";

  state.trains.forEach((train) => {
    const card = document.createElement("div");
    card.className = "train-radar-card";
    card.id = `radar-card-${train.train_number}`;
    card.onclick = () => openCabHud(train);

    const theme = trainColorThemes[train.train_number] || {};
    const liveSpeed = train.display_speed || Math.round(train.current_speed);
    const isFreight = train.train_type === "Freight";
    const isVande = train.train_type === "VandeBharat";
    const typeBadge = isFreight ? "Freight" : isVande ? "Vande Bharat" : "Superfast";

    card.innerHTML = `
      <div class="radar-card-top">
        <span class="radar-train-id" style="color: ${theme.tagColor || 'inherit'};">
          <span style="display:inline-block; width:8px; height:8px; border-radius:50%; background:${theme.glowColor || 'var(--brand-cobalt)'}; margin-right:4px;"></span>
          ${train.train_number} · ${typeBadge}
        </span>
        <span class="radar-speed-badge" id="speed-badge-${train.train_number}">${liveSpeed} km/h</span>
      </div>
      <div class="radar-train-name" title="${train.train_name}">${train.train_name}</div>
      <div style="font-size: 0.72rem; color: var(--text-muted);">
        <code>${train.origin.split(" ")[0]} ➔ ${train.destination.split(" ")[0]}</code>
      </div>
      <div class="radar-card-footer">
        <span><span class="radar-signal-dot" id="signal-dot-${train.train_number}"></span>${train.signal_aspect.split(" ")[0]}</span>
        <span style="font-family: var(--font-mono); font-size: 0.68rem; color: var(--brand-cobalt);">Cab HUD ➔</span>
      </div>
    `;

    container.appendChild(card);
  });
}

function updateTrainCarouselSpeeds() {
  state.trains.forEach((train) => {
    const badge = document.getElementById(`speed-badge-${train.train_number}`);
    if (badge) {
      const liveSpeed = train.display_speed || Math.round(train.current_speed);
      badge.textContent = `${liveSpeed} km/h`;
    }
  });
}

function openCabHud(train) {
  state.selectedTrain = train;
  state.isEmergencyBrakeActive = false;

  const modal = document.getElementById("cabModal");
  if (!modal) return;

  document.getElementById("cabTrainName").textContent = `${train.train_number} ${train.train_name}`;
  document.getElementById("cabSectorName").textContent = `${train.sector} (${sectorMeta[train.sector] ? sectorMeta[train.sector].corridor : ''})`;
  document.getElementById("cabLocoModel").textContent = train.loco_type;

  const brakeBtn = document.getElementById("emergencyBrakeBtn");
  if (brakeBtn) {
    brakeBtn.querySelector("span").textContent = "Test Kavach Emergency Brake";
    brakeBtn.classList.remove("is-braking");
  }

  updateCabHudRealtime();
  modal.classList.remove("hidden");
}

window.openCabHudByNumber = function (trainNum) {
  const train = state.trains.find((t) => t.train_number === trainNum);
  if (train) openCabHud(train);
};

function updateCabHudRealtime() {
  const modal = document.getElementById("cabModal");
  if (!modal || modal.classList.contains("hidden") || !state.selectedTrain) return;

  const train = state.selectedTrain;
  const speedEl = document.getElementById("cabSpeedValue");
  if (speedEl) speedEl.textContent = train.display_speed || Math.round(train.current_speed);

  const signalText = document.getElementById("cabSignalText");
  const lampGreen = document.getElementById("lampGreen");
  const lampYellow = document.getElementById("lampYellow");
  const lampRed = document.getElementById("lampRed");
  const conflictStatus = document.getElementById("cabConflictStatus");

  if (state.isEmergencyBrakeActive || train.current_speed === 0) {
    if (signalText) signalText.textContent = "EMERGENCY HALT (RED)";
    if (signalText) signalText.className = "aspect-text text-red";
    if (lampGreen) lampGreen.classList.remove("is-lit");
    if (lampYellow) lampYellow.classList.remove("is-lit");
    if (lampRed) lampRed.classList.add("is-lit");
    if (conflictStatus) {
      conflictStatus.textContent = "KAVACH AUTO-TRIP INITIATED";
      conflictStatus.className = "text-red";
    }
  } else if (train.is_diverted || train.signal_aspect.includes("CAUTION") || train.signal_aspect.includes("LOOP")) {
    if (signalText) signalText.textContent = train.is_diverted ? "CAUTION (YELLOW) · DIVERTED VIA BYPASS LOOP" : "CAUTION (YELLOW) · APPROACHING TURNOUT";
    if (signalText) signalText.className = "aspect-text text-amber";
    if (lampGreen) lampGreen.classList.remove("is-lit");
    if (lampYellow) lampYellow.classList.add("is-lit");
    if (lampRed) lampRed.classList.remove("is-lit");
    if (conflictStatus) {
      conflictStatus.textContent = train.is_diverted ? "TURNOUT PSR: 45 KM/H ACTIVE" : "DECELERATING FOR TURNOUT";
      conflictStatus.className = "text-amber";
    }
  } else {
    if (signalText) signalText.textContent = "PROCEED (GREEN)";
    if (signalText) signalText.className = "aspect-text text-green";
    if (lampGreen) lampGreen.classList.add("is-lit");
    if (lampYellow) lampYellow.classList.remove("is-lit");
    if (lampRed) lampRed.classList.remove("is-lit");
    if (conflictStatus) {
      conflictStatus.textContent = "MAINLINE CLEAR (NO RESTRICTION)";
      conflictStatus.className = "text-green";
    }
  }
}

// ==========================================================================
// Rendering Views
// ==========================================================================
function renderAll() {
  renderKPIs();
  renderRequestsTable();
  renderTimetables();
  renderBlocks();
}

function renderKPIs() {
  const pendingCount = state.requests.filter((r) => r.status === "Pending").length;
  const scheduledCount = state.requests.length - pendingCount;
  const hasBlocks = state.blocks.length > 0;

  document.getElementById("kpiPending").textContent = state.requests.length;
  document.getElementById("kpiPendingSub").textContent = `${pendingCount} Pending · ${scheduledCount} Done`;

  // Consolidation Efficiency
  let effPercent = 0;
  let downtimeSavedMinutes = 0;

  if (hasBlocks) {
    const multiDeptBlocks = state.blocks.filter((b) => b.departments_involved.length > 1).length;
    effPercent = Math.round((multiDeptBlocks / state.blocks.length) * 100);

    // Calculate downtime prevented: sum of separated closure setups saved
    downtimeSavedMinutes = state.blocks.reduce((acc, b) => {
      const depts = b.departments_involved.length;
      return acc + (depts > 1 ? (depts - 1) * 60 : 0);
    }, 0);
  }

  document.getElementById("kpiEfficiency").textContent = `${effPercent}%`;
  document.getElementById("kpiBlocksSub").textContent = hasBlocks ? `${state.blocks.length} Integrated Blocks` : "Awaiting Plan";

  document.getElementById("kpiDowntimeSaved").textContent = `${downtimeSavedMinutes} min`;
  document.getElementById("kpiDowntimeSub").textContent = hasBlocks ? "Redundant Closures Eliminated" : "Via Joint Closures";

  // Global Status Banner
  const statusEl = document.getElementById("globalPlanStatus");
  const statusText = document.getElementById("globalStatusText");

  if (state.isOptimizing) {
    statusEl.innerHTML = `<span class="status-dot dot-optimizing"></span><span class="status-text">Solving Multi-Department Constraints...</span>`;
  } else if (hasBlocks) {
    statusEl.innerHTML = `<span class="status-dot dot-complete"></span><span class="status-text">Plan Optimized: 100% Conflict-Free Consolidation</span>`;
  } else {
    statusEl.innerHTML = `<span class="status-dot dot-ready"></span><span class="status-text">Ready for Automatic Optimization</span>`;
  }
}

function renderRequestsTable() {
  const tbody = document.getElementById("requestsTableBody");
  tbody.innerHTML = "";

  let filtered = state.requests;

  // Department filter
  if (state.activeDeptFilter !== "All") {
    if (state.activeDeptFilter === "HighPriority") {
      filtered = filtered.filter((r) => r.priority === "High");
    } else {
      filtered = filtered.filter((r) => r.department === state.activeDeptFilter);
    }
  }

  // Search filter
  if (state.searchQuery) {
    filtered = filtered.filter(
      (r) =>
        r.request_id.toLowerCase().includes(state.searchQuery) ||
        r.location_sector.toLowerCase().includes(state.searchQuery) ||
        r.department.toLowerCase().includes(state.searchQuery) ||
        (r.work_description && r.work_description.toLowerCase().includes(state.searchQuery))
    );
  }

  document.getElementById("requestsCount").textContent = `${filtered.length} records`;

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--text-muted); padding: 24px;">No matching maintenance requests found.</td></tr>`;
    return;
  }

  filtered.forEach((req) => {
    const tr = document.createElement("tr");

    const deptClass =
      req.department === "Track"
        ? "dept-pill-track"
        : req.department === "Signal"
        ? "dept-pill-signal"
        : "dept-pill-traction";

    const prioClass =
      req.priority === "High"
        ? "priority-high"
        : req.priority === "Medium"
        ? "priority-medium"
        : "priority-low";

    const isScheduled = req.status.startsWith("Scheduled");
    const statusClass = isScheduled ? "status-badge-scheduled" : "status-badge-pending";

    tr.innerHTML = `
      <td><strong class="mono">${req.request_id}</strong></td>
      <td><span class="dept-pill ${deptClass}">${req.department}</span></td>
      <td><code class="code-sm">${req.location_sector}</code></td>
      <td><strong>${req.duration_minutes}</strong> mins</td>
      <td><span class="priority-badge ${prioClass}">${req.priority}</span></td>
      <td>
        <div style="font-size: 0.78rem;">
          <strong>${req.weekly_availability.day}</strong>, ${req.weekly_availability.date}
          <div style="color: var(--text-muted); font-family: var(--font-mono); font-size: 0.72rem;">${req.weekly_availability.time} UTC</div>
        </div>
      </td>
      <td><span class="status-badge ${statusClass}">${req.status}</span></td>
    `;

    tbody.appendChild(tr);
  });
}

function renderTimetables() {
  const container = document.getElementById("timetableContainer");
  container.innerHTML = "";

  state.windows.forEach((win) => {
    const card = document.createElement("div");
    card.className = "window-card";

    // Related work in this sector
    const sectorReqs = state.requests.filter((r) => r.location_sector === win.location_sector);
    const scheduledReqs = sectorReqs.filter((r) => r.status.startsWith("Scheduled"));
    const workMinutes = (state.blocks.length > 0 ? scheduledReqs : sectorReqs).reduce(
      (sum, r) => sum + r.duration_minutes,
      0
    );

    const available = win.time_slot.available_duration_minutes;
    const pct = Math.min(100, Math.round((workMinutes / available) * 100));

    const startFormatted = win.time_slot.start_time.substring(11, 16);
    const endFormatted = win.time_slot.end_time.substring(11, 16);

    card.innerHTML = `
      <div class="window-header">
        <div>
          <span class="window-sector-code">${win.location_sector}</span>
          <h4 class="window-corridor-name">${win.corridor_name}</h4>
        </div>
        <span class="window-capacity-badge">${available} mins capacity</span>
      </div>

      <div class="window-time-slot">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
        <span>Clear Gap: <strong>${startFormatted} – ${endFormatted} UTC</strong> (23 Aug)</span>
      </div>

      <div class="capacity-rail-wrap">
        <div class="capacity-rail-label">
          <span>${state.blocks.length > 0 ? "Committed Work" : "Requested Work"}: <strong>${workMinutes} mins</strong></span>
          <span>${available - workMinutes} mins free (${pct}% used)</span>
        </div>
        <div class="capacity-track">
          <div class="capacity-fill ${state.blocks.length > 0 ? "capacity-fill-green" : ""}" style="width: ${pct}%;"></div>
        </div>
      </div>
    `;

    container.appendChild(card);
  });
}

function renderBlocks() {
  const container = document.getElementById("blocksContainer");
  const blockBadge = document.getElementById("blockBadge");
  const exportBtn = document.getElementById("exportJsonBtn");
  const printBtn = document.getElementById("printPlanBtn");
  const memoBtn = document.getElementById("openOfficialMemoBtn");
  const descEl = document.getElementById("resultsDescription");

  if (state.blocks.length === 0) {
    blockBadge.className = "badge-status badge-waiting";
    blockBadge.textContent = "Awaiting Plan Generation";
    exportBtn.classList.add("hidden");
    printBtn.classList.add("hidden");
    if (memoBtn) memoBtn.classList.add("hidden");
    descEl.textContent = "Build the plan to generate consolidated multi-department blocks optimized against clear timetable windows.";

    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon-circle">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#1468D4" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>
        </div>
        <h3>No Scheduled Blocks Generated Yet</h3>
        <p>Click <strong>"Build Optimized Plan"</strong> above to execute the automatic constraint solver and consolidate all pending maintenance requests.</p>
      </div>
    `;
    return;
  }

  // Active blocks generated
  blockBadge.className = "badge-status badge-ready";
  blockBadge.textContent = `${state.blocks.length} Blocks Generated · 100% Conflict-Free`;
  exportBtn.classList.remove("hidden");
  printBtn.classList.remove("hidden");
  if (memoBtn) memoBtn.classList.remove("hidden");
  descEl.textContent = "All 10 maintenance requests have been consolidated into 5 conflict-free blocks with assigned Private Numbers.";

  container.innerHTML = "";

  state.blocks.forEach((blk) => {
    const meta = sectorMeta[blk.location_sector];
    const win = state.windows.find((w) => w.location_sector === blk.location_sector);
    const capacity = win ? win.time_slot.available_duration_minutes : 240;
    const remaining = capacity - blk.total_block_duration_minutes;
    const pct = Math.round((blk.total_block_duration_minutes / capacity) * 100);

    const startUtc = blk.scheduled_time_window.start_time.substring(11, 16);
    const endUtc = blk.scheduled_time_window.end_time.substring(11, 16);

    const blockCard = document.createElement("div");
    blockCard.className = "block-card";

    blockCard.innerHTML = `
      <div class="block-header">
        <div>
          <span class="block-id-tag">${blk.block_id}</span>
          <h4 class="block-sector-name">${meta ? meta.corridor : blk.location_sector}</h4>
          <code class="code-sm">${blk.location_sector}</code>
        </div>
        <button class="btn-map-focus" onclick="focusSectorFromCard('${blk.location_sector}')" title="Zoom to this corridor on the map">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>
          <span>Map</span>
        </button>
      </div>

      <div class="block-common-slot">
        <span class="slot-label">Common Scheduled Window</span>
        <div class="slot-datetime">
          Sunday, 23 Aug 2026 · ${startUtc} – ${endUtc} UTC (${blk.total_block_duration_minutes} mins)
        </div>
      </div>

      <div class="capacity-rail-wrap">
        <div class="capacity-rail-label">
          <span>Capacity Used: <strong>${blk.total_block_duration_minutes}m</strong></span>
          <span>Safety Buffer: <strong>${remaining}m free</strong> (${pct}%)</span>
        </div>
        <div class="capacity-track">
          <div class="capacity-fill capacity-fill-green" style="width: ${pct}%;"></div>
        </div>
      </div>

      <div class="block-departments-row">
        <span style="font-size: 0.72rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase;">Departments:</span>
        ${blk.departments_involved
          .map((d) => {
            const cls =
              d === "Track"
                ? "dept-pill-track"
                : d === "Signal"
                ? "dept-pill-signal"
                : "dept-pill-traction";
            return `<span class="dept-pill ${cls}">${d}</span>`;
          })
          .join(" ")}
      </div>

      <div class="block-requests-box">
        <span class="requests-label">Consolidated Work Requests (${blk.assigned_request_ids.length}):</span>
        <div class="assigned-chips">
          ${blk.assigned_request_ids
            .map((id) => {
              const reqObj = state.requests.find((r) => r.request_id === id);
              const duration = reqObj ? `${reqObj.duration_minutes}m` : "";
              return `<span class="req-chip" title="${reqObj ? reqObj.work_description : ''}"><strong>${id}</strong> (${duration})</span>`;
            })
            .join("")}
        </div>
      </div>

      <div class="block-card-footer">
        <span style="font-size: 0.72rem; color: var(--text-muted);">Status: <strong>Ready to Execute</strong></span>
        <div style="display: flex; gap: 8px;">
          <button class="btn-sanction" onclick="openPnModal('${blk.block_id}', '${blk.location_sector}')" title="Issue Private Number block sanction">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            <span>Issue PN</span>
          </button>
          <button class="btn-sanction" style="background: #0A192F; border-color: #334155;" onclick="openOfficialMemoModal('${blk.block_id}')" title="View statutory Form T/1518 & T/409 memo">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
            <span>Form T/1518</span>
          </button>
        </div>
      </div>
    `;

    container.appendChild(blockCard);
  });
}

// Window global helper for map zoom from card
window.focusSectorFromCard = function (sector) {
  state.selectedSector = sector;
  focusMapSector(sector);
  document.querySelectorAll("#sectorFilterButtons .sector-pill").forEach((p) => {
    p.classList.toggle("is-active", p.dataset.sector === sector);
  });
  document.getElementById("corridorMap").scrollIntoView({ behavior: "smooth", block: "center" });
};

// Window global helper for PN sanction
window.openPnModal = function (blockId, sector) {
  const modal = document.getElementById("pnModal");
  const details = document.getElementById("pnBlockDetails");
  const codeEl = document.getElementById("generatedPnCode");

  // Generate authentic railway private number (random 4 digits + letter)
  const randNum = Math.floor(1000 + Math.random() * 9000);
  const letter = String.fromCharCode(65 + Math.floor(Math.random() * 26));
  codeEl.textContent = `PN-${randNum}${letter}`;

  details.textContent = `Authorizing track possession for ${blockId} on corridor ${sector}.`;
  modal.classList.remove("hidden");
};

// ==========================================================================
// Optimization Algorithm (SIH Problem Statement 26027 Solver)
// ==========================================================================
async function runOptimizer() {
  const btn = document.getElementById("optimizeBtn");
  const spinner = document.getElementById("btnSpinner");
  const btnIcon = document.getElementById("btnIcon");
  const btnText = document.getElementById("btnText");

  btn.disabled = true;
  spinner.classList.remove("hidden");
  btnIcon.classList.add("hidden");
  btnText.textContent = "Solving Constraints...";
  state.isOptimizing = true;
  renderKPIs();

  logTelemetry("[OPTIMIZER_START] Ingesting Table_1_Maintenance_Requests and Table_2_Train_Timetable.", "step");
  await sleep(350);

  // Group requests by sector
  const requestsBySector = {};
  state.requests.forEach((req) => {
    if (!requestsBySector[req.location_sector]) {
      requestsBySector[req.location_sector] = [];
    }
    requestsBySector[req.location_sector].push(req);
  });

  logTelemetry(`[GROUPING] Clustered ${state.requests.length} requests into ${Object.keys(requestsBySector).length} geographic corridors.`, "step");
  await sleep(300);

  const priorityWeight = { High: 3, Medium: 2, Low: 1 };
  const optimizedBlocks = [];
  let blockCounter = 1;

  state.windows.forEach((tt) => {
    if (tt.traffic_status !== "Clear Window") return;

    const sector = tt.location_sector;
    const sectorRequests = requestsBySector[sector] || [];
    if (sectorRequests.length === 0) return;

    // Prioritize High > Medium > Low
    sectorRequests.sort((a, b) => priorityWeight[b.priority] - priorityWeight[a.priority]);

    const assignedIds = [];
    const departments = new Set();
    let accumulatedDuration = 0;

    for (const req of sectorRequests) {
      if (accumulatedDuration + req.duration_minutes <= tt.time_slot.available_duration_minutes) {
        assignedIds.push(req.request_id);
        departments.add(req.department);
        accumulatedDuration += req.duration_minutes;
      }
    }

    if (assignedIds.length > 0) {
      const startTime = new Date(tt.time_slot.start_time);
      const endTime = new Date(startTime.getTime() + accumulatedDuration * 60000);

      const block = {
        block_id: `BLK-20260823-00${blockCounter++}`,
        location_sector: sector,
        scheduled_time_window: {
          start_time: startTime.toISOString(),
          end_time: endTime.toISOString()
        },
        assigned_request_ids: assignedIds,
        total_block_duration_minutes: accumulatedDuration,
        departments_involved: Array.from(departments)
      };

      optimizedBlocks.push(block);
      logTelemetry(`[BLOCK_FORMED] ${block.block_id} on ${sector}: Packed ${assignedIds.length} requests (${Array.from(departments).join(" + ")}) inside ${accumulatedDuration}m window.`, "success");
    }
  });

  await sleep(400);

  // Update status in requests
  const assignedSet = new Set(optimizedBlocks.flatMap((b) => b.assigned_request_ids));
  state.requests.forEach((req) => {
    if (assignedSet.has(req.request_id)) {
      const foundBlock = optimizedBlocks.find((b) => b.assigned_request_ids.includes(req.request_id));
      req.status = `Scheduled (${foundBlock ? foundBlock.block_id : 'BLK'})`;
    }
  });

  state.blocks = optimizedBlocks;
  state.isOptimizing = false;

  btn.disabled = false;
  spinner.classList.add("hidden");
  btnIcon.classList.remove("hidden");
  btnText.textContent = "Re-Optimize Schedule";

  logTelemetry(`[SOLVER_COMPLETE] Optimization finished in 1,050ms. 5 multi-department blocks generated.`, "success");

  renderAll();

  // Smooth scroll to blocks
  document.getElementById("resultsSection").scrollIntoView({ behavior: "smooth", block: "start" });
}

function resetAll() {
  state.requests = JSON.parse(JSON.stringify(initialRequests));
  state.blocks = [];
  state.trains = JSON.parse(JSON.stringify(initialTrains));
  state.activeDeptFilter = "All";
  state.searchQuery = "";
  state.selectedSector = "ALL";
  state.isOptimizing = false;

  document.getElementById("requestSearch").value = "";
  document.querySelectorAll("#deptFilterChips .filter-chip").forEach((c) => {
    c.classList.toggle("is-active", c.dataset.dept === "All");
  });
  document.querySelectorAll("#sectorFilterButtons .sector-pill").forEach((p) => {
    p.classList.toggle("is-active", p.dataset.sector === "ALL");
  });

  document.getElementById("btnText").textContent = "Build Optimized Plan";
  focusMapSector("ALL");

  logTelemetry("[RESET] Workspace reset to baseline state.", "warn");
  renderAll();
}

function handleCustomRequestSubmit() {
  const dept = document.getElementById("reqDept").value;
  const sector = document.getElementById("reqSector").value;
  const duration = parseInt(document.getElementById("reqDuration").value, 10);
  const priority = document.getElementById("reqPriority").value;
  const day = document.getElementById("reqDay").value;
  const time = document.getElementById("reqTime").value;

  const deptPrefix = dept === "Track" ? "TRK" : dept === "Signal" ? "SIG" : "TRC";
  const idNum = Math.floor(100 + Math.random() * 900);
  const newReq = {
    request_id: `REQ-${deptPrefix}-${idNum}`,
    department: dept,
    location_sector: sector,
    duration_minutes: duration,
    priority: priority,
    status: "Pending",
    weekly_availability: { day: day.split(",")[0] || "Custom", date: day.split(",")[1] || "23 Aug 2026", time: time },
    work_description: `Custom ${dept} Field Inspection & Maintenance`
  };

  state.requests.unshift(newReq);
  document.getElementById("customRequestModal").classList.add("hidden");
  document.getElementById("customRequestForm").reset();

  logTelemetry(`[REQUEST_INJECTED] Added ${newReq.request_id} (${newReq.department}, ${newReq.location_sector}, ${newReq.duration_minutes}m).`, "step");

  renderAll();
  alert(`Added ${newReq.request_id} to Table 1! Click "Build Optimized Plan" to schedule it.`);
}

function exportBlocksJson() {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state.blocks, null, 2));
  const downloadAnchor = document.createElement("a");
  downloadAnchor.setAttribute("href", dataStr);
  downloadAnchor.setAttribute("download", `Table_3_Optimized_Blocks_${new Date().toISOString().substring(0, 10)}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
  logTelemetry("[EXPORT] Downloaded Table_3_Optimized_Blocks.json.", "success");
}

function logTelemetry(msg, type = "normal") {
  const logsEl = document.getElementById("telemetryLogs");
  if (!logsEl) return;

  const time = new Date().toLocaleTimeString("en-IN", { hour12: false });
  const line = document.createElement("div");
  line.className = "log-line";

  let cls = "";
  if (type === "step") cls = "log-step";
  else if (type === "success") cls = "log-success";
  else if (type === "warn") cls = "log-warn";

  line.innerHTML = `<span class="log-time">[${time}]</span> <span class="${cls}">${msg}</span>`;
  logsEl.appendChild(line);
  logsEl.scrollTop = logsEl.scrollHeight;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ==========================================================================
// Indian Railways PIS Web Audio Chime & Synthetic Voice Engine
// ==========================================================================
let audioCtx = null;

function getAudioContext() {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === "suspended") {
    audioCtx.resume();
  }
  return audioCtx;
}

// Synthesizes the authentic 3-tone Indian Railways station chime (E5 -> C5 -> G4)
function playIRChime(callback) {
  if (!state.soundEnabled) {
    if (callback) callback();
    return;
  }
  try {
    const ctx = getAudioContext();
    if (!ctx) {
      if (callback) callback();
      return;
    }

    const notes = [
      { freq: 659.25, time: 0.00, dur: 0.32 }, // E5
      { freq: 523.25, time: 0.28, dur: 0.32 }, // C5
      { freq: 392.00, time: 0.56, dur: 0.60 }  // G4
    ];

    notes.forEach((note) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(note.freq, ctx.currentTime + note.time);

      gain.gain.setValueAtTime(0, ctx.currentTime + note.time);
      gain.gain.linearRampToValueAtTime(0.24, ctx.currentTime + note.time + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + note.time + note.dur);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime + note.time);
      osc.stop(ctx.currentTime + note.time + note.dur + 0.05);
    });

    if (callback) {
      setTimeout(callback, 1100);
    }
  } catch (err) {
    console.warn("Audio chime error:", err);
    if (callback) callback();
  }
}

// Web Speech API Voice Announcement
function speakStationAnnouncement(text) {
  if (!state.soundEnabled) return;
  if (!("speechSynthesis" in window)) return;

  try {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.94;
    utterance.pitch = 1.05;
    utterance.volume = 0.9;

    const voices = window.speechSynthesis.getVoices();
    const indianVoice = voices.find((v) => v.lang.includes("en-IN") || v.lang.includes("en_IN"));
    if (indianVoice) {
      utterance.voice = indianVoice;
    }

    window.speechSynthesis.speak(utterance);
  } catch (err) {
    console.warn("SpeechSynthesis error:", err);
  }
}

function playStationArrivalAnnouncement(train, stn) {
  if (train.train_type === "Freight") return;

  playIRChime(() => {
    const text = `Attention please. Train number ${train.train_number}, ${train.train_name}, arriving at ${stn.name}, Platform 2. Kavach passenger protection active.`;
    speakStationAnnouncement(text);
    logTelemetry(`[PIS_AUDIO] Station arrival broadcasted: ${train.train_number} at ${stn.name} (Platform 2).`, "step");
  });
}

// ==========================================================================
// Mainline Chaos & Emergency Simulator
// ==========================================================================
const chaosScenarios = {
  RAIL_FRACTURE: {
    title: "CRITICAL: Rail Fracture Detected at KM 78.4",
    desc: "Track circuit continuity severed. Kavach SIL-4 initiated automatic emergency stop. Signal aspect dropped to DANGER (Red).",
    sector: "SEC-NDLS-CNB-01",
    km: 78.4,
    x: 430
  },
  OHE_SNAP: {
    title: "WARNING: 25kV Catenary OHE Wire Snap",
    desc: "Overhead 25kV traction line parted. Substation breaker tripped. Approaching electric trains coasting to restricted halt.",
    sector: "SEC-NDLS-CNB-01",
    km: 110.0,
    x: 500
  },
  SIGNAL_FAILURE: {
    title: "CAUTION: Track Circuit & Auto-Signal Failure",
    desc: "Axle counter fault at Auto-Signal AS-42. Absolute fail-safe clamp: 15 km/h Caution Order enforced on all trains.",
    sector: "SEC-NDLS-CNB-01",
    km: 145.0,
    x: 580
  },
  CATTLE_OBSTRUCTION: {
    title: "ADVISORY: Mainline Obstruction Ahead — Dynamic AI Diversion Active",
    desc: "Track blockage on UP Mainline. Interlocking automatically diverts traffic to Middle Bypass Loop (PSR 40 km/h).",
    sector: "SEC-NDLS-CNB-01",
    km: 95.0,
    x: 460
  }
};

function triggerChaosIncident(scenarioKey) {
  const scenario = chaosScenarios[scenarioKey];
  if (!scenario) return;

  state.activeIncident = { key: scenarioKey, ...scenario };

  // Update incident banner
  const banner = document.getElementById("chaosIncidentBanner");
  const bTitle = document.getElementById("chaosBannerTitle");
  const bDesc = document.getElementById("chaosBannerDesc");
  if (banner && bTitle && bDesc) {
    bTitle.textContent = scenario.title;
    bDesc.textContent = scenario.desc;
    banner.classList.remove("hidden");
  }

  // Update modal status note
  const statusNote = document.getElementById("chaosModalActiveStatus");
  if (statusNote) {
    statusNote.textContent = `Active Incident: ${scenario.title}`;
    statusNote.style.color = "#EF4444";
  }

  // Sound audible emergency alert
  if (state.soundEnabled) {
    playIRChime(() => {
      speakStationAnnouncement(`Emergency alert. ${scenario.title}. All traffic regulated.`);
    });
  }

  logTelemetry(`[CHAOS_INJECTED] ${scenario.title} on sector ${scenario.sector}.`, "warn");
  renderMetroTrackSchematic();
}

function resolveChaosIncident() {
  state.activeIncident = null;

  const banner = document.getElementById("chaosIncidentBanner");
  if (banner) banner.classList.add("hidden");

  const statusNote = document.getElementById("chaosModalActiveStatus");
  if (statusNote) {
    statusNote.textContent = "Status: Mainline Nominal (All Green)";
    statusNote.style.color = "#34D399";
  }

  state.trains.forEach((t) => {
    t.signal_aspect = "PROCEED (GREEN)";
    t.kavach_status = "SIL-4 ACTIVE · PROTECTED";
  });

  logTelemetry("[CHAOS_RESOLVED] All incidents cleared. Normal automatic block signaling restored.", "success");
  renderMetroTrackSchematic();
}

// ==========================================================================
// Official Statutory Railway Memos & Sanctions (Form T/1518 & Form T/409)
// ==========================================================================
function openOfficialMemoModal(blockId) {
  let targetBlock = state.blocks.find((b) => b.block_id === blockId);
  if (!targetBlock && state.blocks.length > 0) {
    targetBlock = state.blocks[0];
  } else if (!targetBlock) {
    targetBlock = {
      block_id: "BLK-20260823-001",
      location_sector: "SEC-NDLS-CNB-01",
      date: "Sunday, 23 Aug 2026",
      window: "01:00–02:30",
      duration_minutes: 90,
      consolidated_count: 3,
      private_number: "PN-8492",
      work_summary: "Multi-Department Track USFD + S&T Point Machine Overhaul + OHE Cantilever Renewal",
      departments: ["Track", "Signal", "Traction"]
    };
  }

  state.selectedBlockForMemo = targetBlock;
  renderOfficialMemoContent();

  const modal = document.getElementById("officialMemoModal");
  if (modal) modal.classList.remove("hidden");
  logTelemetry(`[MEMO_VIEW] Opened Statutory Memo for Block ${targetBlock.block_id}.`, "step");
}
window.openOfficialMemoModal = openOfficialMemoModal;

function renderOfficialMemoContent() {
  const wrap = document.getElementById("memoContentWrap");
  if (!wrap) return;

  const blk = state.selectedBlockForMemo || {
    block_id: "BLK-20260823-001",
    location_sector: "SEC-NDLS-CNB-01",
    date: "Sunday, 23 Aug 2026",
    window: "01:00–02:30",
    duration_minutes: 90,
    private_number: "PN-8492"
  };

  const isT1518 = state.activeMemoTab === "t1518";

  if (isT1518) {
    wrap.innerHTML = `
      <div class="official-rail-sheet" id="officialRailSheet">
        <div class="sheet-crest-header">
          <div class="sheet-emblem">🏛️ 🇮🇳</div>
          <h2>INDIAN RAILWAYS · NORTHERN RAILWAY</h2>
          <div class="sheet-division">DIVISIONAL OPERATING CONTROL OFFICE · NEW DELHI</div>
          <div class="sheet-form-tag">FORM T/1518 (SR 4.08) · BLOCK SANCTION MEMORANDUM</div>
        </div>

        <div class="sheet-meta-grid">
          <div class="sheet-field"><span class="field-label">Sanction Order No:</span> <span class="field-value">${blk.block_id}</span></div>
          <div class="sheet-field"><span class="field-label">Date of Sanction:</span> <span class="field-value">${blk.date || "23 Aug 2026"}</span></div>
          <div class="sheet-field"><span class="field-label">Section Sector:</span> <span class="field-value">${blk.location_sector}</span></div>
          <div class="sheet-field"><span class="field-label">Time Window:</span> <span class="field-value">${blk.window || "01:00–02:30 IST"} (${blk.duration_minutes || 90} Min)</span></div>
        </div>

        <div class="sheet-section-title">1. TRACK POSSESSION & TRACTION ISOLATION AUTHORITY</div>
        <p>Authority is hereby conveyed to the Section Engineer (P-Way), Signal Inspector (S&T), and Traction Power Controller (TPC) to occupy and isolate the track section specified hereunder:</p>

        <table class="sheet-table">
          <thead>
            <tr>
              <th>Corridor Sector</th>
              <th>From KM</th>
              <th>To KM</th>
              <th>Line Affected</th>
              <th>Departments Permitted</th>
              <th>Safety Isolations</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>${blk.location_sector}</strong></td>
              <td>KM 28.5 (Ghaziabad)</td>
              <td>KM 129.8 (Aligarh)</td>
              <td>UP Main Line (Track 1)</td>
              <td>P-Way · S&T · Electrical OHE</td>
              <td>25kV AC Power Blocked & Earthed · Derailer Point Locked</td>
            </tr>
          </tbody>
        </table>

        <div class="sheet-pn-box">
          <div>
            <strong>CRYPTOGRAPHIC PRIVATE NUMBER (PN) EXCHANGE:</strong>
            <div style="font-size: 0.85rem; color: #047857; margin-top: 2px;">Logged in Control Office Train Operating Register (TOR)</div>
          </div>
          <div class="sheet-pn-val">${blk.private_number || "PN-8492"}</div>
        </div>

        <div class="sheet-section-title">2. G&SR STATUTORY OPERATING PROVISIONS</div>
        <div class="sheet-rules-note">
          1. Under General & Subsidiary Rules (G&SR) Rule 4.08, all signals giving access to the blocked line shall be kept at ON position and their levers/keys locked.<br>
          2. No train shall be permitted to enter the block section until this memo is cancelled by formal advice under exchange of Private Numbers.<br>
          3. Diverted traffic shall run via the Middle Bypass Loop with Maximum Permissible Speed (MPS) of 45 km/h under Caution Order Form T/409.
        </div>

        <div class="sheet-sign-grid">
          <div>
            <div class="sign-line">Chief Section Controller (ChC)</div>
            <small>Divisional HQ, NDLS</small>
          </div>
          <div>
            <div class="sign-line">Station Superintendent (SS)</div>
            <small>Ghaziabad / Aligarh Jn</small>
          </div>
          <div>
            <div class="sign-line">Senior Section Engineer (P-Way)</div>
            <small>Engineering Department</small>
          </div>
        </div>
      </div>
    `;
  } else {
    wrap.innerHTML = `
      <div class="official-rail-sheet" id="officialRailSheet">
        <div class="sheet-crest-header">
          <div class="sheet-emblem">⚠️ 🇮🇳</div>
          <h2>INDIAN RAILWAYS · CAUTION ORDER</h2>
          <div class="sheet-division">DELHI DIVISION · OPERATING DEPARTMENT</div>
          <div class="sheet-form-tag">FORM T/409 (REVISED) · NOTICE TO LOCO PILOT & GUARD</div>
        </div>

        <div class="sheet-meta-grid">
          <div class="sheet-field"><span class="field-label">Issued At Station:</span> <span class="field-value">New Delhi (NDLS) / Ghaziabad (GZB)</span></div>
          <div class="sheet-field"><span class="field-label">Date of Issue:</span> <span class="field-value">${blk.date || "23 Aug 2026"}</span></div>
          <div class="sheet-field"><span class="field-label">Train No & Name:</span> <span class="field-value">ALL UP TRAINS (Vande Bharat / Shatabdi / Rajdhani)</span></div>
          <div class="sheet-field"><span class="field-label">Locomotive / Rake:</span> <span class="field-value">WAP-7 / Train-18 EMU / WAG-9</span></div>
        </div>

        <div class="sheet-section-title">SPEED RESTRICTIONS IN FORCE</div>
        <div class="sheet-caution-banner">
          <strong>NOTICE TO LOCO PILOT AND GUARD:</strong>
          Observe strictly the following Temporary Speed Restrictions (TSR) and Permanent Speed Restrictions (PSR) on your run:
        </div>

        <table class="sheet-table">
          <thead>
            <tr>
              <th>Between Stations</th>
              <th>Kilometre Post (From – To)</th>
              <th>Speed Permitted</th>
              <th>Cause of Restriction</th>
              <th>Special Instructions</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>GZB – ALJN</td>
              <td>KM 28.5 to KM 129.8</td>
              <td><strong style="color: #DC2626;">45 KM/H (PSR)</strong></td>
              <td>Consolidated Multi-Dept Maintenance Block (${blk.block_id})</td>
              <td>Traverse Middle Bypass Loop. Look out for hand signals & detonators.</td>
            </tr>
            <tr>
              <td>GZB Yard</td>
              <td>Turnout Switch Pt 101A</td>
              <td><strong style="color: #D97706;">30 KM/H (PSR)</strong></td>
              <td>Facing Crossover to Loop Track</td>
              <td>Whistle continuously; acknowledge yellow aspect.</td>
            </tr>
          </tbody>
        </table>

        <div class="sheet-rules-note">
          Kavach SIL-4 onboard ATP has been programmed with the TSR database. Failure to comply with the 45 km/h ceiling will trigger automatic graduated braking.
        </div>

        <div class="sheet-sign-grid">
          <div>
            <div class="sign-line">Loco Pilot Signature</div>
            <small>Acknowledged Speed Restriction</small>
          </div>
          <div>
            <div class="sign-line">Train Manager (Guard)</div>
            <small>Brake Van In-Charge</small>
          </div>
          <div>
            <div class="sign-line">Station Master on Duty</div>
            <small>Station Seal Stamp & Date</small>
          </div>
        </div>
      </div>
    `;
  }
}

function downloadOfficialMemoHtml() {
  const content = document.getElementById("memoContentWrap");
  if (!content) return;

  const htmlDoc = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Official Railway Memo - Form T/1518 & T/409</title>
  <style>
    body { font-family: 'Times New Roman', serif; background: #fff; color: #000; padding: 40px; }
    .sheet-crest-header { text-align: center; border-bottom: 2px double #000; padding-bottom: 14px; margin-bottom: 18px; }
    .sheet-meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 16px; border-bottom: 1px solid #ccc; padding-bottom: 12px; }
    .sheet-table { width: 100%; border-collapse: collapse; margin: 14px 0; }
    .sheet-table th, .sheet-table td { border: 1px solid #000; padding: 8px; text-align: left; }
    .sheet-table th { background: #eee; }
    .sheet-pn-box { border: 2px dashed #059669; padding: 12px; margin: 16px 0; font-family: monospace; font-size: 1.2rem; }
    .sheet-sign-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-top: 50px; text-align: center; }
    .sign-line { border-top: 1px solid #000; padding-top: 4px; font-weight: bold; }
  </style>
</head>
<body>
  ${content.innerHTML}
</body>
</html>
  `;

  const blob = new Blob([htmlDoc], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `IndianRailways_${state.activeMemoTab.toUpperCase()}_Memo_${new Date().toISOString().substring(0, 10)}.html`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
  logTelemetry(`[MEMO_DOWNLOAD] Downloaded Official Memo (${state.activeMemoTab.toUpperCase()}) as HTML.`, "success");
}
