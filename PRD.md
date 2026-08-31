# ClassLens — Product Requirements Document (Detailed Logic Specification)

**Version:** 0.4 (Prototype — adds derived Class Enrollment from cohort sizes)
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

A second provider, `FiltersProvider` (`src/contexts/FiltersContext.tsx`), sits alongside it and holds the shared browsing filters (course, cohort, subject, instructor, campus, type, day, search). It is mounted above the router so filter selections survive navigation between Calendar, List and Attendance — see §14.

### 2.2 Seed data

Six `ClassSchedule` records ship as initial state (`initialClasses`), covering every delivery type and method: on-campus Lecture/Lab/Tutorial/Workshop sessions and one fully Online session with `trackAttendance: false`. Seed records use realistic overlapping-free slots across Mon–Fri so the calendar grid is populated on first load.

### 2.3 Reference data

`src/constants/dropdownOptions.ts` holds the canonical option lists used by dropdowns throughout the app:

- **SUBJECTS** — 6 entries as `{ code, title, label, courseIds, credits }` where `label = "CODE - Title"` (e.g. `"BIO101 - Anatomy Basics"`). The label is the stored selection value; code and title are recovered from it at publish time. `courseIds` scopes the Add Class dropdown to the selected course; `credits` is surfaced in the class list via `getSubjectCredits`. This catalogue stands in for an external subject-management module and is read-only in the prototype.
- **INSTRUCTORS** — 6 names.
- **CAMPUSES** — Sydney, Melbourne, Brisbane, Perth.
- **BUILDINGS_ROOMS** — 7 entries in the combined format `"Building X - Room NNN"`. The form splits this string on `" - Room "` to populate separate `building` and `room` fields.
- **STUDY_PERIODS** — each has `{ id, label, startDate, endDate }` (e.g. `2025-S1`, `"2025 Semester 1"`, `2025-02-24` → `2025-06-27`). The dates drive week generation.
- **COURSES** — 4 course entities as `{ id, code, title, label }` (`BSC-BIO`, `BIT-CS`, `BBUS`, `BENG-MEC`). Selection value is `id`, never the label.
- **COHORTS** — 5 cohort entities as `{ id, label, courseId, size }`, each owned by exactly one course. `size` is the number of students in the cohort and is the **single source of truth for enrollment counts** — see §15. Helpers: `getCohortsForCourse(courseId)` (returns all cohorts when the argument is `"all"`/undefined), `getCohortLabel(id)` (falls back to the raw id for unknown ids), `getCourseCode(id)`.

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
  courseId?: string;        // FK → COURSES.id; optional (quick-publish flow)
  cohortIds: string[];      // FK[] → COHORTS.id; [] means "unassigned", never undefined
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
| **Subject** * | Single dropdown of `SUBJECTS[].label`, scoped by the selected course via `getSubjectsForCourse(courseId)` — when a course is chosen, only subjects whose `courseIds` include it are listed (all subjects when no course is chosen), and a hint line explains the scoping. Changing the course clears the selected subject if it is not linked to the new course (same pruning pattern as cohorts). The selected value is the full label string; at publish time the form looks the label up in `SUBJECTS` to recover `code` and `title`. The catalogue itself is read-only reference data owned by an external subject module; it also carries `credits`, surfaced in the class list. |
| **Study Period** * | Dropdown of `STUDY_PERIODS`. **Changing it resets `startWeek` and `endWeek` to `undefined`** because the generated week list is period-specific. |
| **Course** | Optional dropdown of `COURSES` (value = `Course.id`). Changing it **prunes any selected cohorts that do not belong to the new course**. |
| **Cohort / Intake** | Optional multi-select (`CohortMultiSelect`, Popover + Command + checkbox list). Options are `getCohortsForCourse(courseId)` — all cohorts when no course is chosen. Stored as `cohortIds: string[]`; an empty array is persisted (never `undefined`). The trigger shows up to two cohort labels then `+N`. |

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

