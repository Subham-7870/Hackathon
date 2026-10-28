const mockState = {
  requests: [
    { request_id: "REQ-TRK-001", department: "Track", location_sector: "SEC-NDLS-CNB-01", duration_minutes: 60, priority: "High", status: "Pending" },
    { request_id: "REQ-SIG-001", department: "Signal", location_sector: "SEC-NDLS-CNB-01", duration_minutes: 45, priority: "High", status: "Pending" },
    { request_id: "REQ-TRC-001", department: "Traction", location_sector: "SEC-NDLS-CNB-01", duration_minutes: 60, priority: "Medium", status: "Pending" },
    { request_id: "REQ-TRK-002", department: "Track", location_sector: "SEC-HWH-BWN-02", duration_minutes: 90, priority: "High", status: "Pending" },
    { request_id: "REQ-TRC-002", department: "Traction", location_sector: "SEC-HWH-BWN-02", duration_minutes: 75, priority: "High", status: "Pending" },
    { request_id: "REQ-SIG-002", department: "Signal", location_sector: "SEC-BCT-BRC-03", duration_minutes: 60, priority: "Medium", status: "Pending" },
    { request_id: "REQ-TRK-003", department: "Track", location_sector: "SEC-BCT-BRC-03", duration_minutes: 120, priority: "Medium", status: "Pending" },
    { request_id: "REQ-TRC-003", department: "Traction", location_sector: "SEC-MAS-BZA-01", duration_minutes: 45, priority: "Low", status: "Pending" },
    { request_id: "REQ-SIG-003", department: "Signal", location_sector: "SEC-MAS-BZA-01", duration_minutes: 30, priority: "Low", status: "Pending" },
    { request_id: "REQ-TRK-004", department: "Track", location_sector: "SEC-SBC-MYS-01", duration_minutes: 60, priority: "Low", status: "Pending" }
  ],
  timetables: [
    { timetable_id: "TT-001", location_sector: "SEC-NDLS-CNB-01", time_slot: { start_time: "2026-08-23T01:00:00Z", end_time: "2026-08-23T05:00:00Z", available_duration_minutes: 240 }, traffic_status: "Clear Window" },
    { timetable_id: "TT-002", location_sector: "SEC-HWH-BWN-02", time_slot: { start_time: "2026-08-23T00:30:00Z", end_time: "2026-08-23T04:00:00Z", available_duration_minutes: 210 }, traffic_status: "Clear Window" },
    { timetable_id: "TT-003", location_sector: "SEC-BCT-BRC-03", time_slot: { start_time: "2026-08-23T02:00:00Z", end_time: "2026-08-23T05:30:00Z", available_duration_minutes: 210 }, traffic_status: "Clear Window" },
    { timetable_id: "TT-004", location_sector: "SEC-MAS-BZA-01", time_slot: { start_time: "2026-08-23T01:30:00Z", end_time: "2026-08-23T03:30:00Z", available_duration_minutes: 120 }, traffic_status: "Clear Window" },
    { timetable_id: "TT-005", location_sector: "SEC-SBC-MYS-01", time_slot: { start_time: "2026-08-23T02:00:00Z", end_time: "2026-08-23T04:00:00Z", available_duration_minutes: 120 }, traffic_status: "Clear Window" }
  ],
  blocks: []
};

let activeDepartment = "All";

const generatedBlocks = [
  {
    block_id: "BLK-20260823-001",
    location_sector: "SEC-NDLS-CNB-01",
    scheduled_time_window: { start_time: "2026-08-23T01:00:00Z", end_time: "2026-08-23T03:45:00Z" },
    assigned_request_ids: ["REQ-TRK-001", "REQ-SIG-001", "REQ-TRC-001"],
    total_block_duration_minutes: 165,
    departments_involved: ["Track", "Signal", "Traction"]
  },
  {
    block_id: "BLK-20260823-002",
    location_sector: "SEC-HWH-BWN-02",
    scheduled_time_window: { start_time: "2026-08-23T00:30:00Z", end_time: "2026-08-23T03:15:00Z" },
    assigned_request_ids: ["REQ-TRK-002", "REQ-TRC-002"],
    total_block_duration_minutes: 165,
    departments_involved: ["Track", "Traction"]
  },
  {
    block_id: "BLK-20260823-003",
    location_sector: "SEC-BCT-BRC-03",
    scheduled_time_window: { start_time: "2026-08-23T02:00:00Z", end_time: "2026-08-23T05:00:00Z" },
    assigned_request_ids: ["REQ-SIG-002", "REQ-TRK-003"],
    total_block_duration_minutes: 180,
    departments_involved: ["Signal", "Track"]
  },
  {
    block_id: "BLK-20260823-004",
    location_sector: "SEC-MAS-BZA-01",
    scheduled_time_window: { start_time: "2026-08-23T01:30:00Z", end_time: "2026-08-23T02:45:00Z" },
    assigned_request_ids: ["REQ-TRC-003", "REQ-SIG-003"],
    total_block_duration_minutes: 75,
    departments_involved: ["Traction", "Signal"]
  },
  {
    block_id: "BLK-20260823-005",
    location_sector: "SEC-SBC-MYS-01",
    scheduled_time_window: { start_time: "2026-08-23T02:00:00Z", end_time: "2026-08-23T03:00:00Z" },
    assigned_request_ids: ["REQ-TRK-004"],
    total_block_duration_minutes: 60,
    departments_involved: ["Track"]
  }
];

