

## README Content

Replace the current `README.md` with the following:

```markdown
# ClassLens — Academic timetabling and attendance management prototype

**Live demo →** [id-preview--d4889981-6e28-4b24-8f4e-25dc6e594c73.lovable.app](https://id-preview--d4889981-6e28-4b24-8f4e-25dc6e594c73.lovable.app)

A prototype built to explore whether a single, unified interface can handle the full complexity of academic class scheduling — from multi-session creation with conditional delivery modes to real-time conflict detection and attendance tracking.

## What it is

ClassLens is a timetabling tool for higher education administrators who need to create, schedule, and monitor classes across multiple campuses, delivery formats (on-campus, online, blended), and student cohorts. It was built to validate whether a form-driven workflow with smart defaults, automatic calculations, and inline conflict warnings could replace the spreadsheet-heavy processes many institutions still rely on. The target users are academic administrators, course coordinators, and timetabling officers.

## Screenshots

*(Add screenshots of the Dashboard, Calendar/List view, and Class Creation Form here)*

## Core features

- **Class creation form** — A multi-section form with conditional logic (delivery method toggles location vs. online fields), automatic calculations (contact hours, total hours, week counts), instructor and room conflict detection, and week-based scheduling tied to semester periods.

- **Calendar and list view toggle** — View all scheduled classes on a weekly calendar grid or switch to a filterable, sortable table view with search, type/day filters, and cohort visibility.

- **Attendance tracking** — Mark attendance per class session with present/absent/late/excused statuses, view monthly attendance summaries per student, and configure minimum attendance thresholds per session.

- **Scheduling framework settings** — Configure available days (Monday–Sunday), operating hours, and standard class durations to control what appears on the calendar and what options are available during class creation.

- **Dashboard with alerts** — Overview of active subjects, student counts, weekly class totals, attendance rates, and scheduling conflict notifications.

## Stack

Built with [Lovable](https://lovable.dev) — React, TypeScript, Tailwind CSS, shadcn/ui, React Router, React Query.

## What I learned / what I'd do differently

The prototype confirmed that the most valuable feature is the conditional session builder — being able to define mixed delivery modes (e.g., Monday lecture on-campus, Thursday tutorial online) within a single class record dramatically reduces the number of separate entries administrators need to create. A v2 would prioritise backend persistence with Supabase, real-time room availability checks against a booking system, and a bulk class creation flow using templates for common configurations.

## Status

Prototype — not actively maintained.
```

### Implementation

Single file change — replace the entire contents of `README.md` with the content above.