A `ClassFilterBar` sits above the toggle and applies to **both** views: switching between calendar and list preserves the active filters, since the state lives in `FiltersContext` rather than the page.

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

**Columns:** Subject (`CODE - Title`), Course (course code, em-dash when unset), Credits (derived from the subject catalogue via `getSubjectCredits(cls.subject)`; em-dash when the code is not in the catalogue), Cohort/Intake (badge per cohort; two badges then a `+N` badge whose tooltip lists the remainder — the tooltip trigger wraps the badge in a `span` because Radix cannot attach a ref to the Badge component; em-dash when unassigned), **Enrollment** (`enrolled / capacity`, derived per §15 — em-dash when no cohorts are assigned; capacity omitted for online-only classes; the figure renders in destructive red with a warning tooltip when enrollment exceeds the smallest room capacity), Type (colour-coded badge), Schedule (day name + time range), Instructor, Location ("Online" or room + campus), Attendance (green check + min % when tracked, muted ✕ otherwise), Actions.

**Filtering** — the table consumes the shared `FiltersContext` (see §14) via `filterClasses`, so search, course, cohort, subject, instructor, campus, type and day all apply here with the exact same predicates as the calendar grid. When the result set is empty it renders `FiltersEmptyState` with a "Clear filters" button.

Note session-level filters (instructor, campus, type, day) match if **any** session matches, even though the row displays session 0.

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

A reporting view over a hardcoded matrix: 20 students × 6 subjects, each cell one of present/absent/late/excused, rendered as a coloured icon, plus a per-student overall rate. Every student record now carries a `cohortId` (and therefore an implied course), so the shared filter bar applies here too.

- **Filtering:** the page renders `ClassFilterBar` with the course/cohort/subject subset of controls. Students are filtered by cohort → course membership; subject filtering narrows the **columns** shown rather than the rows.
- **Summary cards:** Average Attendance, Below Threshold (< 80%), Perfect Attendance (100%), Late Arrivals — all recomputed from the *filtered* student set, and rendered as `—` when the filters exclude everyone.
- **Rate bar logic:** each row's progress bar is green (`bg-present`) when `rate >= 80`, red (`bg-destructive`) below — matching the default minimum-attendance threshold used in the creation form.
- Filter selections persist when navigating between Calendar, List and Attendance because the provider sits above the router.

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
8. **Attendance matrix is static seed data** — filters narrow it, but no marks are written back.
9. **Cohorts are class-level, not session-level** — a split tutorial cannot be scoped to one cohort while the lecture serves all (see §14.7).
10. **Course is optional** on a class, so a course filter relies on cohort inference for records that omit it.

## 13. Future Enhancements (v2)

1. Persistence via Lovable Cloud (Postgres + auth) for classes, sessions, and attendance records.
2. Role-based access (admin / coordinator / instructor) via a separate `user_roles` table.
3. Wire Scheduling Framework settings into calendar columns and form day options.
4. Sub-hour grid resolution and working week navigation.
5. Blocking conflict validation, instructor clash detection, and cross-session checks within the form.
6. Bulk class creation from templates; real room-availability integration.
7. Notifications for low attendance and class reminders.
8. Session-level cohort assignment and URL-encoded filter state (shareable filtered views).

---

## 14. Course & Cohort Scoping (CR-001)

### 14.1 Rationale

Before CR-001 a cohort was a free-text label on a class and nothing consumed it. Timetabling officers work per course intake, so every browsing surface (calendar, list, attendance) needed to be scopable to a Course and/or Cohort, with the selection surviving navigation between screens.

### 14.2 Reference model

```
Course (1) ──< Cohort (n) ──< (m) ClassSchedule.cohortIds
                  ClassSchedule.courseId ─────┘ (optional direct link)
```

