# RailBlock Planner — Design Direction

## Three stylistic approaches

### Theme Name: Signal Garden
**Very Brief Intro:** An optimistic, low-stress operations workspace using soft botanical greens, ivory surfaces, and tactile editorial cards. It would make complex planning feel calm and humane.

**Probability:** 0.04

### Theme Name: Operational Editorial
**Very Brief Intro:** A precise, light rail-operations workspace that combines information-design clarity with the composed spacing and typography of a quality journal. It makes scheduling logic visible without looking technical or intimidating.

**Probability:** 0.08

### Theme Name: Amber Dispatch
**Very Brief Intro:** A warm transit-dispatch board that uses paper-like materials, railway amber, and tabular cues inspired by heritage station timetables. It would feel practical, grounded, and distinctive.

**Probability:** 0.03

## Chosen approach: Operational Editorial

### Design Movement

Contemporary **editorial information design** paired with the calm, efficient language of a modern railway operations workspace.

### Core Principles

1. **The plan reads as a story:** source inputs, planning logic, and recommended work blocks appear in that order.
2. **Clarity without heaviness:** use light surfaces, concise explanation, and controlled visual emphasis instead of a dense control-room aesthetic.
3. **Every metric earns its place:** statistics and badges reveal operating context, not decorative dashboard noise.
4. **Capacity is visible:** each plan outcome shows the relationship between planned work and available closure time.

### Color Philosophy

Warm off-white and pale blue surfaces keep the workspace open and legible. Railway blue carries action and structure; green confirms viable outcomes; amber denotes work waiting for a decision; violet identifies traction teams. The system relies on tinted surfaces rather than saturated blocks, retaining a composed, trustworthy mood.

### Layout Paradigm

An **inputs-to-outcome editorial flow**. The top frame establishes context, the middle section places maintenance requests beside timetable capacity, and the lower recommendation section expands into the planner’s final answer. It is intentionally asymmetric, with the wider request record panel balanced by a focused timetable column.

### Signature Elements

1. A compact blue rail monogram that anchors the header and favicon.
2. Small monospace codes for request, block, and sector identifiers.
3. Horizontal capacity bars that make the use of each closure immediately understandable.

### Interaction Philosophy

Interactions provide a confident, human-readable status rather than exposing internal implementation detail. Building a plan changes one clear status line; filtering maintenance work gives focused inspection without moving users away from their place in the page.

### Animation

Buttons use a brisk 160 ms press response. Generated work blocks fade and rise in with a subtle 50 ms stagger, while capacity bars fill once after a plan is built. The interface respects reduced-motion preferences and avoids continuous ornamental movement.

### Typography System

**Manrope** provides an approachable, high-legibility interface voice, using weight 800 for hierarchy and 500–700 for dense operational labels. **DM Mono** is used only for data identifiers and times, creating a crisp distinction between narrative explanation and exact planning records.

### Brand Essence

**RailBlock Planner gives railway maintenance coordinators a calm, transparent way to turn scattered work requests into practical integrated closures.**

Personality: **calm, exact, cooperative**.

### Brand Voice

Headlines should be clear, active, and operationally specific. CTAs should tell the user what will happen; microcopy should explain the decision logic rather than the technology behind it.

Example lines:

- “Bring maintenance work together, without disrupting train operations.”
- “Build the plan to see where teams can share a safe closure.”

### Wordmark & Logo

The logo is a compact blue square monogram: two narrow parallel tracks resolve into an abstract **R**, forming an ownable symbol that remains recognizable at favicon scale. The wordmark uses a strong, slightly condensed editorial treatment rather than a default UI font.

### Signature Brand Color

**Railway Cobalt — #1468D4**.

## Style Decisions

- The compact cobalt logo must resolve as a two-track abstract R, with parallel track lines quietly recurring in header and document-divider details.
- Closure capacity is always visual as well as numeric: cobalt rails show planned/requested work against the full available timetable window, while green and amber remain reserved for outcome status.
- Panels should feel like a structured planning brief: warm off-white ground, pale blue document surfaces, crisp rule lines, restrained shadows, and Manrope/DM Mono hierarchy rather than generic SaaS card decoration.
