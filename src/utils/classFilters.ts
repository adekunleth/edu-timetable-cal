import { ClassSchedule } from "@/types/classForm";
import { COHORTS } from "@/constants/dropdownOptions";
import { getCampusNameForRoom } from "@/constants/locations";
import { ClassFilters } from "@/contexts/FiltersContext";

const cohortCourseId = (cohortId: string): string | undefined =>
  COHORTS.find((c) => c.id === cohortId)?.courseId;

/** CR-001 §8.4 — a class matches a course either directly or via a cohort. */
export function matchesCourse(cls: ClassSchedule, courseId: string): boolean {
  if (courseId === "all") return true;
  if (cls.courseId === courseId) return true;
  return (cls.cohortIds ?? []).some((id) => cohortCourseId(id) === courseId);
}

/** CR-001 §8.3 — "all" keeps cohort-less classes visible. */
export function matchesCohort(cls: ClassSchedule, cohortId: string): boolean {
  const ids = cls.cohortIds ?? [];
  if (cohortId === "all") return true;
  if (cohortId === "unassigned") return ids.length === 0;
  return ids.includes(cohortId);
}

/** All active filters combine with AND; "all"/"" are no-ops (CR-001 §8.1). */
export function matchesFilters(cls: ClassSchedule, filters: ClassFilters): boolean {
  const q = filters.search.trim().toLowerCase();
  const matchesSearch =
    !q ||
    cls.subject.toLowerCase().includes(q) ||
    cls.title.toLowerCase().includes(q);

  const matchesSubject =
    filters.subject === "all" || cls.subject === filters.subject;

  // Session-level filters: any session may satisfy them (CR-001 §8.5)
  const matchesInstructor =
    filters.instructor === "all" ||
    cls.sessions.some((s) => s.instructor === filters.instructor);
  const matchesCampus =
    filters.campus === "all" ||
    cls.sessions.some((s) => getCampusNameForRoom(s.roomId) === filters.campus);
  const matchesDelivery =
    filters.deliveryType === "all" ||
    cls.sessions.some((s) => s.deliveryType === filters.deliveryType);
  const matchesDay =
    filters.day === "all" ||
    cls.sessions.some((s) => s.day === parseInt(filters.day, 10));

  return (
    matchesSearch &&
    matchesCourse(cls, filters.courseId) &&
    matchesCohort(cls, filters.cohortId) &&
    matchesSubject &&
    matchesInstructor &&
    matchesCampus &&
    matchesDelivery &&
    matchesDay
  );
}

export function filterClasses(
  classes: ClassSchedule[],
  filters: ClassFilters
): ClassSchedule[] {
  return classes.filter((cls) => matchesFilters(cls, filters));
}
