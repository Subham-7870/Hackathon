# SIH 2026 — RailBlock Planner

## Ready-to-paste content for the existing six-slide template

> **Use this document to replace the text in the uploaded deck.** It is deliberately concise so it fits the current layouts. The suggested copy is written for the RailBlock Planner prototype: a planning workspace that combines maintenance requests, clear timetable windows, weekly department preferences, and map-based rail-corridor context.

| Slide | Existing title | What to paste |
| --- | --- | --- |
| 1 | SMART INDIA HACKATHON 2026 | Problem-statement and team details |
| 2 | Automatic Block Planning System | Problem-to-solution flow diagram labels |
| 3 | TECHNICAL APPROACH | Technology stack and planning workflow |
| 4 | FEASIBILITY AND VIABILITY | Feasibility, risk, and mitigation copy |
| 5 | IMPACT AND BENEFITS | Outcome and stakeholder-benefit copy |
| 6 | RESEARCH | Research rationale and pilot-validation plan |

---

## Slide 1 — SMART INDIA HACKATHON 2026

### Paste into the left-side information area

**Problem Statement ID:** SIH26027  
**Problem Statement Title:** AI-Powered Automatic Block Planning to Maximize Asset Availability for Train Operations on Indian Railways  
**Theme:** Transportation & Logistics  
**PS Category:** Software  
**Team ID:** 15  
**Team Name:** Trailblazer  
**Solution Name:** RailBlock Planner

### Optional one-line subtitle, if space is available

> A decision-support platform that combines maintenance requests into safe, coordinated railway blocks.

---

## Slide 2 — Automatic Block Planning System

### Main heading

**RailBlock Planner: Convert scattered maintenance requests into one safe, coordinated block plan.**

### Flowchart text

Use the following text inside the existing five flowchart boxes, from top to bottom:

| Flowchart position | Text to paste |
| --- | --- |
| Top box | **Problem**  
Track, Signal, and Traction teams submit separate maintenance requests. Manual coordination can create repeated closures, missed overlap opportunities, and late conflict discovery. |
| Second box | **AI-Assisted Block Planning**  
Match requests by rail sector, department availability, priority, work duration, and safe timetable windows. |
| Third-left box | **Uniqueness**  
Show each corridor on a real rail-aligned map and keep weekly department preferences visible before planning. |
| Third-right box | **Human Validation**  
Present the recommended block with its common day, date, time, teams, capacity used, and remaining closure time for Control Office approval. |
| Bottom box | **Outcome**  
One shared maintenance plan: fewer fragmented blocks, clearer capacity use, and a traceable schedule for every team. |

### Bottom caption, if the blue footer has an editable text area

**From request intake to approved block plan in one operational workspace.**

---

## Slide 3 — TECHNICAL APPROACH

### Subtitle below the main title

**AI-assisted planning with mandatory human validation**

### Left column — Technologies Used

**Frontend and Operations View**  
React + TypeScript + Tailwind CSS provide an interactive planning workspace, weekly-preference table, capacity bars, and map-based corridor view.

**Planning and API Layer**  
Python FastAPI exposes secure planning endpoints. Python optimization logic groups compatible work and checks each candidate against closure capacity.

**Data Layer**  
PostgreSQL + PostGIS store maintenance requests, location sectors, timetable windows, work durations, and confirmed maintenance coordinates.

**AI Support Layer**  
An LLM-assisted service standardizes free-text maintenance requests, identifies missing inputs, and explains recommendations. Final scheduling remains rule- and constraint-based.

### Right column — Methodology

**Step 1 — Collect and validate inputs**  
Ingest Track, Signal, and Traction requests with sector, duration, priority, preferred day/date/time, and required resources.

**Step 2 — Find compatible work**  
Group requests only when they share a corridor and can be completed within the same safe closure opportunity.

**Step 3 — Optimize against timetable capacity**  
Fit grouped work into clear timetable windows while preserving operational limits and showing unused closure capacity.

**Step 4 — Review, approve, and publish**  
Display the common work day, date, time, coordinated departments, and rail-aligned route. The Control Office accepts, adjusts, or rejects the recommendation.

### One-line differentiator for the bottom of the slide

> **AI explains and accelerates planning; authorized railway staff retain final control.**

---

## Slide 4 — FEASIBILITY AND VIABILITY

### Left column — Feasibility Analysis

