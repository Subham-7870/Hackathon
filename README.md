# SthitiShodhana (स्थितिशोधन) — Autonomous Train Dispatching & Dynamic Maintenance Block Optimizer

![Release v2.5.0](https://img.shields.io/badge/Release-v2.5.0%20Autonomous-blue.svg)
![Design System](https://img.shields.io/badge/Design-Operational%20Editorial-indigo.svg)
![Status](https://img.shields.io/badge/Optimization-100%25%20Conflict--Free-success.svg)

> **Sthiti (स्थिति)**: Operating state, live traffic status, and scheduled maintenance blocks.  
> **Shodhana (शोधन)**: Mathematical optimization, multi-objective refinement, and constraint satisfaction.

**SthitiShodhana (स्थितिशोधन)** is the next-generation autonomous train dispatching and dynamic maintenance block allocation engine engineered for Smart India Hackathon (SIH 2026) Problem Statement **26027: "AI-Powered Automatic Block Planning to Maximize Asset Availability for Train Operations on Indian Railways"**, built by **Team Trailblazer (ID: 15)**.

---

## 🌟 What's New in the v2.0 Pro Redesign

1. **Operational Editorial Design System**:
   - Clean, high-legibility interface pairing **Manrope** typography with **DM Mono** for precise station codes, times, and sector identifiers.
   - Deep Railway Navy, Railway Cobalt, and restrained department accents (Track = Blue, Signal = Amber, Traction = Violet).
2. **Indian Metro Style Dynamic Linear Track Schematic (Active Line Display)**:
   - Inspired by Delhi Metro (DMRC) / passenger door displays and modern dispatch consoles.
   - Dual-track linear visualization featuring **UP Main Line** and **DOWN Main Line** with cross ties.
   - Circular illuminated station LED beacons with animated green/white pulsing aura for the next approaching station.
   - Live moving train cars gliding smoothly from station to station with headlight cones and floating speed tags.
   - Active AI Maintenance Block Possession visual hazard zones (diagonal caution stripes and red stop signals).
   - Real-time Passenger Information System (PIS) announcement ticker.
3. **Interactive Real Rail Corridor Map (Leaflet & OpenStreetMap)**:
   - High-contrast railway track polyline geometries mapped to actual Indian Railway routes across 5 corridors (NDLS–CNB, HWH–BWN, BCT–BRC, MAS–BZA, SBC–MYS).
   - Interactive station markers with custom tooltips, route inspection popups, and bidirectional sync with tables and cards.
4. **Locomotive In-Cab Driver HUD Modal**:
   - Animated speedometer dial, Kavach TCAS SIL-4 protection status, multi-aspect cab signal lamps, and emergency brake testing.
5. **Weekly Department Scheduling Preferences**:
   - Each maintenance request captures weekly day, date, and preferred time intervals, demonstrating realistic operational constraints.
6. **Visual Capacity Progress Rails**:
   - Every clear window and scheduled block features visual two-tone capacity progress rails, comparing committed work minutes against safe closure limits.
7. **Private Number (PN) Interlocking & Sanction Protocol**:
   - Interactive sanction workflow simulating the official Indian Railways General & Subsidiary Rules (G&SR) block grant exchange.
8. **AI Telemetry & Explainability Drawer**:
   - Real-time logging of clustering, constraint evaluation, and priority-based bin packing.
9. **Dynamic Request Injection**:
   - "Add Request" modal allowing live testing and immediate re-optimization.

---

## 🗄️ Original Website Backup Archive

The original v1 release and initial drafts have been safely backed up:
- 📁 **[`backup_original_website/root_v1_prototype/`](file:///home/pradyut/Documents/Hackathon/Hackathon/backup_original_website/root_v1_prototype/)**: Pristine copy of the original v1.0.0 HTML/CSS/JS files.
- 📁 **[`backup_original_website/sih_web_manus/`](file:///home/pradyut/Documents/Hackathon/Hackathon/backup_original_website/sih_web_manus/)**: Snapshot of the draft manus workspace and notes.
- 📄 **[`backup_original_website/README.md`](file:///home/pradyut/Documents/Hackathon/Hackathon/backup_original_website/README.md)**: Backup documentation and restore guide.

---

## 🚀 Quick Start & Preview

### 1. Launch the Redesigned Dashboard
Simply open **`index.html`** in any web browser, or launch a quick local server:
```bash
# Using Python
python3 -m http.server 8000

# Open http://localhost:8000
```

### 2. Run the Deterministic Backend Verification Script
```bash
deno run --unstable-detect-cjs --allow-read --allow-write dry_run.js
# Or with Node.js:
node dry_run.js
```

---

## 📁 Repository Structure

- 💻 **[`index.html`](file:///home/pradyut/Documents/Hackathon/Hackathon/index.html)**: Redesigned operational editorial interface.
- 🎨 **[`styles.css`](file:///home/pradyut/Documents/Hackathon/Hackathon/styles.css)**: CSS design system and print stylesheets.
- ⚙️ **[`app.js`](file:///home/pradyut/Documents/Hackathon/Hackathon/app.js)**: Constraint solver, Leaflet map controller, and reactive state management.
- 🗺️ **[`railRoutes.js`](file:///home/pradyut/Documents/Hackathon/Hackathon/railRoutes.js)**: Real OpenStreetMap rail-aligned coordinates for all 5 corridors.
- 📊 **[`schema.json`](file:///home/pradyut/Documents/Hackathon/Hackathon/schema.json)**: JSON schemas for Table 1, Table 2, and Table 3.
- 📁 **[`mock_data.json`](file:///home/pradyut/Documents/Hackathon/Hackathon/mock_data.json)**: Baseline dataset with 10 maintenance requests and 5 clear windows.
- 🧪 **[`dry_run.js`](file:///home/pradyut/Documents/Hackathon/Hackathon/dry_run.js)**: Automated test runner.
- ⚡ **[`system_prompt.md`](file:///home/pradyut/Documents/Hackathon/Hackathon/system_prompt.md)**: Gemini REST API system prompt for cloud deployment.
- 📂 **[`frontend/`](file:///home/pradyut/Documents/Hackathon/Hackathon/frontend/)**: React 19 + TypeScript + D3 + Tailwind application suite.
