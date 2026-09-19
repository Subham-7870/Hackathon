# Indian Railways Problem Statement 26027: AI-Powered Automatic Block Planning (v1.0.0 Release)

![Release v1.0.0](https://img.shields.io/badge/Release-v1.0.0-blue.svg)
![Status](https://img.shields.io/badge/Backend-Verified-success.svg)

This repository contains the complete **v1.0.0 Release** for Indian Railways Problem Statement 26027: **"AI-Powered Automatic Block Planning"**, built for the Antigravity no-code platform with Google Gemini REST API integration.

---

## 🚀 What's Included in v1.0.0

- 📊 **[`schema.json`](file:///home/Pradyut/Documents/Hackathon/schema.json)**: JSON schemas for `Table_1_Maintenance_Requests`, `Table_2_Train_Timetable`, and `Table_3_Optimized_Blocks`.
- 📁 **[`mock_data.json`](file:///home/Pradyut/Documents/Hackathon/mock_data.json)**: Mock dataset featuring 10 departmental requests (Track, Signal, Traction) and 5 timetable clear windows.
- ⚡ **[`system_prompt.md`](file:///home/Pradyut/Documents/Hackathon/system_prompt.md)**: Strict optimization prompt enforcing multi-department grouping rules.
- 🤖 **[`api_integration.json`](file:///home/Pradyut/Documents/Hackathon/api_integration.json)**: Production JSON POST body template configured with Gemini Structured Output Schema (`response_mime_type: "application/json"`).
- 🧪 **[`dry_run.js`](file:///home/Pradyut/Documents/Hackathon/dry_run.js)**: Automated backend test runner verifying 100% multi-department block consolidation.
- 💻 **[`index.html`](file:///home/Pradyut/Documents/Hackathon/index.html) / [`app.js`](file:///home/Pradyut/Documents/Hackathon/app.js) / [`styles.css`](file:///home/Pradyut/Documents/Hackathon/styles.css)**: Interactive Web Dashboard prototype featuring a live **"Optimize Schedule"** button and visual output cards.

---

## 🛠️ Quick Start & Verification

### 1. Run the Backend Test Script
```bash
node dry_run.js
```

### 2. View the Live Dashboard Prototype
Open `index.html` in any modern web browser or launch a local dev server.

---

## 🏷️ Release Tags
- **`v1` / `v1.0.0`**: Permanent GitHub tag for the complete v1 release.
  - Remote URL: [`https://github.com/Subham-7870/Hackathon/tree/v1.0.0`](https://github.com/Subham-7870/Hackathon/tree/v1.0.0)