document.addEventListener("DOMContentLoaded", () => {
  renderWorkspace();
  setupEventListeners();
});

function setupEventListeners() {
  document.getElementById("optimizeBtn").addEventListener("click", runOptimizationWorkflow);
  document.getElementById("resetBtn").addEventListener("click", resetPlan);

  document.querySelectorAll(".filter-chip").forEach((button) => {
    button.addEventListener("click", () => {
      activeDepartment = button.dataset.department;
      document.querySelectorAll(".filter-chip").forEach((chip) => {
        chip.classList.toggle("is-active", chip === button);
      });
      renderTable1();
    });
  });
}

function renderWorkspace() {
  renderTable1();
  renderTimetable();
  renderSummary();
  renderBlocks();
}

function renderSummary() {
  const pendingCount = mockState.requests.filter((request) => request.status === "Pending").length;
  const scheduledCount = mockState.requests.length - pendingCount;
  const departmentCount = new Set(mockState.requests.map((request) => request.department)).size;
  const hasPlan = mockState.blocks.length > 0;

  document.getElementById("statPending").textContent = pendingCount;
  document.getElementById("pendingHelper").textContent = hasPlan
    ? `${scheduledCount} requests assigned to a block`
    : "Awaiting coordination";
  document.getElementById("statWindows").textContent = mockState.timetables.length;
  document.getElementById("statDepartments").textContent = departmentCount;
  document.getElementById("statBlocks").textContent = hasPlan ? `${mockState.blocks.length} blocks` : "Not built";
  document.getElementById("planHelper").textContent = hasPlan
    ? `${scheduledCount} requests coordinated`
    : "Build a plan to see the outcome";
}

function renderTable1() {
  const tbody = document.getElementById("requestsTableBody");
  const filteredRequests = activeDepartment === "All"
    ? mockState.requests
    : mockState.requests.filter((request) => request.department === activeDepartment);

  tbody.innerHTML = filteredRequests.map((request) => `
    <tr>
      <td><span class="request-id">${request.request_id}</span></td>
      <td><span class="dept-tag dept-${request.department}">${request.department}</span></td>
      <td><span class="sector-code">${request.location_sector}</span></td>
      <td>${request.duration_minutes} min</td>
      <td><span class="priority-tag priority-${request.priority}">${request.priority}</span></td>
      <td><span class="status-tag status-${request.status}">${request.status}</span></td>
    </tr>
  `).join("");

  const label = activeDepartment === "All"
    ? `${filteredRequests.length} records`
    : `${filteredRequests.length} ${activeDepartment.toLowerCase()} records`;
  document.getElementById("requestsCount").textContent = label;
}

function renderTimetable() {
  const container = document.getElementById("timetableContainer");

  container.innerHTML = mockState.timetables.map((window) => {
    const relatedRequests = mockState.requests.filter((request) => request.location_sector === window.location_sector);
    const totalRequestMinutes = relatedRequests.reduce((total, request) => total + request.duration_minutes, 0);
    const plannedBlock = mockState.blocks.find((block) => block.location_sector === window.location_sector);
    const statusText = plannedBlock
      ? `Plan uses ${plannedBlock.total_block_duration_minutes} min · ${window.time_slot.available_duration_minutes - plannedBlock.total_block_duration_minutes} min remaining`
      : `${relatedRequests.length} related requests · ${totalRequestMinutes} min of work`;

    return `
      <div class="window-card">
        <div class="window-topline">
          <span class="window-sector">${window.location_sector}</span>
          <span class="window-id">${window.timetable_id}</span>
        </div>
        <div class="window-meta">
          <time>${formatTime(window.time_slot.start_time)} – ${formatTime(window.time_slot.end_time)} UTC</time>
          <span class="window-separator" aria-hidden="true"></span>
          <span>Clear window</span>
        </div>
        <div class="window-capacity">
          <span>Available closure capacity</span>
          <strong>${window.time_slot.available_duration_minutes} min</strong>
        </div>
        <p class="window-associated">${statusText}</p>
      </div>
    `;
  }).join("");
}

