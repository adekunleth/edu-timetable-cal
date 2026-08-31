import { createContext, useContext, useState, ReactNode } from "react";

interface AttendanceSettingsContextType {
  /** Hours after a class ends during which attendance may still be marked. */
  windowHours: number;
  setWindowHours: (hours: number) => void;
}

const AttendanceSettingsContext = createContext<
  AttendanceSettingsContextType | undefined
>(undefined);

export function AttendanceSettingsProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [windowHours, setWindowHoursState] = useState(48);

  const setWindowHours = (hours: number) => {
    setWindowHoursState(Math.max(1, Math.floor(hours) || 48));
  };

  return (
    <AttendanceSettingsContext.Provider value={{ windowHours, setWindowHours }}>
      {children}
    </AttendanceSettingsContext.Provider>
  );
}

export function useAttendanceSettings() {
  const context = useContext(AttendanceSettingsContext);
  if (!context) {
    throw new Error(
      "useAttendanceSettings must be used within an AttendanceSettingsProvider"
    );
  }
  return context;
}
