# ClassLens — Product Requirements Document (Detailed Logic Specification)

**Version:** 0.2 (Prototype)
**Status:** Implemented in prototype, not production-ready
**Last updated:** August 2026

---

## 1. Overview

**Product:** ClassLens — an academic timetabling and attendance management tool for higher-education institutions.

**Vision:** Replace the spreadsheet-and-email workflow most institutions use for class scheduling with a single, form-driven interface that handles multi-session classes, mixed delivery modes, and attendance tracking in one place.

**Target users:**
- Academic administrators and timetabling officers (primary)
- Course coordinators (secondary)
- Instructors (read schedule + mark attendance)

---

## 2. Architecture & State Model

### 2.1 State management

All application state is in-memory, held in a single React context (`ClassesContext`, `src/contexts/ClassesContext.tsx`). There is no backend; a page refresh resets the app to seed data.

```ts
interface ClassesContextType {
  classes: ClassSchedule[];
  addClass: (classData: ClassSchedule) => void;      // append to array
  updateClass: (id, classData) => void;              // replace by id
  deleteClass: (id) => void;                         // filter out by id
}
```

The provider wraps the app; every page reads/writes through `useClasses()`. The calendar grid, list table, and conflict detection in the creation form all derive from this one array, so a newly published class appears everywhere immediately without any sync logic.

### 2.2 Seed data

Six `ClassSchedule` records ship as initial state (`initialClasses`), covering every delivery type and method: on-campus Lecture/Lab/Tutorial/Workshop sessions and one fully Online session with `trackAttendance: false`. Seed records use realistic overlapping-free slots across Mon–Fri so the calendar grid is populated on first load.

### 2.3 Reference data

`src/constants/dropdownOptions.ts` holds the canonical option lists used by dropdowns throughout the app:

- **SUBJECTS** — 6 entries as `{ code, title, label }` where `label = "CODE - Title"` (e.g. `"BIO101 - Anatomy Basics"`). The label is the stored selection value; code and title are recovered from it at publish time.
- **INSTRUCTORS** — 6 names.
- **CAMPUSES** — Sydney, Melbourne, Brisbane, Perth.
- **BUILDINGS_ROOMS** — 7 entries in the combined format `"Building X - Room NNN"`. The form splits this string on `" - Room "` to populate separate `building` and `room` fields.
- **STUDY_PERIODS** — each has `{ id, label, startDate, endDate }` (e.g. `2025-S1`, `"2025 Semester 1"`, `2025-02-24` → `2025-06-27`). The dates drive week generation.
- **COHORTS** — 5 intake labels.

### 2.4 Core types

`src/types/classForm.ts`:

```ts
type DeliveryType     = "Lecture" | "Lab" | "Tutorial" | "Workshop" | "Online" | "Practical";
type DeliveryMethod   = "On-Campus" | "Online" | "Blended";
type AttendanceMethod = "Instructor Marked" | "Student Self-Check" | "QR Code Scan" | "Biometric";

interface ClassSession {
  id: string;
  day: number;              // 0 = Monday … 4 = Friday (index into weekDays)
  startTime: string;        // "HH:mm" 24-hour
  endTime: string;
  instructor: string;
  deliveryType: DeliveryType;
  deliveryMethod: DeliveryMethod;
  campus?: string;          // only when On-Campus / Blended
  building?: string;        // single letter, e.g. "A"
  room?: string;            // e.g. "201"
  roomCapacity?: number;
  onlineLink?: string;      // only when Online / Blended
  trackAttendance: boolean;
  minAttendance?: number;   // percent, default 80
  attendanceMethod?: AttendanceMethod;
  sendReminder?: boolean;
  breakStart?: string;
  breakDuration?: number;
}

interface ClassSchedule {
  id: string;               // "class-<timestamp>"
  subject: string;          // code only, e.g. "BIO101"
  title: string;            // e.g. "Anatomy Basics"
  academicYear: string;     // derived: period.id.split('-')[0]
  studyPeriod: string;      // period label, e.g. "2025 Semester 1"
  term?: string;
  course?: string;
  cohort?: string;
  startDate: string;        // ISO date of the chosen start week's Monday
  endDate: string;          // ISO date of the chosen end week's Monday
  excludedDates?: { date: string; reason: string }[];
  sessions: ClassSession[]; // 1..n
  description?: string;
  internalNotes?: string;
  color: string;            // Tailwind classes, derived from sessions[0].deliveryType
}
```

