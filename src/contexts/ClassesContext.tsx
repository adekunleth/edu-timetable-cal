import React, { createContext, useContext, useState, ReactNode } from "react";
import { ClassSchedule } from "@/types/classForm";

interface ClassesContextType {
  classes: ClassSchedule[];
  addClass: (classData: ClassSchedule) => void;
  updateClass: (id: string, classData: ClassSchedule) => void;
  deleteClass: (id: string) => void;
}

const ClassesContext = createContext<ClassesContextType | undefined>(undefined);

// Sample initial data
const initialClasses: ClassSchedule[] = [
  {
    id: "1",
    subject: "BIO101",
    title: "Anatomy Basics",
    academicYear: "2025",
    studyPeriod: "2025 Semester 1",
    courseId: "BSC-BIO",
    cohortIds: ["2025-S1-BIO"],
    startDate: "2025-03-10",
    endDate: "2025-06-13",
    sessions: [
      {
        id: "s1",
        day: 0,
        startTime: "09:00",
        endTime: "11:00",
        instructor: "Dr. Sarah Nguyen",
        deliveryType: "Lecture",
        deliveryMethod: "On-Campus",
        roomId: "RM-SYD-A201",
        trackAttendance: true,
        minAttendance: 80,
        attendanceMethod: "Instructor Marked",
      },
    ],
    color: "bg-lecture/10 border-lecture text-lecture",
  },
  {
    id: "2",
    subject: "CHEM202",
    title: "Organic Chemistry",
    academicYear: "2025",
    studyPeriod: "2025 Semester 1",
    courseId: "BSC-BIO",
    cohortIds: ["2025-S1-BIO", "2025-S2-BIO"],
    startDate: "2025-03-10",
    endDate: "2025-06-13",
    sessions: [
      {
        id: "s2",
        day: 0,
        startTime: "13:00",
        endTime: "15:00",
        instructor: "Prof. Michael Chen",
        deliveryType: "Lab",
        deliveryMethod: "On-Campus",
        roomId: "RM-SYD-C100",
        trackAttendance: true,
        minAttendance: 90,
        attendanceMethod: "QR Code Scan",
      },
    ],
    color: "bg-lab/10 border-lab text-lab",
  },
  {
    id: "3",
    subject: "MATH301",
    title: "Advanced Calculus",
    academicYear: "2025",
    studyPeriod: "2025 Semester 1",
    cohortIds: [],
    startDate: "2025-03-10",
    endDate: "2025-06-13",
    sessions: [
      {
        id: "s3",
        day: 1,
        startTime: "10:00",
        endTime: "11:00",
        instructor: "Dr. Emily Johnson",
        deliveryType: "Tutorial",
        deliveryMethod: "On-Campus",
        roomId: "RM-MEL-B150",
        trackAttendance: true,
        minAttendance: 75,
        attendanceMethod: "Instructor Marked",
      },
    ],
    color: "bg-tutorial/10 border-tutorial text-tutorial",
  },
  {
    id: "4",
    subject: "PHYS202",
    title: "Quantum Physics",
    academicYear: "2025",
    studyPeriod: "2025 Semester 1",
    courseId: "BIT-CS",
    cohortIds: ["INTL-A"],
    startDate: "2025-03-10",
    endDate: "2025-06-13",
    sessions: [
      {
        id: "s4",
        day: 2,
        startTime: "09:00",
        endTime: "11:00",
        instructor: "Dr. James Wilson",
        deliveryType: "Lecture",
        deliveryMethod: "On-Campus",
        roomId: "RM-BNE-A101",
        trackAttendance: true,
        minAttendance: 80,
        attendanceMethod: "Instructor Marked",
      },
    ],
    color: "bg-lecture/10 border-lecture text-lecture",
  },
  {
    id: "5",
    subject: "CS101",
    title: "Introduction to Programming",
    academicYear: "2025",
    studyPeriod: "2025 Semester 1",
    cohortIds: ["2024-S2-CS"],
    startDate: "2025-03-10",
    endDate: "2025-06-13",
    sessions: [
      {
        id: "s5",
        day: 3,
        startTime: "11:00",
        endTime: "13:00",
        instructor: "Dr. Maria Garcia",
        deliveryType: "Workshop",
        deliveryMethod: "On-Campus",
        roomId: "RM-PER-B250",
        trackAttendance: true,
        minAttendance: 85,
        attendanceMethod: "Student Self-Check",
      },
    ],
    color: "bg-workshop/10 border-workshop text-workshop",
  },
  {
    id: "6",
    subject: "ENG201",
    title: "Technical Writing",
    academicYear: "2025",
    studyPeriod: "2025 Semester 1",
    cohortIds: ["INTL-B", "2024-S2-CS"],
    startDate: "2025-03-10",
    endDate: "2025-06-13",
    sessions: [
      {
        id: "s6",
        day: 4,
        startTime: "09:00",
        endTime: "10:00",
        instructor: "Prof. Robert Taylor",
        deliveryType: "Online",
        deliveryMethod: "Online",
        onlineLink: "https://zoom.us/j/example",
        trackAttendance: false,
      },
    ],
    color: "bg-online/10 border-online text-online",
  },
];

export function ClassesProvider({ children }: { children: ReactNode }) {
  const [classes, setClasses] = useState<ClassSchedule[]>(initialClasses);

  const addClass = (classData: ClassSchedule) => {
    setClasses((prev) => [...prev, classData]);
  };

  const updateClass = (id: string, classData: ClassSchedule) => {
    setClasses((prev) =>
      prev.map((cls) => (cls.id === id ? classData : cls))
    );
  };

  const deleteClass = (id: string) => {
    setClasses((prev) => prev.filter((cls) => cls.id !== id));
  };

  return (
    <ClassesContext.Provider
      value={{ classes, addClass, updateClass, deleteClass }}
    >
      {children}
    </ClassesContext.Provider>
  );
}

export function useClasses() {
  const context = useContext(ClassesContext);
  if (context === undefined) {
    throw new Error("useClasses must be used within a ClassesProvider");
  }
  return context;
}
