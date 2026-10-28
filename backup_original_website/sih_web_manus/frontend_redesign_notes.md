# AI Block Planner Front-End Redesign Direction

## Visual style

The interface will use a **light operational workspace** rather than a dark control console. The palette will pair a warm off-white canvas with white cards, slate text, railway blue as the primary action colour, and restrained green, amber, and violet accents for status and departments. The layout will use generous whitespace, soft shadows, rounded 16 px panels, and compact but legible Inter typography.

## User-facing information hierarchy

The page will explain the planning journey from left to right and from inputs to outcome:

1. A compact header identifies the workspace and offers a single primary action: **Build optimized plan**.
2. A summary band shows the key operational facts: maintenance requests, available clear windows, sectors being planned, and the current planning outcome.
3. An **How this plan works** guidance strip translates the optimizer logic into three readable steps: group requests by sector, check the clear timetable window, and combine departments where capacity permits.
4. An **Inputs** workspace makes both data sources visible. The maintenance request panel can be filtered by department, while the clear-window panel makes timetable capacity and timing understandable at a glance.
5. A prominent **Optimized work blocks** panel presents the result in a decision-ready card format. Each result communicates sector, scheduled interval, available versus used capacity, departments included, and linked requests.

## Technical-feedback policy

Raw execution logs and webhook/API terminology will be removed from the normal interface. During optimization, the primary button will show a concise progress state. On completion, the output panel will show a plain-language status message such as **“Plan ready — 5 coordinated blocks created.”** This gives users confidence without distracting them with implementation details.

## Interaction decisions

The redesigned prototype will preserve the existing optimization and reset behavior. Department filter chips will help users inspect the request source data. The timetable and requests panels will retain all existing mock data. Results will surface usable capacity as a progress bar and a capacity label to make each scheduling decision transparent.
