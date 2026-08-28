export type DeliveryType = "Lecture" | "Lab" | "Tutorial" | "Workshop" | "Online" | "Practical";
export type DeliveryMethod = "On-Campus" | "Online" | "Blended";
export type AttendanceMethod = "Instructor Marked" | "Student Self-Check" | "QR Code Scan" | "Biometric";

export interface ClassSession {
  id: string;
  day: number; // 0-4 for Mon-Fri
  startTime: string; // "09:00"
  endTime: string; // "11:00"
  instructor: string;
  
  // Delivery
  deliveryType: DeliveryType;
  deliveryMethod: DeliveryMethod;
  /** FK -> ROOMS.id. Campus / building / room / capacity are derived from this. */
  roomId?: string;
  onlineLink?: string;
  
  // Attendance
  trackAttendance: boolean;
  minAttendance?: number;
  attendanceMethod?: AttendanceMethod;
  sendReminder?: boolean;
  
  // Break
  breakStart?: string;
  breakDuration?: number;
}

export interface ClassSchedule {
  id: string;
  
  // Academic context
  subject: string; // e.g., "BIO101"
  title: string; // e.g., "Anatomy Basics"
  academicYear: string;
  studyPeriod: string;
  term?: string;
  courseId?: string;      // FK -> COURSES.id
  cohortIds: string[];    // FK[] -> COHORTS.id; [] = unassigned, never undefined
  
  // Schedule
  startDate: string;
  endDate: string;
  excludedDates?: Array<{ date: string; reason: string }>;
  customNotes?: string;
  sessions: ClassSession[];
  
  // Additional info
  description?: string;
  internalNotes?: string;
  attachments?: Array<{ name: string; url: string; size: number }>;
  
  // Display (for UI)
  color: string; // CSS classes for color coding
}
