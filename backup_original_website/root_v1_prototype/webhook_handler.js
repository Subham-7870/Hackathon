/**
 * Indian Railways AI Automatic Block Planning Webhook Handler
 * 
 * Demonstrates the 4-step workflow connecting Antigravity to Gemini API:
 * 1. Fetch pending requests from Table 1 & timetable from Table 2
 * 2. Construct Gemini API POST request payload with Structured Output Schema
 * 3. Execute HTTP POST request to Gemini REST API
 * 4. Parse response, ingest into Table_3_Optimized_Blocks, and update Table_1 status to 'Scheduled'
 */

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "YOUR_GOOGLE_AI_STUDIO_API_KEY";
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

async function runOptimizationWorkflow(database) {
  console.log("=== STEP 1: Querying Database Tables ===");
  
  // 1. Filter Table 1 for Pending requests
  const pendingRequests = database.Table_1_Maintenance_Requests.filter(
    (req) => req.status === "Pending"
  );
  const timetableSlots = database.Table_2_Train_Timetable;

  if (pendingRequests.length === 0) {
    console.log("No pending maintenance requests found.");
    return [];
  }

  console.log(`Found ${pendingRequests.length} pending maintenance requests.`);

  // 2. Construct the API Payload
  console.log("=== STEP 2: Constructing Gemini API Payload ===");
  const payload = {
    system_instruction: {
      parts: [
        {
          text: "You are an expert AI Railway Logistics & Maintenance Scheduler for Indian Railways. Perform Automatic Integrated Block Planning by consolidating disconnected maintenance requests from Track, Signal, and Traction departments into single unified geographic time blocks."
        }
      ]
    },
    contents: [
      {
        parts: [
          {
            text: `Optimize the following datasets into consolidated blocks:

Table_1_Maintenance_Requests:
${JSON.stringify(pendingRequests, null, 2)}

Table_2_Train_Timetable:
${JSON.stringify(timetableSlots, null, 2)}`
          }
        ]
      }
    ],
    generationConfig: {
      temperature: 0.1,
      response_mime_type: "application/json",
      response_schema: {
        type: "ARRAY",
        items: {
          type: "OBJECT",
          properties: {
            block_id: { type: "STRING" },
            location_sector: { type: "STRING" },
            scheduled_time_window: {
              type: "OBJECT",
              properties: {
                start_time: { type: "STRING" },
                end_time: { type: "STRING" }
              },
              required: ["start_time", "end_time"]
            },
            assigned_request_ids": {
              type: "ARRAY",
              items: { type: "STRING" }
            },
            total_block_duration_minutes": { type: "INTEGER" },
            departments_involved": {
              type: "ARRAY",
              items: { type: "STRING" }
            }
          },
          "required": [
            "block_id",
            "location_sector",
            "scheduled_time_window",
            "assigned_request_ids",
            "total_block_duration_minutes",
            "departments_involved"
          ]
        }
      }
    }
  };

  // 3. Make HTTP POST Request to Gemini API
  console.log("=== STEP 3: Dispatching Webhook Request to AI Model ===");
  const response = await fetch(GEMINI_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error(`API Request failed with status ${response.status}: ${await response.text()}`);
  }

  const result = await response.json();
  const rawTextOutput = result.candidates[0].content.parts[0].text;
  const optimizedBlocks = JSON.parse(rawTextOutput);

  console.log("=== STEP 4: Response Mapping & Database Ingestion ===");
  
  // A. Create records in Table 3
  optimizedBlocks.forEach((block) => {
    database.Table_3_Optimized_Blocks.push(block);
    console.log(`[Created Record in Table 3]: ${block.block_id} for sector ${block.location_sector}`);
  });

  // B. Collect all assigned request IDs and update status to 'Scheduled'
  const assignedIds = new Set(optimizedBlocks.flatMap((b) => b.assigned_request_ids));
  
  database.Table_1_Maintenance_Requests.forEach((req) => {
    if (assignedIds.has(req.request_id)) {
      req.status = "Scheduled";
      console.log(`[Updated Table 1 Status]: ${req.request_id} -> Scheduled`);
    }
  });

  return optimizedBlocks;
}

module.exports = { runOptimizationWorkflow };