Note the **storage convention**: a class holds code and title in separate fields, but the UI always presents them merged as `"CODE - Title"`.

---

## 3. Week Generation & Calculation Logic

`src/utils/weekGenerator.ts`:

**`generateWeeksForPeriod(startDateStr, endDateStr)`** — starting at the period's start date, emits one `WeekOption` every 7 days until the end date is passed. Each option: `{ weekNumber, startDate, label }` with label `"Week N - MMM dd yyyy"`. Weeks are anchored to the period start, not to calendar Mondays.

**`calculateNumberOfWeeks(startWeek, endWeek)`** — inclusive count: `endWeek - startWeek + 1`.

These feed the two derived values in the creation form:

- `numberOfWeeks = calculateNumberOfWeeks(startWeek, endWeek)` (0 until both are set)
- `totalContactHours = contactHoursPerWeek × numberOfWeeks`

Both are computed via `useMemo` and rendered into read-only inputs plus a summary strip (`"Duration: N weeks • Total: H contact hours"`).

---

## 4. Class Creation Form (`/calendar/add-class`)

The form (`src/pages/ClassCreationForm.tsx`) is the heart of the prototype. It is organised into three cards: **Academic Context**, **Schedule & Recurrence** (which also contains the multi-session builder), and **Additional Information**.

### 4.1 Academic Context

| Field | Logic |
|---|---|
| **Subject** * | Single dropdown of `SUBJECTS[].label`. The selected value is the full label string; at publish time the form looks the label up in `SUBJECTS` to recover `code` and `title`. |
| **Study Period** * | Dropdown of `STUDY_PERIODS`. **Changing it resets `startWeek` and `endWeek` to `undefined`** because the generated week list is period-specific. |
| **Cohort / Intake** | Optional dropdown of `COHORTS`; omitted from the record when empty. |

### 4.2 Schedule & Recurrence

