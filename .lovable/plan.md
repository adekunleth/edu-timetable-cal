## Plan: Create PRD Document

Create a new file `PRD.md` at the project root containing a detailed Product Requirements Document for ClassLens based on what has been implemented so far.

### Document Structure

1. **Overview** — Product name, vision, problem statement, target users (academic administrators, course coordinators, timetabling officers).

2. **Goals & Non-Goals** — Prototype goals (validate unified scheduling UX) and explicit non-goals (no backend persistence, no multi-tenant auth).

3. **User Personas** — Admin, Course Coordinator, Instructor.

4. **Information Architecture** — Sidebar navigation: Dashboard, Calendar, Subjects, Attendance, Cohorts, Reports, Settings.

5. **Feature Specifications** (detailed per module):
   - **Dashboard** — Stats cards (active subjects, students, classes/week, attendance rate), today's schedule with mark-attendance action, alerts panel.
   - **Calendar View** — Weekly grid + list view toggle, filters (type, day, cohort), "Add Class" entry point, color coding by delivery type.
   - **Class Creation Form** — Sections: Academic Context (Subject dropdown combining code+title, academic year, study period, cohort), Schedule & Recurrence (start/end weeks derived from study period, excluded dates), Sessions (multi-session builder with day, time, instructor, delivery type/method, campus/building/room or online link, conditional fields), Attendance config (track toggle, min %, method), Description/notes/attachments. Auto-calculations: contact hours, total hours, number of weeks. Conflict detection for room/instructor.
   - **Class List Table** — Columns: Subject (code + title), Cohort/Intake, Day, Time, Instructor, Type, Location. Sort/filter/search.
   - **Attendance** — Session-based marking dialog (present/absent/late/excused), monthly summary view, "this month" filter with sample data.
   - **Subjects, Cohorts, Reports** — Stub/placeholder pages.
   - **Settings → Scheduling Framework** — Horizontal day selector (Mon–Fri default checked, Sat/Sun optional), operating start/end time, standard class durations. Selected days drive Calendar columns and form options.

6. **Data Model (Frontend Types)** — `ClassSchedule`, `ClassSession`, enums for `DeliveryType`, `DeliveryMethod`, `AttendanceMethod`. State managed via `ClassesContext`.

7. **Dropdown Reference Data** — Subjects, Instructors, Campuses, Buildings/Rooms, Study Periods, Cohorts (from `dropdownOptions.ts`).

8. **Business Rules** — Week generation from study period dates, conditional field visibility (delivery method), attendance threshold defaults.

9. **UX & Design System** — shadcn/ui, Tailwind semantic tokens, color coding per delivery type (lecture/lab/tutorial/workshop/online).

10. **Tech Stack** — React 18, Vite, TypeScript, Tailwind, shadcn/ui, React Router, React Query, date-fns.

11. **Known Limitations** — In-memory state only (no persistence), no auth, conflict detection is client-side, sample/seed data.

12. **Future Enhancements (v2)** — Lovable Cloud persistence, real room booking integration, bulk template creation, role-based access, notifications.

### Deliverable

Single new file: `PRD.md` at project root. No code changes.
