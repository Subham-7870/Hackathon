// Antigravity AI Block Planning Dashboard Logic

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

document.addEventListener('DOMContentLoaded', () => {
  renderTable1();
  setupEventListeners();
});

function renderTable1() {
  const tbody = document.getElementById('requestsTableBody');
  tbody.innerHTML = '';

  mockState.requests.forEach(req => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><strong>${req.request_id}</strong></td>
      <td><span class="dept-tag dept-${req.department}">${req.department}</span></td>
      <td>${req.location_sector}</td>
      <td>${req.duration_minutes} mins</td>
      <td>${req.priority}</td>
      <td><span class="status-${req.status}">${req.status}</span></td>
    `;
    tbody.appendChild(tr);
  });

  const pendingCount = mockState.requests.filter(r => r.status === 'Pending').length;
  document.getElementById('statPending').textContent = pendingCount;
  document.getElementById('statBlocks').textContent = mockState.blocks.length;

  if (mockState.blocks.length > 0) {
    const multiDeptCount = mockState.blocks.filter(b => b.departments_involved.length > 1).length;
    const eff = Math.round((multiDeptCount / mockState.blocks.length) * 100);
    document.getElementById('statEfficiency').textContent = `${eff}%`;
  } else {
    document.getElementById('statEfficiency').textContent = `0%`;
  }
}

function setupEventListeners() {
  const optimizeBtn = document.getElementById('optimizeBtn');
  const resetBtn = document.getElementById('resetBtn');

  optimizeBtn.addEventListener('click', runOptimizationWorkflow);
  resetBtn.addEventListener('click', () => {
    mockState.requests.forEach(r => r.status = 'Pending');
    mockState.blocks = [];
    document.getElementById('blocksContainer').innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">🚆</div>
        <h3>No Scheduled Blocks Generated Yet</h3>
        <p>Click "Optimize Schedule" above to run the AI grouping model on pending requests.</p>
      </div>`;
    document.getElementById('blockBadge').className = 'badge badge-warning';
    document.getElementById('blockBadge').textContent = 'Awaiting Optimization';
    document.getElementById('executionConsole').classList.add('hidden');
    renderTable1();
  });
}

function logConsole(msg) {
  const consoleLogs = document.getElementById('consoleLogs');
  const time = new Date().toLocaleTimeString();
  consoleLogs.innerHTML += `<div>[${time}] ${msg}</div>`;
  consoleLogs.scrollTop = consoleLogs.scrollHeight;
}

async function runOptimizationWorkflow() {
  const btn = document.getElementById('optimizeBtn');
  const spinner = document.getElementById('btnSpinner');
  const consoleBox = document.getElementById('executionConsole');

  btn.disabled = true;
  spinner.classList.remove('hidden');
  consoleBox.classList.remove('hidden');
  document.getElementById('consoleLogs').innerHTML = '';

  logConsole('Starting Antigravity AI Webhook Trigger...');
  await sleep(600);

  logConsole('Querying Table_1_Maintenance_Requests WHERE status = "Pending"...');
  const pending = mockState.requests.filter(r => r.status === 'Pending');
  logConsole(`Retrieved ${pending.length} pending tasks from 3 departments.`);
  await sleep(800);

  logConsole('Dispatching HTTP POST to Gemini API Endpoint...');
  logConsole('Applying Structured Output Schema matching Table_3_Optimized_Blocks...');
  await sleep(1000);

  logConsole('Response Received! Parsing JSON output array...');
  
  // Generate optimization results
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

  mockState.blocks = generatedBlocks;

  logConsole('Executing Create Records in Table_3_Optimized_Blocks (5 rows created).');
  logConsole('Updating Table_1_Maintenance_Requests status -> "Scheduled" (10 rows updated).');
  await sleep(600);

  mockState.requests.forEach(r => r.status = 'Scheduled');
  renderTable1();
  renderBlocks();

  document.getElementById('blockBadge').className = 'badge badge-success';
  document.getElementById('blockBadge').textContent = '5 Blocks Scheduled (AI Optimized)';

  btn.disabled = false;
  spinner.classList.add('hidden');
  logConsole('✨ Optimization Completed Successfully!');
}

function renderBlocks() {
  const container = document.getElementById('blocksContainer');
  container.innerHTML = '';

  mockState.blocks.forEach(block => {
    const card = document.createElement('div');
    card.className = 'block-card';

    const deptsHtml = block.departments_involved
      .map(d => `<span class="dept-tag dept-${d}">${d}</span>`)
      .join(' ');

    const reqsHtml = block.assigned_request_ids
      .map(id => `<span class="req-pill">${id}</span>`)
      .join(' ');

    card.innerHTML = `
      <div class="block-title">
        <span>${block.block_id} (${block.location_sector})</span>
        <span style="color: var(--accent-green)">${block.total_block_duration_minutes} Mins Block</span>
      </div>
      <div class="block-meta">
        ⏱️ Window: ${new Date(block.scheduled_time_window.start_time).toUTCString().slice(17, 22)} - ${new Date(block.scheduled_time_window.end_time).toUTCString().slice(17, 22)} UTC
      </div>
      <div class="block-meta">
        <strong>Departments Consolidated:</strong> ${deptsHtml}
      </div>
      <div class="block-reqs">
        <strong style="font-size: 11px; width: 100%;">Assigned Requests:</strong>
        ${reqsHtml}
      </div>
    `;

    container.appendChild(card);
  });
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

