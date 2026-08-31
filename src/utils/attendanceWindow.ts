// Attendance marking window logic.
// Rule: marking OPENS when a class starts and CLOSES `windowHours` after it ends.
// All times use the browser's local timezone.

export type WindowStatus = "upcoming" | "open" | "closed";

export interface WindowInfo {
  status: WindowStatus;
  /** When marking opens (= class start). */
  opensAt: Date;
  /** When marking closes (= class end + windowHours). */
  closesAt: Date;
  /** Hours left to mark, or null when not yet open. */
  hoursRemaining: number | null;
}

export function getWindowStatus(
  start: Date,
  end: Date,
  windowHours: number,
  now: Date = new Date()
): WindowInfo {
  const closesAt = new Date(end.getTime() + windowHours * 3_600_000);

  if (now < start) {
    return { status: "upcoming", opensAt: start, closesAt, hoursRemaining: null };
  }
  if (now > closesAt) {
    return { status: "closed", opensAt: start, closesAt, hoursRemaining: 0 };
  }
  return {
    status: "open",
    opensAt: start,
    closesAt,
    hoursRemaining: (closesAt.getTime() - now.getTime()) / 3_600_000,
  };
}

/** Monday 00:00 of the week containing `now`. */
export function getWeekStart(now: Date = new Date()): Date {
  const d = new Date(now);
  const diff = (d.getDay() + 6) % 7; // days since Monday
  d.setDate(d.getDate() - diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

/**
 * Parse "09:00", "9:00", or "9:00 AM" onto the given base date.
 * Returns a copy of `base` with hours/minutes set.
 */
export function parseTimeToDate(base: Date, time: string): Date {
  const match = time.trim().match(/^(\d{1,2}):(\d{2})(?::\d{2})?\s*(AM|PM)?$/i);
  const d = new Date(base);
  if (!match) return d;
  let h = parseInt(match[1], 10);
  const m = parseInt(match[2], 10);
  const meridiem = match[3]?.toUpperCase();
  if (meridiem === "PM" && h !== 12) h += 12;
  if (meridiem === "AM" && h === 12) h = 0;
  d.setHours(h, m, 0, 0);
  return d;
}

/** "Aug 31" */
export function formatDateLabel(date: Date): string {
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

/** "August 31, 2026" */
export function formatFullDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

/** "36h" or "1d 12h" */
export function formatHoursRemaining(hours: number): string {
  if (hours >= 24) {
    const d = Math.floor(hours / 24);
    const rem = Math.round(hours - d * 24);
    return rem > 0 ? `${d}d ${rem}h` : `${d}d`;
  }
  return `${Math.max(1, Math.round(hours))}h`;
}
