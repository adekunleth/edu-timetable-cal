// ---------------------------------------------------------------------------
// Enrollment derivation.
//
// There is no "enrolled students" field on a class. Students belong to
// cohorts, cohorts are assigned to classes, so:
//
//   class enrollment = sum of sizes of the class's cohorts
//   class capacity   = smallest Room.capacity across physical sessions
//
// Online-only classes have no capacity ceiling (undefined).
// ---------------------------------------------------------------------------

import { COHORTS } from "@/constants/dropdownOptions";
import { getRoomCapacity } from "@/constants/locations";
import { ClassSchedule } from "@/types/classForm";

export const getCohortSize = (cohortId: string): number =>
  COHORTS.find((c) => c.id === cohortId)?.size ?? 0;

/** Total students implied by the class's cohort assignments (0 = unassigned). */
export function getClassEnrollment(cls: Pick<ClassSchedule, "cohortIds">): number {
  return (cls.cohortIds ?? []).reduce((sum, id) => sum + getCohortSize(id), 0);
}

/** Capacity ceiling: the smallest physical room the class uses. */
export function getClassCapacity(
  cls: Pick<ClassSchedule, "sessions">
): number | undefined {
  const caps = cls.sessions
    .filter((s) => s.deliveryMethod !== "Online" && s.roomId)
    .map((s) => getRoomCapacity(s.roomId))
    .filter((n): n is number => n != null);
  return caps.length ? Math.min(...caps) : undefined;
}

/** True when the derived enrollment exceeds the room capacity. */
export function isOverCapacity(cls: ClassSchedule): boolean {
  const cap = getClassCapacity(cls);
  return cap != null && getClassEnrollment(cls) > cap;
}
