# Attendance Tracking: Drillable Metric Cards + Student Search

Two gaps in the staff (admin/instructor) Attendance view: the summary cards show counts (e.g. "Below Threshold: 3") with no way to see *which* students, and there is no search for large rosters.

## 1. Clickable metric cards (staff view only)

Each of the four summary cards becomes a toggle that filters the Attendance Records table to the students behind that number:

- **Average Attendance** — not clickable (it's an aggregate, not a subset); stays static.
- **Below Threshold** — clicking filters the table to students with overall rate < 80%.
- **Perfect Attendance** — clicking filters to students at 100%.
- **Late Arrivals** — clicking filters to students with at least one "late" status in the visible subject columns.

Behavior:
- Clicking a card toggles the filter on/off; clicking another card switches to it.
- The active card gets a visual highlight (ring/accent border) so it's clear a filter is applied.
- When a card filter is active, a small "Clear" chip/button appears above the table to reset.
- Card filters combine with the existing course/cohort/subject/period filters (they filter the already-filtered rows).
- Cards recompute their counts from the current course/cohort/subject/period filter state, as they already do.

Student view is unchanged — its cards describe personal stats and there's only one student.

## 2. Student search (staff view only)

- Add a search input (with a search icon) to the filter bar card, next to the period selector, labelled by placeholder "Search student name or ID…".
- Case-insensitive substring match against both student name and student ID.
- Combines with all other filters and the card filter.
- When search yields no rows, the existing `FiltersEmptyState` is shown.

## Technical notes

- All changes confined to `src/pages/Attendance.tsx`.
- New state: `cardFilter: "none" | "below" | "perfect" | "late"` and `studentSearch: string`, both applied in the `filteredRecords` memo chain.
- No changes to student-role logic, privacy scoping, or the breakdown dialog.
