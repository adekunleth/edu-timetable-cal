# ClassLens — Product Requirements Document

**Version:** 0.1 (Prototype)
**Status:** Implemented in prototype, not production-ready
**Last updated:** June 2026

---

## 1. Overview

**Product:** ClassLens — an academic timetabling and attendance management tool.

**Vision:** Replace the spreadsheet-and-email workflow most institutions still use for class scheduling with a single, form-driven interface that handles multi-session classes, mixed delivery modes, and attendance tracking in one place.

**Problem:** Academic administrators juggle subject catalogues, cohort lists, room bookings, instructor availability, and attendance records across disconnected tools. Conflicts (double-booked rooms, overlapping instructor slots) are discovered late, and mixed delivery (e.g., a Monday on-campus lecture plus a Thursday online tutorial under the same class record) is awkward to model.

**Target users:**
- Academic administrators and timetabling officers (primary)
- Course coordinators (secondary)
- Instructors (read + mark attendance)

---

## 2. Goals & Non-Goals

### Goals
- Validate that a unified class-creation form with conditional logic, auto-calculations, and inline conflict warnings can replace spreadsheet workflows.
- Provide both a calendar grid and a filterable list view over the same dataset.
- Demonstrate end-to-end attendance marking and monthly summaries.
- Make the scheduling framework (operating days/hours) configurable and have it drive the UI consistently.

### Non-goals (for this prototype)
- Backend persistence — state is in-memory via React context.
- Authentication, roles, or multi-tenancy.
- Integration with real Student Information Systems (SIS) or room booking systems.
- Notifications (email/SMS) or recurring job processing.

---

## 3. User Personas

| Persona | Needs |
|---|---|
| **Timetabling Officer** | Create classes quickly, see conflicts immediately, manage exceptions (holidays, excluded weeks). |
| **Course Coordinator** | Browse the calendar by cohort, verify delivery mode and room assignments. |
| **Instructor** | View today's classes, mark attendance per session. |

---

## 4. Information Architecture

Top-level navigation (sidebar):

- **Dashboard** — overview + today's schedule
- **Calendar** — weekly grid / list toggle, entry point to create class
- **Subjects** — placeholder
- **Attendance** — marking + monthly summary
- **Cohorts** — placeholder
- **Reports** — placeholder
- **Settings** — scheduling framework configuration

---

## 5. Feature Specifications

### 5.1 Dashboard (`/`)
- Four KPI cards: Active Subjects, Total Students, Classes This Week, Attendance Rate.
- "Today's Schedule" panel listing the current day's classes, colour-coded by delivery type, each row offering a **Mark Attendance** action that opens the marking dialog.
- "Alerts & Notifications" panel: room conflicts, low-attendance flags, holiday notices, with severity-based styling.

### 5.2 Calendar View (`/calendar`)
- Toggle between **Weekly grid** and **List table**.
- Grid columns are driven by the days enabled in Settings → Scheduling Framework (Mon–Fri by default, Sat/Sun optional).
- Classes are colour-coded by delivery type (lecture, lab, tutorial, workshop, online).
- "Add Class" button routes to `/calendar/add-class`.
- Filters: search, delivery type, day, cohort.

### 5.3 Class Creation Form (`/calendar/add-class`)

Sectioned form with conditional logic and auto-calculations.

**Academic Context**
- **Subject** — single dropdown showing `Code – Title` (e.g., `BIO101 – Anatomy Basics`). Replaces the previous two-field code + title pair.
- Academic Year, Study Period, optional Term, optional Course, optional Cohort.

**Schedule & Recurrence**
- **Start Week** and **End Week** dropdowns generated from the selected Study Period's date range (each option labelled `Week N – MMM dd yyyy`).
- Number of weeks is auto-calculated.
- Excluded dates list with reason (holidays, breaks).
- Custom notes field.

**Sessions** (multi-session builder, one class can contain many sessions)
- Day-of-week, start/end time, instructor.
- **Delivery Type:** Lecture / Lab / Tutorial / Workshop / Online / Practical.
- **Delivery Method:** On-Campus / Online / Blended.
  - On-Campus reveals Campus, Building, Room, Room Capacity.
  - Online reveals Online Link.
  - Blended reveals both.
- Optional break (start + duration).
- Per-session attendance config: track toggle, minimum %, attendance method (Instructor Marked / Student Self-Check / QR Code / Biometric), reminder toggle.
- Auto-calculated contact hours per session and total hours per class.
- Conflict detection (client-side) for room and instructor double-booking against existing classes.

**Description & Attachments**
- Public description, internal notes, file attachments list.

**Validation**
- Required: Subject, Academic Year, Study Period, Start Date, End Date, at least one session.
- `Select.Item` values are never empty strings (Radix requirement).

### 5.4 Class List Table
- Columns: **Subject** (`Code – Title` merged), **Cohort/Intake** (em-dash when empty), Day, Time, Instructor, Type, Location.
- Sort, search, and filter parity with the calendar grid.

### 5.5 Attendance (`/attendance`)
- Period filter including **This Month** with seeded sample data so the view is populated on first load.
- Session list — each row opens the **Attendance Marking Dialog**.
- Marking dialog: per-student status (Present / Absent / Late / Excused), notes, save.
- Monthly summary per student with per-subject attendance rates against the configured minimum threshold.

