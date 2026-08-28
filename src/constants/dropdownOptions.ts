// Dropdown options for class creation and scheduling

export interface CatalogSubject {
  code: string;
  title: string;
  label: string;
  /** Programmes/courses this subject belongs to (CR-002). */
  courseIds: string[];
}

export const SUBJECTS: CatalogSubject[] = [
  { code: "BIO101", title: "Anatomy Basics", label: "BIO101 - Anatomy Basics", courseIds: ["BSC-BIO"] },
  { code: "MATH301", title: "Advanced Calculus", label: "MATH301 - Advanced Calculus", courseIds: ["BENG-MEC", "BIT-CS"] },
  { code: "PHYS202", title: "Quantum Physics", label: "PHYS202 - Quantum Physics", courseIds: ["BSC-BIO", "BENG-MEC"] },
  { code: "CHEM202", title: "Organic Chemistry", label: "CHEM202 - Organic Chemistry", courseIds: ["BSC-BIO"] },
  { code: "CS101", title: "Introduction to Programming", label: "CS101 - Introduction to Programming", courseIds: ["BIT-CS"] },
  { code: "ENG201", title: "Technical Writing", label: "ENG201 - Technical Writing", courseIds: ["BIT-CS", "BBUS", "BENG-MEC"] },
];

export const getSubjectsForCourse = (courseId?: string): CatalogSubject[] =>
  courseId && courseId !== "all"
    ? SUBJECTS.filter((s) => s.courseIds.includes(courseId))
    : SUBJECTS;


export const INSTRUCTORS = [
  "Dr. Sarah Nguyen",
  "Prof. Michael Chen",
  "Dr. Emily Johnson",
  "Dr. James Wilson",
  "Dr. Maria Garcia",
  "Prof. Robert Taylor",
];

// Campus names are derived from the location master data (Campus -> Venue -> Room).
export { CAMPUS_NAMES as CAMPUSES } from "@/constants/locations";

export const STUDY_PERIODS = [
  { id: "2025-S1", label: "2025 Semester 1", startDate: "2025-02-24", endDate: "2025-06-27" },
  { id: "2025-S2", label: "2025 Semester 2", startDate: "2025-07-21", endDate: "2025-11-21" },
  { id: "2026-S1", label: "2026 Semester 1", startDate: "2026-02-23", endDate: "2026-06-26" },
];

// ---------------------------------------------------------------------------
// Course reference entity (CR-001 §4.1). Selection value is `id`, not `label`.
// ---------------------------------------------------------------------------
export interface Course {
  id: string;
  code: string;
  title: string;
  label: string;
}

export const COURSES: Course[] = [
  { id: "BSC-BIO", code: "BSC-BIO", title: "Bachelor of Science (Biology)", label: "BSC-BIO - Bachelor of Science (Biology)" },
  { id: "BIT-CS", code: "BIT-CS", title: "Bachelor of Information Technology", label: "BIT-CS - Bachelor of Information Technology" },
  { id: "BBUS", code: "BBUS", title: "Bachelor of Business", label: "BBUS - Bachelor of Business" },
  { id: "BENG-MEC", code: "BENG-MEC", title: "Bachelor of Engineering (Mechanical)", label: "BENG-MEC - Bachelor of Engineering (Mechanical)" },
];

// ---------------------------------------------------------------------------
// Cohort reference entity (CR-001 §4.2). Labels kept verbatim from v0.2.
// ---------------------------------------------------------------------------
export interface Cohort {
  id: string;
  label: string;
  courseId: string;
}

export const COHORTS: Cohort[] = [
  { id: "2025-S1-BIO", label: "2025 S1 Intake", courseId: "BSC-BIO" },
  { id: "2025-S2-BIO", label: "2025 S2 Intake", courseId: "BSC-BIO" },
  { id: "2024-S2-CS", label: "2024 S2 Intake", courseId: "BIT-CS" },
  { id: "INTL-A", label: "International Cohort A", courseId: "BIT-CS" },
  { id: "INTL-B", label: "International Cohort B", courseId: "BBUS" },
];

export const getCohortsForCourse = (courseId?: string): Cohort[] =>
  courseId && courseId !== "all"
    ? COHORTS.filter((c) => c.courseId === courseId)
    : COHORTS;

/** Falls back to the raw id when a cohort is unknown (CR-001 §11.5). */
export const getCohortLabel = (cohortId: string): string =>
  COHORTS.find((c) => c.id === cohortId)?.label ?? cohortId;

export const getCourseCode = (courseId?: string): string | undefined =>
  courseId ? COURSES.find((c) => c.id === courseId)?.code ?? courseId : undefined;