RailBlock Planner can begin as a decision-support layer over existing maintenance and timetable exports. It does not require new field hardware for the initial pilot. The prototype already demonstrates request intake, weekly availability, closure-capacity checks, rail-corridor visualization, and recommended common work slots.

### Middle column — Potential Challenges

Legacy systems may use different sector codes, data formats, and update frequencies. Real-time train movement data can be incomplete or delayed. Maintenance records may initially lack precise track-kilometre or GPS locations. Users may also require time to trust recommendations that alter established planning workflows.

### Right column — Risk Mitigation

Start with a limited corridor pilot and read-only data imports. Introduce validation rules for missing sector, duration, and time-window values. Add configurable buffers for uncertain data and preserve manual override, approval, and audit history. Use role-based access so only authorized planners can publish a final block plan.

### Closing line, if space is available

> **Pilot first, integrate progressively, and keep every operational decision reviewable.**

---

## Slide 5 — IMPACT AND BENEFITS

### Left column — Potential Impact

**For train operations**  
Fewer fragmented maintenance closures and clearer visibility of where closure capacity is being used.

**For maintenance teams**  
One shared plan that aligns Track, Signal, and Traction work to the same corridor, day, date, and time.

**For passengers and freight users**  
More predictable maintenance planning supports more reliable train operations and reduces avoidable disruption.

**For decision-makers**  
An explainable record of each recommendation, including the selected window, capacity consumed, teams involved, and linked requests.

### Right column — Benefits of the Solution

**Capacity-first planning**  
Visual closure-capacity bars make unused, committed, and remaining maintenance time easy to understand.

**Cross-department coordination**  
Compatible work is combined where safe, limiting duplicate access to the same sector.

**Faster planning review**  
Map context, weekly preferences, and a common work slot reduce the effort needed to compare inputs manually.

**Scalable foundation**  
The same model can extend from a pilot corridor to multiple divisions as source-data quality improves.

---

## Slide 6 — RESEARCH

### Replace the existing 85% / 15% claim and pie-chart text

Do **not** use the existing percentage claim unless your team has an auditable source for it. Replace the slide with the following evidence-led content.

### New left-side chart title

**Pilot evaluation metrics**

### Suggested chart labels

Use a simple four-part bar or donut chart with these labels. Leave the values as “baseline” until you collect pilot data.

| Metric | Chart label |
| --- | --- |
| Planning efficiency | Time taken to create and approve a block plan |
| Block consolidation | Compatible requests grouped into one closure |
| Capacity utilization | Planned work minutes ÷ available closure minutes |
| Operational acceptance | Recommendations approved, adjusted, or rejected by planners |

### Right-side research content

**Research question**  
Can a constraint-based planning workspace reduce fragmented maintenance blocks while preserving safe timetable windows and planner control?

**Current system gap**  
Maintenance requests, timetable windows, and departmental availability are often reviewed in separate tools or spreadsheets. This makes overlap identification and capacity comparison difficult.

**Pilot method**  
Select one or two representative corridors. Compare the current manual process with RailBlock Planner using identical maintenance requests and clear windows. Record planning time, number of consolidated requests, capacity used, manual changes, and approval decisions.

**Success criterion**  
The system is successful if planners can create a reviewable common work slot faster, with no safety-rule violation and with every recommendation explainable from its source data.

### Small footnote

**All impact claims will be validated against pilot data before operational rollout.**

---

## Presentation speaking cues

Use these short speaking lines while presenting. They are not intended to be pasted onto the slides.

| Slide | Suggested spoken transition |
| --- | --- |
| 1 → 2 | “Our challenge is not a lack of maintenance work; it is coordinating that work inside very limited safe closure opportunities.” |
| 2 → 3 | “RailBlock Planner turns this coordination problem into a transparent, constraint-based workflow.” |
| 3 → 4 | “The solution is designed as decision support, so it can begin with available data and still preserve human approval.” |
| 4 → 5 | “That implementation approach creates practical value for planners, operations, and passengers at the same time.” |
| 5 → 6 | “We will measure this value through a corridor-level pilot rather than relying on unverified headline claims.” |

## Final checklist before you paste

| Item | Check |
| --- | --- |
| Replace every occurrence of “Trailblazer” only if the official team name has changed. | □ |
| Confirm the final SIH problem statement ID and team ID. | □ |
| Use verified pilot data before adding numbers to Slide 6. | □ |
| Keep the text within the current layout; reduce font size only as a last resort. | □ |
| Add only real technology names that your team will actually use. | □ |
