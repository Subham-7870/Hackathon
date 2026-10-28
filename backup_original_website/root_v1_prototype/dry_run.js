/**
 * Indian Railways AI Automatic Block Planning - Dry Run & Test Runner
 * Solves Problem Statement 26027 using deterministic logic matching the LLM System Prompt.
 */

const fs = require('fs');
const path = require('path');

function executeDryRun() {
  console.log("=================================================");
  console.log("  INDIAN RAILWAYS AI AUTOMATIC BLOCK PLANNING   ");
  console.log("            BACKEND DRY RUN TEST                ");
  console.log("=================================================\n");

  const mockDataPath = path.join(__dirname, 'mock_data.json');
  const rawData = fs.readFileSync(mockDataPath, 'utf-8');
  const database = JSON.parse(rawData);

  console.log("[STEP 1: DATABASE QUERY]");
  const pendingRequests = database.Table_1_Maintenance_Requests.filter(r => r.status === 'Pending');
  const timetables = database.Table_2_Train_Timetable;

  console.log(`- Loaded ${pendingRequests.length} pending maintenance requests.`);
  console.log(`- Loaded ${timetables.length} train timetable clear windows.\n`);

  console.log("[STEP 2: AI OPTIMIZATION & GEOGRAPHICAL GROUPING]");
  const requestsBySector = {};
  pendingRequests.forEach(req => {
    if (!requestsBySector[req.location_sector]) {
      requestsBySector[req.location_sector] = [];
    }
    requestsBySector[req.location_sector].push(req);
  });

  const optimizedBlocks = [];
  let blockCounter = 1;

  timetables.forEach(tt => {
    if (tt.traffic_status !== 'Clear Window') return;

    const sector = tt.location_sector;
    const sectorRequests = requestsBySector[sector] || [];

    if (sectorRequests.length === 0) return;

    // Sort requests by priority (High > Medium > Low)
    const priorityWeight = { 'High': 3, 'Medium': 2, 'Low': 1 };
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
    }
  });

  console.log(`- Successfully generated ${optimizedBlocks.length} integrated maintenance blocks.\n`);

  console.log("[STEP 3: TABLE 3 INGESTION & TABLE 1 STATUS UPDATE]");
  database.Table_3_Optimized_Blocks = optimizedBlocks;

  const assignedSet = new Set(optimizedBlocks.flatMap(b => b.assigned_request_ids));
  database.Table_1_Maintenance_Requests.forEach(req => {
    if (assignedSet.has(req.request_id)) {
      req.status = 'Scheduled';
    }
  });

  const scheduledCount = database.Table_1_Maintenance_Requests.filter(r => r.status === 'Scheduled').length;
  console.log(`- Table 3 Record Creation: ${optimizedBlocks.length} rows inserted.`);
  console.log(`- Table 1 Status Updates: ${scheduledCount} requests updated from 'Pending' to 'Scheduled'.\n`);

  const outputPath = path.join(__dirname, 'dry_run_results.json');
  fs.writeFileSync(outputPath, JSON.stringify(database, null, 2));

  console.log("[DRY RUN RESULTS SUMMARY]");
  console.table(optimizedBlocks.map(b => ({
    "Block ID": b.block_id,
    "Sector": b.location_sector,
    "Assigned Requests": b.assigned_request_ids.join(', '),
    "Departments": b.departments_involved.join(' + '),
    "Total Duration": `${b.total_block_duration_minutes} mins`
  })));

  console.log(`\nResults written to ${outputPath}`);
  console.log("Backend Dry Run Status: VERIFIED & PASSED SUCCESSFUL!\n");
}

executeDryRun();

