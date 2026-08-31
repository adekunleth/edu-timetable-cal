# Plan: Class Enrollment Counts from Cohort Sizes

## Current state (verified)
- `ClassSchedule` has **no** enrolled-students field — classes know their cohorts (`cohortIds`) and room capacity (from `Room`), but not how many students are enrolled.
- Cohort student counts exist only as a hardcoded local array inside `src/pages/Cohorts.tsx` (e.g. `students: 45`) — not shared with the rest of the app.
- Attendance (`src/pages/Attendance.tsx`) synthesizes student records by cycling `COHORT_CYCLE` — a fake roster, not linked to cohort sizes.
- Room capacity exists via `Room.capacity` (location master data) but is never compared to enrollment.

So today there is no single answer to "how many students are/can be enrolled in this class."

## Proposed model
Enrollment is **derived, not typed in**:

```
Class enrollment = sum of sizes of the cohorts assigned to the class
Class capacity ceiling = Room.capacity (already exists)
```

This mirrors how it works in practice: students belong to cohorts, cohorts are assigned to classes, so class size falls out of the cohort assignments automatically.

## Changes

1. **Cohort entity gains `size`** (`src/constants/dropdownOptions.ts`)
   - Add `size: number` to the `Cohort` interface; seed realistic sizes (25–45) matching the Cohorts page numbers.

2. **Cohorts page reads from the shared entity**
   - Replace the local hardcoded array in `src/pages/Cohorts.tsx` with the shared `COHORTS` data so there is one source of truth (student count column now comes from `cohort.size`).

3. **Enrollment helpers** (`src/utils/enrollment.ts`, new)
   - `getClassEnrollment(cls)` → sum of `COHORTS.find(c => c.id).size` over `cls.cohortIds` (0 when unassigned).
   - `getClassCapacity(cls)` → max `Room.capacity` across the class's physical sessions (undefined for online-only).

4. **Add Class form** (`src/pages/ClassCreationForm.tsx`)
   - Read-only **Estimated Enrollment** field under the cohort multi-select, updating live as cohorts are toggled.
   - **Capacity warning**: when a selected room's capacity < estimated enrollment, show an amber warning (advisory, same pattern as the room-conflict warning — does not block publishing).

5. **Class Schedule list** (`src/components/ClassListTable.tsx`)
   - New **Enrollment** column showing `enrolled / capacity` (e.g. `77 / 80`), or just the enrolled number for online classes; over-capacity shown in red.

6. **Attendance**
   - No change to the synthetic roster for now (documented limitation), but the attendance header for staff can show the class/cohort enrollment figure.

## Out of scope
- Individual student enrollment records (a real SIS would have per-student enrollment; the prototype derives counts from cohorts).
- Waitlists / manual enrollment overrides.

## Docs
- Update `PRD.md` and `classlens-schema-and-overview.md` with the enrollment derivation rule and the capacity-check logic.
