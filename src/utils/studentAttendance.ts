// Deterministic per-student, per-subject session history generator.
// Prototype only: no backend, but stable across renders because every value is
// derived from a hash of (studentId, subjectCode, sessionIndex).

export type AttendanceStatus = "present" | "absent" | "late" | "excused";

export interface SessionRecord {
  date: string; // ISO yyyy-mm-dd
  subject: string;
  status: AttendanceStatus;
  type: "Lecture" | "Lab" | "Tutorial";
}

export type RangeKey = "month" | "semester";

const hash = (str: string) => {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
};

const SESSION_TYPES: SessionRecord["type"][] = ["Lecture", "Lab", "Tutorial"];

// Weeks of history per range. Two sessions per subject per week.
const RANGE_WEEKS: Record<RangeKey, number> = { month: 4, semester: 14 };
const SESSIONS_PER_WEEK = 2;

/**
 * Generates the session history for one student in one subject, ending today
 * and walking backwards week by week.
 */
export function generateSessions(
  studentId: string,
  subject: string,
  range: RangeKey,
  currentStatus?: AttendanceStatus
): SessionRecord[] {
  const weeks = RANGE_WEEKS[range];
  const total = weeks * SESSIONS_PER_WEEK;
  const seed = hash(`${studentId}|${subject}`);

  // Base reliability for this student in this subject: 55%-100%.
  const reliability = 55 + (seed % 46);

  const today = new Date();
  const sessions: SessionRecord[] = [];

  for (let i = 0; i < total; i++) {
    const date = new Date(today);
    // Two sessions a week: spaced 3 days apart.
    date.setDate(today.getDate() - (Math.floor(i / 2) * 7 + (i % 2) * 3));

    const roll = hash(`${studentId}|${subject}|${i}`) % 100;
    let status: AttendanceStatus;
    if (roll < reliability) status = "present";
    else if (roll < reliability + 12) status = "late";
    else if (roll < reliability + 20) status = "excused";
    else status = "absent";

    sessions.push({
      date: date.toISOString().slice(0, 10),
      subject,
      status,
      type: SESSION_TYPES[hash(`${subject}|${i}`) % SESSION_TYPES.length],
    });
  }

  // The most recent session mirrors the status shown in the matrix so the
  // drill-down never contradicts the summary table.
  if (currentStatus && sessions[0]) sessions[0] = { ...sessions[0], status: currentStatus };

  return sessions;
}

export interface SubjectBreakdown {
  subject: string;
  sessions: SessionRecord[];
  total: number;
  present: number;
  absent: number;
  late: number;
  excused: number;
  /** Present + late + excused counted as attended, rounded. */
  rate: number;
}

export function buildBreakdown(
  studentId: string,
  subjects: { code: string; currentStatus?: AttendanceStatus }[],
  range: RangeKey
): SubjectBreakdown[] {
  return subjects.map(({ code, currentStatus }) => {
    const sessions = generateSessions(studentId, code, range, currentStatus);
    const count = (s: AttendanceStatus) => sessions.filter((x) => x.status === s).length;
    const present = count("present");
    const late = count("late");
    const excused = count("excused");
    const absent = count("absent");
    const total = sessions.length;
    return {
      subject: code,
      sessions,
      total,
      present,
      absent,
      late,
      excused,
      rate: total ? Math.round(((present + late + excused) / total) * 100) : 0,
    };
  });
}

export const formatSessionDate = (iso: string) =>
  new Date(iso).toLocaleDateString(undefined, {
    weekday: "short",
    day: "2-digit",
    month: "short",
  });
