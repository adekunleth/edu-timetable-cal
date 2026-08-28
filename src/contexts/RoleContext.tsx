import { createContext, useContext, useMemo, useState, ReactNode } from "react";

export type Role = "admin" | "teacher" | "student";

export const ROLE_LABELS: Record<Role, string> = {
  admin: "Administrator",
  teacher: "Teacher",
  student: "Student",
};

/**
 * Prototype identity. In a real system this comes from the authenticated
 * session; here it lets us scope student views to a single person so that a
 * student never sees another student's attendance data.
 */
export const CURRENT_STUDENT = {
  name: "Alice Johnson",
  id: "S2024001",
};

export const CURRENT_INSTRUCTOR = {
  name: "Dr. Nguyen",
};

interface RoleContextValue {
  role: Role;
  setRole: (role: Role) => void;
  isStudent: boolean;
  isAdmin: boolean;
  isTeacher: boolean;
}

const RoleContext = createContext<RoleContextValue | undefined>(undefined);

export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<Role>("admin");

  const value = useMemo(
    () => ({
      role,
      setRole,
      isStudent: role === "student",
      isAdmin: role === "admin",
      isTeacher: role === "teacher",
    }),
    [role]
  );

  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>;
}

export function useRole() {
  const ctx = useContext(RoleContext);
  if (!ctx) throw new Error("useRole must be used within a RoleProvider");
  return ctx;
}
