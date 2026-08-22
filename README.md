# Indian Railways Problem Statement 26027: AI-Powered Automatic Block Planning

This repository contains the Data Architecture, JSON Schemas, Mock Data Payloads, and API System Prompt for an AI-powered Automatic Block Planning application designed for **Indian Railways**.

## Problem Summary
Indian Railways operates high-density corridors where track maintenance requests originate independently from three distinct departments:
1. **Track Maintenance (Engineering)**
2. **Signal & Telecommunication (S&T)**
3. **Traction / Overhead Equipment (TRD/OHE)**

Traditionally, uncoordinated maintenance requests cause excessive line block grants, increased train detention, and reduced section capacity. This project designs the data structures and LLM optimization prompt to group multi-department maintenance requests geographically into single consolidated time blocks based on live train timetables.

---

## Repository Structure

- [`schema.json`](file:///home/Pradyut/Documents/Hackathon/schema.json): Formal JSON Schemas for:
  - `Table_1_Maintenance_Requests`
  - `Table_2_Train_Timetable`
  - `Table_3_Optimized_Blocks`
- [`mock_data.json`](file:///home/Pradyut/Documents/Hackathon/mock_data.json): Realistic mock dataset containing 10 multi-department maintenance requests and 5 train timetable clear windows.
- [`system_prompt.md`](file:///home/Pradyut/Documents/Hackathon/system_prompt.md): The exact, strict instructional prompt for the LLM API integration inside the Antigravity no-code platform.

---

## Sample Data Overview

### Geographical Overlaps (Multi-Department Grouping)
- **Sector `SEC-NDLS-CNB-01`**: Bundles Track (`REQ-TRK-001`), Signal (`REQ-SIG-001`), and Traction (`REQ-TRC-001`) into a single 165-minute window within a 240-minute clear window (`TT-001`).
- **Sector `SEC-HWH-BWN-02`**: Bundles Track (`REQ-TRK-002`) and Traction (`REQ-TRC-002`) into a 165-minute window (`TT-002`).
- **Sector `SEC-BCT-BRC-03`**: Bundles Signal (`REQ-SIG-002`) and Track (`REQ-TRK-003`) into a 180-minute window (`TT-003`).

