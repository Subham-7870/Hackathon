# RailBlock Planner: How the Website Works

## Purpose and operating model

RailBlock Planner is a light, decision-oriented workspace for coordinating railway maintenance work inside safe timetable closures. It deliberately presents the planning story in the same order an operations coordinator needs to understand it: **what work is waiting**, **which closures are available**, and **which shared work blocks can be recommended**.

The published site is currently a **front-end planning prototype**. It contains a realistic in-browser dataset of maintenance requests, clear timetable windows, and five recommended blocks. It demonstrates the planning experience, calculations, visibility rules, filters, outcome states, and explanatory copy without exposing technical execution logs.

> The interface describes decisions in operational language—safe closures, capacity, shared work blocks, and coordination—rather than showing API calls, webhook records, or background execution messages.

## The user journey

| Stage | What the visitor sees | Why it is useful |
| --- | --- | --- |
| Context | The header identifies RailBlock Planner, gives the planning date, and provides **Build optimized plan** and **Reset plan** actions. | It makes the workspace purpose and the next decision clear immediately. |
| Planning summary | Four small cards report maintenance requests, clear timetable windows, participating departments, and the plan state. | A coordinator can see the size and readiness of the planning problem before studying individual records. |
| Planning logic | The “What the planner checks” strip states the three core checks: location match, timetable protection, and departmental coordination. | The rules are transparent without forcing the user to read technical instructions. |
| Source records | Maintenance requests appear in a filterable table beside the available clear timetable windows. | The two data sources behind the outcome remain visible and understandable. |
| Recommended outcome | The final panel starts in an explanatory empty state and changes into detailed block cards after a plan is built. | It separates source evidence from the final recommended decision. |

## The data shown in the current website

The prototype starts with **10 maintenance requests** distributed across Track, Signal, and Traction departments. Every request includes a request identifier, its department, sector, required work duration, and priority. The initial status is **Pending**.

The prototype also contains **five clear timetable windows**. Each window belongs to one of the same rail sectors and provides a start time, end time, and available closure capacity. The visible capacity rail below every window turns the numerical relationship into a quick visual comparison: cobalt fill indicates the amount of closure time represented by related maintenance work, while the unfilled section represents remaining capacity.

| Input source | Current records | Key fields displayed |
| --- | ---: | --- |
| Maintenance requests | 10 | Request ID, department, sector, work duration, priority, current status |
| Clear timetable windows | 5 | Window ID, sector, UTC interval, available closure capacity, related work summary |
| Recommended blocks | 5 after plan creation | Block ID, sector, scheduled interval, capacity used, remaining capacity, departments, assigned requests |

## Planning logic communicated by the interface

The interface explains the intended scheduling policy in three concise operations. First, requests are collected only when they share the **exact same location sector**. Second, the resulting group is checked against a clear timetable window for the same sector. Third, the planner combines work from Track, Signal, and Traction in the same closure whenever that group fits within the available minutes.

For a live implementation, the expected calculation is:

> **Block duration = the sum of the assigned maintenance-request durations.** The block may be recommended only when its duration does not exceed the capacity of its matched clear timetable window. When space is constrained, high-priority work should be considered before medium- and low-priority work.

The current page reflects those rules visually. For example, the NDLS–CNB window has 240 available minutes and shows 165 minutes of associated work; once the plan is generated, its resulting block uses 165 minutes and leaves 75 minutes free. The same pattern is shown for every sector in both the timetable list and the outcome card.

## What happens when the user builds a plan

Clicking **Build optimized plan** starts a short, human-readable progress state: “Checking inputs and clear windows.” It does not show raw technical logs. After 850 milliseconds, the page switches to its completed-plan state.

The completed state updates every relevant part of the page at once. The summary changes from 10 pending requests and no plan to 0 pending requests, 10 coordinated requests, and 5 ready blocks. The request table labels every source record as **Scheduled**. The timetable window list changes its supporting line from total related work to the exact planned minutes and remaining minutes. Finally, the recommended-outcome panel expands from its explanation card into five operational block cards.

| Interaction | Website response | Effect on the planning view |
| --- | --- | --- |
| **Build optimized plan** | Shows a brief progress state, then loads five pre-defined recommended blocks. | Displays the planned schedule, capacity use, coordinated departments, and included request IDs. |
| **Reset plan** | Clears the browser-only plan state. | Returns all records to Pending and restores the initial explanatory result panel. |
| Department filters | Filters the visible maintenance-request rows to All, Track, Signal, or Traction. | Lets a coordinator inspect one workstream while preserving the full data model. |
| Capacity rails | Render continuously in both input and output sections. | Makes the use of each closure understandable before reading every duration value. |

## How to read a recommended work-block card

Each generated block card answers four practical questions. The header identifies the block and its location sector. The schedule line states the exact planned UTC interval. The capacity rail compares occupied time with the full timetable closure and spells out the remaining minutes. The footer names the coordinated departments and every included request ID.

The displayed sample plan creates five blocks. Four of those blocks combine two or three departments, illustrating the intent to reduce separate maintenance closures where the work can safely share one location and time window. The final single-department block remains visible rather than being hidden, because an operational plan should show every assigned closure even when only one team is involved.

## Current prototype boundary

The current permanent website will be a polished static front end. The maintenance requests, timetable windows, and generated blocks are stored in the browser as predefined data. The “build” action therefore demonstrates the experience by loading a known feasible plan; it does **not** call a database, an AI service, or a railway scheduling API yet.

| Capability | Current website | Live-production extension |
| --- | --- | --- |
| Source data | In-browser example requests and timetable windows | Load current requests and operating windows from a secure data source. |
| Planning operation | Uses a predefined feasible block set after a short progress state | Submit live records to an optimization service that applies the location, capacity, priority, and department-diversity rules. |
| Result persistence | Exists only until the visitor resets or reloads the page | Save approved recommendations, request status changes, timestamps, and user audit information. |
| Execution visibility | Concise user-facing plan status only | Keep the same concise status by default; place detailed diagnostics in a restricted administrator view if required. |

## Why technical logs are not shown

The design intentionally avoids showing execution logs in the central user workflow. Operations users need to know whether a plan is ready, which work was coordinated, and how much safe closure capacity remains. Those are decisions; API requests and raw processing messages are implementation details. If an audited administration console is later needed, it should be a separate secured area rather than a competing visual element inside the planning workspace.

## Maintenance corridor map

The website now includes an interactive India map below the source-data panels. It uses real station-city coordinates for the named endpoints encoded in the sample sectors and draws a cobalt corridor line along mapped OpenStreetMap railway alignment between each pair. Selecting a station pin reveals its name and station code; selecting a corridor reveals its sector identifier, maintenance-request count, work minutes, and available clear-window capacity.

The map is deliberately labelled as a **representative corridor map**. The current maintenance records contain a sector such as `SEC-NDLS-CNB-01`, but they do not contain a surveyed track kilometre or exact work-site coordinate. A live production connection should add the confirmed work-site latitude and longitude, or a railway chainage reference, to position maintenance exactly in the field.

## Publishing and next step

Once the project checkpoint is created, the website can be published from the project interface. Publishing gives the static experience a durable hosted URL; a custom domain may be added later through the project settings. The next functional milestone, if required, is upgrading the site to connect authenticated users, live request records, timetable data, and a real optimization service.