- A cohort belongs to exactly one course (`Cohort.courseId`).
- A class may reference a course directly, a set of cohorts, both, or neither.
- Selection values are always ids; labels are derived for display only.

### 14.3 Shared filter state

`src/contexts/FiltersContext.tsx` holds one object mounted above the router in `App.tsx`, so state persists across route changes and resets only on refresh:

```ts
interface ClassFilters {
  search: string;         // free text
  courseId: string;       // "all" | Course.id
  cohortId: string;       // "all" | "unassigned" | Cohort.id
  subject: string;        // "all" | subject code
  instructor: string;     // "all" | instructor name
  campus: string;         // "all" | campus name
  deliveryType: string;   // "all" | DeliveryType
  day: string;            // "all" | "0".."4"
}
```

- `setFilter(key, value)` is immutable and encodes one dependency: **setting `courseId` resets `cohortId` to `"all"`**, because the cohort options list is course-dependent and a stale cohort would silently produce zero results.
- `resetFilters()` restores `defaultFilters` (every key `"all"`, search empty).
- `activeFilterCount` (memoised) counts keys that are not `"all"`, treating `search` as active only when it is non-blank after trimming. It drives the "Clear filters (N)" button, which only renders above zero.

### 14.4 Filter predicates

`src/utils/classFilters.ts` is the single source of truth, so every screen filters identically.

```ts
matchesCourse(cls, courseId)
  = courseId === "all"
  || cls.courseId === courseId
  || cls.cohortIds.some(id => COHORTS.find(c => c.id === id)?.courseId === courseId);

matchesCohort(cls, cohortId)
  = cohortId === "all"        ? true
  : cohortId === "unassigned" ? cls.cohortIds.length === 0
  :                             cls.cohortIds.includes(cohortId);
```

Rules encoded:
- **Course match is transitive** — a class tagged only with cohort `2025-S1-BIO` still matches course `BSC-BIO`. This keeps legacy/quick-published records reachable.
- `"all"` is a no-op, so cohort-less classes remain visible until the user explicitly asks for `"unassigned"`.
- **Session-level filters (instructor, campus, delivery type, day) use `.some()`** over sessions — a class surfaces if any one of its sessions qualifies.
- Search matches subject code or title, case-insensitively, on the trimmed query.
- All predicates combine with **AND** in `matchesFilters`; `filterClasses(classes, filters)` is the array-level wrapper.

### 14.5 Shared filter bar

`src/components/ClassFilterBar.tsx` renders the controls and takes a `visible` prop listing which keys to show, so each screen exposes only the relevant subset (the calendar hides nothing; attendance shows course/cohort/subject). Cohort options come from `getCohortsForCourse(filters.courseId)` plus the fixed `All cohorts` and `Unassigned` entries. `FiltersEmptyState` is exported alongside it for the "no results" case.

### 14.6 Screen behaviour

| Screen | Applied to |
|---|---|
| **Calendar grid** | `filterClasses` runs before the sessions are flattened into blocks, so filtered-out classes vanish from the grid entirely; the legend stays fixed. |
| **List table** | Rows filtered; Course and Cohort columns added; empty state with clear-filters CTA. |
| **Attendance** | Students filtered by cohort/course; subject filter narrows visible columns; summary cards recomputed from the filtered set. |

### 14.7 Deliberate exclusions

- **Course/cohort admin CRUD screens** are out of scope; both lists remain static reference data.
- **Course is not made mandatory** on the creation form — that would break the existing quick-publish flow.
- **Session-level cohorts** are deferred; class-level assignment is the interim model.
- Filter state is not encoded in the URL, so filtered views are not yet shareable.

### 14.8 Seed data coverage

The six seeded classes deliberately exercise every branch: a single-cohort class, a two-cohort class, a class with a course but cohorts from that course, a class with cohorts spanning two courses, a class tagged by cohort only (no `courseId`, to exercise transitive course matching), and one class with `cohortIds: []` (to exercise the `unassigned` filter).