function renderBlocks() {
  const container = document.getElementById("blocksContainer");
  const badge = document.getElementById("blockBadge");
  const description = document.getElementById("resultsDescription");

  if (mockState.blocks.length === 0) {
    badge.className = "result-badge result-badge-waiting";
    badge.textContent = "Awaiting plan";
    description.textContent = "Build the plan to see how work can be combined within each clear timetable window.";
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-mark" aria-hidden="true">01</div>
        <h3>Your recommended blocks will appear here.</h3>
        <p>The plan will show the sector, chosen time window, available capacity and coordinated teams for every block.</p>
      </div>
    `;
    return;
  }

  const multiDepartmentBlocks = mockState.blocks.filter((block) => block.departments_involved.length > 1).length;
  badge.className = "result-badge result-badge-success";
  badge.textContent = `${mockState.blocks.length} blocks ready`;
  description.textContent = `${multiDepartmentBlocks} blocks combine work across departments while remaining inside the available timetable capacity.`;

  container.innerHTML = `<div class="block-grid">${mockState.blocks.map((block) => buildBlockCard(block)).join("")}</div>`;
}

function buildBlockCard(block) {
  const timetable = mockState.timetables.find((window) => window.location_sector === block.location_sector);
  const availableCapacity = timetable.time_slot.available_duration_minutes;
  const utilization = Math.round((block.total_block_duration_minutes / availableCapacity) * 100);
  const remainingCapacity = availableCapacity - block.total_block_duration_minutes;
  const departments = block.departments_involved
    .map((department) => `<span class="dept-tag dept-${department}">${department}</span>`)
    .join("");
  const requests = block.assigned_request_ids
    .map((requestId) => `<span class="req-pill">${requestId}</span>`)
    .join("");

  return `
    <article class="block-card">
      <div class="block-heading">
        <div>
          <div class="block-topline">
            <span class="block-id">${block.block_id}</span>
          </div>
          <p class="block-sector">${block.location_sector}</p>
        </div>
        <span class="block-duration">${block.total_block_duration_minutes} min block</span>
      </div>
      <div class="block-meta-row">
        <span class="meta-label">Scheduled</span>
        <time>${formatTime(block.scheduled_time_window.start_time)} – ${formatTime(block.scheduled_time_window.end_time)} UTC</time>
      </div>
      <div class="capacity-wrap">
        <div class="capacity-label">
          <span>Closure capacity used</span>
          <strong>${block.total_block_duration_minutes} / ${availableCapacity} min · ${remainingCapacity} min free</strong>
        </div>
        <div class="capacity-track" aria-label="${utilization}% of the closure capacity is used">
          <div class="capacity-fill" style="width: ${utilization}%"></div>
        </div>
      </div>
      <div class="block-bottom">
        <div>
          <span class="block-bottom-label">Coordinated teams</span>
          <div class="dept-list">${departments}</div>
        </div>
        <div>
          <span class="block-bottom-label">Included requests</span>
          <div class="request-list">${requests}</div>
        </div>
      </div>
    </article>
  `;
}

async function runOptimizationWorkflow() {
  if (mockState.blocks.length > 0) return;

  const button = document.getElementById("optimizeBtn");
  const spinner = document.getElementById("btnSpinner");
  const buttonText = document.getElementById("btnText");
  const planState = document.getElementById("planState");

  button.disabled = true;
  spinner.classList.remove("hidden");
  buttonText.textContent = "Building your plan…";
  planState.classList.add("is-working");
  planState.lastElementChild.textContent = "Checking inputs and clear windows";

  await sleep(850);

  mockState.blocks = generatedBlocks.map((block) => ({ ...block }));
  mockState.requests.forEach((request) => {
    request.status = "Scheduled";
  });

  renderWorkspace();
  planState.classList.remove("is-working");
  planState.lastElementChild.textContent = `Plan ready · ${mockState.blocks.length} coordinated blocks`;
  buttonText.textContent = "Plan created";
  spinner.classList.add("hidden");
  button.disabled = false;
}

function resetPlan() {
  mockState.blocks = [];
  mockState.requests.forEach((request) => {
    request.status = "Pending";
  });

  const button = document.getElementById("optimizeBtn");
  const buttonText = document.getElementById("btnText");
  const planState = document.getElementById("planState");

  button.disabled = false;
  buttonText.textContent = "Build optimized plan";
  planState.classList.remove("is-working");
  planState.lastElementChild.textContent = "Ready to plan";
  renderWorkspace();
}

function formatTime(timestamp) {
  return new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "UTC"
  }).format(new Date(timestamp));
}

function sleep(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}