### 5.6 Settings → Scheduling Framework (`/settings`)
- Operating **Start Time** and **End Time** — the window in which classes can be scheduled.
- Horizontal day selector: Mon–Fri checked by default, Sat/Sun available to opt in.
- Selected days propagate to:
  - Calendar grid columns
  - Day options in the Class Creation Form
- Standard class durations list.

### 5.7 Placeholder Pages
Subjects, Cohorts, and Reports are scaffolded but not part of the current scope.

---

## 6. Data Model

Defined in `src/types/classForm.ts`. State is held in `ClassesContext` (in-memory).

```ts
type DeliveryType    = "Lecture" | "Lab" | "Tutorial" | "Workshop" | "Online" | "Practical";
type DeliveryMethod  = "On-Campus" | "Online" | "Blended";
type AttendanceMethod= "Instructor Marked" | "Student Self-Check" | "QR Code Scan" | "Biometric";

interface ClassSession {
  id: string;
  day: number;            // 0 = Mon ... 6 = Sun (subject to Settings)
  startTime: string;      // "HH:mm"
  endTime: string;
  instructor: string;
  deliveryType: DeliveryType;
  deliveryMethod: DeliveryMethod;
  campus?: string;
  building?: string;
  room?: string;
  roomCapacity?: number;
  onlineLink?: string;
  trackAttendance: boolean;
  minAttendance?: number;
  attendanceMethod?: AttendanceMethod;
  sendReminder?: boolean;
  breakStart?: string;
  breakDuration?: number;
}

interface ClassSchedule {
  id: string;
  subject: string;        // e.g., "BIO101"
  title: string;          // e.g., "Anatomy Basics"
  academicYear: string;
  studyPeriod: string;
  term?: string;
  course?: string;
  cohort?: string;
  startDate: string;
  endDate: string;
  excludedDates?: { date: string; reason: string }[];
  customNotes?: string;
  sessions: ClassSession[];
  description?: string;
  internalNotes?: string;
  attachments?: { name: string; url: string; size: number }[];
  color: string;
}
```

---

## 7. Reference Data

Located in `src/constants/dropdownOptions.ts`:

- **Subjects:** BIO101, MATH301, PHYS202, CHEM202, CS101, ENG201 (code + title pairs).
- **Instructors:** six seeded names.
- **Campuses:** Sydney, Melbourne, Brisbane, Perth.
- **Buildings/Rooms:** seven seeded options.
- **Study Periods:** 2025 S1, 2025 S2, 2026 S1 — each carries start/end dates used by the week generator.
- **Cohorts:** five seeded options including international cohorts.

---

## 8. Business Rules

- **Week generation** (`src/utils/weekGenerator.ts`): given a study period's start and end, produce week options spaced 7 days apart, labelled `Week N – MMM dd yyyy`.
- **Conditional fields:** delivery method controls visibility of location vs. online fields.
- **Default minimum attendance:** 80% unless overridden per session.
- **Day visibility:** the Calendar and form day options reflect Settings → Scheduling Framework.
- **Select values:** all `SelectItem` components must have a non-empty `value` prop (Radix constraint).

---

## 9. UX & Design System

- Tailwind CSS v3 with semantic tokens defined in `src/index.css` and `tailwind.config.ts`.
- shadcn/ui component library.
- Colour coding per delivery type: `--lecture`, `--lab`, `--tutorial`, `--workshop`, `--online`, used as `bg-{type}/10 border-{type} text-{type}`.
- No hard-coded colours in components; everything routes through tokens.

---

## 10. Tech Stack

- React 18, Vite 5, TypeScript 5
- Tailwind CSS v3, shadcn/ui (Radix primitives)
- React Router, TanStack Query
- date-fns for date math
- State: React Context (`ClassesContext`) — no backend

---

## 11. Known Limitations

- All data is in-memory; refreshing the page resets to seed data.
- No authentication or authorisation.
- Conflict detection runs only against the current in-memory class list.
- Attendance records are not persisted across sessions.
- No notifications, exports, or external integrations.

---

## 12. Future Enhancements (v2 candidates)

1. **Persistence** via Lovable Cloud (Postgres + auth) — durable classes, sessions, attendance.
2. **Roles** — admin, coordinator, instructor, student — via a separate `user_roles` table.
3. **Real room availability** checks against an external booking system.
4. **Bulk class creation** from templates (common subject + cohort + delivery configurations).
5. **Notifications** — class reminders, low-attendance alerts via email.
6. **Reporting** — exportable attendance and utilisation reports.
7. **Recurring exceptions** — public holidays auto-imported per region.

---

## 13. Acceptance Criteria Snapshot (Prototype)

- [x] Create a class with multiple sessions of mixed delivery modes.
- [x] Subject dropdown shows `Code – Title` as a single field.
- [x] Start/End weeks derived from the selected Study Period.
- [x] Calendar grid columns reflect the days enabled in Settings.
- [x] List table merges Subject column and shows Cohort/Intake with em-dash fallback.
- [x] Attendance "This Month" filter displays seeded data.
- [x] No runtime errors from empty `SelectItem` values.