| Field | Logic |
|---|---|
| **Start Week** * | Disabled until a study period is chosen (placeholder switches to "Select study period first"). Options = `availableWeeks` (memoised from the period's date range). |
| **End Week** * | Disabled until a start week is chosen. Options are **filtered to `weekNumber >= startWeek`**, so an inverted range is impossible to select. |
| **Number of Weeks** | Read-only, `endWeek − startWeek + 1`. |
| **Contact Hours (per week)** | Number input, min 1, step 0.5, default 2. Falls back to 2 on empty/invalid input. |
| **Total Contact Hours** | Read-only, `contactHours × numberOfWeeks`. |

At publish, the chosen week numbers are resolved to actual dates: `startDate` = the start week's `startDate`, `endDate` = the end week's `startDate` (both serialised to `YYYY-MM-DD`).

### 4.3 Multi-session builder

- The form always keeps **at least one session**; the delete (trash) button only renders when `sessions.length > 1`, and `removeSession` is a no-op at length 1.
- **Add Another Session** appends a default session: Monday, 09:00–11:00, Lecture, On-Campus, attendance tracking on, id `session-<timestamp>`.
- All edits go through `updateSession(id, partial)` — an immutable map over the sessions array.

Each session card has four subsections:

1. **Schedule row** — Day (Mon–Fri, stored as index 0–4), Start Time, End Time (native `time` inputs), Instructor (required dropdown).

2. **Delivery Details** — Delivery Type (6 options) and Delivery Method (3 options). The Delivery Method value drives conditional rendering:
   - `On-Campus` → shows **Location Details** (Campus dropdown, combined Building/Room dropdown).
   - `Online` → shows **Online Details** (Online Link text input).
   - `Blended` → shows **both** subsections.

3. **Location Details** — the Building/Room dropdown stores combined strings; on change the value is split on `" - Room "` and the `"Building "` prefix is stripped, so `building = "A"`, `room = "201"`. While both are set, **room conflict detection runs on every render** (see 4.5) and an amber warning appears inline: *"⚠️ Room conflict: This room is already booked for this time"*.

4. **Attendance Tracking** — a checkbox gates the whole subsection. When enabled it reveals Minimum Attendance (%, default 80) and Attendance Method (4 options, default "Instructor Marked").

### 4.4 Validation (on Publish)

`handlePublish` runs sequential guard checks, each showing a destructive toast and aborting:

1. Subject selected.
2. Study period selected.
3. Both start and end weeks selected.
4. At least one session exists.
5. **Every** session has an instructor.
6. The subject label resolves back to a `SUBJECTS` entry.
7. The study period id resolves to a `STUDY_PERIODS` entry.

On success it assembles the `ClassSchedule` (deriving `academicYear` from the period id, resolving week numbers to dates, and setting `color` from `sessions[0].deliveryType` via the type→color map), calls `addClass`, toasts "Class created successfully!", and navigates back to `/calendar`.

"Save as Draft" is present as a UI affordance but has no handler in the prototype.

### 4.5 Room conflict detection

```ts
const detectRoomConflict = (candidate) =>
  classes.some(cls =>
    cls.sessions.some(session =>
      session.day === candidate.day &&
      session.building === candidate.building &&
      session.room === candidate.room &&
      timeRangesOverlap(session.startTime, session.endTime,
                          candidate.startTime, candidate.endTime)
    )
  );

const timeRangesOverlap = (s1, e1, s2, e2) => s1 < e2 && e1 > s2;
```

Key characteristics:
- **String comparison is sufficient** because times are zero-padded `"HH:mm"`, so lexicographic order == chronological order.
- Overlap is the standard interval test: `start1 < end2 AND end1 > start2`. Back-to-back sessions (end == start) do **not** conflict.
- Matching requires same day **and** same building **and** same room — campus is intentionally not part of the key.
- It checks against existing classes only, **not** against other sessions in the form being built, and it is **advisory** — it warns but does not block publishing.

### 4.6 Additional Information

Free-text Description and Internal Notes; empty strings are stored as `undefined` to keep records clean.

---

## 5. Calendar View (`/calendar`)

### 5.1 View toggle

A `Tabs` control switches `viewMode` between `"calendar"` and `"list"`. Week navigation buttons (prev / Today / next) render **only in calendar mode**; in the prototype they are visual placeholders and the week is fixed to **March 10–14, 2025**. "Add Class" routes to the creation form in both modes.

### 5.2 Grid rendering logic

The grid is 6 columns (time gutter + Mon–Fri) × 10 hourly rows (8:00 AM–5:00 PM). Classes are flattened into positioned blocks:

```ts
const schedule = classes.flatMap(cls =>
  cls.sessions.map(session => {
    const startHour = parseInt(session.startTime.split(":")[0]);
    const startTimeIndex = startHour - 8;   // 8 AM → row 0
    const duration = parseInt(session.endTime.split(":")[0]) - startHour;
    return { day: session.day, startTime: startTimeIndex, duration, ... };
  })
);
```

- Each cell at `(dayIndex, timeIndex)` renders blocks where `s.day === dayIndex && s.startTime === timeIndex`.
- Block height = `duration × 80 − 8` px (80 px per row), absolutely positioned inside the cell so multi-hour classes span rows visually.
- Room label shows `"Online"` when the delivery method is Online, otherwise the room code.
- Colour comes from the class's `color` field (`bg-{type}/10 border-{type} text-{type}`), giving per-type coding; a legend above the grid maps colours to types.
- **Hour-boundary limitation:** row placement uses the start hour only — a 09:30 start lands in the 9 AM row, and duration is whole hours.

### 5.3 Mark attendance from the grid

Each block has a hover-revealed "Mark" button (`opacity-0 → group-hover:opacity-100`). Clicking it opens the `AttendanceMarkingDialog` with the class's subject/title, a fixed date ("March 10, 2025"), fixed time, and room.

---

## 6. Class List View

`src/components/ClassListTable.tsx` renders the same `classes` array as a table — one row per class, using **`sessions[0]`** as the representative session for schedule/instructor/location/attendance columns (a documented simplification for multi-session classes).

**Columns:** Subject (`CODE - Title`), Cohort/Intake (em-dash when unset), Type (colour-coded badge), Schedule (day name + time range), Instructor, Location ("Online" or room + campus), Attendance (green check + min % when tracked, muted ✕ otherwise), Actions.

**Filtering** — three AND-combined predicates:

```ts
matchesSearch = subject or title includes query (case-insensitive)
matchesType   = filter "all" OR any session has that deliveryType
matchesDay    = filter "all" OR any session has that day index
```

Note type/day filters match if **any** session matches, even though the row displays session 0.

**Actions per row:** Mark Attendance (opens the dialog with real dates/times derived from the record), Edit (placeholder), Delete (native `confirm()` then `deleteClass`).

---

## 7. Attendance Marking Dialog

`src/components/AttendanceMarkingDialog.tsx` is shared by Dashboard, Calendar, and List views. It receives `classInfo` (subject, title, date, time, room) and works against a hardcoded roster of 6 students.

**Interaction logic:**
- State is `Record<studentId, "present" | "absent" | "late" | "excused" | null>`.
- Status buttons are **toggles**: clicking the active status deselects it (back to unmarked); clicking another status switches.
- **Mark All Present** bulk-fills every student.
- A live counter shows *"N student(s) remaining"* in red, switching to *"All students marked ✓"* in green at zero.
- **Save validation:** if any student is unmarked, a destructive toast names the remaining count and aborts. On success it toasts confirmation, closes the dialog, and resets state. Nothing is persisted — records are discarded.

Each status has a dedicated colour token (`present`, `absent`, `late`, `excused`) used for the selected button state and the icons elsewhere.

---

## 8. Attendance Page (`/attendance`)

A read-only reporting view over a hardcoded matrix: 20 students × 6 subjects, each cell one of present/absent/late/excused, rendered as a coloured icon, plus a per-student overall rate.

- **Summary cards:** Average Attendance (87%), Below Threshold (count of students < 80%), Perfect Attendance (count at 100%), Late Arrivals this week.
- **Rate bar logic:** each row's progress bar is green (`bg-present`) when `rate >= 80`, red (`bg-destructive`) below — matching the default minimum-attendance threshold used in the creation form.
- **Filters:** cohort / subject / period selects (including "This Month") are present but non-functional — the dataset is static so the view is populated on first load.

---

## 9. Dashboard (`/`)

- Four static KPI cards (Active Subjects, Total Students, Classes This Week, Attendance Rate).
- **Today's Schedule** — three hardcoded classes with per-type colour styling and a Mark Attendance button each. The handler splits the combined `"CODE - Title"` string on `" - "` to populate the dialog (the inverse of the join used elsewhere).
- **Alerts & Notifications** — three hardcoded alerts styled by severity: high → destructive tint, medium → late/amber tint, low → primary tint.

---

## 10. Settings (`/settings`)

Four configuration cards. Only one piece of state is real:

- **Scheduling Framework → Available Days**: a horizontal row of seven checkboxes backed by a `schedulingDays` object (`Mon–Fri: true`, `Sat–Sun: false` by default). `toggleDay` flips a key immutably. **In the prototype this state is local to the page** — it does not yet propagate to the calendar grid columns or the form's day dropdown (both hardcode Mon–Fri).
- Start/End Time inputs (08:00–19:00 defaults), Standard Class Duration select, Break Duration — visual only.
- Academic Calendar Setup, Holiday Management, and Attendance Configuration cards are form scaffolds with no handlers; Save buttons are inert.

---

## 11. Design System Logic

- Tailwind semantic tokens defined in `src/index.css`/`tailwind.config.ts`; components never hardcode colours.
- Delivery-type tokens (`lecture`, `lab`, `tutorial`, `workshop`, `online`, `practical`) are applied via a repeated `typeColorMap` pattern: `bg-{type}/10 border-{type} text-{type}` for blocks and `bg-{type}/10 text-{type} border-{type}/30` for badges.
- Attendance statuses map to `present` / `absent` / `late` / `excused` tokens consistently across the dialog, table, and dashboard.
- Radix constraint: every `SelectItem` has a non-empty `value` (empty-string values crash Radix selects); "no selection" is represented by placeholder text, and "all" filters use the literal value `"all"`.

---

## 12. Known Limitations (Logic-Level)

1. **No persistence** — context state resets on refresh; attendance marks are discarded on save.
2. **Week navigation is static** — the calendar is pinned to Mar 10–14, 2025.
3. **Grid time resolution is 1 hour** — half-hour starts/ends round to the hour.
4. **List view shows session 0 only** for multi-session classes, while filters consider all sessions.
5. **Room conflicts are advisory** — they warn but don't block; instructor conflicts and intra-form session conflicts aren't checked.
6. **Settings day selection is not wired** to the calendar grid or creation form.
7. **Edit and Save-as-Draft are placeholders** with no handlers.
8. **Attendance page filters are decorative**; the matrix is static seed data.

## 13. Future Enhancements (v2)

1. Persistence via Lovable Cloud (Postgres + auth) for classes, sessions, and attendance records.
2. Role-based access (admin / coordinator / instructor) via a separate `user_roles` table.
3. Wire Scheduling Framework settings into calendar columns and form day options.
4. Sub-hour grid resolution and working week navigation.
5. Blocking conflict validation, instructor clash detection, and cross-session checks within the form.
6. Bulk class creation from templates; real room-availability integration.
7. Notifications for low attendance and class reminders.
