# Attendance Marking Window (48h)

## Goal
Attendance can currently be marked at any time, forever. Add a marking window: it **opens when the class starts** and **closes 48 hours after the class ends** (configurable in Settings). Outside the window, marking is blocked with clear feedback.

## Current state (confirmed)
- Marking entry points: Dashboard → Today's Schedule "Mark Attendance" button; Calendar week grid → hover "Mark" button. Both open `AttendanceMarkingDialog`.
- No time-window logic exists anywhere; sessions are recurring (`day` 0–4 + `startTime`/`endTime`), and the calendar renders a hardcoded "Mar 10–14" week.

## Changes

### 1. Make the demo week real (`src/pages/CalendarView.tsx`, `src/pages/Dashboard.tsx`)
- Replace the hardcoded "Mar 10+index" week with the **current week** computed from today, so sessions land before/during/after "now" and the window is actually demonstrable (some classes in-window, some closed, some upcoming).

### 2. Window utility (`src/utils/attendanceWindow.ts`) — new
- `getOccurrenceDateTime(dayOfWeek, time, weekStart)` → concrete `Date` for a session occurrence.
- `getWindowStatus(start, end, windowHours)` → `{ status: "upcoming" | "open" | "closed", closesAt, opensAt, hoursRemaining }`.
- `windowHours` comes from a configurable setting (default 48).

### 3. Settings (`src/pages/Settings.tsx`)
- Add an "Attendance Marking Window" field (number of hours after class end, default 48) in a small context (`AttendanceSettingsContext`) so Calendar/Dashboard/Dialog all read the same value.

### 4. Gate the Mark buttons (Calendar + Dashboard)
- Compute each class's occurrence end from its day/time slot.
- **Upcoming** (before start): button disabled, tooltip "Opens when class starts".
- **Open**: normal Mark button + subtle countdown ("closes in 36h").
- **Closed**: button replaced with a muted lock state + tooltip "Marking window closed (ended > 48h ago)". Clicking is blocked.

### 5. Dialog feedback (`src/components/AttendanceMarkingDialog.tsx`)
- Status banner at top: green "Window open — closes in Xh", or red "Window closed" (dialog defensively refuses to save if closed).

### 6. Docs
- Append the window rules to `PRD.md` (open/close conditions, configurability, edge cases: exactly-at-boundary, timezone = local browser time).

## Verification
- Playwright: confirm an upcoming class shows a disabled button, a recently-ended class is markable with countdown, an old class is locked; change the window in Settings and see states update.
