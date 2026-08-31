# Plan: Remove Subjects Tab, Fold Outstanding Data into Class Schedule

Subjects are managed in an external module in the real product, so the Subjects tab in this prototype is redundant. Remove it and preserve the two things only it currently provides: course-scoped subject options and per-subject credits.

## Changes

### 1. Remove the Subjects tab
- Delete `src/pages/Subjects.tsx` (the offering/allocation manager with its Add/Edit Subject dialog).
- Remove the `/subjects` route from `src/App.tsx` and its import.
- Remove the "Subjects" item from the sidebar in `src/components/Layout.tsx`.
- Redirect safety: any leftover navigation to `/subjects` falls through to the existing catch-all route.

### 2. Keep the subject catalogue (read-only source data)
- `SUBJECTS` and `getSubjectsForCourse` in `src/constants/dropdownOptions.ts` stay — they are the prototype's stand-in for the external subject module and feed the Add Class subject dropdown.

### 3. Move outstanding functionality to Class Schedule
- **Course-scoped subject dropdown:** the Add Class form currently lists all subjects. Wire its Subject field to `getSubjectsForCourse(selectedCourseId)` so only subjects linked to the chosen course appear; changing the course clears an invalid subject selection (same pattern as cohort pruning).
- **Credits:** add `credits: number` to `CatalogSubject` and the seeded entries. Show a Credits column in `src/components/ClassListTable.tsx`, resolved from the catalogue by subject code (no new field on `ClassSchedule` — derived, like location labels).
- **Student counts:** skip — enrolment counts belong to cohorts (already shown on the Cohorts tab), not classes.

### 4. Dependent touch-ups
- `src/pages/Dashboard.tsx`: the "Active Subjects" stat card is a hardcoded value — no dependency on the deleted page, but verify it still reads sensibly.
- `src/pages/Attendance.tsx` and `src/pages/Cohorts.tsx` use their own local subject lists — no change needed; verify nothing imports from `Subjects.tsx`.
- Update `PRD.md` and `classlens-schema-and-overview.md` to remove the Subjects module and document the subject catalogue as external reference data.

## Technical notes
- Files touched: delete `src/pages/Subjects.tsx`; edit `src/App.tsx`, `src/components/Layout.tsx`, `src/pages/ClassCreationForm.tsx`, `src/constants/dropdownOptions.ts`, `src/components/ClassListTable.tsx`, `PRD.md`, `classlens-schema-and-overview.md`.
- No type changes to `ClassSchedule`/`ClassSession`; credits are derived at render time.
- Verify with `bunx tsgo --noEmit -p tsconfig.app.json` and a Playwright pass: sidebar has no Subjects item, `/subjects` redirects, Add Class subject dropdown filters by course, list view shows Credits.
